import React,{useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import "./style.css";

const API="http://localhost:5000/api";
const groups=["All","A+","A-","B+","B-","AB+","AB-","O+","O-"];

function Icon({name}) {
 const icons={drop:"🩸",search:"🔎",heart:"❤",shield:"🛡️",map:"📍",users:"👥",alert:"🚨",check:"✓",arrow:"→",phone:"☎",calendar:"📅",menu:"☰"};
 return <span className="icon">{icons[name]||"•"}</span>
}

function App(){
 const [page,setPage]=useState("home");
 const [donors,setDonors]=useState([]);
 const [requests,setRequests]=useState([]);
 const [filter,setFilter]=useState("All");
 const [city,setCity]=useState("");
 const [query,setQuery]=useState("");
 const [loading,setLoading]=useState(true);
 const [toast,setToast]=useState("");
 const [mobile,setMobile]=useState(false);

 const load=async()=>{
   try{
    const [d,r]=await Promise.all([fetch(API+"/donors"),fetch(API+"/requests")]);
    setDonors(await d.json()); setRequests(await r.json());
   }catch(e){ setToast("Backend not connected. Make sure npm start is running."); }
   finally{setLoading(false)}
 };
 useEffect(()=>{load()},[]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),3000);return()=>clearTimeout(t)}},[toast]);

 const filtered=useMemo(()=>donors.filter(d=>
   (filter==="All"||d.bloodGroup===filter) &&
   (!city||d.city.toLowerCase().includes(city.toLowerCase())) &&
   (!query||(`${d.name} ${d.city} ${d.bloodGroup}`).toLowerCase().includes(query.toLowerCase()))
 ),[donors,filter,city,query]);

 const stats={
   donors:donors.length,
   available:donors.filter(d=>d.available).length,
   requests:requests.length,
   lives:requests.filter(r=>r.status==="Fulfilled").length
 };

 const go=p=>{setPage(p);setMobile(false);window.scrollTo({top:0,behavior:"smooth"})};

 return <div className="app">
  {toast&&<div className="toast">{toast}</div>}
  <header className="nav">
   <div className="brand" onClick={()=>go("home")}><div className="brandIcon"><Icon name="drop"/></div><div><b>Blood<span>Connect</span></b><small>Community</small></div></div>
   <button className="menuBtn" onClick={()=>setMobile(!mobile)}><Icon name="menu"/></button>
   <nav className={mobile?"open":""}>
    {["home","find","request","register","dashboard"].map((p,i)=><button key={p} className={page===p?"active":""} onClick={()=>go(p)}>{["Home","Find Donor","Emergency Request","Become a Donor","Dashboard"][i]}</button>)}
   </nav>
   <button className="navCta" onClick={()=>go("request")}>Need Blood <Icon name="arrow"/></button>
  </header>

  {page==="home"&&<Home go={go} stats={stats} requests={requests}/>}
  {page==="find"&&<Find donors={filtered} filter={filter} setFilter={setFilter} city={city} setCity={setCity} query={query} setQuery={setQuery} loading={loading} go={go}/>}
  {page==="request"&&<RequestForm setToast={setToast} reload={load}/>}
  {page==="register"&&<RegisterForm setToast={setToast} reload={load}/>}
  {page==="dashboard"&&<Dashboard donors={donors} requests={requests} stats={stats} go={go}/>}
  <footer><div className="footerBrand"><div className="brandIcon"><Icon name="drop"/></div><b>BloodConnect</b></div><p>Connecting willing donors with people who need blood — safely, quickly and locally.</p><div className="footerGrid"><span>Emergency Support</span><span>Donor Community</span><span>Verified Requests</span><span>© 2026 BloodConnect</span></div></footer>
 </div>
}

