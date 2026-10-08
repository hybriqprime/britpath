import { logActivity } from './../models/ActivityLog.js';

// Runs when the response finishes, by which time the route's own auth has set req.user.

// Every successful signed document link: who opened which file
export const auditDocumentAccess = (req, res, next) => {
  res.on('finish', () => {
    if (req.method === 'GET' && res.statusCode === 200 && req.user) {
      logActivity(req, 'document_view', {
        target: `${req.params.id || 'own'}/${req.params.docId}`,
      });
    }
  });
  next();
};

// Every successful change made by a signed-in user
export const auditWrites = (req, res, next) => {
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (req.user && res.statusCode < 400) {
        logActivity(req, req.user.role === 'admin' ? 'admin_action' : 'client_action', {
          target: `${req.method} ${req.originalUrl.split('?')[0]}`,
        });
      }
    });
  }
  next();
};