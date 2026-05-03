import { useRef, useState } from 'react'
import { Image, Upload, X, Loader2 } from 'lucide-react'
import { uploadImage } from '../../services/uploadService'
import toast from 'react-hot-toast'

export default function ImageUploader({ value, onChange, label = 'Image' }) {
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
      setPreview(url)
      onChange(url)
      toast.success('Image uploadee')
    } catch { toast.error('Erreur upload') }
    finally { setUploading(false) }
  }

  const remove = () => {
    setPreview(null)
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="form-group">
      <label className="form-label" style={{ display:'flex', alignItems:'center', gap:5 }}>
        <Image size={13} style={{ color:'var(--accent)' }} />{label}
      </label>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
      {preview ? (
        <div style={{ position:'relative', height:160, borderRadius:'var(--radius)', overflow:'hidden', border:'1px solid var(--border)' }}>
          <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          <button type="button" onClick={remove} style={{ position:'absolute', top:8, right:8, width:30, height:30, background:'var(--danger)', color:'#fff', border:'none', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          style={{ width:'100%', height:130, border:'2px dashed var(--border2)', borderRadius:'var(--radius)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, background:'var(--bg3)', cursor:'pointer', transition:'border-color var(--transition)' }}>
          {uploading
            ? <><Loader2 size={26} style={{ color:'var(--accent)', animation:'spin 0.7s linear infinite' }} /><span style={{ fontSize:'0.8rem', color:'var(--text2)' }}>Upload...</span></>
            : <><Upload size={26} style={{ color:'var(--text3)' }} /><div style={{ textAlign:'center' }}><p style={{ fontSize:'0.85rem', color:'var(--text2)', fontWeight:500 }}>Cliquer pour choisir</p><p style={{ fontSize:'0.72rem', color:'var(--text3)', marginTop:2 }}>PNG, JPG, WEBP — max 5MB</p></div></>
          }
        </button>
      )}
    </div>
  )
}