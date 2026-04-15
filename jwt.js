import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

//middleware to authenticate the user by verifying the token
const jwtAuthmiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token not found' });
    }

    // safer extraction of token from authorization header (Bearer <token>) 
    const parts = authHeader.split(' ');
    const token = parts.length === 2 ? parts[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Tokens are signed as { user: payload }, so expose payload directly.
        req.user = decoded.user ?? decoded;
        next();
    } catch (err) {
        if (err?.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const generateToken = (payload) => {
    // Number = seconds (jsonwebtoken). Avoid '1200' string — ms() treats it as ~1.2 seconds.
    return jwt.sign({ user: payload }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
};

export { jwtAuthmiddleware, generateToken };