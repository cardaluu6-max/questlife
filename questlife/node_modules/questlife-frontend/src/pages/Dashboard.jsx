import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import CharPanel from '../components/CharPanel'
import AddModal from '../components/AddModal'
import ToastContainer from '../components/ToastContainer'
import Tutorial from '../components/Tutorial'
import {
  getTasks, getLeaderboard,
  clickHabit, createHabit, deleteHabit,
  completeDaily, createDaily, deleteDaily,
  completeTodo, createTodo, deleteTodo,
  redeemReward, createReward, deleteReward,
} from '../api'

const TAG_COLORS = {
  study:   { bg:'rgba(99,102,241,0.2)',   text:'#A5B4FC' },
  fitness: { bg:'rgba(16,185,129,0.2)',   text:'var(--green2)' },
  chores:  { bg:'rgba(245,158,11,0.2)',   text:'var(--yellow2)' },
  health:  { bg:'rgba(236,72,153,0.2)',   text:'var(--pink2)' },
  social:  { bg:'rgba(6,182,212,0.2)',    text:'var(--cyan2)' },
}
const DIFF_COLORS = {
  trivial: { bg:'rgba(107,114,128,0.2)', text:'#9CA3AF' },
  easy:    { bg:'rgba(16,185,129,0.2)',  text:'var(--green2)' },
  medium:  { bg:'rgba(245,158,11,0.2)',  text:'var(--yellow2)' },
  hard:    { bg:'rgba(239,68,68,0.2)',   text:'#FCA5A5' },
}
const PRIORITY_DOT = { low:'var(--green)', medium:'var(--yellow)', high:'var(--red)' }

