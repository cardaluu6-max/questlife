const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { Habit, Daily, Todo, Reward } = require('../models/Task');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'questlife_secret', { expiresIn: '7d' });

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatar, charClass } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'Username, email and password required.' });

    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(409).json({ error: 'Username or email already taken.' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username, email, password: hash,
      avatar: avatar || '🧙',
      charClass: charClass || 'Scholar Mage',
    });

    // Seed starter tasks
    await Promise.all([
      Habit.insertMany([
        { user: user._id, name: 'Study Session', icon: '📚', tag: 'study', diff: 'medium' },
        { user: user._id, name: 'Morning Exercise', icon: '💪', tag: 'fitness', diff: 'easy' },
        { user: user._id, name: 'Drink Water', icon: '💧', tag: 'health', diff: 'trivial' },
      ]),
      Daily.insertMany([
        { user: user._id, name: 'Review Class Notes', icon: '📝', tag: 'study', diff: 'medium', xpReward: 25, goldReward: 10 },
        { user: user._id, name: '30-min Walk/Run', icon: '🏃', tag: 'fitness', diff: 'easy', xpReward: 20, goldReward: 8 },
        { user: user._id, name: 'Read for 20 mins', icon: '📖', tag: 'study', diff: 'easy', xpReward: 15, goldReward: 6 },
      ]),
      Todo.insertMany([
        { user: user._id, name: 'Set up QuestLife profile', icon: '🎯', tag: 'study', priority: 'high', xpReward: 30, goldReward: 15 },
      ]),
      Reward.insertMany([
        { user: user._id, name: '30-min Game Time', icon: '🎮', cost: 30 },
        { user: user._id, name: 'Favorite Snack', icon: '🍕', cost: 50 },
        { user: user._id, name: 'Netflix Episode', icon: '📺', cost: 40 },
        { user: user._id, name: 'Social Media 1hr', icon: '📱', cost: 25 },
        { user: user._id, name: 'Day Off (1 task)', icon: '😴', cost: 100 },
      ]),
    ]);

    res.status(201).json({ token: sign(user._id), user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: 'Invalid email or password.' });

    // Streak logic: if last login was yesterday, increment; else reset if > 1 day gap
    const now = new Date();
    if (user.lastLogin) {
      const diff = Math.floor((now - user.lastLogin) / (1000 * 60 * 60 * 24));
      if (diff === 1) user.streak++;
      else if (diff > 1) user.streak = 1;
    } else {
      user.streak = 1;
    }
    user.lastLogin = now;

    // Reset dailies if it's a new day
    const lastDate = user.lastLogin ? new Date(user.lastLogin).toDateString() : null;
    if (lastDate !== now.toDateString()) {
      await Daily.updateMany({ user: user._id }, { doneToday: false });
    }

    await user.save();
    res.json({ token: sign(user._id), user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

const sanitize = (u) => ({
  id: u._id, username: u.username, email: u.email,
  avatar: u.avatar, charClass: u.charClass,
  level: u.level, xp: u.xp, xpNeeded: u.xpNeeded,
  hp: u.hp, maxHp: u.maxHp, mp: u.mp, maxMp: u.maxMp,
  gold: u.gold, gems: u.gems, streak: u.streak,
  str: u.str, int: u.int, con: u.con, per: u.per,
});

module.exports = router;
