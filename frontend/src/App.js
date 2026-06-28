import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import MenuBrowse from './pages/staff/MenuBrowse';
import Cart from './pages/staff/Cart';
import StaffDashboard from './pages/staff/StaffDashboard';
import ActiveOrders from './pages/staff/ActiveOrders';
import OrderDetail from './pages/staff/OrderDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import MenuItemsList from './pages/admin/MenuItemsList';
import MenuItemForm from './pages/admin/MenuItemForm';
import AdminReports from './pages/admin/AdminReports';
import KitchenQueue from './pages/kitchen/KitchenQueue';
import KitchenCompleted from './pages/kitchen/KitchenCompleted';
import KitchenOrderDetail from './pages/kitchen/KitchenOrderDetail';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Staff */}
                        <Route path="/staff/dashboard" element={<ProtectedRoute roles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>} />
                        <Route path="/staff/menu" element={<ProtectedRoute roles={['staff', 'admin']}><MenuBrowse /></ProtectedRoute>} />
                        <Route path="/staff/cart" element={<ProtectedRoute roles={['staff', 'admin']}><Cart /></ProtectedRoute>} />
                        <Route path="/staff/orders" element={<ProtectedRoute roles={['staff', 'admin']}><ActiveOrders /></ProtectedRoute>} />
                        <Route path="/staff/orders/:id" element={<ProtectedRoute roles={['staff', 'admin']}><OrderDetail /></ProtectedRoute>} />

                        {/* Kitchen */}
                        <Route path="/kitchen/queue" element={<ProtectedRoute roles={['kitchen', 'admin']}><KitchenQueue /></ProtectedRoute>} />
                        <Route path="/kitchen/completed" element={<ProtectedRoute roles={['kitchen', 'admin']}><KitchenCompleted /></ProtectedRoute>} />
                        <Route path="/kitchen/orders/:id" element={<ProtectedRoute roles={['kitchen', 'admin']}><KitchenOrderDetail /></ProtectedRoute>} />

                        {/* Admin */}
                        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
                        <Route path="/admin/orders/:id" element={<ProtectedRoute roles={['admin']}><AdminOrderDetail /></ProtectedRoute>} />
                        <Route path="/admin/menu" element={<ProtectedRoute roles={['admin']}><MenuItemsList /></ProtectedRoute>} />
                        <Route path="/admin/menu/new" element={<ProtectedRoute roles={['admin']}><MenuItemForm /></ProtectedRoute>} />
                        <Route path="/admin/menu/:id/edit" element={<ProtectedRoute roles={['admin']}><MenuItemForm /></ProtectedRoute>} />
                        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;