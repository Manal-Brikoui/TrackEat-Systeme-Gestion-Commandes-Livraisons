import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

const RULES = [
  { id: 'len',    label: '8 caractères minimum',    test: v => v.length >= 8 },
  { id: 'upper',  label: 'Une majuscule (A-Z)',       test: v => /[A-Z]/.test(v) },
  { id: 'lower',  label: 'Une minuscule (a-z)',       test: v => /[a-z]/.test(v) },
  { id: 'digit',  label: 'Un chiffre (0-9)',          test: v => /[0-9]/.test(v) },
  { id: 'symbol', label: 'Un symbole (!@#$%^&*…)',   test: v => /[^A-Za-z0-9]/.test(v) },
]

function strength(pw) {
  const passed = RULES.filter(r => r.test(pw)).length
  if (passed <= 1) return { score: 1, label: 'Très faible', color: '#ef4444' }
  if (passed === 2) return { score: 2, label: 'Faible',     color: '#f97316' }
  if (passed === 3) return { score: 3, label: 'Moyen',      color: '#eab308' }
  if (passed === 4) return { score: 4, label: 'Fort',       color: '#84cc16' }
  return               { score: 5, label: 'Excellent',      color: '#b7ea4e' }
}

function roleHome(role) {
  switch (role) {
    case 'ADMIN':            return '/admin'
    case 'DRIVER':           return '/driver'
    case 'RESTAURANT_ADMIN': return '/restaurant-admin'
    default:                 return '/restaurants'
  }
}

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [pwFocus, setPwFocus] = useState(false)
  const { setAuth } = useAuthStore()
  const nav = useNavigate()

  const pw  = form.password
  const str = pw.length > 0 ? strength(pw) : null

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res   = await authService.login(form)
      const token = res.token
      if (!token) throw new Error('Token manquant')
      const user = {
        id:       res.id,
        email:    res.email,
        fullName: res.fullName,
        phone:    res.phone,
        role:     res.role,
      }
      setAuth(user, token)
      toast.success('Connexion réussie')
      nav(roleHome(res.role))
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Identifiants incorrects'
      toast.error(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,800;1,700&family=Jost:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes slideUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ruleIn  { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        @keyframes te-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(.7); } }
        @keyframes spin { to { transform:rotate(360deg); } }

        .te-input {
          width:100%; padding:14px 18px; border-radius:14px;
          border:1px solid rgba(23,23,20,.12); background:#fafaf7;
          font-family:'Jost',sans-serif; font-size:.95rem; color:#171714;
          outline:none; transition:all .18s;
        }
        .te-input::placeholder { color:rgba(23,23,20,.28); }
        .te-input:focus { border-color:rgba(183,234,78,.7); background:#fff; box-shadow:0 0 0 4px rgba(183,234,78,.1); }
        .te-input-pw { padding-right:48px; }

        .te-btn {
          width:100%; padding:15px; border-radius:50px; border:none; cursor:pointer;
          background:#171714; color:#fff; font-family:'Jost',sans-serif;
          font-weight:700; font-size:.95rem;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all .2s; margin-top:6px;
        }
        .te-btn:hover:not(:disabled) { background:#2a2a26; transform:translateY(-2px); box-shadow:0 14px 36px rgba(23,23,20,.18); }
        .te-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }

        .te-spinner {
          width:18px; height:18px; border-radius:50%;
          border:2px solid rgba(255,255,255,.25); border-top-color:#fff;
          animation:spin .7s linear infinite;
        }
        .te-label {
          font-family:'Jost',sans-serif; font-size:.75rem; font-weight:700;
          color:rgba(23,23,20,.45); letter-spacing:.05em; text-transform:uppercase;
          display:block; margin-bottom:8px;
        }
        .te-eye {
          position:absolute; right:14px; top:50%; transform:translateY(-50%);
          background:none; border:none; cursor:pointer; padding:4px;
          color:rgba(23,23,20,.35); transition:color .15s; display:flex;
        }
        .te-eye:hover { color:rgba(23,23,20,.7); }
        .te-rule {
          display:flex; align-items:center; gap:8px; font-size:.82rem;
          font-family:'Jost',sans-serif; animation:ruleIn .2s ease both; transition:color .2s;
        }
        .te-rule-icon {
          width:18px; height:18px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:all .2s;
        }
        .te-bar-seg { height:4px; border-radius:4px; flex:1; transition:background .3s; }
      `}</style>

      <div style={{ minHeight:'100vh', display:'flex', background:'#fafaf7', fontFamily:"'Jost',sans-serif", position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'rgba(183,234,78,.06)', filter:'blur(90px)', top:-150, right:-150, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:'rgba(99,102,241,.05)', filter:'blur(80px)', bottom:-100, left:-100, pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(23,23,20,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(23,23,20,.025) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 20px', position:'relative', zIndex:2 }}>
          <div style={{ width:'100%', maxWidth:500, animation:'slideUp .4s cubic-bezier(.22,1,.36,1) both' }}>

            <div style={{ textAlign:'center', marginBottom:36 }}>
              <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:26 }}>
                <img src={logo} alt="TrackEat" style={{ height:60 }} />
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'1.9rem', fontStyle:'italic', letterSpacing:'.15em', textTransform:'uppercase', color:'#171714', lineHeight:1 }}>
                  TrackEat
                </span>
              </Link>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:800, fontSize:'2.6rem', color:'#171714', lineHeight:1.05, letterSpacing:'-.01em', margin:'0 0 10px' }}>
                Bon retour
              </h1>
              <p style={{ color:'rgba(23,23,20,.45)', fontSize:'.95rem', fontWeight:300, margin:0 }}>
                Connectez-vous à votre compte
              </p>
            </div>

            <div style={{ background:'#fff', border:'1px solid rgba(23,23,20,.08)', borderRadius:28, padding:'42px 40px', boxShadow:'0 12px 56px rgba(23,23,20,.07)' }}>
              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:22 }}>

                <div>
                  <label className="te-label">Email</label>
                  <input
                    className="te-input"
                    type="email"
                    placeholder="vous@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="te-label">Mot de passe</label>
                  <div style={{ position:'relative' }}>
                    <input
                      className="te-input te-input-pw"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pw}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
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
                    <div style={{ marginTop:14, padding:'16px 18px', background:'#fafaf7', borderRadius:14, border:'1px solid rgba(23,23,20,.07)', display:'flex', flexDirection:'column', gap:9 }}>
                      {RULES.map((rule, i) => {
                        const ok = rule.test(pw)
                        return (
                          <div key={rule.id} className="te-rule" style={{ color: ok ? '#4a7a00' : 'rgba(23,23,20,.45)', animationDelay:`${i * 0.04}s` }}>
                            <div className="te-rule-icon" style={{ background: ok ? 'rgba(183,234,78,.2)' : 'rgba(23,23,20,.07)' }}>
                              {ok ? <Check size={11} color="#4a7a00" strokeWidth={2.5} /> : <X size={11} color="rgba(23,23,20,.3)" strokeWidth={2} />}
                            </div>
                            {rule.label}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div style={{ textAlign:'right', marginTop:10 }}>
                    <Link to="/forgot-password" style={{ color:'#4a7a00', fontSize:'.8rem', fontWeight:600, textDecoration:'none' }}>
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </div>

                <button className="te-btn" disabled={loading}>
                  {loading ? <div className="te-spinner" /> : <><LogIn size={16} />Se connecter</>}
                </button>
              </form>

              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'26px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(23,23,20,.07)' }} />
                <span style={{ fontSize:'.78rem', color:'rgba(23,23,20,.3)', fontWeight:500 }}>ou</span>
                <div style={{ flex:1, height:1, background:'rgba(23,23,20,.07)' }} />
              </div>

              <div style={{ textAlign:'center', color:'rgba(23,23,20,.5)', fontSize:'.9rem' }}>
                Pas de compte ?{' '}
                <Link to="/register" style={{ color:'#171714', fontWeight:700, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4 }}>
                  S'inscrire gratuitement <ArrowRight size={13} />
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