function Home({go,stats,requests}){
 return <main>
  <section className="hero">
   <div className="heroText"><div className="eyebrow"><span>●</span> COMMUNITY POWERED • EMERGENCY READY</div>
    <h1>One donation can<br/><em>save a life.</em></h1>
    <p>BloodConnect helps patients and families find suitable blood donors faster during emergencies — right in their community.</p>
    <div className="heroBtns"><button className="primary" onClick={()=>go("find")}>Find a Donor <Icon name="arrow"/></button><button className="secondary" onClick={()=>go("register")}>Become a Donor</button></div>
    <div className="trust"><div><b>24/7</b><small>Emergency support</small></div><div><b>8+</b><small>Blood groups</small></div><div><b>100%</b><small>Community driven</small></div></div>
   </div>
   <div className="heroCard"><div className="pulse">🩸</div><div className="heroCardTitle">Every drop matters</div><div className="miniStats"><span><b>{stats.available}</b><small>Donors available</small></span><span><b>{stats.requests}</b><small>Requests posted</small></span></div><div className="live"><span className="liveDot"></span> Live community activity</div></div>
  </section>

  <section className="stats section"><Stat icon="users" value={stats.donors.toLocaleString()} label="Registered Donors"/><Stat icon="check" value={stats.available.toLocaleString()} label="Available Now"/><Stat icon="alert" value={stats.requests.toLocaleString()} label="Blood Requests"/><Stat icon="heart" value={stats.lives.toLocaleString()} label="Successful Matches"/></section>

  <section className="section intro"><div className="sectionHead"><div><span className="eyebrow">HOW IT HELPS</span><h2>From emergency to connection.</h2></div><p>Simple technology that brings donors, receivers and communities together when every minute matters.</p></div>
   <div className="featureGrid"><Feature n="01" icon="search" title="Search suitable donors" text="Filter by blood group and city to find donors who may be available nearby."/><Feature n="02" icon="alert" title="Post an emergency" text="Share blood group, hospital, location and required units with the community."/><Feature n="03" icon="shield" title="Connect responsibly" text="Requests and donor profiles are structured to make communication clear and safer."/><Feature n="04" icon="heart" title="Build a donor community" text="Track contributions, encourage repeat donors and celebrate life-saving support."/></div>
  </section>

  <section className="section emergency"><div className="sectionHead"><div><span className="eyebrow">URGENT NEEDS</span><h2>Recent blood requests</h2></div><button className="textBtn" onClick={()=>go("request")}>Post a request <Icon name="arrow"/></button></div>
   <div className="requestGrid">{requests.slice(0,3).map(r=><RequestCard key={r.id} r={r}/>)}</div>
   {requests.length===0&&<div className="empty">No emergency requests yet.</div>}
  </section>
  <section className="impact"><div><span className="eyebrow">THE IDEA</span><h2>Technology should help people when they need it most.</h2></div><p>BloodConnect is designed as a social-impact full-stack application where real-time community information can reduce the time spent searching for a suitable donor.</p><button className="secondary light" onClick={()=>go("dashboard")}>Explore dashboard <Icon name="arrow"/></button></section>
 </main>
}

function Stat({icon,value,label}){return <div className="stat"><Icon name={icon}/><div><b>{value}</b><small>{label}</small></div></div>}
function Feature({n,icon,title,text}){return <article className="feature"><div className="featureTop"><span>{n}</span><Icon name={icon}/></div><h3>{title}</h3><p>{text}</p></article>}
function RequestCard({r}){return <article className="requestCard"><div className="requestTop"><span className="bloodBadge">{r.bloodGroup}</span><span className={r.urgency==="Critical"?"critical":"urgent"}>{r.urgency||"Urgent"}</span></div><h3>{r.patient||"Blood required"}</h3><p>📍 {r.hospital}, {r.city}</p><div className="requestBottom"><span>{r.units} unit(s) required</span><span>{r.status||"Open"}</span></div></article>}

