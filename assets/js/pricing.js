/* Draft estimate model. Estimated price only; the final quote is confirmed before booking. */
(function(){
  var STD=[[150,170],[150,190],[200,260],[260,340],[340,420],[400,500]];
  var MOVE=[[320,370],[350,400],[400,470],[470,560],[540,650],[620,740]];
  var BATHS=[1,1,2,2,3,3];
  var SQFT=[600,800,1200,1800,2600,3400];
  var FREQ={once:{label:"One-time",pct:0},weekly:{label:"Weekly",pct:15},biweekly:{label:"Every 2 weeks",pct:12},monthly:{label:"Monthly",pct:10}};
  var SERVICES={standard:{name:"Standard clean"},deep:{name:"Deep clean"},move:{name:"Move-in or move-out"}};
  function r5(n){return Math.round(n/5)*5}
  function estimate(o){
    var bed=Math.max(0,Math.min(5,o.bed|0)), bath=Math.max(1,+o.bath||1), sq=+o.sqft||0;
    var base=(o.service==="move"?MOVE:STD)[bed].slice();
    var extra=Math.max(0,bath-BATHS[bed])*30;
    var over=sq>SQFT[bed]?Math.round((sq-SQFT[bed])/100)*10:0;
    var lo=base[0]+extra+over, hi=base[1]+extra+over;
    if(o.service==="deep"){lo*=1.4;hi*=1.4}
    var pct=(o.service==="standard"&&FREQ[o.freq])?FREQ[o.freq].pct:0;
    var dlo=r5(lo*(1-pct/100)), dhi=r5(hi*(1-pct/100));
    return {low:dlo,high:dhi,fullLow:r5(lo),fullHigh:r5(hi),pct:pct,custom:(bed>=5||sq>4500)};
  }
  function fmt(e){return "$"+e.low+(e.high!==e.low?" to $"+e.high:"")}
  window.TT_PRICE={estimate:estimate,fmt:fmt,FREQ:FREQ,SERVICES:SERVICES,
    BEDS:["Studio","1 bedroom","2 bedrooms","3 bedrooms","4 bedrooms","5+ bedrooms"]};
})();
