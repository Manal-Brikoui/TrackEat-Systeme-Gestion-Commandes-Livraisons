import { useEffect, useState } from 'react'
import { driverService } from '../../services/driverService'
import {
  Search, CheckCircle, XCircle,
  RefreshCw, Mail, ChevronDown, ChevronUp,
  Phone, Hash, Car, FileText, MapPin,
  Clock, Calendar, ImageIcon, ZoomIn,
} from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  bg:       '#fafaf7',
  surface:  '#fff',
  border:   'rgba(23,23,20,.09)',
  text:     '#171714',
  muted:    'rgba(23,23,20,.45)',
  green:    '#4a7a00',
  warn:     '#d97706',
  warnBg:   'rgba(217,119,6,.08)',
  blue:     '#2563eb',
  blueBg:   'rgba(37,99,235,.08)',
  danger:   '#dc2626',
  dangerBg: 'rgba(220,38,38,.08)',
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
<circle cx="160" cy="130" r="52" fill="#b7ea4e" opacity="0.20"/>
<circle cx="160" cy="130" r="14" fill="#b7ea4e" opacity="0.45"/>
<circle cx="1100" cy="760" r="20" fill="#b7ea4e" opacity="0.30"/>
<line x1="0" y1="280" x2="340" y2="0" stroke="#b7ea4e" stroke-width="0.9" opacity="0.22"/>
<path d="M 240 900 Q 720 620 1200 900" fill="none" stroke="#b7ea4e" stroke-width="1" opacity="0.20"/>
</svg>`)}`

const STATUS_CONFIG = {
  PENDING:  { color: T.warn,   bg: T.warnBg,   label: 'En attente' },
  APPROVED: { color: T.blue,   bg: T.blueBg,   label: 'Approuvé'  },
  REJECTED: { color: T.danger, bg: T.dangerBg, label: 'Rejeté'    },
}

function Lightbox({ src, label, onClose }) {
  return (
    <div className="drv-lightbox-overlay" onClick={onClose}>
      <div className="drv-lightbox-box" onClick={e => e.stopPropagation()}>
        <div className="drv-lightbox-header">
          <span>{label}</span>
          <button onClick={onClose} className="drv-lightbox-close">✕</button>
        </div>
        <img src={src} alt={label} className="drv-lightbox-img" />
      </div>
    </div>
  )
}

function DocImage({ src, label, color }) {
  const [open, setOpen] = useState(false)
  if (!src) return null
  return (
    <>
      <div className="drv-doc-card" style={{ borderColor: `${color}30` }} onClick={() => setOpen(true)}>
        <img src={src} alt={label} className="drv-doc-img" />
        <div className="drv-doc-footer" style={{ background: `${color}12`, color }}>
          <ImageIcon size={12} />
          <span>{label}</span>
          <ZoomIn size={11} style={{ marginLeft: 'auto' }} />
        </div>
      </div>
      {open && <Lightbox src={src} label={label} onClose={() => setOpen(false)} />}
    </>
  )
}

function InitialsAvatar({ name, color, bg }) {
  const initials = (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
  return (
    <div className="drv-avatar" style={{ background: bg, border: `1.5px solid ${color}40` }}>
      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 800, fontSize: initials.length > 1 ? '1.15rem' : '1.35rem', color, lineHeight: 1 }}>
        {initials}
      </span>
    </div>
  )
}

function InfoField({ icon: Icon, label, value, color }) {
  if (value == null || value === '') return null
  return (
    <div className="drv-info-field">
      <div className="drv-info-icon" style={{ color: color || T.muted }}><Icon size={13} /></div>
      <div>
        <div className="drv-info-label">{label}</div>
        <div className="drv-info-value">{value}</div>
      </div>
    </div>
  )
}

