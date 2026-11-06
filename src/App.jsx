import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import OverviewPage from './pages/OverviewPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  )
}

export default App
