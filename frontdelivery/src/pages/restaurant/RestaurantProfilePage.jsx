import React, { useEffect, useState } from 'react'
import { restaurantService } from '../../services/restaurantService'
import { workingHoursService } from '../../services/workingHoursService'
import ImageUploader from '../../components/common/ImageUploader'
import {
  Store, MapPin, Phone, Clock, Save,
  RefreshCw, Power, Edit3, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

@keyframes rp-in    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes rp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
@keyframes rp-spin  { to { transform: rotate(360deg) } }

.rp-root * { font-family: 'Jost', sans-serif; box-sizing: border-box; }

.rp-root {
  min-height: 100vh;
  background: #fafaf7;
  padding: 32px 16px 60px;
  animation: rp-in .3s ease both;
}

.rp-header {
  max-width: 720px; margin: 0 auto 32px;
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
}
.rp-brand-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
.rp-brand-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #b7ea4e;
  animation: rp-pulse 2s ease-in-out infinite;
}
.rp-brand-lbl { color: #4a7a00; font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.rp-title {
  font-family: 'Cormorant Garamond', serif !important;
  font-weight: 800; font-size: clamp(1.5rem,3vw,2rem);
  color: #171714; margin: 0; line-height: 1.1;
}

.rp-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.rp-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 8px;
  font-family: 'Jost', sans-serif; font-weight: 700; font-size: .83rem;
  cursor: pointer; border: none; transition: all .17s; white-space: nowrap;
}
.rp-btn-open   { background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.3); color: #4a7a00; }
.rp-btn-open:hover { background: rgba(183,234,78,.18); }
.rp-btn-closed { background: rgba(23,23,20,.05); border: 1px solid rgba(23,23,20,.1); color: rgba(23,23,20,.45); }
.rp-btn-closed:hover { border-color: rgba(23,23,20,.2); color: #171714; }
.rp-btn-edit   { background: #fff; border: 1px solid rgba(23,23,20,.1); color: rgba(23,23,20,.5); }
.rp-btn-edit:hover { border-color: rgba(23,23,20,.22); color: #171714; }
.rp-btn-editing { background: #b7ea4e; border: 1px solid #b7ea4e; color: #0f2a00; }
.rp-btn-editing:hover { background: #a8d843; }
.rp-btn:disabled { opacity: .5; cursor: not-allowed; }

.rp-inner { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }

.rp-card {
  background: #fff; border: 1px solid rgba(23,23,20,.08);
  border-radius: 14px; overflow: hidden;
  animation: rp-in .25s ease both;
}
.rp-card-header {
  padding: 14px 20px; border-bottom: 1px solid rgba(23,23,20,.07);
  display: flex; align-items: center; gap: 10px;
}
.rp-card-title { color: #171714; font-weight: 700; font-size: .95rem; margin: 0; }
.rp-card-body  { padding: 20px 22px; }

.rp-label {
  display: block; margin-bottom: 6px;
  color: rgba(23,23,20,.4); font-size: .7rem;
  font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
}
.rp-input {
  width: 100%; padding: 11px 14px;
  background: #fafaf7; border: 1px solid rgba(23,23,20,.1);
  border-radius: 9px; color: #171714; font-size: .9rem;
  font-family: 'Jost', sans-serif; outline: none;
  transition: border-color .15s;
}
.rp-input:focus { border-color: rgba(183,234,78,.5); }
.rp-textarea { resize: vertical; }

.rp-btn-save {
  width: 100%; padding: 13px; border: none; border-radius: 9px;
  background: #b7ea4e; color: #0f2a00; font-weight: 700;
  font-family: 'Jost', sans-serif; font-size: .92rem;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all .17s;
}
.rp-btn-save:hover { background: #a8d843; }
.rp-btn-save:disabled { opacity: .6; cursor: not-allowed; }

.rp-info-cover {
  width: 100%; height: 190px; object-fit: cover; border-radius: 10px;
  margin-bottom: 6px; display: block;
}
.rp-info-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid rgba(23,23,20,.06);
}
.rp-info-row:last-of-type { border-bottom: none; }
.rp-info-label { color: rgba(23,23,20,.4); font-size: .75rem; font-weight: 600; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .05em; }
.rp-info-value { color: #171714; font-size: .9rem; }
.rp-description { color: rgba(23,23,20,.55); font-size: .88rem; line-height: 1.65; padding-top: 6px; }

.rp-status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 13px; border-radius: 20px;
  font-size: .78rem; font-weight: 700; margin-top: 10px;
}

.rp-hours-row {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 10px 14px; border-radius: 10px;
  border: 1px solid transparent; transition: background .15s;
}
.rp-hours-row.today {
  background: rgba(183,234,78,.07);
  border-color: rgba(183,234,78,.25);
}
.rp-day-label {
  width: 84px; font-size: .88rem; font-weight: 600; flex-shrink: 0;
}
.rp-checkbox-label {
  display: flex; align-items: center; gap: 7px;
  cursor: pointer; color: rgba(23,23,20,.45); font-size: .82rem; user-select: none;
}
.rp-time-input {
  width: 108px; padding: 7px 10px;
  background: #fafaf7; border: 1px solid rgba(23,23,20,.1);
  border-radius: 8px; color: #171714; font-size: .85rem;
  font-family: 'Jost', sans-serif; outline: none; transition: border-color .15s;
}
.rp-time-input:focus { border-color: rgba(183,234,78,.5); }
.rp-sep { color: rgba(23,23,20,.3); font-size: .85rem; }
.rp-closed-lbl { color: #ef4444; font-size: .82rem; font-weight: 600; }

.rp-loading {
  min-height: 100vh; background: #fafaf7;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  color: rgba(23,23,20,.4); font-size: .9rem; font-family: 'Jost', sans-serif;
}
.rp-spin { animation: rp-spin .9s linear infinite; }

/* ImageUploader compat */
:root {
  --accent: #b7ea4e;
  --border: rgba(23,23,20,.1);
  --border2: rgba(23,23,20,.15);
  --bg3: #fafaf7;
  --text2: rgba(23,23,20,.5);
  --text3: rgba(23,23,20,.3);
  --danger: #dc2626;
  --radius: 9px;
  --transition: .15s;
}
@keyframes spin { to { transform: rotate(360deg) } }
`

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rp-card">
      <div className="rp-card-header">
        <Icon size={16} color="#4a7a00" />
        <h2 className="rp-card-title">{title}</h2>
      </div>
      <div className="rp-card-body">{children}</div>
    </div>
  )
}

export default function RestaurantProfilePage() {
  const [restaurant,  setRestaurant]  = useState(null)
  const [hours,       setHours]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [editMode,    setEditMode]    = useState(false)
  const [savingInfo,  setSavingInfo]  = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [toggling,    setToggling]    = useState(false)

  const [form, setForm] = useState({
    name: '', description: '', address: '', phone: '', imageUrl: '',
  })

  const normalizeHours = (raw) =>
    DAYS.map((_, i) => {
      const existing = raw.find(hr => Number(hr.dayOfWeek) === i + 1)
      if (!existing) return { dayOfWeek: i + 1, openTime: '09:00', closeTime: '22:00', closed: false }
      const isClosed = existing.closed === true || existing.openTime === '00:00'
      return {
        ...existing,
        dayOfWeek: i + 1,
        closed:    isClosed,
        openTime:  (!isClosed && existing.openTime)  ? existing.openTime  : '09:00',
        closeTime: (!isClosed && existing.closeTime) ? existing.closeTime : '22:00',
      }
    })

  useEffect(() => {
    const load = async () => {
      try {
        const resto = await restaurantService.getMy()
        const h     = await workingHoursService.getByRestaurant(resto.id)
        setRestaurant(resto)
        setForm({
          name:        resto.name        || '',
          description: resto.description || '',
          address:     resto.address     || '',
          phone:       resto.phone       || '',
          imageUrl:    resto.imageUrl    || '',
        })
        setHours(normalizeHours(h))
      } catch {
        toast.error('Impossible de charger le profil')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveInfo = async (e) => {
    e.preventDefault()
    setSavingInfo(true)
    try {
      const updated = await restaurantService.updateMyInfo(form)
      setRestaurant(updated)
      setEditMode(false)
      toast.success('Profil mis à jour')
    } catch {
      toast.error('Erreur de mise à jour')
    } finally {
      setSavingInfo(false)
    }
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      const updated = await restaurantService.toggleOpen(restaurant.id)
      setRestaurant(updated)
      toast.success(updated.open ? 'Restaurant ouvert' : 'Restaurant fermé')
    } catch {
      toast.error('Erreur')
    } finally {
      setToggling(false)
    }
  }

  const handleHourChange = (dayOfWeek, field, value) =>
    setHours(prev => prev.map(h =>
      Number(h.dayOfWeek) === Number(dayOfWeek) ? { ...h, [field]: value } : h
    ))

  const handleSaveHours = async () => {
    setSavingHours(true)
    try {
      await workingHoursService.update({
        restaurantId: restaurant.id,
        hours: hours.map(h => ({
          dayOfWeek: h.dayOfWeek,
          openTime:  h.closed ? '00:00' : h.openTime,
          closeTime: h.closed ? '00:00' : h.closeTime,
          closed:    h.closed,
        })),
      })
      const refreshed = await workingHoursService.getByRestaurant(restaurant.id)
      setHours(normalizeHours(refreshed))
      toast.success('Horaires enregistrés')
    } catch {
      toast.error("Erreur d'enregistrement des horaires")
    } finally {
      setSavingHours(false)
    }
  }

  if (loading) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="rp-loading">
        <RefreshCw size={22} color="#4a7a00" className="rp-spin" />
        <span>Chargement du profil...</span>
      </div>
    </>
  )

  const today        = new Date().getDay()
  const adjustedToday = today === 0 ? 7 : today

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="rp-root">

        <div className="rp-header">
          <div>
            <div className="rp-brand-row">
              <div className="rp-brand-dot" />
              <span className="rp-brand-lbl">Mon restaurant</span>
            </div>
            <h1 className="rp-title">{restaurant?.name}</h1>
          </div>

          <div className="rp-actions">
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`rp-btn ${restaurant?.open ? 'rp-btn-open' : 'rp-btn-closed'}`}
            >
              <Power size={14} />
              {restaurant?.open ? 'Ouvert' : 'Fermé'}
            </button>
            <button
              onClick={() => setEditMode(e => !e)}
              className={`rp-btn ${editMode ? 'rp-btn-editing' : 'rp-btn-edit'}`}
            >
              <Edit3 size={14} />
              {editMode ? 'Annuler' : 'Modifier'}
            </button>
          </div>
        </div>

        <div className="rp-inner">

          <SectionCard title="Informations générales" icon={Store}>
            {editMode ? (
              <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { key: 'name',    label: 'Nom du restaurant', placeholder: 'Nom' },
                  { key: 'address', label: 'Adresse',           placeholder: 'Adresse complète' },
                  { key: 'phone',   label: 'Téléphone',         placeholder: '+212 6 00 00 00 00' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="rp-label">{label}</label>
                    <input
                      className="rp-input"
                      value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                    />
                  </div>
                ))}

                <div>
                  <label className="rp-label">Description</label>
                  <textarea
                    className="rp-input rp-textarea"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Décrivez votre restaurant..."
                  />
                </div>

                <ImageUploader
                  value={form.imageUrl}
                  onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                  label="Image du restaurant"
                />

                <button type="submit" disabled={savingInfo} className="rp-btn-save" style={{ marginTop: 4 }}>
                  <Save size={15} />
                  {savingInfo ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {restaurant?.imageUrl && (
                  <img src={restaurant.imageUrl} alt={restaurant.name} className="rp-info-cover" />
                )}
                <div className="rp-info-row">
                  <MapPin size={15} color="#4a7a00" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div className="rp-info-label">Adresse</div>
                    <div className="rp-info-value">{restaurant?.address || '—'}</div>
                  </div>
                </div>
                <div className="rp-info-row">
                  <Phone size={15} color="#4a7a00" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div className="rp-info-label">Téléphone</div>
                    <div className="rp-info-value">{restaurant?.phone || '—'}</div>
                  </div>
                </div>
                {restaurant?.description && (
                  <p className="rp-description">{restaurant.description}</p>
                )}
                <div>
                  <span
                    className="rp-status-badge"
                    style={{
                      background: restaurant?.status === 'APPROVED'
                        ? 'rgba(183,234,78,.12)' : 'rgba(23,23,20,.06)',
                      color: restaurant?.status === 'APPROVED'
                        ? '#4a7a00' : 'rgba(23,23,20,.4)',
                      border: `1px solid ${restaurant?.status === 'APPROVED'
                        ? 'rgba(183,234,78,.3)' : 'rgba(23,23,20,.1)'}`,
                    }}
                  >
                    <CheckCircle size={12} />
                    {restaurant?.status || 'PENDING'}
                  </span>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Horaires d'ouverture" icon={Clock}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hours.map((h, i) => {
                const isToday = adjustedToday === h.dayOfWeek
                return (
                  <div key={h.dayOfWeek} className={`rp-hours-row${isToday ? ' today' : ''}`}>
                    <span className="rp-day-label" style={{ color: isToday ? '#4a7a00' : '#171714' }}>
                      {DAYS[i]}
                    </span>

                    <label className="rp-checkbox-label">
                      <input
                        type="checkbox"
                        checked={h.closed}
                        onChange={e => handleHourChange(h.dayOfWeek, 'closed', e.target.checked)}
                        style={{ accentColor: '#b7ea4e', width: 15, height: 15, cursor: 'pointer' }}
                      />
                      Fermé
                    </label>

                    {!h.closed ? (
                      <>
                        <input
                          type="time"
                          className="rp-time-input"
                          value={h.openTime || '09:00'}
                          onChange={e => handleHourChange(h.dayOfWeek, 'openTime', e.target.value)}
                        />
                        <span className="rp-sep">—</span>
                        <input
                          type="time"
                          className="rp-time-input"
                          value={h.closeTime || '22:00'}
                          onChange={e => handleHourChange(h.dayOfWeek, 'closeTime', e.target.value)}
                        />
                      </>
                    ) : (
                      <span className="rp-closed-lbl">Fermé ce jour</span>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleSaveHours}
              disabled={savingHours}
              className="rp-btn-save"
              style={{ marginTop: 20 }}
            >
              <Save size={15} />
              {savingHours ? 'Enregistrement...' : 'Sauvegarder les horaires'}
            </button>
          </SectionCard>

        </div>
      </div>
    </>
  )
}