export default function Dashboard() {
  const { user, updateUser, signOut } = useAuth()
  const { toasts, addToast, removeToast } = useToast()
  const [tab, setTab]         = useState('tasks')
  const [modal, setModal]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData]       = useState({ habits:[], dailies:[], todos:[], rewards:[] })
  const [leaderboard, setLB]  = useState([])
  const [showTutorial, setShowTutorial] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await getTasks()
      setData(res.data)
      updateUser(res.data.user)
      // Show tutorial only on first ever login
      const done = localStorage.getItem('ql_tutorial_done')
      if (!done) setShowTutorial(true)
    } catch (e) {
      addToast('damage', 'Failed to load tasks', e.message)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (tab === 'party') getLeaderboard().then(r => setLB(r.data.leaderboard)).catch(() => {})
  }, [tab])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleHabitClick = async (id, dir) => {
    try {
      const res = await clickHabit(id, dir)
      updateUser(res.data.user)
      setData(d => ({ ...d, habits: d.habits.map(h => h._id === id ? res.data.habit : h) }))
      if (dir > 0) {
        addToast('xp', '⚡ Habit Complete!', `+${res.data.xpGained} XP · 🪙${res.data.goldGained} Gold`)
        res.data.events?.forEach(e => { if (e.type === 'levelup') addToast('levelup', '🌟 LEVEL UP!', `You are now Level ${e.level}!`) })
      } else {
        addToast('damage', '💔 Habit Missed', `-${res.data.hpLost} HP`)
      }
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed'
      if (e.response?.status === 429) {
        addToast('info', '⏳ Already Done Today!', 'Come back tomorrow to click again.')
      } else {
        addToast('damage', 'Error', msg)
      }
    }
  }

  const handleDailyComplete = async (id) => {
    try {
      const res = await completeDaily(id)
      updateUser(res.data.user)
      setData(d => ({ ...d, dailies: d.dailies.map(x => x._id === id ? res.data.daily : x) }))
      addToast('xp', '📅 Daily Done!', `+${res.data.xpGained} XP · 🪙${res.data.goldGained} Gold`)
      res.data.events?.forEach(e => { if (e.type === 'levelup') addToast('levelup', '🌟 LEVEL UP!', `You are now Level ${e.level}!`) })
    } catch (e) { addToast('damage', 'Error', e.response?.data?.error || 'Already done today!') }
  }

  const handleTodoComplete = async (id) => {
    try {
      const res = await completeTodo(id)
      updateUser(res.data.user)
      setData(d => ({ ...d, todos: d.todos.map(x => x._id === id ? res.data.todo : x) }))
      addToast('xp', '✅ To-Do Complete!', `+${res.data.xpGained} XP · 🪙${res.data.goldGained} Gold`)
      res.data.events?.forEach(e => { if (e.type === 'levelup') addToast('levelup', '🌟 LEVEL UP!', `You are now Level ${e.level}!`) })
    } catch (e) { addToast('damage', 'Error', e.response?.data?.error || 'Failed') }
  }

  const handleRedeem = async (id, cost) => {
    if ((user?.gold ?? 0) < cost) { addToast('damage', '💸 Not enough gold!', `Need ${cost} gold`); return }
    try {
      const res = await redeemReward(id)
      updateUser(res.data.user)
      setData(d => ({ ...d, rewards: d.rewards.map(x => x._id === id ? res.data.reward : x) }))
      addToast('gold', '🎉 Reward Claimed!', 'Enjoy your reward!')
    } catch (e) { addToast('damage', 'Error', e.response?.data?.error || 'Failed') }
  }

  const handleAdd = async (form) => {
    try {
      if (modal === 'habit') {
        const res = await createHabit({ name:form.name, icon:form.icon, tag:form.tag, diff:form.diff })
        setData(d => ({ ...d, habits:[...d.habits, res.data.habit] }))
      } else if (modal === 'daily') {
        const res = await createDaily({ name:form.name, icon:form.icon, tag:form.tag, diff:form.diff })
        setData(d => ({ ...d, dailies:[...d.dailies, res.data.daily] }))
      } else if (modal === 'todo') {
        const res = await createTodo({ name:form.name, icon:form.icon, tag:form.tag, priority:form.priority, diff:form.diff, dueDate:form.dueDate || null })
        setData(d => ({ ...d, todos:[...d.todos, res.data.todo] }))
      } else if (modal === 'reward') {
        const res = await createReward({ name:form.name, icon:form.rewardIcon, cost:form.cost })
        setData(d => ({ ...d, rewards:[...d.rewards, res.data.reward] }))
      }
      addToast('info', '✨ Added!', `${form.name} added!`)
    } catch { addToast('damage', 'Error', 'Failed to add.') }
  }

  const handleDelete = async (type, id) => {
    const fns = { habit: deleteHabit, daily: deleteDaily, todo: deleteTodo, reward: deleteReward }
    const keys = { habit:'habits', daily:'dailies', todo:'todos', reward:'rewards' }
    await fns[type](id)
    setData(d => ({ ...d, [keys[type]]: d[keys[type]].filter(x => x._id !== id) }))
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:40, animation:'spin 1s linear infinite' }}>⚔️</div>
      <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:18, color:'var(--purple3)' }}>Loading your quest...</div>
    </div>
  )

  const TABS = [['tasks','🗡️ Tasks'],['rewards','🏪 Shop'],['progress','📊 Stats'],['party','👥 Party']]

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', position:'relative', zIndex:1 }}>

      {/* Header */}
      <header style={{ background:'rgba(15,10,30,0.95)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--border)', padding:'0 16px', minHeight:60,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:100, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, fontSize:18,
            background:'linear-gradient(135deg,var(--purple),var(--pink))',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 15px rgba(124,58,237,0.4)', animation:'float 3s ease-in-out infinite' }}>⚔️</div>
          <span style={{ fontFamily:"'Fredoka',sans-serif", fontSize:20, fontWeight:700,
            background:'linear-gradient(135deg,var(--purple3),var(--pink2))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>QuestLife</span>
        </div>

        <nav style={{ display:'flex', gap:4 }}>
          {TABS.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding:'6px 14px', borderRadius:20, border:'none',
              background: tab === id ? 'linear-gradient(135deg,var(--purple),var(--pink))' : 'transparent',
              color: tab === id ? '#fff' : 'var(--text3)',
              fontSize:13, fontWeight:700, fontFamily:"'Fredoka',sans-serif",
              boxShadow: tab === id ? '0 4px 15px rgba(124,58,237,0.3)' : 'none',
              transition:'all 0.2s',
            }}>{label}</button>
          ))}
        </nav>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:13, color:'var(--text3)', fontWeight:700 }}>
            {user?.username} · Lv.{user?.level}
          </span>
          <button onClick={() => setShowTutorial(true)} style={{ padding:'5px 12px', borderRadius:20,
            border:'1px solid var(--border)', background:'transparent',
            color:'var(--purple3)', fontSize:12, fontWeight:700 }}>📖 Tutorial</button>
          <button onClick={signOut} style={{ padding:'5px 12px', borderRadius:20,
            border:'1px solid var(--border)', background:'transparent',
            color:'var(--text3)', fontSize:12, fontWeight:700 }}>Logout</button>
        </div>
      </header>

      {/* Main */}
      <main style={{ display:'flex', gap:20, padding:'16px', maxWidth:1300, margin:'0 auto', width:'100%', flex:1, flexWrap:'wrap' }}>
        <CharPanel user={user} />

        <div style={{ flex:1, minWidth:0 }}>

          {/* TASKS TAB */}
          {tab === 'tasks' && (
            <div style={{ animation:'fadeUp 0.3s ease' }}>
              <Section title="⚡ Habits" count={data.habits.length} onAdd={() => setModal('habit')}>
                {data.habits.length === 0 ? <Empty icon="⚡" text="No habits yet!" /> : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
                    {data.habits.map(h => <HabitCard key={h._id} h={h} onPos={() => handleHabitClick(h._id,1)} onNeg={() => handleHabitClick(h._id,-1)} onDelete={() => handleDelete('habit',h._id)} />)}
                  </div>
                )}
              </Section>

              <Section title="📅 Dailies" count={data.dailies.filter(d=>!d.doneToday).length} onAdd={() => setModal('daily')}>
                {data.dailies.length === 0 ? <Empty icon="📅" text="No dailies yet!" /> : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {data.dailies.map(d => <DailyCard key={d._id} d={d} onComplete={() => handleDailyComplete(d._id)} onDelete={() => handleDelete('daily',d._id)} />)}
                  </div>
                )}
              </Section>

              <Section title="✅ To-Dos" count={data.todos.filter(t=>!t.done).length} onAdd={() => setModal('todo')}>
                {data.todos.length === 0 ? <Empty icon="✅" text="No to-dos yet!" /> : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {[...data.todos.filter(t=>!t.done), ...data.todos.filter(t=>t.done)].map(t =>
                      <TodoCard key={t._id} t={t} onComplete={() => handleTodoComplete(t._id)} onDelete={() => handleDelete('todo',t._id)} />
                    )}
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* SHOP TAB */}
          {tab === 'rewards' && (
            <div style={{ animation:'fadeUp 0.3s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:22, fontWeight:600, color:'var(--text)' }}>🏪 Reward Shop</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:14, color:'var(--yellow2)', fontWeight:800 }}>🪙 {user?.gold} Gold</span>
                  <button onClick={() => setModal('reward')} style={addBtnStyle}>＋ Custom Reward</button>
                </div>
              </div>
              {data.rewards.length === 0 ? <Empty icon="🏪" text="No rewards yet!" /> : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
                  {data.rewards.map(r => <RewardCard key={r._id} r={r} gold={user?.gold ?? 0} onRedeem={() => handleRedeem(r._id, r.cost)} onDelete={() => handleDelete('reward',r._id)} />)}
                </div>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {tab === 'progress' && (
            <div style={{ animation:'fadeUp 0.3s ease' }}>
              <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:22, fontWeight:600, color:'var(--text)', marginBottom:16 }}>📊 Your Stats</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:24 }}>
                {[
                  ['Level', `Lv.${user?.level}`, 'var(--yellow2)'],
                  ['Total XP', user?.xp, 'var(--purple3)'],
                  ['Gold', `🪙${user?.gold}`, 'var(--yellow2)'],
                  ['Gems', `💎${user?.gems}`, 'var(--cyan2)'],
                  ['Streak', `🔥${user?.streak}`, 'var(--orange)'],
                  ['Dailies Done', data.dailies.filter(d=>d.doneToday).length, 'var(--green2)'],
                  ['Todos Done', data.todos.filter(t=>t.done).length, 'var(--cyan2)'],
                  ['Active Habits', data.habits.length, 'var(--pink2)'],
                ].map(([lbl,val,color]) => (
                  <div key={lbl} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:16 }}>
                    <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:28, fontWeight:700, color, marginBottom:4 }}>{val}</div>
                    <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700, letterSpacing:'0.08em' }}>{lbl.toUpperCase()}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:18, fontWeight:600, color:'var(--text)', marginBottom:12 }}>🏆 Achievements</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
                {[
                  ['First Quest','⚔️', data.dailies.some(d=>d.doneToday) || data.todos.some(t=>t.done)],
                  ['Bookworm','📚', data.habits.some(h=>h.tag==='study'&&h.posCount>=5)],
                  ['Gym Rat','💪', data.habits.some(h=>h.tag==='fitness'&&h.posCount>=5)],
                  ['On Fire','🔥', (user?.streak??0)>=3],
                  ['Rich Student','🪙', (user?.gold??0)>=100],
                  ['Level 5','🌟', (user?.level??1)>=5],
                  ['Shopaholic','🛍️', data.rewards.some(r=>r.timesRedeemed>0)],
                  ['Completionist','✅', data.dailies.length>0&&data.dailies.every(d=>d.doneToday)],
                ].map(([name,icon,unlocked]) => (
                  <div key={name} style={{
                    background: unlocked ? 'rgba(245,158,11,0.08)' : 'var(--card)',
                    border:`1px solid ${unlocked?'var(--yellow)':'var(--border)'}`,
                    borderRadius:14, padding:14, textAlign:'center', transition:'all 0.2s',
                  }}>
                    <div style={{ fontSize:28, marginBottom:6, filter: unlocked?'none':'grayscale(0.7)' }}>{icon}</div>
                    <div style={{ fontSize:11, fontWeight:800, color: unlocked?'var(--yellow2)':'var(--text3)' }}>{name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARTY TAB */}
          {tab === 'party' && (
            <div style={{ animation:'fadeUp 0.3s ease' }}>
              <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:22, fontWeight:600, color:'var(--text)', marginBottom:16 }}>👥 Leaderboard</div>
              {leaderboard.length === 0 ? <Empty icon="👥" text="No other players yet!" /> :
                leaderboard.map((p, i) => {
                  const medals = ['🥇','🥈','🥉']
                  const isMe = p._id === user?.id
                  return (
                    <div key={p._id} style={{
                      background: isMe ? 'rgba(124,58,237,0.08)' : 'var(--card)',
                      border:`1px solid ${isMe?'rgba(124,58,237,0.5)':'var(--border)'}`,
                      borderRadius:14, padding:'12px 16px',
                      display:'flex', alignItems:'center', gap:12, marginBottom:8,
                    }}>
                      <div style={{ width:28, textAlign:'center', fontSize:16, fontFamily:"'Fredoka',sans-serif", fontWeight:700, color:'var(--text3)' }}>{medals[i]||i+1}</div>
                      <div style={{ width:38, height:38, borderRadius:12, background:'rgba(124,58,237,0.15)', border:'1px solid var(--border2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{p.avatar}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:800, color:'var(--text)' }}>{p.username}{isMe?' 👈':''}</div>
                        <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>Lv.{p.level} {p.charClass}</div>
                      </div>
                      <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:15, fontWeight:600, color:'var(--yellow2)' }}>{p.xp} XP</div>
                    </div>
                  )
                })
              }
            </div>
          )}
        </div>
      </main>

      {modal && <AddModal type={modal} onClose={() => setModal(null)} onAdd={handleAdd} />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Section({ title, count, onAdd, children }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:"'Fredoka',sans-serif", fontSize:20, fontWeight:600, color:'var(--text)' }}>{title}</span>
          <span style={{ fontSize:11, background:'var(--card2)', border:'1px solid var(--border2)', borderRadius:20, padding:'2px 9px', color:'var(--text3)', fontWeight:700 }}>{count}</span>
        </div>
        <button onClick={onAdd} style={addBtnStyle}>＋ Add</button>
      </div>
      {children}
    </div>
  )
}

