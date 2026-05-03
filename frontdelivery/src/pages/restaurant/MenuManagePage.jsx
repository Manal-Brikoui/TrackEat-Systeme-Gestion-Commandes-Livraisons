import { useEffect, useState, useCallback, useRef } from 'react'
import { restaurantService } from '../../services/restaurantService'
import { driverService } from '../../services/driverService'
import { workingHoursService } from '../../services/workingHoursService'
import { uploadImage } from '../../services/uploadService'
import { orderService } from '../../services/orderService'
import {
  UtensilsCrossed, Plus, Trash2, Tag, Search, RefreshCw, Package,
  ChevronDown, ChevronUp, X, MapPin, Clock, Truck, Upload, Loader,
  CheckCircle, Image, Store, Star, Pencil,
} from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  bg:       '#fafaf7',
  surface:  '#ffffff',
  border:   'rgba(23,23,20,.08)',
  borderMd: 'rgba(23,23,20,.12)',
  text:     '#171714',
  muted:    'rgba(23,23,20,.45)',
  hint:     'rgba(23,23,20,.3)',
  accent:   '#b7ea4e',
  accentDk: '#4a7a00',
  danger:   '#ef4444',
  blue:     '#2563eb',
  green:    '#4ade80',
  input:    '#fafaf7',
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const inputStyle = {
  width: '100%',
  padding: '10px 13px',
  background: T.input,
  border: `1px solid ${T.borderMd}`,
  borderRadius: 9,
  color: T.text,
  fontSize: '0.9rem',
  fontFamily: "'Jost', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .18s',
}

const labelStyle = {
  display: 'block',
  marginBottom: 6,
  color: T.muted,
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  fontFamily: "'Jost', sans-serif",
}

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

@keyframes mm-in    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes mm-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
@keyframes mm-spin  { to { transform: rotate(360deg) } }

.mm-root * { font-family: 'Jost', sans-serif; box-sizing: border-box; }

.mm-root {
  background: #fafaf7;
  min-height: 100vh;
  animation: mm-in .3s ease both;
}

