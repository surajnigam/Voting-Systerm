import express from 'express';
import candidate from '../models/candidate.js';
import { jwtAuthmiddleware } from './../jwt.js';
import User from './../models/users.js';
import multer from 'multer';
const candidateRouts = express.Router();
async function checkAdmin(userId) {
    try {
        const foundUser = await User.findById(userId);
        if (!foundUser) {
            return false;
        }
        return foundUser.role === 'admin';
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function checkVoter(userId) {
    try {
        const foundUser = await User.findById(userId);
        if (!foundUser) {
            return false;
        }
        return foundUser.role === 'voter';
    } catch (error) {
        console.log(error);
        return false;
    }
}
// multer storage configuration for storing the image in the uploads folder at local storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     }
// });
// const upload = multer({ dest: 'uploads/' });

// multer storage configuration for storing the image in the cloud storage
const storage = multer.memoryStorage();
const upload = multer({storage});


// image upload feature also add in it
async function addCandidate(req, res, adminId) {
    try {
        const isAdmin = await checkAdmin(adminId);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admin can add candidate' });
        }
        const image = req.file ? req.file.buffer.toString('base64') : null;
        const payload = {
            ...req.body
        };
        if (image) {
            payload.image = image;
        }
        const response = await candidate.create(payload);
        return res.status(201).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message,
            message: 'Failed to create candidate'
        });
    }
}

// Preferred route: uses JWT token user id
candidateRouts.post('/', jwtAuthmiddleware, upload.single('image'), async (req, res) => {
    // get the admin id from the JWT token
    const adminId = req.user?.id;
    return addCandidate(req, res, adminId);
});


candidateRouts.get('/getAllCandidates', jwtAuthmiddleware, async (req, res) => {
    try {
        const response = await candidate.find();
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
});

candidateRouts.get('/getCandidate/:id', jwtAuthmiddleware, async (req, res) => {
    try {
        const candidateId = req.params.id;
        const response = await candidate.findById(candidateId);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
});

candidateRouts.put('/updateCandidate/:id', jwtAuthmiddleware, async (req, res) => {
    try {
        const candidateId = req.params.id;
        const isAdmin = await checkAdmin(req.user?.id);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admin can update candidate' });
        }
        const response = await candidate.findByIdAndUpdate(candidateId, req.body, { new: true });
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
});

candidateRouts.delete('/deleteCandidate/:id', jwtAuthmiddleware, async (req, res) => {
    try {
        const candidateId = req.params.id;
        const isAdmin = await checkAdmin(req.user?.id);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admin can delete candidate' });
        }
        const response = await candidate.findByIdAndDelete(candidateId);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
});

candidateRouts.post('/vote/:id', jwtAuthmiddleware, async (req, res) => {
    try {
        const candidateId = req.params.id;
        const voterId = req.user?.id;
        const isVoter = await checkVoter(voterId);
        if (!isVoter) {
            return res.status(403).json({ message: 'admin cannot vote' });
        }
        const foundVoter = await User.findById(voterId);
        if (!foundVoter) {
            return res.status(404).json({ message: 'Voter not found' });
        }
        // Enforce one vote per user across all candidates and sessions.
        if (foundVoter.isVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }
        const alreadyVotedInElection = await candidate.exists({ 'votes.voter': voterId });
        if (alreadyVotedInElection) {
            // Keep user flag in sync for old data where flag was not updated.
            foundVoter.isVoted = true;
            await foundVoter.save();
            return res.status(400).json({ message: 'You have already voted' });
        }
        const foundCandidate = await candidate.findById(candidateId);
        if (!foundCandidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        foundCandidate.votes.push({ voter: voterId, votedAt: new Date() });
        // Keep counter in sync with actual votes array.
        foundCandidate.votesCount = foundCandidate.votes.length;
        await foundCandidate.save();
        foundVoter.isVoted = true;
        await foundVoter.save();
        res.status(200).json({ message: 'Vote submitted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
});

candidateRouts.get('/getVotes',  async (req, res) => {
    try {
       
        const response = await candidate.find().sort({ votesCount: 'desc' });
       const recodedResponse = response.map(candidate => ({
        name: candidate.name,
        party: candidate.party,
        votesCount: candidate.votesCount ?? candidate.votes?.length ?? 0
       }));
        res.status(200).json(recodedResponse);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
});
export default candidateRouts;