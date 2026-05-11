import { useState, useEffect } from 'react'

const STEPS = [
  {
    id: 'welcome',
    title: '⚔️ Welcome to QuestLife!',
    emoji: '🎉',
    description: "You're now a hero on a quest for academic excellence! This quick tour will show you everything you need to know. It only takes 2 minutes!",
    tip: null,
    highlight: null,
    position: 'center',
  },
  {
    id: 'character',
    title: '🧙 Your Character',
    emoji: '❤️',
    description: "This is YOUR hero panel on the left. It shows your HP, MP, XP and level. Complete tasks to gain XP and level up — your stats improve every time!",
    tip: '💡 HP drops when you miss habits. MP recovers as you complete tasks.',
    highlight: 'char-panel',
    position: 'right',
  },
  {
    id: 'habits',
    title: '⚡ Habits',
    emoji: '⚡',
    description: "Habits are recurring behaviors you want to build or break. Click 👍 when you do them to gain XP and Gold. Click 👎 if you slip up — you'll lose HP!",
    tip: '💡 The more you click 👍, the longer your streak grows 🔥',
    highlight: null,
    position: 'center',
  },
  {
    id: 'dailies',
    title: '📅 Dailies',
    emoji: '📅',
    description: "Dailies are tasks you should complete EVERY day — like reviewing notes or exercising. Check them off to earn XP and Gold. They reset the next time you log in!",
    tip: '💡 Completing all your dailies in one day builds your streak!',
    highlight: null,
    position: 'center',
  },
  {
    id: 'todos',
    title: '✅ To-Dos',
    emoji: '✅',
    description: "To-Dos are one-time tasks like finishing an assignment or calling someone. Set a priority level and due date so you never forget important deadlines!",
    tip: '💡 Overdue tasks are highlighted in red ⚠️ — tackle them first!',
    highlight: null,
    position: 'center',
  },
  {
    id: 'rewards',
    title: '🏪 The Reward Shop',
    emoji: '🪙',
    description: "Earn Gold by completing tasks, then spend it on real-life rewards you define yourself — like game time, snacks, or a Netflix episode. You earn it, you enjoy it!",
    tip: '💡 Go to the 🏪 Shop tab to redeem your rewards anytime.',
    highlight: null,
    position: 'center',
  },
  {
    id: 'levelup',
    title: '🌟 Leveling Up',
    emoji: '🌟',
    description: "Every task you complete gives XP. Fill your XP bar to level up! Each level increases your STR, INT, CON, and PER stats, and gives you a 💎 Gem bonus.",
    tip: '💡 Harder tasks give more XP. Try adding a "Hard" difficulty task!',
    highlight: null,
    position: 'center',
  },
  {
    id: 'addtask',
    title: '➕ Adding Your First Task',
    emoji: '✨',
    description: 'Click any "+ Add" button in the Tasks tab to create your own habits, dailies, or to-dos. Pick an icon, set the difficulty, and start your quest!',
    tip: '💡 Start with 3 habits, 3 dailies, and 2 to-dos for the best experience.',
    highlight: null,
    position: 'center',
  },
  {
    id: 'ready',
    title: "🎮 You're Ready!",
    emoji: '🏆',
    description: "Your adventure begins now! Complete tasks every day, maintain your streak, and climb the leaderboard. May your GPA be legendary! 📚⚔️",
    tip: null,
    highlight: null,
    position: 'center',
  },
]

export default function Tutorial({ onComplete }) {
  const [step, setStep] = useState(0)
  const [animating, setAnimating] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  const go = (dir) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setStep(s => s + dir)
      setAnimating(false)
    }, 200)
  }

  const finish = () => {
    localStorage.setItem('ql_tutorial_done', 'true')
    onComplete()
  }

  // Skip tutorial
  const skip = () => {
    if (window.confirm('Skip the tutorial? You can always restart it from settings.')) finish()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Progress dots */}
      <div style={{
        position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6,
      }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8, height: 8, borderRadius: 4,
            background: i === step ? 'var(--purple3)' : i < step ? 'var(--green)' : 'var(--border2)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Skip button */}
      <button onClick={skip} style={{
        position: 'absolute', top: 20, right: 24,
        background: 'none', border: '1px solid var(--border)',
        borderRadius: 20, padding: '5px 14px',
        color: 'var(--text3)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
      }}>Skip tour</button>

      {/* Card */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 28, padding: '40px 36px', width: 480, maxWidth: '100%',
        textAlign: 'center',
        opacity: animating ? 0 : 1,
        transform: animating ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.2s ease',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
      }}>

        {/* Emoji */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))',
          border: '2px solid var(--border2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
          animation: 'float 3s ease-in-out infinite',
        }}>{current.emoji}</div>

        {/* Step counter */}
        <div style={{
          fontSize: 11, color: 'var(--text3)', fontWeight: 800,
          letterSpacing: '0.12em', marginBottom: 10,
        }}>STEP {step + 1} OF {STEPS.length}</div>

        {/* Title */}
        <div style={{
          fontFamily: "'Fredoka', sans-serif", fontSize: 26, fontWeight: 700,
          color: 'var(--text)', marginBottom: 16, lineHeight: 1.2,
        }}>{current.title}</div>

        {/* Description */}
        <p style={{
          fontSize: 15, color: 'var(--text2)', lineHeight: 1.7,
          marginBottom: current.tip ? 20 : 32,
        }}>{current.description}</p>

        {/* Tip box */}
        {current.tip && (
          <div style={{
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 14, padding: '12px 16px', marginBottom: 28,
            fontSize: 13, color: 'var(--purple3)', fontWeight: 600, textAlign: 'left',
          }}>{current.tip}</div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {!isFirst && (
            <button onClick={() => go(-1)} style={{
              padding: '11px 24px', borderRadius: 14,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text3)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>← Back</button>
          )}
          {!isLast ? (
            <button onClick={() => go(1)} style={{
              flex: 1, maxWidth: 220, padding: '12px 0', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, var(--purple), var(--pink))',
              color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
              transition: 'all 0.2s',
            }}>Next →</button>
          ) : (
            <button onClick={finish} style={{
              flex: 1, maxWidth: 260, padding: '12px 0', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, var(--green), #059669)',
              color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
              transition: 'all 0.2s',
            }}>🚀 Start My Quest!</button>
          )}
        </div>
      </div>
    </div>
  )
}
