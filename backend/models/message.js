const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  type: { type: String, enum: ['text','system'], default: 'text' },
  status: { type: String, enum: ['sent','delivered','read'], default: 'sent' }
}, { timestamps: true });

// fast history lookup for a private conversation (newest first)
messageSchema.index({ conversationId: 1, createdAt: -1 });

// TTL: remove messages 5 minutes (300 seconds) after `createdAt`
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

exports.Message = mongoose.model('Message', messageSchema);
exports.messageSchema = messageSchema;