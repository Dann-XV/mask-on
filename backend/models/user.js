const mongoose = require('mongoose');

// Schema for User model
const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true},
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;