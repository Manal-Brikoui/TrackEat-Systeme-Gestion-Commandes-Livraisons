import { useEffect, useState } from 'react'
import { restaurantService } from '../../services/restaurantService'
import {
  Tag, Plus, Trash2, Edit3, Check,
  X, RefreshCw, Search,
} from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  bg:       '#fafaf7',
  surface:  '#fff',
  border:   'rgba(23,23,20,.09)',
  text:     '#171714',
  muted:    'rgba(23,23,20,.45)',
  accent:   '#b7ea4e',
  green:    '#4a7a00',
  danger:   '#ef4444',
  dangerBg: 'rgba(239,68,68,.08)',
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
<ellipse cx="1260" cy="120" rx="180" ry="160" fill="#b7ea4e" opacity="0.14"/>
<circle cx="1300" cy="100" r="320" fill="none" stroke="#b7ea4e" stroke-width="1" opacity="0.28"/>
<circle cx="1300" cy="100" r="240" fill="none" stroke="#b7ea4e" stroke-width="0.6" opacity="0.18"/>
<circle cx="1300" cy="100" r="160" fill="none" stroke="#b7ea4e" stroke-width="0.4" opacity="0.12"/>
<ellipse cx="-80" cy="820" rx="380" ry="320" fill="#171714" opacity="0.04"/>
<ellipse cx="-30" cy="880" rx="250" ry="200" fill="#171714" opacity="0.035"/>
<ellipse cx="100" cy="820" rx="160" ry="140" fill="#c8c8c0" opacity="0.10"/>
<circle cx="60" cy="820" r="280" fill="none" stroke="#171714" stroke-width="0.8" opacity="0.07"/>
<circle cx="60" cy="820" r="190" fill="none" stroke="#171714" stroke-width="0.5" opacity="0.05"/>
<circle cx="60" cy="820" r="110" fill="none" stroke="#171714" stroke-width="0.4" opacity="0.04"/>
<circle cx="160" cy="130" r="52" fill="#b7ea4e" opacity="0.20"/>
<circle cx="160" cy="130" r="32" fill="#b7ea4e" opacity="0.28"/>
<circle cx="160" cy="130" r="14" fill="#b7ea4e" opacity="0.45"/>
<circle cx="160" cy="130" r="180" fill="none" stroke="#b7ea4e" stroke-width="0.6" opacity="0.15"/>
<circle cx="1100" cy="760" r="38" fill="#b7ea4e" opacity="0.18"/>
<circle cx="1100" cy="760" r="20" fill="#b7ea4e" opacity="0.30"/>
<circle cx="1100" cy="760" r="8" fill="#b7ea4e" opacity="0.55"/>
<circle cx="520" cy="420" r="5.5" fill="#b7ea4e" opacity="0.55"/>
<circle cx="560" cy="360" r="3.5" fill="#4a7a00" opacity="0.30"/>
<circle cx="470" cy="460" r="4" fill="#171714" opacity="0.10"/>
<circle cx="900" cy="300" r="4.5" fill="#b7ea4e" opacity="0.40"/>
<circle cx="340" cy="620" r="5" fill="#b7ea4e" opacity="0.35"/>
<circle cx="1180" cy="500" r="4" fill="#b7ea4e" opacity="0.28"/>
<g transform="translate(680,180) rotate(22)"><rect x="-18" y="-18" width="36" height="36" fill="none" stroke="#b7ea4e" stroke-width="1" opacity="0.45" rx="4"/></g>
<g transform="translate(920,620) rotate(30)"><rect x="-14" y="-14" width="28" height="28" fill="none" stroke="#b7ea4e" stroke-width="0.9" opacity="0.38" rx="3"/></g>
<g transform="translate(200,480) rotate(15)"><rect x="-12" y="-12" width="24" height="24" fill="none" stroke="#171714" stroke-width="0.7" opacity="0.08" rx="3"/></g>
<g transform="translate(400,760) rotate(20)"><rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#4a7a00" stroke-width="0.7" opacity="0.18" rx="2"/></g>
<line x1="0" y1="280" x2="340" y2="0" stroke="#b7ea4e" stroke-width="0.9" opacity="0.22"/>
<line x1="0" y1="400" x2="460" y2="0" stroke="#b7ea4e" stroke-width="0.5" opacity="0.13"/>
<line x1="860" y1="900" x2="1440" y2="360" stroke="#171714" stroke-width="0.8" opacity="0.06"/>
<path d="M 240 900 Q 720 620 1200 900" fill="none" stroke="#b7ea4e" stroke-width="1" opacity="0.20"/>
<path d="M 320 900 Q 720 680 1120 900" fill="none" stroke="#b7ea4e" stroke-width="0.6" opacity="0.12"/>
<path d="M 1440 400 Q 1280 560 1440 720" fill="none" stroke="#b7ea4e" stroke-width="0.8" opacity="0.18"/>
<g stroke="#4a7a00" stroke-width="1" stroke-linecap="round" opacity="0.22"><line x1="800" y1="480" x2="812" y2="492"/><line x1="812" y1="480" x2="800" y2="492"/></g>
<g stroke="#b7ea4e" stroke-width="1.2" stroke-linecap="round" opacity="0.30"><line x1="1200" y1="640" x2="1212" y2="652"/><line x1="1212" y1="640" x2="1200" y2="652"/></g>
</svg>`)}`

