import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
    {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    party: { type: String },
    votes: [{
        voter: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        votedAt: { type: Date, default: Date.now() }
    }],
    votesCount: { type: Number, default: 0 },
    image: { type: String }
    },
    {collection: 'candidates'}
);

const Candidate = mongoose.models.candidate || mongoose.model('candidate', candidateSchema);

export default Candidate;