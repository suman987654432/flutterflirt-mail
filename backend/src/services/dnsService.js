import dns from 'dns/promises';
import { config } from '../config.js';

export class DnsService {
  /**
   * Generates required DNS records list for a domain
   */
  static getRequiredRecords(domain, dkimSelector, dkimPublicKey, dmarcPolicy = 'none') {
    const platform = config.platformDomain;
    return [
      {
        type: 'MX',
        host: '@',
        value: `10 ${platform}`,
        description: 'Receives inbound email for this domain',
      },
      {
        type: 'TXT',
        host: '@',
        value: `v=spf1 include:spf.brevo.com ip4:${config.serverIp || '13.207.129.73'} ~all`,
        description: 'Authorizes mail servers to send emails for this domain',
      },
      {
        type: 'TXT',
        host: `${dkimSelector}._domainkey`,
        value: `v=DKIM1; k=rsa; p=${dkimPublicKey}`,
        description: 'Cryptographic public key to verify outgoing email authenticity',
      },
      {
        type: 'TXT',
        host: '_dmarc',
        value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${config.dmarcEmail}; adkim=s; aspf=s`,
        description: 'DMARC alignment policy and aggregate reporting endpoint',
      },
      {
        type: 'CNAME',
        host: 'autoconfig',
        value: platform,
        description: 'Email client auto-discovery configuration',
      },
      {
        type: 'SRV',
        host: '_imaps._tcp',
        value: `0 1 993 ${platform}`,
        description: 'Secure IMAP auto-discovery',
      },
      {
        type: 'SRV',
        host: '_submission._tcp',
        value: `0 1 587 ${platform}`,
        description: 'Secure SMTP Submission auto-discovery',
      },
    ];
  }

  /**
   * Verifies live DNS health of a domain
   */
  static async verifyDomain(domain, dkimSelector) {
    const status = {
      mx: false,
      spf: false,
      dkim: false,
      dmarc: false,
      details: {},
    };

    const platform = config.platformDomain;

    // 1. Verify MX
    try {
      const mxRecords = await dns.resolveMx(domain);
      status.details.mx = mxRecords;
      const cleanPlatform = platform.toLowerCase().replace(/\.$/, '');
      const domLower = domain.toLowerCase();
      status.mx = mxRecords.some(r => {
        const ex = (r.exchange || '').toLowerCase().replace(/\.$/, '');
        return (
          ex === cleanPlatform ||
          ex === `mail.${domLower}` ||
          ex.endsWith(`.${domLower}`) ||
          ex.includes('flutterflirt') ||
          ex.includes('codeaddabot')
        );
      });
    } catch (err) {
      status.details.mxError = err.code || err.message;
    }

    // 2. Verify SPF (TXT on root)
    try {
      const txtRecords = await dns.resolveTxt(domain);
      const flattenedTxt = txtRecords.map(r => r.join(''));
      status.details.txt = flattenedTxt;
      status.spf = flattenedTxt.some(txt => 
        txt.includes('v=spf1') && (
          txt.includes('spf.brevo.com') ||
          txt.includes('sendinblue.com') ||
          txt.includes('amazonses.com') ||
          txt.includes('flutterflirt') || 
          txt.includes('codeaddabot') || 
          txt.includes('_spf.') ||
          txt.includes('ip4:')
        )
      );
    } catch (err) {
      status.details.spfError = err.code || err.message;
    }

    // 3. Verify DKIM
    try {
      const dkimHost = `${dkimSelector}._domainkey.${domain}`;
      const dkimRecords = await dns.resolveTxt(dkimHost);
      const flattenedDkim = dkimRecords.map(r => r.join(''));
      status.details.dkim = flattenedDkim;
      status.dkim = flattenedDkim.some(txt => txt.includes('v=DKIM1') && txt.includes('p='));
    } catch (err) {
      status.details.dkimError = err.code || err.message;
    }

    // 4. Verify DMARC
    try {
      const dmarcHost = `_dmarc.${domain}`;
      const dmarcRecords = await dns.resolveTxt(dmarcHost);
      const flattenedDmarc = dmarcRecords.map(r => r.join(''));
      status.details.dmarc = flattenedDmarc;
      status.dmarc = flattenedDmarc.some(txt => txt.includes('v=DMARC1'));
    } catch (err) {
      status.details.dmarcError = err.code || err.message;
    }

    return status;
  }
}