function Tag({ label, type }) {
  const c = TAG_COLORS[label] || { bg:'rgba(255,255,255,0.1)', text:'var(--text3)' }
  const d = DIFF_COLORS[label] || null
  const col = d || c
  return <span style={{ fontSize:10, padding:'2px 7px', borderRadius:6, fontWeight:700, background:col.bg, color:col.text }}>{label}</span>
}

function HabitCard({ h, onPos, onNeg, onDelete }) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const doneToday = h.lastClickedDate === todayStr

  return (
    <div style={{ background:'var(--card)', border:`1px solid ${doneToday ? 'var(--green)' : 'var(--border)'}`, borderRadius:16, padding:14, position:'relative', opacity: doneToday ? 0.75 : 1, transition:'all 0.3s' }}>
      <button onClick={onDelete} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', color:'var(--text4)', fontSize:14, cursor:'pointer' }}>×</button>
      <span style={{ fontSize:26, marginBottom:8, display:'block' }}>{h.icon}</span>
      <div style={{ display:'flex', gap:4, marginBottom:6 }}><Tag label={h.diff} /><Tag label={h.tag} /></div>
      <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{h.name}</div>
      <div style={{ fontSize:11, color:'var(--orange)', fontWeight:700, marginBottom:10 }}>{h.streak > 0 ? `🔥 ${h.streak} streak` : '—'}</div>
      {doneToday ? (
        <div style={{ textAlign:'center', padding:'8px 0', borderRadius:10, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'var(--green2)', fontSize:12, fontWeight:800 }}>
          ✅ Done for today! Come back tomorrow.
        </div>
      ) : (
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={onPos} style={{ flex:1, padding:'6px 0', borderRadius:10, border:'1px solid rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.12)', color:'var(--green2)', fontSize:14, fontWeight:700, transition:'all 0.15s' }}>👍 +</button>
          <button onClick={onNeg} style={{ flex:1, padding:'6px 0', borderRadius:10, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.12)', color:'#FCA5A5', fontSize:14, fontWeight:700, transition:'all 0.15s' }}>👎 −</button>
        </div>
      )}
    </div>
  )
}

