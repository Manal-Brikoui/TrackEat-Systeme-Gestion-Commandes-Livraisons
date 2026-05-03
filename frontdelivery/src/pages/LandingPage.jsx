import { useNavigate } from 'react-router-dom'
import {
  Zap, Lock, MapPin, ArrowRight, Rocket,
  Utensils, Clock, Shield, Star, ChevronRight,
  TrendingUp, Award, Users,
} from 'lucide-react'
import logo from '../assets/logo.png'

const FEATURES = [
  {
    icon: Zap,
    title: 'Livraison Express',
    desc: 'Nos livreurs sont toujours proches. Recevez votre commande en moins de 30 minutes.',
    accent: '#b7ea4e',
    num: '01',
  },
  {
    icon: Lock,
    title: 'Paiement Sécurisé',
    desc: 'Paiement en ligne ou en espèces. Vos données sont protégées à chaque transaction.',
    accent: '#6366f1',
    num: '02',
  },
  {
    icon: MapPin,
    title: 'Suivi en Temps Réel',
    desc: "Suivez votre livreur sur la carte, en direct, jusqu'à votre porte.",
    accent: '#f472b6',
    num: '03',
  },
]

const STATS = [
  { num: '500+', label: 'Restaurants', icon: Utensils },
  { num: '30min', label: 'Délai moyen', icon: Clock },
  { num: '50k+', label: 'Clients', icon: Shield },
  { num: '4.9★', label: 'Note moy.', icon: Star },
]

const STEPS = [
  'Choisissez votre restaurant',
  'Commandez en quelques clics',
  'Suivez votre livraison en direct',
  'Régalez-vous !',
]

const LOGOS = ['Burger King', 'Pizza Hut', 'KFC', 'Subway', 'McDo', 'Sushi+']

