import { useEffect, useRef } from 'react'

export default function LocationPickerMap({ lat, lng, onChange, height = 300 }) {
  const mapRef    = useRef(null)
  const mapInst   = useRef(null)
  const marker    = useRef(null)
  const mkIconRef = useRef(null)

  useEffect(() => {
    const el = mapRef.current
    if (!el || !lat || !lng) return

    // Nettoyage HMR / React StrictMode
    if (el._leaflet_id != null) {
      try { mapInst.current?.remove() } catch { /* ignore */ }
      mapInst.current = null
      marker.current  = null
      delete el._leaflet_id
    }

    let destroyed = false

    import('leaflet').then(L => {
      if (destroyed || !mapRef.current) return

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const mkIcon = L.divIcon({
        html: `
          <div style="width:22px;height:32px;filter:drop-shadow(0 3px 6px rgba(74,122,0,.5))">
            <svg viewBox="0 0 22 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
              <path d="M11 0C4.925 0 0 4.925 0 11c0 7.5 11 21 11 21s11-13.5 11-21C22 4.925 17.075 0 11 0z" fill="#4a7a00"/>
              <circle cx="11" cy="11" r="5" fill="white" opacity="0.9"/>
            </svg>
          </div>`,
        iconSize:   [22, 32],
        iconAnchor: [11, 32],
        className:  '',
      })
      mkIconRef.current = mkIcon

      const map = L.map(mapRef.current).setView([lat, lng], 15)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map)

      marker.current = L.marker([lat, lng], { icon: mkIcon, draggable: true }).addTo(map)
      marker.current.on('dragend', () => {
        const p = marker.current.getLatLng()
        onChange(p.lat, p.lng)
      })

      map.on('click', e => {
        marker.current.setLatLng([e.latlng.lat, e.latlng.lng])
        onChange(e.latlng.lat, e.latlng.lng)
      })

      mapInst.current = map
      setTimeout(() => { try { map.invalidateSize() } catch { /*  */ } }, 120)
    })

    return () => {
      destroyed = true
      try { mapInst.current?.remove() } catch { /*  */ }
      mapInst.current = null
      marker.current  = null
      if (mapRef.current) delete mapRef.current._leaflet_id
    }
  }, []) 

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{ height, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(23,23,20,.09)' }}
      />
      <div style={{
        position: 'absolute', bottom: 8, left: 8,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '0.5px solid rgba(23,23,20,.12)',
        padding: '5px 10px', borderRadius: 6,
        fontSize: '0.72rem', color: 'rgba(23,23,20,.5)',
        fontFamily: "'Jost', sans-serif", fontWeight: 600,
        pointerEvents: 'none', zIndex: 1000,
      }}>
        Glissez le pin ou cliquez pour ajuster
      </div>
    </div>
  )
}