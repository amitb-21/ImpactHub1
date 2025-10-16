import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
	googleId: { type: String, index: true },
	name: String,
	email: { type: String, unique: true, sparse: true },
	points: { type: Number, default: 0 },
});

userSchema.methods.generateJWT = function () {
	const payload = { id: this._id, email: this.email };
	return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
