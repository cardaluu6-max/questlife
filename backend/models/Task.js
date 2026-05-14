const mongoose = require('mongoose');

// ── Habit ─────────────────────────────────────────────────────────────────────
const HabitSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:            { type: String, required: true },
  icon:            { type: String, default: '⚡' },
  tag:             { type: String, enum: ['study','fitness','chores','health','social'], default: 'study' },
  diff:            { type: String, enum: ['trivial','easy','medium','hard'], default: 'easy' },
  posCount:        { type: Number, default: 0 },
  negCount:        { type: Number, default: 0 },
  streak:          { type: Number, default: 0 },
  isActive:        { type: Boolean, default: true },
  lastClickedDate: { type: String, default: null },
  clickedToday:    { type: Boolean, default: false },
}, { timestamps: true });

// ── Daily ─────────────────────────────────────────────────────────────────────
const DailySchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true },
  icon:       { type: String, default: '📅' },
  tag:        { type: String, enum: ['study','fitness','chores','health','social'], default: 'study' },
  diff:       { type: String, enum: ['trivial','easy','medium','hard'], default: 'easy' },
  xpReward:   { type: Number, default: 15 },
  goldReward: { type: Number, default: 8 },
  doneToday:  { type: Boolean, default: false },
  lastDone:   { type: Date, default: null },
  streak:     { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

// ── Todo ──────────────────────────────────────────────────────────────────────
const TodoSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true },
  icon:       { type: String, default: '✅' },
  tag:        { type: String, enum: ['study','fitness','chores','health','social'], default: 'study' },
  priority:   { type: String, enum: ['low','medium','high'], default: 'medium' },
  xpReward:   { type: Number, default: 25 },
  goldReward: { type: Number, default: 10 },
  done:       { type: Boolean, default: false },
  doneAt:     { type: Date, default: null },
  dueDate:    { type: Date, default: null },
}, { timestamps: true });

// ── Reward ────────────────────────────────────────────────────────────────────
const RewardSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:          { type: String, required: true },
  icon:          { type: String, default: '🎁' },
  cost:          { type: Number, required: true },
  timesRedeemed: { type: Number, default: 0 },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
  Habit:  mongoose.model('Habit',  HabitSchema),
  Daily:  mongoose.model('Daily',  DailySchema),
  Todo:   mongoose.model('Todo',   TodoSchema),
  Reward: mongoose.model('Reward', RewardSchema),
};
