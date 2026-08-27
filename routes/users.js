const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;



function generateUsername() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < 10; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return username;
}

function authenticateToken(req, res, next) {
  const header = req.headers['authorization'];
  const headerToken = header && header.split(' ')[1];
  const token = req.cookies?.token || headerToken;
  if (!token) return res.status(401).json({ error: "Missing token" });
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = payload;
    next();
  });
}

// User Authentication routes

// sign up route
router.post("/register", async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Generate unique username
    let username;
    let userExists = true;
    while (userExists) {
      username = generateUsername();
      const existing = await User.findOne({ username });
      if (!existing) {
        userExists = false;
      }
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({ username, passwordHash });
    await user.save();

    res.json({ username, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      JWT_SECRET,
      { expiresIn: '1hr' }
    );

    // after creating `token`
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.json({ username: user.username, token, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// adding other users to contacts
router.post("/add", authenticateToken, async (req, res) => {
  console.log('ADD request body:', req.body);
  console.log('decoded user:', req.user);
  try {
    const { usernameToAdd } = req.body;
    const currentUser = await User.findById(req.user.userId);
    const otherUser = await User.findOne({ username: usernameToAdd });

    if (!usernameToAdd) {
      return res.status(400).json({ error: "usernameToAdd required" })
    };

    if (!currentUser || !otherUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (currentUser._id.equals(otherUser._id)) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }

    if (currentUser.contacts.includes(otherUser._id)) {
      return res.status(400).json({ error: "User already added" });
    }

    currentUser.contacts.push(otherUser._id);
    await currentUser.save();

    res.json({ message: "User added", contacts: currentUser.contacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// find specific user
router.get("/users/:username/contacts", async (req, res) => {
  const user = await User.findOne({ username: req.params.username })
    .populate("contacts", "username")
    .lean();
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user.contacts);
});

// users in your contact list
router.get("/me/contacts", authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId).populate("contacts", "username").lean();
  res.json(user.contacts);
});


// all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username").lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;