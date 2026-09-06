import React,{useEffect,useState}from"react";import{useParams,useNavigate}from"react-router-dom";import{getAppointmentById,createPayment,getMyPayments}from"../services/api";import{toast}from"react-toastify";import Navbar from"../components/Navbar";

export function PayPage(){
  const{id}=useParams();const navigate=useNavigate();
  const[apt,setApt]=useState(null);const[method,setMethod]=useState("upi");const[coupon,setCoupon]=useState("");const[loading,setLoading]=useState(false);

  useEffect(()=>{getAppointmentById(id).then(r=>setApt(r.data.appointment)).catch(()=>toast.error("Appointment not found"));},[id]);

  const handlePay=async()=>{
    setLoading(true);
    try{await createPayment({appointmentId:id,method,couponCode:coupon||undefined});toast.success("✅ Payment successful! Appointment confirmed.");navigate("/dashboard");}
    catch(err){toast.error(err.response?.data?.message||"Payment failed");}
    finally{setLoading(false);}
  };

  if(!apt)return<div style={{background:"var(--bg)",minHeight:"100vh"}}><Navbar/><div className="spinner"/></div>;

  const tax=Math.round(apt.fee*0.18);
  const total=apt.fee+tax;

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh-bg"/><Navbar/>
      <div className="page" style={{maxWidth:"640px"}}>
        <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",color:"var(--txt2)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",marginBottom:"24px"}}>← Back</button>
        <h1 style={{fontSize:"28px",marginBottom:"6px"}}>Complete Payment</h1>
        <p style={{color:"var(--txt2)",fontSize:"14px",marginBottom:"28px"}}>Secure payment for your appointment</p>

        {/* Appointment summary */}
        <div className="glass" style={{padding:"24px",marginBottom:"24px",borderRadius:"18px"}}>
          <h4 style={{marginBottom:"14px",color:"var(--txt2)",fontSize:"13px",textTransform:"uppercase",letterSpacing:".5px"}}>Appointment Details</h4>
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
            <div>
              <div style={{fontWeight:700,fontSize:"16px",marginBottom:"4px"}}>Dr. {apt.doctor?.name}</div>
              <div style={{color:"var(--accent)",fontSize:"13px",marginBottom:"6px"}}>{apt.doctor?.specialty}</div>
              <div style={{fontSize:"13px",color:"var(--txt2)"}}>📅 {new Date(apt.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})} · {apt.timeSlot}</div>
            </div>
            <span className={`badge badge-${apt.status}`}>{apt.status}</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="glass" style={{padding:"24px",marginBottom:"24px",borderRadius:"18px"}}>
          <h4 style={{marginBottom:"16px"}}>Payment Method</h4>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"20px"}}>
            {[{id:"upi",icon:"📱",label:"UPI"},{id:"card",icon:"💳",label:"Card"},{id:"netbanking",icon:"🏦",label:"Net Banking"},{id:"cash",icon:"💵",label:"Cash at Clinic"}].map(m=>(
              <button key={m.id} onClick={()=>setMethod(m.id)} style={{padding:"14px",borderRadius:"12px",border:"1px solid",borderColor:method===m.id?"var(--accent)":"var(--border)",background:method===m.id?"rgba(0,212,170,.1)":"rgba(255,255,255,.03)",color:method===m.id?"var(--accent)":"var(--txt2)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",fontWeight:method===m.id?700:400,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:"all .2s"}}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
          <label className="label">Coupon Code</label>
          <div style={{display:"flex",gap:"10px"}}>
            <input className="input" placeholder="FIRST20 or SAVE50" value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} style={{flex:1}}/>
            <button className="btn btn-outline btn-sm" style={{borderRadius:"10px",whiteSpace:"nowrap"}} onClick={()=>coupon?toast.success("Coupon applied!"):toast.warning("Enter a coupon code")}>Apply</button>
          </div>
          {coupon==="FIRST20"&&<p style={{fontSize:"12px",color:"var(--success)",marginTop:"6px"}}>✅ 20% discount applied!</p>}
          {coupon==="SAVE50"&&<p style={{fontSize:"12px",color:"var(--success)",marginTop:"6px"}}>✅ ₹50 discount applied!</p>}
        </div>

        {/* Bill breakdown */}
        <div className="glass" style={{padding:"24px",marginBottom:"24px",borderRadius:"18px"}}>
          <h4 style={{marginBottom:"16px"}}>Bill Summary</h4>
          {[{l:"Consultation Fee",v:`₹${apt.fee}`},{l:"GST (18%)",v:`₹${tax}`},{l:"Discount",v:coupon==="FIRST20"?`-₹${Math.round(apt.fee*.2)}`:coupon==="SAVE50"?"-₹50":"₹0"}].map(r=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:"10px",fontSize:"14px"}}>
              <span style={{color:"var(--txt2)"}}>{r.l}</span><span>{r.v}</span>
            </div>
          ))}
          <div style={{borderTop:"1px solid var(--border)",paddingTop:"12px",display:"flex",justifyContent:"space-between",fontSize:"18px",fontWeight:700}}>
            <span>Total</span>
            <span style={{color:"var(--gold)"}}>₹{coupon==="FIRST20"?total-Math.round(apt.fee*.2):coupon==="SAVE50"?total-50:total}</span>
          </div>
        </div>

        <button className="btn btn-gold" onClick={handlePay} disabled={loading} style={{width:"100%",padding:"16px",fontSize:"16px",borderRadius:"14px"}}>
          {loading?"Processing...":"Pay & Confirm Appointment 🔒"}
        </button>
        <p style={{textAlign:"center",marginTop:"12px",fontSize:"12px",color:"var(--txt3)"}}>🔒 Secure · Encrypted · Instant Confirmation</p>
      </div>
    </div>
  );
}

export function PaymentsHistory(){
  const[payments,setPayments]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{getMyPayments().then(r=>{setPayments(r.data.payments);setLoading(false);}).catch(()=>setLoading(false));},[]);
  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh-bg"/><Navbar/>
      <div className="page">
        <h1 style={{fontSize:"28px",marginBottom:"6px"}}>Payment History</h1>
        <p style={{color:"var(--txt2)",fontSize:"14px",marginBottom:"28px"}}>Your complete transaction records</p>
        {loading?<div className="spinner"/>:payments.length===0?(
          <div style={{textAlign:"center",padding:"80px",color:"var(--txt2)"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>💳</div><p>No payment records found.</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {payments.map(p=>(
              <div key={p._id} className="glass" style={{padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:"15px",marginBottom:"3px"}}>{p.doctor?.name||"—"}</div>
                  <div style={{fontSize:"13px",color:"var(--txt2)",marginBottom:"4px"}}>{p.doctor?.specialty}</div>
                  <div style={{display:"flex",gap:"12px",fontSize:"12px",color:"var(--txt2)"}}>
                    <span>🧾 {p.receipt}</span>
                    <span>💳 {p.method?.toUpperCase()}</span>
                    <span>📅 {new Date(p.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"20px",fontWeight:700,color:p.status==="success"?"var(--gold)":"var(--danger)",marginBottom:"6px"}}>₹{p.amount}</div>
                  <span className={`badge badge-${p.status==="success"?"confirmed":"cancelled"}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
