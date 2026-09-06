import React from"react";
import{BrowserRouter,Routes,Route,Navigate}from"react-router-dom";
import{ToastContainer}from"react-toastify";
import"react-toastify/dist/ReactToastify.css";
import"./index.css";
import{AuthProvider}from"./context/AuthContext";
import{ProtectedRoute,AdminRoute}from"./components/ProtectedRoute";
import Login from"./pages/Login";
import{Register}from"./pages/Register";
import Dashboard from"./pages/Dashboard";
import Doctors from"./pages/Doctors";
import BookAppointment from"./pages/BookAppointment";
import{PayPage,PaymentsHistory}from"./pages/Payments";
import Profile from"./pages/Profile";
import AdminDashboard from"./pages/AdminDashboard";
import DoctorDashboard from"./pages/DoctorDashboard";
import{useAuth}from"./context/AuthContext";

function DoctorRoute({children}){
  const{user,loading}=useAuth();
  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--bg)"}}><div className="spinner"/></div>;
  if(!user)return<Navigate to="/login"/>;
  if(user.role!=="doctor"&&user.role!=="admin")return<Navigate to="/dashboard"/>;
  return children;
}

export default function App(){
  return(
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme="dark"
          toastStyle={{background:"#0d1e36",border:"1px solid rgba(0,212,170,.2)",color:"#f0f4ff",fontFamily:"'DM Sans',sans-serif"}}/>
        <Routes>
          <Route path="/" element={<Navigate to="/login"/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
          <Route path="/doctors" element={<ProtectedRoute><Doctors/></ProtectedRoute>}/>
          <Route path="/doctors/:id" element={<ProtectedRoute><BookAppointment/></ProtectedRoute>}/>
          <Route path="/book/:id" element={<ProtectedRoute><BookAppointment/></ProtectedRoute>}/>
          <Route path="/pay/:id" element={<ProtectedRoute><PayPage/></ProtectedRoute>}/>
          <Route path="/payments" element={<ProtectedRoute><PaymentsHistory/></ProtectedRoute>}/>
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
          <Route path="/admin" element={<AdminRoute><AdminDashboard/></AdminRoute>}/>
          <Route path="/doctor" element={<DoctorRoute><DoctorDashboard/></DoctorRoute>}/>
          <Route path="*" element={<Navigate to="/login"/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
