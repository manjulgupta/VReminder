// ~~ gatekeeper 

const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: 'missing authorization header' });
  }

  const token = header.split(' ')[1]; // Bearer <token>

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // adminId, hospitalId, role
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
};
