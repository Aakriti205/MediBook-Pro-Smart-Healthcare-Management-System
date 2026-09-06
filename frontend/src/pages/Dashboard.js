import React,{useEffect,useState}from"react";import{useNavigate}from"react-router-dom";import{getMyAppointments,cancelAppointment,rateAppointment}from"../services/api";import{useAuth}from"../context/AuthContext";import{toast}from"react-toastify";import Navbar from"../components/Navbar";
const sIcon={Cardiologist:"❤️",Neurologist:"🧠",Dermatologist:"✨","Orthopedic Surgeon":"🦴",Gynecologist:"🌸",Pediatrician:"👶"};
const sc={confirmed:"var(--accent)",pending:"var(--gold)",cancelled:"var(--danger)",completed:"var(--info)","no-show":"var(--purple)"};

export default function Dashboard(){
  const{user}=useAuth();const navigate=useNavigate();
  const[apts,setApts]=useState([]);const[loading,setLoading]=useState(true);
  const[filter,setFilter]=useState("all");const[showRate,setShowRate]=useState(null);
  const[rating,setRating]=useState(5);const[review,setReview]=useState("");

  const fetch=async()=>{setLoading(true);try{const{data}=await getMyAppointments();setApts(data.appointments);}catch{toast.error("Failed to load");}finally{setLoading(false);};};
  useEffect(()=>{fetch();},[]);

  const handleCancel=async(id)=>{
    const reason=prompt("Reason for cancellation:");
    if(!reason)return;
    try{await cancelAppointment(id,{reason});toast.success("Cancelled");fetch();}catch(e){toast.error(e.response?.data?.message||"Failed");}
  };

  const handleRate=async()=>{
    try{await rateAppointment(showRate,{rating,review});toast.success("Rating submitted!");setShowRate(null);fetch();}catch(e){toast.error(e.response?.data?.message||"Failed");}
  };

  const filtered=filter==="all"?apts:apts.filter(a=>a.status===filter);
  const stats=[
    {label:"Total",value:apts.length,color:"var(--accent)",icon:"📋"},
    {label:"Confirmed",value:apts.filter(a=>a.status==="confirmed").length,color:"var(--info)",icon:"✅"},
    {label:"Pending",value:apts.filter(a=>a.status==="pending").length,color:"var(--gold)",icon:"⏳"},
    {label:"Completed",value:apts.filter(a=>a.status==="completed").length,color:"var(--purple)",icon:"🏁"},
  ];

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh-bg"/><Navbar/>
      <div className="page">
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"32px",flexWrap:"wrap",gap:"12px"}} className="fade-up">
          <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
            <div style={{width:"54px",height:"54px",borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",fontWeight:700,color:"#000"}}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1 style={{fontSize:"26px"}}>Good day, <span style={{background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{user?.name?.split(" ")[0]}</span></h1>
              <p style={{color:"var(--txt2)",fontSize:"13px"}}>Manage your appointments &amp; health records</p>
            </div>
          </div>
          <div style={{display:"flex",gap:"10px"}}>
            <button className="btn btn-outline btn-sm" onClick={()=>navigate("/profile")}>My Profile</button>
            <button className="btn btn-gold" onClick={()=>navigate("/doctors")}>+ Book Appointment</button>
          </div>
        </div>

        {/* Stats */}
        <div className="card-grid card-grid-4" style={{marginBottom:"28px"}}>
          {stats.map((s,i)=>(
            <div key={s.label} className="stat-card fade-up" style={{animationDelay:`${i*.07}s`,borderLeft:`3px solid ${s.color}`}}>
              <div style={{fontSize:"24px",marginBottom:"8px"}}>{s.icon}</div>
              <div className="stat-num" style={{color:s.color}}>{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
          <div style={{display:"flex",gap:"6px",background:"rgba(255,255,255,.04)",padding:"4px",borderRadius:"50px",border:"1px solid var(--border)"}}>
            {["all","pending","confirmed","completed","cancelled"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 16px",borderRadius:"50px",border:"none",background:filter===f?"linear-gradient(135deg,var(--accent),var(--accent2))":"transparent",color:filter===f?"#000":"var(--txt2)",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:600,cursor:"pointer",textTransform:"capitalize",transition:"all .2s"}}>{f}</button>
            ))}
          </div>
          <span style={{fontSize:"13px",color:"var(--txt2)"}}>{filtered.length} record{filtered.length!==1?"s":""}</span>
        </div>

        {/* List */}
        {loading?<div className="spinner"/>:filtered.length===0?(
          <div style={{textAlign:"center",padding:"80px",background:"rgba(255,255,255,.02)",borderRadius:"24px",border:"1px dashed var(--border)"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>🗓️</div>
            <h3 style={{color:"var(--txt2)",marginBottom:"8px"}}>No appointments found</h3>
            <button className="btn btn-primary" onClick={()=>navigate("/doctors")}>Book Your First Appointment</button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {filtered.map((apt,i)=>(
              <div key={apt._id} className="glass fade-up" style={{animationDelay:`${i*.05}s`,padding:"22px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"16px",flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
                  <div style={{width:"52px",height:"52px",borderRadius:"14px",background:`rgba(0,212,170,.1)`,border:"1px solid rgba(0,212,170,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",flexShrink:0}}>
                    {sIcon[apt.doctor?.specialty]||"🩺"}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:"15px",marginBottom:"3px"}}>{apt.doctor?.name}</div>
                    <div style={{color:"var(--accent)",fontSize:"12px",marginBottom:"5px"}}>{apt.doctor?.specialty} · {apt.doctor?.hospital}</div>
                    <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
                      <span style={{fontSize:"12px",color:"var(--txt2)"}}>📅 {new Date(apt.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                      <span style={{fontSize:"12px",color:"var(--txt2)"}}>🕐 {apt.timeSlot}</span>
                      <span style={{fontSize:"12px",color:"var(--txt2)"}}>💰 ₹{apt.fee}</span>
                      <span style={{fontSize:"12px",color:"var(--txt2)",textTransform:"capitalize"}}>🏥 {apt.mode}</span>
                      {apt.queueNumber&&<span style={{fontSize:"12px",color:"var(--gold)"}}>Queue #{apt.queueNumber}</span>}
                    </div>
                    {apt.paymentStatus==="unpaid"&&apt.status!=="cancelled"&&(
                      <button className="btn btn-gold btn-sm" style={{marginTop:"8px",fontSize:"12px",padding:"5px 14px"}} onClick={()=>navigate(`/pay/${apt._id}`)}>Pay Now ₹{apt.fee}</button>
                    )}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"8px"}}>
                  <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                  <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                    {(apt.status==="pending"||apt.status==="confirmed")&&(
                      <>
                        <button className="btn btn-outline btn-sm" onClick={()=>navigate(`/reschedule/${apt._id}`)}>Reschedule</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleCancel(apt._id)}>Cancel</button>
                      </>
                    )}
                    {apt.status==="completed"&&!apt.rating&&(
                      <button className="btn btn-sm" style={{background:"rgba(240,192,64,.15)",color:"var(--gold)",border:"1px solid rgba(240,192,64,.3)",padding:"7px 14px",fontSize:"13px"}} onClick={()=>{setShowRate(apt._id);setRating(5);setReview("");}}>⭐ Rate</button>
                    )}
                    {apt.rating&&<span style={{fontSize:"12px",color:"var(--gold)"}}>⭐ {apt.rating}/5</span>}
                    {apt.mode==="online"&&apt.meetingLink&&apt.status==="confirmed"&&(
                      <a href={apt.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{textDecoration:"none",padding:"7px 14px",fontSize:"13px"}}>Join Meeting</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating modal */}
        {showRate&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500}}>
            <div className="glass" style={{padding:"36px",borderRadius:"24px",width:"400px",maxWidth:"90vw"}}>
              <h3 style={{marginBottom:"20px"}}>Rate Your Appointment</h3>
              <div style={{display:"flex",gap:"8px",marginBottom:"20px"}}>
                {[1,2,3,4,5].map(r=>(
                  <button key={r} onClick={()=>setRating(r)} style={{background:"none",border:"none",fontSize:"28px",cursor:"pointer",opacity:r<=rating?1:.3}}>⭐</button>
                ))}
              </div>
              <textarea className="input" rows={3} placeholder="Write a review (optional)..." value={review} onChange={e=>setReview(e.target.value)} style={{marginBottom:"16px",resize:"vertical"}}/>
              <div style={{display:"flex",gap:"10px"}}>
                <button className="btn btn-outline" style={{flex:1}} onClick={()=>setShowRate(null)}>Cancel</button>
                <button className="btn btn-primary" style={{flex:1}} onClick={handleRate}>Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
