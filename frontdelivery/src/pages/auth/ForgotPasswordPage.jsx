import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('Email envoyé !')
    } catch { toast.error('Email introuvable') }
    finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,800;1,700&family=Jost:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes slideUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes successPop {
          0%   { opacity:0; transform:scale(.8); }
          60%  { transform:scale(1.06); }
          100% { opacity:1; transform:scale(1); }
        }
        @keyframes te-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.4; transform:scale(.7); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes mailFloat {
          0%,100% { transform:translateY(0px); }
          50%     { transform:translateY(-6px); }
        }

        .te-input {
          width:100%; padding:14px 18px;
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

        .te-back {
          display:inline-flex; align-items:center; gap:6px;
          color:rgba(23,23,20,.45); font-size:.88rem; font-weight:600;
          font-family:'Jost',sans-serif; text-decoration:none;
          transition:color .18s; padding:8px 0;
        }
        .te-back:hover { color:#171714; }

        .success-icon {
          animation: successPop .5s cubic-bezier(.22,1,.36,1) both;
        }
        .mail-float {
          animation: mailFloat 3s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        minHeight:'100vh', display:'flex',
        background:'#fafaf7', fontFamily:"'Jost',sans-serif",
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'rgba(183,234,78,.06)', filter:'blur(90px)', top:-150, right:-150, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:450, height:450, borderRadius:'50%', background:'rgba(99,102,241,.05)', filter:'blur(80px)', bottom:-100, left:-100, pointerEvents:'none' }} />
        {/* grid texture */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(23,23,20,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(23,23,20,.025) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />

        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 20px', position:'relative', zIndex:2 }}>
          <div style={{ width:'100%', maxWidth:460, animation:'slideUp .4s cubic-bezier(.22,1,.36,1) both' }}>

            <div style={{ textAlign:'center', marginBottom:36 }}>
              <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:26 }}>
                <img src={logo} alt="TrackEat" style={{ height:60 }} />
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:'1.9rem', fontStyle:'italic', letterSpacing:'.15em', textTransform:'uppercase', color:'#171714', lineHeight:1 }}>
                  TrackEat
                </span>
              </Link>

              <div style={{ marginBottom:20 }}>
                {sent ? (
                  <div className="success-icon" style={{ width:72, height:72, borderRadius:'50%', background:'rgba(183,234,78,.15)', border:'1px solid rgba(183,234,78,.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
                    <CheckCircle size={34} color="#4a7a00" strokeWidth={1.8} />
                  </div>
                ) : (
                  <div className="mail-float" style={{ width:72, height:72, borderRadius:'50%', background:'rgba(23,23,20,.04)', border:'1px solid rgba(23,23,20,.1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
                    <Mail size={30} color="rgba(23,23,20,.5)" strokeWidth={1.6} />
                  </div>
                )}
              </div>

              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:800, fontSize:'2.6rem', color:'#171714', lineHeight:1.05, letterSpacing:'-.01em', margin:'0 0 10px' }}>
                {sent ? 'Email envoyé !' : 'Mot de passe oublié'}
              </h1>
              <p style={{ color:'rgba(23,23,20,.45)', fontSize:'.95rem', fontWeight:300, margin:0, maxWidth:340, marginInline:'auto', lineHeight:1.7 }}>
                {sent
                  ? <>Vérifiez votre boîte mail.<br />Un lien de réinitialisation vous a été envoyé à <strong style={{ color:'#171714', fontWeight:600 }}>{email}</strong>.</>
                  : "Saisissez votre email pour recevoir un lien de réinitialisation de mot de passe."
                }
              </p>
            </div>

            <div style={{ background:'#fff', border:'1px solid rgba(23,23,20,.08)', borderRadius:28, padding:'42px 40px', boxShadow:'0 12px 56px rgba(23,23,20,.07)' }}>

              {!sent ? (
                <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:22 }}>
                  <div>
                    <label className="te-label">Adresse email</label>
                    <div style={{ position:'relative' }}>
                      <input
                        className="te-input"
                        style={{ paddingLeft:46 }}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="vous@example.com"
                        required
                      />
                      <Mail size={16} color="rgba(23,23,20,.3)" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                    </div>
                  </div>

                  <button className="te-btn" disabled={loading}>
                    {loading
                      ? <div className="te-spinner" />
                      : <><Send size={15} />Envoyer le lien</>
                    }
                  </button>
                </form>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {/* Étapes */}
                  {[
                    { num:'1', text:'Ouvrez votre boîte mail' },
                    { num:'2', text:'Cliquez sur le lien reçu' },
                    { num:'3', text:'Créez un nouveau mot de passe' },
                  ].map(({ num, text }) => (
                    <div key={num} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'#fafaf7', borderRadius:14, border:'1px solid rgba(23,23,20,.07)' }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(183,234,78,.2)', border:'1px solid rgba(183,234,78,.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:800, fontSize:'.85rem', color:'#4a7a00' }}>{num}</span>
                      </div>
                      <span style={{ fontSize:'.93rem', color:'rgba(23,23,20,.6)', fontWeight:400 }}>{text}</span>
                    </div>
                  ))}

                  {/* Renvoyer */}
                  <div style={{ textAlign:'center', paddingTop:8 }}>
                    <span style={{ fontSize:'.85rem', color:'rgba(23,23,20,.4)' }}>Pas reçu ? </span>
                    <button
                      onClick={submit}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#4a7a00', fontWeight:700, fontSize:'.85rem', fontFamily:"'Jost',sans-serif", padding:0 }}
                    >
                      Renvoyer l'email
                    </button>
                  </div>
                </div>
              )}

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