import { Link } from 'react-router-dom'
import { Navigation } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { formatPrice } from '../../utils/formatPrice'
import { formatDateTime } from '../../utils/formatDate'

export default function OrderCard({ order, actions }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes oc-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .oc-root {
          background: #fff;
          border: 1px solid rgba(23,23,20,.09);
          border-radius: 18px;
          overflow: hidden;
          font-family: 'Jost', sans-serif;
          color: #171714;
          animation: oc-in .3s ease both;
          display: flex; flex-direction: column;
        }

        .oc-top {
          padding: 16px 18px 12px;
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 10px;
          flex-wrap: wrap;
          background: #fafaf7;
          border-bottom: 1px solid rgba(23,23,20,.07);
        }
        .oc-order-id {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: 1.1rem; color: #171714; margin: 0 0 3px;
        }
        .oc-date {
          font-size: .74rem; color: rgba(23,23,20,.4); font-weight: 400;
        }

        .oc-body { padding: 13px 18px; display: flex; flex-direction: column; gap: 10px; }

        .oc-restaurant {
          font-size: .84rem; font-weight: 600; color: rgba(23,23,20,.65);
          display: flex; align-items: center; gap: 6px;
        }
        .oc-restaurant-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #b7ea4e; flex-shrink: 0;
        }

        .oc-items-pill {
          font-size: .78rem; color: rgba(23,23,20,.5);
          background: #f4f5f0;
          border: 1px solid rgba(23,23,20,.07);
          border-radius: 10px; padding: 7px 12px;
          line-height: 1.55;
        }

        .oc-footer {
          padding: 12px 18px 15px;
          border-top: 1px solid rgba(23,23,20,.07);
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px; flex-wrap: wrap;
        }
        .oc-price {
          font-family: 'Jost', sans-serif;
          font-weight: 700; font-size: 1.1rem; color: #4a7a00;
        }
        .oc-actions { display: flex; gap: 7px; flex-wrap: wrap; align-items: center; }

        .oc-track-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 50px;
          background: #171714; color: #fff;
          font-family: 'Jost', sans-serif; font-size: .78rem; font-weight: 700;
          border: none; cursor: pointer; text-decoration: none;
          transition: background .17s, transform .17s;
        }
        .oc-track-btn:hover { background: #2a2a26; transform: translateY(-1px); }
      `}</style>

      <div className="oc-root">
        <div className="oc-top">
          <div>
            <p className="oc-order-id">Commande #{order.id}</p>
            <span className="oc-date">{formatDateTime(order.createdAt)}</span>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="oc-body">
          {order.restaurantName && (
            <div className="oc-restaurant">
              <span className="oc-restaurant-dot" />
              {order.restaurantName}
            </div>
          )}
          {order.items?.length > 0 && (
            <div className="oc-items-pill">
              {order.items.map(i => `${i.productName} ×${i.quantity}`).join(' · ')}
            </div>
          )}
        </div>

        <div className="oc-footer">
          <span className="oc-price">{formatPrice(order.totalPrice)}</span>
          <div className="oc-actions">
            {order.status === 'PICKED_UP' && (
              <Link to={`/track/${order.id}`} className="oc-track-btn">
                <Navigation size={13} />
                Suivre
              </Link>
            )}
            {actions}
          </div>
        </div>
      </div>
    </>
  )
}