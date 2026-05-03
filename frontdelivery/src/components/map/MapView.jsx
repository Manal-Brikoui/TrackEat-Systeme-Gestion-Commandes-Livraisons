import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

function isValidCoord(v) { return v != null && !isNaN(Number(v)) && isFinite(v) }

export default function MapView({ driverLat, driverLng, destLat, destLng, height = 340 }) {
  const mapRef       = useRef(null)
  const mapInst      = useRef(null)
  const LRef         = useRef(null)
  const driverMarker = useRef(null)
  const destMarker   = useRef(null)
  const routeLayer   = useRef(null)
  const routePopup   = useRef(null)
  const routeAC      = useRef(null)
  const [routeInfo,    setRouteInfo]    = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)

  const hasDriver = isValidCoord(driverLat) && isValidCoord(driverLng)
  const hasDest   = isValidCoord(destLat)   && isValidCoord(destLng)

  useEffect(() => {
    if (!mapRef.current || !hasDest) return

    import('leaflet').then(Lmod => {
      const L = Lmod.default ?? Lmod
      LRef.current = L

      if (mapInst.current) {
        mapInst.current.remove()
        mapInst.current  = null
        driverMarker.current = null
        destMarker.current   = null
        routeLayer.current   = null
        routePopup.current   = null
      }

      const centerLat = hasDriver ? driverLat : destLat
      const centerLng = hasDriver ? driverLng : destLng

      const map = L.map(mapRef.current).setView([centerLat, centerLng], 15)
      mapInst.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      if (hasDest) {
        const destIcon = L.divIcon({
          className: '',
          html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="#4a7a00"/>
            <circle cx="14" cy="14" r="6" fill="#fff"/>
            <circle cx="14" cy="14" r="3.5" fill="#4a7a00"/>
          </svg>`,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
        })
        destMarker.current = L.marker([destLat, destLng], { icon: destIcon })
          .addTo(map)
          .bindPopup('<b>Votre adresse de livraison</b>')
      }

      if (hasDriver) {
        const driverIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:38px;height:38px;background:#2563eb;
            border-radius:50%;border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            display:flex;align-items:center;justify-content:center;
          ">
            <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'
              fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
              <polygon points='3 11 22 2 13 21 11 13 3 11'/>
            </svg>
          </div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        })
        driverMarker.current = L.marker([driverLat, driverLng], { icon: driverIcon })
          .addTo(map)
          .bindPopup('<b>Livreur</b>')
      }
    })

    return () => {
      mapInst.current?.remove()
      mapInst.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInst.current || !LRef.current || !hasDest) return
    const L = LRef.current

    if (destMarker.current) {
      destMarker.current.setLatLng([destLat, destLng])
    } else {
      const destIcon = L.divIcon({
        className: '',
        html: `<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="#4a7a00"/>
          <circle cx="14" cy="14" r="6" fill="#fff"/>
          <circle cx="14" cy="14" r="3.5" fill="#4a7a00"/>
        </svg>`,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      })
      destMarker.current = L.marker([destLat, destLng], { icon: destIcon })
        .addTo(mapInst.current)
        .bindPopup('<b>Votre adresse de livraison</b>')
    }

    if (!hasDriver) {
      mapInst.current.setView([destLat, destLng], 15)
      return
    }

    if (driverMarker.current) {
      driverMarker.current.setLatLng([driverLat, driverLng])
    } else {
      const driverIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:38px;height:38px;background:#2563eb;
          border-radius:50%;border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
        ">
          <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'
            fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
            <polygon points='3 11 22 2 13 21 11 13 3 11'/>
          </svg>
        </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      })
      driverMarker.current = L.marker([driverLat, driverLng], { icon: driverIcon })
        .addTo(mapInst.current)
        .bindPopup('<b>Livreur</b>')
    }

    routeAC.current?.abort()
    routeAC.current = new AbortController()
    setRouteLoading(true)

    try { routeLayer.current?.remove(); routePopup.current?.remove() } catch (e) { console.warn(e) }

    routeLayer.current = L.polyline(
      [[driverLat, driverLng], [destLat, destLng]],
      { color: '#2563eb', weight: 4, dashArray: '8 6' }
    ).addTo(mapInst.current)
    mapInst.current.fitBounds(routeLayer.current.getBounds(), { padding: [60, 60] })

    const fetchRoute = async () => {
      const OSRM_SERVERS = [
        (slng, slat, dlng, dlat) =>
          `https://router.project-osrm.org/route/v1/driving/${slng},${slat};${dlng},${dlat}?overview=full&geometries=geojson`,
        (slng, slat, dlng, dlat) =>
          `https://routing.openstreetmap.de/routed-car/route/v1/driving/${slng},${slat};${dlng},${dlat}?overview=full&geometries=geojson`,
      ]
      for (const buildUrl of OSRM_SERVERS) {
        try {
          const res  = await fetch(buildUrl(driverLng, driverLat, destLng, destLat), { signal: routeAC.current.signal })
          const data = await res.json()
          if (data.code === 'Ok' && data.routes?.[0]) {
            const r = data.routes[0]
            return {
              coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
              dist:   (r.distance / 1000).toFixed(1),
              mins:   Math.round(r.duration / 60),
            }
          }
        } catch (e) { console.warn('OSRM fetch failed:', e) }
      }
      return null
    }

    fetchRoute().then(route => {
      setRouteLoading(false)
      if (!route || !mapInst.current) return
      setRouteInfo({ dist: route.dist, mins: route.mins })
      try {
        routeLayer.current?.remove()
        routePopup.current?.remove()
        routeLayer.current = L.polyline(route.coords, {
          color: '#2563eb', weight: 5, opacity: 0.9,
          lineJoin: 'round', lineCap: 'round',
        }).addTo(mapInst.current)
        const mid = Math.floor(route.coords.length / 2)
        routePopup.current = L.popup({ closeButton: false, autoClose: false, closeOnClick: false })
          .setLatLng(route.coords[mid])
          .setContent(`${route.dist} km · ${route.mins} min`)
          .addTo(mapInst.current)
        mapInst.current.fitBounds(routeLayer.current.getBounds(), { padding: [60, 60] })
      } catch (e) { console.warn(e) }
    }).catch(() => setRouteLoading(false))
  }, [driverLat, driverLng, destLat, destLng])

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ height, width: '100%' }} />

      <div style={{
        position: 'absolute', top: 12, right: 12,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderRadius: 10, padding: '8px 12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', gap: 6,
        fontSize: '0.78rem', zIndex: 999,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <MapPin size={13} color="#4a7a00" />
          Votre adresse
        </div>
        {hasDriver && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 13, height: 13, borderRadius: '50%',
              background: '#2563eb', flexShrink: 0,
            }} />
            Livreur
          </div>
        )}
      </div>

      {hasDriver && hasDest && (
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
          borderRadius: 12, padding: '8px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 14,
          fontSize: '0.875rem', fontWeight: 600,
          zIndex: 999, whiteSpace: 'nowrap',
        }}>
          {routeLoading ? (
            <span style={{ color: 'var(--text2)' }}>Calcul du trajet…</span>
          ) : routeInfo ? (
            <>
              <span>{routeInfo.dist} km</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>{routeInfo.mins} min</span>
            </>
          ) : (
            <span style={{ color: 'var(--text2)' }}>Trajet approximatif</span>
          )}
        </div>
      )}
    </div>
  )
}