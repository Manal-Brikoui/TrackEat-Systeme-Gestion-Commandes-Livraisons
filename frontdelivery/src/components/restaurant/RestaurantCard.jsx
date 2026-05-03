import { Link } from 'react-router-dom'
import { Star, Clock, Store } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'

export default function RestaurantCard({ restaurant }) {
  const { id, name, description, imageUrl, open, currentlyOpen, categoryName, averageRating, deliveryFee } = restaurant
  const isActuallyOpen = currentlyOpen ?? open ?? false

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes rc-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

        .rc-card {
          display: block;
          text-decoration: none;
          background: #fff;
          border: 1px solid rgba(23,23,20,.08);
          border-radius: 20px;
          overflow: hidden;
          transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
          animation: rc-in .4s cubic-bezier(.22,1,.36,1) both;
          color: #171714;
          font-family: 'Jost', sans-serif;
        }
        .rc-card:hover {
          transform: translateY(-5px);
          border-color: rgba(183,234,78,.45);
          box-shadow: 0 18px 48px rgba(23,23,20,.1);
        }

        .rc-thumb {
          position: relative;
          height: 168px;
          background: #f2f4ed;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
        }
        .rc-thumb-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(23,23,20,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,23,20,.04) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .rc-thumb img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .35s ease;
        }
        .rc-card:hover .rc-thumb img { transform: scale(1.04); }

        .rc-badge-open {
          position: absolute; top: 10px; right: 10px;
          padding: 3px 10px; border-radius: 50px;
          font-size: .68rem; font-weight: 700; letter-spacing: .05em;
          text-transform: uppercase; font-family: 'Jost', sans-serif;
          background: rgba(183,234,78,.92); color: #2a4a00;
          display: flex; align-items: center; gap: 5px;
        }
        .rc-badge-closed {
          position: absolute; top: 10px; right: 10px;
          padding: 3px 10px; border-radius: 50px;
          font-size: .68rem; font-weight: 700; letter-spacing: .05em;
          text-transform: uppercase; font-family: 'Jost', sans-serif;
          background: rgba(23,23,20,.55); color: rgba(255,255,255,.75);
          display: flex; align-items: center; gap: 5px;
        }
        .rc-dot-open   { width: 5px; height: 5px; border-radius: 50%; background: #2a4a00; flex-shrink: 0; }
        .rc-dot-closed { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.5); flex-shrink: 0; }

        .rc-cat {
          position: absolute; top: 10px; left: 10px;
          padding: 3px 10px; border-radius: 50px;
          font-size: .68rem; font-weight: 600; font-family: 'Jost', sans-serif;
          background: rgba(255,255,255,.88); color: rgba(23,23,20,.55);
          border: 1px solid rgba(23,23,20,.1);
          backdrop-filter: blur(4px);
        }

        .rc-body { padding: 16px 18px 0; }

        .rc-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 8px;
          margin-bottom: 4px;
        }
        .rc-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: 1.22rem;
          color: #171714; line-height: 1.15; letter-spacing: -.01em;
        }
        .rc-rating {
          display: flex; align-items: center; gap: 3px;
          color: #4a7a00; font-size: .8rem; font-weight: 700; flex-shrink: 0;
        }
        .rc-desc {
          font-size: .8rem; color: rgba(23,23,20,.42);
          font-weight: 300; line-height: 1.55; margin-top: 2px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .rc-footer {
          padding: 12px 18px 16px;
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 10px;
          border-top: 1px solid rgba(23,23,20,.06);
        }
        .rc-delivery {
          display: flex; align-items: center; gap: 5px;
          font-size: .75rem; color: rgba(23,23,20,.38); font-weight: 500;
        }
        .rc-free { color: #4a7a00; font-weight: 700; }
        .rc-cta {
          font-size: .78rem; font-weight: 700; color: #4a7a00;
          display: flex; align-items: center; gap: 3px; letter-spacing: .02em;
        }
      `}</style>

      <Link to={`/restaurant/${id}`} className="rc-card">

        <div className="rc-thumb">
          {imageUrl
            ? <img src={imageUrl} alt={name} />
            : (
              <>
                <div className="rc-thumb-grid" />
                <Store size={40} color="rgba(23,23,20,.15)" strokeWidth={1.2} />
              </>
            )
          }

          <div className={isActuallyOpen ? 'rc-badge-open' : 'rc-badge-closed'}>
            <div className={isActuallyOpen ? 'rc-dot-open' : 'rc-dot-closed'} />
            {isActuallyOpen ? 'Ouvert' : 'Fermé'}
          </div>

          {categoryName && (
            <div className="rc-cat">{categoryName}</div>
          )}
        </div>

        <div className="rc-body">
          <div className="rc-row">
            <div className="rc-name">{name}</div>
            {averageRating > 0 && (
              <div className="rc-rating">
                <Star size={12} fill="#b7ea4e" stroke="none" />
                {averageRating.toFixed(1)}
              </div>
            )}
          </div>
          {description && (
            <div className="rc-desc">{description}</div>
          )}
        </div>

        <div className="rc-footer">
          {deliveryFee !== undefined && (
            <div className="rc-delivery">
              <Clock size={11} strokeWidth={2} />
              Livraison :&nbsp;
              {deliveryFee === 0
                ? <span className="rc-free">Gratuite</span>
                : formatPrice(deliveryFee)
              }
            </div>
          )}
          <div className="rc-cta">
            Voir le menu
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

      </Link>
    </>
  )
}