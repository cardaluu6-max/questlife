import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api'

const AVATARS = ['🧙','⚔️','🏹','🛡️','🔮','🧝','🦸','🧚','👨‍💻','🧬']
const CLASSES = ['Scholar Mage','Warrior','Rogue','Healer','Mage','Ranger']

export default function AuthPage() {
  const { signIn } = useAuth()
  const [mode, setMode]     = useState('login')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm]     = useState({
    username: '', email: '', password: '',
    avatar: '🧙', charClass: 'Scholar Mage',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const fn   = mode === 'login' ? login : register
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form
      const res  = await fn(payload)
      signIn(res.data.token, res.data.user)
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      position:'relative', zIndex:1, padding:20,
    }}>
      <div style={{
        background:'var(--bg2)', border:'1px solid var(--border2)',
        borderRadius:24, padding:36, width:420, maxWidth:'100%',
        animation:'popIn 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{
            width:56, height:56, borderRadius:16, margin:'0 auto 12px',
            background:'linear-gradient(135deg,var(--purple),var(--pink))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26, boxShadow:'0 8px 24px rgba(124,58,237,0.4)',
            animation:'float 3s ease-in-out infinite',
          }}>⚔️</div>
          <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:28, fontWeight:700,
            background:'linear-gradient(135deg,var(--purple3),var(--pink2))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            QuestLife
          </div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>
            {mode === 'login' ? 'Continue your adventure' : 'Begin your quest'}
          </div>
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:10, padding:'10px 14px', fontSize:13, color:'#FCA5A5', marginBottom:16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Avatar picker (register only) */}
        {mode === 'register' && (
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>CHOOSE AVATAR</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => set('avatar', a)} style={{
                  width:38, height:38, borderRadius:10, border:'2px solid',
                  borderColor: form.avatar === a ? 'var(--purple)' : 'var(--border)',
                  background: form.avatar === a ? 'rgba(124,58,237,0.2)' : 'var(--bg3)',
                  fontSize:20, cursor:'pointer', transition:'all 0.15s',
                }}>{a}</button>
              ))}
            </div>
          </div>
        )}

        {mode === 'register' && (
          <Field label="USERNAME" value={form.username} onChange={v => set('username', v)} placeholder="YourHeroName" />
        )}
        <Field label="EMAIL" type="email" value={form.email} onChange={v => set('email', v)} placeholder="hero@quest.com" />
        <Field label="PASSWORD" type="password" value={form.password} onChange={v => set('password', v)} placeholder="••••••••" />

        {mode === 'register' && (
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>CLASS</label>
            <select value={form.charClass} onChange={e => set('charClass', e.target.value)}
              style={{ width:'100%', padding:'10px 14px', background:'var(--bg3)',
                border:'1px solid var(--border)', borderRadius:12, color:'var(--text)', fontSize:14, outline:'none' }}>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        <button onClick={submit} disabled={loading} style={{
          width:'100%', padding:12, borderRadius:14, border:'none',
          background:'linear-gradient(135deg,var(--purple),var(--pink))',
          color:'#fff', fontSize:15, fontWeight:800,
          boxShadow:'0 4px 20px rgba(124,58,237,0.4)',
          opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
          marginTop:4, transition:'all 0.2s',
        }}>
          {loading ? '⏳ Loading...' : mode === 'login' ? '⚔️ Enter the Quest' : '✨ Create Hero'}
        </button>

        <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--text3)' }}>
          {mode === 'login' ? "No account? " : "Have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background:'none', border:'none', color:'var(--purple3)', fontWeight:700, cursor:'pointer' }}>
            {mode === 'login' ? 'Create Hero' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

const lbl = { display:'block', fontSize:11, fontWeight:800, color:'var(--text2)',
  letterSpacing:'0.08em', marginBottom:6 }

function Field({ label, type='text', value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width:'100%', padding:'10px 14px', background:'var(--bg3)',
          border:'1px solid var(--border)', borderRadius:12, color:'var(--text)',
          fontSize:14, outline:'none', transition:'border 0.2s' }}
        onFocus={e => e.target.style.borderColor='var(--purple)'}
        onBlur={e => e.target.style.borderColor='var(--border)'}
      />
    </div>
  )
}
