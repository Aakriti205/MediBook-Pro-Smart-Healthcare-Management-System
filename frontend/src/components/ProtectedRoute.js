import React from"react";import{Navigate}from"react-router-dom";import{useAuth}from"../context/AuthContext";
const Loading=()=><div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"var(--bg)"}}><div className="spinner"/></div>;
export const ProtectedRoute=({children})=>{
  const{user,loading}=useAuth();
  if(loading)return<Loading/>;
  if(!user)return<Navigate to="/login"/>;
  // Redirect doctor to their portal, not patient dashboard
  if(user.role==="doctor"&&window.location.pathname==="/dashboard")return<Navigate to="/doctor"/>;
  return children;
};
export const AdminRoute=({children})=>{const{user,loading}=useAuth();if(loading)return<Loading/>;if(!user)return<Navigate to="/login"/>;if(user.role!=="admin")return<Navigate to="/dashboard"/>;return children;};
