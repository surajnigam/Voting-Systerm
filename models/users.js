import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        email: { type: String },
        mobile: { type: String, required: true },
        address: { type: String, required: true },
        adhar_number: { type: Number, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, enum: ['admin', 'voter'], default: 'voter' },
        isVoted: { type: Boolean, default: false },
    },
    { collection: 'users' }//for creating new table in the database (instead of adding into default collection)
);

// bcrypt password — async hooks must not use `next()` (Mongoose 7+); return / throw instead.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    try {
        //bcrypt compare the candidate password with the password in the database in hash format
        //work add the salt to the entered password and generate hash, and compare it with the stored hash
        const isMatch = await bcrypt.compare(enteredPassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }
};

//  Correct model name (NO dots)
const person = mongoose.model('person', userSchema);

export default person;