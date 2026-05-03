import { useEffect, useState } from 'react'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

  @keyframes ld-spin    { to { transform: rotate(360deg) } }
  @keyframes ld-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.65)} }
  @keyframes ld-shimmer { from{background-position:0 center} to{background-position:200% center} }
  @keyframes ld-fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ld-orbit   {
    0%   { transform: rotate(0deg)   translateX(18px) rotate(0deg) }
    100% { transform: rotate(360deg) translateX(18px) rotate(-360deg) }
  }
  @keyframes ld-orbit2  {
    0%   { transform: rotate(180deg) translateX(18px) rotate(-180deg) }
    100% { transform: rotate(540deg) translateX(18px) rotate(-540deg) }
  }

  .ld-wrap {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 14px; padding: 40px 20px;
    font-family: 'Jost', sans-serif;
    animation: ld-fadeIn .3s ease both;
  }

  .ld-rig {
    position: relative; display: flex;
    align-items: center; justify-content: center;
  }
  .ld-ring {
    border-radius: 50%;
    border: 2px solid rgba(23,23,20,.07);
    border-top-color: #b7ea4e;
    border-right-color: rgba(183,234,78,.3);
    animation: ld-spin .75s cubic-bezier(.5,0,.5,1) infinite;
  }
  .ld-dot {
    position: absolute; width: 5px; height: 5px;
    border-radius: 50%; background: #4a7a00;
  }
  .ld-dot-1 { animation: ld-orbit  1.5s linear infinite; }
  .ld-dot-2 { animation: ld-orbit2 1.5s linear infinite; opacity:.5; }

  .ld-text {
    font-size: .82rem; font-weight: 500; letter-spacing: .04em;
    color: rgba(23,23,20,.38);
  }

  .ld-page {
    min-height: 60vh; background: #fafaf7;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 28px;
  }
  .ld-page-title {
    font-family: 'Cormorant Garamond', serif; font-weight: 800;
    font-size: clamp(1.6rem, 3vw, 2.2rem); color: #171714;
    line-height: 1.1; text-align: center; margin: 0;
  }
  .ld-page-accent {
    background: linear-gradient(90deg, #4a7a00 0%, #b7ea4e 50%, #4a7a00 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: ld-shimmer 3s linear infinite;
  }
  .ld-page-sub {
    font-size: .82rem; font-weight: 300;
    color: rgba(23,23,20,.38); margin-top: 6px; text-align: center;
  }

  .ld-dots {
    display: flex; gap: 7px; align-items: center;
  }
  .ld-dots span {
    width: 6px; height: 6px; border-radius: 50%;
    background: #b7ea4e; animation: ld-pulse 1.2s ease-in-out infinite;
  }
  .ld-dots span:nth-child(2) { animation-delay: .2s; }
  .ld-dots span:nth-child(3) { animation-delay: .4s; }

  .ld-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
  }
  .ld-bg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(23,23,20,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(23,23,20,.025) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .ld-bg-glow {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 60% 20%, rgba(183,234,78,.08) 0%, transparent 65%);
  }
  .ld-page-inner { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 20px; }
`

let injected = false
function injectCSS() {
  if (injected || typeof document === 'undefined') return
  const el = document.createElement('style')
  el.textContent = CSS
  document.head.appendChild(el)
  injected = true
}

export default function Loader({ size = 24, text = '' }) {
  injectCSS()
  return (
    <div className="ld-wrap">
      <div className="ld-rig">
        <div className="ld-ring" style={{ width: size, height: size }} />
        <div className="ld-dot ld-dot-1" />
        <div className="ld-dot ld-dot-2" />
      </div>
      {text && <span className="ld-text">{text}</span>}
    </div>
  )
}


export function PageLoader() {
  injectCSS()

  const hints = ['Récupération des données…', 'Un instant…', 'Presque prêt…']
  const [hint, setHint] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setHint(h => (h + 1) % hints.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="ld-page">
      <div className="ld-bg">
        <div className="ld-bg-grid" />
        <div className="ld-bg-glow" />
      </div>

      <div className="ld-page-inner">
       
        <div className="ld-rig">
          <div className="ld-ring" style={{ width: 52, height: 52 }} />
          <div className="ld-dot ld-dot-1" />
          <div className="ld-dot ld-dot-2" />
        </div>

   
        <div>
          <p className="ld-page-title">
            <span className="ld-page-accent">Chargement</span> en cours
          </p>
          <p className="ld-page-sub">{hints[hint]}</p>
        </div>

        <div className="ld-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  )
}