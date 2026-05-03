import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import {
  Users, Search, UserX, Shield, RefreshCw,
  Mail, User, ChevronDown, ChevronUp, AlertTriangle,
  Phone, Hash, Star, Car, FileText, Store,
  MapPin, Clock, CheckCircle, XCircle, Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  bg:        '#fafaf7',
  surface:   '#fff',
  border:    'rgba(23,23,20,.09)',
  text:      '#171714',
  muted:     'rgba(23,23,20,.45)',
  accent:    '#b7ea4e',
  green:     '#4a7a00',
  warn:      '#d97706',
  warnBg:    'rgba(217,119,6,.08)',
  blue:      '#2563eb',
  blueBg:    'rgba(37,99,235,.08)',
  purple:    '#7c3aed',
  purpleBg:  'rgba(124,58,237,.08)',
  danger:    '#dc2626',
  dangerBg:  'rgba(220,38,38,.08)',
}

const BG_SVG = `data:image/svg+xml,${encodeURIComponent(`<svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
<defs>
<pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="1.1" fill="#171714" opacity="0.06"/></pattern>
<pattern id="grid" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0 L0 0 0 64" fill="none" stroke="#171714" stroke-width="0.35" opacity="0.055"/></pattern>
</defs>
<rect width="1440" height="900" fill="#fafaf7"/>
<rect width="1440" height="900" fill="url(#grid)"/>
<rect width="1440" height="900" fill="url(#dots)" opacity="0.8"/>
<ellipse cx="1320" cy="-60" rx="420" ry="380" fill="#b7ea4e" opacity="0.13"/>
<ellipse cx="1380" cy="80" rx="280" ry="250" fill="#b7ea4e" opacity="0.10"/>
<circle cx="1300" cy="100" r="320" fill="none" stroke="#b7ea4e" stroke-width="1" opacity="0.28"/>
<circle cx="1300" cy="100" r="240" fill="none" stroke="#b7ea4e" stroke-width="0.6" opacity="0.18"/>
<circle cx="160" cy="130" r="52" fill="#b7ea4e" opacity="0.20"/>
<circle cx="160" cy="130" r="32" fill="#b7ea4e" opacity="0.28"/>
<circle cx="160" cy="130" r="14" fill="#b7ea4e" opacity="0.45"/>
<ellipse cx="-80" cy="820" rx="380" ry="320" fill="#171714" opacity="0.04"/>
<circle cx="1100" cy="760" r="38" fill="#b7ea4e" opacity="0.18"/>
<circle cx="1100" cy="760" r="20" fill="#b7ea4e" opacity="0.30"/>
<line x1="0" y1="280" x2="340" y2="0" stroke="#b7ea4e" stroke-width="0.9" opacity="0.22"/>
<path d="M 240 900 Q 720 620 1200 900" fill="none" stroke="#b7ea4e" stroke-width="1" opacity="0.20"/>
<path d="M 1440 400 Q 1280 560 1440 720" fill="none" stroke="#b7ea4e" stroke-width="0.8" opacity="0.18"/>
</svg>`)}`

const ROLE_CONFIG = {
  ADMIN:            { color: T.purple, bg: T.purpleBg, label: 'Admin',       icon: Shield },
  RESTAURANT_ADMIN: { color: T.warn,   bg: T.warnBg,   label: 'Resto Admin', icon: Store  },
  DRIVER:           { color: T.blue,   bg: T.blueBg,   label: 'Driver',      icon: Car    },
  CLIENT:           { color: T.green,  bg: 'rgba(74,122,0,.08)', label: 'Client', icon: User },
}

function InfoField({ icon: Icon, label, value, color }) {
  if (!value && value !== 0) return null
  return (
    <div className="usr-info-field">
      <div className="usr-info-icon" style={{ color: color || T.muted }}>
        <Icon size={13} />
      </div>
      <div>
        <div className="usr-info-label">{label}</div>
        <div className="usr-info-value">{value}</div>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, label, color }) {
  return (
    <div className="usr-section-title" style={{ color }}>
      <Icon size={13} />
      <span>{label}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    APPROVED: { color: T.blue,   bg: T.blueBg,   label: 'Approuvé',  icon: CheckCircle },
    PENDING:  { color: T.warn,   bg: T.warnBg,   label: 'En attente', icon: Clock      },
    REJECTED: { color: T.danger, bg: T.dangerBg, label: 'Rejeté',     icon: XCircle    },
    ACTIVE:   { color: T.green,  bg: 'rgba(74,122,0,.08)', label: 'Actif', icon: CheckCircle },
  }
  const cfg = map[status] || { color: T.muted, bg: T.border, label: status, icon: User }
  return (
    <span className="usr-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <cfg.icon size={11} />
      {cfg.label}
    </span>
  )
}

