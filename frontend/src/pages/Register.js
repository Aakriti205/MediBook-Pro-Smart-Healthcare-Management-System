import React,{useState}from"react";import{Link,useNavigate}from"react-router-dom";import{sendOTP,verifyOTP,resendOTP}from"../services/api";import{useAuth}from"../context/AuthContext";import{toast}from"react-toastify";
export function Register(){
  const[step,setStep]=useState(1); // 1=form, 2=otp
  const[form,setForm]=useState({name:"",email:"",password:"",phone:"",age:"",gender:""});
  const[otp,setOtp]=useState(["","","","","",""]);
  const[loading,setLoading]=useState(false);const[showPw,setShowPw]=useState(false);
  const[resendTimer,setResendTimer]=useState(0);
  const{login}=useAuth();const navigate=useNavigate();

  const startTimer=()=>{setResendTimer(30);const t=setInterval(()=>{setResendTimer(s=>{if(s<=1){clearInterval(t);return 0;}return s-1;});},1000);};

  const handleSendOTP=async e=>{
    e.preventDefault();setLoading(true);
    try{
      const{data}=await sendOTP(form);
      toast.success(data.message);
      if(data.devOtp){toast.info(`Dev OTP: ${data.devOtp}`,{autoClose:30000});}
      setStep(2);startTimer();
    }catch(err){toast.error(err.response?.data?.message||"Failed to send OTP");}
    finally{setLoading(false);}
  };

  const handleOtpChange=(val,idx)=>{
    if(!/^\d*$/.test(val))return;
    const next=[...otp];next[idx]=val.slice(-1);setOtp(next);
    if(val&&idx<5)document.getElementById(`otp-${idx+1}`)?.focus();
  };

  const handleOtpKey=(e,idx)=>{
    if(e.key==="Backspace"&&!otp[idx]&&idx>0)document.getElementById(`otp-${idx-1}`)?.focus();
  };

  const handleVerify=async e=>{
    e.preventDefault();
    const code=otp.join("");
    if(code.length!==6){toast.warning("Enter all 6 digits");return;}
    setLoading(true);
    try{
      const{data}=await verifyOTP({email:form.email,otp:code});
      login(data.user,data.token,data.refreshToken);
      toast.success("Account verified! Welcome to MediBook Pro 🎉");
      navigate("/dashboard");
    }catch(err){toast.error(err.response?.data?.message||"Invalid OTP");}
    finally{setLoading(false);}
  };

  const handleResend=async()=>{
    if(resendTimer>0)return;
    try{
      const{data}=await resendOTP({email:form.email});
      toast.success("OTP resent!");
      if(data.devOtp)toast.info(`Dev OTP: ${data.devOtp}`,{autoClose:30000});
      startTimer();setOtp(["","","","","",""]);
    }catch(err){toast.error(err.response?.data?.message||"Failed");}
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",padding:"40px 20px",background:"var(--bg)"}}>
      <div className="mesh-bg"/>
      <div style={{width:"100%",maxWidth:"520px",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:700,background:"linear-gradient(135deg,var(--accent),var(--accent2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:"10px"}}>✦ MediBook Pro</div>
          {step===1?<><h2 style={{fontSize:"30px",marginBottom:"6px"}}>Create your account</h2><p style={{color:"var(--txt2)",fontSize:"14px"}}>Join thousands managing their health smarter</p></>
          :<><h2 style={{fontSize:"28px",marginBottom:"6px"}}>Verify your email</h2><p style={{color:"var(--txt2)",fontSize:"14px"}}>We sent a 6-digit OTP to <strong style={{color:"var(--accent)"}}>{form.email}</strong></p></>}
        </div>

        <div className="glass" style={{padding:"40px",borderRadius:"24px"}}>
          {step===1?(
            <form onSubmit={handleSendOTP}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                <div style={{gridColumn:"1/-1"}}><label className="label">Full Name</label><input className="input" placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                <div style={{gridColumn:"1/-1"}}><label className="label">Email Address</label><input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
                <div style={{gridColumn:"1/-1"}}>
                  <label className="label">Password</label>
                  <div style={{position:"relative"}}>
                    <input className="input" type={showPw?"text":"password"} placeholder="Min. 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required style={{paddingRight:"48px"}}/>
                    <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"18px",color:"var(--txt2)",padding:0}}>
                      {showPw?"🙈":"👁️"}
                    </button>
                  </div>
                </div>
                <div><label className="label">Phone</label><input className="input" placeholder="Phone number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
                <div><label className="label">Age</label><input className="input" type="number" placeholder="Age" value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/></div>
                <div style={{gridColumn:"1/-1"}}><label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                    <option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{width:"100%",padding:"14px",fontSize:"15px",borderRadius:"12px",marginTop:"24px"}}>{loading?"Sending OTP...":"Send OTP →"}</button>
            </form>
          ):(
            <form onSubmit={handleVerify}>
              {/* OTP boxes */}
              <div style={{display:"flex",gap:"10px",justifyContent:"center",marginBottom:"28px"}}>
                {otp.map((d,i)=>(
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e=>handleOtpChange(e.target.value,i)} onKeyDown={e=>handleOtpKey(e,i)}
                    style={{width:"52px",height:"60px",textAlign:"center",fontSize:"24px",fontWeight:700,background:"rgba(255,255,255,.06)",border:`2px solid ${d?"var(--accent)":"var(--border)"}`,borderRadius:"12px",color:"var(--txt)",outline:"none",fontFamily:"monospace",caretColor:"var(--accent)",transition:"border-color .2s"}}
                    onFocus={e=>e.target.style.borderColor="var(--accent)"} onBlur={e=>e.target.style.borderColor=d?"var(--accent)":"var(--border)"}
                  />
                ))}
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading||otp.join("").length<6} style={{width:"100%",padding:"14px",fontSize:"15px",borderRadius:"12px",marginBottom:"16px"}}>{loading?"Verifying...":"Verify & Create Account ✓"}</button>
              <div style={{textAlign:"center"}}>
                <button type="button" onClick={handleResend} disabled={resendTimer>0} style={{background:"none",border:"none",color:resendTimer>0?"var(--txt3)":"var(--accent)",cursor:resendTimer>0?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"14px"}}>
                  {resendTimer>0?`Resend OTP in ${resendTimer}s`:"Resend OTP"}
                </button>
              </div>
              <button type="button" onClick={()=>{setStep(1);setOtp(["","","","","",""]);}} style={{display:"block",margin:"12px auto 0",background:"none",border:"none",color:"var(--txt2)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"13px"}}>← Change email/details</button>
            </form>
          )}
          <p style={{textAlign:"center",marginTop:"20px",color:"var(--txt2)",fontSize:"14px"}}>Already have an account? <Link to="/login" style={{color:"var(--accent)",textDecoration:"none",fontWeight:600}}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
