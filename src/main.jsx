import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './user/LoginPage.jsx'
import RegisterPage from './user/RegisterPage.jsx'
import ResetPasswordPage from './user/ResetPage.jsx'
import BuyLeadsPage from './user/BuyLeadsPage.jsx'
import OrdersPage from './user/OrdersPage.jsx'
import Sidebar from './user/Sidebar.jsx'
import ProtectedRoute from './middleware.jsx' // Import the ProtectedRoute

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes without sidebar */}
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route path='/reset' element={<ResetPasswordPage/>}/>
        
        {/* Protected routes with sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Sidebar />}>
            <Route path='/dashboard' element={<BuyLeadsPage/>}/>
            <Route path='/orders' element={<OrdersPage/>}/>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)