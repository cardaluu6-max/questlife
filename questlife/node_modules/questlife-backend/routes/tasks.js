const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { Habit, Daily, Todo, Reward } = require('../models/Task');

const DIFF_XP   = { trivial: 5,  easy: 15, medium: 25, hard: 50 };
const DIFF_GOLD = { trivial: 2,  easy: 8,  medium: 15, hard: 25 };
const DIFF_DMG  = { trivial: 2,  easy: 5,  medium: 10, hard: 20 };

// ── GET all tasks ─────────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const uid = req.user.id;
    const [habits, dailies, todos, rewards, user] = await Promise.all([
      Habit.find({ user: uid, isActive: true }).sort({ createdAt: 1 }),
      Daily.find({ user: uid, isActive: true }).sort({ createdAt: 1 }),
      Todo.find({ user: uid }).sort({ done: 1, createdAt: -1 }),
      Reward.find({ user: uid, isActive: true }).sort({ cost: 1 }),
      User.findById(uid),
    ]);
    res.json({ habits, dailies, todos, rewards, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// ── HABITS ────────────────────────────────────────────────────────────────────
router.post('/habits', auth, async (req, res) => {
  try {
    const { name, icon, tag, diff } = req.body;
    const habit = await Habit.create({ user: req.user.id, name, icon, tag, diff });
    res.status(201).json({ habit });
  } catch { res.status(500).json({ error: 'Failed to create habit.' }); }
});

router.post('/habits/:id/click', auth, async (req, res) => {
  try {
    const { direction } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    // Daily click limit — one click per day per habit
    const todayStr = new Date().toISOString().slice(0, 10);
    if (habit.lastClickedDate === todayStr) {
      return res.status(429).json({ error: 'Already clicked today! Come back tomorrow.' });
    }
    habit.lastClickedDate = todayStr;
    habit.clickedToday = true;

    const user = await User.findById(req.user.id);
    let events = [];

    if (direction > 0) {
      habit.posCount++;
      habit.streak++;
      const xp   = DIFF_XP[habit.diff];
      const gold = DIFF_GOLD[habit.diff];
      events = user.gainXP(xp, gold);
      await Promise.all([habit.save(), user.save()]);
      res.json({ habit, user: sanitize(user), xpGained: xp, goldGained: gold, events });
    } else {
      habit.negCount++;
      if (habit.streak > 0) habit.streak--;
      const dmg = DIFF_DMG[habit.diff];
      user.takeDamage(dmg);
      await Promise.all([habit.save(), user.save()]);
      res.json({ habit, user: sanitize(user), hpLost: dmg, events });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to click habit.' });
  }
});

router.delete('/habits/:id', auth, async (req, res) => {
  try {
    await Habit.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isActive: false });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete.' }); }
});

// ── DAILIES ───────────────────────────────────────────────────────────────────
router.post('/dailies', auth, async (req, res) => {
  try {
    const { name, icon, tag, diff } = req.body;
    const xpReward   = DIFF_XP[diff]   || 15;
    const goldReward = DIFF_GOLD[diff]  || 8;
    const daily = await Daily.create({ user: req.user.id, name, icon, tag, diff, xpReward, goldReward });
    res.status(201).json({ daily });
  } catch { res.status(500).json({ error: 'Failed to create daily.' }); }
});

router.post('/dailies/:id/complete', auth, async (req, res) => {
  try {
    const daily = await Daily.findOne({ _id: req.params.id, user: req.user.id });
    if (!daily) return res.status(404).json({ error: 'Daily not found.' });
    if (daily.doneToday) return res.status(409).json({ error: 'Already done today.' });

    daily.doneToday = true;
    daily.lastDone  = new Date();
    daily.streak++;

    const user = await User.findById(req.user.id);
    const events = user.gainXP(daily.xpReward, daily.goldReward);
    await Promise.all([daily.save(), user.save()]);
    res.json({ daily, user: sanitize(user), xpGained: daily.xpReward, goldGained: daily.goldReward, events });
  } catch { res.status(500).json({ error: 'Failed to complete daily.' }); }
});

router.delete('/dailies/:id', auth, async (req, res) => {
  try {
    await Daily.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isActive: false });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete.' }); }
});

// ── TODOS ─────────────────────────────────────────────────────────────────────
router.post('/todos', auth, async (req, res) => {
  try {
    const { name, icon, tag, priority, diff, dueDate } = req.body;
    const xpReward   = DIFF_XP[diff || 'easy'];
    const goldReward = DIFF_GOLD[diff || 'easy'];
    const todo = await Todo.create({ user: req.user.id, name, icon, tag, priority, xpReward, goldReward, dueDate: dueDate || null });
    res.status(201).json({ todo });
  } catch { res.status(500).json({ error: 'Failed to create todo.' }); }
});

router.post('/todos/:id/complete', auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ error: 'Todo not found.' });
    if (todo.done) return res.status(409).json({ error: 'Already completed.' });

    todo.done   = true;
    todo.doneAt = new Date();

    const user = await User.findById(req.user.id);
    const events = user.gainXP(todo.xpReward, todo.goldReward);
    await Promise.all([todo.save(), user.save()]);
    res.json({ todo, user: sanitize(user), xpGained: todo.xpReward, goldGained: todo.goldReward, events });
  } catch { res.status(500).json({ error: 'Failed to complete todo.' }); }
});

router.delete('/todos/:id', auth, async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete.' }); }
});

// ── REWARDS ───────────────────────────────────────────────────────────────────
router.post('/rewards', auth, async (req, res) => {
  try {
    const { name, icon, cost } = req.body;
    const reward = await Reward.create({ user: req.user.id, name, icon, cost });
    res.status(201).json({ reward });
  } catch { res.status(500).json({ error: 'Failed to create reward.' }); }
});

router.post('/rewards/:id/redeem', auth, async (req, res) => {
  try {
    const reward = await Reward.findOne({ _id: req.params.id, user: req.user.id });
    if (!reward) return res.status(404).json({ error: 'Reward not found.' });

    const user = await User.findById(req.user.id);
    if (user.gold < reward.cost) return res.status(400).json({ error: 'Not enough gold.' });

    user.gold -= reward.cost;
    reward.timesRedeemed++;
    await Promise.all([reward.save(), user.save()]);
    res.json({ reward, user: sanitize(user) });
  } catch { res.status(500).json({ error: 'Failed to redeem reward.' }); }
});

router.delete('/rewards/:id', auth, async (req, res) => {
  try {
    await Reward.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { isActive: false });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete.' }); }
});

// ── LEADERBOARD ───────────────────────────────────────────────────────────────
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('username avatar charClass level xp streak')
      .sort({ level: -1, xp: -1 })
      .limit(20);
    res.json({ leaderboard: users });
  } catch { res.status(500).json({ error: 'Failed to fetch leaderboard.' }); }
});

const sanitize = (u) => ({
  id: u._id, username: u.username, avatar: u.avatar, charClass: u.charClass,
  level: u.level, xp: u.xp, xpNeeded: u.xpNeeded,
  hp: u.hp, maxHp: u.maxHp, mp: u.mp, maxMp: u.maxMp,
  gold: u.gold, gems: u.gems, streak: u.streak,
  str: u.str, int: u.int, con: u.con, per: u.per,
});

module.exports = router;
