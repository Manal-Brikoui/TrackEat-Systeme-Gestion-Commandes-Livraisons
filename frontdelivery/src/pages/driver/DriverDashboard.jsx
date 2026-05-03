import { useState, useEffect, useCallback, useRef } from 'react'
import { Phone, MapPin, CheckCircle, XCircle, Package, ToggleLeft, ToggleRight } from 'lucide-react'
import { driverService } from '../../services/driverService'
import { orderService } from '../../services/orderService'
import { useWebSocket } from '../../hooks/useWebSocket'
import { PageLoader } from '../../components/common/Loader'
import { formatPrice } from '../../utils/formatPrice'
import { formatDateTime } from '../../utils/formatDate'
import LocationPickerMap from '../../components/map/LocationPickerMap'
import toast from 'react-hot-toast'

const MAR = { latMin: 27.6, latMax: 35.9, lngMin: -13.2, lngMax: -0.9 }
const validCoord = (la, lo) =>
  !isNaN(Number(la)) && !isNaN(Number(lo)) &&
  Number(la) !== 0 && Number(lo) !== 0 &&
  Number(la) >= MAR.latMin && Number(la) <= MAR.latMax &&
  Number(lo) >= MAR.lngMin && Number(lo) <= MAR.lngMax

const MotoIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="2.5"/>
    <circle cx="18.5" cy="17.5" r="2.5"/>
    <path d="M8 17.5h7"/>
    <path d="M12 17.5V11l-3-5h5l2 4h2"/>
    <path d="M7 12h4"/>
  </svg>
)

const TABS = [
  { key: 'available', label: 'Disponibles', icon: <Package size={12} strokeWidth={1.8} /> },
  { key: 'active',    label: 'En cours',    icon: <MotoIcon size={12} /> },
  { key: 'history',   label: 'Historique',  icon: <CheckCircle size={12} strokeWidth={1.8} /> },
]

