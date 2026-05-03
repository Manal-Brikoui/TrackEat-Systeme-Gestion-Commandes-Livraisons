import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Lock, Truck, Store, ChevronRight } from 'lucide-react'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const ROLE_LABELS = { CLIENT: 'Client', DRIVER: 'Livreur', RESTAURANT_ADMIN: 'Admin Restaurant', ADMIN: 'Administrateur' }
const ROLE_COLORS = {
  CLIENT:           { bg: 'rgba(23,23,20,.06)',      color: 'rgba(23,23,20,.5)',  border: 'rgba(23,23,20,.12)' },
  DRIVER:           { bg: 'rgba(183,234,78,.12)',    color: '#4a7a00',            border: 'rgba(183,234,78,.4)' },
  RESTAURANT_ADMIN: { bg: 'rgba(37,99,235,.08)',     color: '#2563eb',            border: 'rgba(37,99,235,.25)' },
  ADMIN:            { bg: 'rgba(217,119,6,.08)',     color: '#d97706',            border: 'rgba(217,119,6,.3)' },
}

export default function ClientProfilePage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.updateProfile(form)
      updateUser({ id: res.id, email: res.email, fullName: res.fullName, phone: res.phone, role: res.role })
      toast.success('Profil mis à jour !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setLoading(false) }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Mots de passe différents'); return }
    setLoading(true)
    try {
      await authService.updateProfile({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Mot de passe modifié !')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch { toast.error('Mot de passe actuel incorrect') }
    finally { setLoading(false) }
  }

  const isClient = user?.role === 'CLIENT'
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.CLIENT
  const initials = (user?.fullName || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')

  const TABS = [
    { key: 'profile',  label: 'Informations', icon: <User size={13} /> },
    { key: 'password', label: 'Mot de passe', icon: <Lock size={13} /> },
    ...(isClient ? [
      { key: 'driver', label: 'Devenir livreur',   icon: <Truck size={13} /> },
      { key: 'resto',  label: 'Ouvrir un resto',   icon: <Store size={13} /> },
    ] : []),
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes pf-fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pf-shimmer{ from{background-position:0 center} to{background-position:200% center} }
        @keyframes pf-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes pf-pop    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

        .pf-root {
          background: #fafaf7; color: #171714; font-family: 'Jost', sans-serif;
          min-height: calc(100vh - var(--nav-h));
          padding: 0 !important; max-width: 100% !important;
          animation: pf-fadeIn .35s ease both;
        }

        .pf-hero {
          padding: 44px 24px 36px; border-bottom: 1px solid rgba(23,23,20,.07);
          position: relative; overflow: hidden; background: #fafaf7; margin-bottom: 32px;
        }
        .pf-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(23,23,20,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,23,20,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .pf-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 80% 0%, rgba(183,234,78,.09) 0%, transparent 68%);
        }
        .pf-hero-inner {
          max-width: 680px; margin: 0 auto; position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
        }

        .pf-avatar {
          width: 64px; height: 64px; border-radius: 18px; flex-shrink: 0;
          background: rgba(183,234,78,.15); border: 1.5px solid rgba(183,234,78,.4);
          display: flex; align-items: center; justify-content: center;
        }
        .pf-avatar-initials {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.6rem; color: #4a7a00; line-height: 1;
        }

        .pf-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 50px; margin-bottom: 10px;
          font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
        }
        .pf-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #b7ea4e;
          animation: pf-pulse 2s ease-in-out infinite;
        }
        .pf-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.05; color: #171714; margin: 0 0 10px;
        }
        .pf-title-accent {
          background: linear-gradient(90deg, #4a7a00 0%, #b7ea4e 50%, #4a7a00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: pf-shimmer 3.2s linear infinite;
        }
        .pf-role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 13px; border-radius: 50px;
          font-size: .72rem; font-weight: 700; letter-spacing: .05em;
        }

        .pf-body { max-width: 680px; margin: 0 auto; padding: 0 24px 60px; }

        .pf-tabs {
          display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 22px;
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 14px; padding: 6px;
        }
        .pf-tab {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 9px; cursor: pointer;
          font-family: 'Jost', sans-serif; font-weight: 600; font-size: .82rem;
          border: none; background: transparent; color: rgba(23,23,20,.45);
          transition: all .17s; flex: 1; justify-content: center; white-space: nowrap;
        }
        .pf-tab:hover { color: #171714; background: rgba(23,23,20,.04); }
        .pf-tab.active { background: #171714; color: #fff; }

        .pf-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px; padding: 24px;
          animation: pf-pop .25s ease both;
        }
        .pf-card-title {
          display: flex; align-items: center; gap: 9px;
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.3rem; color: #171714; margin: 0 0 22px;
        }
        .pf-card-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: rgba(183,234,78,.12); border: 1px solid rgba(183,234,78,.3);
          display: flex; align-items: center; justify-content: center; color: #4a7a00;
        }

        .pf-form { display: flex; flex-direction: column; gap: 16px; }
        .pf-label {
          display: block; font-size: .72rem; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          color: rgba(23,23,20,.45); margin-bottom: 7px;
        }
        .pf-input {
          width: 100%; padding: 12px 14px;
          background: #fafaf7; border: 1px solid rgba(23,23,20,.1);
          border-radius: 10px; color: #171714;
          font-family: 'Jost', sans-serif; font-size: .9rem;
          outline: none; box-sizing: border-box; transition: border-color .18s, box-shadow .18s;
        }
        .pf-input:focus { border-color: rgba(183,234,78,.6); box-shadow: 0 0 0 3px rgba(183,234,78,.1); }
        .pf-input::placeholder { color: rgba(23,23,20,.28); }
        .pf-input:disabled { opacity: .5; cursor: not-allowed; }

        .pf-submit {
          width: 100%; padding: 13px; border-radius: 12px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #171714; color: #fff;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .9rem;
          transition: all .18s; box-shadow: 0 4px 14px rgba(23,23,20,.12);
        }
        .pf-submit:hover:not(:disabled) { background: #2a2a26; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(23,23,20,.16); }
        .pf-submit:disabled { opacity: .55; cursor: not-allowed; transform: none; }

        .pf-spinner {
          width: 17px; height: 17px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
          animation: pf-spin .7s linear infinite;
        }
        @keyframes pf-spin { to { transform: rotate(360deg) } }

        .pf-cta-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px; padding: 48px 32px;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          animation: pf-pop .25s ease both;
        }
        .pf-cta-icon {
          width: 68px; height: 68px; border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .pf-cta-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800; font-size: 1.6rem;
          color: #171714; margin-bottom: 10px;
        }
        .pf-cta-desc {
          font-size: .9rem; color: rgba(23,23,20,.45); font-weight: 300;
          max-width: 320px; line-height: 1.7; margin-bottom: 28px;
        }
        .pf-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; border-radius: 50px; border: none; cursor: pointer;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .9rem;
          transition: all .18s;
        }
        .pf-cta-btn-dark { background: #171714; color: #fff; }
        .pf-cta-btn-dark:hover { background: #2a2a26; transform: translateY(-1px); }
        .pf-cta-btn-green { background: rgba(183,234,78,.15); color: #4a7a00; border: 1px solid rgba(183,234,78,.4); }
        .pf-cta-btn-green:hover { background: rgba(183,234,78,.25); transform: translateY(-1px); }

        @media (max-width: 640px) {
          .pf-hero { padding: 32px 20px 28px; }
          .pf-body { padding: 0 16px 48px; }
          .pf-tab  { font-size: .77rem; padding: 8px 10px; }
        }
      `}</style>

      <div className="pf-root">

        <div className="pf-hero">
          <div className="pf-hero-grid" />
          <div className="pf-hero-glow" />
          <div className="pf-hero-inner">
            <div>
              <div className="pf-eyebrow" style={{ background: roleStyle.bg, border: `1px solid ${roleStyle.border}` }}>
                <div className="pf-eyebrow-dot" style={{ background: roleStyle.color }} />
                <span style={{ color: roleStyle.color }}>{ROLE_LABELS[user?.role] || user?.role}</span>
              </div>
              <h1 className="pf-title">
                Mon <span className="pf-title-accent">profil</span>
              </h1>
              <span className="pf-role-badge" style={{ background: roleStyle.bg, border: `1px solid ${roleStyle.border}`, color: roleStyle.color }}>
                {user?.email}
              </span>
            </div>
            <div className="pf-avatar">
              <span className="pf-avatar-initials">{initials}</span>
            </div>
          </div>
        </div>

        <div className="pf-body">

          <div className="pf-tabs">
            {TABS.map(t => (
              <button key={t.key} className={`pf-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {tab === 'profile' && (
            <div className="pf-card">
              <div className="pf-card-title">
                <div className="pf-card-icon"><User size={15} /></div>
                Informations personnelles
              </div>
              <form className="pf-form" onSubmit={saveProfile}>
                <div>
                  <label className="pf-label">Nom complet</label>
                  <input className="pf-input" value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                </div>
                <div>
                  <label className="pf-label">Email</label>
                  <input className="pf-input" value={user?.email || ''} disabled />
                </div>
                <div>
                  <label className="pf-label">Téléphone</label>
                  <input className="pf-input" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <button className="pf-submit" disabled={loading}>
                  {loading ? <div className="pf-spinner" /> : 'Sauvegarder'}
                </button>
              </form>
            </div>
          )}

          {tab === 'password' && (
            <div className="pf-card">
              <div className="pf-card-title">
                <div className="pf-card-icon"><Lock size={15} /></div>
                Changer le mot de passe
              </div>
              <form className="pf-form" onSubmit={savePassword}>
                <div>
                  <label className="pf-label">Mot de passe actuel</label>
                  <input className="pf-input" type="password" value={pwForm.currentPassword}
                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
                </div>
                <div>
                  <label className="pf-label">Nouveau mot de passe</label>
                  <input className="pf-input" type="password" value={pwForm.newPassword}
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
                </div>
                <div>
                  <label className="pf-label">Confirmer</label>
                  <input className="pf-input" type="password" value={pwForm.confirm}
                    onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
                </div>
                <button className="pf-submit" disabled={loading}>
                  {loading ? <div className="pf-spinner" /> : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}

          {tab === 'driver' && isClient && (
            <div className="pf-cta-card">
              <div className="pf-cta-icon" style={{ background: 'rgba(183,234,78,.12)', border: '1px solid rgba(183,234,78,.35)' }}>
                <Truck size={30} color="#4a7a00" strokeWidth={1.5} />
              </div>
              <div className="pf-cta-title">Devenir livreur</div>
              <div className="pf-cta-desc">
                Rejoignez notre équipe de livreurs et gagnez de l'argent à votre rythme.
                Votre demande sera examinée par l'administration.
              </div>
              <Link to="/apply/driver">
                <button className="pf-cta-btn pf-cta-btn-green">
                  Soumettre ma candidature <ChevronRight size={15} />
                </button>
              </Link>
            </div>
          )}

          {tab === 'resto' && isClient && (
            <div className="pf-cta-card">
              <div className="pf-cta-icon" style={{ background: 'rgba(23,23,20,.05)', border: '1px solid rgba(23,23,20,.1)' }}>
                <Store size={30} color="#171714" strokeWidth={1.5} />
              </div>
              <div className="pf-cta-title">Inscrire mon restaurant</div>
              <div className="pf-cta-desc">
                Inscrivez votre restaurant et touchez des milliers de clients.
                Votre demande sera examinée par l'administration.
              </div>
              <Link to="/apply/restaurant">
                <button className="pf-cta-btn pf-cta-btn-dark">
                  Inscrire mon restaurant <ChevronRight size={15} />
                </button>
              </Link>
            </div>
          )}

        </div>
      </div>
    </>
  )
}