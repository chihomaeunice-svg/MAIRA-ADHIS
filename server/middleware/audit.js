const { getDb } = require('../firebase');

const auditLog = async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // Log audit trail for mutating operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      try {
        const db = getDb();
        if (db) {
          db.collection('auditLogs').add({
            userId: req.user?.uid || 'anonymous',
            userEmail: req.user?.email || 'unknown',
            action: req.method,
            resource: req.path,
            timestamp: new Date(),
            statusCode: res.statusCode,
            ipAddress: req.ip,
          }).catch(err => console.error('Audit log error:', err));
        }
      } catch (err) {
        console.error('Audit middleware error:', err);
      }
    }
    return originalJson(data);
  };

  next();
};

module.exports = { auditLog };
