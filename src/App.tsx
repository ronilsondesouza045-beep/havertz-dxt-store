import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './routes/RouteGuards';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Store from './pages/Store';
import Services from './pages/Services';
import MNProducts from './pages/MNProducts';
import FreeFire from './pages/FreeFire';
import Followers from './pages/Followers';
import Checkout from './pages/Checkout';
import UserOrders from './pages/account/Orders';
import OrderDetails from './pages/account/OrderDetails';
import AccountProfile from './pages/account/Profile';
import AccountSupport from './pages/account/Support';
import Terms from './pages/Terms';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminSettings from './pages/admin/Settings';
import AdminSupportChat from './pages/admin/SupportChat';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/loja" element={<Store />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/produtos-mn" element={<MNProducts />} />
          <Route path="/free-fire" element={<FreeFire />} />
          <Route path="/seguidores" element={<Followers />} />
          <Route path="/terms" element={<Terms />} />

          {/* Protected Client Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<AccountProfile />} />
            <Route path="/account/orders" element={<UserOrders />} />
            <Route path="/account/orders/:id" element={<OrderDetails />} />
            <Route path="/account/support" element={<AccountSupport />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pedidos" element={<AdminOrders />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/chat" element={<AdminSupportChat />} />
          </Route>

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
      <Analytics />
    </AuthProvider>
  );
}