const inputStyle = {
  width: '100%', padding: '11px 15px',
  background: 'rgba(255,255,255,.7)', border: `1px solid ${T.border}`,
  borderRadius: 10, color: T.text,
  fontFamily: "'Jost', sans-serif", fontSize: '0.9rem',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .18s',
}

function CategoryRow({ category, onUpdate, onDelete }) {
  const [editing,     setEditing]     = useState(false)
  const [name,        setName]        = useState(category.name)
  const [description, setDescription] = useState(category.description || '')
  const [loading,     setLoading]     = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Le nom est requis')
    setLoading(true)
    try {
      await onUpdate(category.id, { name: name.trim(), description: description.trim() })
      setEditing(false)
      toast.success('Catégorie mise à jour')
    } catch {
      toast.error('Erreur de mise à jour')
    } finally { setLoading(false) }
  }

  const handleCancel = () => {
    setName(category.name)
    setDescription(category.description || '')
    setEditing(false)
  }

  return (
    <div className="ac-row">
      <div className="ac-row-icon">
        <Tag size={17} color={T.green} />
      </div>
      {editing ? (
        <div className="ac-row-edit">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: 130 }}
            placeholder="Nom de la catégorie"
            autoFocus
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ ...inputStyle, flex: 2, minWidth: 170 }}
            placeholder="Description (optionnel)"
          />
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="ac-btn-icon ac-btn-confirm" onClick={handleSave} disabled={loading}>
              <Check size={16} color={T.green} />
            </button>
            <button className="ac-btn-icon ac-btn-cancel" onClick={handleCancel}>
              <X size={16} color={T.muted} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ac-row-name">{category.name}</div>
            {category.description && (
              <div className="ac-row-desc">{category.description}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="ac-btn-icon ac-btn-edit" onClick={() => setEditing(true)}>
              <Edit3 size={15} color={T.muted} />
            </button>
            <button className="ac-btn-icon ac-btn-delete" onClick={() => onDelete(category.id)}>
              <Trash2 size={15} color={T.danger} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [newName,    setNewName]    = useState('')
  const [newDesc,    setNewDesc]    = useState('')
  const [adding,     setAdding]     = useState(false)
  const [showForm,   setShowForm]   = useState(false)

  const load = async () => {
    setLoading(true)
    try { setCategories(await restaurantService.getCategories()) }
    catch { toast.error('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return toast.error('Le nom est requis')
    setAdding(true)
    try {
      const created = await restaurantService.createCategory({ name: newName.trim(), description: newDesc.trim() })
      setCategories(prev => [...prev, created])
      setNewName(''); setNewDesc(''); setShowForm(false)
      toast.success('Catégorie créée')
    } catch { toast.error('Erreur de création') }
    finally { setAdding(false) }
  }

  const handleUpdate = async (id, data) => {
    const updated = await restaurantService.updateCategory(id, data)
    setCategories(prev => prev.map(c => c.id === id ? updated : c))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return
    try {
      await restaurantService.deleteCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      toast.success('Catégorie supprimée')
    } catch { toast.error('Erreur de suppression') }
  }

  const filtered = categories.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url("${BG_SVG}")`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <RefreshCw size={26} color={T.green} style={{ animation: 'ac-spin 1s linear infinite' }} />
      <style>{`@keyframes ac-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes ac-in  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ac-spin{ to{transform:rotate(360deg)} }

        .ac-root {
          min-height: 100vh;
          background-color: ${T.bg};
          background-image: url("${BG_SVG}");
          background-size: cover;
          background-position: center top;
          background-attachment: fixed;
          font-family: 'Jost', sans-serif;
          color: ${T.text};
          padding: 48px 24px 80px;
          animation: ac-in .3s ease both;
        }
        .ac-inner { max-width: 820px; margin: 0 auto; position: relative; }

        .ac-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 14px;
          margin-bottom: 36px; flex-wrap: wrap;
        }
        .ac-eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .ac-eyebrow-text {
          font-size: .73rem; font-weight: 700; letter-spacing: .11em;
          text-transform: uppercase; color: ${T.green};
        }
        .ac-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: 2.8rem; color: ${T.text};
          margin: 0; line-height: 1.05;
        }
        .ac-subtitle { font-size: .88rem; color: ${T.muted}; margin: 6px 0 0; }

        .ac-btn-primary {
          display: flex; align-items: center; gap: 8px;
          padding: 13px 24px;
          background: ${T.text}; color: #fff;
          border: 1px solid ${T.text};
          border-radius: 50px; cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-weight: 700; font-size: .9rem;
          transition: all .18s; white-space: nowrap;
        }
        .ac-btn-primary:hover { background: #2a2a26; transform: translateY(-1px); }
        .ac-btn-primary.cancel {
          background: rgba(255,255,255,.85); color: ${T.muted};
          border-color: ${T.border};
          backdrop-filter: blur(8px);
        }
        .ac-btn-primary.cancel:hover { color: ${T.text}; transform: none; }

        .ac-form {
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(183,234,78,.35);
          border-radius: 20px; padding: 28px;
          margin-bottom: 22px;
          display: flex; gap: 14px; flex-wrap: wrap; align-items: flex-end;
          animation: ac-in .22s ease both;
        }
        .ac-form-label {
          display: block; margin-bottom: 7px;
          font-size: .73rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: ${T.muted};
        }
        .ac-form-submit {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 26px;
          background: ${T.accent}; color: ${T.text};
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif;
          font-weight: 700; font-size: .9rem;
          cursor: pointer; transition: all .18s;
          white-space: nowrap;
        }
        .ac-form-submit:hover:not(:disabled) { filter: brightness(1.07); transform: translateY(-1px); }
        .ac-form-submit:disabled { opacity: .55; cursor: not-allowed; }

        .ac-search-wrap { position: relative; margin-bottom: 20px; }
        .ac-search-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          pointer-events: none;
        }
        .ac-search-input {
          width: 100%; padding: 13px 18px 13px 44px;
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border};
          border-radius: 50px; color: ${T.text};
          font-family: 'Jost', sans-serif; font-size: .92rem;
          outline: none; box-sizing: border-box;
          transition: border-color .18s;
        }
        .ac-search-input:focus { border-color: rgba(183,234,78,.55); box-shadow: 0 0 0 3px rgba(183,234,78,.1); }
        .ac-search-input::placeholder { color: ${T.muted}; }

        .ac-row {
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border};
          border-radius: 18px; padding: 18px 20px;
          display: flex; align-items: center; gap: 16px;
          flex-wrap: wrap; transition: box-shadow .18s, border-color .18s;
        }
        .ac-row:hover { box-shadow: 0 4px 20px rgba(23,23,20,.08); border-color: rgba(23,23,20,.14); }
        .ac-row-icon {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          background: rgba(183,234,78,.14); border: 1px solid rgba(183,234,78,.28);
          display: flex; align-items: center; justify-content: center;
        }
        .ac-row-name  { font-weight: 700; font-size: 1rem; color: ${T.text}; }
        .ac-row-desc  { font-size: .82rem; color: ${T.muted}; margin-top: 3px; }
        .ac-row-edit  { flex: 1; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

        .ac-btn-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .16s; border: none;
        }
        .ac-btn-edit   { background: ${T.bg}; border: 1px solid ${T.border} !important; }
        .ac-btn-edit:hover { border-color: rgba(23,23,20,.22) !important; }
        .ac-btn-delete { background: ${T.dangerBg}; border: 1px solid rgba(239,68,68,.22) !important; }
        .ac-btn-delete:hover { background: rgba(239,68,68,.14); }
        .ac-btn-confirm{ background: rgba(183,234,78,.14); border: 1px solid rgba(183,234,78,.32) !important; }
        .ac-btn-confirm:hover { background: rgba(183,234,78,.24); }
        .ac-btn-cancel { background: ${T.bg}; border: 1px solid ${T.border} !important; }

        .ac-empty {
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid ${T.border};
          border-radius: 20px; padding: 70px 24px; text-align: center;
        }
        .ac-empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: ${T.bg}; border: 1px solid ${T.border};
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .ac-empty-title { font-weight: 700; color: ${T.text}; font-size: 1.05rem; margin-bottom: 6px; }
        .ac-empty-sub   { font-size: .86rem; color: ${T.muted}; margin-bottom: 26px; }
        .ac-empty-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 26px; background: ${T.text}; color: #fff;
          border: none; border-radius: 50px;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .9rem;
          cursor: pointer; transition: all .18s;
        }
        .ac-empty-btn:hover { background: #2a2a26; transform: translateY(-1px); }

        input:focus { border-color: rgba(183,234,78,.55) !important; box-shadow: 0 0 0 3px rgba(183,234,78,.1); }

        @media (max-width: 600px) {
          .ac-root  { padding: 28px 14px 60px; }
          .ac-title { font-size: 2rem; }
        }
      `}</style>

      <div className="ac-root">
        <div className="ac-inner">

          <div className="ac-header">
            <div>
              <div className="ac-eyebrow">
                <Tag size={14} color={T.green} />
                <span className="ac-eyebrow-text">Administration</span>
              </div>
              <h1 className="ac-title">Catégories</h1>
              <p className="ac-subtitle">{categories.length} catégorie{categories.length !== 1 ? 's' : ''} au total</p>
            </div>
            <button
              className={`ac-btn-primary ${showForm ? 'cancel' : ''}`}
              onClick={() => setShowForm(f => !f)}
            >
              {showForm ? <X size={15} /> : <Plus size={15} />}
              {showForm ? 'Annuler' : 'Nouvelle catégorie'}
            </button>
          </div>

          {showForm && (
            <form className="ac-form" onSubmit={handleAdd}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label className="ac-form-label">Nom *</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex : Pizza, Sushi…"
                  style={inputStyle}
                  autoFocus required
                />
              </div>
              <div style={{ flex: 2, minWidth: 200 }}>
                <label className="ac-form-label">Description</label>
                <input
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Description courte (optionnel)"
                  style={inputStyle}
                />
              </div>
              <button type="submit" className="ac-form-submit" disabled={adding}>
                <Plus size={16} />
                {adding ? 'Création…' : 'Créer'}
              </button>
            </form>
          )}

          <div className="ac-search-wrap">
            <Search size={15} color={T.muted} className="ac-search-icon" />
            <input
              className="ac-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une catégorie…"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="ac-empty">
              <div className="ac-empty-icon">
                <Tag size={30} color={T.muted} strokeWidth={1.4} />
              </div>
              <div className="ac-empty-title">
                {search ? 'Aucun résultat' : 'Aucune catégorie créée'}
              </div>
              <div className="ac-empty-sub">
                {search
                  ? `Aucune catégorie ne correspond à "${search}"`
                  : 'Commencez par ajouter votre première catégorie.'}
              </div>
              {!search && (
                <button className="ac-empty-btn" onClick={() => setShowForm(true)}>
                  <Plus size={16} /> Créer la première catégorie
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {filtered.map(cat => (
                <CategoryRow key={cat.id} category={cat} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  )
}