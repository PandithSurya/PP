const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Entry = require('./models/Entry');
const User = require('./models/User');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_monochrome_tracker';

// MongoDB connection
if (!MONGO_URI) {
  console.error('❌ FATAL ERROR: MONGO_URI environment variable is not defined.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection error:', err));

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    // Data Migration: Link unowned entries to the first user
    const userCount = await User.countDocuments();
    if (userCount === 1) {
      // Find all entries without a userId
      await Entry.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: user._id } },
        { strict: false } // Needed if schema enforces userId but existing docs didn't have it
      );
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Protected Routes ---
app.get('/entries', authMiddleware, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/entry', authMiddleware, async (req, res) => {
  const { date, ...data } = req.body;
  const today = new Date().toISOString().split('T')[0];

  // No backfilling check
  if (date < today) {
    return res.status(403).json({ error: "Accountability Alert: No backfilling of past days allowed." });
  }

  try {
    const entry = await Entry.findOneAndUpdate(
      { date, userId: req.user.id },
      { ...data, date, userId: req.user.id },
      { new: true, upsert: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/stats', authMiddleware, async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.user.id }).sort({ date: 1 });
    
    let currentStreak = 0;
    let longestStreak = 0;
    
    const today = new Date().toISOString().split('T')[0];

    // Logic for current streak:
    let tempDate = new Date(today);
    while (true) {
        const dStr = tempDate.toISOString().split('T')[0];
        const entry = entries.find(e => e.date === dStr);
        if (entry && entry.dsaDone && entry.subjectDone) {
            currentStreak++;
            tempDate.setDate(tempDate.getDate() - 1);
        } else {
            break;
        }
    }

    // Longest streak
    let max = 0;
    let curr = 0;
    let lastDate = null;
    entries.forEach(e => {
        if (e.dsaDone && e.subjectDone) {
            if (lastDate) {
                const diffTime = Math.abs(new Date(e.date) - new Date(lastDate));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    curr++;
                } else {
                    curr = 1;
                }
            } else {
                curr = 1;
            }
            max = Math.max(max, curr);
            lastDate = e.date;
        } else {
            curr = 0;
            lastDate = null;
        }
    });
    longestStreak = max;

    // Weekly completion %
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const lastSevenDays = entries.filter(e => e.date >= sevenDaysAgo.toISOString().split('T')[0]);
    const weeklyCompletion = lastSevenDays.length > 0 
        ? (lastSevenDays.filter(e => e.dsaDone && e.subjectDone).length / 7) * 100 
        : 0;

    res.json({
      currentStreak,
      longestStreak,
      weeklyCompletion: Math.round(weeklyCompletion)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
