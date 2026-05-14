const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar:   { type: String, default: '🧙' },
  charClass:{ type: String, default: 'Scholar Mage' },

  // Core stats
  level:    { type: Number, default: 1 },
  xp:       { type: Number, default: 0 },
  xpNeeded: { type: Number, default: 150 },
  hp:       { type: Number, default: 50 },
  maxHp:    { type: Number, default: 50 },
  mp:       { type: Number, default: 30 },
  maxMp:    { type: Number, default: 30 },
  gold:     { type: Number, default: 0 },
  gems:     { type: Number, default: 0 },
  streak:   { type: Number, default: 0 },
  lastLogin:{ type: Date, default: null },

  // Attributes
  str: { type: Number, default: 10 },
  int: { type: Number, default: 10 },
  con: { type: Number, default: 10 },
  per: { type: Number, default: 10 },

  // Rewards redeemed
  redeemedRewards: [{ type: String }],

  party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', default: null },
}, { timestamps: true });

// Level-up logic
UserSchema.methods.gainXP = function(amount, gold = 0) {
  this.xp += amount;
  this.gold += gold;
  if (this.mp < this.maxMp) this.mp = Math.min(this.maxMp, this.mp + 2);

  const events = [];
  while (this.xp >= this.xpNeeded) {
    this.xp -= this.xpNeeded;
    this.level++;
    this.xpNeeded = Math.floor(150 * Math.pow(1.3, this.level - 1));
    this.maxHp += 5; this.hp = this.maxHp;
    this.maxMp += 3; this.mp = this.maxMp;
    this.str++; this.int++; this.con++; this.per++;
    this.gems++;
    events.push({ type: 'levelup', level: this.level });
  }
  return events;
};

UserSchema.methods.takeDamage = function(amount) {
  this.hp = Math.max(0, this.hp - amount);
};

module.exports = mongoose.model('User', UserSchema);
