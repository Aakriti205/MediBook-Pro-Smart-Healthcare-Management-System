import React,{useEffect,useState}from"react";import{useNavigate}from"react-router-dom";import{getAdminStats,getAllAppointments,updateAppointmentStatus,createDoctor,deleteDoctor,getDoctors as getAllDoctors,getAllUsers,toggleUserStatus,broadcast,getPaymentStats,triggerReminders,sendTestReminder,getUpcomingReminders}from"../services/api";import{useAuth}from"../context/AuthContext";import{toast}from"react-toastify";import Navbar from"../components/Navbar";
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,LineChart,Line,PieChart,Pie,Cell}from"recharts";
const sIcon={Cardiologist:"❤️",Neurologist:"🧠",Dermatologist:"✨","Orthopedic Surgeon":"🦴",Gynecologist:"🌸",Pediatrician:"👶",default:"🩺"};
const COLORS=["#00d4aa","#4da6ff","#f0c040","#ff4d6d","#a78bfa","#34d399"];
const emptyDoc={name:"",specialty:"",hospital:"",location:"",consultationFee:"",followUpFee:"",email:"",phone:"",experience:"",about:""};

export default function AdminDashboard(){
  const{user}=useAuth();const navigate=useNavigate();
  const[tab,setTab]=useState("overview");
  const[stats,setStats]=useState(null);
  const[apts,setApts]=useState([]);const[docs,setDocs]=useState([]);const[users,setUsers]=useState([]);
  const[aptFilter,setAptFilter]=useState("all");
  const[showAddDoc,setShowAddDoc]=useState(false);
  const[docForm,setDocForm]=useState(emptyDoc);
  const[bcast,setBcast]=useState({title:"",message:"",role:""});
  const[payStats,setPayStats]=useState(null);
  const[loading,setLoading]=useState(true);
  const[upcomingApts,setUpcomingApts]=useState([]);
  const[reminderLoading,setReminderLoading]=useState(false);

  const refresh=async()=>{
    try{
      const[s,a,d,u,p]=await Promise.all([getAdminStats(),getAllAppointments(),getAllDoctors(),getAllUsers(),getPaymentStats()]);
      setStats(s.data.stats);setApts(a.data.appointments);setDocs(d.data.doctors);setUsers(u.data.users);setPayStats(p.data);
    }catch(e){toast.error("Failed to load");}finally{setLoading(false);}
  };
  useEffect(()=>{refresh();},[]);

  const handleStatus=async(id,status)=>{try{await updateAppointmentStatus(id,{status});toast.success("Updated");refresh();}catch{toast.error("Failed");}};
  const handleAddDoc=async e=>{e.preventDefault();try{await createDoctor(docForm);toast.success("Doctor added!");setShowAddDoc(false);setDocForm(emptyDoc);refresh();}catch(err){toast.error(err.response?.data?.message||"Failed");}};
  const handleDelDoc=async id=>{if(!window.confirm("Delete this doctor?"))return;try{await deleteDoctor(id);toast.success("Deleted");refresh();}catch{toast.error("Failed");}};
  const handleToggleUser=async id=>{try{await toggleUserStatus(id);toast.success("Updated");refresh();}catch{toast.error("Failed");}};
  const handleBroadcast=async e=>{e.preventDefault();try{const{data}=await broadcast(bcast);toast.success(data.message);setBcast({title:"",message:"",role:""});}catch{toast.error("Failed");}};
  const handleTriggerReminders=async()=>{setReminderLoading(true);try{const{data}=await triggerReminders();toast.success(data.message);}catch{toast.error("Failed");}finally{setReminderLoading(false);};};
  const handleTestReminder=async()=>{try{await sendTestReminder();toast.success("Test reminder sent to your account!");}catch{toast.error("Failed");};};
  const loadUpcoming=async()=>{setReminderLoading(true);try{const{data}=await getUpcomingReminders();setUpcomingApts(data.appointments);}catch{toast.error("Failed");}finally{setReminderLoading(false);};};
  useEffect(()=>{if(tab==="reminders")loadUpcoming();},[tab]);

  const filteredApts=aptFilter==="all"?apts:apts.filter(a=>a.status===aptFilter);
  const statusData=stats?.appointmentsByStatus?.map(s=>({name:s._id,value:s.count}))||[];

  const tabs=[{id:"overview",label:"📊 Overview"},{id:"appointments",label:"🗓 Appointments"},{id:"doctors",label:"👨‍⚕️ Doctors"},{id:"users",label:"👥 Users"},{id:"analytics",label:"📈 Analytics"},{id:"reminders",label:"⏰ Reminders"},{id:"broadcast",label:"📢 Broadcast"}];

  if(loading)return<div style={{background:"var(--bg)",minHeight:"100vh"}}><Navbar/><div className="spinner"/></div>;

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh-bg"/><Navbar/>
      <div className="page">
        {/* Header */}
        <div style={{marginBottom:"28px"}} className="fade-up">
          <span style={{background:"rgba(167,139,250,.15)",border:"1px solid rgba(167,139,250,.3)",color:"var(--purple)",padding:"4px 12px",borderRadius:"50px",fontSize:"11px",fontWeight:700,letterSpacing:".8px",textTransform:"uppercase",display:"inline-block",marginBottom:"10px"}}>Admin</span>
          <h1 style={{fontSize:"32px"}}>Control <span style={{background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Dashboard</span></h1>
        </div>

        {/* Stats */}
        <div className="card-grid card-grid-4" style={{marginBottom:"28px"}}>
          {[
            {label:"Total Patients",value:stats?.totalUsers||0,color:"var(--accent)",icon:"👥"},
            {label:"Total Doctors",value:stats?.totalDoctors||0,color:"var(--purple)",icon:"👨‍⚕️"},
            {label:"Appointments",value:stats?.totalAppointments||0,color:"var(--info)",icon:"🗓"},
            {label:"Revenue",value:`₹${(stats?.revenue||0).toLocaleString()}`,color:"var(--gold)",icon:"💰"},
          ].map((s,i)=>(
            <div key={s.label} className="stat-card fade-up" style={{animationDelay:`${i*.07}s`,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:"28px",marginBottom:"8px"}}>{s.icon}</div>
              <div className="stat-num" style={{color:s.color,fontSize:"28px"}}>{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:"4px",background:"rgba(255,255,255,.04)",padding:"5px",borderRadius:"14px",border:"1px solid var(--border)",marginBottom:"24px",flexWrap:"wrap"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 18px",borderRadius:"10px",border:"none",background:tab===t.id?"rgba(0,212,170,.15)":"transparent",color:tab===t.id?"var(--accent)":"var(--txt2)",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:tab===t.id?600:400,cursor:"pointer",outline:tab===t.id?"1px solid rgba(0,212,170,.25)":"none",transition:"all .2s"}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab==="overview"&&(
          <div>
            <div className="card-grid card-grid-2" style={{marginBottom:"20px"}}>
              {/* Recent appointments */}
              <div className="glass" style={{padding:"24px",borderRadius:"20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"16px"}}>
                  <h3 style={{fontSize:"16px"}}>Recent Appointments</h3>
                  <button className="btn btn-outline btn-sm" onClick={()=>setTab("appointments")}>View All</button>
                </div>
                {stats?.recentAppointments?.map(a=>(
                  <div key={a._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:600}}>{a.patient?.name}</div>
                      <div style={{fontSize:"11px",color:"var(--txt2)"}}>Dr. {a.doctor?.name}</div>
                    </div>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                  </div>
                ))}
              </div>
              {/* Top doctors */}
              <div className="glass" style={{padding:"24px",borderRadius:"20px"}}>
                <h3 style={{fontSize:"16px",marginBottom:"16px"}}>Top Performing Doctors</h3>
                {stats?.topDoctors?.map((d,i)=>(
                  <div key={d._id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                    <div style={{width:"28px",height:"28px",borderRadius:"50%",background:`${COLORS[i]}22`,border:`1px solid ${COLORS[i]}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700,color:COLORS[i]}}>{i+1}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px",fontWeight:600}}>{d.name}</div>
                      <div style={{fontSize:"11px",color:"var(--txt2)"}}>{d.specialty}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:"12px",color:"var(--gold)"}}>⭐ {d.rating}</div>
                      <div style={{fontSize:"11px",color:"var(--txt2)"}}>{d.totalPatients} patients</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Status pie */}
            <div className="glass" style={{padding:"24px",borderRadius:"20px"}}>
              <h3 style={{fontSize:"16px",marginBottom:"16px"}}>Appointments by Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie><Tooltip contentStyle={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"10px"}}/></PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS ── */}
        {tab==="appointments"&&(
          <div>
            <div style={{display:"flex",gap:"8px",marginBottom:"18px",flexWrap:"wrap"}}>
              {["all","pending","confirmed","completed","cancelled"].map(f=>(
                <button key={f} onClick={()=>setAptFilter(f)} style={{padding:"7px 16px",borderRadius:"50px",border:"1px solid",borderColor:aptFilter===f?"var(--accent)":"var(--border)",background:aptFilter===f?"rgba(0,212,170,.15)":"transparent",color:aptFilter===f?"var(--accent)":"var(--txt2)",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:aptFilter===f?600:400,cursor:"pointer",textTransform:"capitalize",transition:"all .2s"}}>{f} ({f==="all"?apts.length:apts.filter(a=>a.status===f).length})</button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {filteredApts.map(apt=>(
                <div key={apt._id} className="glass" style={{padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
                  <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                    <div style={{width:"42px",height:"42px",borderRadius:"12px",background:"rgba(0,212,170,.1)",border:"1px solid rgba(0,212,170,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>{sIcon[apt.doctor?.specialty]||"🩺"}</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:"14px",marginBottom:"2px"}}>{apt.patient?.name} <span style={{color:"var(--txt3)",fontWeight:400}}>→ Dr. {apt.doctor?.name}</span></div>
                      <div style={{fontSize:"12px",color:"var(--txt2)"}}>{new Date(apt.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})} · {apt.timeSlot} · ₹{apt.fee}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                    <select value={apt.status} onChange={e=>handleStatus(apt._id,e.target.value)} style={{background:"rgba(255,255,255,.07)",border:"1px solid var(--border)",color:"var(--txt)",padding:"7px 10px",borderRadius:"8px",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",cursor:"pointer"}}>
                      {["pending","confirmed","completed","cancelled","no-show"].map(s=><option key={s} value={s} style={{background:"#0a1628"}}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCTORS ── */}
        {tab==="doctors"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"18px"}}>
              <button className="btn btn-primary" onClick={()=>setShowAddDoc(!showAddDoc)}>{showAddDoc?"✕ Cancel":"+ Add Doctor"}</button>
            </div>
            {showAddDoc&&(
              <div className="glass" style={{padding:"28px",marginBottom:"20px",borderRadius:"20px",border:"1px solid rgba(0,212,170,.2)"}}>
                <h3 style={{marginBottom:"20px"}}>Add New Doctor</h3>
                <form onSubmit={handleAddDoc}>
                  <div className="card-grid card-grid-2" style={{marginBottom:"16px"}}>
                    {[{n:"name",p:"Full Name",r:true},{n:"specialty",p:"Specialty",r:true},{n:"hospital",p:"Hospital",r:true},{n:"location",p:"City / Location"},{n:"email",p:"Email"},{n:"phone",p:"Phone"},{n:"experience",p:"Years of Experience"},{n:"consultationFee",p:"Consultation Fee (₹)"},{n:"followUpFee",p:"Follow-up Fee (₹)"}].map(f=>(
                      <div key={f.n} style={{marginBottom:"14px"}}><label className="label">{f.p}</label><input className="input" placeholder={f.p} value={docForm[f.n]} onChange={e=>setDocForm({...docForm,[f.n]:e.target.value})} required={!!f.r}/></div>
                    ))}
                    <div style={{gridColumn:"1/-1",marginBottom:"14px"}}><label className="label">About</label><textarea className="input" rows={3} placeholder="Doctor bio..." value={docForm.about} onChange={e=>setDocForm({...docForm,about:e.target.value})} style={{resize:"vertical"}}/></div>
                  </div>
                  <button className="btn btn-primary" type="submit" style={{padding:"12px 28px",borderRadius:"12px"}}>Save Doctor</button>
                </form>
              </div>
            )}
            <div className="card-grid card-grid-3">
              {docs.map(doc=>(
                <div key={doc._id} className="glass" style={{padding:"22px",borderRadius:"18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px"}}>
                    <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                      <div style={{width:"44px",height:"44px",borderRadius:"12px",background:"rgba(0,212,170,.1)",border:"1px solid rgba(0,212,170,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}}>{sIcon[doc.specialty]||"🩺"}</div>
                      <div><div style={{fontWeight:700,fontSize:"14px"}}>{doc.name}</div><div style={{fontSize:"12px",color:"var(--accent)"}}>{doc.specialty}</div></div>
                    </div>
                    <div style={{width:"8px",height:"8px",borderRadius:"50%",background:doc.isAvailable?"var(--accent)":"var(--danger)",boxShadow:doc.isAvailable?"0 0 6px var(--accent)":"none",marginTop:"4px"}}/>
                  </div>
                  <div style={{fontSize:"12px",color:"var(--txt2)",marginBottom:"3px"}}>🏥 {doc.hospital}</div>
                  <div style={{fontSize:"12px",color:"var(--txt2)",marginBottom:"10px"}}>📍 {doc.location}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{fontSize:"16px",fontWeight:700,color:"var(--gold)"}}>₹{doc.consultationFee}</div><div style={{fontSize:"11px",color:"var(--txt2)"}}>⭐ {doc.rating} · {doc.totalPatients} pts</div></div>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelDoc(doc._id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab==="users"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {users.map(u=>(
              <div key={u._id} className="glass" style={{padding:"16px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                  <div style={{width:"38px",height:"38px",borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:700,color:"#000"}}>{u.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:"14px"}}>{u.name}</div>
                    <div style={{fontSize:"12px",color:"var(--txt2)"}}>{u.email} · {u.phone||"—"}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <span style={{background:"rgba(167,139,250,.15)",color:"var(--purple)",padding:"3px 10px",borderRadius:"50px",fontSize:"11px",fontWeight:700,textTransform:"uppercase"}}>{u.role}</span>
                  <span style={{background:u.isActive?"rgba(0,212,170,.15)":"rgba(255,77,109,.15)",color:u.isActive?"var(--accent)":"var(--danger)",padding:"3px 10px",borderRadius:"50px",fontSize:"11px",fontWeight:700}}>{u.isActive?"Active":"Inactive"}</span>
                  <button className="btn btn-sm" onClick={()=>handleToggleUser(u._id)} style={{background:"rgba(255,255,255,.06)",border:"1px solid var(--border)",color:"var(--txt2)",padding:"6px 14px",fontSize:"12px",borderRadius:"8px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{u.isActive?"Deactivate":"Activate"}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab==="analytics"&&(
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            {payStats?.byMethod?.length>0&&(
              <div className="glass" style={{padding:"24px",borderRadius:"20px"}}>
                <h3 style={{fontSize:"16px",marginBottom:"16px"}}>Revenue by Payment Method</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={payStats.byMethod.map(m=>({name:m._id,revenue:m.total,count:m.count}))}>
                    <XAxis dataKey="name" stroke="var(--txt3)" tick={{fontSize:12}}/>
                    <YAxis stroke="var(--txt3)" tick={{fontSize:12}}/>
                    <Tooltip contentStyle={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"10px",fontSize:"12px"}}/>
                    <Bar dataKey="revenue" fill="var(--accent)" radius={[6,6,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {stats?.monthlyRevenue?.length>0&&(
              <div className="glass" style={{padding:"24px",borderRadius:"20px"}}>
                <h3 style={{fontSize:"16px",marginBottom:"16px"}}>Daily Revenue (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.monthlyRevenue.map(r=>({day:r._id,revenue:r.revenue}))}>
                    <XAxis dataKey="day" stroke="var(--txt3)" tick={{fontSize:12}}/>
                    <YAxis stroke="var(--txt3)" tick={{fontSize:12}}/>
                    <Tooltip contentStyle={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"10px",fontSize:"12px"}}/>
                    <Line type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={2} dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="card-grid card-grid-3">
              {[{l:"Total Revenue",v:`₹${(payStats?.stats?.total||0).toLocaleString()}`,c:"var(--gold)"},{l:"Total Transactions",v:payStats?.stats?.count||0,c:"var(--accent)"},{l:"Avg Transaction",v:`₹${Math.round(payStats?.stats?.avgAmount||0)}`,c:"var(--info)"}].map(s=>(
                <div key={s.l} className="stat-card"><div className="stat-num" style={{color:s.c,fontSize:"26px"}}>{s.v}</div><div className="stat-lbl">{s.l}</div></div>
              ))}
            </div>
          </div>
        )}

        {/* ── REMINDERS ── */}
        {tab==="reminders"&&(
          <div>
            {/* Info banner */}
            <div style={{background:"rgba(0,212,170,.07)",border:"1px solid rgba(0,212,170,.2)",borderRadius:"16px",padding:"20px 24px",marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
              <div>
                <div style={{fontWeight:700,fontSize:"15px",marginBottom:"4px"}}>⏰ Automatic Reminder System</div>
                <div style={{fontSize:"13px",color:"var(--txt2)"}}>Reminders fire automatically every <strong style={{color:"var(--accent)"}}>15 minutes</strong>. Patients receive:</div>
                <div style={{display:"flex",gap:"20px",marginTop:"8px",flexWrap:"wrap"}}>
                  {[{t:"🔔 24-hour reminder",d:"Night before appointment"},{t:"⚠️ 1-hour reminder",d:"Just before appointment"}].map(r=>(
                    <div key={r.t} style={{background:"rgba(255,255,255,.05)",borderRadius:"10px",padding:"8px 14px",border:"1px solid var(--border)"}}>
                      <div style={{fontSize:"13px",fontWeight:600}}>{r.t}</div>
                      <div style={{fontSize:"11px",color:"var(--txt2)",marginTop:"2px"}}>{r.d}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                <button className="btn btn-outline btn-sm" onClick={handleTestReminder}>Send Test to Me</button>
                <button className="btn btn-primary btn-sm" disabled={reminderLoading} onClick={handleTriggerReminders}>{reminderLoading?"Running...":"▶ Run Now"}</button>
              </div>
            </div>

            {/* How it works */}
            <div className="card-grid card-grid-3" style={{marginBottom:"24px"}}>
              {[
                {icon:"🗓",title:"Scheduled Check",desc:"Every 15 minutes the server scans all confirmed & pending appointments.",color:"var(--accent)"},
                {icon:"🔔",title:"In-App Notification",desc:"A notification is created in the patient's notification bell immediately.",color:"var(--info)"},
                {icon:"📧",title:"Email Reminder",desc:"If EMAIL_* is set in .env, an HTML email is sent to the patient's email address.",color:"var(--gold)"},
              ].map(c=>(
                <div key={c.title} className="glass" style={{padding:"22px",borderRadius:"16px",borderTop:`3px solid ${c.color}`}}>
                  <div style={{fontSize:"28px",marginBottom:"10px"}}>{c.icon}</div>
                  <div style={{fontWeight:700,fontSize:"14px",marginBottom:"6px"}}>{c.title}</div>
                  <div style={{fontSize:"13px",color:"var(--txt2)",lineHeight:1.6}}>{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Email setup guide */}
            <div className="glass" style={{padding:"24px",borderRadius:"16px",marginBottom:"24px",border:"1px solid rgba(240,192,64,.2)"}}>
              <h4 style={{color:"var(--gold)",marginBottom:"14px"}}>📧 Enable Email Reminders (optional)</h4>
              <p style={{fontSize:"13px",color:"var(--txt2)",marginBottom:"14px",lineHeight:1.7}}>Add these to your <code style={{background:"rgba(255,255,255,.08)",padding:"2px 7px",borderRadius:"5px",fontSize:"12px"}}>backend/.env</code> file:</p>
              <div style={{background:"rgba(0,0,0,.3)",borderRadius:"10px",padding:"16px",fontFamily:"monospace",fontSize:"13px",color:"var(--accent)",lineHeight:2}}>
                EMAIL_HOST=smtp.gmail.com<br/>
                EMAIL_PORT=587<br/>
                EMAIL_USER=your_gmail@gmail.com<br/>
                EMAIL_PASS=your_16_char_app_password<br/>
                EMAIL_FROM=MediBook Pro &lt;your_gmail@gmail.com&gt;
              </div>
              <div style={{marginTop:"12px",fontSize:"12px",color:"var(--txt2)"}}>
                ⚠️ Use a Gmail <strong>App Password</strong> (not your account password). Go to Google Account → Security → 2-Step Verification → App Passwords.
              </div>
            </div>

            {/* Upcoming appointments due for reminders */}
            <div className="glass" style={{padding:"24px",borderRadius:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
                <h4>Appointments Due for Reminder (next 24h)</h4>
                <button className="btn btn-outline btn-sm" onClick={loadUpcoming} disabled={reminderLoading}>{reminderLoading?"Loading...":"🔄 Refresh"}</button>
              </div>
              {reminderLoading?<div className="spinner"/>:upcomingApts.length===0?(
                <div style={{textAlign:"center",padding:"40px",color:"var(--txt2)"}}>
                  <div style={{fontSize:"36px",marginBottom:"12px"}}>✅</div>
                  <p style={{fontSize:"14px"}}>No appointments due for reminders in the next 24 hours.</p>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                  {upcomingApts.map(apt=>(
                    <div key={apt.id} style={{background:"rgba(255,255,255,.04)",borderRadius:"12px",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",flexWrap:"wrap",border:"1px solid var(--border)"}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:"14px",marginBottom:"3px"}}>{apt.patient} <span style={{color:"var(--txt3)",fontWeight:400,fontSize:"13px"}}>→ Dr. {apt.doctor}</span></div>
                        <div style={{fontSize:"12px",color:"var(--txt2)"}}>{new Date(apt.date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})} · {apt.timeSlot}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:"13px",fontWeight:700,color:Number(apt.hoursUntil)<=1?"var(--danger)":Number(apt.hoursUntil)<=3?"var(--gold)":"var(--accent)"}}>
                            {Number(apt.hoursUntil)<=1?"⚠️ ":" "}{apt.hoursUntil}h away
                          </div>
                          <div style={{fontSize:"11px",color:"var(--txt2)"}}>{apt.reminderSent?"✅ Reminded":"🔔 Pending"}</div>
                        </div>
                        <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BROADCAST ── */}
        {tab==="broadcast"&&(
          <div className="glass" style={{padding:"32px",borderRadius:"20px",maxWidth:"600px"}}>
            <h3 style={{marginBottom:"6px"}}>Send Broadcast Notification</h3>
            <p style={{color:"var(--txt2)",fontSize:"14px",marginBottom:"24px"}}>Send a message to all users or a specific role</p>
            <form onSubmit={handleBroadcast}>
              <div style={{marginBottom:"18px"}}><label className="label">Target Audience</label>
                <select className="input" value={bcast.role} onChange={e=>setBcast({...bcast,role:e.target.value})}>
                  <option value="">All Users</option><option value="patient">Patients Only</option><option value="admin">Admins Only</option>
                </select>
              </div>
              <div style={{marginBottom:"18px"}}><label className="label">Title</label><input className="input" placeholder="Notification title" value={bcast.title} onChange={e=>setBcast({...bcast,title:e.target.value})} required/></div>
              <div style={{marginBottom:"24px"}}><label className="label">Message</label><textarea className="input" rows={4} placeholder="Your message..." value={bcast.message} onChange={e=>setBcast({...bcast,message:e.target.value})} required style={{resize:"vertical"}}/></div>
              <button className="btn btn-primary" type="submit" style={{padding:"12px 28px",borderRadius:"12px"}}>Send Broadcast 📢</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