function AddressSearch({ onSelect }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const timerRef   = useRef(null)
  const pickingRef = useRef(false)

  const search = (val) => {
    setQuery(val)
    setOpen(false)
    clearTimeout(timerRef.current)
    if (!val.trim() || val.length < 3) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const token = import.meta.env.VITE_MAPBOX_TOKEN
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${token}&limit=5&country=ma&language=fr`
        const data = await (await fetch(url)).json()
        setResults(data?.features || [])
        setOpen(true)
      } catch { /* */ }
      finally { setLoading(false) }
    }, 400)
  }

  const pick = (f) => {
    const [lng, lat] = f.center
    setQuery(f.place_name)
    setResults([])
    setOpen(false)
    pickingRef.current = false
    onSelect(lat, lng)
  }

  return (
    <div style={{ position: 'relative', marginBottom: 10, zIndex: 9999 }}>
      <div style={{ position: 'relative' }}>
        <MapPin size={14} color="#4a7a00" style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', pointerEvents: 'none',
        }} />
        <input
          value={query}
          onChange={e => search(e.target.value)}
          placeholder="Tapez votre adresse actuelle…"
          style={{
            width: '100%', padding: '11px 36px 11px 36px',
            border: '1px solid rgba(23,23,20,.1)', borderRadius: 12,
            background: '#fafaf7', fontFamily: "'Jost', sans-serif",
            fontSize: '.88rem', color: '#171714', outline: 'none',
            boxSizing: 'border-box', transition: 'border-color .15s, box-shadow .15s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(183,234,78,.6)'
            e.target.style.boxShadow   = '0 0 0 3px rgba(183,234,78,.12)'
            if (results.length > 0) setOpen(true)
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(23,23,20,.1)'
            e.target.style.boxShadow   = 'none'
            if (!pickingRef.current) {
              setTimeout(() => setOpen(false), 150)
            }
          }}
        />
        {loading && (
          <div style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            width: 14, height: 14, borderRadius: '50%',
            border: '2px solid rgba(23,23,20,.1)', borderTopColor: '#4a7a00',
            animation: 'dd-spin .7s linear infinite',
          }} />
        )}
      </div>

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#fff', border: '1px solid rgba(23,23,20,.1)',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(23,23,20,.1)', zIndex: 9999,
        }}>
          {results.map((f, i) => (
            <div
              key={f.id || i}
              onMouseDown={() => { pickingRef.current = true }}
              onMouseUp={() => pick(f)}
              onTouchEnd={() => pick(f)}
              style={{
                padding: '11px 14px', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid rgba(23,23,20,.05)' : 'none',
                display: 'flex', alignItems: 'flex-start', gap: 10,
                transition: 'background .12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(183,234,78,.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={13} color="#4a7a00" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '.85rem', fontWeight: 600, color: '#171714' }}>
                  {f.text}
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(23,23,20,.4)', marginTop: 2 }}>
                  {f.place_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DriverDashboard() {
  const [profile,      setProfile]      = useState(null)
  const [available,    setAvailable]    = useState([])
  const [myOrders,     setMyOrders]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [tab,          setTab]          = useState('available')
  const [toggling,     setToggling]     = useState(false)
  const [driverCoords, setDriverCoords] = useState(null)
  const [locationSent, setLocationSent] = useState(false)

  const sendLocation = useCallback((lat, lng) => {
    if (!validCoord(lat, lng)) return

    setDriverCoords({ latitude: lat, longitude: lng })
    setLocationSent(false)
    driverService.updateLocation(lat, lng)
      .then(() => setLocationSent(true))
      .catch(err => console.error('Location update error:', err))
  }, []) 
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        if (validCoord(latitude, longitude))
          sendLocation(latitude, longitude)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [sendLocation]) 
  const load = useCallback(async () => {
    try {
      const p = await driverService.getMyProfile()
      setProfile(p)
      const dLat = parseFloat(p.currentLatitude)
      const dLng = parseFloat(p.currentLongitude)
      // Only set from profile if we don't already have GPS coords
      if (validCoord(dLat, dLng))
        setDriverCoords(prev => prev ?? { latitude: dLat, longitude: dLng })
      const avail = await orderService.getAvailable()
      const filtered = p.restaurantId
        ? avail.filter(o => String(o.restaurantId) === String(p.restaurantId))
        : avail
      setAvailable(filtered)
      const driverId = p.userId ?? p.id
      setMyOrders(await orderService.getByDriver(driverId))
    } catch (err) {
      console.error('Error loading driver dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleMapPick    = (lat, lng) => sendLocation(lat, lng)
  const handleAddrSelect = (lat, lng) => sendLocation(lat, lng)

  useWebSocket('driver-ws', msg => {
    if (['NEW_DELIVERY', 'ORDER_AVAILABLE', 'ORDER_UPDATED'].includes(msg.type)) {
      load()
      if (msg.type === 'NEW_DELIVERY') toast('Nouvelle demande de livraison !')
    }
  })

  const toggle = async () => {
    if (toggling) return
    setToggling(true)
    try {
      const res = await driverService.toggleAvailability()
      setProfile(res)
      toast.success(res.available ? 'Vous êtes en ligne' : 'Vous êtes hors ligne')
    } catch { toast.error('Erreur') }
    finally { setToggling(false) }
  }

  const accept = async id => {
    try { await orderService.driverAccept(id); toast.success('Commande acceptée !'); load() }
    catch { toast.error("Erreur lors de l'acceptation") }
  }

  const reject = async id => {
    try { await orderService.driverReject(id); toast.success('Commande refusée'); load() }
    catch { toast.error('Erreur') }
  }

  const deliver = async id => {
    if (!window.confirm('Confirmer la livraison ?')) return
    try { await orderService.deliver(id); toast.success('Livraison confirmée !'); load() }
    catch { toast.error('Erreur') }
  }

  if (loading) return <PageLoader />

  const active = myOrders.filter(o => o.status === 'PICKED_UP')
  const done   = myOrders.filter(o => o.status === 'DELIVERED')

  const mapLat = driverCoords?.latitude  ?? null
  const mapLng = driverCoords?.longitude ?? null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes dd-fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dd-shimmer { from{background-position:0 center} to{background-position:200% center} }
        @keyframes dd-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes dd-pop     { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dd-spin    { to{transform:rotate(360deg)} }

        .dd-root {
          background: #fafaf7; color: #171714; font-family: 'Jost', sans-serif;
          min-height: calc(100vh - var(--nav-h, 0px));
          padding: 0 !important; max-width: 100% !important;
          animation: dd-fadeIn .35s ease both;
        }
        .dd-hero {
          padding: 44px 24px 36px; border-bottom: 1px solid rgba(23,23,20,.07);
          position: relative; overflow: hidden; margin-bottom: 32px;
        }
        .dd-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(23,23,20,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,23,20,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .dd-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 70% 0%, rgba(183,234,78,.09) 0%, transparent 68%);
        }
        .dd-hero-inner { max-width: 720px; margin: 0 auto; position: relative; z-index: 1; }
        .dd-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 50px;
          background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.28);
          font-size: .7rem; font-weight: 700; color: #4a7a00;
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 14px;
        }
        .dd-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #b7ea4e;
          animation: dd-pulse 2s ease-in-out infinite;
        }
        .dd-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.05;
          color: #171714; margin: 0 0 8px;
        }
        .dd-title-accent {
          background: linear-gradient(90deg, #4a7a00 0%, #b7ea4e 50%, #4a7a00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: dd-shimmer 3.2s linear infinite;
        }
        .dd-subtitle { font-size: .88rem; color: rgba(23,23,20,.45); font-weight: 300; margin: 0; }
        .dd-body { max-width: 720px; margin: 0 auto; padding: 0 24px 60px; }
        .dd-section {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.05rem; color: #171714;
          padding-bottom: 14px; margin-bottom: 18px;
          border-bottom: 1px solid rgba(23,23,20,.07);
          display: flex; align-items: center; gap: 8px;
        }
        .dd-section svg { color: #4a7a00; }
        .dd-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px; padding: 24px 22px; margin-bottom: 16px;
          animation: dd-pop .3s ease both;
        }
        .dd-statusbar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .dd-avatar {
          width: 46px; height: 46px; border-radius: 50%;
          background: rgba(183,234,78,.1); border: 2px solid rgba(183,234,78,.55);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .dd-name { font-family: 'Cormorant Garamond', serif; font-weight: 800; font-size: 1.1rem; }
        .dd-online-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .dd-online-dot { width: 6px; height: 6px; border-radius: 50%; animation: dd-pulse 2s ease-in-out infinite; }
        .dd-online-label { font-size: .8rem; font-weight: 600; }
        .dd-toggle-group { display: flex; gap: 8px; }
        .dd-toggle-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 50px; cursor: pointer;
          font-family: 'Jost', sans-serif; font-size: .82rem; font-weight: 700;
          border: 1.5px solid; transition: all .18s;
        }
        .dd-toggle-btn:disabled { opacity: .4; cursor: not-allowed; }
        .dd-toggle-btn.online-active  { background: #171714; color: #fafaf7; border-color: #171714; }
        .dd-toggle-btn.online-active:hover:not(:disabled)  { background: #4a7a00; border-color: #4a7a00; }
        .dd-toggle-btn.offline-active { background: #c43232; color: #fff; border-color: #c43232; }
        .dd-toggle-btn.offline-active:hover:not(:disabled) { background: #a02626; border-color: #a02626; }
        .dd-toggle-btn.inactive { background: #fff; color: rgba(23,23,20,.4); border-color: rgba(23,23,20,.12); }
        .dd-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
        .dd-stat {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 16px; padding: 16px 14px; text-align: center;
          animation: dd-pop .25s ease both;
        }
        .dd-stat-val {
          font-family: 'Cormorant Garamond', serif; font-weight: 800; font-size: 1.6rem;
          margin-bottom: 4px; line-height: 1;
        }
        .dd-stat-lbl { font-size: .72rem; font-weight: 600; color: rgba(23,23,20,.4); letter-spacing: .04em; text-transform: uppercase; }
        .dd-tabs {
          display: flex; gap: 4px; margin-bottom: 16px;
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 14px; padding: 5px;
        }
        .dd-tab {
          flex: 1; padding: 9px 8px; border-radius: 10px; border: none; cursor: pointer;
          background: transparent; font-family: 'Jost', sans-serif;
          font-size: .8rem; font-weight: 600; color: rgba(23,23,20,.4);
          transition: all .16s; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .dd-tab.active { background: #171714; color: #fafaf7; }
        .dd-tab:hover:not(.active) { background: rgba(23,23,20,.04); color: #171714; }
        .dd-tab-badge { padding: 2px 7px; border-radius: 50px; font-size: .65rem; font-weight: 700; }
        .dd-badge-accent { background: rgba(183,234,78,.2); color: #4a7a00; }
        .dd-badge-warn   { background: rgba(234,183,78,.2); color: #7a5a00; }
        .dd-order {
          background: #fff; border: 1px solid rgba(23,23,20,.08); border-radius: 16px;
          padding: 18px 16px; margin-bottom: 10px;
          border-left: 3px solid transparent; animation: dd-pop .25s ease both;
        }
        .dd-order.avail  { border-left-color: rgba(183,234,78,.7); }
        .dd-order.active { border-left-color: rgba(234,183,78,.7); }
        .dd-order.done   { border-left-color: rgba(74,122,0,.3); }
        .dd-order-id    { font-family: 'Cormorant Garamond', serif; font-weight: 800; font-size: 1rem; color: #171714; }
        .dd-order-meta  { font-size: .82rem; color: rgba(23,23,20,.45); margin-top: 3px; }
        .dd-order-addr  { font-size: .82rem; color: rgba(23,23,20,.45); margin-top: 2px; display: flex; align-items: center; gap: 5px; }
        .dd-order-price { font-weight: 700; color: #4a7a00; font-size: 1rem; margin-top: 8px; }
        .dd-order-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
        .dd-btn-accept {
          flex: 1; padding: 10px 16px; border-radius: 50px; border: none; cursor: pointer;
          background: #4a7a00; color: #fff;
          font-family: 'Jost', sans-serif; font-size: .82rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .18s;
        }
        .dd-btn-accept:hover { background: #3a6200; }
        .dd-btn-reject {
          flex: 1; padding: 10px 16px; border-radius: 50px; cursor: pointer;
          border: 1.5px solid rgba(196,50,50,.25); background: rgba(196,50,50,.05); color: #c43232;
          font-family: 'Jost', sans-serif; font-size: .82rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .18s;
        }
        .dd-btn-reject:hover { background: rgba(196,50,50,.1); }
        .dd-btn-deliver {
          padding: 9px 20px; border-radius: 50px; border: none; cursor: pointer;
          background: #171714; color: #fafaf7;
          font-family: 'Jost', sans-serif; font-size: .82rem; font-weight: 700;
          display: flex; align-items: center; gap: 6px; transition: all .18s;
        }
        .dd-btn-deliver:hover { background: #4a7a00; box-shadow: 0 4px 16px rgba(74,122,0,.22); }
        .dd-btn-call {
          padding: 9px 16px; border-radius: 50px; cursor: pointer;
          border: 1.5px solid rgba(23,23,20,.12); background: #fafaf7; color: rgba(23,23,20,.55);
          font-family: 'Jost', sans-serif; font-size: .82rem; font-weight: 600;
          display: flex; align-items: center; gap: 6px; transition: all .18s;
        }
        .dd-btn-call:hover { border-color: rgba(183,234,78,.5); color: #4a7a00; }
        .dd-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 50px; font-size: .72rem; font-weight: 700;
        }
        .dd-badge-delivered { background: rgba(74,122,0,.08); color: #4a7a00; }
        .dd-badge-pickedup  { background: rgba(234,183,78,.12); color: #7a5a00; }
        .dd-warning {
          background: rgba(234,183,78,.07); border: 1px solid rgba(234,183,78,.35);
          border-radius: 12px; padding: 11px 16px; margin-bottom: 14px;
          display: flex; align-items: center; gap: 9px;
          font-size: .83rem; font-weight: 600; color: #7a5a00;
        }
        .dd-empty { text-align: center; padding: 48px 20px; }
        .dd-empty-icon {
          width: 56px; height: 56px; border-radius: 18px;
          background: rgba(23,23,20,.04); border: 1px solid rgba(23,23,20,.07);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
        }
        .dd-empty-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.1rem; color: #171714; margin-bottom: 6px;
        }
        .dd-empty-desc { font-size: .82rem; color: rgba(23,23,20,.4); font-weight: 300; }
        .dd-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(23,23,20,.15); border-top-color: currentColor;
          animation: dd-spin .7s linear infinite;
        }
        .dd-loc-info {
          margin-top: 9px; font-size: .75rem; font-weight: 600;
          display: flex; align-items: center; gap: 6px;
        }
        .dd-map-placeholder {
          height: 220px; border-radius: 10px;
          background: #f2f4ed; border: 1px solid rgba(23,23,20,.08);
          display: flex; align-items: center; justify-content: center;
          gap: 10px; color: rgba(23,23,20,.35); font-size: .82rem; font-weight: 600;
        }
        .leaflet-control-zoom { z-index: 400 !important; }
        @media (max-width: 640px) {
          .dd-hero  { padding: 32px 20px 28px; }
          .dd-body  { padding: 0 16px 48px; }
          .dd-card  { padding: 20px 18px; }
          .dd-stats { grid-template-columns: repeat(2, 1fr); }
          .dd-tab   { font-size: .73rem; padding: 8px 4px; }
        }
      `}</style>

      <div className="dd-root">

        <div className="dd-hero">
          <div className="dd-hero-grid" />
          <div className="dd-hero-glow" />
          <div className="dd-hero-inner">
            <div className="dd-eyebrow">
              <div className="dd-eyebrow-dot" />
              Espace livreur
            </div>
            <h1 className="dd-title">
              Tableau de <span className="dd-title-accent">bord</span>
            </h1>
            <p className="dd-subtitle">Gérez vos livraisons · Mettez à jour votre position</p>
          </div>
        </div>

        <div className="dd-body">


          <div className="dd-card" style={{
            background:  profile?.available ? 'rgba(183,234,78,.04)' : '#fff',
            borderColor: profile?.available ? 'rgba(183,234,78,.28)' : 'rgba(23,23,20,.08)',
          }}>
            <div className="dd-statusbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div className="dd-avatar">
                  <MotoIcon size={22} color="#4a7a00" />
                </div>
                <div>
                  <div className="dd-name">{profile?.firstName} {profile?.lastName}</div>
                  <div className="dd-online-row">
                    <div className="dd-online-dot" style={{
                      background: profile?.available ? '#b7ea4e' : 'rgba(23,23,20,.25)',
                    }} />
                    <span className="dd-online-label" style={{
                      color: profile?.available ? '#4a7a00' : 'rgba(23,23,20,.35)',
                    }}>
                      {profile?.available ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dd-toggle-group">
                <button
                  className={`dd-toggle-btn ${profile?.available ? 'inactive' : 'online-active'}`}
                  onClick={toggle}
                  disabled={toggling || profile?.available === true}
                >
                  {toggling && !profile?.available
                    ? <span className="dd-spinner" />
                    : <ToggleLeft size={14} strokeWidth={2} />
                  }
                  En ligne
                </button>
                <button
                  className={`dd-toggle-btn ${profile?.available ? 'offline-active' : 'inactive'}`}
                  onClick={toggle}
                  disabled={toggling || profile?.available !== true}
                >
                  {toggling && profile?.available
                    ? <span className="dd-spinner" />
                    : <ToggleRight size={14} strokeWidth={2} />
                  }
                  Hors ligne
                </button>
              </div>
            </div>
          </div>


          <div className="dd-card" style={{ overflow: 'visible', position: 'relative', zIndex: 10 }}>
            <div className="dd-section">
              <MapPin size={15} />
              Ma position actuelle
            </div>
            <p style={{ fontSize: '.78rem', color: 'rgba(23,23,20,.4)', fontWeight: 300, marginBottom: 12 }}>
              Tapez votre adresse ou cliquez directement sur la carte
            </p>

            <AddressSearch onSelect={handleAddrSelect} />

            {mapLat && mapLng ? (
              <LocationPickerMap
                key={`${mapLat.toFixed(5)}-${mapLng.toFixed(5)}`}
                lat={mapLat}
                lng={mapLng}
                onChange={handleMapPick}
                height={220}
              />
            ) : (
              <div className="dd-map-placeholder">
                <MapPin size={16} style={{ opacity: .4 }} />
                La carte apparaîtra après sélection d'une adresse
              </div>
            )}

            {driverCoords && (
              <div className="dd-loc-info" style={{ color: locationSent ? '#4a7a00' : 'rgba(23,23,20,.35)' }}>
                <span>{locationSent ? 'Position envoyée ✓' : 'Envoi en cours…'}</span>
                <span style={{ opacity: .6 }}>
                  — {driverCoords.latitude.toFixed(5)}, {driverCoords.longitude.toFixed(5)}
                </span>
              </div>
            )}
          </div>

          <div className="dd-stats">
            {[
              { label: 'Disponibles', val: available.length,        color: 'rgba(23,23,20,.55)' },
              { label: 'En cours',    val: active.length,           color: '#b7891e'             },
              { label: 'Livrées',     val: done.length,             color: '#4a7a00'             },
              { label: 'Véhicule',    val: profile?.vehicle || '—', color: '#4a7a00', small: true },
            ].map((s, i) => (
              <div className="dd-stat" key={i} style={{ animationDelay: `${i * .07}s` }}>
                <div className="dd-stat-val" style={{ color: s.color, fontSize: s.small ? '1rem' : undefined }}>
                  {s.val}
                </div>
                <div className="dd-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="dd-tabs">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                className={`dd-tab ${tab === key ? 'active' : ''}`}
                onClick={() => setTab(key)}
              >
                {icon}{label}
                {key === 'available' && available.length > 0 && (
                  <span className="dd-tab-badge dd-badge-accent">{available.length}</span>
                )}
                {key === 'active' && active.length > 0 && (
                  <span className="dd-tab-badge dd-badge-warn">{active.length}</span>
                )}
              </button>
            ))}
          </div>

          {tab === 'available' && (
            <div>
              {!profile?.available && (
                <div className="dd-warning">
                  <ToggleLeft size={16} />
                  Passez en ligne pour recevoir des commandes
                </div>
              )}
              {available.length === 0
                ? (
                  <div className="dd-empty">
                    <div className="dd-empty-icon"><Package size={28} strokeWidth={1.4} /></div>
                    <div className="dd-empty-title">Aucune commande disponible</div>
                    <div className="dd-empty-desc">Les nouvelles commandes apparaîtront ici en temps réel</div>
                  </div>
                )
                : available.map((o, i) => (
                  <div className="dd-order avail" key={o.id} style={{ animationDelay: `${i * .06}s` }}>
                    <div className="dd-order-id">Commande {o.id}</div>
                    <div className="dd-order-meta">{o.restaurantName}</div>
                    <div className="dd-order-addr"><MapPin size={11} />{o.deliveryAddress}</div>
                    <div className="dd-order-price">{formatPrice(o.totalPrice)}</div>
                    <div className="dd-order-actions">
                      <button className="dd-btn-reject" onClick={() => reject(o.id)}>
                        <XCircle size={13} strokeWidth={2} />Refuser
                      </button>
                      <button className="dd-btn-accept" onClick={() => accept(o.id)}>
                        <CheckCircle size={13} strokeWidth={2} />Accepter
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'active' && (
            <div>
              {active.length === 0
                ? (
                  <div className="dd-empty">
                    <div className="dd-empty-icon"><MotoIcon size={26} color="rgba(23,23,20,.25)" /></div>
                    <div className="dd-empty-title">Aucune livraison en cours</div>
                  </div>
                )
                : active.map((o, i) => (
                  <div className="dd-order active" key={o.id} style={{ animationDelay: `${i * .06}s` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                      <div>
                        <div className="dd-order-id">Commande #{o.id}</div>
                        <div className="dd-order-meta">{o.restaurantName}</div>
                        <div className="dd-order-addr"><MapPin size={11} />{o.deliveryAddress}</div>
                        <div className="dd-order-price">{formatPrice(o.totalPrice)}</div>
                      </div>
                      <span className="dd-badge dd-badge-pickedup">En livraison</span>
                    </div>
                    <div className="dd-order-actions">
                      {o.clientPhone && (
                        <a href={`tel:${o.clientPhone}`} className="dd-btn-call">
                          <Phone size={13} strokeWidth={2} />Contacter client
                        </a>
                      )}
                      <button className="dd-btn-deliver" onClick={() => deliver(o.id)}>
                        <CheckCircle size={13} strokeWidth={2} />Confirmer livraison
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'history' && (
            <div>
              {done.length === 0
                ? (
                  <div className="dd-empty">
                    <div className="dd-empty-icon"><CheckCircle size={26} strokeWidth={1.4} /></div>
                    <div className="dd-empty-title">Aucune livraison terminée</div>
                  </div>
                )
                : done.map((o, i) => (
                  <div
                    className="dd-order done"
                    key={o.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', flexWrap: 'wrap', gap: 10,
                      animationDelay: `${i * .06}s`,
                    }}
                  >
                    <div>
                      <div className="dd-order-id">#{o.id} — {o.restaurantName}</div>
                      <div style={{ color: 'rgba(23,23,20,.35)', fontSize: '.75rem', marginTop: 2, fontWeight: 300 }}>
                        {formatDateTime(o.createdAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <span style={{ fontWeight: 700, color: '#4a7a00' }}>{formatPrice(o.totalPrice)}</span>
                      <span className="dd-badge dd-badge-delivered">Livrée</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

        </div>
      </div>
    </>
  )
}