.mm-header {
  background: #fff;
  border-bottom: 1px solid rgba(23,23,20,.08);
  padding: 28px 32px 22px;
}
.mm-header-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
}
.mm-brand {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
}
.mm-brand-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #b7ea4e;
  animation: mm-pulse 2s ease-in-out infinite;
}
.mm-brand-name {
  color: #4a7a00;
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.mm-title {
  font-family: 'Cormorant Garamond', serif !important;
  font-weight: 800;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #171714;
  margin: 0 0 4px;
  line-height: 1.1;
}
.mm-subtitle {
  color: rgba(23,23,20,.45);
  font-size: .87rem;
  margin: 0;
}

.mm-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

.mm-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 17px;
  border-radius: 8px;
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  font-size: .83rem;
  cursor: pointer;
  border: none;
  transition: all .17s;
  white-space: nowrap;
}
.mm-btn-accent  { background: #b7ea4e; color: #0f2a00; }
.mm-btn-accent:hover { background: #a8d843; }
.mm-btn-outline { background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.3); color: #4a7a00; }
.mm-btn-outline:hover { background: rgba(183,234,78,.18); }
.mm-btn-blue    { background: rgba(96,165,250,.1); border: 1px solid rgba(96,165,250,.28); color: #2563eb; }
.mm-btn-blue:hover { background: rgba(96,165,250,.18); }

.mm-tabs {
  background: #fff;
  border-bottom: 1px solid rgba(23,23,20,.08);
  padding: 0 32px;
  display: flex;
  overflow-x: auto;
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 2px 12px rgba(23,23,20,.04);
}
.mm-tabs-inner { max-width: 900px; margin: 0 auto; display: flex; width: 100%; }
.mm-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  border: none;
  background: none;
  color: rgba(23,23,20,.4);
  font-family: 'Jost', sans-serif;
  font-size: .83rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
  transition: all .18s;
}
.mm-tab:hover { color: #171714; }
.mm-tab.active { color: #4a7a00; border-bottom-color: #b7ea4e; }

.mm-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

.mm-search-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.mm-search-wrap { position: relative; flex: 1; min-width: 200px; }
.mm-search-ico {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  color: rgba(23,23,20,.35); pointer-events: none;
}
.mm-search-input {
  width: 100%; padding: 9px 12px 9px 36px;
  background: #fff; border: 1px solid rgba(23,23,20,.1);
  border-radius: 8px; font-family: 'Jost', sans-serif;
  font-size: .88rem; color: #171714; outline: none;
  transition: border-color .18s;
}
.mm-search-input:focus { border-color: rgba(183,234,78,.6); box-shadow: 0 0 0 3px rgba(183,234,78,.1); }

.mm-filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.mm-pill {
  padding: 7px 15px; border-radius: 50px;
  font-family: 'Jost', sans-serif; font-size: .78rem; font-weight: 600;
  border: 1px solid rgba(23,23,20,.1); background: #fff; color: rgba(23,23,20,.5);
  cursor: pointer; transition: all .17s;
}
.mm-pill:hover { border-color: rgba(23,23,20,.22); color: #171714; }
.mm-pill.active { background: #171714; color: #fff; border-color: #171714; }

.mm-cat-group {
  background: #fff;
  border: 1px solid rgba(23,23,20,.08);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
}
.mm-cat-header {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid rgba(23,23,20,.06);
  transition: background .15s;
}
.mm-cat-header:hover { background: rgba(23,23,20,.015); }
.mm-cat-title { display: flex; align-items: center; gap: 9px; }
.mm-cat-label { color: #171714; font-weight: 700; font-size: .9rem; }
.mm-cat-badge {
  padding: 2px 9px; border-radius: 20px;
  background: rgba(183,234,78,.15); color: #4a7a00;
  font-size: .72rem; font-weight: 700;
  border: 1px solid rgba(183,234,78,.25);
}

.mm-product-list { padding: 10px 14px; display: flex; flex-direction: column; gap: 7px; }
.mm-product {
  display: flex; align-items: center; gap: 13px;
  padding: 11px 13px;
  background: #fafaf7;
  border-radius: 10px;
  border: 1px solid rgba(23,23,20,.06);
  transition: border-color .15s;
}
.mm-product:hover { border-color: rgba(183,234,78,.3); }
.mm-product-img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.mm-product-ph {
  width: 50px; height: 50px; border-radius: 8px;
  background: #f2f4ed; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0;
}
.mm-product-name { color: #171714; font-weight: 600; font-size: .89rem; margin-bottom: 2px; }
.mm-product-desc {
  color: rgba(23,23,20,.45); font-size: .78rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px;
}
.mm-product-price {
  color: #4a7a00; font-weight: 700; font-size: .92rem;
  flex-shrink: 0; margin-left: auto; white-space: nowrap;
}
.mm-product-price span { font-size: .72rem; color: rgba(74,122,0,.7); }
.mm-del-btn {
  width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
  background: rgba(239,68,68,.07); border: 1px solid rgba(239,68,68,.18);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .17s;
}
.mm-del-btn:hover { background: rgba(239,68,68,.15); border-color: rgba(239,68,68,.35); }
.mm-edit-btn {
  width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
  background: rgba(37,99,235,.07); border: 1px solid rgba(37,99,235,.18);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .17s;
}
.mm-edit-btn:hover { background: rgba(37,99,235,.15); border-color: rgba(37,99,235,.35); }

.mm-empty {
  background: #fff; border: 1px solid rgba(23,23,20,.08);
  border-radius: 14px; padding: 56px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
}
.mm-empty-icon {
  width: 60px; height: 60px; border-radius: 18px;
  background: #f2f4ed; border: 1px solid rgba(23,23,20,.08);
  display: flex; align-items: center; justify-content: center;
  color: rgba(23,23,20,.2); margin-bottom: 6px;
}

.mm-card {
  background: #fff;
  border: 1px solid rgba(23,23,20,.08);
  border-radius: 14px;
  overflow: hidden;
}
.mm-card-header {
  padding: 14px 20px;
  border-bottom: 1px solid rgba(23,23,20,.06);
  display: flex; align-items: center; justify-content: space-between;
}
.mm-card-title { display: flex; align-items: center; gap: 8px; color: #171714; font-weight: 700; font-size: .92rem; }
.mm-card-badge {
  padding: 2px 9px; border-radius: 20px;
  background: rgba(96,165,250,.1); color: #2563eb;
  font-size: .72rem; font-weight: 700;
  border: 1px solid rgba(96,165,250,.22);
}

.mm-hours-list { padding: 8px 0; }
.mm-hours-row {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 20px;
  border-bottom: 1px solid rgba(23,23,20,.04);
  transition: background .15s;
}
.mm-hours-row:last-child { border-bottom: none; }
.mm-hours-row.today { background: rgba(183,234,78,.06); }
.mm-day-wrap { display: flex; align-items: center; gap: 8px; min-width: 100px; flex-shrink: 0; }
.mm-day-name { font-size: .875rem; font-weight: 400; color: rgba(23,23,20,.55); }
.mm-day-name.today { font-weight: 700; color: #4a7a00; }
.mm-today-tag {
  font-size: .6rem; font-weight: 700; letter-spacing: .06em;
  background: rgba(183,234,78,.15); color: #4a7a00;
  padding: 2px 7px; border-radius: 50px;
  text-transform: uppercase; border: 1px solid rgba(183,234,78,.28);
}
.mm-bar-wrap { flex: 1; height: 3px; background: rgba(23,23,20,.07); border-radius: 2px; overflow: hidden; }
.mm-bar-fill { height: 100%; background: #b7ea4e; border-radius: 2px; }
.mm-time-str { font-size: .83rem; font-weight: 500; color: rgba(23,23,20,.5); min-width: 120px; text-align: right; white-space: nowrap; }
.mm-closed-str { font-size: .8rem; font-weight: 700; color: #ef4444; min-width: 120px; text-align: right; }

.mm-driver-list { padding: 14px 16px; display: flex; flex-direction: column; gap: 7px; }
.mm-driver-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; background: #fafaf7;
  border-radius: 10px; border: 1px solid rgba(23,23,20,.06);
}
.mm-driver-name { font-weight: 600; font-size: .88rem; color: #171714; margin-bottom: 3px; }
.mm-online { display: flex; align-items: center; gap: 5px; }
.mm-online-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: mm-pulse 2s ease-in-out infinite; }
.mm-online-lbl { color: #4ade80; font-size: .74rem; font-weight: 600; }

.mm-map-placeholder {
  height: 220px; display: flex; align-items: center; justify-content: center;
  background: #f2f4ed; color: rgba(23,23,20,.35); font-size: .88rem; gap: 8px;
}
.mm-addr-card {
  padding: 13px 18px; display: flex; align-items: center; gap: 10px;
  border-top: 1px solid rgba(23,23,20,.06);
  background: #fff; color: #171714; font-size: .88rem;
}

.mm-overlay {
  position: fixed; inset: 0;
  background: rgba(23,23,20,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
}
.mm-modal {
  background: #fff;
  border: 1px solid rgba(23,23,20,.1);
  border-radius: 18px;
  padding: 28px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.mm-modal-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;
}
.mm-modal-title {
  font-family: 'Cormorant Garamond', serif !important;
  font-weight: 800; font-size: 1.25rem; color: #171714; margin: 0;
}
.mm-modal-close {
  background: none; border: none; color: rgba(23,23,20,.4); cursor: pointer;
  display: flex; align-items: center; padding: 4px; border-radius: 6px;
  transition: color .15s;
}
.mm-modal-close:hover { color: #171714; }

.mm-upload-btn {
  width: 100%; height: 110px; border: 2px dashed rgba(23,23,20,.12);
  border-radius: 10px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
  background: #fafaf7; cursor: pointer; transition: border-color .18s;
}
.mm-upload-btn:hover { border-color: rgba(183,234,78,.6); }
.mm-preview-wrap { position: relative; height: 130px; border-radius: 10px; overflow: hidden; border: 1px solid rgba(23,23,20,.08); }
.mm-preview-del {
  position: absolute; top: 8px; right: 8px; width: 26px; height: 26px;
  background: #ef4444; color: #fff; border: none; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}

.mm-form-actions { display: flex; gap: 10px; margin-top: 8px; }
.mm-btn-cancel {
  flex: 1; padding: 11px; background: transparent;
  border: 1px solid rgba(23,23,20,.12); border-radius: 9px;
  color: rgba(23,23,20,.5); cursor: pointer; font-weight: 600;
  font-family: 'Jost', sans-serif; font-size: .9rem; transition: all .17s;
}
.mm-btn-cancel:hover { border-color: rgba(23,23,20,.25); color: #171714; }
.mm-btn-submit {
  flex: 2; padding: 11px; background: #b7ea4e; color: #0f2a00;
  border: none; border-radius: 9px; font-weight: 700;
  font-family: 'Jost', sans-serif; font-size: .9rem; cursor: pointer; transition: all .17s;
}
.mm-btn-submit:hover { background: #a8d843; }
.mm-btn-submit:disabled { opacity: .6; cursor: not-allowed; }

.mm-toggle {
  width: 36px; height: 20px; border-radius: 10px; cursor: pointer;
  position: relative; transition: background .2s; flex-shrink: 0;
}
.mm-toggle-knob {
  width: 14px; height: 14px; border-radius: 50%; background: #fff;
  position: absolute; top: 3px; transition: left .2s;
}

.mm-spin { animation: mm-spin 0.9s linear infinite; }

.mm-loading {
  min-height: 100vh; background: #fafaf7;
  display: flex; align-items: center; justify-content: center; gap: 12px;
  color: rgba(23,23,20,.45); font-size: .9rem;
}

@media (max-width: 640px) {
  .mm-header { padding: 20px 16px 18px; }
  .mm-tabs { padding: 0 16px; }
  .mm-body { padding: 20px 14px 48px; }
  .mm-tab { padding: 13px 14px; font-size: .8rem; }
  .mm-day-wrap { min-width: 80px; }
  .mm-time-str, .mm-closed-str { min-width: 90px; font-size: .78rem; }
}
`

function ImageUploader({ value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Fichier image requis'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setPreview(url); onChange(url)
      toast.success('Image uploadée')
    } catch { toast.error('Erreur upload') }
    finally { setUploading(false) }
  }

  const remove = () => {
    setPreview(null); onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label style={labelStyle}>
        <Image size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
        Photo du produit
      </label>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {preview ? (
        <div className="mm-preview-wrap">
          <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button type="button" onClick={remove} className="mm-preview-del"><X size={12} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="mm-upload-btn">
          {uploading
            ? <><Loader size={22} color={T.accentDk} className="mm-spin" /><span style={{ fontSize: '.8rem', color: T.muted }}>Upload...</span></>
            : <><Upload size={22} color={T.muted} /><div style={{ textAlign: 'center' }}><p style={{ margin: 0, fontSize: '.85rem', color: T.muted }}>Cliquer pour choisir</p><p style={{ margin: '2px 0 0', fontSize: '.72rem', color: T.hint }}>PNG, JPG, WEBP — max 5MB</p></div></>
          }
        </button>
      )}
    </div>
  )
}

function AddProductModal({ restaurantId, categories, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '', categoryId: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) return toast.error('Nom et prix requis')
    setLoading(true)
    try {
      const created = await restaurantService.addProduct({
        name: form.name, description: form.description,
        price: parseFloat(form.price),
        imageUrl: form.imageUrl || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        restaurantId: Number(restaurantId),
      })
      toast.success('Produit ajouté')
      onAdded(created); onClose()
    } catch { toast.error("Erreur lors de l'ajout") }
    finally { setLoading(false) }
  }

  return (
    <div className="mm-overlay">
      <div className="mm-modal" style={{ maxWidth: 480 }}>
        <div className="mm-modal-header">
          <h2 className="mm-modal-title">Ajouter un produit</h2>
          <button onClick={onClose} className="mm-modal-close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ImageUploader value={form.imageUrl} onChange={url => setForm(f => ({ ...f, imageUrl: url }))} />
          <div>
            <label style={labelStyle}>Nom *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Ex: Pizza Margherita" required />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} rows={2} placeholder="Ingrédients, allergènes..." />
          </div>
          <div>
            <label style={labelStyle}>Prix (MAD) *</label>
            <div style={{ position: 'relative' }}>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={{ ...inputStyle, paddingRight: 52 }} placeholder="85.00" required />
              <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: T.accentDk, fontWeight: 700, fontSize: '.82rem' }}>MAD</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={inputStyle}>
              <option value="">Sans catégorie</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="mm-form-actions">
            <button type="button" onClick={onClose} className="mm-btn-cancel">Annuler</button>
            <button type="submit" disabled={loading} className="mm-btn-submit">{loading ? 'Ajout...' : 'Ajouter le produit'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price?.toString() || '',
    imageUrl: product.imageUrl || '',
    categoryId: product.categoryId?.toString() || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) return toast.error('Nom et prix requis')
    setLoading(true)
    try {
      const updated = await restaurantService.updateProduct(product.id, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        imageUrl: form.imageUrl || null,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      })
      toast.success('Produit modifié')
      onSaved(updated)
      onClose()
    } catch { toast.error('Erreur lors de la modification') }
    finally { setLoading(false) }
  }

  return (
    <div className="mm-overlay">
      <div className="mm-modal" style={{ maxWidth: 480 }}>
        <div className="mm-modal-header">
          <h2 className="mm-modal-title">Modifier le produit</h2>
          <button onClick={onClose} className="mm-modal-close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ImageUploader value={form.imageUrl} onChange={url => setForm(f => ({ ...f, imageUrl: url }))} />
          <div>
            <label style={labelStyle}>Nom *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: 'vertical' }} rows={2} />
          </div>
          <div>
            <label style={labelStyle}>Prix (MAD) *</label>
            <div style={{ position: 'relative' }}>
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={{ ...inputStyle, paddingRight: 52 }} required />
              <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: T.accentDk, fontWeight: 700, fontSize: '.82rem' }}>MAD</span>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={inputStyle}>
              <option value="">Sans catégorie</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="mm-form-actions">
            <button type="button" onClick={onClose} className="mm-btn-cancel">Annuler</button>
            <button type="submit" disabled={loading} className="mm-btn-submit">{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddCategoryModal({ onClose, onAdded }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const created = await restaurantService.createCategory({ name: name.trim() })
      toast.success('Catégorie créée')
      onAdded(created); onClose()
    } catch { toast.error('Erreur création catégorie') }
    finally { setLoading(false) }
  }

  return (
    <div className="mm-overlay">
      <div className="mm-modal" style={{ maxWidth: 380 }}>
        <div className="mm-modal-header">
          <h2 className="mm-modal-title">Nouvelle catégorie</h2>
          <button onClick={onClose} className="mm-modal-close"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nom de la catégorie *</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Ex: Entrées, Plats, Desserts..." required autoFocus />
          </div>
          <div className="mm-form-actions">
            <button type="button" onClick={onClose} className="mm-btn-cancel">Annuler</button>
            <button type="submit" disabled={loading} className="mm-btn-submit">{loading ? 'Création...' : 'Créer la catégorie'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function buildHoursState(existingHours) {
  return DAYS.map((day, i) => {
    const existing = existingHours.find(h => Number(h.dayOfWeek) === i + 1)
    const isOpen = existing ? !existing.closed && existing.openTime !== '00:00' : false
    return {
      dayOfWeek: i + 1, dayLabel: day, open: isOpen,
      openTime: (existing && existing.openTime && existing.openTime !== '00:00') ? existing.openTime : '09:00',
      closeTime: (existing && existing.closeTime && existing.closeTime !== '00:00') ? existing.closeTime : '22:00',
    }
  })
}

function WorkingHoursModal({ restaurantId, existingHours, onClose, onSaved }) {
  const [hours, setHours] = useState(() => buildHoursState(existingHours))
  const [loading, setLoading] = useState(false)

  useEffect(() => { setHours(buildHoursState(existingHours)) }, [existingHours])

  const toggle = idx => setHours(h => h.map((d, i) => i === idx ? { ...d, open: !d.open } : d))
  const update = (idx, field, val) => setHours(h => h.map((d, i) => i === idx ? { ...d, [field]: val } : d))

  const handleSave = async () => {
    setLoading(true)
    try {
      await workingHoursService.update({
        restaurantId,
        hours: hours.map(d => ({
          dayOfWeek: d.dayOfWeek,
          openTime: d.open ? d.openTime : '00:00',
          closeTime: d.open ? d.closeTime : '00:00',
          closed: !d.open,
        }))
      })
      const refreshed = await workingHoursService.getByRestaurant(restaurantId)
      toast.success('Horaires enregistrés')
      onSaved(refreshed); onClose()
    } catch { toast.error('Erreur enregistrement horaires') }
    finally { setLoading(false) }
  }

  return (
    <div className="mm-overlay">
      <div className="mm-modal" style={{ maxWidth: 520 }}>
        <div className="mm-modal-header">
          <h2 className="mm-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Clock size={16} color={T.accentDk} />
            Horaires de travail
          </h2>
          <button onClick={onClose} className="mm-modal-close"><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
          {hours.map((day, idx) => (
            <div key={day.dayOfWeek} style={{
              background: '#fafaf7', borderRadius: 10, padding: '11px 15px',
              border: `1px solid ${day.open ? 'rgba(183,234,78,.35)' : 'rgba(23,23,20,.08)'}`,
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <div
                className="mm-toggle"
                style={{ background: day.open ? T.accent : 'rgba(23,23,20,.1)' }}
                onClick={() => toggle(idx)}
              >
                <div className="mm-toggle-knob" style={{ left: day.open ? 19 : 3 }} />
              </div>
              <span style={{ color: day.open ? T.text : T.muted, fontWeight: 600, width: 72, flexShrink: 0, fontSize: '.88rem' }}>
                {day.dayLabel}
              </span>
              {day.open ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <input type="time" value={day.openTime} onChange={e => update(idx, 'openTime', e.target.value)}
                    style={{ ...inputStyle, width: 'auto', flex: 1, padding: '7px 10px', fontSize: '.86rem' }} />
                  <span style={{ color: T.muted, fontSize: '.85rem' }}>—</span>
                  <input type="time" value={day.closeTime} onChange={e => update(idx, 'closeTime', e.target.value)}
                    style={{ ...inputStyle, width: 'auto', flex: 1, padding: '7px 10px', fontSize: '.86rem' }} />
                </div>
              ) : (
                <span style={{ color: T.danger, fontSize: '.83rem', fontWeight: 700 }}>Fermé</span>
              )}
            </div>
          ))}
        </div>
        <div className="mm-form-actions">
          <button onClick={onClose} className="mm-btn-cancel">Annuler</button>
          <button onClick={handleSave} disabled={loading} className="mm-btn-submit">
            {loading ? 'Enregistrement...' : 'Enregistrer les horaires'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignDriverModal({ orders, drivers, onClose, onAssigned }) {
  const [selectedOrder, setSelectedOrder] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [loading, setLoading] = useState(false)
  const readyOrders = orders.filter(o => o.status === 'READY')

  const handleAssign = async () => {
    if (!selectedOrder || !selectedDriver) return toast.error('Sélectionnez une commande et un driver')
    setLoading(true)
    try {
      const updated = await orderService.assignDriver(Number(selectedOrder), Number(selectedDriver))
      toast.success('Driver assigné avec succès')
      onAssigned(updated); onClose()
    } catch { toast.error("Erreur lors de l'assignation") }
    finally { setLoading(false) }
  }

  return (
    <div className="mm-overlay">
      <div className="mm-modal" style={{ maxWidth: 440 }}>
        <div className="mm-modal-header">
          <h2 className="mm-modal-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Truck size={16} color={T.blue} />
            Assigner un driver
          </h2>
          <button onClick={onClose} className="mm-modal-close"><X size={18} /></button>
        </div>
        {readyOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: T.muted }}>
            <CheckCircle size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: .35 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Aucune commande prête à livrer</p>
            <p style={{ margin: '4px 0 0', fontSize: '.82rem' }}>Les commandes doivent être en statut READY</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Commande à livrer *</label>
              <select value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)} style={inputStyle}>
                <option value="">Choisir une commande...</option>
                {readyOrders.map(o => <option key={o.id} value={o.id}>Commande #{o.id} — {o.totalPrice?.toFixed(2)} MAD</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Driver disponible *</label>
              {drivers.length === 0 ? (
                <div style={{ padding: '11px 13px', background: '#fafaf7', borderRadius: 9, color: T.danger, fontSize: '.88rem', border: `1px solid rgba(239,68,68,.2)` }}>
                  Aucun driver en ligne actuellement
                </div>
              ) : (
                <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} style={inputStyle}>
                  <option value="">Choisir un driver...</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName || d.name || `Driver #${d.id}`}</option>)}
                </select>
              )}
            </div>
            <div className="mm-form-actions">
              <button onClick={onClose} className="mm-btn-cancel">Annuler</button>
              <button onClick={handleAssign} disabled={loading || drivers.length === 0}
                style={{ flex: 2, padding: '11px', background: '#60a5fa', color: '#0a1628', border: 'none', borderRadius: 9, fontWeight: 700, fontFamily: "'Jost', sans-serif", fontSize: '.9rem', cursor: 'pointer', opacity: loading ? .7 : 1 }}>
                {loading ? 'Assignation...' : 'Assigner le driver'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryGroup({ category, products, onDelete, onEdit }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mm-cat-group">
      <div className="mm-cat-header" onClick={() => setOpen(o => !o)}>
        <div className="mm-cat-title">
          <Tag size={14} color={T.accent} />
          <span className="mm-cat-label">{category}</span>
          <span className="mm-cat-badge">{products.length}</span>
        </div>
        {open ? <ChevronUp size={14} color={T.muted} /> : <ChevronDown size={14} color={T.muted} />}
      </div>
      {open && (
        <div className="mm-product-list">
          {products.map(p => (
            <div key={p.id} className="mm-product">
              {p.imageUrl
                ? <img src={p.imageUrl} alt={p.name} className="mm-product-img" />
                : <div className="mm-product-ph"><Package size={19} color={T.muted} /></div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mm-product-name">{p.name}</div>
                {p.description && <div className="mm-product-desc">{p.description}</div>}
              </div>
              <div className="mm-product-price">{p.price?.toFixed(2)} <span>MAD</span></div>
              <button onClick={() => onEdit(p)} className="mm-edit-btn" title="Modifier">
                <Pencil size={13} color={T.blue} />
              </button>
              <button onClick={() => onDelete(p.id)} className="mm-del-btn" title="Supprimer">
                <Trash2 size={13} color={T.danger} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function barPct(h) {
  if (!h || h.closed || !h.openTime || h.openTime === '00:00' || h.openTime === '00:00:00') return 0
  const [oh, om] = h.openTime.split(':').map(Number)
  const openM = oh * 60 + om
  const [ch, cm] = (h.closeTime || '00:00').split(':').map(Number)
  let closeM = ch * 60 + cm
  if (closeM === 0) closeM = 24 * 60
  return Math.max(0, Math.round(((closeM - openM) / (24 * 60)) * 100))
}

export default function MenuManagePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [orders, setOrders] = useState([])
  const [workingHours, setWorkingHours] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('ALL')
  const [activeTab, setActiveTab] = useState('menu')

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showHours, setShowHours] = useState(false)
  const [showAssignDriver, setShowAssignDriver] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const load = useCallback(async () => {
    try {
      const resto = await restaurantService.getMy()
      setRestaurant(resto)
      const [cats, driversData, prods, ordersData, hoursData] = await Promise.all([
        restaurantService.getCategories(),
        driverService.getAvailable(),
        restaurantService.getProducts(resto.id),
        orderService.getByRestaurant(resto.id),
        workingHoursService.getByRestaurant(resto.id),
      ])
      setCategories(cats); setDrivers(driversData); setProducts(prods)
      setOrders(ordersData); setWorkingHours(hoursData)
    } catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return
    try {
      await restaurantService.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Produit supprimé')
    } catch { toast.error('Erreur de suppression') }
  }

  const handleEditSaved = (updated) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== updated.id) return p
      const catName = updated.categoryName || categories.find(c => c.id === updated.categoryId)?.name || null
      return { ...updated, categoryName: catName }
    }))
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'ALL' || (p.categoryName || 'Sans catégorie') === filterCat
    return matchSearch && matchCat
  })

  const grouped = filtered.reduce((acc, p) => {
    const cat = p.categoryName || 'Sans catégorie'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const uniqueCats = ['ALL', ...new Set(products.map(p => p.categoryName || 'Sans catégorie'))]
  const readyOrders = orders.filter(o => o.status === 'READY')

  const jsDay = new Date().getDay()
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1

  const TABS = [
    { id: 'menu',    label: 'Menu',         icon: UtensilsCrossed },
    { id: 'map',     label: 'Localisation', icon: MapPin },
    { id: 'hours',   label: 'Horaires',     icon: Clock },
    { id: 'drivers', label: 'Drivers',      icon: Truck },
  ]

  if (loading) return (
    <div className="mm-loading">
      <style>{GLOBAL_CSS}</style>
      <RefreshCw size={22} color={T.accentDk} className="mm-spin" />
      <span>Chargement...</span>
    </div>
  )

  const encodedAddr = encodeURIComponent(restaurant?.address || 'Maroc')

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="mm-root">

        <div className="mm-header">
          <div className="mm-header-inner">
            <div>
              <div className="mm-brand">
                <div className="mm-brand-dot" />
                <span className="mm-brand-name">{restaurant?.name}</span>
              </div>
              <h1 className="mm-title">Gestion du menu</h1>
              <p className="mm-subtitle">{products.length} produit(s) — {categories.length} catégorie(s)</p>
            </div>
            <div className="mm-actions">
              {readyOrders.length > 0 && (
                <button onClick={() => setShowAssignDriver(true)} className="mm-btn mm-btn-blue">
                  <Truck size={14} />
                  Assigner driver ({readyOrders.length})
                </button>
              )}
              <button onClick={() => setShowAddCategory(true)} className="mm-btn mm-btn-outline">
                <Tag size={14} />
                Catégorie
              </button>
              <button onClick={() => setShowAddProduct(true)} className="mm-btn mm-btn-accent">
                <Plus size={14} />
                Produit
              </button>
            </div>
          </div>
        </div>

        <div className="mm-tabs">
          <div className="mm-tabs-inner">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`mm-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mm-body">

          {activeTab === 'menu' && (
            <>
              <div className="mm-search-row">
                <div className="mm-search-wrap">
                  <Search size={14} className="mm-search-ico" />
                  <input
                    className="mm-search-input"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un produit..."
                  />
                </div>
                <div className="mm-filter-pills">
                  {uniqueCats.map(cat => (
                    <button
                      key={cat}
                      className={`mm-pill${filterCat === cat ? ' active' : ''}`}
                      onClick={() => setFilterCat(cat)}
                    >
                      {cat === 'ALL' ? 'Tout' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {Object.keys(grouped).length === 0 ? (
                <div className="mm-empty">
                  <div className="mm-empty-icon"><UtensilsCrossed size={26} /></div>
                  <p style={{ fontWeight: 700, color: T.text, margin: 0 }}>
                    {search ? 'Aucun résultat' : 'Aucun produit dans le menu'}
                  </p>
                  <p style={{ color: T.muted, fontSize: '.85rem', margin: 0 }}>
                    {search ? 'Essayez un autre mot-clé' : 'Commencez par ajouter votre premier produit'}
                  </p>
                  {!search && (
                    <button onClick={() => setShowAddProduct(true)} className="mm-btn mm-btn-accent" style={{ marginTop: 8 }}>
                      <Plus size={14} />
                      Ajouter le premier produit
                    </button>
                  )}
                </div>
              ) : (
                Object.entries(grouped).map(([cat, prods]) => (
                  <CategoryGroup
                    key={cat}
                    category={cat}
                    products={prods}
                    onDelete={handleDeleteProduct}
                    onEdit={p => setEditingProduct(p)}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'map' && (
            <div className="mm-card">
              <div className="mm-card-header">
                <div className="mm-card-title">
                  <MapPin size={15} color={T.accentDk} />
                  Localisation
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodedAddr}`}
                  target="_blank" rel="noreferrer"
                  style={{ color: T.accentDk, fontSize: '.8rem', fontWeight: 700, textDecoration: 'none' }}
                >
                  Voir sur Google Maps
                </a>
              </div>
              <iframe
                title="map"
                src={`https://maps.google.com/maps?q=${encodedAddr}&output=embed&z=15`}
                width="100%" height="240"
                style={{ border: 'none', display: 'block' }}
                loading="lazy"
              />
              {restaurant?.address && (
                <div className="mm-addr-card">
                  <MapPin size={15} color={T.accentDk} style={{ flexShrink: 0 }} />
                  <span>{restaurant.address}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="mm-card">
              <div className="mm-card-header">
                <div className="mm-card-title">
                  <Clock size={15} color={T.accentDk} />
                  Horaires de la semaine
                </div>
                <button onClick={() => setShowHours(true)} className="mm-btn mm-btn-accent" style={{ padding: '7px 15px', fontSize: '.82rem' }}>
                  Modifier
                </button>
              </div>
              <div className="mm-hours-list">
                {DAYS.map((day, i) => {
                  const h = workingHours.find(wh => Number(wh.dayOfWeek) === i + 1)
                  const isClosed = !h || h.closed || h.openTime === '00:00' || h.openTime === '00:00:00'
                  const isToday = i === todayIdx
                  const bw = barPct(h)
                  const closeLabel = h?.closeTime?.slice(0, 5) === '00:00' ? 'Minuit' : h?.closeTime?.slice(0, 5)
                  return (
                    <div key={day} className={`mm-hours-row${isToday ? ' today' : ''}`}>
                      <div className="mm-day-wrap">
                        <span className={`mm-day-name${isToday ? ' today' : ''}`}>{day}</span>
                        {isToday && <span className="mm-today-tag">Aujourd'hui</span>}
                      </div>
                      <div className="mm-bar-wrap">
                        <div className="mm-bar-fill" style={{ width: `${bw}%` }} />
                      </div>
                      {!isClosed
                        ? <span className="mm-time-str">{h.openTime?.slice(0, 5)} — {closeLabel}</span>
                        : <span className="mm-closed-str">Fermé</span>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="mm-card">
              <div className="mm-card-header">
                <div className="mm-card-title">
                  <Truck size={15} color={T.blue} />
                  Drivers disponibles
                  <span className="mm-card-badge">{drivers.length}</span>
                </div>
                {readyOrders.length > 0 && (
                  <button onClick={() => setShowAssignDriver(true)} className="mm-btn mm-btn-blue" style={{ padding: '7px 15px', fontSize: '.82rem' }}>
                    Assigner
                  </button>
                )}
              </div>
              <div className="mm-driver-list">
                {drivers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 0', color: T.muted }}>
                    <Truck size={30} style={{ margin: '0 auto 10px', display: 'block', opacity: .25 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>Aucun driver en ligne</p>
                  </div>
                ) : (
                  drivers.map(d => (
                    <div key={d.id} className="mm-driver-row">
                      <div>
                        <div className="mm-driver-name">{d.fullName || d.name || `Driver #${d.id}`}</div>
                        <div className="mm-online">
                          <div className="mm-online-dot" />
                          <span className="mm-online-lbl">En ligne</span>
                        </div>
                      </div>
                      {readyOrders.length > 0 && (
                        <button onClick={() => setShowAssignDriver(true)} className="mm-btn mm-btn-blue" style={{ padding: '6px 13px', fontSize: '.8rem' }}>
                          Assigner
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {showAddProduct && restaurant && (
        <AddProductModal
          restaurantId={restaurant.id}
          categories={categories}
          onClose={() => setShowAddProduct(false)}
          onAdded={p => setProducts(prev => [...prev, p])}
        />
      )}
      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onAdded={cat => setCategories(prev => [...prev, cat])}
        />
      )}
      {showHours && restaurant && (
        <WorkingHoursModal
          restaurantId={restaurant.id}
          existingHours={workingHours}
          onClose={() => setShowHours(false)}
          onSaved={refreshed => setWorkingHours(refreshed)}
        />
      )}
      {showAssignDriver && (
        <AssignDriverModal
          orders={orders}
          drivers={drivers}
          onClose={() => setShowAssignDriver(false)}
          onAssigned={updated => setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))}
        />
      )}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={handleEditSaved}
        />
      )}
    </>
  )
}