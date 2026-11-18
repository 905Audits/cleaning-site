(function(){
  document.documentElement.classList.remove("no-js");
  var h=document.querySelector(".site-header");
  function onS(){h&&h.classList.toggle("scrolled",scrollY>8)}
  addEventListener("scroll",onS,{passive:true});onS();
  var mb=document.querySelector(".menu-btn"),nl=document.querySelector(".nav-links");
  if(mb&&nl){mb.addEventListener("click",function(){var o=nl.classList.toggle("open");mb.setAttribute("aria-expanded",o)});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"&&nl.classList.contains("open")){nl.classList.remove("open");mb.setAttribute("aria-expanded","false");mb.focus()}})}
  var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els=document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window&&!rm){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});els.forEach(function(el){io.observe(el)})}
  else els.forEach(function(el){el.classList.add("in")});
  var bb=document.querySelector(".bubbles");
  if(bb&&!rm){for(var i=0;i<14;i++){var b=document.createElement("i");var s=10+Math.random()*46;b.style.cssText="width:"+s+"px;height:"+s+"px;left:"+(Math.random()*100)+"%;animation-duration:"+(9+Math.random()*12)+"s;animation-delay:"+(-Math.random()*20)+"s";bb.appendChild(b)}}
  /* quick quote */
  var qq=document.getElementById("qq");
  if(qq&&window.TT_PRICE){
    var st={service:"standard",bed:1,bath:1};
    var out=qq.querySelector(".qq-price b"),go=qq.querySelector("#qq-go");
    function upd(){var e=TT_PRICE.estimate(st);out.textContent=(e.custom?"From $"+e.low:TT_PRICE.fmt(e));
      go.href="book.html?service="+st.service+"&bed="+st.bed+"&bath="+st.bath}
    qq.querySelectorAll(".qq-tabs button").forEach(function(b){b.addEventListener("click",function(){qq.querySelectorAll(".qq-tabs button").forEach(function(x){x.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed","true");st.service=b.dataset.s;upd()})});
    qq.querySelector("#qq-bed").addEventListener("change",function(e){st.bed=+e.target.value;upd()});
    qq.querySelector("#qq-bath").addEventListener("change",function(e){st.bath=+e.target.value;upd()});
    upd();
  }
  /* generic forms (contact, cleaner application) */
  document.querySelectorAll("form[data-tt-form]").forEach(function(f){
    f.addEventListener("submit",function(ev){
      ev.preventDefault();
      var bad=null;f.querySelectorAll("[required]").forEach(function(i){var ok=i.type==="checkbox"?i.checked:i.value.trim()!==""&&i.checkValidity();i.setAttribute("aria-invalid",!ok);if(!ok&&!bad)bad=i});
      var msg=f.querySelector(".form-status");
      if(bad){bad.focus();msg.textContent="Please complete the highlighted fields.";return}
      var data={};new FormData(f).forEach(function(v,k){data[k]=v});data._subject="Tap & Tidy: "+f.dataset.ttForm;
      TT_SEND(data,f.dataset.ttForm).then(function(live){f.reset();msg.innerHTML=live?"<strong>Thank you.</strong> We received your message and will reply soon.":"<strong>Preview mode:</strong> online forms open soon. Your details were saved on this device only and were not sent.";msg.focus()});
    });
  });

  /* see-us-in-action: poster first, lazy-play in view, respect reduced motion */
  var clips=document.querySelectorAll(".js-action-video");
  if(clips.length){
    if(rm){
      clips.forEach(function(v){
        var img=v.parentNode.querySelector(".action-poster");
        if(img){img.alt=v.getAttribute("aria-label")||"";img.removeAttribute("aria-hidden")}
      });
    }else{
      function playSafe(v){var p=v.play();if(p&&p.catch)p.catch(function(){})}
      function syncBtn(v){
        var btn=v.parentNode.querySelector(".action-toggle");
        if(!btn)return;
        var paused=v.paused;
        btn.classList.toggle("is-paused",paused);
        btn.setAttribute("aria-label",paused?"Play video":"Pause video");
      }
      if("IntersectionObserver" in window){
        var vio=new IntersectionObserver(function(es){
          es.forEach(function(e){
            var v=e.target;
            if(e.isIntersecting) playSafe(v);
            else v.pause();
            syncBtn(v);
          });
        },{threshold:.35});
        clips.forEach(function(v){vio.observe(v)});
      }else{clips.forEach(playSafe)}
      clips.forEach(function(v){
        var media=v.parentNode, btn=media.querySelector(".action-toggle");
        v.addEventListener("playing",function(){media.classList.add("is-ready");syncBtn(v)});
        v.addEventListener("pause",function(){syncBtn(v)});
        if(btn){
          btn.hidden=false;
          btn.addEventListener("click",function(){
            if(v.paused) playSafe(v); else v.pause();
            syncBtn(v);
          });
          syncBtn(v);
        }
      });
    }
  }
})();
window.TT_SEND=function(data,kind){
  var C=window.TT_CONFIG||{};
  try{var k="tt_"+kind+"_log";var a=JSON.parse(localStorage.getItem(k)||"[]");a.push(Object.assign({at:new Date().toISOString()},data));localStorage.setItem(k,JSON.stringify(a.slice(-10)))}catch(e){}
  if(!C.FORM_ENDPOINT)return Promise.resolve(false);
  return fetch(C.FORM_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(data)}).then(function(r){return r.ok}).catch(function(){return false});
};
