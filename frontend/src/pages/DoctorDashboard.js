import React,{useEffect,useState}from"react";import{useNavigate}from"react-router-dom";import{getDoctorPortalProfile,getDoctorStats,getTodayAppointments,getDoctorAppointments,confirmDoctorAppointment,completeDoctorAppointment,cancelDoctorAppointment,getDoctorPatients,updateDoctorAvailability,updateDoctorPortalProfile}from"../services/api";import{useAuth}from"../context/AuthContext";import{toast}from"react-toastify";import Navbar from"../components/Navbar";import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer}from"recharts";

const statusColor={pending:"var(--gold)",confirmed:"var(--accent)",completed:"var(--info)",cancelled:"var(--danger)"};

export default function DoctorDashboard(){
  const{user}=useAuth();
  const[tab,setTab]=useState("overview");
  const[profile,setProfile]=useState(null);
  const[stats,setStats]=useState(null);
  const[todayApts,setTodayApts]=useState([]);
  const[allApts,setAllApts]=useState([]);
  const[patients,setPatients]=useState([]);
  const[loading,setLoading]=useState(true);
  const[showComplete,setShowComplete]=useState(null);
  const[completeForm,setCompleteForm]=useState({notes:"",prescription:{medicines:[],instructions:"",followUpDate:""},vitals:{bp:"",pulse:"",temperature:"",weight:""}});
  const[editProfile,setEditProfile]=useState(false);
  const[profileForm,setProfileForm]=useState({});
  const navigate=useNavigate();

  const refresh=async()=>{
    try{
      const[p,s,t,a]=await Promise.all([getDoctorPortalProfile(),getDoctorStats(),getTodayAppointments(),getDoctorAppointments()]);
      setProfile(p.data.doctor);setStats(s.data.stats);setTodayApts(t.data.appointments);setAllApts(a.data.appointments);
      setProfileForm({about:p.data.doctor.about||"",consultationFee:p.data.doctor.consultationFee||0,followUpFee:p.data.doctor.followUpFee||0,phone:p.data.doctor.phone||"",isAvailable:p.data.doctor.isAvailable});
    }catch(e){toast.error("Failed to load data");}
    finally{setLoading(false);}
  };
  useEffect(()=>{refresh();},[]);
  useEffect(()=>{if(tab==="patients")getDoctorPatients().then(r=>setPatients(r.data.patients)).catch(()=>{});},[tab]);

  const handleConfirm=async(id)=>{try{await confirmDoctorAppointment(id);toast.success("Appointment confirmed");refresh();}catch(e){toast.error(e.response?.data?.message||"Failed");}};
  const handleCancel=async(id)=>{const r=prompt("Reason for cancellation:");if(!r)return;try{await cancelDoctorAppointment(id,{reason:r});toast.success("Cancelled");refresh();}catch(e){toast.error(e.response?.data?.message||"Failed");}};
  const handleComplete=async()=>{try{await completeDoctorAppointment(showComplete,completeForm);toast.success("Appointment completed!");setShowComplete(null);setCompleteForm({notes:"",prescription:{medicines:[],instructions:"",followUpDate:""},vitals:{bp:"",pulse:"",temperature:"",weight:""}});refresh();}catch(e){toast.error(e.response?.data?.message||"Failed");}};
  const handleToggleAvail=async()=>{try{const r=await updateDoctorAvailability({isAvailable:!profile.isAvailable});setProfile(r.data.doctor);toast.success(r.data.message);}catch(e){toast.error("Failed");}};
  const handleUpdateProfile=async e=>{e.preventDefault();try{await updateDoctorPortalProfile(profileForm);toast.success("Profile updated!");setEditProfile(false);refresh();}catch(e){toast.error(e.response?.data?.message||"Failed");}};
  const addMedicine=()=>setCompleteForm(f=>({...f,prescription:{...f.prescription,medicines:[...f.prescription.medicines,{name:"",dosage:"",duration:""}]}}));
  const updateMed=(i,field,val)=>setCompleteForm(f=>{const m=[...f.prescription.medicines];m[i]={...m[i],[field]:val};return{...f,prescription:{...f.prescription,medicines:m}};});

  const tabs=[{id:"overview",label:"📊 Overview"},{id:"today",label:"📅 Today"},{id:"appointments",label:"🗓 All Appointments"},{id:"patients",label:"👥 My Patients"},{id:"profile",label:"⚙️ My Profile"}];

  if(loading)return<div style={{background:"var(--bg)",minHeight:"100vh"}}><Navbar/><div className="spinner"/></div>;
  if(!profile)return<div style={{background:"var(--bg)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><Navbar/><div style={{textAlign:"center",color:"var(--txt2)"}}><div style={{fontSize:"48px",marginBottom:"16px"}}>⚕️</div><h3>Doctor profile not found</h3><p style={{fontSize:"14px",marginTop:"8px"}}>Contact admin to set up your profile.</p></div></div>;

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh-bg"/><Navbar/>
      <div className="page">
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"28px",flexWrap:"wrap",gap:"12px"}} className="fade-up">
          <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
            <div style={{width:"60px",height:"60px",borderRadius:"18px",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px"}}>👨‍⚕️</div>
            <div>
              <h1 style={{fontSize:"24px",marginBottom:"3px"}}>{profile.name}</h1>
              <div style={{color:"var(--accent)",fontSize:"13px",fontWeight:500}}>{profile.specialty} · {profile.hospital}</div>
              <div style={{fontSize:"12px",color:"var(--txt2)",marginTop:"2px"}}>📍 {profile.locality||profile.location}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:"50px",padding:"8px 16px"}}>
              <div style={{width:"10px",height:"10px",borderRadius:"50%",background:profile.isAvailable?"var(--accent)":"var(--danger)",boxShadow:profile.isAvailable?"0 0 6px var(--accent)":"none"}}/>
              <span style={{fontSize:"13px",color:profile.isAvailable?"var(--accent)":"var(--danger)",fontWeight:600}}>{profile.isAvailable?"Available":"Unavailable"}</span>
            </div>
            <button className="btn btn-sm" onClick={handleToggleAvail} style={{background:profile.isAvailable?"rgba(255,77,109,.1)":"rgba(0,212,170,.1)",border:`1px solid ${profile.isAvailable?"var(--danger)":"var(--accent)"}`,color:profile.isAvailable?"var(--danger)":"var(--accent)",padding:"9px 18px",borderRadius:"50px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",fontWeight:600}}>
              {profile.isAvailable?"Go Unavailable":"Go Available"}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="card-grid card-grid-4" style={{marginBottom:"28px"}}>
          {[
            {label:"Today's Patients",value:stats?.todayCount||0,color:"var(--gold)",icon:"📅"},
            {label:"Total Patients",value:stats?.totalPatients||0,color:"var(--accent)",icon:"👥"},
            {label:"Completed",value:stats?.completed||0,color:"var(--info)",icon:"✅"},
            {label:"Rating",value:`⭐ ${profile.rating}`,color:"var(--gold)",icon:"🏆"},
          ].map((s,i)=>(
            <div key={s.label} className="stat-card fade-up" style={{animationDelay:`${i*.07}s`,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:"24px",marginBottom:"8px"}}>{s.icon}</div>
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
          <div className="fade-up">
            <div className="card-grid card-grid-2" style={{marginBottom:"20px"}}>
              <div className="glass" style={{padding:"24px",borderRadius:"20px"}}>
                <h3 style={{fontSize:"16px",marginBottom:"16px"}}>Today's Schedule</h3>
                {todayApts.length===0?<p style={{color:"var(--txt2)",fontSize:"14px"}}>No appointments scheduled for today.</p>:
                  todayApts.slice(0,5).map(a=>(
                    <div key={a._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:"14px"}}>{a.patient?.name}</div>
                        <div style={{fontSize:"12px",color:"var(--txt2)"}}>{a.timeSlot} · {a.reason||"—"}</div>
                      </div>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                    </div>
                  ))
                }
                {todayApts.length>5&&<button className="btn btn-outline btn-sm" style={{marginTop:"12px",width:"100%"}} onClick={()=>setTab("today")}>View All Today →</button>}
              </div>
              <div className="glass" style={{padding:"24px",borderRadius:"20px"}}>
                <h3 style={{fontSize:"16px",marginBottom:"16px"}}>Appointments This Month</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats?.monthly?.map(m=>({day:`Day ${m._id}`,count:m.count}))||[]}>
                    <XAxis dataKey="day" stroke="var(--txt3)" tick={{fontSize:10}}/>
                    <YAxis stroke="var(--txt3)" tick={{fontSize:10}}/>
                    <Tooltip contentStyle={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:"10px",fontSize:"12px"}}/>
                    <Bar dataKey="count" fill="var(--accent)" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Recent patients */}
            <div className="glass" style={{padding:"24px",borderRadius:"20px"}}>
              <h3 style={{fontSize:"16px",marginBottom:"16px"}}>Recent Patients</h3>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {(stats?.recentPatients||[]).map(a=>(
                  <div key={a._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"rgba(255,255,255,.04)",borderRadius:"12px",flexWrap:"wrap",gap:"8px"}}>
                    <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
                      <div style={{width:"38px",height:"38px",borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:700,color:"#000"}}>{a.patient?.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{fontWeight:600,fontSize:"14px"}}>{a.patient?.name}</div>
                        <div style={{fontSize:"12px",color:"var(--txt2)"}}>{a.patient?.age}y · {a.patient?.gender} · {a.patient?.bloodGroup||"—"}</div>
                      </div>
                    </div>
                    <div style={{fontSize:"12px",color:"var(--txt2)"}}>{new Date(a.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TODAY ── */}
        {tab==="today"&&(
          <div className="fade-up">
            <div style={{marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontSize:"18px"}}>Today — {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</h3>
              <span style={{background:"rgba(0,212,170,.15)",color:"var(--accent)",padding:"5px 14px",borderRadius:"50px",fontSize:"13px",fontWeight:600}}>{todayApts.length} patients</span>
            </div>
            {todayApts.length===0?(
              <div style={{textAlign:"center",padding:"60px",background:"rgba(255,255,255,.02)",borderRadius:"20px",border:"1px dashed var(--border)"}}>
                <div style={{fontSize:"48px",marginBottom:"12px"}}>🗓️</div>
                <p style={{color:"var(--txt2)"}}>No appointments scheduled for today.</p>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                {todayApts.map((a,i)=>(
                  <div key={a._id} className="glass" style={{padding:"20px 24px",borderRadius:"16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"16px",flexWrap:"wrap",borderLeft:`3px solid ${statusColor[a.status]||"var(--border)"}`}}>
                    <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
                      <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(0,212,170,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"14px",color:"var(--accent)",flexShrink:0}}>#{a.queueNumber||i+1}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:"15px",marginBottom:"3px"}}>{a.patient?.name}</div>
                        <div style={{fontSize:"12px",color:"var(--txt2)",marginBottom:"4px"}}>{a.patient?.age}y · {a.patient?.gender} · 🩸 {a.patient?.bloodGroup||"N/A"} · 📞 {a.patient?.phone}</div>
                        <div style={{fontSize:"13px",color:"var(--txt)",marginBottom:"4px"}}>🕐 {a.timeSlot} · {a.type==="followup"?"Follow-up":"New Visit"} · {a.mode}</div>
                        {a.reason&&<div style={{fontSize:"13px",color:"var(--txt2)"}}>📋 {a.reason}</div>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                      {a.status==="pending"&&<button className="btn btn-outline btn-sm" onClick={()=>handleConfirm(a._id)}>Confirm</button>}
                      {(a.status==="pending"||a.status==="confirmed")&&(
                        <>
                          <button className="btn btn-primary btn-sm" onClick={()=>setShowComplete(a._id)}>Complete</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>handleCancel(a._id)}>Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALL APPOINTMENTS ── */}
        {tab==="appointments"&&(
          <div className="fade-up">
            <div style={{display:"flex",gap:"8px",marginBottom:"18px",flexWrap:"wrap"}}>
              {["all","pending","confirmed","completed","cancelled"].map(f=>(
                <button key={f} onClick={async()=>{const r=await getDoctorAppointments(f!=="all"?{status:f}:{});setAllApts(r.data.appointments);}} style={{padding:"7px 16px",borderRadius:"50px",border:"1px solid var(--border)",background:"transparent",color:"var(--txt2)",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer",textTransform:"capitalize",transition:"all .2s"}}>{f}</button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {allApts.map(a=>(
                <div key={a._id} className="glass" style={{padding:"18px 22px",borderRadius:"14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:"14px",marginBottom:"3px"}}>{a.patient?.name}</div>
                    <div style={{fontSize:"12px",color:"var(--txt2)"}}>{new Date(a.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} · {a.timeSlot} · {a.type}</div>
                    {a.reason&&<div style={{fontSize:"12px",color:"var(--txt3)",marginTop:"2px"}}>{a.reason}</div>}
                  </div>
                  <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                    <span className={`badge badge-${a.status}`}>{a.status}</span>
                    {a.status==="pending"&&<button className="btn btn-outline btn-sm" onClick={()=>handleConfirm(a._id)}>Confirm</button>}
                    {(a.status==="pending"||a.status==="confirmed")&&(
                      <>
                        <button className="btn btn-primary btn-sm" onClick={()=>setShowComplete(a._id)}>Complete</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleCancel(a._id)}>Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PATIENTS ── */}
        {tab==="patients"&&(
          <div className="fade-up">
            <div style={{marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{fontSize:"18px"}}>My Patients</h3>
              <span style={{background:"rgba(0,212,170,.15)",color:"var(--accent)",padding:"5px 14px",borderRadius:"50px",fontSize:"13px",fontWeight:600}}>{patients.length} total</span>
            </div>
            <div className="card-grid card-grid-2">
              {patients.map(p=>(
                <div key={p._id} className="glass" style={{padding:"20px",borderRadius:"16px"}}>
                  <div style={{display:"flex",gap:"12px",alignItems:"center",marginBottom:"12px"}}>
                    <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",fontWeight:700,color:"#000",flexShrink:0}}>{p.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div style={{fontWeight:700,fontSize:"15px"}}>{p.name}</div>
                      <div style={{fontSize:"12px",color:"var(--txt2)"}}>{p.email}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                    {[{l:"Age",v:p.age||"—"},{l:"Gender",v:p.gender||"—"},{l:"Blood Group",v:p.bloodGroup||"—"},{l:"Visits",v:p.appointmentCount||1}].map(i=>(
                      <div key={i.l} style={{background:"rgba(255,255,255,.04)",borderRadius:"8px",padding:"8px 10px"}}>
                        <div style={{fontSize:"10px",color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".5px"}}>{i.l}</div>
                        <div style={{fontSize:"13px",fontWeight:500,marginTop:"2px",textTransform:"capitalize"}}>{i.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:"12px",color:"var(--txt2)",marginTop:"10px"}}>📞 {p.phone||"—"} · 📅 Last visit: {new Date(p.lastVisit).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab==="profile"&&(
          <div className="fade-up" style={{maxWidth:"680px"}}>
            <div className="glass" style={{padding:"28px",borderRadius:"20px",marginBottom:"20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
                <h3 style={{fontSize:"18px"}}>Doctor Profile</h3>
                <button className="btn btn-outline btn-sm" onClick={()=>setEditProfile(!editProfile)}>{editProfile?"Cancel":"Edit Profile"}</button>
              </div>
              {!editProfile?(
                <div>
                  {[{l:"Specialty",v:`${profile.specialty}${profile.subSpecialty?` · ${profile.subSpecialty}`:""}`},{l:"Hospital",v:profile.hospital},{l:"Location",v:profile.locality||profile.location},{l:"Experience",v:`${profile.experience} years`},{l:"Consultation Fee",v:`₹${profile.consultationFee}`},{l:"Follow-up Fee",v:`₹${profile.followUpFee}`},{l:"Languages",v:profile.languages?.join(", ")||"—"},{l:"Phone",v:profile.phone||"—"}].map(i=>(
                    <div key={i.l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:"14px"}}>
                      <span style={{color:"var(--txt2)"}}>{i.l}</span><span style={{fontWeight:500}}>{i.v}</span>
                    </div>
                  ))}
                  {profile.about&&<div style={{marginTop:"16px"}}><div style={{fontSize:"12px",color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:"8px"}}>About</div><p style={{fontSize:"14px",color:"var(--txt2)",lineHeight:1.7}}>{profile.about}</p></div>}
                </div>
              ):(
                <form onSubmit={handleUpdateProfile}>
                  <div className="card-grid card-grid-2">
                    <div style={{marginBottom:"16px"}}><label className="label">Consultation Fee (₹)</label><input className="input" type="number" value={profileForm.consultationFee} onChange={e=>setProfileForm({...profileForm,consultationFee:e.target.value})}/></div>
                    <div style={{marginBottom:"16px"}}><label className="label">Follow-up Fee (₹)</label><input className="input" type="number" value={profileForm.followUpFee} onChange={e=>setProfileForm({...profileForm,followUpFee:e.target.value})}/></div>
                    <div style={{marginBottom:"16px"}}><label className="label">Phone</label><input className="input" value={profileForm.phone} onChange={e=>setProfileForm({...profileForm,phone:e.target.value})}/></div>
                  </div>
                  <div style={{marginBottom:"16px"}}><label className="label">About / Bio</label><textarea className="input" rows={4} value={profileForm.about} onChange={e=>setProfileForm({...profileForm,about:e.target.value})} style={{resize:"vertical"}}/></div>
                  <button className="btn btn-primary" type="submit" style={{padding:"12px 28px",borderRadius:"12px"}}>Save Changes</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── Complete Appointment Modal ── */}
        {showComplete&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:"20px"}}>
            <div className="glass" style={{padding:"32px",borderRadius:"24px",width:"100%",maxWidth:"560px",maxHeight:"90vh",overflowY:"auto"}}>
              <h3 style={{marginBottom:"20px"}}>Complete Appointment</h3>

              <label className="label">Doctor's Notes</label>
              <textarea className="input" rows={3} placeholder="Clinical observations, diagnosis..." value={completeForm.notes} onChange={e=>setCompleteForm({...completeForm,notes:e.target.value})} style={{marginBottom:"16px",resize:"vertical"}}/>

              <label className="label">Vitals</label>
              <div className="card-grid card-grid-2" style={{marginBottom:"16px"}}>
                {[{k:"bp",p:"Blood Pressure (e.g. 120/80)"},{k:"pulse",p:"Pulse (bpm)"},{k:"temperature",p:"Temperature (°F)"},{k:"weight",p:"Weight (kg)"}].map(v=>(
                  <input key={v.k} className="input" placeholder={v.p} value={completeForm.vitals[v.k]} onChange={e=>setCompleteForm(f=>({...f,vitals:{...f.vitals,[v.k]:e.target.value}}))} style={{marginBottom:"10px"}}/>
                ))}
              </div>

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                <label className="label" style={{marginBottom:0}}>Prescription</label>
                <button type="button" className="btn btn-outline btn-sm" onClick={addMedicine}>+ Add Medicine</button>
              </div>
              {completeForm.prescription.medicines.map((m,i)=>(
                <div key={i} className="card-grid card-grid-3" style={{marginBottom:"8px"}}>
                  <input className="input" placeholder="Medicine name" value={m.name} onChange={e=>updateMed(i,"name",e.target.value)}/>
                  <input className="input" placeholder="Dosage" value={m.dosage} onChange={e=>updateMed(i,"dosage",e.target.value)}/>
                  <input className="input" placeholder="Duration" value={m.duration} onChange={e=>updateMed(i,"duration",e.target.value)}/>
                </div>
              ))}
              <textarea className="input" rows={2} placeholder="Instructions (e.g. take after food, rest for 3 days...)" value={completeForm.prescription.instructions} onChange={e=>setCompleteForm(f=>({...f,prescription:{...f.prescription,instructions:e.target.value}}))} style={{marginBottom:"10px",resize:"vertical"}}/>
              <div style={{marginBottom:"20px"}}>
                <label className="label">Follow-up Date (optional)</label>
                <input className="input" type="date" value={completeForm.prescription.followUpDate} onChange={e=>setCompleteForm(f=>({...f,prescription:{...f.prescription,followUpDate:e.target.value}}))}/>
              </div>
              <div style={{display:"flex",gap:"10px"}}>
                <button className="btn btn-outline" style={{flex:1}} onClick={()=>setShowComplete(null)}>Cancel</button>
                <button className="btn btn-primary" style={{flex:1}} onClick={handleComplete}>Mark as Completed ✓</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