function DriverCard({ driver, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const cfg  = STATUS_CONFIG[driver.status] || { color: T.muted, bg: 'rgba(23,23,20,.06)', label: driver.status }
  const name = driver.fullName || driver.name || `Driver #${driver.id}`

  const licenseImg = driver.licenseImageUrl
  const vehicleImg = driver.vehicleImageUrl
  const hasImages  = licenseImg || vehicleImg

  const handle = async (status) => {
    setLoading(true)
    try   { await onUpdateStatus(driver.id, status) }
    finally { setLoading(false) }
  }

  return (
    <div className="drv-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>

      <div className="drv-card-header" onClick={() => setExpanded(e => !e)}>
        <InitialsAvatar name={name} color={cfg.color} bg={cfg.bg} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="drv-name">{name}</div>
          <div className="drv-sub-row">
            <span className="drv-sub-chip"><Mail size={10} />{driver.email || '—'}</span>
            {driver.vehicle       && <span className="drv-sub-chip"><Car      size={10} />{driver.vehicle}</span>}
            {driver.licenseNumber && <span className="drv-sub-chip"><FileText size={10} />{driver.licenseNumber}</span>}
          </div>
        </div>
        <span className="drv-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
        <div className="drv-chevron">
          {expanded ? <ChevronUp size={15} color={T.muted} /> : <ChevronDown size={15} color={T.muted} />}
        </div>
      </div>

      {/* ── Images toujours visibles ── */}
      {hasImages && (
        <div className="drv-images-strip">
          <div className="drv-images-strip-label">
            <ImageIcon size={12} /> Documents
          </div>
          <div className="drv-docs-grid">
            <DocImage src={licenseImg} label="Permis de conduire" color={T.blue} />
            <DocImage src={vehicleImg} label="Véhicule"           color={T.blue} />
          </div>
        </div>
      )}

      {/* ── Expanded ── */}
      {expanded && (
        <div className="drv-expanded">

          {/* Identité */}
          <div className="drv-section" style={{ borderColor: 'rgba(23,23,20,.07)', background: 'rgba(23,23,20,.025)' }}>
            <div className="drv-section-title" style={{ color: T.muted }}><Hash size={12} /> Identité</div>
            <div className="drv-fields-grid">
              <InfoField icon={Hash}     label="ID"                 value={driver.id}           color={T.muted} />
              <InfoField icon={Mail}     label="Email"              value={driver.email}         color={T.muted} />
              <InfoField icon={Phone}    label="Téléphone"          value={driver.phone}         color={T.muted} />
              <InfoField icon={MapPin}   label="Ville"              value={driver.city}          color={T.muted} />
              <InfoField icon={Calendar} label="Inscrit le"         value={driver.createdAt ? new Date(driver.createdAt).toLocaleDateString('fr-FR') : null} color={T.muted} />
              <InfoField icon={Clock}    label="Dernière connexion" value={driver.lastLogin  ? new Date(driver.lastLogin).toLocaleString('fr-FR')  : null} color={T.muted} />
            </div>
          </div>

          {/* Informations Driver */}
          <div className="drv-section" style={{ borderColor: `${T.blue}30`, background: T.blueBg }}>
            <div className="drv-section-title" style={{ color: T.blue }}><Car size={12} /> Informations Driver</div>
            <div className="drv-fields-grid">
              <InfoField icon={FileText}    label="N° Permis"    value={driver.licenseNumber} color={T.blue} />
              <InfoField icon={Car}         label="Véhicule"     value={driver.vehicle}       color={T.blue} />
              <InfoField icon={MapPin}      label="Zone / Ville" value={driver.city}          color={T.blue} />
              <InfoField icon={CheckCircle} label="Courses"      value={driver.totalDeliveries != null ? `${driver.totalDeliveries} livraison${driver.totalDeliveries > 1 ? 's' : ''}` : null} color={T.blue} />
            </div>
          </div>

          {/* Actions */}
          <div className="drv-actions">
            {driver.status === 'PENDING' && (<>
              <button className="drv-btn drv-btn-approve" onClick={() => handle('APPROVED')} disabled={loading}>
                <CheckCircle size={14} /> Approuver
              </button>
              <button className="drv-btn drv-btn-reject" onClick={() => handle('REJECTED')} disabled={loading}>
                <XCircle size={14} /> Rejeter
              </button>
            </>)}
            {driver.status === 'APPROVED' && (
              <button className="drv-btn drv-btn-reject" onClick={() => handle('REJECTED')} disabled={loading}>
                <XCircle size={14} /> Révoquer l'approbation
              </button>
            )}
            {driver.status === 'REJECTED' && (
              <button className="drv-btn drv-btn-approve" onClick={() => handle('APPROVED')} disabled={loading}>
                <CheckCircle size={14} /> Approuver quand même
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminDriversPage() {
  const [drivers,      setDrivers]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const load = async () => {
    setLoading(true)
    try   { const data = await driverService.getAll(); setDrivers(data) }
    catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleUpdateStatus = async (id, status) => {
    try {
      const updated = await driverService.updateStatus(id, status)
      setDrivers(prev => prev.map(d => d.id === id ? updated : d))
      toast.success(`Driver ${status === 'APPROVED' ? 'approuvé' : 'rejeté'}`)
    } catch { toast.error('Erreur de mise à jour') }
  }

  const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']
  const filtered = drivers.filter(d => {
    const q = search.toLowerCase()
    return (
      (d.fullName      || '').toLowerCase().includes(q) ||
      (d.email         || '').toLowerCase().includes(q) ||
      (d.vehicle       || '').toLowerCase().includes(q) ||
      (d.licenseNumber || '').toLowerCase().includes(q)
    ) && (filterStatus === 'ALL' || d.status === filterStatus)
  })
  const pendingCount = drivers.filter(d => d.status === 'PENDING').length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RefreshCw size={26} color={T.green} style={{ animation: 'drv-spin 1s linear infinite' }} />
      <style>{`@keyframes drv-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');
        @keyframes drv-in     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes drv-spin   { to{transform:rotate(360deg)} }
        @keyframes drv-expand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

        .drv-root {
          min-height:100vh; background-color:${T.bg};
          background-image:url("${BG_SVG}"); background-size:cover;
          background-position:center top; background-attachment:fixed;
          font-family:'Jost',sans-serif; color:${T.text};
          padding:48px 24px 80px; animation:drv-in .35s ease both;
        }
        .drv-inner { max-width:920px; margin:0 auto; }

        .drv-eyebrow { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
        .drv-eyebrow-text { font-size:.73rem; font-weight:700; letter-spacing:.11em; text-transform:uppercase; color:${T.blue}; }
        .drv-title { font-family:'Cormorant Garamond',serif; font-weight:800; font-size:2.8rem; color:${T.text}; margin:0 0 6px; line-height:1.05; }
        .drv-subtitle { font-size:.92rem; color:${T.muted}; margin:0; }

        .drv-stats-row { display:flex; gap:10px; margin-bottom:28px; flex-wrap:wrap; }
        .drv-stat-pill {
          background:rgba(255,255,255,.88); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
          border:1px solid ${T.border}; border-radius:50px; padding:7px 16px;
          display:flex; align-items:center; gap:8px; font-size:.8rem; font-weight:600;
        }
        .drv-stat-dot { width:7px; height:7px; border-radius:50%; }

        .drv-toolbar { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
        .drv-search-wrap { position:relative; flex:1; min-width:220px; }
        .drv-search {
          width:100%; padding:11px 14px 11px 38px;
          background:rgba(255,255,255,.88); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          border:1px solid ${T.border}; border-radius:50px;
          color:${T.text}; font-size:.9rem; font-family:'Jost',sans-serif;
          outline:none; box-sizing:border-box; transition:border-color .18s,box-shadow .18s;
        }
        .drv-search:focus { border-color:${T.blue}55; box-shadow:0 0 0 3px ${T.blue}12; }
        .drv-search::placeholder { color:${T.muted}; }
        .drv-filters { display:flex; gap:8px; flex-wrap:wrap; }
        .drv-filter-btn {
          padding:8px 16px; border-radius:50px; font-family:'Jost',sans-serif; font-weight:600; font-size:.8rem;
          cursor:pointer; transition:all .16s; border:1px solid ${T.border}; background:rgba(255,255,255,.7); color:${T.muted};
        }
        .drv-filter-btn.active-ALL      { background:${T.green};  border-color:${T.green};  color:#fff; }
        .drv-filter-btn.active-PENDING  { background:${T.warn};   border-color:${T.warn};   color:#fff; }
        .drv-filter-btn.active-APPROVED { background:${T.blue};   border-color:${T.blue};   color:#fff; }
        .drv-filter-btn.active-REJECTED { background:${T.danger}; border-color:${T.danger}; color:#fff; }
        .drv-refresh {
          display:flex; align-items:center; gap:8px; padding:10px 18px;
          background:rgba(255,255,255,.88); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          border:1px solid ${T.border}; border-radius:50px; color:${T.muted}; cursor:pointer;
          font-family:'Jost',sans-serif; font-size:.88rem; font-weight:600;
          transition:border-color .18s,box-shadow .18s; flex-shrink:0;
        }
        .drv-refresh:hover { border-color:${T.green}66; box-shadow:0 4px 14px rgba(23,23,20,.07); }

        .drv-list { display:flex; flex-direction:column; gap:12px; }
        .drv-card {
          background:rgba(255,255,255,.88); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          border:1px solid ${T.border}; border-radius:20px; overflow:hidden; transition:box-shadow .2s;
        }
        .drv-card:hover { box-shadow:0 6px 28px rgba(23,23,20,.09); }
        .drv-card-header { padding:16px 22px; display:flex; align-items:center; gap:14px; cursor:pointer; flex-wrap:wrap; }
        .drv-avatar { width:48px; height:48px; border-radius:13px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .drv-name { font-weight:700; font-size:.95rem; color:${T.text}; margin-bottom:5px; }
        .drv-sub-row { display:flex; flex-wrap:wrap; gap:5px; }
        .drv-sub-chip {
          display:inline-flex; align-items:center; gap:4px; font-size:.74rem; color:${T.muted};
          background:rgba(23,23,20,.04); border:1px solid rgba(23,23,20,.07); border-radius:50px; padding:2px 9px;
        }
        .drv-badge { padding:4px 13px; border-radius:50px; font-size:.74rem; font-weight:700; letter-spacing:.04em; flex-shrink:0; }
        .drv-chevron { flex-shrink:0; }

        .drv-images-strip {
          padding:12px 22px 14px;
          border-top:1px solid ${T.border};
          background:rgba(37,99,235,.025);
        }
        .drv-images-strip-label {
          display:flex; align-items:center; gap:6px; margin-bottom:10px;
          font-size:.68rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:${T.blue};
        }
        .drv-docs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; }
        .drv-doc-card {
          border:1px solid; border-radius:11px; overflow:hidden; cursor:pointer;
          transition:transform .18s,box-shadow .18s;
        }
        .drv-doc-card:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(23,23,20,.12); }
        .drv-doc-img { width:100%; height:120px; object-fit:cover; display:block; }
        .drv-doc-footer {
          display:flex; align-items:center; gap:6px; padding:7px 10px;
          font-size:.72rem; font-weight:700; letter-spacing:.04em;
        }

        .drv-lightbox-overlay {
          position:fixed; inset:0; background:rgba(23,23,20,.82); backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center;
          z-index:2000; padding:20px;
        }
        .drv-lightbox-box {
          background:#fff; border-radius:18px; overflow:hidden;
          max-width:720px; width:100%; box-shadow:0 30px 80px rgba(23,23,20,.35);
        }
        .drv-lightbox-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 18px; font-weight:700; font-size:.9rem; border-bottom:1px solid ${T.border};
        }
        .drv-lightbox-close {
          background:none; border:none; font-size:1.1rem; cursor:pointer; color:${T.muted};
          width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center;
          transition:background .15s;
        }
        .drv-lightbox-close:hover { background:rgba(23,23,20,.07); }
        .drv-lightbox-img { width:100%; max-height:70vh; object-fit:contain; display:block; }

        .drv-expanded {
          border-top:1px solid ${T.border}; padding:18px 22px 20px;
          display:flex; flex-direction:column; gap:14px; animation:drv-expand .22s ease both;
        }
        .drv-section { border:1px solid; border-radius:14px; padding:14px 16px; }
        .drv-section-title { display:flex; align-items:center; gap:6px; font-size:.68rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase; margin-bottom:12px; }
        .drv-fields-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(165px,1fr)); gap:10px 18px; }
        .drv-info-field { display:flex; align-items:flex-start; gap:8px; }
        .drv-info-icon { width:24px; height:24px; border-radius:6px; background:rgba(23,23,20,.04); display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
        .drv-info-label { font-size:.67rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:${T.muted}; margin-bottom:2px; }
        .drv-info-value { font-size:.88rem; font-weight:600; color:${T.text}; }

        .drv-actions { display:flex; gap:10px; flex-wrap:wrap; padding-top:2px; }
        .drv-btn {
          display:inline-flex; align-items:center; gap:7px; padding:10px 22px; border-radius:50px;
          font-family:'Jost',sans-serif; font-weight:700; font-size:.85rem;
          cursor:pointer; border:1px solid transparent; transition:filter .16s,transform .14s,opacity .14s;
        }
        .drv-btn:hover { filter:brightness(.92); transform:translateY(-1px); }
        .drv-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
        .drv-btn-approve { background:${T.blueBg};   border-color:${T.blue}30;   color:${T.blue};   }
        .drv-btn-reject  { background:${T.dangerBg}; border-color:${T.danger}30; color:${T.danger}; }

        .drv-empty {
          background:rgba(255,255,255,.88); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
          border:1px solid ${T.border}; border-radius:20px; padding:56px; text-align:center;
        }

        @media (max-width:600px) {
          .drv-root { padding:28px 14px 60px; }
          .drv-title { font-size:2rem; }
          .drv-card-header { padding:14px 16px; }
          .drv-images-strip { padding:10px 16px 12px; }
          .drv-expanded { padding:14px 16px 16px; }
          .drv-fields-grid { grid-template-columns:1fr 1fr; }
          .drv-docs-grid { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className="drv-root">
        <div className="drv-inner">

          <div style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="drv-eyebrow"><Car size={14} color={T.blue} /><span className="drv-eyebrow-text">Administration</span></div>
              <h1 className="drv-title">Drivers</h1>
              <p className="drv-subtitle">
                {pendingCount > 0 ? `${pendingCount} driver${pendingCount > 1 ? 's' : ''} en attente de validation` : 'Aucune validation en attente'}
              </p>
            </div>
            <button className="drv-refresh" onClick={load}><RefreshCw size={14} /> Actualiser</button>
          </div>

          <div className="drv-stats-row">
            {[
              { key: 'PENDING',  label: 'En attente', color: T.warn   },
              { key: 'APPROVED', label: 'Approuvés',  color: T.blue   },
              { key: 'REJECTED', label: 'Rejetés',    color: T.danger },
            ].map(({ key, label, color }) => (
              <div key={key} className="drv-stat-pill">
                <div className="drv-stat-dot" style={{ background: color }} />
                <span style={{ color: T.muted }}>{label}</span>
                <span style={{ color: T.text, fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>
                  {drivers.filter(d => d.status === key).length}
                </span>
              </div>
            ))}
          </div>

          <div className="drv-toolbar">
            <div className="drv-search-wrap">
              <Search size={14} color={T.muted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="drv-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, email, véhicule…" />
            </div>
            <div className="drv-filters">
              {STATUSES.map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`drv-filter-btn ${filterStatus === s ? `active-${s}` : ''}`}>
                  {s === 'ALL' ? 'Tous' : (STATUS_CONFIG[s]?.label || s)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="drv-empty">
              <Car size={44} color={T.muted} style={{ opacity: .2, margin: '0 auto 14px', display: 'block' }} />
              <p style={{ color: T.muted, margin: 0, fontSize: '.95rem' }}>Aucun driver trouvé</p>
            </div>
          ) : (
            <div className="drv-list">
              {filtered.map(d => <DriverCard key={d.id} driver={d} onUpdateStatus={handleUpdateStatus} />)}
            </div>
          )}

        </div>
      </div>
    </>
  )
}