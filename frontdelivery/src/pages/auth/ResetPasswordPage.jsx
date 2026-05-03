import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { KeyRound, Eye, EyeOff, Check, X, ShieldCheck, ArrowLeft } from 'lucide-react'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

const RULES = [
  { id: 'len',    label: '8 caractères minimum',    test: v => v.length >= 8 },
  { id: 'upper',  label: 'Une majuscule (A-Z)',       test: v => /[A-Z]/.test(v) },
  { id: 'lower',  label: 'Une minuscule (a-z)',       test: v => /[a-z]/.test(v) },
  { id: 'digit',  label: 'Un chiffre (0-9)',          test: v => /[0-9]/.test(v) },
  { id: 'symbol', label: 'Un symbole (!@#$%^&*...)', test: v => /[^A-Za-z0-9]/.test(v) },
]

function strength(pw) {
  const passed = RULES.filter(r => r.test(pw)).length
  if (passed <= 1) return { score: 1, label: 'Très faible', color: '#ef4444' }
  if (passed === 2) return { score: 2, label: 'Faible',     color: '#f97316' }
  if (passed === 3) return { score: 3, label: 'Moyen',      color: '#eab308' }
  if (passed === 4) return { score: 4, label: 'Fort',       color: '#84cc16' }
  return              { score: 5, label: 'Excellent',       color: '#b7ea4e' }
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const nav = useNavigate()

  const [form, setForm]           = useState({ newPassword: '', confirm: '' })
  const [loading, setLoading]     = useState(false)
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [pwFocus, setPwFocus]     = useState(false)

  const pw       = form.newPassword
  const cf       = form.confirm
  const str      = pw.length > 0 ? strength(pw) : null
  const allRules = RULES.every(r => r.test(pw))
  const matches  = cf.length > 0 && pw === cf
  const mismatch = cf.length > 0 && pw !== cf
  const canSubmit = allRules && matches

  const submit = async (e) => {
    e.preventDefault()
    if (!allRules)  { toast.error('Le mot de passe ne respecte pas les critères'); return }
    if (!matches)   { toast.error('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      await authService.resetPassword({ token, newPassword: pw })
      toast.success('Mot de passe modifié avec succès !')
      nav('/login')
    } catch {
      toast.error('Lien invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  const SHARED_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,800;1,700&family=Jost:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; }

    @keyframes slideUp {
      from { opacity:0; transform:translateY(22px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes ruleIn {
      from { opacity:0; transform:translateX(-6px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes te-pulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%     { opacity:.4; transform:scale(.7); }
    }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes keyFloat {
      0%,100% { transform:translateY(0px) rotate(-8deg); }
      50%     { transform:translateY(-7px) rotate(-8deg); }
    }

    .te-input {
      width:100%; padding:14px 48px 14px 18px;
      border-radius:14px;
      border:1px solid rgba(23,23,20,.12);
      background:#fafaf7;
      font-family:'Jost',sans-serif;
      font-size:.95rem; color:#171714;
      outline:none; transition:all .18s;
    }
    .te-input::placeholder { color:rgba(23,23,20,.28); }
    .te-input:focus {
      border-color:rgba(183,234,78,.7);
      background:#fff;
      box-shadow:0 0 0 4px rgba(183,234,78,.1);
    }
    .te-input.match   { border-color:rgba(183,234,78,.7); background:#fff; }
    .te-input.mismatch{ border-color:rgba(239,68,68,.4); background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.06); }

    .te-btn {
      width:100%; padding:15px;
      border-radius:50px; border:none; cursor:pointer;
      background:#171714; color:#fff;
      font-family:'Jost',sans-serif;
      font-weight:700; font-size:.95rem;
      display:flex; align-items:center; justify-content:center; gap:8px;
      transition:all .2s;
    }
    .te-btn:hover:not(:disabled) {
      background:#2a2a26;
      transform:translateY(-2px);
      box-shadow:0 14px 36px rgba(23,23,20,.18);
    }
    .te-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }

    .te-spinner {
      width:18px; height:18px; border-radius:50%;
      border:2px solid rgba(255,255,255,.25);
      border-top-color:#fff;
      animation:spin .7s linear infinite;
    }

    .te-label {
      font-family:'Jost',sans-serif;
      font-size:.75rem; font-weight:700;
      color:rgba(23,23,20,.45);
      letter-spacing:.05em; text-transform:uppercase;
      display:block; margin-bottom:8px;
    }

    .te-eye {
      position:absolute; right:14px; top:50%; transform:translateY(-50%);
      background:none; border:none; cursor:pointer; padding:4px;
      color:rgba(23,23,20,.35); transition:color .15s; display:flex;
    }
    .te-eye:hover { color:rgba(23,23,20,.7); }

    .te-rule {
      display:flex; align-items:center; gap:8px;
      font-size:.82rem; font-family:'Jost',sans-serif;
      animation:ruleIn .2s ease both;
      transition:color .2s;
    }
    .te-rule-icon {
      width:18px; height:18px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; transition:all .2s;
    }
    .te-bar-seg {
      height:4px; border-radius:4px; flex:1;
      transition:background .3s;
    }
    .te-back {
      display:inline-flex; align-items:center; gap:6px;
      color:rgba(23,23,20,.45); font-size:.88rem; font-weight:600;
      font-family:'Jost',sans-serif; text-decoration:none;
      transition:color .18s; padding:8px 0;
    }
    .te-back:hover { color:#171714; }
  `

  if (!token) return (
    <>
      <style>{SHARED_STYLES}</style>
      <div style={{ minHeight:'100vh', display:'flex', background:'#fafaf7', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'rgba(239,68,68,.04)', filter:'blur(90px)', top:-150, right:-150, pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(23,23,20,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(23,23,20,.025) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 20px', position:'relative', zIndex:2 }}>
          <div style={{ width:'100%', maxWidth:460, animation:'slideUp .4s cubic-bezier(.22,1,.36,1) both', textAlign:'center' }}>
            <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:36 }}>
              <img src={logo} alt="TrackEat" style={{ height:60 }} />
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'1.9rem', fontStyle:'italic', letterSpacing:'.15em', textTransform:'uppercase', color:'#171714', lineHeight:1 }}>TrackEat</span>
            </Link>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
              <X size={32} color="#ef4444" strokeWidth={1.8} />
            </div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:800, fontSize:'2.4rem', color:'#171714', margin:'0 0 12px' }}>Lien invalide</h1>
            <p style={{ color:'rgba(23,23,20,.45)', fontSize:'.95rem', fontWeight:300, lineHeight:1.7, marginBottom:32 }}>
              Ce lien de réinitialisation est invalide ou a expiré.<br />Veuillez en demander un nouveau.
            </p>
            <Link to="/forgot-password" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:50, background:'#171714', color:'#fff', fontFamily:"'Jost',sans-serif", fontWeight:700, fontSize:'.93rem', textDecoration:'none' }}>
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{SHARED_STYLES}</style>

      <div style={{ minHeight:'100vh', display:'flex', background:'#fafaf7', fontFamily:"'Jost',sans-serif", position:'relative', overflow:'hidden' }}>
        {/* blobs */}
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'rgba(183,234,78,.06)', filter:'blur(90px)', top:-150, right:-150, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:'rgba(99,102,241,.05)', filter:'blur(80px)', bottom:-100, left:-100, pointerEvents:'none' }} />
        {/* grid texture */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(23,23,20,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(23,23,20,.025) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 20px', position:'relative', zIndex:2 }}>
          <div style={{ width:'100%', maxWidth:500, animation:'slideUp .4s cubic-bezier(.22,1,.36,1) both' }}>

            {/* Logo */}
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:26 }}>
                <img src={logo} alt="TrackEat" style={{ height:60 }} />
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'1.9rem', fontStyle:'italic', letterSpacing:'.15em', textTransform:'uppercase', color:'#171714', lineHeight:1 }}>
                  TrackEat
                </span>
              </Link>

              <div style={{ marginBottom:20 }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(183,234,78,.1)', border:'1px solid rgba(183,234,78,.35)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
                  <KeyRound size={30} color="#4a7a00" strokeWidth={1.6} style={{ animation:'keyFloat 3s ease-in-out infinite' }} />
                </div>
              </div>

              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:800, fontSize:'2.6rem', color:'#171714', lineHeight:1.05, letterSpacing:'-.01em', margin:'0 0 10px' }}>
                Nouveau mot de passe
              </h1>
              <p style={{ color:'rgba(23,23,20,.45)', fontSize:'.95rem', fontWeight:300, margin:0 }}>
                Choisissez un mot de passe fort et sécurisé
              </p>
            </div>

            <div style={{ background:'#fff', border:'1px solid rgba(23,23,20,.08)', borderRadius:28, padding:'42px 40px', boxShadow:'0 12px 56px rgba(23,23,20,.07)' }}>
              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:22 }}>

                <div>
                  <label className="te-label">Nouveau mot de passe</label>
                  <div style={{ position:'relative' }}>
                    <input
                      className="te-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pw}
                      onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                      onFocus={() => setPwFocus(true)}
                      onBlur={() => setPwFocus(false)}
                      required
                    />
                    <button type="button" className="te-eye" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {pw.length > 0 && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ display:'flex', gap:4, marginBottom:6 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="te-bar-seg" style={{ background: str && i <= str.score ? str.color : 'rgba(23,23,20,.08)' }} />
                        ))}
                      </div>
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <span style={{ fontSize:'.75rem', fontWeight:700, color:str?.color, letterSpacing:'.03em' }}>{str?.label}</span>
                      </div>
                    </div>
                  )}

                  {(pwFocus || pw.length > 0) && (
                    <div style={{ marginTop:14, padding:'16px 18px', background:'#fafaf7', borderRadius:14, border:'1px solid rgba(23,23,20,.07)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'9px 16px' }}>
                      {RULES.map((rule, i) => {
                        const ok = rule.test(pw)
                        return (
                          <div key={rule.id} className="te-rule" style={{ color: ok ? '#4a7a00' : 'rgba(23,23,20,.45)', animationDelay:`${i * 0.04}s` }}>
                            <div className="te-rule-icon" style={{ background: ok ? 'rgba(183,234,78,.2)' : 'rgba(23,23,20,.07)' }}>
                              {ok
                                ? <Check size={11} color="#4a7a00" strokeWidth={2.5} />
                                : <X size={11} color="rgba(23,23,20,.3)" strokeWidth={2} />
                              }
                            </div>
                            {rule.label}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Confirmer */}
                <div>
                  <label className="te-label">Confirmer le mot de passe</label>
                  <div style={{ position:'relative' }}>
                    <input
                      className={`te-input${matches ? ' match' : mismatch ? ' mismatch' : ''}`}
                      type={showCf ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={cf}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      required
                    />
                    <button type="button" className="te-eye" onClick={() => setShowCf(v => !v)}>
                      {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {mismatch && (
                    <p style={{ margin:'7px 0 0', fontSize:'.8rem', color:'#ef4444', fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>
                      <X size={12} strokeWidth={2.5} />Les mots de passe ne correspondent pas
                    </p>
                  )}
                  {matches && (
                    <p style={{ margin:'7px 0 0', fontSize:'.8rem', color:'#4a7a00', fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>
                      <Check size={12} strokeWidth={2.5} />Les mots de passe correspondent
                    </p>
                  )}
                </div>

                <button className="te-btn" disabled={loading || !canSubmit} style={{ marginTop:4 }}>
                  {loading
                    ? <div className="te-spinner" />
                    : <><ShieldCheck size={16} />Modifier le mot de passe</>
                  }
                </button>
              </form>

              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'26px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(23,23,20,.07)' }} />
                <span style={{ fontSize:'.78rem', color:'rgba(23,23,20,.3)', fontWeight:500 }}>ou</span>
                <div style={{ flex:1, height:1, background:'rgba(23,23,20,.07)' }} />
              </div>

              <div style={{ textAlign:'center' }}>
                <Link to="/login" className="te-back">
                  <ArrowLeft size={14} /> Retour à la connexion
                </Link>
              </div>
            </div>

            <div style={{ textAlign:'center', marginTop:24 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'.72rem', fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'#4a7a00', background:'rgba(183,234,78,.12)', border:'1px solid rgba(183,234,78,.3)', borderRadius:50, padding:'5px 14px' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#b7ea4e', animation:'te-pulse 2s ease-in-out infinite' }} />
                Livraison en 30 min garantie
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}