export default function LandingPage() {
  const nav = useNavigate()

  return (
    <div style={{
      background: '#fafaf7',
      minHeight: '100vh',
      fontFamily: "'Jost', sans-serif",
      overflow: 'hidden',
      color: '#171714',
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes slideUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes floatA    { 0%,100%{transform:translateY(0px) rotate(0deg)} 50%{transform:translateY(-12px) rotate(1deg)} }
        @keyframes floatB    { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes spinSlow  { to{transform:rotate(360deg)} }
        @keyframes spinRev   { to{transform:rotate(-360deg)} }
        @keyframes pulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        @keyframes marquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(183,234,78,.2)} 50%{border-color:rgba(183,234,78,.6)} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }

        .anim-1 { animation: slideUp .7s cubic-bezier(.22,1,.36,1) .1s both; }
        .anim-2 { animation: slideUp .7s cubic-bezier(.22,1,.36,1) .22s both; }
        .anim-3 { animation: slideUp .7s cubic-bezier(.22,1,.36,1) .34s both; }
        .anim-4 { animation: slideUp .7s cubic-bezier(.22,1,.36,1) .46s both; }
        .anim-5 { animation: slideUp .7s cubic-bezier(.22,1,.36,1) .58s both; }
        .anim-right { animation: scaleIn .8s cubic-bezier(.22,1,.36,1) .5s both; }

        .ring-outer { transform-origin: 50% 50%; animation: spinSlow 28s linear infinite; }
        .ring-inner { transform-origin: 50% 50%; animation: spinRev 18s linear infinite; }
        .orb-dots   { transform-origin: 50% 50%; animation: spinSlow 28s linear infinite; }
        .pill-top    { animation: floatA 4.5s ease-in-out infinite; }
        .pill-right  { animation: floatB 5.5s ease-in-out .5s infinite; }
        .pill-bottom { animation: floatA 5s ease-in-out 1s infinite; }
        .pill-left   { animation: floatB 4s ease-in-out 1.5s infinite; }
        .dot-pulse   { animation: pulse 2s ease-in-out infinite; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 28px; border-radius: 50px;
          background: #171714; color: #fff; border: none; cursor: pointer;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .92rem;
          transition: all .2s; letter-spacing: -.01em;
        }
        .btn-primary:hover { background: #2a2a26; transform: translateY(-2px); box-shadow: 0 12px 36px rgba(23,23,20,.2); }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 24px; border-radius: 50px;
          background: transparent; color: #171714;
          border: 1.5px solid rgba(23,23,20,.15); cursor: pointer;
          font-family: 'Jost', sans-serif; font-weight: 600; font-size: .88rem;
          transition: all .2s;
        }
        .btn-ghost:hover { background: rgba(23,23,20,.05); border-color: rgba(23,23,20,.3); transform: translateY(-1px); }

        .btn-nav-login {
          padding: 8px 20px; border-radius: 50px;
          background: transparent; color: rgba(23,23,20,.55);
          border: 1px solid rgba(23,23,20,.12); cursor: pointer;
          font-family: 'Jost', sans-serif; font-weight: 600; font-size: .8rem;
          transition: all .2s;
        }
        .btn-nav-login:hover { border-color: rgba(23,23,20,.3); color: #171714; }

        .btn-nav-cta {
          padding: 9px 22px; border-radius: 50px;
          background: #171714; color: #fff; border: none; cursor: pointer;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .8rem;
          transition: all .2s;
        }
        .btn-nav-cta:hover { background: #2a2a26; box-shadow: 0 6px 20px rgba(23,23,20,.2); }

        .feat-card {
          position: relative; overflow: hidden;
          background: #fff;
          border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px; padding: 32px 26px;
          transition: all .3s;
          cursor: default;
        }
        .feat-card:hover {
          background: #fff;
          border-color: rgba(183,234,78,.5);
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(23,23,20,.08);
        }
        .feat-card::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(183,234,78,.06) 0%, transparent 60%);
          opacity: 0; transition: opacity .3s;
        }
        .feat-card:hover::before { opacity: 1; }

        .step-row { display:flex; align-items:center; gap:16px; padding:14px 0; border-bottom:1px solid rgba(23,23,20,.07); }
        .step-row:last-child { border-bottom: none; }

        .marquee-track { display:flex; gap:0; animation: marquee 22s linear infinite; width:max-content; }
        .marquee-track:hover { animation-play-state: paused; }

        .stat-cell {
          padding: 20px 24px; text-align:center;
          border-right: 1px solid rgba(23,23,20,.08);
          transition: background .2s;
        }
        .stat-cell:last-child { border-right:none; }
        .stat-cell:hover { background: rgba(183,234,78,.08); }

        .shimmer-text {
          background: linear-gradient(90deg, #171714 0%, #4a7a00 35%, #b7ea4e 50%, #4a7a00 65%, #171714 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .noise-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E");
          opacity: .025; mix-blend-mode: overlay;
        }

        .glow-blob {
          position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
        }

        .tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 50px;
          background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.25);
          font-size: .72rem; font-weight: 700; color: #b7ea4e;
          letter-spacing: .08em; text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .feat-grid  { grid-template-columns: 1fr !important; }
          .cta-grid   { grid-template-columns: 1fr !important; }
          .feat-header-grid { grid-template-columns: 1fr !important; }
          .stat-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .hero-right { display: none !important; }
          .nav-pad    { padding: 16px 24px !important; }
          .sec-pad    { padding: 60px 24px !important; }
        }
      `}</style>

   
      <nav className="nav-pad" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 60px',
        borderBottom: '1px solid rgba(23,23,20,.07)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,247,.9)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={logo} alt="TrackEat" style={{ height: 60 }} />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: '1.8rem',
            color: '#171714', letterSpacing: '0.15em', fontStyle: 'italic',
            textTransform: 'uppercase',
          }}>TrackEat</span>
        </div>

        <div />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn-nav-login" onClick={() => nav('/login')}>Connexion</button>
          <button className="btn-nav-cta" onClick={() => nav('/register')}>Commencer</button>
        </div>
      </nav>

  
      <section className="hero-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 85px)',
        position: 'relative', overflow: 'hidden',
      }}>
       
        <div className="glow-blob" style={{ width: 500, height: 500, top: -100, left: -100, background: 'rgba(183,234,78,.07)' }} />
        <div className="glow-blob" style={{ width: 400, height: 400, bottom: -50, right: 300, background: 'rgba(99,102,241,.07)' }} />
        <div className="noise-overlay" />

  
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 64px', position: 'relative', zIndex: 2,
        }}>

      
          <div className="anim-1" style={{ marginBottom: 28 }}>
            <div className="tag">
              <span className="dot-pulse" style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#b7ea4e', display: 'inline-block', flexShrink: 0,
              }} />
              Livraison en 30 min garantie
            </div>
          </div>

          <h1 className="anim-2" style={{
            fontFamily: 'Cormorant Garamond', fontWeight: 800,
            fontSize: 'clamp(4.2rem, 6.5vw, 6.8rem)',
            lineHeight: 1.02, letterSpacing: '-0.01em',
            margin: '0 0 10px',
          }}>
            La faim
          </h1>
          <h1 className="anim-2" style={{
            fontFamily: 'Cormorant Garamond', fontWeight: 800,
            fontSize: 'clamp(4.2rem, 6.5vw, 6.8rem)',
            lineHeight: 1.02, letterSpacing: '-0.01em',
            margin: '0 0 10px',
          }}>
            n'attend pas.
          </h1>
          <h1 className="anim-2 shimmer-text" style={{
            fontFamily: 'Cormorant Garamond', fontWeight: 800,
            fontSize: 'clamp(4.2rem, 6.5vw, 6.8rem)',
            lineHeight: 1.02, letterSpacing: '-0.01em',
            margin: '0 0 30px',
          }}>
            Nous non plus.
          </h1>

          <p className="anim-3" style={{
            color: 'rgba(23,23,20,.5)', fontSize: 'clamp(1.05rem, 1.5vw, 1.2rem)',
            maxWidth: 400, margin: '0 0 40px', lineHeight: 1.8,
            fontWeight: 300,
          }}>
            Les meilleurs restaurants de votre ville, livrés à votre porte en moins de 30 minutes. Rapide, simple, savoureux.
          </p>

     
          <div className="anim-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 56 }}>
            <button className="btn-primary" onClick={() => nav('/login')}>
              Commander maintenant <ArrowRight size={16} />
            </button>
            <button className="btn-ghost" onClick={() => nav('/register')}>
              Créer un compte
            </button>
          </div>

          
          <div className="anim-5 stat-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, auto)',
            background: '#fff',
            border: '1px solid rgba(23,23,20,.08)',
            borderRadius: 18, overflow: 'hidden',
            width: 'fit-content',
            boxShadow: '0 4px 24px rgba(23,23,20,.06)',
          }}>
            {STATS.map(({ num, label, icon: Icon }) => (
              <div key={label} className="stat-cell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond', fontWeight: 800, fontSize: '1.8rem', color: '#171714', lineHeight: 1 }}>{num}</span>
                  <Icon size={12} color="#b7ea4e" style={{ marginTop: 2 }} />
                </div>
                <div style={{ fontSize: '.82rem', color: 'rgba(23,23,20,.35)', marginTop: 4, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-right anim-right" style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          background: '#f2f4ed',
          borderLeft: '1px solid rgba(23,23,20,.06)',
        }}>
        
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(23,23,20,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,20,.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

      
          <div style={{
            position: 'absolute', width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(183,234,78,.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <svg viewBox="0 0 480 480" style={{ width: 'min(460px,88%)', height: 'auto', position: 'relative', zIndex: 2 }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

           
            <g className="ring-outer">
              <circle cx="240" cy="240" r="210" fill="none"
                stroke="rgba(183,234,78,0.25)" strokeWidth="1"
                strokeDasharray="10 6"/>
            </g>

           
            <g className="ring-inner">
              <circle cx="240" cy="240" r="158" fill="none"
                stroke="rgba(23,23,20,0.08)" strokeWidth="1"
                strokeDasharray="20 10"/>
            </g>

            
            <circle cx="240" cy="240" r="108"
              fill="rgba(183,234,78,0.08)"
              stroke="rgba(183,234,78,0.4)"
              strokeWidth="1.5"/>


            <text x="240" y="217" textAnchor="middle"
              fontFamily="Cormorant Garamond" fontWeight="800" fontSize="10"
              fill="rgba(74,122,0,0.6)" letterSpacing="7">TRACK</text>
            <text x="240" y="268" textAnchor="middle"
              fontFamily="Cormorant Garamond" fontWeight="800" fontSize="54"
              fill="#171714" letterSpacing="-2" filter="url(#softGlow)">EAT</text>
            <text x="240" y="289" textAnchor="middle"
              fontFamily="Jost" fontSize="9.5"
              fill="rgba(23,23,20,0.28)" letterSpacing="4">LIVRAISON EXPRESS</text>

            
            <g className="orb-dots">
              <circle cx="240" cy="30" r="6" fill="#b7ea4e" filter="url(#softGlow)"/>
              <circle cx="450" cy="240" r="4.5" fill="#b7ea4e" opacity=".6"/>
              <circle cx="240" cy="450" r="5.5" fill="#b7ea4e" opacity=".45"/>
              <circle cx="30" cy="240" r="4.5" fill="#b7ea4e" opacity=".55"/>
            </g>

         
            <g className="pill-top">
              <rect x="166" y="14" width="148" height="42" rx="21" fill="#ffffff" stroke="rgba(23,23,20,.1)" strokeWidth="1"/>
              <text x="240" y="40" textAnchor="middle" fontFamily="Cormorant Garamond" fontWeight="800" fontSize="13" fill="#171714">4.9 ★  Note moy.</text>
            </g>

       
            <g className="pill-right">
              <rect x="346" y="212" width="128" height="56" rx="28" fill="#171714"/>
              <text x="410" y="234" textAnchor="middle" fontFamily="Cormorant Garamond" fontWeight="800" fontSize="16" fill="#b7ea4e">500+</text>
              <text x="410" y="253" textAnchor="middle" fontFamily="Jost" fontSize="10" fill="rgba(255,255,255,.45)">Restaurants</text>
            </g>

            
            <g className="pill-bottom">
              <rect x="166" y="424" width="148" height="42" rx="21" fill="#b7ea4e"/>
              <text x="240" y="450" textAnchor="middle" fontFamily="Cormorant Garamond" fontWeight="800" fontSize="13" fill="#171714">30 min garanti</text>
            </g>

          
            <g className="pill-left">
              <rect x="6" y="212" width="128" height="56" rx="28" fill="#ffffff" stroke="rgba(23,23,20,.1)" strokeWidth="1"/>
              <text x="70" y="234" textAnchor="middle" fontFamily="Cormorant Garamond" fontWeight="800" fontSize="16" fill="#171714">50k+</text>
              <text x="70" y="253" textAnchor="middle" fontFamily="Jost" fontSize="10" fill="rgba(23,23,20,.38)">Clients satisfaits</text>
            </g>
          </svg>

          {[[10,10],[10,'auto'],[''  ,10],[''  ,'auto']].map((_,i) => (
            <div key={i} style={{
              position:'absolute', width:5, height:5, borderRadius:'50%',
              background:'rgba(183,234,78,.4)',
              top: i<2 ? 10 : 'auto', bottom: i>=2 ? 10 : 'auto',
              left: i%2===0 ? 10 : 'auto', right: i%2===1 ? 10 : 'auto',
            }}/>
          ))}
        </div>
      </section>

     
      <div style={{
        borderTop: '1px solid rgba(23,23,20,.07)',
        borderBottom: '1px solid rgba(23,23,20,.07)',
        padding: '20px 0',
        overflow: 'hidden',
        background: '#f5f5f0',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            <div className="marquee-track">
              {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((name, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0 36px',
                  borderRight: '1px solid rgba(23,23,20,.07)',
                  whiteSpace: 'nowrap',
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: i % 2 === 0 ? 'rgba(183,234,78,.7)' : 'rgba(23,23,20,.15)',
                  }} />
                  <span style={{ fontFamily: 'Cormorant Garamond', fontWeight: 700, fontSize: '.92rem', color: 'rgba(23,23,20,.3)', letterSpacing: '.05em' }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      <section className="sec-pad" style={{ padding: '100px 60px', position: 'relative', overflow: 'hidden', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section header */}
          <div className="feat-header-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 64, alignItems: 'end' }}>
            <div>
              <div className="tag" style={{ marginBottom: 18 }}>Pourquoi TrackEat ?</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond', fontWeight: 800, fontSize: 'clamp(2.8rem, 4vw, 4.4rem)', letterSpacing: '0.01em', lineHeight: 1.05, color: '#171714' }}>
                Une expérience<br />pensée pour vous
              </h2>
            </div>
            <p style={{ color: 'rgba(23,23,20,.45)', fontSize: '1.1rem', lineHeight: 1.8, fontWeight: 300 }}>
              De A à Z, chaque détail est soigné pour que vous profitiez de votre repas, pas de votre attente. Technologie de pointe, service humain.
            </p>
          </div>

          <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, desc, accent, num }) => (
              <div key={title} className="feat-card">
       
                <div style={{
                  fontFamily: 'Cormorant Garamond', fontWeight: 800, fontSize: '4.5rem',
                  color: 'rgba(23,23,20,.04)', lineHeight: 1,
                  position: 'absolute', top: 20, right: 24, letterSpacing: '-0.04em',
                  userSelect: 'none',
                }}>{num}</div>

                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${accent}18`,
                  border: `1px solid ${accent}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 22,
                }}>
                  <Icon size={22} color={accent} strokeWidth={1.8} />
                </div>

                <h3 style={{ fontFamily: 'Cormorant Garamond', fontWeight: 700, fontSize: '1.2rem', color: '#171714', marginBottom: 12, letterSpacing: '-.01em' }}>{title}</h3>
                <p style={{ fontSize: '.97rem', color: 'rgba(23,23,20,.45)', lineHeight: 1.7 }}>{desc}</p>

                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6, color: accent === '#b7ea4e' ? '#4a7a00' : accent, fontSize: '.9rem', fontWeight: 700, letterSpacing: '.03em' }}>
                  En savoir plus <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    
      <div style={{
        borderTop: '1px solid rgba(23,23,20,.07)',
        borderBottom: '1px solid rgba(23,23,20,.07)',
        padding: '40px 60px',
        display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap',
        background: '#fafaf7',
      }}>
        {[
          { icon: TrendingUp, val: '+40%', label: 'de croissance en 2024' },
          { icon: Award, val: '#1', label: 'App livraison Maroc' },
          { icon: Users, val: '50 000+', label: 'commandes par mois' },
        ].map(({ icon: Icon, val, label }) => (
          <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(183,234,78,.2)', border: '1px solid rgba(183,234,78,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color="#4a7a00" strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 800, fontSize: '1.3rem', color: '#171714', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '.88rem', color: 'rgba(23,23,20,.4)', marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="sec-pad" style={{ padding: '100px 60px', position: 'relative', overflow: 'hidden', background: '#fff' }}>
        <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, maxWidth: 1100, margin: '0 auto', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            <div className="tag" style={{ marginBottom: 20 }}>Rejoignez-nous</div>
            <h3 style={{
              fontFamily: 'Cormorant Garamond', fontWeight: 800,
              fontSize: 'clamp(2rem, 3.2vw, 3.2rem)',
              letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20, color: '#171714',
            }}>
              Prêt à<br />
              <span className="shimmer-text">commander ?</span>
            </h3>
            <p style={{ color: 'rgba(23,23,20,.45)', fontSize: '1.05rem', marginBottom: 36, lineHeight: 1.8, maxWidth: 380, fontWeight: 300 }}>
              Rejoignez des milliers de clients satisfaits. Inscription gratuite, livraison rapide garantie en 30 minutes.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => nav('/login')}>
                Voir les restaurants <ArrowRight size={15} />
              </button>
              <button className="btn-ghost" onClick={() => nav('/register')}>
                S'inscrire gratuitement
              </button>
            </div>
          </div>

    
          <div style={{
            borderRadius: 28, padding: '40px 36px',
            background: '#f5f5f0',
            border: '1px solid rgba(23,23,20,.08)',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(23,23,20,.06)',
          }}>
          
            <div style={{
              position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(183,234,78,.2) 0%, transparent 65%)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
              <div style={{ width: 52, height: 52, background: '#b7ea4e', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Rocket size={24} color="#171714" strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond', fontWeight: 800, fontSize: '1.15rem', color: '#171714' }}>Inscription en 30 secondes</div>
                <div style={{ fontSize: '.9rem', color: 'rgba(23,23,20,.4)', marginTop: 3 }}>Simple, rapide, sans engagement</div>
              </div>
            </div>

            {STEPS.map((step, i) => (
              <div key={i} className="step-row">
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === 3 ? '#b7ea4e' : 'rgba(183,234,78,.15)',
                  border: i === 3 ? 'none' : '1px solid rgba(183,234,78,.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'Cormorant Garamond', fontWeight: 800, fontSize: '.75rem', color: i === 3 ? '#171714' : '#4a7a00' }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: '1rem', color: i === 3 ? '#171714' : 'rgba(23,23,20,.5)', fontWeight: i === 3 ? 600 : 400 }}>{step}</span>
                {i === 3 && <span style={{ marginLeft: 'auto', fontSize: '.82rem', background: 'rgba(183,234,78,.2)', color: '#4a7a00', padding: '3px 10px', borderRadius: 50, fontWeight: 700 }}>🎉</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{
        borderTop: '1px solid rgba(23,23,20,.07)',
        padding: '32px 60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
        background: '#fafaf7',
      }}>
        <img src={logo} alt="TrackEat" style={{ height: 36, opacity: .8 }} />
        <div style={{ display: 'flex', gap: 24 }}>
          {['Confidentialité', 'Conditions', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: '.9rem', color: 'rgba(23,23,20,.35)', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = 'rgba(23,23,20,.7)'}
              onMouseLeave={e => e.target.style.color = 'rgba(23,23,20,.35)'}
            >{l}</span>
          ))}
        </div>
        <span style={{ fontSize: '.88rem', color: 'rgba(23,23,20,.22)' }}>© 2025 TrackEat. Tous droits réservés.</span>
      </footer>

    </div>
  )
}