import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, BellOff } from 'lucide-react'
import { notificationService } from '../../services/notificationService'
import { useWebSocket } from '../../hooks/useWebSocket'
import { timeAgo } from '../../utils/formatDate'
import { useAuth } from '../../hooks/useAuth'

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [notifs, setNotifs] = useState([])
  const [open, setOpen]     = useState(false)
  const ref = useRef()
  const unread = notifs.filter(n => !n.read).length

  const load = async () => {
    try { setNotifs(await notificationService.getMy()) }
    catch (e) { console.error('Error loading notifications:', e) }
  }

  useEffect(() => { if (isAuthenticated) load() }, [isAuthenticated])

  useWebSocket('notif-bell', (msg) => {
    if (msg.type === 'NOTIFICATION') load()
  })

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const markAll = async () => {
    try {
      await notificationService.markAllRead()
      setNotifs(n => n.map(x => ({ ...x, read: true })))
    } catch (e) { console.error('Error marking all as read:', e) }
  }

  if (!isAuthenticated) return null

  return (
    <>
      <style>{`
        @keyframes te-bellRing {
          0%,100% { transform: rotate(0deg); }
          15%     { transform: rotate(12deg); }
          30%     { transform: rotate(-10deg); }
          45%     { transform: rotate(8deg); }
          60%     { transform: rotate(-6deg); }
          75%     { transform: rotate(3deg); }
        }
        @keyframes te-dropIn {
          from { opacity:0; transform:translateY(-8px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes te-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.5; transform:scale(.75); }
        }

        .te-bell-btn {
          position: relative;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid rgba(23,23,20,.12);
          background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .18s; flex-shrink: 0;
          color: rgba(23,23,20,.5);
        }
        .te-bell-btn:hover {
          background: rgba(23,23,20,.05);
          border-color: rgba(23,23,20,.25);
          color: #171714;
        }
        .te-bell-btn.has-unread { animation: te-bellRing 1.2s ease 0.5s; }

        .te-notif-item {
          padding: 13px 18px;
          border-bottom: 1px solid rgba(23,23,20,.06);
          transition: background .15s;
          cursor: default;
        }
        .te-notif-item:last-child { border-bottom: none; }
        .te-notif-item:hover { background: rgba(23,23,20,.02); }
        .te-notif-item.unread { background: rgba(183,234,78,.06); }
        .te-notif-item.unread:hover { background: rgba(183,234,78,.1); }

        .te-mark-all {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 50px;
          background: transparent; border: 1px solid rgba(23,23,20,.1);
          color: rgba(23,23,20,.5); cursor: pointer;
          font-family: 'Jost', sans-serif; font-size: .75rem; font-weight: 600;
          transition: all .15s;
        }
        .te-mark-all:hover {
          background: rgba(23,23,20,.05);
          border-color: rgba(23,23,20,.25);
          color: #171714;
        }

        .te-notif-scroll::-webkit-scrollbar { width: 4px; }
        .te-notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .te-notif-scroll::-webkit-scrollbar-thumb { background: rgba(23,23,20,.1); border-radius: 4px; }
        .te-notif-scroll::-webkit-scrollbar-thumb:hover { background: rgba(23,23,20,.2); }
      `}</style>

      <div ref={ref} style={{ position: 'relative' }}>

        <button
          className={`te-bell-btn${unread > 0 ? ' has-unread' : ''}`}
          onClick={() => setOpen(v => !v)}
        >
          <Bell size={16} strokeWidth={1.8} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              minWidth: 17, height: 17, borderRadius: 50,
              background: '#b7ea4e', border: '2px solid #fafaf7',
              fontSize: '.58rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#171714', padding: '0 3px', lineHeight: 1,
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              width: 17, height: 17, borderRadius: '50%',
              background: 'rgba(183,234,78,.4)',
              animation: 'te-pulse 2s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}
        </button>

        {open && (
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 10px)',
            width: 320,
            background: '#fff',
            border: '1px solid rgba(23,23,20,.08)',
            borderRadius: 20,
            boxShadow: '0 16px 48px rgba(23,23,20,.12)',
            zIndex: 200,
            animation: 'te-dropIn .22s cubic-bezier(.22,1,.36,1) both',
            overflow: 'hidden',
          }}>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px',
              borderBottom: '1px solid rgba(23,23,20,.07)',
              background: '#fafaf7',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700, fontSize: '1.05rem', color: '#171714',
                  letterSpacing: '.02em',
                }}>
                  Notifications
                </span>
                {unread > 0 && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 50,
                    background: 'rgba(183,234,78,.2)', border: '1px solid rgba(183,234,78,.4)',
                    fontSize: '.68rem', fontWeight: 700, color: '#4a7a00',
                    letterSpacing: '.04em',
                  }}>
                    {unread} non lue{unread > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button className="te-mark-all" onClick={markAll}>
                  <CheckCheck size={12} />Tout lire
                </button>
              )}
            </div>

            <div className="te-notif-scroll" style={{ maxHeight: 360, overflowY: 'auto' }}>
              {notifs.length === 0 ? (
                <div style={{
                  padding: '40px 20px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(23,23,20,.04)', border: '1px solid rgba(23,23,20,.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BellOff size={20} color="rgba(23,23,20,.25)" strokeWidth={1.5} />
                  </div>
                  <span style={{ fontSize: '.88rem', color: 'rgba(23,23,20,.35)', fontFamily: "'Jost',sans-serif" }}>
                    Aucune notification
                  </span>
                </div>
              ) : (
                notifs.map(n => (
                  <div key={n.id} className={`te-notif-item${n.read ? '' : ' unread'}`}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                        background: n.read ? 'rgba(23,23,20,.15)' : '#b7ea4e',
                        boxShadow: n.read ? 'none' : '0 0 6px rgba(183,234,78,.5)',
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{
                          margin: 0,
                          fontSize: '.87rem', lineHeight: 1.55,
                          color: n.read ? 'rgba(23,23,20,.5)' : '#171714',
                          fontWeight: n.read ? 400 : 500,
                          fontFamily: "'Jost',sans-serif",
                        }}>
                          {n.message}
                        </p>
                        <span style={{
                          fontSize: '.72rem', color: 'rgba(23,23,20,.3)',
                          marginTop: 4, display: 'block',
                          fontFamily: "'Jost',sans-serif",
                        }}>
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifs.length > 0 && (
              <div style={{
                padding: '10px 18px',
                borderTop: '1px solid rgba(23,23,20,.07)',
                background: '#fafaf7',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '.78rem', color: 'rgba(23,23,20,.3)', fontFamily: "'Jost',sans-serif" }}>
                  {notifs.length} notification{notifs.length > 1 ? 's' : ''} au total
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}