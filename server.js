const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const usersRoutes = require('./routes/users');
const api = process.env.API_URL || "/api/v1";
const initChat = require('./sockets/chat');
const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})
const io = initChat(expressServer);
const morgan = require("morgan");


// middlewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));

app.use(`${api}/users`, usersRoutes);


// Db connection
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });









