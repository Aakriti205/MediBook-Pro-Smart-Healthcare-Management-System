import React,{createContext,useState,useContext,useEffect,useCallback}from"react";
import{getProfile,getNotifications,markAllRead}from"../services/api";
const AuthContext=createContext();
export const AuthProvider=({children})=>{
  const[user,setUser]=useState(null);
  const[loading,setLoading]=useState(true);
  const[notifications,setNotifications]=useState([]);
  const[unread,setUnread]=useState(0);
  const fetchNotifications=useCallback(async()=>{
    try{const{data}=await getNotifications();setNotifications(data.notifications);setUnread(data.unread);}catch{}
  },[]);
  useEffect(()=>{
    const token=localStorage.getItem("token");
    if(token){
      getProfile().then(r=>{
        setUser(r.data.user);
        fetchNotifications();
      }).catch(()=>localStorage.clear()).finally(()=>setLoading(false));
    }else setLoading(false);
  },[]);
  const login=(userData,token,refreshToken)=>{
    localStorage.setItem("token",token);
    if(refreshToken)localStorage.setItem("refreshToken",refreshToken);
    setUser(userData);fetchNotifications();
  };
  const logout=()=>{localStorage.clear();setUser(null);setNotifications([]);setUnread(0);};
  const markNotificationsRead=async()=>{await markAllRead();setUnread(0);setNotifications(n=>n.map(x=>({...x,isRead:true})));};
  return<AuthContext.Provider value={{user,setUser,loading,login,logout,notifications,unread,fetchNotifications,markNotificationsRead}}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>useContext(AuthContext);