function Find({donors,filter,setFilter,city,setCity,query,setQuery,loading,go}){
 return <main className="page"><div className="pageHero"><span className="eyebrow">DONOR NETWORK</span><h1>Find a blood donor</h1><p>Search the community by blood group, city or donor name.</p></div>
 <section className="searchPanel"><div className="searchInput"><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search donor name, city..."/></div><input value={city} onChange={e=>setCity(e.target.value)} placeholder="📍 City / Area"/><button className="primary" onClick={()=>{}}>Search</button></section>
 <section className="section"><div className="filterRow"><h2>Available donors</h2><div className="pills">{groups.map(g=><button key={g} className={filter===g?"selected":""} onClick={()=>setFilter(g)}>{g}</button>)}</div></div>
 {loading?<div className="empty">Loading donors...</div>:<div className="donorGrid">{donors.map(d=><DonorCard key={d.id} d={d} go={go}/>)}</div>}
 {!loading&&donors.length===0&&<div className="empty">No donors match your search. Try another blood group or city.</div>}
 </section></main>
}

function DonorCard({d,go}){
 return <article className="donorCard"><div className="avatar">{d.name?.charAt(0)||"D"}</div><div className="donorInfo"><div className="donorName"><h3>{d.name}</h3><span className={d.available?"available":"offline"}>● {d.available?"Available":"Unavailable"}</span></div><p>🩸 <b>{d.bloodGroup}</b> &nbsp; • &nbsp; 📍 {d.city}</p><p className="muted">Age {d.age} • Last donation: {d.lastDonation||"Not provided"}</p></div><button className="outline" onClick={()=>go("request")}>Request</button></article>
}

