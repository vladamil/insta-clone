import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Guards a route: checks the "Authorization: Bearer <token>" header and puts
// the logged-in user's id on req.user. Routes after it can trust req.user.id.
const requireAuth = async (req, res, next) => {
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

   // A valid token can still belong to a deleted account, we prevent it
   const userExists = await User.exists({ _id: decoded.id });
   if (!userExists) {
      return res.status(401).json({ error: 'Account no longer exists' });
   }

   // Keep only the id
   req.user = { id: decoded.id };
   next();
};

export default requireAuth;
