import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const { token } = req.headers;
    console.log(token);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not Authorized. Login Again.' });
    }
  
    try {
      const token_decode = jwt.verify(token, process.env.JWT_SECRET);
      req.body.userId = token_decode.id; // Add the user ID to the request body
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
  };
  
  

export default authUser;