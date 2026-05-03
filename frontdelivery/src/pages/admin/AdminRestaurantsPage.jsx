import { useEffect, useRef, useState } from 'react'
import { restaurantService } from '../../services/restaurantService'
import {
  Store, Search, CheckCircle, XCircle,
  RefreshCw, MapPin, MapPinOff, Phone,
  ChevronDown, ChevronUp, User, Tag, Navigation,
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
<line x1="0" y1="280" x2="340" y2="0" stroke="#b7ea4e" stroke-width="0.9" opacity="0.22"/>
<path d="M 240 900 Q 720 620 1200 900" fill="none" stroke="#b7ea4e" stroke-width="1" opacity="0.20"/>
</svg>`)}`

const STATUS_CONFIG = {
  PENDING:  { color: T.warn,   bg: T.warnBg,   label: 'En attente' },
  APPROVED: { color: T.blue,   bg: T.blueBg,   label: 'Approuvé'   },
  REJECTED: { color: T.danger, bg: T.dangerBg, label: 'Rejeté'     },
}

const MAR = { latMin: 27.6, latMax: 35.9, lngMin: -13.2, lngMax: -0.9 }

const validCoord = (la, lo) =>
  !isNaN(la) && !isNaN(lo) && la !== 0 && lo !== 0 &&
  la >= MAR.latMin && la <= MAR.latMax &&
  lo >= MAR.lngMin && lo <= MAR.lngMax

async function geocodeAddress(address) {
  if (!address) return null
  const token = import.meta.env.VITE_MAPBOX_TOKEN
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
    `${encodeURIComponent(address)}.json` +
    `?access_token=${token}&limit=1&country=ma&language=fr`
  try {
    const res  = await fetch(url)
    const data = await res.json()
    const f    = data?.features?.[0]
    if (!f) return null
    const [lng, lat] = f.center
    return { lat, lng }
  } catch (e) {
    console.error('Mapbox error:', e)
    return null
  }
}

function MiniMap({ lat, lng, onChange, height = 260 }) {
  const mapRef  = useRef(null)
  const instRef = useRef(null)
  const mkRef   = useRef(null)
  const icnRef  = useRef(null)

  useEffect(() => {
    const el = mapRef.current
    if (!el) return
    if (el._leaflet_id != null) {
      try { instRef.current?.remove() } catch { /* */ }
      instRef.current = null
      mkRef.current   = null
      delete el._leaflet_id
    }
    let dead = false

    import('leaflet').then(L => {
      if (dead || !mapRef.current) return

      delete L.Icon.Default.prototype._getIconUrl

      const map = L.map(mapRef.current, { zoomControl: true })
        .setView([lat ?? 31.7917, lng ?? -7.0926], lat ? 15 : 6)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19,
      }).addTo(map)

      const mkIcon = L.divIcon({
        html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="#4a7a00"/>
          <circle cx="14" cy="14" r="6" fill="#fff"/>
          <circle cx="14" cy="14" r="3.5" fill="#4a7a00"/>
        </svg>`,
        iconSize: [28, 36], iconAnchor: [14, 36], className: '',
      })
      icnRef.current = mkIcon

      if (lat && lng) {
        mkRef.current = L.marker([lat, lng], { icon: mkIcon, draggable: true }).addTo(map)
        mkRef.current.on('dragend', () => {
          const { lat: la, lng: lo } = mkRef.current.getLatLng()
          onChange(la, lo)
        })
      }

      map.on('click', e => {
        const { lat: la, lng: lo } = e.latlng
        if (mkRef.current) {
          mkRef.current.setLatLng([la, lo])
        } else {
          mkRef.current = L.marker([la, lo], { icon: mkIcon, draggable: true }).addTo(map)
          mkRef.current.on('dragend', () => {
            const { lat: dla, lng: dlo } = mkRef.current.getLatLng()
            onChange(dla, dlo)
          })
        }
        onChange(la, lo)
      })

      instRef.current = map
      setTimeout(() => { try { map.invalidateSize() } catch { /* ignore */ } }, 100)
    })

    return () => {
      dead = true
      try { instRef.current?.remove() } catch { /* ignore */ }
      instRef.current = null
      mkRef.current   = null
      if (mapRef.current) delete mapRef.current._leaflet_id
    }
  }, [])

  useEffect(() => {
    if (!instRef.current || !lat || !lng) return
    instRef.current.setView([lat, lng], 15)
    import('leaflet').then(L => {
      if (!instRef.current || mkRef.current) return
      const mkIcon = icnRef.current || L.divIcon({
        html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="#4a7a00"/>
          <circle cx="14" cy="14" r="6" fill="#fff"/>
          <circle cx="14" cy="14" r="3.5" fill="#4a7a00"/>
        </svg>`,
        iconSize: [28, 36], iconAnchor: [14, 36], className: '',
      })
      mkRef.current = L.marker([lat, lng], { icon: mkIcon, draggable: true }).addTo(instRef.current)
      mkRef.current.on('dragend', () => {
        const { lat: la, lng: lo } = mkRef.current.getLatLng()
        onChange(la, lo)
      })
    })
  }, [lat, lng]) 

  return (
    <div style={{ position: 'relative', marginTop: 10 }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={mapRef}
        style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(23,23,20,.10)' }}
      />
      <div style={{
        position: 'absolute', bottom: 10, left: 10,
        background: 'rgba(255,255,255,.90)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '0.5px solid rgba(23,23,20,.12)', padding: '5px 11px', borderRadius: 7,
        fontSize: '0.72rem', color: 'rgba(23,23,20,.5)', fontFamily: "'Jost', sans-serif",
        fontWeight: 600, pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Navigation size={10} />
        Cliquez ou glissez le marqueur
      </div>
    </div>
  )
}

function InitialsAvatar({ name, color, bg }) {
  const initials = (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
  return (
    <div className="rst-avatar" style={{ background: bg, border: `1.5px solid ${color}40` }}>
      <span style={{
        fontFamily: "'Cormorant Garamond',serif", fontWeight: 800,
        fontSize: initials.length > 1 ? '1.15rem' : '1.35rem', color, lineHeight: 1,
      }}>
        {initials}
      </span>
    </div>
  )
}

function InfoField({ icon: Icon, label, value, color }) {
  if (value == null || value === '') return null
  return (
    <div className="rst-info-field">
      <div className="rst-info-icon" style={{ color: color || T.muted }}><Icon size={13} /></div>
      <div>
        <div className="rst-info-label">{label}</div>
        <div className="rst-info-value">{value}</div>
      </div>
    </div>
  )
}

function RestaurantCard({ restaurant, onUpdateStatus, onUpdateLocation }) {
  const [expanded,  setExpanded]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [showMap,   setShowMap]   = useState(false)
  const [savingLoc, setSavingLoc] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  const initLat     = restaurant.latitude  != null ? parseFloat(restaurant.latitude)  : NaN
  const initLng     = restaurant.longitude != null ? parseFloat(restaurant.longitude) : NaN
  const hasDbCoords = validCoord(initLat, initLng)

  const [pickedLat, setPickedLat] = useState(null)
  const [pickedLng, setPickedLng] = useState(null)
  const [geocoded,  setGeocoded]  = useState(false)

  useEffect(() => {
    if (!restaurant.address) {
      if (hasDbCoords) { setPickedLat(initLat); setPickedLng(initLng) }
      return
    }
    setGeocoding(true)
    geocodeAddress(restaurant.address).then(coords => {
      if (coords && validCoord(coords.lat, coords.lng)) {
        setPickedLat(coords.lat)
        setPickedLng(coords.lng)
        setGeocoded(false)
      } else if (hasDbCoords) {
        setPickedLat(initLat)
        setPickedLng(initLng)
      }
    }).finally(() => setGeocoding(false))
  }, []) 

  useEffect(() => {
    if (!showMap || pickedLat || geocoding || !restaurant.address) return
    setGeocoding(true)
    geocodeAddress(restaurant.address).then(coords => {
      if (coords && validCoord(coords.lat, coords.lng)) {
        setPickedLat(coords.lat)
        setPickedLng(coords.lng)
        setGeocoded(true)
      }
    }).finally(() => setGeocoding(false))
  }, [showMap]) 

  const cfg    = STATUS_CONFIG[restaurant.requestStatus] || { color: T.muted, bg: 'rgba(23,23,20,.06)', label: restaurant.requestStatus }
  const hasLoc = !!(pickedLat && pickedLng)

  const handle = async (status) => {
    setLoading(true)
    try   { await onUpdateStatus(restaurant.id, status) }
    finally { setLoading(false) }
  }

  const saveLocation = async () => {
    if (!pickedLat || !pickedLng) return
    setSavingLoc(true)
    try {
      await onUpdateLocation(restaurant.id, pickedLat, pickedLng)
      toast.success('Localisation mise à jour')
      setShowMap(false)
      setGeocoded(false)
    } catch {
      toast.error('Erreur de sauvegarde')
    } finally { setSavingLoc(false) }
  }

  return (
    <div className="rst-card" style={{ borderLeft: `3px solid ${cfg.color}` }}>

      <div className="rst-card-header" onClick={() => setExpanded(e => !e)}>
        <InitialsAvatar name={restaurant.name} color={cfg.color} bg={cfg.bg} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="rst-name">{restaurant.name}</div>
          <div className="rst-sub-row">
            <span className="rst-sub-chip"><MapPin size={10} />{restaurant.address || '—'}</span>
            {restaurant.phone && <span className="rst-sub-chip"><Phone size={10} />{restaurant.phone}</span>}
          </div>
        </div>

        <span className="rst-loc-badge" style={{
          background: hasLoc ? 'rgba(74,122,0,.10)' : T.dangerBg,
          color:       hasLoc ? T.green              : T.danger,
          border:      `0.5px solid ${hasLoc ? T.green + '40' : T.danger + '40'}`,
        }}>
          {hasLoc
            ? <><MapPin size={11} /> Localisé</>
            : <><MapPinOff size={11} /> Non localisé</>
          }
        </span>

        <span className="rst-badge" style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>

        <div className="rst-chevron">
          {expanded ? <ChevronUp size={15} color={T.muted} /> : <ChevronDown size={15} color={T.muted} />}
        </div>
      </div>

      {expanded && (
        <div className="rst-expanded">

          <div className="rst-section" style={{ borderColor: 'rgba(23,23,20,.07)', background: 'rgba(23,23,20,.025)' }}>
            <div className="rst-section-title" style={{ color: T.muted }}>
              <Store size={12} /> Informations
            </div>
            <div className="rst-fields-grid">
              <InfoField icon={User}  label="Propriétaire"     value={restaurant.ownerName}                  color={T.muted} />
              <InfoField icon={Phone} label="Téléphone"        value={restaurant.phone}                      color={T.muted} />
              <InfoField icon={Tag}   label="Catégorie"        value={restaurant.categoryName}               color={T.muted} />
              <InfoField icon={Store} label="Statut ouverture" value={restaurant.open ? 'Ouvert' : 'Fermé'} color={restaurant.open ? T.green : T.danger} />
            </div>
          </div>

          {restaurant.description && (
            <div className="rst-section" style={{ borderColor: `${T.blue}30`, background: T.blueBg }}>
              <div className="rst-section-title" style={{ color: T.blue }}>
                <Store size={12} /> Description
              </div>
              <p style={{ fontSize: '.88rem', color: T.text, lineHeight: 1.65, margin: 0 }}>
                {restaurant.description}
              </p>
            </div>
          )}

          <div className="rst-section" style={{ borderColor: `${T.green}30`, background: 'rgba(74,122,0,.04)' }}>
            <div className="rst-section-title" style={{ color: T.green }}>
              <MapPin size={12} /> Localisation
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {hasLoc ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: '.82rem', fontWeight: 600, color: T.green,
                    background: 'rgba(74,122,0,.08)', border: `0.5px solid ${T.green}30`,
                    borderRadius: 8, padding: '6px 12px',
                  }}>
                    <Navigation size={12} />
                    {Number(pickedLat).toFixed(5)}, {Number(pickedLng).toFixed(5)}
                  </span>
                ) : (
                  <span style={{ fontSize: '.82rem', color: T.muted, fontStyle: 'italic' }}>
                    Aucune coordonnée définie
                  </span>
                )}
                {geocoded && (
                  <span style={{
                    fontSize: '.7rem', color: T.warn, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>
                    <Navigation size={10} />
                    Position estimée via l'adresse vérifiez avant de sauvegarder
                  </span>
                )}
              </div>

              <button
                onClick={e => { e.stopPropagation(); setShowMap(m => !m) }}
                className={`rst-map-toggle-btn${showMap ? ' active' : ''}`}
              >
                <MapPin size={13} />
                {showMap ? 'Masquer la carte' : hasLoc ? 'Modifier sur la carte' : 'Définir sur la carte'}
                {showMap ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {showMap && (
              <>
                {geocoding ? (
                  <div style={{
                    height: 260, marginTop: 10, borderRadius: 12,
                    border: '1px solid rgba(23,23,20,.10)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 10, fontSize: '.85rem', color: T.muted,
                    background: 'rgba(23,23,20,.02)',
                  }}>
                    <RefreshCw size={16} color={T.green} style={{ animation: 'rst-spin 1s linear infinite' }} />
                    Géocodage de l'adresse…
                  </div>
                ) : (
                  <MiniMap
                    lat={pickedLat}
                    lng={pickedLng}
                    onChange={(la, lo) => { setPickedLat(la); setPickedLng(lo); setGeocoded(false) }}
                    height={260}
                  />
                )}
                <button
                  className="rst-btn-save-loc"
                  onClick={saveLocation}
                  disabled={savingLoc || !pickedLat || !pickedLng || geocoding}
                >
                  <CheckCircle size={15} />
                  {savingLoc ? 'Sauvegarde…' : 'Sauvegarder la localisation'}
                </button>
              </>
            )}
          </div>

          <div className="rst-actions">
            {restaurant.requestStatus === 'PENDING' && (<>
              <button className="rst-btn rst-btn-approve" onClick={() => handle('APPROVED')} disabled={loading}>
                <CheckCircle size={14} /> Approuver
              </button>
              <button className="rst-btn rst-btn-reject" onClick={() => handle('REJECTED')} disabled={loading}>
                <XCircle size={14} /> Rejeter
              </button>
            </>)}
            {restaurant.requestStatus === 'APPROVED' && (
              <button className="rst-btn rst-btn-reject" onClick={() => handle('REJECTED')} disabled={loading}>
                <XCircle size={14} /> Révoquer l'approbation
              </button>
            )}
            {restaurant.requestStatus === 'REJECTED' && (
              <button className="rst-btn rst-btn-approve" onClick={() => handle('APPROVED')} disabled={loading}>
                <CheckCircle size={14} /> Approuver quand même
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

export default function AdminRestaurantsPage() {
  const [restaurants,  setRestaurants]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const load = async () => {
    setLoading(true)
    try {
      const [pending, all] = await Promise.all([
        restaurantService.getPending(),
        restaurantService.getAll(),
      ])
      const map = new Map()
      ;[...pending, ...all].forEach(r => map.set(r.id, r))
      setRestaurants(Array.from(map.values()))
    } catch {
      toast.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleUpdateStatus = async (id, status) => {
    try {
      const updated = await restaurantService.updateStatus(id, status)
      setRestaurants(prev => prev.map(r => r.id === id ? updated : r))
      toast.success(status === 'APPROVED' ? 'Restaurant approuvé' : 'Restaurant rejeté')
    } catch {
      toast.error('Erreur de mise à jour')
    }
  }

  const handleUpdateLocation = async (id, lat, lng) => {
    const updated = await restaurantService.updateLocationAdmin(id, lat, lng)
    setRestaurants(prev => prev.map(r => r.id === id ? updated : r))
  }

  const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

  const filtered = restaurants.filter(r => {
    const q = search.toLowerCase()
    return (
      ((r.name    || '').toLowerCase().includes(q) ||
       (r.address || '').toLowerCase().includes(q))
      && (filterStatus === 'ALL' || r.requestStatus === filterStatus)
    )
  })

  const pendingCount = restaurants.filter(r => r.requestStatus === 'PENDING').length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RefreshCw size={26} color={T.green} style={{ animation: 'rst-spin 1s linear infinite' }} />
      <style>{`@keyframes rst-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');
        @keyframes rst-in     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rst-spin   { to{transform:rotate(360deg)} }
        @keyframes rst-expand { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }

        .rst-root {
          min-height: 100vh;
          background-color: ${T.bg};
          background-image: url("${BG_SVG}");
          background-size: cover; background-position: center top; background-attachment: fixed;
          font-family: 'Jost', sans-serif; color: ${T.text};
          padding: 48px 24px 80px; animation: rst-in .35s ease both;
        }
        .rst-inner { max-width: 920px; margin: 0 auto; }
        .rst-eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .rst-eyebrow-text { font-size: .73rem; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; color: ${T.green}; }
        .rst-title { font-family: 'Cormorant Garamond', serif; font-weight: 800; font-size: 2.8rem; color: ${T.text}; margin: 0 0 6px; line-height: 1.05; }
        .rst-subtitle { font-size: .92rem; color: ${T.muted}; margin: 0; }
        .rst-stats-row { display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap; }
        .rst-stat-pill {
          background: rgba(255,255,255,.88); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          border: 1px solid ${T.border}; border-radius: 50px; padding: 7px 16px;
          display: flex; align-items: center; gap: 8px; font-size: .8rem; font-weight: 600;
        }
        .rst-stat-dot { width: 7px; height: 7px; border-radius: 50%; }
        .rst-toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .rst-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .rst-search {
          width: 100%; padding: 11px 14px 11px 38px;
          background: rgba(255,255,255,.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border}; border-radius: 50px;
          color: ${T.text}; font-size: .9rem; font-family: 'Jost', sans-serif;
          outline: none; box-sizing: border-box; transition: border-color .18s, box-shadow .18s;
        }
        .rst-search:focus { border-color: ${T.green}55; box-shadow: 0 0 0 3px ${T.green}12; }
        .rst-search::placeholder { color: ${T.muted}; }
        .rst-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .rst-filter-btn {
          padding: 8px 16px; border-radius: 50px; font-family: 'Jost', sans-serif; font-weight: 600; font-size: .8rem;
          cursor: pointer; transition: all .16s; border: 1px solid ${T.border};
          background: rgba(255,255,255,.7); color: ${T.muted};
        }
        .rst-filter-btn.active-ALL      { background: ${T.green};  border-color: ${T.green};  color: #fff; }
        .rst-filter-btn.active-PENDING  { background: ${T.warn};   border-color: ${T.warn};   color: #fff; }
        .rst-filter-btn.active-APPROVED { background: ${T.blue};   border-color: ${T.blue};   color: #fff; }
        .rst-filter-btn.active-REJECTED { background: ${T.danger}; border-color: ${T.danger}; color: #fff; }
        .rst-refresh {
          display: flex; align-items: center; gap: 8px; padding: 10px 18px;
          background: rgba(255,255,255,.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border}; border-radius: 50px; color: ${T.muted}; cursor: pointer;
          font-family: 'Jost', sans-serif; font-size: .88rem; font-weight: 600;
          transition: border-color .18s, box-shadow .18s; flex-shrink: 0;
        }
        .rst-refresh:hover { border-color: ${T.green}66; box-shadow: 0 4px 14px rgba(23,23,20,.07); }
        .rst-list { display: flex; flex-direction: column; gap: 12px; }
        .rst-card {
          background: rgba(255,255,255,.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border}; border-radius: 20px; overflow: hidden; transition: box-shadow .2s;
        }
        .rst-card:hover { box-shadow: 0 6px 28px rgba(23,23,20,.09); }
        .rst-card-header {
          padding: 16px 22px; display: flex; align-items: center; gap: 14px;
          cursor: pointer; flex-wrap: wrap;
        }
        .rst-avatar { width: 48px; height: 48px; border-radius: 13px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .rst-name { font-weight: 700; font-size: .95rem; color: ${T.text}; margin-bottom: 5px; }
        .rst-sub-row { display: flex; flex-wrap: wrap; gap: 5px; }
        .rst-sub-chip {
          display: inline-flex; align-items: center; gap: 4px; font-size: .74rem; color: ${T.muted};
          background: rgba(23,23,20,.04); border: 1px solid rgba(23,23,20,.07); border-radius: 50px; padding: 2px 9px;
        }
        .rst-loc-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 50px; font-size: .72rem; font-weight: 700; flex-shrink: 0;
        }
        .rst-badge { padding: 4px 13px; border-radius: 50px; font-size: .74rem; font-weight: 700; letter-spacing: .04em; flex-shrink: 0; }
        .rst-chevron { flex-shrink: 0; }
        .rst-expanded {
          border-top: 1px solid ${T.border}; padding: 18px 22px 20px;
          display: flex; flex-direction: column; gap: 14px; animation: rst-expand .22s ease both;
        }
        .rst-section { border: 1px solid; border-radius: 14px; padding: 14px 16px; }
        .rst-section-title {
          display: flex; align-items: center; gap: 6px;
          font-size: .68rem; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; margin-bottom: 12px;
        }
        .rst-fields-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 10px 18px; }
        .rst-info-field { display: flex; align-items: flex-start; gap: 8px; }
        .rst-info-icon { width: 24px; height: 24px; border-radius: 6px; background: rgba(23,23,20,.04); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .rst-info-label { font-size: .67rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: ${T.muted}; margin-bottom: 2px; }
        .rst-info-value { font-size: .88rem; font-weight: 600; color: ${T.text}; }
        .rst-map-toggle-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 50px; font-family: 'Jost', sans-serif;
          font-weight: 600; font-size: .8rem; cursor: pointer; transition: all .16s;
          border: 1px solid rgba(23,23,20,.10); background: rgba(255,255,255,.7); color: ${T.muted};
        }
        .rst-map-toggle-btn.active { background: rgba(74,122,0,.10); border-color: ${T.green}50; color: ${T.green}; }
        .rst-map-toggle-btn:hover  { border-color: ${T.green}50; color: ${T.green}; }
        .rst-btn-save-loc {
          margin-top: 10px; width: 100%; padding: 11px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: ${T.green}; color: #fff; border: none; border-radius: 10px;
          font-weight: 700; font-size: .9rem; cursor: pointer; font-family: 'Jost', sans-serif;
          transition: filter .16s;
        }
        .rst-btn-save-loc:hover    { filter: brightness(1.1); }
        .rst-btn-save-loc:disabled { opacity: .5; cursor: not-allowed; }
        .rst-actions { display: flex; gap: 10px; flex-wrap: wrap; padding-top: 2px; }
        .rst-btn {
          display: inline-flex; align-items: center; gap: 7px; padding: 10px 22px; border-radius: 50px;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .85rem;
          cursor: pointer; border: 1px solid transparent; transition: filter .16s, transform .14s, opacity .14s;
        }
        .rst-btn:hover    { filter: brightness(.92); transform: translateY(-1px); }
        .rst-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; }
        .rst-btn-approve { background: ${T.blueBg};   border-color: ${T.blue}30;   color: ${T.blue};   }
        .rst-btn-reject  { background: ${T.dangerBg}; border-color: ${T.danger}30; color: ${T.danger}; }
        .rst-empty {
          background: rgba(255,255,255,.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border}; border-radius: 20px; padding: 56px; text-align: center;
        }
        @media (max-width: 600px) {
          .rst-root { padding: 28px 14px 60px; }
          .rst-title { font-size: 2rem; }
          .rst-card-header { padding: 14px 16px; }
          .rst-expanded { padding: 14px 16px 16px; }
          .rst-fields-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="rst-root">
        <div className="rst-inner">

          <div style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="rst-eyebrow">
                <Store size={14} color={T.green} />
                <span className="rst-eyebrow-text">Administration</span>
              </div>
              <h1 className="rst-title">Restaurants</h1>
              <p className="rst-subtitle">
                {pendingCount > 0
                  ? `${pendingCount} restaurant${pendingCount > 1 ? 's' : ''} en attente de validation`
                  : 'Aucune validation en attente'}
              </p>
            </div>
            <button className="rst-refresh" onClick={load}>
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>

          <div className="rst-stats-row">
            {[
              { key: 'PENDING',  label: 'En attente', color: T.warn   },
              { key: 'APPROVED', label: 'Approuvés',  color: T.blue   },
              { key: 'REJECTED', label: 'Rejetés',    color: T.danger },
            ].map(({ key, label, color }) => (
              <div key={key} className="rst-stat-pill">
                <div className="rst-stat-dot" style={{ background: color }} />
                <span style={{ color: T.muted }}>{label}</span>
                <span style={{ color: T.text, fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>
                  {restaurants.filter(r => r.requestStatus === key).length}
                </span>
              </div>
            ))}
          </div>

          <div className="rst-toolbar">
            <div className="rst-search-wrap">
              <Search size={14} color={T.muted} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="rst-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom, adresse…"
              />
            </div>
            <div className="rst-filters">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`rst-filter-btn ${filterStatus === s ? `active-${s}` : ''}`}
                >
                  {s === 'ALL' ? 'Tous' : (STATUS_CONFIG[s]?.label || s)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rst-empty">
              <Store size={44} color={T.muted} style={{ opacity: .2, margin: '0 auto 14px', display: 'block' }} />
              <p style={{ color: T.muted, margin: 0, fontSize: '.95rem' }}>Aucun restaurant trouvé</p>
            </div>
          ) : (
            <div className="rst-list">
              {filtered.map(r => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdateLocation={handleUpdateLocation}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}