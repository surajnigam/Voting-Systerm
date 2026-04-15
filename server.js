// import app from './app.js';
import './db.js';
import { jwtAuthmiddleware } from './jwt.js';
import userRouts from './routes/user_routes.js';
import candidateRouts from './routes/candidate_routes.js';
import express from 'express';
import dotenv from 'dotenv';
import { configurePassport } from './auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.get('/', (_req, res) => {
    res.redirect('/login.html');
});
app.use(express.static(path.join(__dirname, 'public')));
configurePassport(app);

// middleware to log the request, end point of api at what time it is called
const logEndpoit = (req, res, next) => {
    console.log(`${req.method}  ${req.url}  ${new Date().toISOString()}`);
    next();
};
app.use(logEndpoit);



    
app.use('/users', userRouts);
app.use('/candidates', candidateRouts);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});

// comment here for testing git
