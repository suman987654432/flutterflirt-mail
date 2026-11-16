import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

export class DkimService {
  static generateKeys(domain, selector = config.dkim.defaultSelector) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Format public key for DNS TXT record (strip headers and newlines)
    const cleanPublic = publicKey
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\r?\n|\r/g, '')
      .trim();

    // Ensure storage directory exists
    try {
      if (!fs.existsSync(config.dkim.storagePath)) {
        fs.mkdirSync(config.dkim.storagePath, { recursive: true });
      }
      const keyFile = path.join(config.dkim.storagePath, `${domain}.${selector}.key`);
      fs.writeFileSync(keyFile, privateKey, { mode: 0o600 });
    } catch (err) {
      console.warn(`[DKIM] Notice: Could not save private key to disk at ${config.dkim.storagePath}:`, err.message);
    }

    return {
      selector,
      publicKey: cleanPublic,
      privateKey,
    };
  }

  static getDnsRecord(selector, publicKey) {
    return {
      type: 'TXT',
      host: `${selector}._domainkey`,
      value: `v=DKIM1; k=rsa; p=${publicKey}`,
    };
  }
}