function DailyCard({ d, onComplete, onDelete }) {
  return (
    <div style={{ background: d.doneToday ? 'var(--bg3)' : 'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, opacity: d.doneToday ? 0.55 : 1, transition:'all 0.2s' }}>
      <div onClick={!d.doneToday ? onComplete : undefined}
        style={{ width:26, height:26, borderRadius:8, border:`2px solid ${d.doneToday?'var(--green)':'var(--border2)'}`, background: d.doneToday ? 'linear-gradient(135deg,var(--green),#059669)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor: d.doneToday ? 'default' : 'pointer', fontSize:14, transition:'all 0.2s', flexShrink:0, boxShadow: d.doneToday ? '0 0 10px rgba(16,185,129,0.3)' : 'none' }}>
        {d.doneToday ? '✓' : ''}
      </div>
      <span style={{ fontSize:20 }}>{d.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', textDecoration: d.doneToday ? 'line-through' : 'none' }}>{d.name}</div>
        <div style={{ display:'flex', gap:6, marginTop:3 }}><Tag label={d.tag} /><Tag label={d.diff} />{d.streak>0&&<span style={{ fontSize:11, color:'var(--orange)' }}>🔥{d.streak}</span>}</div>
      </div>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontSize:12, fontWeight:800, color:'var(--yellow2)' }}>+{d.xpReward} XP</div>
        <div style={{ fontSize:11, color:'var(--text3)' }}>🪙{d.goldReward}</div>
      </div>
      <button onClick={onDelete} style={{ background:'none', border:'none', color:'var(--text4)', fontSize:16, cursor:'pointer', padding:'0 4px' }}>×</button>
    </div>
  )
}

function TodoCard({ t, onComplete, onDelete }) {
  const overdue = t.dueDate && new Date(t.dueDate) < new Date() && !t.done
  return (
    <div style={{ background: t.done ? 'var(--bg3)' : 'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, opacity: t.done ? 0.5 : 1, transition:'all 0.2s' }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background: PRIORITY_DOT[t.priority], flexShrink:0 }} />
      <div onClick={!t.done ? onComplete : undefined}
        style={{ width:22, height:22, borderRadius:'50%', border:`2px solid ${t.done?'var(--cyan)':'var(--border2)'}`, background: t.done ? 'linear-gradient(135deg,var(--cyan),#0891B2)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor: t.done ? 'default' : 'pointer', fontSize:12, transition:'all 0.2s', flexShrink:0 }}>
        {t.done ? '✓' : ''}
      </div>
      <span style={{ fontSize:18 }}>{t.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.name}</div>
        <div style={{ display:'flex', gap:6, marginTop:3, alignItems:'center' }}>
          <Tag label={t.tag} />
          {t.dueDate && <span style={{ fontSize:10, color: overdue ? 'var(--red)' : 'var(--text3)' }}>{overdue ? '⚠️ ' : ''}{new Date(t.dueDate).toLocaleDateString()}</span>}
        </div>
      </div>
      <div style={{ textAlign:'right' }}>
        <div style={{ fontSize:12, fontWeight:800, color:'var(--yellow2)' }}>+{t.xpReward} XP</div>
        <div style={{ fontSize:11, color:'var(--text3)' }}>🪙{t.goldReward}</div>
      </div>
      <button onClick={onDelete} style={{ background:'none', border:'none', color:'var(--text4)', fontSize:16, cursor:'pointer', padding:'0 4px' }}>×</button>
    </div>
  )
}

function RewardCard({ r, gold, onRedeem, onDelete }) {
  const canAfford = gold >= r.cost
  return (
    <div style={{ background:'var(--card)', border:`1px solid ${canAfford?'var(--border)':'var(--border)'}`, borderRadius:16, padding:16, textAlign:'center', cursor: canAfford ? 'pointer' : 'not-allowed', opacity: canAfford ? 1 : 0.5, transition:'all 0.2s', position:'relative' }}
      onClick={canAfford ? onRedeem : undefined}>
      <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ position:'absolute', top:8, right:8, background:'none', border:'none', color:'var(--text4)', fontSize:14, cursor:'pointer' }}>×</button>
      {r.timesRedeemed > 0 && <div style={{ position:'absolute', top:8, left:8, background:'rgba(16,185,129,0.2)', borderRadius:20, padding:'2px 7px', fontSize:9, color:'var(--green2)', fontWeight:800 }}>×{r.timesRedeemed}</div>}
      <span style={{ fontSize:34, marginBottom:8, display:'block' }}>{r.icon}</span>
      <div style={{ fontSize:12, fontWeight:800, color:'var(--text)', marginBottom:8 }}>{r.name}</div>
      <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:800, color:'var(--yellow2)' }}>🪙 {r.cost}</div>
    </div>
  )
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign:'center', padding:'32px 20px', color:'var(--text4)' }}>
      <div style={{ fontSize:36, marginBottom:8, opacity:0.4 }}>{icon}</div>
      <div style={{ fontSize:14, fontWeight:700 }}>{text}</div>
    </div>
  )
}

const addBtnStyle = {
  display:'flex', alignItems:'center', gap:6, padding:'6px 14px',
  borderRadius:20, border:'1px dashed var(--border2)', background:'transparent',
  color:'var(--text3)', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s',
}
