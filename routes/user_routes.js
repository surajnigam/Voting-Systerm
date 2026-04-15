import express from 'express';
import users from './../models/users.js';
import { jwtAuthmiddleware, generateToken } from '../jwt.js';

const usersRoutes = express.Router();

usersRoutes.post('/signup', async (req, res)=>{
    try {
        const data = { ...req.body };

        const newUser = new users(data);
        const response = await newUser.save();
        console.log('user created successfully');

        const payload = {
            id: response.id,
            role: response.role,
        };

        const token = generateToken(payload);
        res.status(200).json({ response, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message,
            message: 'Failed to create users'
        });
    }
});

// usersRoutes.post('/signup', handleusersSignup);

// Login / profile: username + password in query or body. Wrong password → 401 (never list all users).
usersRoutes.post('/login',  async (req, res)=> {
    try {
        const adharnumber = req.query.adhar_number ?? req.body?.adhar_number;//adharnumber from query(link) or body
        const password = req.query.password ?? req.body?.password;

        if (!adharnumber || !password) {
            return res.status(400).json({
                message: 'adharnumber and password are required (query or body)'
            });
        }
        const user = await users.findOne({ adhar_number: adharnumber });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const payload = {
            id: user.id,
            role: user.role,
        };

        const token = generateToken(payload);
        res.status(200).json({token});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
});


usersRoutes.get('/profile/:role', jwtAuthmiddleware, async (req, res) => {
    try {
        const role = req.params.role;

        const votersCollection = await users.find({ role: role });

        res.status(200).json(votersCollection);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message,
            message: 'Internal server error'
        });
    }
});


usersRoutes.get('/users', jwtAuthmiddleware, async (req, res) => {
    try {
        const response = await users.find();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
});


//  PUT is used to update a users by id
usersRoutes.put('/profile/password', jwtAuthmiddleware, async (req, res) => {
    try {
        const userId = req.user;
        const {currentPassword, newPassword} = req.body;
        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({message: 'Invalid current password'});
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({message: 'Password updated successfully'});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message, message: 'Internal server error'});
    }
});


export default usersRoutes;