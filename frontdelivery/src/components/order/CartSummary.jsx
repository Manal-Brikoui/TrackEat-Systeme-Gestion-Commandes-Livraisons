import { useCartStore } from '../../store/cartStore'
import { formatPrice } from '../../utils/formatPrice'

export default function CartSummary({ deliveryFee = 0 }) {
  const { items, total } = useCartStore()
  const sub = total()
  const grandTotal = sub + deliveryFee

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes cs-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .cs-root {
          background: #fff;
          border: 1px solid rgba(23,23,20,.09);
          border-radius: 18px;
          overflow: hidden;
          font-family: 'Jost', sans-serif;
          color: #171714;
          animation: cs-in .3s ease both;
        }

        /* Header */
        .cs-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid rgba(23,23,20,.07);
          background: #fafaf7;
          display: flex; align-items: center; justify-content: space-between;
        }
        .cs-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 800; font-size: 1.25rem; color: #171714; margin: 0;
        }
        .cs-count {
          font-size: .72rem; font-weight: 700; letter-spacing: .06em;
          padding: 3px 10px; border-radius: 50px;
          background: rgba(183,234,78,.15); color: #4a7a00;
          border: 1px solid rgba(183,234,78,.3);
        }

        /* Items list */
        .cs-items { padding: 10px 20px; }
        .cs-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 0;
          border-bottom: 1px solid rgba(23,23,20,.05);
        }
        .cs-item:last-child { border-bottom: none; }
        .cs-item-left { display: flex; align-items: center; gap: 9px; }
        .cs-item-qty {
          width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
          background: rgba(183,234,78,.12); border: 1px solid rgba(183,234,78,.25);
          display: flex; align-items: center; justify-content: center;
          font-size: .7rem; font-weight: 700; color: #4a7a00;
        }
        .cs-item-name {
          font-size: .84rem; color: rgba(23,23,20,.7); font-weight: 400;
        }
        .cs-item-price {
          font-size: .84rem; font-weight: 600; color: #171714;
        }

        /* Totals */
        .cs-totals {
          padding: 14px 20px 18px;
          background: #fafaf7;
          border-top: 1px solid rgba(23,23,20,.07);
          display: flex; flex-direction: column; gap: 8px;
        }
        .cs-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: .84rem; color: rgba(23,23,20,.55);
        }
        .cs-row-label { font-weight: 400; }
        .cs-row-value { font-weight: 500; color: #171714; }
        .cs-free {
          font-size: .78rem; font-weight: 700; padding: 2px 9px;
          border-radius: 50px; background: rgba(183,234,78,.15);
          color: #4a7a00; border: 1px solid rgba(183,234,78,.3);
        }
        .cs-divider {
          height: 1px; background: rgba(23,23,20,.08); margin: 4px 0;
        }
        .cs-total-row {
          display: flex; justify-content: space-between; align-items: baseline;
          padding-top: 2px;
        }
        .cs-total-label {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700; font-size: 1.1rem; color: #171714;
        }
        .cs-total-value {
          font-family: 'Jost', sans-serif;
          font-weight: 700; font-size: 1.2rem; color: #4a7a00;
        }
      `}</style>

      <div className="cs-root">
        <div className="cs-header">
          <h3 className="cs-title">Résumé</h3>
          <span className="cs-count">{items.length} article{items.length > 1 ? 's' : ''}</span>
        </div>

        <div className="cs-items">
          {items.map(item => (
            <div key={item.id} className="cs-item">
              <div className="cs-item-left">
                <div className="cs-item-qty">×{item.quantity}</div>
                <span className="cs-item-name">{item.name}</span>
              </div>
              <span className="cs-item-price">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="cs-totals">
          <div className="cs-row">
            <span className="cs-row-label">Sous-total</span>
            <span className="cs-row-value">{formatPrice(sub)}</span>
          </div>
          <div className="cs-row">
            <span className="cs-row-label">Livraison</span>
            {deliveryFee === 0
              ? <span className="cs-free">Gratuite</span>
              : <span className="cs-row-value">{formatPrice(deliveryFee)}</span>
            }
          </div>
          <div className="cs-divider" />
          <div className="cs-total-row">
            <span className="cs-total-label">Total</span>
            <span className="cs-total-value">{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>
    </>
  )
}