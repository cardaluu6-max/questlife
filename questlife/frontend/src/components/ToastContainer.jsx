export default function ToastContainer({ toasts, onRemove }) {
  const icons = { xp:'⭐', levelup:'🌟', damage:'💔', info:'💬', gold:'🪙' }
  const borders = {
    xp:'rgba(245,158,11,0.5)', levelup:'rgba(124,58,237,0.6)',
    damage:'rgba(239,68,68,0.5)', info:'rgba(6,182,212,0.4)', gold:'rgba(245,158,11,0.4)'
  }
  const bgs = {
    xp:'rgba(30,20,10,0.97)', levelup:'rgba(20,10,40,0.97)',
    damage:'rgba(30,10,10,0.97)', info:'rgba(10,20,30,0.97)', gold:'rgba(30,20,10,0.97)'
  }

  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:300,
      display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onRemove(t.id)}
          style={{
            background: bgs[t.type] || bgs.info,
            border: `1px solid ${borders[t.type] || borders.info}`,
            borderRadius:16, padding:'12px 18px',
            display:'flex', alignItems:'center', gap:10,
            boxShadow:'0 8px 30px rgba(0,0,0,0.5)',
            animation:'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)',
            maxWidth:300, cursor:'pointer',
          }}>
          <span style={{ fontSize:22 }}>{icons[t.type] || '✨'}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:'var(--text)' }}>{t.title}</div>
            {t.sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
