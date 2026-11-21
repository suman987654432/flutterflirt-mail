import { config } from '../config.js';

export class BrevoService {
  static getApiKey() {
    return process.env.BREVO_API_KEY || config.brevoApiKey || null;
  }

  static getHeaders() {
    const key = this.getApiKey();
    return {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': key || '',
    };
  }

  /**
   * Registers a domain with Brevo via REST API
   * POST https://api.brevo.com/v3/senders/domains
   */
  static async registerDomain(domainName) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('[BrevoService] Notice: BREVO_API_KEY is not set. Skipping automatic Brevo registration.');
      return null;
    }

    const cleanDomain = domainName.toLowerCase().trim();
    try {
      console.log(`[BrevoService] Registering domain "${cleanDomain}" in Brevo...`);
      const res = await fetch('https://api.brevo.com/v3/senders/domains', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name: cleanDomain }),
      });

      const data = await res.json();
      if (!res.ok) {
        // If domain already exists in Brevo, fetch its details instead of failing
        if (data.code === 'duplicate_parameter' || (data.message && data.message.includes('already exists'))) {
          console.log(`[BrevoService] Domain "${cleanDomain}" already exists in Brevo. Fetching details...`);
          return await this.getDomain(cleanDomain);
        }
        console.error('[BrevoService] Failed to register domain:', data);
        return null;
      }

      console.log(`[BrevoService] Domain "${cleanDomain}" successfully created in Brevo with ID: ${data.id}`);
      // Fetch full DNS records details for the newly created domain
      return await this.getDomain(cleanDomain);
    } catch (err) {
      console.error('[BrevoService] Registration request failed:', err.message);
      return null;
    }
  }

  /**
   * Gets configuration, DNS records, and verification status of a domain
   * GET https://api.brevo.com/v3/senders/domains/{domainName}
   */
  static async getDomain(domainName) {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const cleanDomain = domainName.toLowerCase().trim();
    try {
      const res = await fetch(`https://api.brevo.com/v3/senders/domains/${cleanDomain}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        return null;
      }

      return await res.json();
    } catch (err) {
      console.error(`[BrevoService] Failed to fetch domain "${cleanDomain}":`, err.message);
      return null;
    }
  }

  /**
   * Triggers Brevo to re-authenticate / verify the domain DNS records
   * PUT https://api.brevo.com/v3/senders/domains/{domainName}/authenticate
   */
  static async authenticateDomain(domainName) {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const cleanDomain = domainName.toLowerCase().trim();
    try {
      const res = await fetch(`https://api.brevo.com/v3/senders/domains/${cleanDomain}/authenticate`, {
        method: 'PUT',
        headers: this.getHeaders(),
      });

      if (!res.ok) {
        return await this.getDomain(cleanDomain);
      }

      return await res.json();
    } catch (err) {
      console.error(`[BrevoService] Authenticate call failed for "${cleanDomain}":`, err.message);
      return null;
    }
  }

  /**
   * Deletes a domain from Brevo
   * DELETE https://api.brevo.com/v3/senders/domains/{domainName}
   */
  static async deleteDomain(domainName) {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const cleanDomain = domainName.toLowerCase().trim();
    try {
      const res = await fetch(`https://api.brevo.com/v3/senders/domains/${cleanDomain}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch (err) {
      console.error(`[BrevoService] Delete domain failed for "${cleanDomain}":`, err.message);
      return false;
    }
  }
}
