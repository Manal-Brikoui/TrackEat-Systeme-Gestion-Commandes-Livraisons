import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Store } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import CartSummary from '../../components/order/CartSummary'
import { formatPrice } from '../../utils/formatPrice'

export default function CartPage() {
  const { items, addItem, removeItem, deleteItem, clearCart, restaurantName, restaurantId } = useCartStore()
  const nav = useNavigate()

  if (items.length === 0) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');
        @keyframes cp-fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cp-pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        .cp-empty-root {
          min-height: calc(100vh - var(--nav-h));
          background: #fafaf7; display: flex; align-items: center; justify-content: center;
          font-family: 'Jost', sans-serif;
          animation: cp-fadeIn .35s ease both;
        }
        .cp-empty-box {
          display: flex; flex-direction: column; align-items: center;
          padding: 64px 32px; text-align: center;
        }
        .cp-empty-icon {
          width: 80px; height: 80px; border-radius: 24px;
          background: #f2f4ed; border: 1px solid rgba(23,23,20,.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(23,23,20,.22); margin-bottom: 24px;
        }
        .cp-empty-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800; font-size: 2rem;
          color: #171714; margin-bottom: 8px; line-height: 1.1;
        }
        .cp-empty-desc { font-size: .9rem; color: rgba(23,23,20,.38); font-weight: 300; margin-bottom: 28px; }
        .cp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 26px; border-radius: 50px; border: none; cursor: pointer;
          background: #171714; color: #fff;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .9rem;
          transition: all .18s;
        }
        .cp-btn-primary:hover { background: #2a2a26; transform: translateY(-1px); }
      `}</style>
      <div className="cp-empty-root">
        <div className="cp-empty-box">
          <div className="cp-empty-icon"><ShoppingCart size={36} strokeWidth={1.4} /></div>
          <div className="cp-empty-title">Votre panier est vide</div>
          <div className="cp-empty-desc">Ajoutez des plats depuis nos restaurants</div>
          <Link to="/">
            <button className="cp-btn-primary">
              <Store size={15} />Parcourir les restaurants
            </button>
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700;800&family=Jost:wght@300;400;500;600;700&display=swap');

        @keyframes cp-fadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cp-shimmer { from{background-position:0 center} to{background-position:200% center} }
        @keyframes cp-pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes cp-item-in { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

        .cp-root {
          background: #fafaf7; color: #171714;
          font-family: 'Jost', sans-serif;
          min-height: calc(100vh - var(--nav-h));
          padding: 0 !important; max-width: 100% !important;
          animation: cp-fadeIn .35s ease both;
        }

        .cp-hero {
          padding: 44px 24px 36px;
          border-bottom: 1px solid rgba(23,23,20,.07);
          position: relative; overflow: hidden; background: #fafaf7;
          margin-bottom: 32px;
        }
        .cp-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(23,23,20,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,23,20,.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .cp-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 30% 0%, rgba(183,234,78,.09) 0%, transparent 68%);
        }
        .cp-hero-inner {
          max-width: 1080px; margin: 0 auto;
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; position: relative; z-index: 1;
        }
        .cp-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 13px; border-radius: 50px;
          background: rgba(183,234,78,.1); border: 1px solid rgba(183,234,78,.28);
          font-size: .7rem; font-weight: 700; color: #4a7a00;
          letter-spacing: .08em; text-transform: uppercase; margin-bottom: 14px;
        }
        .cp-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: #b7ea4e;
          animation: cp-pulse 2s ease-in-out infinite;
        }
        .cp-title {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.05;
          color: #171714; margin: 0 0 6px;
        }
        .cp-title-accent {
          background: linear-gradient(90deg, #4a7a00 0%, #b7ea4e 50%, #4a7a00 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: cp-shimmer 3.2s linear infinite;
        }
        .cp-subtitle {
          display: flex; align-items: center; gap: 6px;
          font-size: .85rem; color: rgba(23,23,20,.45); font-weight: 400; margin: 0;
        }

        .cp-clear-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(220,38,38,.25); background: rgba(220,38,38,.06);
          color: #dc2626; font-family: 'Jost', sans-serif; font-weight: 600; font-size: .82rem;
          transition: all .17s; flex-shrink: 0;
        }
        .cp-clear-btn:hover { background: rgba(220,38,38,.12); border-color: rgba(220,38,38,.4); }

        .cp-body {
          max-width: 1080px; margin: 0 auto; padding: 0 24px 60px;
          display: grid; grid-template-columns: 1fr 340px; gap: 22px; align-items: start;
        }

        .cp-item {
          background: #fff; border: 1px solid rgba(23,23,20,.08);
          border-radius: 18px; padding: 14px 16px;
          display: flex; align-items: center; gap: 14px;
          transition: box-shadow .2s, border-color .2s;
          animation: cp-item-in .25s ease both;
        }
        .cp-item:hover { box-shadow: 0 4px 20px rgba(23,23,20,.08); border-color: rgba(23,23,20,.13); }

        .cp-item-img {
          width: 62px; height: 62px; border-radius: 12px;
          object-fit: cover; flex-shrink: 0;
        }
        .cp-item-img-placeholder {
          width: 62px; height: 62px; border-radius: 12px;
          background: #f2f4ed; border: 1px solid rgba(23,23,20,.07); flex-shrink: 0;
        }
        .cp-item-name {
          font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 1.08rem;
          color: #171714; line-height: 1.2; margin-bottom: 4px;
        }
        .cp-item-price {
          font-size: .85rem; font-weight: 600; color: #4a7a00;
          display: inline-flex; align-items: center; gap: 5px;
        }

        .cp-qty {
          display: flex; align-items: center; gap: 6px;
          background: #f2f4ed; border-radius: 50px; padding: 4px 6px;
          flex-shrink: 0;
        }
        .cp-qty-btn {
          width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: #fff; color: #171714;
          box-shadow: 0 1px 4px rgba(23,23,20,.1);
          transition: all .15s;
        }
        .cp-qty-btn:hover { background: #171714; color: #fff; }
        .cp-qty-num {
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.1rem; min-width: 24px; text-align: center; color: #171714;
        }

        .cp-item-total {
          min-width: 76px; text-align: right;
          font-family: 'Cormorant Garamond', serif; font-weight: 800;
          font-size: 1.1rem; color: #171714; flex-shrink: 0;
        }
        .cp-delete-btn {
          width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(220,38,38,.07); color: #dc2626; flex-shrink: 0;
          transition: all .15s;
        }
        .cp-delete-btn:hover { background: rgba(220,38,38,.15); }

        .cp-sidebar {
          position: sticky; top: calc(var(--nav-h) + 16px);
          display: flex; flex-direction: column; gap: 12px;
        }
        .cp-order-btn {
          width: 100%; padding: 15px; border-radius: 14px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          background: #171714; color: #fff;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .95rem;
          transition: all .18s; box-shadow: 0 4px 18px rgba(23,23,20,.15);
        }
        .cp-order-btn:hover { background: #2a2a26; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(23,23,20,.2); }

        @media (max-width: 760px) {
          .cp-body { grid-template-columns: 1fr; }
          .cp-sidebar { position: static; }
          .cp-hero { padding: 32px 20px 28px; }
        }
      `}</style>

      <div className="cp-root">

        <div className="cp-hero">
          <div className="cp-hero-grid" />
          <div className="cp-hero-glow" />
          <div className="cp-hero-inner">
            <div>
              <div className="cp-eyebrow">
                <div className="cp-eyebrow-dot" />
                Récapitulatif de commande
              </div>
              <h1 className="cp-title">
                Mon <span className="cp-title-accent">panier</span>
              </h1>
              <p className="cp-subtitle">
                <Store size={13} strokeWidth={2} />
                {restaurantName} &nbsp;·&nbsp; {items.length} article{items.length > 1 ? 's' : ''}
              </p>
            </div>
            <button className="cp-clear-btn" onClick={clearCart}>
              <Trash2 size={14} /> Vider le panier
            </button>
          </div>
        </div>

        <div className="cp-body">

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, i) => (
              <div key={item.id} className="cp-item" style={{ animationDelay: `${i * 0.05}s` }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} className="cp-item-img" />
                  : <div className="cp-item-img-placeholder" />
                }

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cp-item-name">{item.name}</div>
                  <div className="cp-item-price">{formatPrice(item.price)}</div>
                </div>

                <div className="cp-qty">
                  <button className="cp-qty-btn" onClick={() => removeItem(item.id)}>
                    <Minus size={12} />
                  </button>
                  <span className="cp-qty-num">{item.quantity}</span>
                  <button className="cp-qty-btn" onClick={() => addItem(
                    { id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl },
                    restaurantId,
                    restaurantName
                  )}>
                    <Plus size={12} />
                  </button>
                </div>

                <div className="cp-item-total">{formatPrice(item.price * item.quantity)}</div>

                <button className="cp-delete-btn" onClick={() => deleteItem(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="cp-sidebar">
            <CartSummary />
            <button className="cp-order-btn" onClick={() => nav('/checkout')}>
              Commander <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </>
  )
}