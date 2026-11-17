(function(){
  var C=window.TT_CONFIG,P=window.TT_PRICE,KEY="tt_booking_v5";
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var S={service:"",bed:1,bath:1,sqft:"",htype:"",pets:"",addons:[],freq:"once",notes:"",urgent:false,date:"",time:"",street:"",unit:"",city:"",postal:"",access:"",name:"",email:"",phone:"",pref:"Text",casl:false};
  try{Object.assign(S,JSON.parse(localStorage.getItem(KEY)||"{}"))}catch(e){}
  S.casl=false; // consent is never pre-checked
  var q=new URLSearchParams(location.search);
  if(q.get("service")&&P.SERVICES[q.get("service")])S.service=q.get("service");
  if(q.get("bed")!==null&&!isNaN(+q.get("bed")))S.bed=Math.max(0,Math.min(5,+q.get("bed")));
  if(q.get("bath")!==null&&!isNaN(+q.get("bath")))S.bath=Math.max(1,Math.min(6,+q.get("bath")));
  var photos=[],step=1,N=5;
  function save(){try{var c=Object.assign({},S);delete c.casl;localStorage.setItem(KEY,JSON.stringify(c))}catch(e){}}
  function pad(n){return (n<10?"0":"")+n}
  function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function slotDate(ds,t){var a=ds.split("-"),b=t.split(":");return new Date(+a[0],a[1]-1,+a[2],+b[0],+b[1])}
  function t12(t){var h=+t.split(":")[0];return (h%12||12)+":00 "+(h<12?"AM":"PM")}
  function isHol(ds){return C.HOLIDAYS.indexOf(ds)>-1}
  function slotState(ds,t){var now=new Date(),d=slotDate(ds,t),hrs=(d-now)/36e5;if(hrs<2)return "past";if(hrs<C.LEAD_HOURS)return S.urgent?"urgent":"locked";return "open"}
  function niceDate(ds){var a=ds.split("-");return new Date(+a[0],a[1]-1,+a[2]).toLocaleDateString("en-CA",{weekday:"short",month:"short",day:"numeric"})}
  /* ---------- bind inputs ---------- */
  $$("input[name=service]").forEach(function(i){i.checked=i.value===S.service;i.addEventListener("change",function(){S.service=i.value;if(S.service!=="standard")S.freq="once";syncFreq();upd()})});
  $$("input[name=bed]").forEach(function(i){i.checked=+i.value===S.bed;i.addEventListener("change",function(){S.bed=+i.value;upd()})});
  $$("input[name=pets]").forEach(function(i){i.checked=i.value===S.pets;i.addEventListener("change",function(){S.pets=i.value;upd()})});
  var bo=$("#bath-out");
  $$(".stepper button").forEach(function(b){b.addEventListener("click",function(){S.bath=Math.max(1,Math.min(6,S.bath+ +b.dataset.d));upd()})});
  ["sqft","htype","notes","street","unit","city","postal","access","name","email","phone","pref"].forEach(function(k){var el=$("#"+k);if(!el)return;el.value=S[k]||"";el.addEventListener("input",function(){S[k]=el.value;if(k==="city"||k==="postal")area();upd()})});
  $$("input[name=addon]").forEach(function(i){i.checked=S.addons.indexOf(i.value)>-1;i.addEventListener("change",function(){S.addons=$$("input[name=addon]:checked").map(function(x){return x.value});upd()})});
  $$("input[name=freq]").forEach(function(i){i.addEventListener("change",function(){S.freq=i.value;upd()})});
  function syncFreq(){var std=S.service==="standard"||!S.service;$("#freq-wrap").hidden=!std;$("#freq-na").hidden=std;$$("input[name=freq]").forEach(function(i){i.checked=i.value===S.freq})}
  $("#casl").addEventListener("change",function(e){S.casl=e.target.checked});
  var ur=$("#urgent");ur.checked=!!S.urgent;ur.addEventListener("change",function(){S.urgent=ur.checked;if(S.date&&S.time&&slotState(S.date,S.time)==="locked"){S.time=""}renderCal();renderSlots();upd()});
  /* photos */
  var pin=$("#photos"),th=$("#thumbs");
  $("#drop").addEventListener("click",function(){pin.click()});
  $("#drop").addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();pin.click()}});
  pin.addEventListener("change",function(){Array.prototype.forEach.call(pin.files,function(f){if(photos.length<8&&/^image\//.test(f.type))photos.push(f)});pin.value="";drawThumbs()});
  function drawThumbs(){th.innerHTML="";photos.forEach(function(f,ix){var fig=document.createElement("figure");var im=document.createElement("img");im.src=URL.createObjectURL(f);im.alt="Uploaded photo "+(ix+1);var b=document.createElement("button");b.type="button";b.setAttribute("aria-label","Remove photo "+(ix+1));b.textContent="×";b.onclick=function(){photos.splice(ix,1);drawThumbs()};fig.appendChild(im);fig.appendChild(b);th.appendChild(fig)});$("#photo-count").textContent=photos.length?photos.length+" photo"+(photos.length>1?"s":"")+" added":"";upd()}
  /* ---------- calendar ---------- */
  var today=new Date();today.setHours(0,0,0,0);
  var view=new Date(today.getFullYear(),today.getMonth(),1);
  var maxD=new Date(today);maxD.setDate(maxD.getDate()+C.DAYS_AHEAD);
  function dayState(ds){var st=C.SLOTS.map(function(t){return slotState(ds,t)});if(st.indexOf("open")>-1)return "open";if(st.indexOf("urgent")>-1)return "urgent";if(st.indexOf("locked")>-1)return "locked";return "past"}
  function renderCal(){
    var cal=$("#cal");cal.innerHTML="";
    ["S","M","T","W","T","F","S"].forEach(function(d,i){var e=document.createElement("div");e.className="dow";e.setAttribute("aria-hidden","true");e.textContent=d;cal.appendChild(e)});
    $("#cal-label").textContent=view.toLocaleDateString("en-CA",{month:"long",year:"numeric"});
    var first=view.getDay(),days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
    for(var i=0;i<first;i++)cal.appendChild(document.createElement("span"));
    for(var d=1;d<=days;d++){
      var dt=new Date(view.getFullYear(),view.getMonth(),d),ds=iso(dt),b=document.createElement("button");
      b.type="button";b.className="day";b.textContent=d;b.dataset.d=ds;
      var lab=dt.toLocaleDateString("en-CA",{weekday:"long",month:"long",day:"numeric"});
      var s=dt<today||dt>maxD?"past":dayState(ds);
      if(s==="past"){b.disabled=true;lab+=", unavailable"}
      else if(s==="locked"){b.disabled=true;b.classList.add("locked");lab+=", within 72 hours, turn on Urgent to book"}
      else if(s==="urgent"){b.insertAdjacentHTML("beforeend",'<span class="urg" aria-hidden="true">⚡</span>');lab+=", urgent booking"}
      if(isHol(ds)){b.insertAdjacentHTML("beforeend",'<span class="hol" aria-hidden="true"></span>');lab+=", holiday, prepayment required"}
      b.setAttribute("aria-label",lab);b.setAttribute("aria-pressed",ds===S.date);
      b.addEventListener("click",function(){S.date=this.dataset.d;S.time="";renderCal();renderSlots();upd();var f=$("#slots button:not([disabled])");f&&f.focus()});
      cal.appendChild(b);
    }
    $("#cal-prev").disabled=view<=new Date(today.getFullYear(),today.getMonth(),1);
    $("#cal-next").disabled=new Date(view.getFullYear(),view.getMonth()+1,1)>maxD;
  }
  $("#cal-prev").addEventListener("click",function(){view.setMonth(view.getMonth()-1);renderCal()});
  $("#cal-next").addEventListener("click",function(){view.setMonth(view.getMonth()+1);renderCal()});
  function renderSlots(){
    var w=$("#slots");w.innerHTML="";
    if(!S.date){w.innerHTML='<p class="muted small" style="grid-column:1/-1">Pick a date to see arrival times.</p>';return}
    if(dayState(S.date)==="locked"||dayState(S.date)==="past"){S.date="";renderSlots();return}
    C.SLOTS.forEach(function(t){var s=slotState(S.date,t),b=document.createElement("button");b.type="button";b.innerHTML=t12(t);
      var lab=t12(t);
      if(t>=C.AFTER_HOURS_FROM){b.innerHTML+="<small>After-hours</small>";lab+=", after-hours premium applies"}
      else if(s==="urgent"){b.innerHTML+="<small>Urgent</small>";lab+=", urgent fee applies"}
      if(s==="past"||s==="locked"){b.disabled=true;lab+=", unavailable"}
      b.setAttribute("aria-label",lab);b.setAttribute("aria-pressed",t===S.time);
      b.addEventListener("click",function(){S.time=t;renderSlots();upd()});w.appendChild(b)});
  }
  /* ---------- service area ---------- */
  var FSA={Hamilton:/^L(8[A-Z]|9[ABCGHK]|0R)/,Burlington:/^L7[L-T]/,Oakville:/^L6[HJKLM]/,Cambridge:/^N(1[RST]|3[CEH])/};
  function area(){
    var el=$("#area"),pc=(S.postal||"").toUpperCase().replace(/\s/g,""),c=S.city;el.className="area-ok";
    if(c==="Other"){el.classList.add("maybe");el.textContent="We currently serve Hamilton, Burlington, Oakville, and Cambridge. Send your request and we'll let you know if we can reach you.";return}
    if(!c||pc.length<3){el.textContent="";return}
    var hit=Object.keys(FSA).some(function(k){return FSA[k].test(pc)});
    if(hit){el.classList.add("ok");el.textContent="✓ Great news, you're in our service area."}
    else{el.classList.add("maybe");el.textContent="We'll confirm this postal code is in our service area with your quote."}
  }
  /* ---------- summary ---------- */
  function flags(){
    var f=[];
    if(S.date&&S.time&&slotState(S.date,S.time)==="urgent")f.push("⚡ Urgent booking: urgent fee applies, confirmed in your quote.");
    else if(S.urgent)f.push("⚡ Urgent on: times within 72 hours unlocked. Urgent fee applies, confirmed in your quote.");
    if(S.date&&isHol(S.date))f.push("🎉 Holiday booking: prepayment required, holiday premium applies.");
    if(S.time&&S.time>=C.AFTER_HOURS_FROM)f.push("🌙 After 10 PM: after-hours premium applies, confirmed in your quote.");
    if(S.addons.length)f.push("✚ Add-ons are à la carte, subject to assessment.");
    return f;
  }
  function upd(){
    bo.textContent=S.bath+(S.bath===1?" bathroom":" bathrooms");
    var e=S.service?P.estimate(S):null;
    $$("[data-from]").forEach(function(x){var ee=P.estimate({service:x.dataset.from,bed:S.bed,bath:S.bath,sqft:S.sqft});x.textContent="from $"+ee.low});
    $("#sum-service").textContent=S.service?P.SERVICES[S.service].name:"Choose a service";
    $("#sum-home").textContent=P.BEDS[S.bed]+", "+S.bath+" bath"+(S.sqft?", "+S.sqft+" sq ft":"");
    $("#sum-addons").textContent=S.addons.length?S.addons.join(", "):"None";
    $("#sum-photos").textContent=photos.length?photos.length+" added":"Optional";
    $("#sum-freq").textContent=P.FREQ[S.freq].label+(P.FREQ[S.freq].pct&&S.service==="standard"?" ("+P.FREQ[S.freq].pct+"% off)":"");
    $("#sum-when").textContent=S.date?niceDate(S.date)+(S.time?", "+t12(S.time):", pick a time"):"Not chosen yet";
    $("#sum-where").textContent=S.city||"Not entered yet";
    var amt=e?(e.custom?"From $"+e.low:P.fmt(e)):"—";
    $("#sum-amt").textContent=amt;$("#m-amt").textContent=amt;
    var sv=$("#sum-save");if(e&&e.pct){sv.hidden=false;sv.textContent="You save "+e.pct+"% on every recurring visit (was $"+e.fullLow+" to $"+e.fullHigh+")."}else sv.hidden=true;
    var fl=$("#sum-flags");fl.innerHTML="";flags().forEach(function(t){var li=document.createElement("li");li.textContent=t;fl.appendChild(li)});
    var tn=$("#time-notes");tn.innerHTML="";flags().filter(function(t){return !/Add-ons/.test(t)}).forEach(function(t){var p=document.createElement("p");p.className="note warn";p.textContent=t;tn.appendChild(p)});
    save();
  }
  /* ---------- steps ---------- */
  function err(k,m){var el=$('.err-msg[data-for="'+k+'"]');if(el)el.textContent=m||"";var inp=$("#"+k);if(inp&&inp.setAttribute)inp.setAttribute("aria-invalid",!!m)}
  function validate(n){
    var ok=true,first=null;function bad(k,m,el){err(k,m);ok=false;if(!first)first=el||$("#"+k)}
    $$(".step.active .err-msg").forEach(function(x){x.textContent=""});
    if(n===1&&!S.service)bad("service","Choose a service to continue.",$("input[name=service]"));
    if(n===2&&S.sqft&&(+S.sqft<200||+S.sqft>15000))bad("sqft","Enter a size between 200 and 15,000 sq ft, or leave it blank.");
    if(n===4){if(!S.date)bad("date","Choose a date.",$("#cal button.day:not([disabled])"));else if(!S.time)bad("date","Choose an arrival time.",$("#slots button:not([disabled])"))}
    if(n===5){
      if(!S.street.trim())bad("street","Enter your street address.");
      if(!S.city)bad("city","Choose your city.");
      if(!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test((S.postal||"").trim()))bad("postal","Enter a valid postal code, like L8P 4R5.");
      if(!S.name.trim())bad("name","Enter your name.");
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(S.email||""))bad("email","Enter a valid email.");
      if((S.phone||"").replace(/\D/g,"").length<10)bad("phone","Enter a 10-digit phone number.");
      if(!$("#agree").checked)bad("agree","Please agree to the policies to send your request.",$("#agree"));
    }
    if(!ok&&first&&first.focus)first.focus();
    return ok;
  }
  var labels=["Service","Home","Extras","Time","Details"];
  function go(n,focus){
    step=n;$$(".step").forEach(function(s){s.classList.toggle("active",+s.dataset.step===n)});
    $$(".progress li").forEach(function(li,i){li.className=i+1<n?"done":(i+1===n?"cur":"");if(i+1===n)li.setAttribute("aria-current","step");else li.removeAttribute("aria-current")});
    $("#back").hidden=n===1;$("#m-back").hidden=n===1;
    var last=n===N;$("#next").textContent=last?"Send booking request":"Continue";$("#m-next").textContent=last?"Send request":"Continue";
    if(n===4){renderCal();renderSlots()}
    $("#step-status").textContent="Step "+n+" of "+N+": "+labels[n-1];
    if(focus){var h=$('.step[data-step="'+n+'"] h2');h&&h.focus();scrollTo({top:0,behavior:"smooth"})}
  }
  function next(){if(!validate(step))return;if(step<N)go(step+1,true);else submit()}
  function back(){if(step>1)go(step-1,true)}
  $("#next").addEventListener("click",next);$("#m-next").addEventListener("click",next);
  $("#back").addEventListener("click",back);$("#m-back").addEventListener("click",back);
  var sm=$(".summary");$("#m-est").addEventListener("click",function(){var o=sm.classList.toggle("open");this.setAttribute("aria-expanded",o)});
  /* ---------- submit ---------- */
  function submit(){
    var e=P.estimate(S),ref="TT-"+iso(new Date()).slice(2).replace(/-/g,"")+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
    var payload={_subject:"New booking request "+ref,ref:ref,service:P.SERVICES[S.service].name,bedrooms:P.BEDS[S.bed],bathrooms:S.bath,sqft:S.sqft,home_type:S.htype,pets:S.pets,addons:S.addons.join(", ")||"None",photos_attached:photos.length,frequency:P.FREQ[S.freq].label,date:S.date,time:t12(S.time),urgent:S.urgent?"Yes":"No",holiday:isHol(S.date)?"Yes":"No",after_hours:S.time>=C.AFTER_HOURS_FROM?"Yes":"No",estimate:P.fmt(e),address:S.street+(S.unit?" Unit "+S.unit:""),city:S.city,postal:S.postal,access:S.access,name:S.name,email:S.email,phone:S.phone,contact_preference:S.pref,notes:S.notes,marketing_consent_casl:S.casl?"Yes, opted in "+new Date().toISOString():"No",flags:flags().join(" | ")};
    $("#next").disabled=$("#m-next").disabled=true;
    TT_SEND(payload,"booking").then(function(live){
      $("#flow").hidden=true;$(".mbar").hidden=true;sm.classList.remove("open");
      var c=$("#confirm");c.hidden=false;$("#c-ref").textContent=ref;
      $("#c-sum").textContent=payload.service+", "+payload.bedrooms+", "+niceDate(S.date)+" at "+payload.time+". Estimated "+payload.estimate+".";
      $("#c-live").hidden=!live;$("#c-preview").hidden=live;$("#c-hol").hidden=!isHol(S.date);
      var h=$("#confirm h1");h.focus();scrollTo({top:0});
    });
  }
  syncFreq();area();go(1,false);upd();
})();
