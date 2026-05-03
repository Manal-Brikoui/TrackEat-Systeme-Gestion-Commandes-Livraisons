import { Plus, Minus, Trash2, UtensilsCrossed } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { useCartStore } from '../../store/cartStore'

export default function ProductCard({ product, restaurantId, restaurantName, editable, onDelete }) {
  const { addItem, removeItem, items } = useCartStore()
  const qty = items.find(i => i.id === product.id)?.quantity || 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        .pc-card {
          background: #fff;
          border: 1px solid rgba(23,23,20,.08);
          border-radius: 16px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          height: 100%;
         box-sizing: border-box;
          font-family: 'Jost', sans-serif;
          color: #171714;
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .pc-card:hover {
          border-color: rgba(183,234,78,.38);
          box-shadow: 0 6px 24px rgba(23,23,20,.07);
        }

        .pc-img {
          width: 68px; height: 68px;
          border-radius: 12px; overflow: hidden; flex-shrink: 0;
          background: #f2f4ed;
          border: 1px solid rgba(23,23,20,.06);
          display: flex; align-items: center; justify-content: center;
        }
        .pc-img img { width: 100%; height: 100%; object-fit: cover; }

        .pc-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700; font-size: 1.05rem;
          color: #171714; line-height: 1.2; margin-bottom: 3px;
        }
        .pc-desc {
          font-size: .78rem; color: rgba(23,23,20,.42);
          font-weight: 300; line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .pc-price {
          margin-top: 6px;
          font-weight: 700; font-size: .95rem; color: #4a7a00;
          letter-spacing: -.01em;
        }

        .pc-btn-ghost {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid rgba(23,23,20,.14);
          background: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #171714; transition: all .15s;
        }
        .pc-btn-ghost:hover {
          background: #fafaf7; border-color: rgba(23,23,20,.28);
        }

        .pc-btn-primary {
          width: 30px; height: 30px; border-radius: 50%;
          border: none; background: #171714; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #fff; transition: all .15s;
        }
        .pc-btn-primary:hover { background: #2a2a26; transform: scale(1.08); }

        .pc-btn-danger {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid rgba(239,68,68,.2);
          background: rgba(239,68,68,.06); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #ef4444; transition: all .15s;
        }
        .pc-btn-danger:hover { background: rgba(239,68,68,.14); }

        .pc-qty {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: 1rem;
          min-width: 20px; text-align: center; color: #171714;
        }
      `}</style>

      <div className="pc-card">

        <div className="pc-img">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} />
            : <UtensilsCrossed size={22} color="rgba(23,23,20,.2)" strokeWidth={1.5} />
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pc-name">{product.name}</div>
          {product.description && (
            <div className="pc-desc">{product.description}</div>
          )}
          <div className="pc-price">{formatPrice(product.price)}</div>
        </div>

     
        {editable ? (
          <button className="pc-btn-danger" onClick={() => onDelete(product.id)}>
            <Trash2 size={14} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {qty > 0 && (
              <>
                <button className="pc-btn-ghost" onClick={() => removeItem(product.id)}>
                  <Minus size={13} />
                </button>
                <span className="pc-qty">{qty}</span>
              </>
            )}
            <button className="pc-btn-primary" onClick={() => addItem(product, restaurantId, restaurantName)}>
              <Plus size={14} />
            </button>
          </div>
        )}

      </div>
    </>
  )
}