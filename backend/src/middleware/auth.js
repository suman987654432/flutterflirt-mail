import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const requireSuperadmin = (req, res, next) => {
  if (
    req.user?.role === 'superadmin' ||
    (req.user?.email && req.user.email.startsWith('admin@'))
  ) {
    return next();
  }
  return res.status(403).json({ error: 'Requires FlutterFlirt superadmin privileges' });
};

export const requireAdmin = (req, res, next) => {
  if (
    req.user?.role === 'superadmin' ||
    req.user?.role === 'tenant_admin' ||
    (req.user?.email && req.user.email.startsWith('admin@'))
  ) {
    return next();
  }
  return res.status(403).json({ error: 'Requires administrative privileges' });
};

export const requireMailbox = (req, res, next) => {
  if (req.user?.type !== 'mailbox' && req.user?.role !== 'superadmin' && req.user?.role !== 'tenant_admin') {
    return res.status(403).json({ error: 'Requires mailbox authentication' });
  }
  next();
};

