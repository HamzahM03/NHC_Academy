import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import CheckIn from "./pages/CheckIn"
import Payments from "./pages/Payments"
import Expenses from "./pages/Expenses"
import Profit from "./pages/Profit"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/checkin/:sessionId" element={<PrivateRoute><CheckIn /></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
        <Route path="/profit" element={<PrivateRoute><Profit /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}