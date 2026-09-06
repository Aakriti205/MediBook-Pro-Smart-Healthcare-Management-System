import React,{useEffect,useState}from"react";import{useParams,useNavigate}from"react-router-dom";import{getDoctorById,getAvailableSlots,bookAppointment}from"../services/api";import{toast}from"react-toastify";import Navbar from"../components/Navbar";
const sIcon={Cardiologist:"❤️",Neurologist:"🧠",Dermatologist:"✨","Orthopedic Surgeon":"🦴",Gynecologist:"🌸",Pediatrician:"👶",default:"🩺"};

export default function BookAppointment(){
  const{id}=useParams();const navigate=useNavigate();
  const[doc,setDoc]=useState(null);const[form,setForm]=useState({date:"",timeSlot:"",reason:"",symptoms:"",type:"new",mode:"in-person"});
  const[slots,setSlots]=useState([]);const[bookedSlots,setBookedSlots]=useState([]);const[loading,setLoading]=useState(false);

  useEffect(()=>{getDoctorById(id).then(r=>setDoc(r.data.doctor)).catch(()=>toast.error("Doctor not found"));},[id]);

  useEffect(()=>{
    if(form.date&&id){
      getAvailableSlots(id,form.date).then(r=>{setSlots(r.data.available);setBookedSlots(r.data.booked);setForm(f=>({...f,timeSlot:""}));}).catch(()=>{});
    }
  },[form.date,id]);

  const handleSubmit=async e=>{
    e.preventDefault();if(!form.timeSlot){toast.warning("Please select a time slot");return;}
    setLoading(true);
    try{
      const payload={doctorId:id,...form,symptoms:form.symptoms?form.symptoms.split(",").map(s=>s.trim()):[]};
      await bookAppointment(payload);
      toast.success("🎉 Appointment booked successfully!");navigate("/dashboard");
    }catch(err){toast.error(err.response?.data?.message||"Booking failed");}
    finally{setLoading(false);}
  };

  if(!doc)return<div style={{background:"var(--bg)",minHeight:"100vh"}}><Navbar/><div className="spinner"/></div>;

  const fee=form.type==="followup"?doc.followUpFee:doc.consultationFee;

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh-bg"/><Navbar/>
      <div className="page" style={{maxWidth:"780px"}}>
        <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",color:"var(--txt2)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:"14px",marginBottom:"24px",display:"flex",alignItems:"center",gap:"6px"}}>← Back to doctors</button>

        {/* Doctor card */}
        <div className="glass fade-up" style={{padding:"28px",marginBottom:"24px",display:"flex",gap:"24px",alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{width:"78px",height:"78px",borderRadius:"20px",background:"linear-gradient(135deg,rgba(0,212,170,.25),rgba(0,100,200,.25))",border:"1px solid rgba(0,212,170,.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"34px",flexShrink:0}}>
            {sIcon[doc.specialty]||sIcon.default}
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px"}}>
              <h2 style={{fontSize:"24px"}}>{doc.name}</h2>
              {doc.isVerified&&<span style={{fontSize:"12px",background:"rgba(0,212,170,.15)",color:"var(--accent)",padding:"2px 10px",borderRadius:"50px",border:"1px solid rgba(0,212,170,.3)"}}>✅ Verified</span>}
            </div>
            <div style={{color:"var(--accent)",fontSize:"14px",fontWeight:500,marginBottom:"8px"}}>{doc.specialty}{doc.subSpecialty&&` · ${doc.subSpecialty}`} · {doc.hospital}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"14px",marginBottom:"10px"}}>
              {[{t:"📍",v:doc.location},{t:"🎓",v:`${doc.experience} yrs`},{t:"⭐",v:`${doc.rating}/5 (${doc.totalReviews} reviews)`},{t:"👥",v:`${doc.totalPatients?.toLocaleString()} patients`}].map(d=>(
                <span key={d.t} style={{fontSize:"13px",color:"var(--txt2)"}}>{d.t} {d.v}</span>
              ))}
            </div>
            {doc.qualifications?.length>0&&(
              <div style={{display:"flex",gap:"7px",flexWrap:"wrap"}}>
                {doc.qualifications.map(q=><span key={q} style={{padding:"3px 10px",background:"rgba(0,212,170,.1)",border:"1px solid rgba(0,212,170,.2)",borderRadius:"50px",fontSize:"11px",color:"var(--accent)"}}>{q}</span>)}
              </div>
            )}
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:"11px",color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:"4px"}}>Consultation Fee</div>
            <div style={{fontSize:"34px",fontWeight:700,fontFamily:"'Playfair Display',serif",background:"linear-gradient(135deg,var(--gold),#e8952a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>₹{fee}</div>
            {doc.consultationType?.online&&<div style={{fontSize:"11px",color:"var(--info)",marginTop:"4px"}}>🎥 Online available</div>}
          </div>
        </div>

        {/* Booking form */}
        <div className="glass fade-up" style={{padding:"36px",borderRadius:"24px"}}>
          <h3 style={{fontSize:"22px",marginBottom:"6px"}}>Book Your Appointment</h3>
          <p style={{color:"var(--txt2)",fontSize:"14px",marginBottom:"28px"}}>Choose your preferred date, time and appointment type</p>
          <form onSubmit={handleSubmit}>
            <div className="card-grid card-grid-2" style={{marginBottom:"20px"}}>
              <div>
                <label className="label">Appointment Type</label>
                <select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  <option value="new">New Visit (₹{doc.consultationFee})</option>
                  <option value="followup">Follow-up (₹{doc.followUpFee})</option>
                  {/* <option value="emergency">Emergency</option> */}
                </select>
              </div>
              <div>
                <label className="label">Mode</label>
                <select className="input" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}>
                  <option value="in-person">In-Person</option>
                  {doc.consultationType?.online&&<option value="online">Online (Video Call)</option>}
                </select>
              </div>
            </div>

            <div style={{marginBottom:"20px"}}>
              <label className="label">Select Date</label>
              <input className="input" type="date" value={form.date} min={new Date().toISOString().split("T")[0]} onChange={e=>setForm({...form,date:e.target.value})} required/>
            </div>

            {/* Time slots */}
            {form.date&&(
              <div style={{marginBottom:"20px"}}>
                <label className="label">Select Time Slot {slots.length>0&&`(${slots.length} available)`}</label>
                {slots.length===0&&bookedSlots.length===0?(
                  <p style={{color:"var(--txt2)",fontSize:"13px",padding:"16px",background:"rgba(255,255,255,.03)",borderRadius:"10px",border:"1px solid var(--border)"}}>
                    {new Date(...form.date.split("-").map(Number)).toLocaleDateString("en-US",{weekday:"long"})==="Sunday"
                      ? "Sundays are not available. Please choose another date."
                      : "No slots available for this date. Please try another date."}
                  </p>
                ):(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px"}}>
                    {[...slots,...bookedSlots].sort().map(slot=>{
                      const isBooked=bookedSlots.includes(slot);
                      return(
                        <button key={slot} type="button" disabled={isBooked} onClick={()=>!isBooked&&setForm({...form,timeSlot:slot})} style={{padding:"12px 8px",borderRadius:"12px",border:"1px solid",borderColor:isBooked?"var(--border)":form.timeSlot===slot?"var(--accent)":"var(--border)",background:isBooked?"rgba(255,77,109,.05)":form.timeSlot===slot?"rgba(0,212,170,.15)":"rgba(255,255,255,.03)",color:isBooked?"var(--txt3)":form.timeSlot===slot?"var(--accent)":"var(--txt2)",fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:form.timeSlot===slot?700:400,cursor:isBooked?"not-allowed":"pointer",transition:"all .2s",textDecoration:isBooked?"line-through":"none"}}>
                          {slot}{isBooked&&" ✗"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{marginBottom:"20px"}}>
              <label className="label">Reason for Visit</label>
              <textarea className="input" rows={3} placeholder="Describe your concern or symptoms..." value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} style={{resize:"vertical"}}/>
            </div>

            <div style={{marginBottom:"28px"}}>
              <label className="label">Symptoms <span style={{color:"var(--txt3)",textTransform:"none",fontWeight:400}}>(comma separated)</span></label>
              <input className="input" placeholder="e.g. headache, fever, fatigue" value={form.symptoms} onChange={e=>setForm({...form,symptoms:e.target.value})}/>
            </div>

            {/* Summary */}
            {form.date&&form.timeSlot&&(
              <div style={{background:"rgba(0,212,170,.07)",border:"1px solid rgba(0,212,170,.2)",borderRadius:"14px",padding:"18px 20px",marginBottom:"24px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
                <div>
                  <div style={{fontSize:"11px",color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:"4px"}}>Appointment Summary</div>
                  <div style={{fontSize:"14px"}}>{new Date(form.date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {form.timeSlot}</div>
                  <div style={{fontSize:"12px",color:"var(--txt2)",marginTop:"3px",textTransform:"capitalize"}}>{form.type} visit · {form.mode}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"11px",color:"var(--txt2)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:"4px"}}>Fee</div>
                  <div style={{fontSize:"22px",fontWeight:700,color:"var(--gold)"}}>₹{fee}</div>
                </div>
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading||!form.date||!form.timeSlot} style={{width:"100%",padding:"15px",fontSize:"16px",borderRadius:"14px"}}>
              {loading?"Confirming...":"Confirm Appointment →"}
            </button>
          </form>
        </div>

        {/* Doctor About + Reviews */}
        {(doc.about||doc.reviews?.length>0)&&(
          <div className="glass fade-up" style={{padding:"28px",marginTop:"20px",borderRadius:"20px"}}>
            {doc.about&&<><h4 style={{marginBottom:"12px",color:"var(--accent)"}}>About</h4><p style={{color:"var(--txt2)",fontSize:"14px",lineHeight:1.8,marginBottom:doc.reviews?.length>0?"24px":"0"}}>{doc.about}</p></>}
            {doc.reviews?.length>0&&(
              <>
                <h4 style={{marginBottom:"14px",color:"var(--accent)"}}>Patient Reviews</h4>
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  {doc.reviews.slice(0,3).map((r,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:"12px",padding:"14px 16px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                        <span style={{fontWeight:600,fontSize:"14px"}}>{r.patient?.name||"Anonymous"}</span>
                        <span style={{color:"var(--gold)",fontSize:"13px"}}>{"⭐".repeat(r.rating)}</span>
                      </div>
                      {r.comment&&<p style={{color:"var(--txt2)",fontSize:"13px"}}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
