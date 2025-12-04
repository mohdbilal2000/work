const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const jsonDbPath = path.join(__dirname, '../database/csm.json');
const authJsonPath = path.join(__dirname, '../database/jsonFiles/csm.json');

const findUserInJson = (username, role) => {
  try {
    let data = null;
    if (fs.existsSync(jsonDbPath)) {
      data = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
    } else if (fs.existsSync(authJsonPath)) {
      data = JSON.parse(fs.readFileSync(authJsonPath, 'utf8'));
    }
    if (!data) return null;
    return data.users.find(
      (user) => user.username === username && (!role || user.role === role)
    );
  } catch (error) {
    console.warn('Unable to read JSON user store:', error.message);
    return null;
  }
};

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    let user = await db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      user = findUserInJson(username);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

// Register (for adding new users - admin only)
router.post('/register', async (req, res) => {
  const { username, email, password, role = 'admin' } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(username, email, hashedPassword, role);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.lastInsertRowid,
        username,
        email,
        role
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.code === 1062) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Member Registration (for CSM members)
router.post('/member/register', async (req, res) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `).run(username, email, hashedPassword, 'member');

    res.status(201).json({
      message: 'Member registered successfully',
      user: {
        id: result.lastInsertRowid,
        username,
        email,
        role: 'member'
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.code === 1062) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Error registering member' });
  }
});

// Member Login (separate endpoint for members)
router.post('/member/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    let user = await db.prepare('SELECT * FROM users WHERE username = ? AND role = ?').get(username, 'member');

    if (!user) {
      user = findUserInJson(username, 'member');
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or not a member account' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

module.exports = router;

