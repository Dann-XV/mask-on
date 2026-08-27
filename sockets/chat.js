const { Server } = require("socket.io");

module.exports = function initChat(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500"] }
  });

  io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    // Upon connection - only to user 
    socket.emit('message', "Welcome to Chat App!")

    // Upon connection - to all others 
    socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)}} connected`)

    // Listening for a message event 
    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
    })

    // When user disconnects - to all others 
    socket.on('disconnect', () => {
        socket.broadcast.emit('message', `User ${socket.id.substring(0, 5)}} disconnected`)
    })

    // Listen for activity 
    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name)
    })
  })

  return io;
};
    
