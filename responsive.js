'use strict';
(() => {
 let queued=false;
 function refresh(){
  queued=false;
  document.querySelectorAll('#main table').forEach(table=>{
   if(table.parentElement.classList.contains('responsive-table'))return;
   const wrap=document.createElement('div');wrap.className='responsive-table';
   table.before(wrap);wrap.append(table);
  });
  document.querySelectorAll('#main .bit-scroll,#main .teach-scene,#main .hex-visual,#main .responsive-table').forEach(region=>{
   const overflow=region.scrollWidth>region.clientWidth+3;
   let cue=region.previousElementSibling;
   if(!cue||!cue.classList.contains('scroll-cue')){cue=document.createElement('p');cue.className='scroll-cue';cue.textContent='↔ 左右滑動這個區域，可查看完整內容';cue.hidden=true;region.before(cue)}
   cue.hidden=!overflow;
   region.tabIndex=overflow?0:-1;
   if(overflow){region.setAttribute('role','region');region.setAttribute('aria-label','可左右滑動的教學內容')}
  });
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(refresh)}}
 const main=document.getElementById('main');
 new MutationObserver(schedule).observe(main,{childList:true,subtree:true});
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 if('ResizeObserver' in window)new ResizeObserver(schedule).observe(main);
 schedule();
})();
