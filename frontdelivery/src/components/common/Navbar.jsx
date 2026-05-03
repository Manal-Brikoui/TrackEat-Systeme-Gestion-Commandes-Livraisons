import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, LogOut, User, MapPin } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCartStore } from '../../store/cartStore'
import NotificationBell from './NotificationBell'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.png'

const navByRole = {
  CLIENT:           [{ to:'/', label:'Restaurants' }, { to:'/orders', label:'Commandes' }],
  DRIVER:           [{ to:'/driver', label:'Mes livraisons' }],
  RESTAURANT_ADMIN: [{ to:'/restaurant-admin', label:'Dashboard' }, { to:'/restaurant-admin/orders', label:'Commandes' }, { to:'/restaurant-admin/menu', label:'Menu' }, { to:'/restaurant-admin/profile', label:'Profil' }],
  ADMIN:            [{ to:'/admin', label:'Dashboard' }, { to:'/admin/users', label:'Utilisateurs' }, { to:'/admin/restaurants', label:'Restaurants' }, { to:'/admin/drivers', label:'Drivers' }, { to:'/admin/categories', label:'Catégories' }],
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const count = useCartStore(s => s.count())
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Déconnecté') }
  const links = (user && navByRole[user.role]) || []
  const initial = user?.fullName?.[0]?.toUpperCase() || null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,700&family=Jost:wght@400;500;600;700&display=swap');

        .te-nav-link {
          padding: 7px 14px; border-radius: 50px;
          font-size: .84rem; font-weight: 500;
          background: transparent; border: none; cursor: pointer;
          font-family: 'Jost', sans-serif; transition: all .18s;
          color: rgba(23,23,20,.5); text-decoration: none;
          display: inline-flex; align-items: center;
        }
        .te-nav-link:hover { color: #171714; background: rgba(23,23,20,.05); }
        .te-nav-link.active { color: #171714; background: rgba(183,234,78,.18); }

        .te-icon-btn {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: transparent; cursor: pointer; transition: all .18s;
          border: 1px solid rgba(23,23,20,.12); flex-shrink: 0;
        }
        .te-icon-btn:hover { background: rgba(23,23,20,.05); border-color: rgba(23,23,20,.25); }

        .te-btn-ghost {
          padding: 8px 18px; border-radius: 50px; cursor: pointer;
          background: transparent; border: 1px solid rgba(23,23,20,.14);
          color: rgba(23,23,20,.55); font-family: 'Jost', sans-serif;
          font-weight: 600; font-size: .8rem; transition: all .18s;
        }
        .te-btn-ghost:hover { border-color: rgba(23,23,20,.3); color: #171714; }

        .te-btn-cta {
          padding: 9px 22px; border-radius: 50px; cursor: pointer;
          background: #171714; border: none; color: #fff;
          font-family: 'Jost', sans-serif; font-weight: 700; font-size: .8rem;
          transition: all .18s;
        }
        .te-btn-cta:hover { background: #2a2a26; box-shadow: 0 6px 20px rgba(23,23,20,.18); }

        @keyframes te-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.7); }
        }
      `}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 76, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 40px', gap: 16,
        background: 'rgba(255,255,255,.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(23,23,20,.1)',
        fontFamily: "'Jost', sans-serif",
      }}>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <img src={logo} alt="TrackEat" style={{ height: 60 }} />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: '1.7rem',
            fontStyle: 'italic',
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            color: '#171714',
            lineHeight: 1,
          }}>
            TrackEat
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, padding: '0 24px', overflowX: 'auto' }}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`te-nav-link${pathname === l.to ? ' active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              {user?.role === 'CLIENT' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em',
                  textTransform: 'uppercase', color: '#4a7a00',
                  background: 'rgba(183,234,78,.12)', border: '1px solid rgba(183,234,78,.3)',
                  borderRadius: 50, padding: '4px 11px', flexShrink: 0,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#b7ea4e',
                    animation: 'te-pulse 2s ease-in-out infinite', flexShrink: 0,
                  }} />
                  30 min
                </div>
              )}

              <NotificationBell />

              {/* Panier — CLIENT uniquement */}
              {user?.role === 'CLIENT' && (
                <Link to="/cart" style={{ position: 'relative', display: 'flex' }}>
                  <button className="te-icon-btn">
                    <ShoppingCart size={16} color="rgba(23,23,20,.6)" />
                    {count > 0 && (
                      <span style={{
                        position: 'absolute', top: 0, right: 0,
                        width: 16, height: 16, borderRadius: '50%',
                        background: '#b7ea4e', fontSize: '.6rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#171714',
                      }}>{count}</span>
                    )}
                  </button>
                </Link>
              )}

              <div style={{ width: 1, height: 22, background: 'rgba(23,23,20,.1)', margin: '0 2px' }} />

              {/* Avatar */}
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: '#b7ea4e', flexShrink: 0, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif", fontWeight: 800,
                  fontSize: '1rem', color: '#171714',
                }}>
                  {initial || <User size={15} />}
                </div>
              </Link>

              <button className="te-icon-btn" onClick={handleLogout} title="Déconnexion">
                <LogOut size={15} color="rgba(23,23,20,.4)" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button className="te-btn-ghost">Connexion</button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className="te-btn-cta">Commencer</button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  )
}