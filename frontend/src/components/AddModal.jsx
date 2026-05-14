import { useState } from 'react'

const TAGS  = ['study','fitness','chores','health','social']
const DIFFS = ['trivial','easy','medium','hard']
const ICONS = ['📚','💪','💧','🧹','📝','🏃','📖','🥗','✏️','🔢','📄','📞','🎯','🎮','💊','🧘','🎵','🌅','🏋️','🍎','💻','🎨','🎤','🧪','📐']
const PRIORITIES = ['low','medium','high']

export default function AddModal({ type, onClose, onAdd }) {
  const [form, setForm] = useState({
    name:'', icon:'📚', tag:'study', diff:'easy',
    priority:'medium', dueDate:'', cost:30, rewardIcon:'🎮',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const titles = { habit:'⚡ New Habit', daily:'📅 New Daily', todo:'✅ New To-Do', reward:'🎁 New Reward' }

  const submit = () => {
    if (!form.name.trim()) return
    onAdd({ ...form })
    onClose()
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
        backdropFilter:'blur(8px)', zIndex:200,
        display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{
        background:'var(--bg2)', border:'1px solid var(--border2)',
        borderRadius:24, padding:28, width:420, maxWidth:'100%',
        animation:'popIn 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:22, fontWeight:600,
          color:'var(--text)', marginBottom:20 }}>{titles[type]}</div>

        {/* Icon row */}
        {type !== 'reward' ? (
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>ICON</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {ICONS.slice(0, 12).map(ic => (
                <button key={ic} onClick={() => set('icon', ic)} style={{
                  width:36, height:36, borderRadius:8, border:'2px solid',
                  borderColor: form.icon === ic ? 'var(--purple)' : 'var(--border)',
                  background: form.icon === ic ? 'rgba(124,58,237,0.2)' : 'var(--bg3)',
                  fontSize:18, cursor:'pointer', transition:'all 0.15s',
                }}>{ic}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>ICON</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['🎮','🍕','📺','📱','😴','📚','🛌','🎬','🍦','🎵'].map(ic => (
                <button key={ic} onClick={() => set('rewardIcon', ic)} style={{
                  width:36, height:36, borderRadius:8, border:'2px solid',
                  borderColor: form.rewardIcon === ic ? 'var(--yellow)' : 'var(--border)',
                  background: form.rewardIcon === ic ? 'rgba(245,158,11,0.15)' : 'var(--bg3)',
                  fontSize:18, cursor:'pointer', transition:'all 0.15s',
                }}>{ic}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom:14 }}>
          <label style={lbl}>NAME</label>
          <input autoFocus value={form.name} onChange={e => set('name', e.target.value)}
            placeholder={type === 'reward' ? 'e.g. 30-min Game Time' : 'e.g. Study 1 hour'}
            style={{ width:'100%', padding:'10px 14px', background:'var(--bg3)',
              border:'1px solid var(--border)', borderRadius:12, color:'var(--text)',
              fontSize:14, outline:'none' }}
            onFocus={e => e.target.style.borderColor='var(--purple)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        {type === 'reward' ? (
          <div style={{ marginBottom:14 }}>
            <label style={lbl}>GOLD COST 🪙</label>
            <input type="number" value={form.cost} onChange={e => set('cost', Number(e.target.value))}
              min={1} style={{ width:'100%', padding:'10px 14px', background:'var(--bg3)',
                border:'1px solid var(--border)', borderRadius:12, color:'var(--text)', fontSize:14, outline:'none' }} />
          </div>
        ) : (
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <div style={{ flex:1 }}>
              <label style={lbl}>TAG</label>
              <select value={form.tag} onChange={e => set('tag', e.target.value)}
                style={sel}>
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={lbl}>DIFFICULTY</label>
              <select value={form.diff} onChange={e => set('diff', e.target.value)}
                style={sel}>
                {DIFFS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}

        {type === 'todo' && (
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <div style={{ flex:1 }}>
              <label style={lbl}>PRIORITY</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} style={sel}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={lbl}>DUE DATE</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
                style={{ ...sel, width:'100%' }} />
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:10, marginTop:20 }}>
          <button onClick={onClose} style={{
            padding:'11px 20px', borderRadius:14, border:'1px solid var(--border)',
            background:'transparent', color:'var(--text3)', fontSize:14, fontWeight:700 }}>
            Cancel
          </button>
          <button onClick={submit} style={{
            flex:1, padding:11, borderRadius:14, border:'none',
            background:'linear-gradient(135deg,var(--purple),var(--pink))',
            color:'#fff', fontSize:14, fontWeight:800,
            boxShadow:'0 4px 15px rgba(124,58,237,0.3)' }}>
            ✨ Add {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        </div>
      </div>
    </div>
  )
}

const lbl = { display:'block', fontSize:11, fontWeight:800, color:'var(--text2)', letterSpacing:'0.08em', marginBottom:6 }
const sel = { width:'100%', padding:'10px 14px', background:'var(--bg3)',
  border:'1px solid var(--border)', borderRadius:12, color:'var(--text)', fontSize:14, outline:'none' }
