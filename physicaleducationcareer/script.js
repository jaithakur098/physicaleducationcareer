document.addEventListener('DOMContentLoaded',()=>{
  const t=document.querySelector('.menu-toggle'),m=document.querySelector('.mobile-nav');
  if(t&&m)t.addEventListener('click',()=>m.classList.toggle('open'));

  const io=new IntersectionObserver((ents)=>{
    ents.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  },{threshold:.12});

  document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));

  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=+el.dataset.count,suffix=el.dataset.suffix||'';
    new IntersectionObserver(([e],obs)=>{
      if(!e.isIntersecting)return;
      let cur=0,step=Math.max(1,Math.floor(target/60));
      const iv=setInterval(()=>{
        cur+=step;
        if(cur>=target){
          cur=target;
          clearInterval(iv);
        }
        el.textContent=cur.toLocaleString()+suffix;
      },25);
      obs.disconnect();
    },{threshold:.5}).observe(el);
  });

  document.querySelectorAll('.lead-form').forEach(f=>{
    f.addEventListener('submit',(e)=>{
      e.preventDefault();
      const d=Object.fromEntries(new FormData(f).entries());
      const msg=`Hi, I am ${d.name||''} (${d.phone||''}). Interested in ${d.course||'admission guidance'}. ${d.message||''}`;
      window.open('https://wa.me/919828320688?text='+encodeURIComponent(msg),'_blank');
      f.reset();
      alert('Thank you! We will contact you shortly on WhatsApp.');
    });
  });
});
