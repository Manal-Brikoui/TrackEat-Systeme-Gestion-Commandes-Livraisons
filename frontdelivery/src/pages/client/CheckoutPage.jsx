import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Banknote, Navigation, CheckCircle, Loader2 } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { paymentService } from '../../services/paymentService'
import { useCartStore } from '../../store/cartStore'
import CartSummary from '../../components/order/CartSummary'
import LocationPickerMap from '../../components/map/LocationPickerMap'
import toast from 'react-hot-toast'

// ─── Geocoding Nominatim (même pattern que RestaurantDetailPage) ─────────────
async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ma`,
      { headers: { 'Accept-Language': 'fr' } }
    )
    const data = await res.json()
    const f = data?.[0]
    if (!f) return null
    const lat = parseFloat(f.lat)
    const lng = parseFloat(f.lon)
    if (isNaN(lat) || isNaN(lng)) return null
    return { lat, lng }
  } catch { return null }
}

export default function CheckoutPage() {
  const { items, restaurantId, clearCart } = useCartStore()
  const nav = useNavigate()

  const [form, setForm] = useState({
    deliveryAddress: '',
    paymentMethod: 'CASH',
    notes: '',
    stripeToken: '',
  })

  // coords confirmées (geocoding OU drag/clic carte)
  const [coords, setCoords]       = useState({ lat: null, lng: null })
  const [geocoding, setGeocoding] = useState(false)
  const [loading, setLoading]     = useState(false)

  const geocodeTimer            = useRef(null)
  const lastGeocodedAddress     = useRef('')

  // ─── Geocoding : inspiré de RestaurantDetailPage ─────────────────────────
  useEffect(() => {
    const address = form.deliveryAddress.trim()

    if (address.length < 6) {
      setGeocoding(false)
      clearTimeout(geocodeTimer.current)
      return
    }

    if (address === lastGeocodedAddress.current) return

    setGeocoding(true)
    clearTimeout(geocodeTimer.current)

    geocodeTimer.current = setTimeout(async () => {
      const result = await geocodeAddress(address)
      if (result) {
        lastGeocodedAddress.current = address
        setCoords({ lat: result.lat, lng: result.lng })
      }
      setGeocoding(false)
    }, 700)

    return () => clearTimeout(geocodeTimer.current)
  }, [form.deliveryAddress])

  // ─── Soumission ───────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault()
    if (!items.length) { toast.error('Panier vide'); return }

    setLoading(true)
    try {
      const order = await orderService.create({
        restaurantId,
        deliveryAddress: form.deliveryAddress,
        deliveryLatitude:  coords.lat ?? null,
        deliveryLongitude: coords.lng ?? null,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
      })
      await paymentService.process({
        orderId: order.id,
        paymentMethodId: form.paymentMethod === 'CASH' ? null : form.stripeToken || null,
      })
      clearCart()
      toast.success('Commande passée avec succès !')
      nav('/orders')
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes ck-fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ck-shimmer { from{background-position:0 center} to{background-position:200% center} }
        @keyframes ck-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes ck-pop     { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
        @keyframes ck-spin    { to{transform:rotate(360deg)} }

        .ck-root {
          background:#fafaf7; color:#171714;
          font-family:'Jost',sans-serif;
          min-height:calc(100vh - var(--nav-h));
          padding:0 !important; max-width:100% !important;
          animation:ck-fadeIn .35s ease both;
        }
        .ck-hero {
          padding:44px 24px 36px;
          border-bottom:1px solid rgba(23,23,20,.07);
          position:relative; overflow:hidden; background:#fafaf7; margin-bottom:32px;
        }
        .ck-hero-grid {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(23,23,20,.025) 1px,transparent 1px),
            linear-gradient(90deg,rgba(23,23,20,.025) 1px,transparent 1px);
          background-size:48px 48px;
        }
        .ck-hero-glow {
          position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse at 20% 0%,rgba(183,234,78,.09) 0%,transparent 68%);
        }
        .ck-hero-inner { max-width:1080px; margin:0 auto; position:relative; z-index:1; }
        .ck-eyebrow {
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 13px; border-radius:50px;
          background:rgba(183,234,78,.1); border:1px solid rgba(183,234,78,.28);
          font-size:.7rem; font-weight:700; color:#4a7a00;
          letter-spacing:.08em; text-transform:uppercase; margin-bottom:14px;
        }
        .ck-eyebrow-dot {
          width:5px; height:5px; border-radius:50%; background:#b7ea4e;
          animation:ck-pulse 2s ease-in-out infinite;
        }
        .ck-title {
          font-family:'Cormorant Garamond',serif; font-weight:800;
          font-size:clamp(2rem,4vw,2.8rem); line-height:1.05; color:#171714; margin:0;
        }
        .ck-title-accent {
          background:linear-gradient(90deg,#4a7a00 0%,#b7ea4e 50%,#4a7a00 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          animation:ck-shimmer 3.2s linear infinite;
        }
        .ck-body {
          max-width:1080px; margin:0 auto; padding:0 24px 60px;
          display:grid; grid-template-columns:1fr 340px; gap:22px; align-items:start;
        }
        .ck-form { display:flex; flex-direction:column; gap:16px; }
        .ck-card {
          background:#fff; border:1px solid rgba(23,23,20,.08);
          border-radius:20px; padding:22px 22px 20px;
          animation:ck-pop .28s ease both;
        }
        .ck-card-title {
          display:flex; align-items:center; gap:9px;
          font-family:'Cormorant Garamond',serif; font-weight:800;
          font-size:1.3rem; color:#171714; margin:0 0 20px;
        }
        .ck-card-title-icon {
          width:32px; height:32px; border-radius:9px;
          background:rgba(183,234,78,.12); border:1px solid rgba(183,234,78,.3);
          display:flex; align-items:center; justify-content:center; color:#4a7a00; flex-shrink:0;
        }
        .ck-label {
          display:block; font-size:.72rem; font-weight:700;
          letter-spacing:.07em; text-transform:uppercase;
          color:rgba(23,23,20,.45); margin-bottom:7px;
        }
        .ck-input-wrap { position:relative; }
        .ck-input-wrap .ck-input { padding-right:38px; }
        .ck-input-status {
          position:absolute; right:11px; top:50%; transform:translateY(-50%);
          display:flex; align-items:center; pointer-events:none;
        }
        .ck-spin { animation:ck-spin .7s linear infinite; color:#4a7a00; }
        .ck-input {
          width:100%; padding:12px 14px;
          background:#fafaf7; border:1px solid rgba(23,23,20,.1);
          border-radius:10px; color:#171714;
          font-family:'Jost',sans-serif; font-size:.9rem;
          outline:none; box-sizing:border-box; transition:border-color .18s,box-shadow .18s;
        }
        .ck-input:focus { border-color:rgba(183,234,78,.6); box-shadow:0 0 0 3px rgba(183,234,78,.1); }
        .ck-input.geocoded { border-color:rgba(183,234,78,.5); }
        .ck-input::placeholder { color:rgba(23,23,20,.28); }
        .ck-textarea { min-height:70px; resize:vertical; }

        .ck-pos-confirmed {
          display:inline-flex; align-items:center; gap:5px;
          font-size:.72rem; font-weight:700; color:#4a7a00;
          background:rgba(183,234,78,.12); border:1px solid rgba(183,234,78,.3);
          padding:3px 10px; border-radius:50px; animation:ck-pop .2s ease both;
        }
        .ck-coords { font-size:.72rem; color:rgba(23,23,20,.38); margin-top:6px; font-variant-numeric:tabular-nums; }

        .ck-pay-option {
          display:flex; align-items:center; gap:12px;
          padding:13px 16px; border-radius:12px; cursor:pointer;
          border:1px solid rgba(23,23,20,.1); background:#fafaf7; margin-bottom:10px; transition:all .17s;
        }
        .ck-pay-option.selected { background:rgba(183,234,78,.08); border-color:rgba(183,234,78,.45); }
        .ck-pay-option:hover:not(.selected) { border-color:rgba(23,23,20,.2); }
        .ck-pay-radio { display:none; }
        .ck-pay-dot {
          width:18px; height:18px; border-radius:50%; flex-shrink:0;
          border:2px solid rgba(23,23,20,.2);
          display:flex; align-items:center; justify-content:center; transition:all .17s;
        }
        .ck-pay-option.selected .ck-pay-dot { border-color:#4a7a00; background:#4a7a00; }
        .ck-pay-dot-inner { width:7px; height:7px; border-radius:50%; background:#fff; transform:scale(0); transition:transform .15s; }
        .ck-pay-option.selected .ck-pay-dot-inner { transform:scale(1); }
        .ck-pay-icon {
          width:34px; height:34px; border-radius:9px;
          background:rgba(23,23,20,.04); border:1px solid rgba(23,23,20,.07);
          display:flex; align-items:center; justify-content:center; color:rgba(23,23,20,.45); flex-shrink:0; transition:all .17s;
        }
        .ck-pay-option.selected .ck-pay-icon { background:rgba(183,234,78,.1); border-color:rgba(183,234,78,.3); color:#4a7a00; }
        .ck-pay-label { font-weight:600; font-size:.9rem; color:#171714; }
        .ck-hint { font-size:.74rem; color:rgba(23,23,20,.38); margin-top:4px; line-height:1.5; }
        .ck-hint code { background:rgba(23,23,20,.06); padding:1px 6px; border-radius:4px; font-size:.72rem; color:#4a7a00; }

        .ck-submit {
          width:100%; padding:15px; border-radius:14px; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:9px;
          background:#171714; color:#fff;
          font-family:'Jost',sans-serif; font-weight:700; font-size:.95rem;
          transition:all .18s; box-shadow:0 4px 18px rgba(23,23,20,.15);
        }
        .ck-submit:hover:not(:disabled) { background:#2a2a26; transform:translateY(-2px); box-shadow:0 8px 24px rgba(23,23,20,.2); }
        .ck-submit:disabled { opacity:.55; cursor:not-allowed; transform:none; }
        .ck-spinner {
          width:18px; height:18px; border-radius:50%;
          border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
          animation:ck-spin .7s linear infinite;
        }
        .ck-map-label-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
        .ck-map-label {
          font-size:.72rem; font-weight:700; letter-spacing:.07em;
          text-transform:uppercase; color:rgba(23,23,20,.45);
          display:flex; align-items:center; gap:5px;
        }

        /* Placeholder carte pendant geocoding */
        .ck-map-loading {
          height:260px; border-radius:10px;
          background:#f2f4ed; border:1px solid rgba(23,23,20,.08);
          display:flex; align-items:center; justify-content:center;
          gap:10px; color:rgba(23,23,20,.4); font-size:.85rem; font-weight:600;
        }

        @media (max-width:760px) {
          .ck-body { grid-template-columns:1fr; }
          .ck-hero { padding:32px 20px 28px; }
        }
      `}</style>

      <div className="ck-root">
        <div className="ck-hero">
          <div className="ck-hero-grid" />
          <div className="ck-hero-glow" />
          <div className="ck-hero-inner">
            <div className="ck-eyebrow">
              <div className="ck-eyebrow-dot" />
              Dernière étape
            </div>
            <h1 className="ck-title">
              Finaliser ma <span className="ck-title-accent">commande</span>
            </h1>
          </div>
        </div>

        <div className="ck-body">
          <form className="ck-form" onSubmit={submit}>

            {/* ── Adresse ── */}
            <div className="ck-card">
              <div className="ck-card-title">
                <div className="ck-card-title-icon"><MapPin size={15} /></div>
                Adresse de livraison
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="ck-label">Adresse complète</label>
                <div className="ck-input-wrap">
                  <input
                    className={`ck-input${coords.lat ? ' geocoded' : ''}`}
                    placeholder="123 Rue Mohammed V, Casablanca"
                    value={form.deliveryAddress}
                    onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                    required
                  />
                  <div className="ck-input-status">
                    {geocoding && <Loader2 size={15} className="ck-spin" />}
                    {!geocoding && coords.lat && <CheckCircle size={15} color="#4a7a00" />}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="ck-label">Instructions (optionnel)</label>
                <textarea
                  className="ck-input ck-textarea"
                  placeholder="Étage, code d'entrée…"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {/* ── Carte ── */}
              <div className="ck-map-label-row">
                <span className="ck-map-label">
                  <Navigation size={12} style={{ color: '#4a7a00' }} />
                  Position sur la carte (optionnel)
                </span>
                {coords.lat && !geocoding && (
                  <span className="ck-pos-confirmed">
                    <CheckCircle size={11} /> Position confirmée
                  </span>
                )}
              </div>

              {geocoding ? (
                <div className="ck-map-loading">
                  <Loader2 size={18} className="ck-spin" />
                  Localisation en cours…
                </div>
              ) : coords.lat && coords.lng ? (
                <LocationPickerMap
                  key={`map-${coords.lat}-${coords.lng}`}
                  lat={coords.lat}
                  lng={coords.lng}
                  onChange={(la, lo) => setCoords({ lat: la, lng: lo })}
                  height={260}
                />
              ) : (
                <div className="ck-map-loading" style={{ color: 'rgba(23,23,20,.28)', fontSize: '.8rem' }}>
                  <MapPin size={16} style={{ opacity: .4 }} />
                  La carte apparaîtra après la saisie de l'adresse
                </div>
              )}

              {coords.lat && !geocoding && (
                <div className="ck-coords">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </div>
              )}
            </div>

            {/* ── Paiement ── */}
            <div className="ck-card" style={{ animationDelay: '.06s' }}>
              <div className="ck-card-title">
                <div className="ck-card-title-icon"><CreditCard size={15} /></div>
                Moyen de paiement
              </div>

              {[
                { v: 'CASH', label: 'Espèces à la livraison', icon: <Banknote size={16} /> },
                { v: 'CARD', label: 'Carte bancaire',          icon: <CreditCard size={16} /> },
              ].map(opt => (
                <label
                  key={opt.v}
                  className={`ck-pay-option${form.paymentMethod === opt.v ? ' selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, paymentMethod: opt.v }))}
                >
                  <input type="radio" className="ck-pay-radio" name="payment" value={opt.v} readOnly checked={form.paymentMethod === opt.v} />
                  <div className="ck-pay-dot"><div className="ck-pay-dot-inner" /></div>
                  <div className="ck-pay-icon">{opt.icon}</div>
                  <span className="ck-pay-label">{opt.label}</span>
                </label>
              ))}

              {form.paymentMethod === 'CARD' && (
                <div style={{ marginTop: 6 }}>
                  <label className="ck-label">Token Stripe (pm_xxx)</label>
                  <input
                    className="ck-input"
                    placeholder="pm_card_visa"
                    value={form.stripeToken}
                    onChange={e => setForm(f => ({ ...f, stripeToken: e.target.value }))}
                    required
                  />
                  <div className="ck-hint">En test : utilisez <code>pm_card_visa</code></div>
                </div>
              )}
            </div>

            <button className="ck-submit" disabled={loading}>
              {loading
                ? <div className="ck-spinner" />
                : <><CheckCircle size={16} /> Confirmer la commande</>
              }
            </button>
          </form>

          {/* ── Résumé panier ── */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
            <CartSummary />
          </div>
        </div>
      </div>
    </>
  )
}