function DriverDetails({ user }) {
  return (
    <div className="usr-role-panel" style={{ borderColor: `${T.blue}30`, background: T.blueBg }}>
      <SectionTitle icon={Car} label="Informations Driver" color={T.blue} />
      <div className="usr-fields-grid">
        <InfoField icon={FileText}  label="N° Permis"   value={user.licenseNumber}              color={T.blue} />
        <InfoField icon={Car}       label="Véhicule"    value={user.vehicle}                    color={T.blue} />
        <InfoField icon={Hash}      label="Plaque"      value={user.licensePlate}               color={T.blue} />
        <InfoField icon={Star}      label="Note"        value={user.rating != null ? `${user.rating?.toFixed(1)} / 5` : null} color={T.blue} />
        <InfoField icon={CheckCircle} label="Courses"   value={user.totalDeliveries != null ? `${user.totalDeliveries} livraisons` : null} color={T.blue} />
        <InfoField icon={MapPin}    label="Zone"        value={user.zone}                       color={T.blue} />
        {user.driverStatus && (
          <div className="usr-info-field">
            <div className="usr-info-icon" style={{ color: T.blue }}><Shield size={13} /></div>
            <div>
              <div className="usr-info-label">Statut dossier</div>
              <StatusBadge status={user.driverStatus} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RestaurantAdminDetails({ user }) {
  return (
    <div className="usr-role-panel" style={{ borderColor: `${T.warn}30`, background: T.warnBg }}>
      <SectionTitle icon={Store} label="Informations Restaurant" color={T.warn} />
      <div className="usr-fields-grid">
        <InfoField icon={Store}     label="Restaurant"    value={user.restaurantName}            color={T.warn} />
        <InfoField icon={MapPin}    label="Adresse"       value={user.restaurantAddress}         color={T.warn} />
        <InfoField icon={Phone}     label="Tél. resto"    value={user.restaurantPhone}           color={T.warn} />
        <InfoField icon={Star}      label="Note"          value={user.restaurantRating != null ? `${user.restaurantRating?.toFixed(1)} / 5` : null} color={T.warn} />
        <InfoField icon={CheckCircle} label="Commandes"   value={user.totalOrders != null ? `${user.totalOrders} commandes` : null} color={T.warn} />
        <InfoField icon={FileText}  label="SIRET"         value={user.siret}                     color={T.warn} />
        {user.restaurantStatus && (
          <div className="usr-info-field">
            <div className="usr-info-icon" style={{ color: T.warn }}><Shield size={13} /></div>
            <div>
              <div className="usr-info-label">Statut dossier</div>
              <StatusBadge status={user.restaurantStatus} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminDetails({ user }) {
  return (
    <div className="usr-role-panel" style={{ borderColor: `${T.purple}30`, background: T.purpleBg }}>
      <SectionTitle icon={Shield} label="Informations Admin" color={T.purple} />
      <div className="usr-fields-grid">
        <InfoField icon={Calendar}  label="Membre depuis"  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : null} color={T.purple} />
        <InfoField icon={Shield}    label="Niveau accès"   value={user.accessLevel || 'Super Admin'} color={T.purple} />
        <InfoField icon={Clock}     label="Dernière connexion" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : null} color={T.purple} />
      </div>
    </div>
  )
}

function ConfirmModal({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="usr-modal-overlay">
      <div className="usr-modal">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div className="usr-modal-icon">
            <AlertTriangle size={20} color={T.danger} />
          </div>
          <div>
            <div className="usr-modal-title">Révoquer le rôle</div>
            <div className="usr-modal-email">{user?.email}</div>
          </div>
        </div>
        <p className="usr-modal-body">
          Cette action supprimera le rôle spécial de cet utilisateur. Il redeviendra un simple client sans accès privilégié.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="usr-modal-btn-cancel" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
          <button className="usr-modal-btn-confirm" onClick={onConfirm} disabled={loading}>
            {loading ? 'Révocation…' : 'Révoquer'}
          </button>
        </div>
      </div>
    </div>
  )
}

function UserRow({ user, onRevoke }) {
  const [expanded, setExpanded] = useState(false)
  const roles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['CLIENT'])
  const primaryRole = roles[0] || 'CLIENT'
  const cfg = ROLE_CONFIG[primaryRole] || { color: T.muted, bg: T.border, label: primaryRole, icon: User }
  const hasSpecialRole = roles.some(r => r !== 'CLIENT')
  const RoleIcon = cfg.icon

  return (
    <div className="usr-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>

      {/* ── Header ── */}
      <div className="usr-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="usr-avatar" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
          <RoleIcon size={19} color={cfg.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="usr-name">{user.fullName || user.name || `Utilisateur #${user.id}`}</div>
          <div className="usr-email-row">
            <Mail size={11} color={T.muted} />
            <span>{user.email}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {roles.map(role => {
            const rc = ROLE_CONFIG[role] || { color: T.muted, bg: T.border, label: role }
            return (
              <span key={role} className="usr-role-badge" style={{ background: rc.bg, color: rc.color }}>
                {rc.label}
              </span>
            )
          })}
        </div>

        <div className="usr-chevron">
          {expanded ? <ChevronUp size={15} color={T.muted} /> : <ChevronDown size={15} color={T.muted} />}
        </div>
      </div>

      {expanded && (
        <div className="usr-expanded">

          <div className="usr-role-panel" style={{ borderColor: T.border, background: 'rgba(23,23,20,.03)' }}>
            <SectionTitle icon={User} label="Informations générales" color={T.muted} />
            <div className="usr-fields-grid">
              <InfoField icon={Hash}     label="ID"           value={user.id}                                                   color={T.muted} />
              <InfoField icon={Phone}    label="Téléphone"    value={user.phone}                                                color={T.muted} />
              <InfoField icon={Calendar} label="Inscrit le"   value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : null} color={T.muted} />
              <InfoField icon={MapPin}   label="Adresse"      value={user.address}                                              color={T.muted} />
              <InfoField icon={Clock}    label="Dernière connexion" value={user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : null} color={T.muted} />
            </div>
          </div>

          {roles.includes('ADMIN')            && <AdminDetails            user={user} />}
          {roles.includes('RESTAURANT_ADMIN') && <RestaurantAdminDetails  user={user} />}
          {roles.includes('DRIVER')           && <DriverDetails           user={user} />}

          <div className="usr-actions-row">
            {hasSpecialRole ? (
              <button className="usr-btn-revoke" onClick={() => onRevoke(user)}>
                <UserX size={14} />
                Révoquer le rôle
              </button>
            ) : (
              <span className="usr-no-action">Simple client  aucun rôle à révoquer</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [filterRole,  setFilterRole]  = useState('ALL')
  const [confirm,     setConfirm]     = useState(null)
  const [revoking,    setRevoking]    = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllUsers()
      setUsers(data)
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRevoke = async () => {
    if (!confirm) return
    setRevoking(true)
    try {
      await adminService.removeRole(confirm.id)
      setUsers(prev => prev.map(u =>
        u.id === confirm.id ? { ...u, roles: ['CLIENT'], role: 'CLIENT' } : u
      ))
      toast.success('Rôle révoqué avec succès')
      setConfirm(null)
    } catch {
      toast.error('Erreur lors de la révocation')
    } finally {
      setRevoking(false)
    }
  }

  const ROLES = ['ALL', 'ADMIN', 'RESTAURANT_ADMIN', 'DRIVER', 'CLIENT']

  const filtered = users.filter(u => {
    const roles = Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : ['CLIENT'])
    const matchSearch =
      (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.fullName || u.name || '').toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === 'ALL' || roles.includes(filterRole)
    return matchSearch && matchRole
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RefreshCw size={26} color={T.green} style={{ animation: 'usr-spin 1s linear infinite' }} />
      <style>{`@keyframes usr-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes usr-in   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes usr-spin { to{transform:rotate(360deg)} }
        @keyframes usr-expand { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .usr-root {
          min-height: 100vh;
          background-color: ${T.bg};
          background-image: url("${BG_SVG}");
          background-size: cover;
          background-position: center top;
          background-attachment: fixed;
          font-family: 'Jost', sans-serif;
          color: ${T.text};
          padding: 48px 24px 80px;
          animation: usr-in .35s ease both;
        }
        .usr-inner { max-width: 960px; margin: 0 auto; position: relative; }

        .usr-eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .usr-eyebrow-text {
          font-size: .73rem; font-weight: 700; letter-spacing: .11em;
          text-transform: uppercase; color: ${T.purple};
        }
        .usr-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: 2.8rem;
          color: ${T.text}; margin: 0 0 6px; line-height: 1.05;
        }
        .usr-subtitle { font-size: .92rem; color: ${T.muted}; margin: 0; }

        .usr-pills { display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap; }
        .usr-pill {
          background: rgba(255,255,255,.88); backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid ${T.border}; border-radius: 50px;
          padding: 7px 16px; display: flex; align-items: center; gap: 8px;
          font-size: .8rem; font-weight: 600;
        }
        .usr-pill-dot { width: 7px; height: 7px; border-radius: 50%; }
        .usr-pill-count {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: 1.05rem; line-height: 1;
        }

        .usr-toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .usr-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .usr-search {
          width: 100%; padding: 11px 14px 11px 38px;
          background: rgba(255,255,255,.88); backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border}; border-radius: 50px;
          color: ${T.text}; font-size: .9rem; font-family: 'Jost', sans-serif;
          outline: none; box-sizing: border-box;
          transition: border-color .18s, box-shadow .18s;
        }
        .usr-search:focus { border-color: ${T.purple}55; box-shadow: 0 0 0 3px ${T.purple}12; }
        .usr-search::placeholder { color: ${T.muted}; }

        .usr-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .usr-filter-btn {
          padding: 8px 16px; border-radius: 50px;
          font-family: 'Jost', sans-serif; font-weight: 600; font-size: .8rem;
          cursor: pointer; transition: all .16s;
          border: 1px solid ${T.border};
          background: rgba(255,255,255,.7); color: ${T.muted};
        }
        .usr-filter-btn.f-ALL            { background: ${T.green};  border-color: ${T.green};  color: #fff; }
        .usr-filter-btn.f-ADMIN          { background: ${T.purple}; border-color: ${T.purple}; color: #fff; }
        .usr-filter-btn.f-RESTAURANT_ADMIN { background: ${T.warn}; border-color: ${T.warn};   color: #fff; }
        .usr-filter-btn.f-DRIVER         { background: ${T.blue};   border-color: ${T.blue};   color: #fff; }
        .usr-filter-btn.f-CLIENT         { background: ${T.green};  border-color: ${T.green};  color: #fff; }

        .usr-refresh {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; background: rgba(255,255,255,.88);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border}; border-radius: 50px;
          color: ${T.muted}; cursor: pointer;
          font-family: 'Jost', sans-serif; font-size: .88rem; font-weight: 600;
          transition: border-color .18s, box-shadow .18s; flex-shrink: 0;
        }
        .usr-refresh:hover { border-color: ${T.green}66; box-shadow: 0 4px 14px rgba(23,23,20,.07); }

        .usr-list { display: flex; flex-direction: column; gap: 12px; }
        .usr-card {
          background: rgba(255,255,255,.88); backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border}; border-radius: 20px; overflow: hidden;
          transition: box-shadow .2s;
        }
        .usr-card:hover { box-shadow: 0 6px 28px rgba(23,23,20,.09); }

        .usr-card-header {
          padding: 18px 22px; display: flex; align-items: center; gap: 16px;
          cursor: pointer; flex-wrap: wrap;
        }
        .usr-avatar {
          width: 48px; height: 48px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .usr-name { font-weight: 700; font-size: .95rem; color: ${T.text}; margin-bottom: 3px; }
        .usr-email-row {
          display: flex; align-items: center; gap: 5px;
          font-size: .8rem; color: ${T.muted};
        }
        .usr-role-badge {
          padding: 3px 11px; border-radius: 50px;
          font-size: .72rem; font-weight: 700; letter-spacing: .04em;
        }
        .usr-chevron { flex-shrink: 0; }

        .usr-expanded {
          border-top: 1px solid ${T.border};
          padding: 20px 22px 22px;
          display: flex; flex-direction: column; gap: 14px;
          animation: usr-expand .22s ease both;
        }

        /* ── Role panels ── */
        .usr-role-panel {
          border: 1px solid; border-radius: 14px;
          padding: 16px 18px;
        }
        .usr-section-title {
          display: flex; align-items: center; gap: 7px;
          font-size: .7rem; font-weight: 700; letter-spacing: .09em;
          text-transform: uppercase; margin-bottom: 14px;
        }

        .usr-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px 20px;
        }
        .usr-info-field { display: flex; align-items: flex-start; gap: 9px; }
        .usr-info-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: rgba(23,23,20,.04);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
        }
        .usr-info-label {
          font-size: .68rem; font-weight: 700; letter-spacing: .07em;
          text-transform: uppercase; color: ${T.muted}; margin-bottom: 2px;
        }
        .usr-info-value { font-size: .88rem; font-weight: 600; color: ${T.text}; }

        .usr-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 50px;
          font-size: .75rem; font-weight: 700;
        }

        .usr-actions-row {
          display: flex; align-items: center; padding-top: 4px;
        }
        .usr-btn-revoke {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 50px;
          background: ${T.dangerBg}; border: 1px solid ${T.danger}30;
          color: ${T.danger}; font-family: 'Jost', sans-serif;
          font-weight: 700; font-size: .85rem; cursor: pointer;
          transition: filter .15s, transform .14s;
        }
        .usr-btn-revoke:hover { filter: brightness(.9); transform: translateY(-1px); }
        .usr-no-action { font-size: .82rem; color: ${T.muted}; }

        .usr-empty {
          background: rgba(255,255,255,.88); backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border}; border-radius: 20px;
          padding: 56px; text-align: center;
        }

        .usr-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(23,23,20,.45); backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 16px;
        }
        .usr-modal {
          background: rgba(255,255,255,.97); border: 1px solid ${T.border};
          border-radius: 22px; padding: 32px; max-width: 420px; width: 100%;
          box-shadow: 0 20px 60px rgba(23,23,20,.18);
        }
        .usr-modal-icon {
          width: 48px; height: 48px; border-radius: 13px;
          background: ${T.dangerBg}; border: 1px solid ${T.danger}25;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .usr-modal-title { font-weight: 700; font-size: 1.05rem; color: ${T.text}; }
        .usr-modal-email { font-size: .85rem; color: ${T.muted}; margin-top: 2px; }
        .usr-modal-body  { font-size: .9rem; color: ${T.muted}; line-height: 1.65; margin: 0 0 24px; }
        .usr-modal-btn-cancel {
          flex: 1; padding: 11px;
          background: transparent; border: 1px solid ${T.border}; border-radius: 50px;
          color: ${T.muted}; cursor: pointer; font-family: 'Jost', sans-serif;
          font-weight: 600; font-size: .9rem; transition: border-color .15s;
        }
        .usr-modal-btn-cancel:hover { border-color: ${T.muted}; }
        .usr-modal-btn-confirm {
          flex: 1; padding: 11px;
          background: ${T.danger}; border: none; border-radius: 50px;
          color: #fff; cursor: pointer; font-family: 'Jost', sans-serif;
          font-weight: 700; font-size: .9rem; transition: filter .15s;
        }
        .usr-modal-btn-confirm:hover  { filter: brightness(.9); }
        .usr-modal-btn-confirm:disabled { opacity: .6; cursor: not-allowed; }

        @media (max-width: 600px) {
          .usr-root { padding: 28px 14px 60px; }
          .usr-title { font-size: 2rem; }
          .usr-card-header { padding: 14px 16px; }
          .usr-expanded { padding: 14px 16px 18px; }
          .usr-fields-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="usr-root">
        <div className="usr-inner">

          <div style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="usr-eyebrow">
                <Shield size={14} color={T.purple} />
                <span className="usr-eyebrow-text">Administration</span>
              </div>
              <h1 className="usr-title">Utilisateurs</h1>
              <p className="usr-subtitle">{users.length} compte{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}</p>
            </div>
            <button className="usr-refresh" onClick={load}>
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>

          <div className="usr-pills">
            {[
              { key: 'ADMIN',            label: 'Admins',         color: T.purple },
              { key: 'RESTAURANT_ADMIN', label: 'Resto Admins',   color: T.warn   },
              { key: 'DRIVER',           label: 'Drivers',        color: T.blue   },
              { key: 'CLIENT',           label: 'Clients',        color: T.green  },
            ].map(({ key, label, color }) => {
              const count = users.filter(u => {
                const r = Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : ['CLIENT'])
                return r.includes(key)
              }).length
              return (
                <div key={key} className="usr-pill">
                  <div className="usr-pill-dot" style={{ background: color }} />
                  <span style={{ color: T.muted }}>{label}</span>
                  <span className="usr-pill-count" style={{ color: T.text }}>{count}</span>
                </div>
              )
            })}
          </div>

          <div className="usr-toolbar">
            <div className="usr-search-wrap">
              <Search size={14} color={T.muted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="usr-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou email…"
              />
            </div>
            <div className="usr-filters">
              {ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`usr-filter-btn${filterRole === role ? ` f-${role}` : ''}`}
                >
                  {role === 'ALL' ? 'Tous' : (ROLE_CONFIG[role]?.label || role)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="usr-empty">
              <Users size={44} color={T.muted} style={{ opacity: .2, margin: '0 auto 14px', display: 'block' }} />
              <p style={{ color: T.muted, margin: 0, fontSize: '.95rem' }}>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="usr-list">
              {filtered.map(user => (
                <UserRow key={user.id} user={user} onRevoke={setConfirm} />
              ))}
            </div>
          )}

        </div>
      </div>

      {confirm && (
        <ConfirmModal
          user={confirm}
          onConfirm={handleRevoke}
          onCancel={() => setConfirm(null)}
          loading={revoking}
        />
      )}
    </>
  )
}