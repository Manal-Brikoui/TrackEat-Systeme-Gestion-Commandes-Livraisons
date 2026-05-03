import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, Store } from 'lucide-react'
import { restaurantService } from '../../services/restaurantService'
import RestaurantCard from '../../components/restaurant/RestaurantCard'
import { PageLoader } from '../../components/common/Loader'

export default function RestaurantListPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [onlyOpen,    setOnlyOpen]    = useState(false)

  useEffect(() => {
    restaurantService.getAll()
      .then(r => setRestaurants(r))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) &&
    (!onlyOpen || r.currentlyOpen)
  )

  if (loading) return <PageLoader />

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        .rl-root {
          background: #fafaf7; color: #171714;
          font-family: 'Jost', sans-serif;
          padding: 0 !important; max-width: 100% !important;
          min-height: calc(100vh - var(--nav-h));
          animation: rl-fadeIn .35s ease both;
        }
        .rl-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px 60px; }

        @keyframes rl-fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rl-shimmer { from{background-position:0 center} to{background-position:200% center} }
        @keyframes rl-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

        .rl-hero {
          text-align: center; padding: 52px 24px 44px;
          position: relative; overflow: hidden; margin-bottom: 32px;
          border-bottom: 1px solid rgba(23,23,20,.07); background: #fafaf7;
        }
        .rl-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(23,23,20,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,23,20,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .rl-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 50% 0%, rgba(183,234,78,.09) 0%, transparent 68%);
        }
        .rl-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 50px;
          background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.28);
          font-size: .7rem; font-weight: 700; color: #4a7a00;
          letter-spacing: .08em; text-transform: uppercase;
          margin-bottom: 20px; position: relative; z-index: 1;
        }
        .rl-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #b7ea4e; flex-shrink: 0;
          animation: rl-pulse 2s ease-in-out infinite;
        }
        .rl-hero-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: clamp(2.2rem, 5vw, 3.4rem); line-height: 1.05; letter-spacing: -.01em;
          color: #171714 !important; margin: 0 0 12px; position: relative; z-index: 1;
        }
        .rl-title-accent {
          background: linear-gradient(90deg, #4a7a00 0%, #b7ea4e 50%, #4a7a00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: rl-shimmer 3.2s linear infinite;
        }
        .rl-hero-sub {
          color: rgba(23,23,20,.45) !important; font-size: .95rem; font-weight: 300;
          margin: 0 0 24px; position: relative; z-index: 1; line-height: 1.7;
        }
        .rl-search-wrap { max-width: 480px; margin: 0 auto; position: relative; z-index: 1; }
        .rl-search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: rgba(23,23,20,.32); display: flex;
        }
        .rl-search {
          width: 100%; padding: 13px 18px 13px 42px; border-radius: 50px;
          border: 1px solid rgba(23,23,20,.12) !important; background: #fff !important;
          font-family: 'Jost', sans-serif; font-size: .92rem; color: #171714 !important;
          outline: none; box-shadow: 0 2px 16px rgba(23,23,20,.05); transition: all .18s;
        }
        .rl-search::placeholder { color: rgba(23,23,20,.28) !important; }
        .rl-search:focus {
          border-color: rgba(183,234,78,.6) !important;
          box-shadow: 0 0 0 4px rgba(183,234,78,.1), 0 2px 16px rgba(23,23,20,.05) !important;
        }

        .rl-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
        }
        .rl-count {
          font-size: .8rem; color: rgba(23,23,20,.35) !important;
          font-weight: 500; display: flex; align-items: center; gap: 6px;
        }
        .rl-count-num {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: 1.1rem; color: #171714 !important;
        }
        .rl-filter-open {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 50px; cursor: pointer;
          font-family: 'Jost', sans-serif; font-size: .82rem; font-weight: 600;
          border: 1px solid rgba(23,23,20,.12) !important;
          background: #fff !important; color: rgba(23,23,20,.5) !important;
          transition: all .17s;
        }
        .rl-filter-open:hover { border-color: rgba(23,23,20,.25) !important; color: #171714 !important; }
        .rl-filter-open.active {
          background: rgba(183,234,78,.12) !important; color: #4a7a00 !important;
          border-color: rgba(183,234,78,.4) !important;
        }

        .rl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 18px;
        }
        .rl-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 72px 24px; text-align: center;
        }
        .rl-empty-icon {
          width: 68px; height: 68px; border-radius: 20px;
          background: #f2f4ed; border: 1px solid rgba(23,23,20,.08);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; color: rgba(23,23,20,.22);
        }
        .rl-empty-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800; font-size: 1.6rem;
          color: #171714 !important; margin-bottom: 8px;
        }
        .rl-empty-desc { font-size: .9rem; color: rgba(23,23,20,.38) !important; font-weight: 300; }

        @media (max-width: 640px) {
          .rl-grid { grid-template-columns: 1fr; }
          .rl-hero  { padding: 40px 20px 36px; }
        }
      `}</style>

      <div className="rl-root">
        <div className="rl-hero">
          <div className="rl-hero-grid" />
          <div className="rl-hero-glow" />
          <div className="rl-eyebrow">
            <div className="rl-eyebrow-dot" />
            Livraison express · 30 min garanties
          </div>
          <h1 className="rl-hero-title">
            Commandez,<br />
            <span className="rl-title-accent">livré chez vous</span>
          </h1>
          <p className="rl-hero-sub">Découvrez les meilleurs restaurants de votre ville</p>
          <div className="rl-search-wrap">
            <div className="rl-search-icon"><Search size={15} strokeWidth={2} /></div>
            <input
              className="rl-search"
              placeholder="Rechercher un restaurant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rl-inner">
          <div className="rl-toolbar">
            <div className="rl-count">
              <span className="rl-count-num">{filtered.length}</span>
              restaurant{filtered.length !== 1 ? 's' : ''}
            </div>
            <button
              className={`rl-filter-open ${onlyOpen ? 'active' : ''}`}
              onClick={() => setOnlyOpen(!onlyOpen)}
            >
              <SlidersHorizontal size={13} strokeWidth={2} />
              Ouverts seulement
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="rl-empty">
              <div className="rl-empty-icon"><Store size={28} strokeWidth={1.4} /></div>
              <div className="rl-empty-title">Aucun résultat</div>
              <div className="rl-empty-desc">Essayez d'autres filtres ou revenez plus tard</div>
            </div>
          ) : (
            <div className="rl-grid">
              {filtered.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          )}
        </div>
      </div>
    </>
  )
}