import React,{useEffect,useState}from"react";import{useNavigate}from"react-router-dom";import{getDoctors,getSpecialties}from"../services/api";import{toast}from"react-toastify";import Navbar from"../components/Navbar";
const sIcon={Cardiologist:"❤️",Neurologist:"🧠",Dermatologist:"✨","Orthopedic Surgeon":"🦴",Gynecologist:"🌸",Pediatrician:"👶",default:"🩺"};

export default function Doctors(){
  const[docs,setDocs]=useState([]);const[specialties,setSpecialties]=useState([]);
  const[loading,setLoading]=useState(true);const[search,setSearch]=useState({name:"",location:"",locality:""});
  const[filters,setFilters]=useState({specialty:"",minRating:"",maxFee:"",available:""});
  const[page,setPage]=useState(1);const[total,setTotal]=useState(0);const[pages,setPages]=useState(1);
  const navigate=useNavigate();

  const fetch=async(p=1)=>{
    setLoading(true);
    try{
      const params={...search,...filters,page:p,limit:9};
      if(search.locality)params.locality=search.locality;
      const{data}=await getDoctors(params);
      setDocs(data.doctors);setTotal(data.total);setPages(data.pages);setPage(p);
    }catch{toast.error("Failed to load doctors");}
    finally{setLoading(false);}
  };

  useEffect(()=>{fetch();getSpecialties().then(r=>setSpecialties(r.data.specialties)).catch(()=>{});},[]);

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh"}}>
      <div className="mesh-bg"/><Navbar/>
      <div className="page">
        {/* Header */}
        <div style={{marginBottom:"32px"}} className="fade-up">
          <h1 className="section-title">Find Your <span>Specialist</span></h1>
          <p style={{color:"var(--txt2)",fontSize:"15px"}}>{total} verified doctors across all specialties</p>
        </div>

        {/* Search + filter bar */}
        <div className="glass" style={{padding:"20px",marginBottom:"24px",display:"flex",gap:"12px",flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:2,minWidth:"160px"}}>
            <label className="label">Search by Name</label>
            <input className="input" placeholder="🔍 Dr. name..." value={search.name} onChange={e=>setSearch({...search,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&fetch()}/>
          </div>
          <div style={{flex:1,minWidth:"140px"}}>
            <label className="label">Locality / Area</label>
            <input className="input" placeholder="📍 Area (e.g. Banjara Hills)" value={search.locality||""} onChange={e=>setSearch({...search,locality:e.target.value})}/>
          </div>
          <div style={{flex:1,minWidth:"140px"}}>
            <label className="label">City</label>
            <input className="input" placeholder="🏙 City..." value={search.location} onChange={e=>setSearch({...search,location:e.target.value})}/>
          </div>
          <div style={{flex:1,minWidth:"140px"}}>
            <label className="label">Max Fee (₹)</label>
            <input className="input" type="number" placeholder="Any" value={filters.maxFee} onChange={e=>setFilters({...filters,maxFee:e.target.value})}/>
          </div>
          <div style={{flex:1,minWidth:"120px"}}>
            <label className="label">Min Rating</label>
            <select className="input" value={filters.minRating} onChange={e=>setFilters({...filters,minRating:e.target.value})}>
              <option value="">Any</option>
              {[3,3.5,4,4.5].map(r=><option key={r} value={r}>{r}+ ⭐</option>)}
            </select>
          </div>
          <div style={{flex:1,minWidth:"120px"}}>
            <label className="label">Availability</label>
            <select className="input" value={filters.available} onChange={e=>setFilters({...filters,available:e.target.value})}>
              <option value="">All</option>
              <option value="true">Available Now</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={()=>fetch(1)} style={{padding:"13px 24px",borderRadius:"10px",alignSelf:"flex-end"}}>Search</button>
          <button className="btn btn-outline btn-sm" onClick={()=>{setSearch({name:"",location:""});setFilters({specialty:"",minRating:"",maxFee:"",available:""});setTimeout(()=>fetch(1),50);}} style={{alignSelf:"flex-end",borderRadius:"10px",padding:"13px 16px"}}>Reset</button>
        </div>

        {/* Specialty pills */}
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"28px"}}>
          {["All",...specialties].map(s=>(
            <button key={s} onClick={()=>{const v=s==="All"?"":s;setFilters(f=>({...f,specialty:v}));setTimeout(()=>fetch(1),50);}} style={{padding:"8px 18px",borderRadius:"50px",border:"1px solid",borderColor:filters.specialty===(s==="All"?"":s)?"var(--accent)":"var(--border)",background:filters.specialty===(s==="All"?"":s)?"rgba(0,212,170,.15)":"transparent",color:filters.specialty===(s==="All"?"":s)?"var(--accent)":"var(--txt2)",fontFamily:"'DM Sans',sans-serif",fontSize:"13px",cursor:"pointer",transition:"all .2s",fontWeight:filters.specialty===(s==="All"?"":s)?600:400}}>
              {s!=="All"?(sIcon[s]||"🩺")+" ":""}{s}
            </button>
          ))}
        </div>

        {/* Doctor cards */}
        {loading?<div className="spinner"/>:docs.length===0?(
          <div style={{textAlign:"center",padding:"80px",color:"var(--txt2)"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>🔍</div>
            <p>No doctors found. Try adjusting your filters.</p>
          </div>
        ):(
          <>
            <div className="card-grid card-grid-3" style={{marginBottom:"32px"}}>
              {docs.map((doc,i)=>(
                <div key={doc._id} className="glass fade-up" style={{animationDelay:`${i*.06}s`,padding:"24px",borderRadius:"20px",cursor:"pointer",position:"relative",overflow:"hidden"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,212,170,.4)";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 16px 40px rgba(0,0,0,.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
                  {/* availability dot */}
                  <div style={{position:"absolute",top:"18px",right:"18px",width:"10px",height:"10px",borderRadius:"50%",background:doc.isAvailable?"var(--accent)":"var(--danger)",boxShadow:doc.isAvailable?"0 0 8px var(--accent)":"none"}}/>
                  {doc.isVerified&&<div style={{position:"absolute",top:"14px",right:"32px",fontSize:"12px"}}>✅</div>}

                  <div style={{display:"flex",gap:"14px",marginBottom:"16px",alignItems:"center"}}>
                    <div style={{width:"58px",height:"58px",borderRadius:"16px",background:"linear-gradient(135deg,rgba(0,212,170,.2),rgba(0,100,200,.2))",border:"1px solid rgba(0,212,170,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",flexShrink:0}}>
                      {sIcon[doc.specialty]||sIcon.default}
                    </div>
                    <div>
                      <div style={{fontWeight:700,fontSize:"16px",marginBottom:"2px"}}>{doc.name}</div>
                      <div style={{color:"var(--accent)",fontSize:"12px",fontWeight:500}}>{doc.specialty}</div>
                      {doc.subSpecialty&&<div style={{color:"var(--txt2)",fontSize:"11px"}}>{doc.subSpecialty}</div>}
                    </div>
                  </div>

                  <div style={{fontSize:"12px",color:"var(--txt2)",marginBottom:"4px"}}>🏥 {doc.hospital}</div>
                  <div style={{fontSize:"12px",color:"var(--txt2)",marginBottom:"4px"}}>📍 {doc.locality||doc.location}</div>
                  <div style={{fontSize:"11px",color:"var(--txt3)",marginBottom:"12px"}}>🏙 {doc.location}</div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"18px"}}>
                    {[{l:"Experience",v:`${doc.experience||"N/A"} yrs`},{l:"Rating",v:`⭐ ${doc.rating} (${doc.totalReviews})`},{l:"Patients",v:doc.totalPatients?.toLocaleString()},{l:"Fee",v:`₹${doc.consultationFee}`}].map(info=>(
                      <div key={info.l} style={{background:"rgba(255,255,255,.04)",borderRadius:"10px",padding:"10px 12px"}}>
                        <div style={{fontSize:"10px",color:"var(--txt3)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:"2px"}}>{info.l}</div>
                        <div style={{fontSize:"13px",fontWeight:500}}>{info.v}</div>
                      </div>
                    ))}
                  </div>

                  {doc.languages?.length>0&&<div style={{fontSize:"11px",color:"var(--txt2)",marginBottom:"14px"}}>🗣️ {doc.languages.join(" · ")}</div>}

                  <div style={{display:"flex",gap:"8px"}}>
                    <button className="btn btn-outline" style={{flex:1,padding:"9px",borderRadius:"10px",fontSize:"13px"}} onClick={()=>navigate(`/doctors/${doc._id}`)}>View Profile</button>
                    <button className="btn btn-primary" style={{flex:1,padding:"9px",borderRadius:"10px",fontSize:"13px"}} onClick={()=>navigate(`/book/${doc._id}`)}>Book →</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pages>1&&(
              <div style={{display:"flex",justifyContent:"center",gap:"8px"}}>
                {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                  <button key={p} onClick={()=>fetch(p)} style={{width:"36px",height:"36px",borderRadius:"8px",border:"1px solid",borderColor:page===p?"var(--accent)":"var(--border)",background:page===p?"rgba(0,212,170,.15)":"transparent",color:page===p?"var(--accent)":"var(--txt2)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:"13px"}}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
