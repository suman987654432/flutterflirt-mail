import express from 'express';
import { config } from '../config.js';

const router = express.Router();

/**
 * Mozilla Thunderbird / Mail Client Autoconfig XML
 */
router.get('/mail/config-v1.1.xml', (req, res) => {
  const email = req.query.emailaddress || '';
  const domain = email.includes('@') ? email.split('@')[1] : config.platformDomain;

  res.set('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<clientConfig version="1.1">
  <emailProvider id="${domain}">
    <domain>${domain}</domain>
    <displayName>FlutterFlirt Mail</displayName>
    <displayShortName>FFMail</displayShortName>
    <incomingServer type="imap">
      <hostname>${config.platformDomain}</hostname>
      <port>993</port>
      <socketType>SSL</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
    </incomingServer>
    <outgoingServer type="smtp">
      <hostname>${config.platformDomain}</hostname>
      <port>587</port>
      <socketType>STARTTLS</socketType>
      <authentication>password-cleartext</authentication>
      <username>%EMAILADDRESS%</username>
    </outgoingServer>
  </emailProvider>
</clientConfig>`);
});

export default router;

