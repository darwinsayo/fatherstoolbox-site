// Renders event lists from /events.json. Used by /events/ (all parishes, with a filter)
// and by each parish page (set data-parish="<slug>" on the #event-list element).
(function(){
  var list=document.getElementById('event-list'); if(!list) return;
  var only=list.getAttribute('data-parish'), filter=document.getElementById('parish-filter');
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  fetch('/events.json').then(function(r){return r.json()}).then(function(d){
    var names={};d.parishes.forEach(function(p){names[p.slug]=p});
    var today=new Date().toISOString().slice(0,10);
    var evs=d.events.filter(function(e){return !e.hidden&&e.date>=today&&(!only||e.parish===only)}).sort(function(a,b){return a.date<b.date?-1:1});
    if(filter){d.parishes.forEach(function(p){var o=document.createElement('option');o.value=p.slug;o.textContent=p.name+', '+p.place;filter.appendChild(o)});
      var q=new URLSearchParams(location.search).get('parish');if(q)filter.value=q;}
    function draw(){
      var f=filter?filter.value:'';
      var rows=evs.filter(function(e){return !f||e.parish===f});
      list.innerHTML=rows.length?rows.map(function(e){var p=names[e.parish]||{name:e.parish,place:''};
        return '<article class="ev-card"><p class="rubric"><a href="/parishes/'+esc(e.parish)+'/" style="text-decoration:none">'+esc(p.name)+'</a>'+(p.place?' &middot; '+esc(p.place):'')+'</p><h2><a href="/parishes/'+esc(e.parish)+'/events/'+esc(e.slug)+'/">'+esc(e.title)+'</a></h2><p class="ev-when">'+esc(e.when)+'<br>'+esc(e.where)+'</p><p>'+esc(e.summary)+'</p><a class="btn btn-plain" href="/parishes/'+esc(e.parish)+'/events/'+esc(e.slug)+'/">Details'+(e.rsvp?' and RSVP':'')+'</a></article>'}).join('')
        :'<p class="ev-empty">No upcoming events right now. Please check back soon.</p>';
    }
    if(filter)filter.addEventListener('change',draw);
    draw();
  }).catch(function(){list.innerHTML='<p class="ev-empty">Events could not be loaded. Please try again in a moment.</p>'});
})();
