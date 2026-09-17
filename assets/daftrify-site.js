(()=>{
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const top=document.getElementById('top'), menuToggle=document.getElementById('menuToggle'), mobileMenu=document.getElementById('mobileMenu');
const searchBtn=document.getElementById('searchBtn'), searchPanel=document.getElementById('searchPanel'), searchClose=document.getElementById('searchClose'), searchInput=document.getElementById('searchInput'), searchResults=document.getElementById('searchResults');
const themeBtn=document.getElementById('themeBtn');
const words=[...document.querySelectorAll('.word')], reveals=[...document.querySelectorAll('.reveal')];
const sections=[...document.querySelectorAll('main section[id]')];

words.forEach((el,i)=>setTimeout(()=>el.classList.add('in'),reduced?0:120+i*100));
if(reduced){reveals.forEach(el=>el.classList.add('in'))}else{
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});
 reveals.forEach(el=>io.observe(el));
}

function navState(){top?.classList.toggle('scrolled',window.scrollY>18)}
window.addEventListener('scroll',navState,{passive:true});navState();

const navLinks=[...document.querySelectorAll('.top nav a')];
const linkMap=new Map(navLinks.map(a=>[a.getAttribute('href')?.slice(1),a]));
const navIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.remove('active'));linkMap.get(e.target.id)?.classList.add('active')}}),{rootMargin:'-35% 0px -55% 0px',threshold:0});
sections.forEach(s=>navIO.observe(s));

function closeMenu(){mobileMenu?.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false');if(menuToggle)menuToggle.textContent='☰'}
menuToggle?.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.textContent=open?'×':'☰'});
mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));

function closeSearch(){searchPanel?.classList.remove('open');if(searchInput)searchInput.value='';if(searchResults)searchResults.innerHTML=''}
searchBtn?.addEventListener('click',()=>{searchPanel?.classList.add('open');setTimeout(()=>searchInput?.focus(),40)});
searchClose?.addEventListener('click',closeSearch);
searchPanel?.addEventListener('click',e=>{if(e.target===searchPanel)closeSearch()});
const searchable=[...document.querySelectorAll('main section[id]')].map(s=>({id:s.id,title:s.querySelector('h1,h2')?.textContent.replace(/\s+/g,' ').trim()||s.id,text:s.textContent.replace(/\s+/g,' ').trim()}));
searchInput?.addEventListener('input',()=>{const q=searchInput.value.trim().toLowerCase();if(!q){searchResults.innerHTML='';return}const hits=searchable.filter(x=>(x.title+' '+x.text).toLowerCase().includes(q)).slice(0,7);searchResults.innerHTML=hits.length?hits.map(x=>`<a href="#${x.id}">${x.title}</a>`).join(''):'<span class="mono" style="color:#777">NO MATCHES</span>';searchResults.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeSearch))});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSearch();closeMenu()}});

const saved=localStorage.getItem('daftrify-theme');
if(saved==='dark')document.body.classList.add('dark');
themeBtn?.addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('daftrify-theme',document.body.classList.contains('dark')?'dark':'light')});

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(!id||id==='#')return;const target=document.querySelector(id);if(!target)return;e.preventDefault();target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})}));

const stage=document.querySelector('.hero-stage');
if(stage&&!reduced){const sheets=[...stage.querySelectorAll('.paper-sheet')];stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;sheets.forEach((s,i)=>{const factor=(i-2)*1.8;s.style.marginLeft=`${x*factor}px`;s.style.marginTop=`${y*factor}px`})});stage.addEventListener('pointerleave',()=>sheets.forEach(s=>{s.style.marginLeft='';s.style.marginTop=''}))}

const dossier=document.querySelector('.dossier');
if(dossier&&!reduced){const cards=[...dossier.querySelectorAll('.dossier-card')];dossier.addEventListener('pointermove',e=>{const r=dossier.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;cards.forEach((c,i)=>{c.style.translate=`${x*(i%2?5:-5)}px ${y*(i%2?4:-4)}px`})});dossier.addEventListener('pointerleave',()=>cards.forEach(c=>c.style.translate=''))}

const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
})();