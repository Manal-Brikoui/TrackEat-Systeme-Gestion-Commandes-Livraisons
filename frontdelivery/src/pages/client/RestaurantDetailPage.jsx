import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Clock, Star, Store, Tag, ChevronDown, ChevronUp } from 'lucide-react'
import { restaurantService } from '../../services/restaurantService'
import { workingHoursService } from '../../services/workingHoursService'
import { reviewService } from '../../services/reviewService'
import ProductCard from '../../components/restaurant/ProductCard'
import MapView from '../../components/map/MapView'
import { PageLoader } from '../../components/common/Loader'
import { useAuth } from '../../hooks/useAuth'
import { DAYS_FR } from '../../utils/constants'
import toast from 'react-hot-toast'

function toMins(t) {
  if (!t) return null
  const clean = t.slice(0, 5)
  const [h, m] = clean.split(':').map(Number)
  return h * 60 + m
}

function barWidthPct(h) {
  if (!h || h.closed) return 0
  if (!h.openTime || h.openTime === '00:00' || h.openTime === '00:00:00') return 0
  const openM = toMins(h.openTime)
  let closeM = toMins(h.closeTime)
  if (closeM === 0) closeM = 24 * 60
  return Math.round(((closeM - openM) / (24 * 60)) * 100)
}

function liveStatus(todayH) {
  if (!todayH || todayH.closed) return { text: "Fermé aujourd'hui", open: false }
  if (!todayH.openTime || todayH.openTime === '00:00' || todayH.openTime === '00:00:00')
    return { text: "Fermé aujourd'hui", open: false }
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const openM = toMins(todayH.openTime)
  let closeM = toMins(todayH.closeTime)
  if (closeM === 0) closeM = 24 * 60
  if (cur < openM) return { text: `Ouvre à ${todayH.openTime.slice(0, 5)}`, open: false }
  if (cur >= closeM) return { text: "Fermé pour aujourd'hui", open: false }
  const rem = closeM - cur
  const h = Math.floor(rem / 60), m = rem % 60
  return { text: `Ferme dans ${h > 0 ? h + 'h ' : ''}${m}min`, open: true }
}

