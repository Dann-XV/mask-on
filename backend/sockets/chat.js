const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const cookie = require("cookie");
const { Message } = require('../models/message');
const { User } = require('../models/user');



function parseCookies(header) {
  if (!header) return {};
  if (cookie && typeof cookie.parse === 'function') return cookie.parse(header);
  if (cookie && typeof cookie.parseCookie === 'function') return cookie.parseCookie(header);
  return header.split(';').map(s => s.trim()).filter(Boolean).reduce((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
}

module.exports = function initChat(httpServer) {
  const io = new Server(httpServer);

  // Authentication for handshake
  io.use((socket, next) => {
    const handshake = socket.handshake;
    const cookies = parseCookies(handshake.headers.cookie);
    const token =
      (handshake.auth && handshake.auth.token) ||
      cookies.token ||
      (handshake.headers.authorization && handshake.headers.authorization.split(' ')[1]);

    if (!token) return next(new Error('unauthorized'));

    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) return next(new Error('unauthorized'));
      socket.user = payload; // { userId, username, iat, exp }
      return next();
    });
  });

  io.on('connection', socket => {
    const userId = socket.user.userId.toString();

    // Put every connected user in their own user-ID room.
    socket.join(userId);

    // private direct messaging
    socket.on('private_message', async ({ toUserId, content }) => {
        try {
            const fromUserId = socket.user?.userId;
            if (!fromUserId) return socket.emit('private_message_error', { error: 'Unauthenticated' });

            if (!toUserId || !content || typeof content !== 'string') {
            return socket.emit('private_message_error', { error: 'Invalid payload' });
            }

            const sender = await User.findById(fromUserId).select('contacts').lean();
            if (!sender) return socket.emit('private_message_error', { error: 'Sender not found' });

            const isContact = (sender.contacts || []).some(c => c.equals(toUserId));
            if (!isContact) return socket.emit('private_message_error', { error: 'Recipient not in contacts' });

            const conversationId = [fromUserId.toString(), toUserId.toString()].sort().join('_');

            const msg = await Message.create({
              conversationId,
              sender: fromUserId,
              receiver: toUserId,
              content: content.trim().slice(0, 5000) // enforce maxlength
            });

            const payload = {
              id: msg._id,
              conversationId,
              fromUserId,
              toUserId,
              content: msg.content,
              createdAt: msg.createdAt,
              status: msg.status
            };

            // deliver to recipient (joined by userId) and echo to sender
            io.to(toUserId.toString()).emit('private_message', payload);
            socket.emit('private_message', payload);
        } catch (err) {
            socket.emit('private_message_error', { error: err.message || 'Server error' });
        }
    });

    console.log(`User ${socket.user.username} connected`);

    // Listen for activity 
    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name)
    })
  })

  return io;
};
    
