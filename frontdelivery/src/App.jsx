import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuthStore } from './store/authStore'

import ResetPasswordPage    from './pages/auth/ResetPasswordPage'
import LoginPage            from './pages/auth/LoginPage'
import RegisterPage         from './pages/auth/RegisterPage'
import ForgotPasswordPage   from './pages/auth/ForgotPasswordPage'

import LandingPage          from './pages/LandingPage'
import RestaurantListPage   from './pages/client/RestaurantListPage'
import RestaurantDetailPage from './pages/client/RestaurantDetailPage'
import CartPage             from './pages/client/CartPage'
import CheckoutPage         from './pages/client/CheckoutPage'
import OrderHistoryPage     from './pages/client/OrderHistoryPage'
import TrackingPage         from './pages/client/TrackingPage'
import ClientProfilePage    from './pages/client/ClientProfilePage'

import RestaurantDashboard   from './pages/restaurant/RestaurantDashboard'
import RestaurantOrdersPage  from './pages/restaurant/RestaurantOrdersPage'
import MenuManagePage        from './pages/restaurant/MenuManagePage'
import RestaurantProfilePage from './pages/restaurant/RestaurantProfilePage'
import RestaurantApplyPage   from './pages/restaurant/RestaurantApplyPage'

import DriverDashboard from './pages/driver/DriverDashboard'
import DriverApplyPage from './pages/driver/DriverApplyPage'

import AdminDashboard       from './pages/admin/AdminDashboard'
import AdminUsersPage       from './pages/admin/AdminUsersPage'
import AdminRestaurantsPage from './pages/admin/AdminRestaurantsPage'
import AdminDriversPage     from './pages/admin/AdminDriversPage'
import AdminCategoriesPage  from './pages/admin/AdminCategoriesPage'

const ALL = ['CLIENT', 'DRIVER', 'RESTAURANT_ADMIN', 'ADMIN']

function roleHome(role) {
  switch (role) {
    case 'ADMIN':            return '/admin'
    case 'DRIVER':           return '/driver'
    case 'RESTAURANT_ADMIN': return '/restaurant-admin'
    default:                 return '/restaurants'   // CLIENT
  }
}

function GuestRoute({ children }) {
  const { token, user } = useAuthStore()
  if (token && user) return <Navigate to={roleHome(user.role)} replace />
  return children
}

function RootRoute() {
  const { token, user } = useAuthStore()
  if (token && user) return <Navigate to={roleHome(user.role)} replace />
  return <LandingPage />
}

function Layout() {
  const location = useLocation()
  const hiddenNavRoutes = ['/']

  return (
    <>
      {!hiddenNavRoutes.includes(location.pathname) && <Navbar />}
      <Routes>

        <Route path="/" element={<RootRoute />} />

        <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password"  element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

        <Route path="/restaurants"    element={<RestaurantListPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />

        <Route path="/cart"      element={<ProtectedRoute roles={ALL}><CartPage /></ProtectedRoute>} />
        <Route path="/checkout"  element={<ProtectedRoute roles={ALL}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders"    element={<ProtectedRoute roles={ALL}><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/track/:id" element={<ProtectedRoute roles={ALL}><TrackingPage /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute roles={ALL}><ClientProfilePage /></ProtectedRoute>} />

        <Route path="/apply/restaurant" element={<ProtectedRoute roles={ALL}><RestaurantApplyPage /></ProtectedRoute>} />
        <Route path="/apply/driver"     element={<ProtectedRoute roles={ALL}><DriverApplyPage /></ProtectedRoute>} />

        <Route path="/restaurant-admin"         element={<ProtectedRoute roles={['RESTAURANT_ADMIN']}><RestaurantDashboard /></ProtectedRoute>} />
        <Route path="/restaurant-admin/orders"  element={<ProtectedRoute roles={['RESTAURANT_ADMIN']}><RestaurantOrdersPage /></ProtectedRoute>} />
        <Route path="/restaurant-admin/menu"    element={<ProtectedRoute roles={['RESTAURANT_ADMIN']}><MenuManagePage /></ProtectedRoute>} />
        <Route path="/restaurant-admin/profile" element={<ProtectedRoute roles={['RESTAURANT_ADMIN']}><RestaurantProfilePage /></ProtectedRoute>} />

        <Route path="/driver" element={<ProtectedRoute roles={['DRIVER']}><DriverDashboard /></ProtectedRoute>} />

        
        <Route path="/admin"             element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"       element={<ProtectedRoute roles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/restaurants" element={<ProtectedRoute roles={['ADMIN']}><AdminRestaurantsPage /></ProtectedRoute>} />
        <Route path="/admin/drivers"     element={<ProtectedRoute roles={['ADMIN']}><AdminDriversPage /></ProtectedRoute>} />
        <Route path="/admin/categories"  element={<ProtectedRoute roles={['ADMIN']}><AdminCategoriesPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}