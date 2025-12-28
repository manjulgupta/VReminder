// ~~ gatekeeper 

const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  // req - Request object (contains headers, body, params)
  // res - Response object (to send errors if auth fails)
  // next - Critical! Function to call when this middleware is done
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: 'missing authorization header' });
  }

  const token = header.split(' ')[1]; // since the format is(Industry standard): Bearer <token>

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Splits token into HEADER.PAYLOAD.SIGNATURE
    // Recalculates signature using HEADER + PAYLOAD + JWT_SECRET
    // Compares recalculated signature with token's signature
    // Checks expiration time
    // If all valid → returns decoded payload
    // If anything fails → throws error

    req.user = decoded; // adminId, hospitalId, role
    // By attaching data to req, you make it available to all subsequent middleware and route handlers!!!
    next(); //THE MANDATORY NEXT()
  } 
  catch (err) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
};

//FLOW
// // 1. Request comes in
// router.post('/patients', auth, async (req, res) => {
//   // 2. auth middleware runs first
//   //    - Verifies token
//   //    - Sets req.user = { adminId: 1, hospitalId: 1, role: 'admin' }
//   //    - Calls next()
//   // 3. This function runs
//   const hospitalId = req.user.hospitalId; // Available here!
// });

// // Without this pattern:
// javascript// You'd have to verify token in EVERY route handler!
// router.post('/patients', async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const hospitalId = decoded.hospitalId;
//   // ... actual logic
// });
// router.get('/patients', async (req, res) => {
//   // Copy-paste the same verification code! 😱
// });

// // Routes vs Middleware:
// Feature       Routes:                 Middleware:
// Export        router                  objectFunction
// Purpose       Define endpoints        Reusable checks/modifications
// Parameters    (req, res)              (req, res, next)
// Must call next()?No, sends response   Yes, unless sending error
// Usage         app.use('/api', router) router.get('/', middleware, handler)
// Example       Handle GET /users       Verify authentication