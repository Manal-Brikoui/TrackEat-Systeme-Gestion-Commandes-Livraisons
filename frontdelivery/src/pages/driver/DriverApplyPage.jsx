import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Truck, FileText, Phone, MapPin, ArrowLeft, Bike, Car, Zap } from 'lucide-react'
import { driverService } from '../../services/driverService'
import ImageUploader from '../../components/common/ImageUploader'
import toast from 'react-hot-toast'

const VEHICLES = [
  { value: 'SCOOTER',  label: 'Scooter',  Icon: Zap  },
  { value: 'BIKE',     label: 'Vélo',     Icon: Bike },
  { value: 'CAR',      label: 'Voiture',  Icon: Car  },
  { value: 'MOTORBIKE',label: 'Moto',     Icon: Truck},
]

const STEPS = [
  { Icon: FileText, title: 'Formulaire', desc: 'Remplissez votre dossier' },
  { Icon: Truck,    title: 'Validation', desc: 'Examen sous 48h' },
  { Icon: MapPin,   title: 'Livrez !',   desc: 'Acceptez des commandes' },
]

export default function DriverApplyPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    vehicleType: 'SCOOTER', licensePlate: '', phone: '', city: '',
    licenseImageUrl: '', vehicleImageUrl: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await driverService.apply(form)
      toast.success("Demande envoyée ! L'admin va examiner votre dossier.")
      nav('/profile')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la demande')
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes da-fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes da-shimmer { from{background-position:0 center} to{background-position:200% center} }
        @keyframes da-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes da-pop     { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes da-spin    { to{transform:rotate(360deg)} }

        .da-root {
          background: #fafaf7; color: #171714; font-family: 'Jost', sans-serif;
          min-height: calc(100vh - var(--nav-h, 0px));
          padding: 0 !important; max-width: 100% !important;
          animation: da-fadeIn .35s ease both;
        }

        .da-hero {
          padding: 44px 24px 36px; border-bottom: 1px solid rgba(23,23,20,.07);
          position: relative; overflow: hidden; margin-bottom: 32px;
        }
        .da-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(23,23,20,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,23,20,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .da-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 60% 0%, rgba(183,234,78,.09) 0%, transparent 68%);
        }
        .da-hero-inner {
          max-width: 680px; margin: 0 auto; position: relative; z-index: 1;
        }
        .da-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(23,23,20,.4); font-size: .8rem; font-weight: 600;
          text-decoration: none; margin-bottom: 22px;
          transition: color .15s;
        }
        .da-back:hover { color: #4a7a00; }
        .da-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 50px;
          background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.28);
          font-size: .7rem; font-weight: 700; color: #4a7a00;
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 14px;
        }
        .da-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #b7ea4e;
          animation: da-pulse 2s ease-in-out infinite;
        }
        .da-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.05;
          color: #171714; margin: 0 0 8px;
        }
        .da-title-accent {
          background: linear-gradient(90deg, #4a7a00 0%, #b7ea4e 50%, #4a7a00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: da-shimmer 3.2s linear infinite;
        }
        .da-subtitle { font-size: .88rem; color: rgba(23,23,20,.45); font-weight: 300; margin: 0; }

        .da-body { max-width: 680px; margin: 0 auto; padding: 0 24px 60px; }

        .da-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 28px; }
        .da-step {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 16px; padding: 18px 14px; text-align: center;
          animation: da-pop .25s ease both;
        }
        .da-step-icon {
          width: 38px; height: 38px; border-radius: 12px;
          background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.28);
          display: flex; align-items: center; justify-content: center;
          color: #4a7a00; margin: 0 auto 10px;
        }
        .da-step-num {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: .75rem; color: rgba(23,23,20,.25);
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 4px;
        }
        .da-step-title { font-weight: 700; font-size: .85rem; color: #171714; margin-bottom: 3px; }
        .da-step-desc  { font-size: .75rem; color: rgba(23,23,20,.38); font-weight: 300; }

        .da-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px; padding: 28px 26px;
          animation: da-pop .3s ease both;
        }

        .da-section {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.05rem; color: #171714;
          padding-bottom: 14px; margin-bottom: 18px;
          border-bottom: 1px solid rgba(23,23,20,.07);
          display: flex; align-items: center; gap: 8px;
        }
        .da-section svg { color: #4a7a00; }

        .da-form { display: flex; flex-direction: column; gap: 20px; }
        .da-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .da-field { display: flex; flex-direction: column; gap: 6px; }
        .da-label {
          font-size: .78rem; font-weight: 700; color: rgba(23,23,20,.5);
          letter-spacing: .04em; text-transform: uppercase;
          display: flex; align-items: center; gap: 5px;
        }
        .da-label svg { color: #4a7a00; }
        .da-input {
          width: 100%; padding: 11px 14px; border-radius: 12px;
          border: 1px solid rgba(23,23,20,.1); background: #fafaf7;
          font-family: 'Jost', sans-serif; font-size: .9rem; color: #171714;
          outline: none; transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }
        .da-input:focus {
          border-color: rgba(183,234,78,.6);
          box-shadow: 0 0 0 3px rgba(183,234,78,.12);
        }
        .da-input::placeholder { color: rgba(23,23,20,.25); }
        .da-select { appearance: none; cursor: pointer; }

        .da-vehicles { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .da-vehicle {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 8px; border-radius: 14px; cursor: pointer;
          border: 1.5px solid rgba(23,23,20,.09); background: #fafaf7;
          font-family: 'Jost', sans-serif; font-size: .78rem; font-weight: 600;
          color: rgba(23,23,20,.4); transition: all .16s;
        }
        .da-vehicle:hover { border-color: rgba(183,234,78,.4); color: #4a7a00; }
        .da-vehicle.selected {
          background: rgba(183,234,78,.1); border-color: rgba(183,234,78,.55);
          color: #4a7a00;
        }
        .da-vehicle-icon {
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(23,23,20,.04); transition: background .16s;
        }
        .da-vehicle.selected .da-vehicle-icon { background: rgba(183,234,78,.2); }

        .da-submit {
          width: 100%; padding: 15px; border-radius: 50px; border: none; cursor: pointer;
          background: #171714; color: #fafaf7;
          font-family: 'Jost', sans-serif; font-size: .9rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: all .18s; margin-top: 6px; letter-spacing: .02em;
        }
        .da-submit:hover:not(:disabled) {
          background: #4a7a00;
          box-shadow: 0 4px 20px rgba(74,122,0,.25);
        }
        .da-submit:disabled { opacity: .5; cursor: not-allowed; }
        .da-spinner {
          width: 17px; height: 17px; border-radius: 50%;
          border: 2px solid rgba(250,250,247,.3); border-top-color: #fafaf7;
          animation: da-spin .7s linear infinite;
        }

        @media (max-width: 640px) {
          .da-hero { padding: 32px 20px 28px; }
          .da-body { padding: 0 16px 48px; }
          .da-card { padding: 20px 18px; }
          .da-row  { grid-template-columns: 1fr; }
          .da-vehicles { grid-template-columns: repeat(2,1fr); }
          .da-steps { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="da-root">

        <div className="da-hero">
          <div className="da-hero-grid" />
          <div className="da-hero-glow" />
          <div className="da-hero-inner">
            <Link to="/profile" className="da-back">
              <ArrowLeft size={14} /> Retour au profil
            </Link>
            <div className="da-eyebrow">
              <div className="da-eyebrow-dot" />
              Candidature
            </div>
            <h1 className="da-title">
              Devenir <span className="da-title-accent">livreur</span>
            </h1>
            <p className="da-subtitle">Remplissez ce formulaire · Traitement sous 48h</p>
          </div>
        </div>

        <div className="da-body">

          <div className="da-steps">
            {STEPS.map(({ Icon, title, desc }, i) => (
              <div className="da-step" key={i} style={{ animationDelay: `${i * .07}s` }}>
                <div className="da-step-icon"><Icon size={17} strokeWidth={1.8} /></div>
                <div className="da-step-num">Étape {i + 1}</div>
                <div className="da-step-title">{title}</div>
                <div className="da-step-desc">{desc}</div>
              </div>
            ))}
          </div>

          <div className="da-card">
            <form className="da-form" onSubmit={submit}>

              {/* Véhicule */}
              <div>
                <div className="da-section"><Truck size={15} />Votre véhicule</div>
                <div className="da-vehicles">
                  {VEHICLES.map(({ value, label, Icon }) => (
                    <button
                      key={value} type="button"
                      className={`da-vehicle ${form.vehicleType === value ? 'selected' : ''}`}
                      onClick={() => set('vehicleType', value)}
                    >
                      <div className="da-vehicle-icon"><Icon size={16} strokeWidth={1.8} /></div>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="da-section"><FileText size={15} />Informations</div>
                <div className="da-form" style={{ gap: 14 }}>
                  <div className="da-row">
                    <div className="da-field">
                      <label className="da-label"><FileText size={11} />Plaque d'immatriculation</label>
                      <input className="da-input" placeholder="12345-A-1"
                        value={form.licensePlate} onChange={e => set('licensePlate', e.target.value)} required />
                    </div>
                    <div className="da-field">
                      <label className="da-label"><Phone size={11} />Téléphone</label>
                      <input className="da-input" placeholder="+212 6XX XXX XXX"
                        value={form.phone} onChange={e => set('phone', e.target.value)} required />
                    </div>
                  </div>
                  <div className="da-field">
                    <label className="da-label"><MapPin size={11} />Ville</label>
                    <input className="da-input" placeholder="Casablanca"
                      value={form.city} onChange={e => set('city', e.target.value)} required />
                  </div>
                </div>
              </div>

              <div>
                <div className="da-section"><FileText size={15} />Documents</div>
                <div className="da-form" style={{ gap: 14 }}>
                  <ImageUploader
                    label="Photo du permis de conduire"
                    value={form.licenseImageUrl}
                    onChange={v => set('licenseImageUrl', v)}
                  />
                  <ImageUploader
                    label="Photo du véhicule"
                    value={form.vehicleImageUrl}
                    onChange={v => set('vehicleImageUrl', v)}
                  />
                </div>
              </div>

              <button className="da-submit" disabled={loading}>
                {loading
                  ? <><div className="da-spinner" /> Envoi en cours…</>
                  : <><Truck size={16} strokeWidth={2} /> Envoyer ma candidature</>
                }
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  )
}