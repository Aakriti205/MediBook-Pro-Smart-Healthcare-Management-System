import React,{useState}from"react";import{Link,useNavigate}from"react-router-dom";import{login as loginAPI}from"../services/api";import{useAuth}from"../context/AuthContext";import{toast}from"react-toastify";
export default function Login(){
  const[form,setForm]=useState({email:"",password:""});const[loading,setLoading]=useState(false);const[showPw,setShowPw]=useState(false);
  const{login}=useAuth();const navigate=useNavigate();
  const handle=async e=>{
    e.preventDefault();setLoading(true);
    try{
      const{data}=await loginAPI(form);
      login(data.user,data.token,data.refreshToken);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      if(data.user.role==="admin") navigate("/admin");
      else if(data.user.role==="doctor") navigate("/doctor");
      else navigate("/dashboard");
    }catch(err){toast.error(err.response?.data?.message||"Login failed");}
    finally{setLoading(false);}
  };
  return(
    <div style={{minHeight:"100vh",display:"flex",background:"var(--bg)",position:"relative",overflow:"hidden"}}>
      <div className="mesh-bg"/>
      {/* Left panel */}
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 80px",zIndex:1}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"26px",fontWeight:700,background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"48px"}}>✦ MediBook Pro</div>
        <h1 style={{fontSize:"52px",lineHeight:1.15,marginBottom:"20px"}}>Healthcare,<br/><span style={{background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Reimagined</span></h1>
        <p style={{color:"var(--txt2)",fontSize:"16px",lineHeight:1.8,maxWidth:"380px",marginBottom:"48px"}}>Connect with verified specialists. Book appointments instantly. Manage your complete health journey in one place.</p>
        {[{icon:"🩺",t:"500+ Verified Specialists"},{icon:"⚡",t:"Real-time Slot Booking"},{icon:"💊",t:"Digital Prescriptions"},{icon:"🔒",t:"Secure & Encrypted"}].map(f=>(
          <div key={f.t} style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"14px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"12px",background:"rgba(0,212,170,.1)",border:"1px solid rgba(0,212,170,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>{f.icon}</div>
            <span style={{color:"var(--txt2)",fontSize:"14px"}}>{f.t}</span>
          </div>
        ))}
      </div>
      {/* Right panel */}
      <div style={{width:"480px",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px",zIndex:1}}>
        <div className="glass" style={{width:"100%",padding:"48px 40px",borderRadius:"24px"}}>
          <h2 style={{fontSize:"28px",marginBottom:"6px"}}>Welcome back</h2>
          <p style={{color:"var(--txt2)",fontSize:"14px",marginBottom:"32px"}}>Sign in to your MediBook Pro account</p>
          <form onSubmit={handle}>
            <div style={{marginBottom:"18px"}}>
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
            </div>
            <div style={{marginBottom:"28px"}}>
              <label className="label">Password</label>
              <div style={{position:"relative"}}>
                <input className="input" type={showPw?"text":"password"} placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required style={{paddingRight:"48px"}}/>
                <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"18px",color:"var(--txt2)",padding:0,lineHeight:1}}>
                  {showPw?"🙈":"👁️"}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{width:"100%",padding:"14px",fontSize:"15px",borderRadius:"12px"}}>{loading?"Signing in...":"Sign In →"}</button>
          </form>
          <p style={{textAlign:"center",marginTop:"24px",color:"var(--txt2)",fontSize:"14px"}}>
            New here? <Link to="/register" style={{color:"var(--accent)",textDecoration:"none",fontWeight:600}}>Create account</Link>
          </p>
          <p style={{textAlign:"center",marginTop:"8px",color:"var(--txt2)",fontSize:"13px"}}>
            Are you a doctor? <Link to="/login" style={{color:"var(--gold)",textDecoration:"none",fontWeight:600}}>Login above with your doctor credentials</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
