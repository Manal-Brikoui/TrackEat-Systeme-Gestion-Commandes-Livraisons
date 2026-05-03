import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { restaurantService } from '../../services/restaurantService'
import { uploadImage } from '../../services/uploadService'
import { Store, MapPin, Phone, FileText, ChevronRight, ArrowLeft, Image, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

@keyframes rap-in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes rap-spin { to { transform: rotate(360deg) } }
@keyframes rap-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

.rap-root * { font-family: 'Jost', sans-serif; box-sizing: border-box; }

.rap-root {
  min-height: 100vh;
  background: #fafaf7;
  padding: 40px 16px 60px;
  animation: rap-in .35s ease both;
}

.rap-inner { max-width: 560px; margin: 0 auto; }


.rap-back {
  display: inline-flex; align-items: center; gap: 7px;
  background: none; border: none; cursor: pointer;
  color: rgba(23,23,20,.45); font-family: 'Jost', sans-serif;
  font-size: .88rem; font-weight: 500; margin-bottom: 36px;
  padding: 0; transition: color .18s;
}
.rap-back:hover { color: #171714; }


.rap-icon-wrap {
  width: 54px; height: 54px; border-radius: 16px;
  background: rgba(183,234,78,.12);
  border: 1px solid rgba(183,234,78,.3);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
}
.rap-title {
  font-family: 'Cormorant Garamond', serif !important;
  font-weight: 800; font-size: clamp(1.6rem, 4vw, 2.1rem);
  color: #171714; margin: 0 0 8px; line-height: 1.1;
}
.rap-sub { color: rgba(23,23,20,.45); margin: 0; line-height: 1.65; font-size: .9rem; }

.rap-card {
  background: #fff;
  border: 1px solid rgba(23,23,20,.08);
  border-radius: 18px;
  padding: 28px;
  display: flex; flex-direction: column; gap: 20px;
  margin-top: 32px;
}


.rap-label {
  display: block; margin-bottom: 6px;
  color: rgba(23,23,20,.45); font-size: .72rem;
  font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
}


.rap-input {
  width: 100%; padding: 10px 14px;
  background: #fafaf7; border: 1px solid rgba(23,23,20,.1);
  border-radius: 9px; color: #171714;
  font-family: 'Jost', sans-serif; font-size: .9rem;
  outline: none; transition: border-color .18s;
}
.rap-input:focus { border-color: rgba(183,234,78,.6); box-shadow: 0 0 0 3px rgba(183,234,78,.1); }
.rap-textarea { resize: vertical; line-height: 1.55; }

/* Upload zone */
.rap-upload {
  width: 100%; height: 160px; border-radius: 12px;
  border: 2px dashed rgba(23,23,20,.12);
  background: #fafaf7;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; overflow: hidden; position: relative;
  transition: border-color .2s;
}
.rap-upload:hover { border-color: rgba(183,234,78,.5); }
.rap-upload.has-preview { border-color: rgba(183,234,78,.4); }
.rap-upload-inner { display: flex; flex-direction: column; align-items: center; gap: 8px; color: rgba(23,23,20,.35); }
.rap-upload-inner p { margin: 0; font-size: .85rem; }
.rap-upload-inner small { font-size: .73rem; opacity: .7; }

.rap-upload-overlay {
  position: absolute; inset: 0;
  background: rgba(250,250,247,.75);
  display: flex; align-items: center; justify-content: center;
}
.rap-upload-del {
  position: absolute; top: 8px; right: 8px;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(23,23,20,.65); border: none;
  color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .17s;
}
.rap-upload-del:hover { background: #ef4444; }


.rap-notice {
  background: rgba(183,234,78,.08);
  border: 1px solid rgba(183,234,78,.25);
  border-radius: 10px; padding: 12px 16px;
  color: rgba(23,23,20,.5); font-size: .85rem; line-height: 1.6;
}


.rap-submit {
  width: 100%; padding: 13px;
  background: #b7ea4e; color: #0f2a00;
  border: none; border-radius: 10px;
  font-family: 'Jost', sans-serif; font-size: .95rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all .18s;
}
.rap-submit:hover:not(:disabled) { background: #a8d843; }
.rap-submit:disabled { background: rgba(23,23,20,.07); color: rgba(23,23,20,.3); cursor: not-allowed; }

.rap-spin { animation: rap-spin .9s linear infinite; }
`

export default function RestaurantApplyPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const [form, setForm] = useState({
    name: '', description: '', address: '', phone: '', imageUrl: '',
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setForm(f => ({ ...f, imageUrl: url }))
      toast.success('Image uploadée avec succès')
    } catch {
      toast.error('Erreur upload image')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (e) => {
    e.stopPropagation()
    setPreview(null)
    setForm(f => ({ ...f, imageUrl: '' }))
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.address || !form.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (uploading) { toast.error("Attendez la fin de l'upload image"); return }
    setLoading(true)
    try {
      await restaurantService.apply({
        name: form.name, description: form.description,
        address: form.address, phone: form.phone,
        imageUrl: form.imageUrl || null,
      })
      toast.success('Demande envoyée ! En attente de validation.')
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Erreur lors de la demande'
      toast.error(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="rap-root">
        <div className="rap-inner">

          <button onClick={() => navigate(-1)} className="rap-back">
            <ArrowLeft size={15} />
            Retour
          </button>

          <div className="rap-icon-wrap">
            <Store size={24} color="#4a7a00" />
          </div>
          <h1 className="rap-title">Ouvrir votre restaurant</h1>
          <p className="rap-sub">
            Soumettez votre demande. Notre équipe validera votre dossier sous 48h.
          </p>

          {/* Form card */}
          <form onSubmit={handleSubmit}>
            <div className="rap-card">

              {/* Image upload */}
              <div>
                <label className="rap-label">
                  <Image size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  Photo du restaurant
                </label>
                <div
                  className={`rap-upload${preview ? ' has-preview' : ''}`}
                  onClick={() => !uploading && fileRef.current.click()}
                  style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {uploading && (
                        <div className="rap-upload-overlay">
                          <Loader size={26} color="#4a7a00" className="rap-spin" />
                        </div>
                      )}
                      {!uploading && (
                        <button type="button" onClick={removeImage} className="rap-upload-del">
                          <X size={13} />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="rap-upload-inner">
                      <Image size={28} />
                      <p>Cliquez pour ajouter une photo</p>
                      <small>JPG, PNG, WEBP — max 5MB</small>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>

              {/* Nom */}
              <div>
                <label className="rap-label">
                  <Store size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  Nom du restaurant *
                </label>
                <input
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="Ex: La Belle Adresse"
                  className="rap-input" required
                />
              </div>

       
              <div>
                <label className="rap-label">
                  <FileText size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  Description
                </label>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  placeholder="Décrivez votre restaurant, votre cuisine..."
                  rows={3} className="rap-input rap-textarea"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="rap-label">
                  <MapPin size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  Adresse *
                </label>
                <input
                  name="address" value={form.address} onChange={handleChange}
                  placeholder="123 rue de la Paix, Oujda"
                  className="rap-input" required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="rap-label">
                  <Phone size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />
                  Téléphone *
                </label>
                <input
                  name="phone" value={form.phone} onChange={handleChange}
                  placeholder="+212 6XX XXX XXX"
                  className="rap-input" required
                />
              </div>

          
              <div className="rap-notice">
                Votre demande sera examinée par un administrateur. Vous recevrez une notification une fois la décision prise.
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading || uploading} className="rap-submit">
                {loading
                  ? <><Loader size={16} className="rap-spin" /> Envoi en cours...</>
                  : uploading
                  ? <><Loader size={16} className="rap-spin" /> Upload image...</>
                  : <>Soumettre la demande <ChevronRight size={17} /></>
                }
              </button>

            </div>
          </form>

        </div>
      </div>
    </>
  )
}