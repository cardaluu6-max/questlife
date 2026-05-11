export default function CharPanel({ user }) {
  if (!user) return null
  const hpPct = Math.min(100, (user.hp / user.maxHp) * 100)
  const mpPct = Math.min(100, (user.mp / user.maxMp) * 100)
  const xpPct = Math.min(100, (user.xp / user.xpNeeded) * 100)

  return (
    <aside style={{ width:'min(240px, 100%)', flexShrink:0, display:'flex', flexDirection:'column', gap:14 }}>

      {/* Character card */}
      <div style={card}>
        <div style={{ position:'relative', display:'inline-block', marginBottom:12 }}>
          <div style={{
            width:76, height:76, borderRadius:'50%', margin:'0 auto',
            background:'linear-gradient(135deg,#2D1B69,#4C1D95)',
            border:'3px solid var(--purple)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:34, boxShadow:'0 0 24px rgba(124,58,237,0.4)',
          }}>{user.avatar}</div>
          <div style={{
            position:'absolute', bottom:-4, right:-4,
            width:24, height:24, borderRadius:'50%',
            background:'linear-gradient(135deg,var(--yellow),var(--orange))',
            border:'2px solid var(--bg)', display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff',
          }}>{user.level}</div>
        </div>

        <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:18, fontWeight:600,
          color:'var(--text)', marginBottom:2 }}>{user.username}</div>
        <div style={{ fontSize:11, color:'var(--purple3)', letterSpacing:'0.08em',
          fontWeight:700, marginBottom:16 }}>{user.charClass?.toUpperCase()}</div>

        <StatBar label="❤️ HP" val={user.hp} max={user.maxHp} pct={hpPct}
          fill="linear-gradient(90deg,#EF4444,#F87171)" color="#FCA5A5" />
        <StatBar label="💙 MP" val={user.mp} max={user.maxMp} pct={mpPct}
          fill="linear-gradient(90deg,#3B82F6,#60A5FA)" color="#93C5FD" />
        <StatBar label="⭐ XP" val={user.xp} max={user.xpNeeded} pct={xpPct}
          fill="linear-gradient(90deg,var(--yellow),var(--yellow2))" color="var(--yellow2)" />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
          {[['STR',user.str,'#FCA5A5'],['INT',user.int,'#93C5FD'],['CON',user.con,'var(--green2)'],['PER',user.per,'var(--yellow2)']].map(([k,v,c]) => (
            <div key={k} style={{ background:'var(--bg3)', border:'1px solid var(--border)',
              borderRadius:10, padding:8, textAlign:'center' }}>
              <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:18, fontWeight:600, color:c }}>{v}</div>
              <div style={{ fontSize:9, color:'var(--text3)', letterSpacing:'0.1em', fontWeight:700 }}>{k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak */}
      <div style={{ background:'linear-gradient(135deg,#2D1505,#3D1A08)',
        border:'1px solid #7C3A00', borderRadius:16, padding:14,
        display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:32, animation:'float 2s ease-in-out infinite' }}>🔥</div>
        <div>
          <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:28, fontWeight:700,
            color:'var(--orange)', lineHeight:1 }}>{user.streak ?? 0}</div>
          <div style={{ fontSize:11, color:'#F97316', fontWeight:700 }}>DAY STREAK</div>
          <div style={{ fontSize:10, color:'#7C3A00', marginTop:2 }}>Keep it up!</div>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <MiniStat val={`🪙 ${user.gold}`}   lbl="GOLD"   color="var(--yellow2)" />
        <MiniStat val={`💎 ${user.gems}`}   lbl="GEMS"   color="var(--cyan2)" />
      </div>
    </aside>
  )
}

function StatBar({ label, val, max, pct, fill, color }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:11, fontWeight:700 }}>
        <span style={{ color }}>{label}</span>
        <span style={{ color:'var(--text3)', fontSize:10 }}>{val}/{max}</span>
      </div>
      <div style={{ height:8, borderRadius:4, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:4, background:fill, width:`${pct}%`,
          transition:'width 0.6s cubic-bezier(0.16,1,0.3,1)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0,
            background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)',
            animation:'shimmer 2s infinite' }} />
        </div>
      </div>
    </div>
  )
}

function MiniStat({ val, lbl, color }) {
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)',
      borderRadius:12, padding:12, textAlign:'center' }}>
      <div style={{ fontFamily:"'Fredoka',sans-serif", fontSize:18, fontWeight:600,
        color, marginBottom:2 }}>{val}</div>
      <div style={{ fontSize:10, color:'var(--text3)', fontWeight:700, letterSpacing:'0.06em' }}>{lbl}</div>
    </div>
  )
}

const card = {
  background:'var(--card)', border:'1px solid var(--border)',
  borderRadius:20, padding:20, textAlign:'center',
}
