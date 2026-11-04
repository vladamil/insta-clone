import jwt from 'jsonwebtoken';

// Guards a route: checks the "Authorization: Bearer <token>" header and puts
// the logged-in user's id on req.user. Routes after it can trust req.user.id.
const requireAuth = (req, res, next) => {
   const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
   }

   const token = authHeader.split(' ')[1];

   let decoded;

   try {
      // Only accept tokens signed the way we sign them (HS256)
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
         algorithms: ['HS256'],
      });
   } catch (err) {
      if (err.name === 'TokenExpiredError') {
         return res
            .status(401)
            .json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid token' });
   }

   // Keep only the id
   req.user = { id: decoded.id };
   next();
};

export default requireAuth;