function HorairesSection({ hours }) {
  const jsDay = new Date().getDay()
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1
  const todayH = hours.find(x => Number(x.dayOfWeek) === todayIdx + 1)
  const status = liveStatus(todayH)

  const displayTime = (h) => {
    if (!h || h.closed) return null
    if (!h.openTime || h.openTime === '00:00' || h.openTime === '00:00:00') return null
    const close = h.closeTime?.slice(0, 5) === '00:00' ? 'Minuit' : h.closeTime?.slice(0, 5)
    return `${h.openTime.slice(0, 5)} – ${close}`
  }

  return (
    <div className="rdh-root">
      <div className="rdh-stat-row">
        <div className="rdh-stat-card">
          <span className="rdh-stat-label">Statut actuel</span>
          <div className="rdh-stat-badge-wrap">
            <span className={`rdh-live-dot ${status.open ? 'open' : 'closed'}`} />
            <span className={`rdh-stat-value ${status.open ? 'green' : 'red'}`}>
              {status.open ? 'Ouvert' : 'Fermé'}
            </span>
          </div>
        </div>
        <div className="rdh-stat-card">
          <span className="rdh-stat-label">Aujourd'hui</span>
          <span className="rdh-stat-value">{status.text}</span>
        </div>
        {todayH && !todayH.closed && displayTime(todayH) && (
          <>
            <div className="rdh-stat-card">
              <span className="rdh-stat-label">Ouverture</span>
              <span className="rdh-stat-value">{todayH.openTime.slice(0, 5)}</span>
            </div>
            <div className="rdh-stat-card">
              <span className="rdh-stat-label">Fermeture</span>
              <span className="rdh-stat-value">
                {todayH.closeTime?.slice(0, 5) === '00:00' ? 'Minuit' : todayH.closeTime?.slice(0, 5)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="rdh-pills">
        {DAYS_FR.map((day, i) => {
          const h = hours.find(x => Number(x.dayOfWeek) === i + 1)
          const isToday = i === todayIdx
          const open = h && !h.closed && h.openTime && h.openTime !== '00:00' && h.openTime !== '00:00:00'
          return (
            <div key={day} className={`rdh-pill ${isToday ? 'today' : ''} ${!open ? 'closed' : ''}`}>
              <span className="rdh-pill-day">{day.slice(0, 3)}</span>
              <div className={`rdh-pill-dot ${open ? 'open' : 'closed'}`} />
              {isToday && <span className="rdh-pill-today-ring" />}
            </div>
          )
        })}
      </div>

      <div className="rdh-list-card">
        {DAYS_FR.map((day, i) => {
          const h = hours.find(x => Number(x.dayOfWeek) === i + 1)
          const isToday = i === todayIdx
          const display = displayTime(h)
          const bw = barWidthPct(h)
          return (
            <div key={day} className={`rdh-row ${isToday ? 'today' : ''}`}>
              <div className="rdh-row-day">
                <span className={`rdh-day-name ${isToday ? 'today' : ''}`}>{day}</span>
                {isToday && <span className="rdh-today-tag">Aujourd'hui</span>}
              </div>
              <div className="rdh-bar-wrap">
                <div className="rdh-bar-fill" style={{ width: `${bw}%` }} />
              </div>
              {display
                ? <span className="rdh-time">{display}</span>
                : <span className="rdh-closed">Fermé</span>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CategoryGroup({ category, products, restaurantId, restaurantName }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rd-cat-group">
      <div className="rd-cat-group-header" onClick={() => setOpen(o => !o)}>
        <div className="rd-cat-group-title">
          <div className="rd-cat-group-icon">
            <Tag size={12} color="#4a7a00" />
          </div>
          <span className="rd-cat-group-label">{category}</span>
          <span className="rd-cat-group-badge">{products.length}</span>
        </div>
        {open
          ? <ChevronUp size={14} color="rgba(23,23,20,.4)" />
          : <ChevronDown size={14} color="rgba(23,23,20,.4)" />
        }
      </div>
      {open && (
        <div className="rd-cat-group-body">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              restaurantId={restaurantId}
              restaurantName={restaurantName}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function RestaurantDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [resto, setResto] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [hours, setHours] = useState([])
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('menu')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [geocodedCoords, setGeocodedCoords] = useState(null)
  const [geocoding, setGeocoding] = useState(false)

  useEffect(() => {
    const MAR = { latMin: 27.6, latMax: 35.9, lngMin: -13.2, lngMax: -0.9 }
    const valid = (la, lo) =>
      !isNaN(la) && !isNaN(lo) && la !== 0 && lo !== 0 &&
      la >= MAR.latMin && la <= MAR.latMax &&
      lo >= MAR.lngMin && lo <= MAR.lngMax

    const geocodeAddress = async (address) => {
      const token = import.meta.env.VITE_MAPBOX_TOKEN
      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
        `${encodeURIComponent(address)}.json` +
        `?access_token=${token}&limit=1&country=ma&language=fr`
      try {
        const res = await fetch(url)
        const data = await res.json()
        const f = data?.features?.[0]
        if (!f) return null
        const [lng, lat] = f.center
        return { lat, lng }
      } catch { return null }
    }

    Promise.all([
      restaurantService.getById(id),
      restaurantService.getProducts(id),
      workingHoursService.getByRestaurant(id),
      reviewService.getByRestaurant(id),
      reviewService.getAverageRating(id),
      restaurantService.getCategories(),
    ]).then(async ([r, p, h, rv, avg, cats]) => {
      setResto(r)
      setHours(h)
      setReviews(rv)
      setAvgRating(avg || 0)
      setCategories(cats)

      
      const enriched = p.map(prod => {
        if (prod.categoryName) return prod
        const cat = cats.find(c => c.id === prod.categoryId)
        return { ...prod, categoryName: cat?.name || null }
      })
      setProducts(enriched)

      const lat = parseFloat(r.latitude)
      const lng = parseFloat(r.longitude)
      if (r.address) {
        setGeocoding(true)
        const coords = await geocodeAddress(r.address)
        if (coords && valid(coords.lat, coords.lng)) {
          setGeocodedCoords(coords)
        } else if (valid(lat, lng)) {
          setGeocodedCoords({ lat, lng })
        }
        setGeocoding(false)
      } else if (valid(lat, lng)) {
        setGeocodedCoords({ lat, lng })
      }
    }).catch(err => console.error('Erreur:', err))
      .finally(() => setLoading(false))
  }, [id])

  const canReview = isAuthenticated && (user?.role === 'CLIENT' || user?.role === 'DRIVER')
  const mapLat = geocodedCoords?.lat ?? null
  const mapLng = geocodedCoords?.lng ?? null
  const isActuallyOpen = resto?.currentlyOpen ?? resto?.open ?? false

  
  const grouped = products.reduce((acc, p) => {
    const cat = p.categoryName
      || categories.find(c => c.id === p.categoryId)?.name
      || 'Sans catégorie'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const submitReview = async (e) => {
    e.preventDefault()
    if (!canReview) { toast.error('Connectez-vous pour laisser un avis'); return }
    setSubmitting(true)
    try {
      await reviewService.add({ restaurantId: Number(id), ...reviewForm })
      toast.success('Avis ajouté !')
      setReviewForm({ rating: 5, comment: '' })
      const [rv, avg] = await Promise.all([
        reviewService.getByRestaurant(id),
        reviewService.getAverageRating(id),
      ])
      setReviews(rv); setAvgRating(avg || 0)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally { setSubmitting(false) }
  }

  if (loading) return <PageLoader />
  if (!resto) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-icon"><Store size={40} /></div>
        <div className="empty-title">Restaurant introuvable</div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes rd-in    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rd-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

        .rd-root {
          background: #fafaf7; color: #171714;
          font-family: 'Jost', sans-serif;
          animation: rd-in .35s ease both;
          min-height: 100vh;
        }

        .rd-hero { position: relative; height: 300px; background: #f2f4ed; overflow: hidden; }
        .rd-hero img { width: 100%; height: 100%; object-fit: cover; }
        .rd-hero-placeholder {
          height: 100%; display: flex; align-items: center; justify-content: center;
          background: #eaede4;
        }
        .rd-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(23,23,20,.9) 0%, rgba(23,23,20,.2) 55%, transparent 100%);
        }
        .rd-hero-content {
          position: absolute; bottom: 24px; left: 28px; right: 28px;
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
        }
        .rd-hero-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: clamp(1.6rem, 4vw, 2.4rem);
          color: #fff; line-height: 1.1; margin: 0 0 10px;
        }
        .rd-hero-badges { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .rd-badge-open {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 13px; border-radius: 50px;
          background: rgba(183,234,78,.2); border: 1px solid rgba(183,234,78,.5);
          color: #b7ea4e; font-size: .73rem; font-weight: 700; letter-spacing: .04em;
        }
        .rd-badge-closed {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 13px; border-radius: 50px;
          background: rgba(248,113,113,.15); border: 1px solid rgba(248,113,113,.4);
          color: #f87171; font-size: .73rem; font-weight: 700; letter-spacing: .04em;
        }
        .rd-dot-open  { width:6px;height:6px;border-radius:50%;background:#b7ea4e;animation:rd-pulse 2s ease-in-out infinite;flex-shrink:0; }
        .rd-dot-closed{ width:6px;height:6px;border-radius:50%;background:#f87171;flex-shrink:0; }
        .rd-badge-rating {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 50px;
          background: rgba(183,234,78,.15); border: 1px solid rgba(183,234,78,.3);
          color: #b7ea4e; font-size: .73rem; font-weight: 700;
        }

        .rd-category-bar {
          background: #fff;
          border-bottom: 1px solid rgba(23,23,20,.07);
          padding: 10px 24px;
          display: flex; align-items: center; gap: 10px;
        }
        .rd-category-bar-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(183,234,78,.15); border: 1px solid rgba(183,234,78,.3);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rd-category-bar-label {
          font-size: .68rem; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; color: rgba(23,23,20,.35);
          margin-right: 2px;
        }
        .rd-category-bar-value {
          font-size: .88rem; font-weight: 700; color: #4a7a00;
        }

        .rd-tabs {
          display: flex; background: #fff;
          border-bottom: 1px solid rgba(23,23,20,.08);
          padding: 0 24px; overflow-x: auto;
          position: sticky; top: 0; z-index: 10;
          box-shadow: 0 2px 12px rgba(23,23,20,.05);
        }
        .rd-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 15px 18px; border: none; background: none;
          color: rgba(23,23,20,.45); font-family: 'Jost', sans-serif;
          font-size: .84rem; font-weight: 600; cursor: pointer;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          white-space: nowrap; transition: all .18s;
        }
        .rd-tab:hover { color: #171714; }
        .rd-tab.active { color: #4a7a00; border-bottom-color: #b7ea4e; }

        .rd-body { max-width: 860px; margin: 0 auto; padding: 28px 20px 60px; }

        .rd-cat-group {
          background: #fff;
          border: 1px solid rgba(23,23,20,.08);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .rd-cat-group-header {
          padding: 13px 18px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer;
          border-bottom: 1px solid rgba(23,23,20,.06);
          transition: background .15s;
        }
        .rd-cat-group-header:hover { background: rgba(23,23,20,.015); }
        .rd-cat-group-title { display: flex; align-items: center; gap: 9px; }
        .rd-cat-group-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: rgba(183,234,78,.15); border: 1px solid rgba(183,234,78,.3);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rd-cat-group-label { color: #171714; font-weight: 700; font-size: .9rem; }
        .rd-cat-group-badge {
          padding: 2px 9px; border-radius: 20px;
          background: rgba(183,234,78,.15); color: #4a7a00;
          font-size: .72rem; font-weight: 700;
          border: 1px solid rgba(183,234,78,.25);
        }
        .rd-cat-group-body {
         padding: 10px 14px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
}
        .rdh-root { display: flex; flex-direction: column; gap: 14px; }
        .rdh-stat-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
        }
        .rdh-stat-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 14px; padding: 14px 16px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .rdh-stat-label {
          font-size: .72rem; font-weight: 700; letter-spacing: .07em;
          text-transform: uppercase; color: rgba(23,23,20,.4);
        }
        .rdh-stat-value { font-size: 1.05rem; font-weight: 700; color: #171714; line-height: 1.2; }
        .rdh-stat-value.green { color: #4a7a00; }
        .rdh-stat-value.red   { color: #ef4444; }
        .rdh-stat-badge-wrap  { display: flex; align-items: center; gap: 7px; }
        .rdh-live-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .rdh-live-dot.open   { background: #b7ea4e; animation: rd-pulse 2s ease-in-out infinite; }
        .rdh-live-dot.closed { background: #ef4444; }

        .rdh-pills { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .rdh-pill {
          position: relative;
          display: flex; flex-direction: column; align-items: center;
          gap: 5px; padding: 10px 4px;
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 12px;
        }
        .rdh-pill.today { background: rgba(183,234,78,.1); border-color: rgba(74,122,0,.3); }
        .rdh-pill.closed { background: #f9f9f7; }
        .rdh-pill-day {
          font-size: .7rem; font-weight: 700; letter-spacing: .03em;
          color: rgba(23,23,20,.5); text-transform: uppercase;
        }
        .rdh-pill.today .rdh-pill-day { color: #4a7a00; }
        .rdh-pill-dot { width: 6px; height: 6px; border-radius: 50%; }
        .rdh-pill-dot.open   { background: #b7ea4e; }
        .rdh-pill-dot.closed { background: rgba(23,23,20,.15); }
        .rdh-pill-today-ring {
          position: absolute; inset: -1px;
          border: 2px solid #b7ea4e; border-radius: 12px; pointer-events: none;
        }

        .rdh-list-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 16px; overflow: hidden;
        }
        .rdh-row {
          display: flex; align-items: center;
          padding: 13px 20px; gap: 12px;
          border-bottom: 1px solid rgba(23,23,20,.05);
        }
        .rdh-row:last-child { border-bottom: none; }
        .rdh-row.today { background: rgba(183,234,78,.07); }
        .rdh-row-day { display: flex; align-items: center; gap: 8px; min-width: 110px; flex-shrink: 0; }
        .rdh-day-name { font-size: .875rem; font-weight: 400; color: rgba(23,23,20,.6); }
        .rdh-day-name.today { font-weight: 700; color: #4a7a00; }
        .rdh-today-tag {
          font-size: .6rem; font-weight: 700; letter-spacing: .06em;
          background: rgba(183,234,78,.15); color: #4a7a00;
          padding: 2px 7px; border-radius: 50px;
          text-transform: uppercase; border: 1px solid rgba(183,234,78,.3); white-space: nowrap;
        }
        .rdh-bar-wrap { flex: 1; height: 4px; background: rgba(23,23,20,.07); border-radius: 2px; overflow: hidden; }
        .rdh-bar-fill { height: 100%; background: #b7ea4e; border-radius: 2px; transition: width .5s ease; }
        .rdh-time { font-size: .85rem; font-weight: 500; color: rgba(23,23,20,.55); min-width: 120px; text-align: right; white-space: nowrap; }
        .rdh-closed { font-size: .82rem; font-weight: 700; color: #ef4444; min-width: 120px; text-align: right; }

        .rd-review-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 14px; padding: 18px 20px;
        }
        .rd-review-form {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 14px; padding: 22px;
          display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px;
        }
        .rd-form-label {
          display: block; margin-bottom: 6px;
          color: rgba(23,23,20,.5); font-size: .74rem;
          font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
        }
        .rd-textarea {
          width: 100%; padding: 11px 14px;
          background: #fafaf7; border: 1px solid rgba(23,23,20,.1);
          border-radius: 9px; color: #171714;
          font-family: 'Jost', sans-serif; font-size: .9rem;
          outline: none; resize: vertical; box-sizing: border-box; transition: border-color .18s;
        }
        .rd-textarea:focus { border-color: rgba(183,234,78,.6); box-shadow: 0 0 0 3px rgba(183,234,78,.1); }
        .rd-submit-btn {
          padding: 12px; background: #171714; color: #fff;
          border: none; border-radius: 9px; font-weight: 700;
          font-family: 'Jost', sans-serif; cursor: pointer; font-size: .9rem; transition: all .18s;
        }
        .rd-submit-btn:hover  { background: #2a2a26; transform: translateY(-1px); }
        .rd-submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        .rd-map-placeholder {
          height: 380px; display: flex; align-items: center; justify-content: center;
          background: #f2f4ed; border: 1px solid rgba(23,23,20,.08);
          border-radius: 14px; color: rgba(23,23,20,.38); font-size: .875rem; gap: 10px;
        }
        .rd-address-card {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 12px; padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          color: #171714; font-size: .9rem;
        }

        .rd-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 60px 20px; text-align: center; gap: 10px;
        }
        .rd-empty-icon {
          width: 64px; height: 64px; border-radius: 18px;
          background: #f2f4ed; border: 1px solid rgba(23,23,20,.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(23,23,20,.22); margin-bottom: 6px;
        }

        @media (max-width: 640px) {
          .rd-hero { height: 240px; }
          .rd-hero-content { left: 16px; right: 16px; bottom: 16px; }
          .rd-tab  { padding: 13px 14px; font-size: .8rem; }
          .rd-body { padding: 20px 14px 48px; }
          .rdh-stat-row { grid-template-columns: 1fr 1fr; }
          .rdh-row-day  { min-width: 90px; }
          .rdh-time, .rdh-closed { min-width: 90px; font-size: .78rem; }
          .rdh-pill-day { font-size: .62rem; }
          .rd-category-bar { padding: 10px 16px; }
          .rd-cat-group-body { padding: 8px 10px; }
          .rd-cat-group-body { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="rd-root">


        <div className="rd-hero">
          {resto.imageUrl
            ? <img src={resto.imageUrl} alt={resto.name} />
            : <div className="rd-hero-placeholder">
                <Store size={56} color="rgba(23,23,20,.15)" strokeWidth={1.2} />
              </div>
          }
          <div className="rd-hero-overlay" />
          <div className="rd-hero-content">
            <div>
              <h1 className="rd-hero-name">{resto.name}</h1>
              <div className="rd-hero-badges">
                <div className={isActuallyOpen ? 'rd-badge-open' : 'rd-badge-closed'}>
                  <div className={isActuallyOpen ? 'rd-dot-open' : 'rd-dot-closed'} />
                  {isActuallyOpen ? 'Ouvert' : 'Fermé'}
                </div>
              </div>
            </div>
            {avgRating > 0 && (
              <div className="rd-badge-rating">
                <Star size={13} fill="currentColor" />
                {avgRating.toFixed(1)} ({reviews.length})
              </div>
            )}
          </div>
        </div>

      
        {resto.categoryName && (
          <div className="rd-category-bar">
            <div className="rd-category-bar-icon">
              <Tag size={13} color="#4a7a00" />
            </div>
            <span className="rd-category-bar-label">Catégorie</span>
            <span className="rd-category-bar-value">{resto.categoryName}</span>
          </div>
        )}

 
        <div className="rd-tabs">
          {[
            { key: 'menu',         label: 'Menu',         icon: <Tag size={14} /> },
            { key: 'horaires',     label: 'Horaires',     icon: <Clock size={14} /> },
            { key: 'localisation', label: 'Localisation', icon: <MapPin size={14} /> },
            { key: 'avis',         label: 'Avis',         icon: <Star size={14} /> },
          ].map(t => (
            <button
              key={t.key}
              className={`rd-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div className="rd-body">

          {tab === 'menu' && (
            <div>
              {products.length === 0 ? (
                <div className="rd-empty">
                  <div className="rd-empty-icon"><Tag size={28} /></div>
                  <div style={{ fontWeight: 700, color: '#171714', fontSize: '1rem' }}>Aucun produit</div>
                  <div style={{ fontSize: '.85rem', color: 'rgba(23,23,20,.4)' }}>Le menu est vide pour l'instant</div>
                </div>
              ) : (
                Object.entries(grouped).map(([cat, prods]) => (
                  <CategoryGroup
                    key={cat}
                    category={cat}
                    products={prods}
                    restaurantId={Number(id)}
                    restaurantName={resto.name}
                  />
                ))
              )}
            </div>
          )}

          {tab === 'horaires' && <HorairesSection hours={hours} />}

          {tab === 'localisation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {geocoding
                ? <div className="rd-map-placeholder">
                    <span className="spinner" style={{ borderTopColor: '#4a7a00' }} />
                    Chargement...
                  </div>
                : mapLat && mapLng
                  ? <MapView
                      key={`map-${resto.id}-${mapLat}-${mapLng}`}
                      destLat={mapLat}
                      destLng={mapLng}
                      height={380}
                    />
                  : <div className="rd-map-placeholder">Localisation non disponible</div>
              }
              {resto.address && (
                <div className="rd-address-card">
                  <MapPin size={18} color="#4a7a00" style={{ flexShrink: 0 }} />
                  <span>{resto.address}</span>
                </div>
              )}
            </div>
          )}

          {tab === 'avis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {canReview && (
                <div className="rd-review-form">
                  <div style={{ fontWeight: 700, color: '#171714', fontSize: '.95rem' }}>Laisser un avis</div>
                  <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label className="rd-form-label">Note</label>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n} type="button"
                            onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                          >
                            <Star
                              size={26}
                              fill={n <= reviewForm.rating ? '#b7ea4e' : 'none'}
                              color={n <= reviewForm.rating ? '#4a7a00' : 'rgba(23,23,20,.2)'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="rd-form-label">Commentaire</label>
                      <textarea
                        className="rd-textarea"
                        rows={3}
                        placeholder="Votre avis..."
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        required
                      />
                    </div>
                    <button className="rd-submit-btn" disabled={submitting}>
                      {submitting ? 'Envoi...' : "Envoyer l'avis"}
                    </button>
                  </form>
                </div>
              )}

              {reviews.length === 0
                ? <div className="rd-empty">
                    <div className="rd-empty-icon"><Star size={28} /></div>
                    <div style={{ fontWeight: 700, color: '#171714' }}>Aucun avis</div>
                    <div style={{ fontSize: '.85rem', color: 'rgba(23,23,20,.4)' }}>
                      Soyez le premier à donner votre avis !
                    </div>
                  </div>
                : reviews.map(r => (
                    <div key={r.id} className="rd-review-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'rgba(183,234,78,.15)',
                            border: '1px solid rgba(183,234,78,.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#4a7a00', fontWeight: 700, fontSize: '.85rem', flexShrink: 0,
                          }}>
                            {(r.clientName || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '.88rem', color: '#171714' }}>
                              {r.clientName || 'Anonyme'}
                            </div>
                            {r.role === 'DRIVER' && (
                              <span style={{
                                fontSize: '.65rem', fontWeight: 700,
                                padding: '1px 7px', borderRadius: 20,
                                background: 'rgba(183,234,78,.12)', color: '#4a7a00',
                                border: '1px solid rgba(183,234,78,.25)',
                              }}>Livreur</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <Star
                              key={n} size={13}
                              fill={n <= r.rating ? '#b7ea4e' : 'none'}
                              color={n <= r.rating ? '#4a7a00' : 'rgba(23,23,20,.15)'}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'rgba(23,23,20,.55)', fontSize: '.875rem', margin: 0, lineHeight: 1.65 }}>
                        {r.comment}
                      </p>
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