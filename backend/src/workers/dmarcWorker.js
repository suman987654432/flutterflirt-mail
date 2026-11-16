import zlib from 'zlib';
import AdmZip from 'adm-zip';
import xml2js from 'xml2js';
import { query } from '../db.js';
import { ImapService } from '../services/imapService.js';
import { config } from '../config.js';

export class DmarcWorker {
  static isRunning = false;

  static async parseXmlContent(xmlString) {
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlString);
    const feedback = result.feedback;
    if (!feedback) return null;

    const metadata = feedback.report_metadata;
    const policy = feedback.policy_published;
    const records = Array.isArray(feedback.record) ? feedback.record : [feedback.record];

    let totalMsgs = 0;
    let failedMsgs = 0;
    const parsedRecords = [];

    for (const rec of records) {
      if (!rec) continue;
      const count = parseInt(rec.row?.count || '1', 10);
      const ip = rec.row?.source_ip;
      const disposition = rec.row?.policy_evaluated?.disposition || 'none';
      const dkimResult = rec.row?.policy_evaluated?.dkim || 'fail';
      const spfResult = rec.row?.policy_evaluated?.spf || 'fail';

      const passed = dkimResult === 'pass' || spfResult === 'pass';
      totalMsgs += count;
      if (!passed) {
        failedMsgs += count;
      }

      parsedRecords.push({
        ip,
        count,
        disposition,
        dkim: dkimResult,
        spf: spfResult,
        passed,
      });
    }

    return {
      orgName: metadata?.org_name || 'Unknown',
      reportId: metadata?.report_id || `dmarc-${Date.now()}`,
      dateBegin: new Date(parseInt(metadata?.date_range?.begin || '0', 10) * 1000),
      dateEnd: new Date(parseInt(metadata?.date_range?.end || '0', 10) * 1000),
      domain: policy?.domain,
      totalMsgs,
      failedMsgs,
      records: parsedRecords,
    };
  }

  static async processReports() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const email = config.dmarcEmail;
      const client = ImapService.getClient(email);
      await client.connect();

      try {
        const lock = await client.getMailboxLock('INBOX');
        try {
          const mailbox = client.mailbox;
          if (mailbox.exists === 0) return;

          for await (const msg of client.fetch('1:*', {
            uid: true,
            envelope: true,
            bodyStructure: true,
          })) {
            try {
              const fullMsg = await ImapService.getMessage(email, 'INBOX', msg.uid);
              for (const att of fullMsg.attachments) {
                let xmlContent = null;
                const buffer = Buffer.from(att.dataUrl.split(',')[1], 'base64');

                if (att.filename.endsWith('.zip')) {
                  const zip = new AdmZip(buffer);
                  const zipEntries = zip.getEntries();
                  for (const entry of zipEntries) {
                    if (entry.entryName.endsWith('.xml')) {
                      xmlContent = entry.getData().toString('utf8');
                      break;
                    }
                  }
                } else if (att.filename.endsWith('.gz')) {
                  xmlContent = zlib.gunzipSync(buffer).toString('utf8');
                } else if (att.filename.endsWith('.xml')) {
                  xmlContent = buffer.toString('utf8');
                }

                if (xmlContent) {
                  const report = await this.parseXmlContent(xmlContent);
                  if (report && report.domain) {
                    // Match domain in db
                    const domRes = await query('SELECT id FROM domains WHERE name = $1', [report.domain]);
                    if (domRes.rows.length > 0) {
                      const domainId = domRes.rows[0].id;
                      await query(
                        `INSERT INTO dmarc_reports (domain_id, org_name, report_id, date_begin, date_end, records, total_msgs, failed_msgs)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                          domainId,
                          report.orgName,
                          report.reportId,
                          report.dateBegin,
                          report.dateEnd,
                          JSON.stringify(report.records),
                          report.totalMsgs,
                          report.failedMsgs,
                        ]
                      );
                      console.log(`[DMARC Worker] Ingested report for domain ${report.domain} from ${report.orgName}`);
                    }
                  }
                }
              }

              // Move message to Processed folder
              await client.messageMove({ uid: String(msg.uid) }, 'Processed', { uid: true }).catch(() => {});
            } catch (err) {
              console.warn(`[DMARC Worker] Error processing report msg UID ${msg.uid}:`, err.message);
            }
          }
        } finally {
          lock.release();
        }
      } finally {
        await client.logout().catch(() => {});
      }
    } catch (err) {
      // Dovecot or mailbox might be offline in development; log warning
      // console.warn('[DMARC Worker] Check cycle skipped:', err.message);
    } finally {
      this.isRunning = false;
    }
  }

  static start(intervalMinutes = 10) {
    console.log(`[DMARC Worker] Initialized. Scanning ${config.dmarcEmail} every ${intervalMinutes} minutes.`);
    // Run initial check after 10 seconds, then recurring
    setTimeout(() => this.processReports(), 10000);
    setInterval(() => this.processReports(), intervalMinutes * 60 * 1000);
  }
}

