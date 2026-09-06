import React,{useState}from"react";
import{useNavigate}from"react-router-dom";
import{useAuth}from"../context/AuthContext";

export default function Navbar(){
  const{user,logout,unread,notifications,markNotificationsRead}=useAuth();
  const navigate=useNavigate();
  const[showNotif,setShowNotif]=useState(false);

  const handleLogout=()=>{logout();navigate("/login");};
  const toggleNotif=()=>{setShowNotif(s=>!s);if(!showNotif&&unread>0)markNotificationsRead();};

  const getDashboard=()=>{
    if(!user)return"/login";
    if(user.role==="admin")return"/admin";
    if(user.role==="doctor")return"/doctor";
    return"/dashboard";
  };

  const iconColor={appointment:"var(--accent)",payment:"var(--gold)",reminder:"var(--danger)",system:"var(--purple)",review:"#f472b6"};
  const iconEmoji={appointment:"🗓",payment:"💳",reminder:"⏰",system:"📢",review:"⭐"};

  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"14px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(6,13,31,0.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)"}}>
      <span onClick={()=>navigate(getDashboard())} style={{cursor:"pointer",fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:700,background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
        ✦ MediBook Pro
      </span>

      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
        {user&&(
          <>
            {/* Patient links */}
            {user.role==="patient"&&(
              <>
                <button className="btn btn-outline btn-sm" onClick={()=>navigate("/doctors")}>Find Doctors</button>
                <button style={{background:"transparent",color:"var(--txt2)",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",padding:"8px 14px"}} onClick={()=>navigate("/dashboard")}>My Appointments</button>
                <button style={{background:"transparent",color:"var(--txt2)",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",padding:"8px 14px"}} onClick={()=>navigate("/payments")}>Payments</button>
              </>
            )}
            {/* Doctor links */}
            {user.role==="doctor"&&(
              <>
                <button style={{background:"transparent",color:"var(--txt2)",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",padding:"8px 14px"}} onClick={()=>navigate("/doctor")}>Dashboard</button>
              </>
            )}
            {/* Admin links */}
            {user.role==="admin"&&(
              <button style={{background:"transparent",color:"var(--txt2)",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",padding:"8px 14px"}} onClick={()=>navigate("/admin")}>Dashboard</button>
            )}

            {/* Notification bell */}
            <div style={{position:"relative"}}>
              <button onClick={toggleNotif} style={{background:"var(--card)",border:"1px solid var(--border)",color:"var(--txt)",padding:"8px 12px",borderRadius:"10px",cursor:"pointer",fontSize:"16px",position:"relative"}}>
                🔔
                {unread>0&&<span style={{position:"absolute",top:"-4px",right:"-4px",background:"var(--danger)",color:"#fff",borderRadius:"50%",width:"18px",height:"18px",fontSize:"10px",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}
              </button>
              {showNotif&&(
                <div style={{position:"absolute",right:0,top:"44px",width:"340px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"16px",boxShadow:"var(--shadow)",zIndex:200,overflow:"hidden",maxHeight:"420px",overflowY:"auto"}}>
                  <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",fontWeight:600,fontSize:"14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    Notifications
                    {unread>0&&<span style={{background:"rgba(255,77,109,.15)",color:"var(--danger)",padding:"2px 10px",borderRadius:"50px",fontSize:"11px",fontWeight:700}}>{unread} new</span>}
                  </div>
                  {notifications.length===0?(
                    <p style={{padding:"24px",color:"var(--txt2)",textAlign:"center",fontSize:"13px"}}>No notifications</p>
                  ):notifications.map(n=>(
                    <div key={n._id} style={{padding:"12px 20px",borderBottom:"1px solid rgba(255,255,255,.04)",background:n.isRead?"transparent":n.type==="reminder"?"rgba(255,77,109,.05)":"rgba(0,212,170,.04)",display:"flex",gap:"10px",alignItems:"flex-start"}}>
                      <div style={{width:"28px",height:"28px",borderRadius:"8px",background:`${iconColor[n.type]||"var(--txt2)"}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",flexShrink:0,marginTop:"2px"}}>
                        {iconEmoji[n.type]||"🔔"}
                      </div>
                      <div>
                        <div style={{fontSize:"11px",color:iconColor[n.type]||"var(--txt2)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:"2px",fontWeight:700}}>{n.type}</div>
                        <div style={{fontSize:"13px",fontWeight:600,marginBottom:"2px"}}>{n.title}</div>
                        <div style={{fontSize:"12px",color:"var(--txt2)",lineHeight:1.5}}>{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User info + logout */}
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginLeft:"8px",paddingLeft:"12px",borderLeft:"1px solid var(--border)"}}>
              <div style={{width:"34px",height:"34px",borderRadius:"50%",background:user.role==="doctor"?"linear-gradient(135deg,var(--gold),#e8952a)":"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:700,color:"#000",cursor:"pointer"}} onClick={()=>user.role==="patient"&&navigate("/profile")}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{fontSize:"13px",fontWeight:600}}>{user.name?.split(" ")[0]}</div>
                <div style={{fontSize:"10px",color:user.role==="doctor"?"var(--gold)":user.role==="admin"?"var(--purple)":"var(--accent)",textTransform:"uppercase",letterSpacing:".5px"}}>{user.role}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>Out</button>
            </div>
          </>
        )}
        {!user&&(
          <>
            <button className="btn btn-outline btn-sm" onClick={()=>navigate("/login")}>Sign In</button>
            <button className="btn btn-primary btn-sm" onClick={()=>navigate("/register")}>Get Started</button>
          </>
        )}
      </div>
    </nav>
  );
}
