/* Liturgical season for today (Roman Rite, general calendar as observed in the United States).
   Epiphany is kept on the Sunday between January 2 and 8; the Baptism of the Lord follows it. */
(function(){
  function easter(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
  function add(d,n){var r=new Date(d);r.setDate(r.getDate()+n);return r}
  function advent1(y){var d=new Date(y,11,3);return add(d,-d.getDay())}            // Sunday between Nov 27 and Dec 3
  function baptism(y){var d=new Date(y,0,8),ep=add(d,-d.getDay());                 // Epiphany: Sunday between Jan 2 and 8
    return ep.getDate()>=7?add(ep,1):add(ep,7)}
  function season(t){
    var y=t.getFullYear(),e=easter(y),ash=add(e,-46),holyThu=add(e,-3),pent=add(e,49);
    if(t>=new Date(y,11,25)) return ["Christmas","white"];
    if(t>=advent1(y)) return ["Advent","violet"];
    if(t<=baptism(y)) return ["Christmas","white"];
    if(t<ash) return ["Ordinary Time","green"];
    if(t<holyThu) return ["Lent","violet"];
    if(t<e) return ["The Sacred Paschal Triduum",+t===+add(e,-2)?"red":"white"];
    if(+t===+pent) return ["Pentecost Sunday","red"];
    if(t<pent) return ["Easter","white"];
    return ["Ordinary Time","green"];
  }
  var n=new Date(),today=new Date(n.getFullYear(),n.getMonth(),n.getDate()),s=season(today);
  if(typeof module!=="undefined"){module.exports={season:season,easter:easter};return}
  document.documentElement.dataset.season=s[1];
  document.querySelectorAll("[data-season-name]").forEach(function(el){el.textContent=s[0]});
  // Draw this liturgical year to scale (First Sunday of Advent to the next), with a marker for today.
  var bar=document.querySelector(".yearbar");
  if(bar){
    var y=today>=advent1(today.getFullYear())?today.getFullYear():today.getFullYear()-1,
        a0=advent1(y),a1=advent1(y+1),Y=y+1,e=easter(Y),
        cuts=[[a0,"violet","Advent"],[new Date(y,11,25),"white","Christmas"],[add(baptism(Y),1),"green","Ordinary Time"],[add(e,-46),"violet","Lent"],[add(e,-3),"tri","Triduum"],[e,"white","Easter"],[add(e,50),"green","Ordinary Time"],[a1]],
        span=a1-a0,html="";
    for(var i=0;i<cuts.length-1;i++){
      var w=(cuts[i+1][0]-cuts[i][0])/span*100;
      html+='<span class="seg seg-'+cuts[i][1]+'" style="width:'+w.toFixed(3)+'%" title="'+cuts[i][2]+'"></span>';
    }
    var pct=(today-a0)/span*100;html+='<span class="today'+(pct>80?' flip':'')+'" style="left:'+pct.toFixed(3)+'%"><b>Today</b></span>';
    bar.innerHTML=html;
  }
  document.querySelectorAll("[data-season-key]").forEach(function(el){if(s[0].indexOf(el.dataset.seasonKey)>-1)el.classList.add("now")});
})();