function RequestForm({setToast,reload}){
 const [form,setForm]=useState({patient:"",bloodGroup:"A+",units:1,hospital:"",city:"Nashik",contact:"",urgency:"Critical",notes:""});
 const change=e=>setForm({...form,[e.target.name]:e.target.value});
 const submit=async e=>{e.preventDefault();try{const r=await fetch(API+"/requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});if(!r.ok)throw Error();setToast("Emergency request posted successfully!");setForm({...form,patient:"",hospital:"",contact:"",notes:""});reload()}catch{setToast("Could not post request. Check backend.")}};
 return <main className="page"><div className="pageHero"><span className="eyebrow">EMERGENCY BLOOD REQUEST</span><h1>Need blood urgently?</h1><p>Share clear request details so suitable community donors can respond quickly.</p></div>
 <form className="formCard" onSubmit={submit}><div className="formHeader"><div className="roundIcon">🚨</div><div><h2>Request blood</h2><p>Fill in the patient and hospital details.</p></div></div>
 <div className="formGrid"><Field name="patient" label="Patient / Case name" value={form.patient} onChange={change} required/><Field name="hospital" label="Hospital name" value={form.hospital} onChange={change} required/><Field name="city" label="City" value={form.city} onChange={change} required/><Field name="contact" label="Contact number" value={form.contact} onChange={change} required/><label>Blood group<select name="bloodGroup" value={form.bloodGroup} onChange={change}>{groups.slice(1).map(g=><option key={g}>{g}</option>)}</select></label><label>Units required<input type="number" min="1" max="20" name="units" value={form.units} onChange={change}/></label><label>Urgency<select name="urgency" value={form.urgency} onChange={change}><option>Critical</option><option>Urgent</option><option>Normal</option></select></label><label>Additional note<input name="notes" value={form.notes} onChange={change} placeholder="Ward, timing, special instructions..."/></label></div>
 <div className="notice">🛡️ For real emergencies, always contact the hospital/blood bank directly as well. BloodConnect is a community coordination platform.</div><button className="primary big" type="submit">Post Emergency Request <Icon name="arrow"/></button></form></main>
}

function RegisterForm({setToast,reload}){
 const [form,setForm]=useState({name:"",age:18,bloodGroup:"O+",city:"Nashik",phone:"",available:true,lastDonation:""});
 const change=e=>setForm({...form,[e.target.name]:e.target.type==="checkbox"?e.target.checked:e.target.value});
 const submit=async e=>{e.preventDefault();try{const r=await fetch(API+"/donors",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});if(!r.ok)throw Error();setToast("Welcome to BloodConnect! Donor profile added.");setForm({...form,name:"",phone:"",lastDonation:""});reload()}catch{setToast("Could not register donor. Check backend.")}};
 return <main className="page"><div className="pageHero"><span className="eyebrow">JOIN THE COMMUNITY</span><h1>Become a donor</h1><p>Your small contribution can become someone's second chance.</p></div>
 <form className="formCard" onSubmit={submit}><div className="formHeader"><div className="roundIcon">❤</div><div><h2>Create donor profile</h2><p>Only add information you are comfortable sharing.</p></div></div>
 <div className="formGrid"><Field name="name" label="Full name" value={form.name} onChange={change} required/><Field name="age" label="Age" type="number" value={form.age} onChange={change} required/><label>Blood group<select name="bloodGroup" value={form.bloodGroup} onChange={change}>{groups.slice(1).map(g=><option key={g}>{g}</option>)}</select></label><Field name="city" label="City / Area" value={form.city} onChange={change} required/><Field name="phone" label="Contact number" value={form.phone} onChange={change} required/><Field name="lastDonation" label="Last donation date" type="date" value={form.lastDonation} onChange={change}/></div>
 <label className="check"><input type="checkbox" name="available" checked={form.available} onChange={change}/> I am currently available to be contacted for blood donation.</label>
 <div className="notice">🩺 Donating blood should always be done through an authorized blood bank or medical facility and according to medical eligibility rules.</div><button className="primary big" type="submit">Join as Donor <Icon name="heart"/></button></form></main>
}
function Field({name,label,value,onChange,type="text",required=false}){return <label>{label}<input name={name} type={type} value={value} onChange={onChange} required={required}/></label>}

function Dashboard({donors,requests,stats,go}){
 const byGroup=groups.slice(1).map(g=>({g,n:donors.filter(d=>d.bloodGroup===g).length}));
 return <main className="page"><div className="pageHero dashHero"><span className="eyebrow">COMMUNITY DASHBOARD</span><h1>BloodConnect overview</h1><p>Statistics from the connected MongoDB database.</p></div>
 <section className="dashStats"><Stat icon="users" value={stats.donors.toLocaleString()} label="Registered donors"/><Stat icon="check" value={stats.available.toLocaleString()} label="Available donors"/><Stat icon="alert" value={stats.requests.toLocaleString()} label="Requests"/><Stat icon="heart" value={stats.lives.toLocaleString()} label="Successful matches"/></section>
 <section className="dashboardGrid"><div className="panel"><div className="panelHead"><h2>Blood group availability</h2><span>Local donors</span></div>{byGroup.map(x=><div className="barRow" key={x.g}><b>{x.g}</b><div className="bar"><i style={{width:`${Math.min(100,20+x.n*12)}%`}}></i></div><span>{x.n}</span></div>)}</div>
 <div className="panel"><div className="panelHead"><h2>Emergency activity</h2><button className="textBtn" onClick={()=>go("request")}>New request</button></div>{requests.slice(0,5).map(r=><div className="activity" key={r.id}><span className="bloodBadge small">{r.bloodGroup}</span><div><b>{r.patient}</b><small>{r.hospital}, {r.city}</small></div><span className={r.status==="Fulfilled"?"statusDone":"statusOpen"}>{r.status||"Open"}</span></div>)}</div></section>
 <section className="adminNote"><div><h2>For the final college project</h2><p>This dashboard can later be connected to authentication, MongoDB/Firebase, map APIs, OTP verification and an admin moderation system.</p></div><button className="primary" onClick={()=>go("register")}>Add donor</button></section>
 </main>
}

createRoot(document.getElementById("root")).render(<App/>);
