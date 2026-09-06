import React,{useState}from"react";import{updateProfile,changePassword}from"../services/api";import{useAuth}from"../context/AuthContext";import{toast}from"react-toastify";import Navbar from"../components/Navbar";
export default function Profile(){
  const{user,setUser}=useAuth();
  const[form,setForm]=useState({name:user?.name||"",phone:user?.phone||"",age:user?.age||"",gender:user?.gender||"",address:user?.address||"",bloodGroup:user?.bloodGroup||""});
  const[pw,setPw]=useState({currentPassword:"",newPassword:""});
  const[tab,setTab]=useState("profile");const[loading,setLoading]=useState(false);

  const handleProfile=async e=>{e.preventDefault();setLoading(true);try{const{data}=await updateProfile(form);setUser(data.user);toast.success("Profile updated!");}catch(err){toast.error(err.response?.data?.message||"Failed");}finally{setLoading(false);};};
  const handlePw=async e=>{e.preventDefault();setLoading(true);try{await changePassword(pw);toast.success("Password changed!");setPw({currentPassword:"",newPassword:""});}catch(err){toast.error(err.response?.data?.message||"Failed");}finally{setLoading(false);};};

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh-bg"/><Navbar/>
      <div className="page" style={{maxWidth:"680px"}}>
        {/* Avatar */}
        <div style={{display:"flex",alignItems:"center",gap:"20px",marginBottom:"32px"}} className="fade-up">
          <div style={{width:"80px",height:"80px",borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px",fontWeight:700,color:"#000"}}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h1 style={{fontSize:"26px",marginBottom:"4px"}}>{user?.name}</h1>
            <div style={{color:"var(--txt2)",fontSize:"14px"}}>{user?.email}</div>
            <span style={{background:"rgba(0,212,170,.15)",color:"var(--accent)",padding:"3px 12px",borderRadius:"50px",fontSize:"11px",fontWeight:700,textTransform:"uppercase",marginTop:"6px",display:"inline-block"}}>{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:"4px",background:"rgba(255,255,255,.04)",padding:"4px",borderRadius:"14px",border:"1px solid var(--border)",marginBottom:"24px",width:"fit-content"}}>
          {["profile","security"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"9px 22px",borderRadius:"10px",border:"none",background:tab===t?"rgba(0,212,170,.15)":"transparent",color:tab===t?"var(--accent)":"var(--txt2)",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:tab===t?600:400,cursor:"pointer",outline:tab===t?"1px solid rgba(0,212,170,.25)":"none",textTransform:"capitalize",transition:"all .2s"}}>{tab===t&&"✦ "}{t}</button>
          ))}
        </div>

        {tab==="profile"&&(
          <div className="glass fade-up" style={{padding:"32px",borderRadius:"20px"}}>
            <h3 style={{marginBottom:"24px"}}>Personal Information</h3>
            <form onSubmit={handleProfile}>
              <div className="card-grid card-grid-2" style={{marginBottom:"0"}}>
                <div style={{marginBottom:"18px"}}><label className="label">Full Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                <div style={{marginBottom:"18px"}}><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                <div style={{marginBottom:"18px"}}><label className="label">Age</label><input className="input" type="number" value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/></div>
                <div style={{marginBottom:"18px"}}><label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                    <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                <div style={{marginBottom:"18px"}}><label className="label">Blood Group</label>
                  <select className="input" value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}>
                    <option value="">Select</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{marginBottom:"18px"}}><label className="label">Address</label><input className="input" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{padding:"12px 28px",borderRadius:"12px"}}>{loading?"Saving...":"Save Changes"}</button>
            </form>
          </div>
        )}

        {tab==="security"&&(
          <div className="glass fade-up" style={{padding:"32px",borderRadius:"20px"}}>
            <h3 style={{marginBottom:"24px"}}>Change Password</h3>
            <form onSubmit={handlePw}>
              <div style={{marginBottom:"18px"}}><label className="label">Current Password</label><input className="input" type="password" placeholder="••••••••" value={pw.currentPassword} onChange={e=>setPw({...pw,currentPassword:e.target.value})} required/></div>
              <div style={{marginBottom:"24px"}}><label className="label">New Password</label><input className="input" type="password" placeholder="Min. 6 characters" value={pw.newPassword} onChange={e=>setPw({...pw,newPassword:e.target.value})} required/></div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{padding:"12px 28px",borderRadius:"12px"}}>{loading?"Updating...":"Update Password"}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
