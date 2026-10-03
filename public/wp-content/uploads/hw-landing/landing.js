/* The Life Transformation Program — landing
   Generato da landing/costruisci.py.
   Va dopo il runtime Webflow e le tre copie di GSAP. */

/* Partire anche se il documento e gia pronto.
   Il codice del Webflow si agganciava a DOMContentLoaded. Basta che
   un plugin di ottimizzazione aggiunga defer agli script — e sul
   sito c e WP Fastest Cache — perche partano dopo che quell evento
   e gia passato: il listener non scatta mai e il motore resta fermo
   senza dire niente. Qui si controlla prima. */
function hwPronto(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

/* marcatori su <html>: accendono la guardia .fade */
!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

/* scorrimento continuo */
/* scorrimento continuo

   La rotella non produce un movimento continuo: produce salti discreti, un
   centinaio di pixel alla volta. Il video segue lo scroll, quindi ne
   eredita i gradini. Mascherarli smorzando il video e' cio' che introduceva
   il ritardo: si scambiava uno scatto con una lentezza.

   Qui si rende continuo lo scroll stesso, e il video puo' seguirlo senza
   smorzamento. Ne guadagnano anche le animazioni dei testi, agganciate
   allo stesso ScrollTrigger.

   Chi ha chiesto meno movimento non lo riceve: sotto prefers-reduced-motion
   la libreria non parte affatto e lo scorrimento resta quello del sistema. */
window.__hwLenis = null;
(function () {
  if (!window.Lenis || !window.gsap) { return; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

  var lenis = new Lenis({ duration: 1.1, smoothWheel: true, syncTouch: false });
  window.__hwLenis = lenis;

  if (window.ScrollTrigger) { lenis.on('scroll', ScrollTrigger.update); }
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
})();


/* motore dell'hero */
hwPronto(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  gsap.registerPlugin(ScrollTrigger);
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  const vA = document.getElementById('hero-video-a');
  const trigger      = document.querySelector('.scene-hero');
  const endEl        = document.querySelector('.content-wrapper');
  const sceneTitle   = document.querySelector('.scene-title');
  const titleWrap    = document.querySelector('.scene-title .title-wrapper') || sceneTitle;
  const scrollCue    = document.querySelector('.scroll-down_wrapper');
  const overlayLayer = document.querySelector('.video-overlay-layer');
  if (!vA || !trigger || !endEl) return;

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===================== PARAMETRI =====================
  const NARRATIVE = { introEnd: 4, loopStart: 4, loopEnd: 7, diveEnd: 12, journeyEnd: 20 };
  const LOOP_RATE = 1;
  const SMOOTH = isTouch ? 0.20 : 0.15;
  const SCRUB_SMOOTH = 1;      /* nessuno smorzamento: lo scroll e continuo */
  const FRAME_MIN = 1 / 48;    /* mezzo fotogramma a 24fps */
  const HARD_RESYNC = 6;
  const IDLE_DELAY = 250;
  const CUE_TIME = 3, UNLOCK_TIME = 3.5;
  const AUTOSCROLL_DUR = 1.6;
  const TITOLO_DOPO = 2.0;
  const SBOCCIO_DA = 0.86;      /* da quanto piccolo parte il testo */
  const SBOCCIO_DURATA = 1.8;  /* quanto dura l'apertura */
  const VOLO_DURATA = 2.8;     /* quanto dura il volo verso la prima scena */
  const SCROLL_DA = 3.0;       /* quando lo scroll si sblocca */
  /* Parte pronta, arriva piano. Non e' simmetrica: la salita ha
     esponente 2 e la discesa 3, quindi il volo si stacca subito
     ma consuma l'ultimo quarto di strada nell'ultimo quarto di
     tempo. Una curva a due rami avrebbe uno scalino di velocita'
     a meta'; questa e' liscia dappertutto. */
  function VOLO_CURVA(t){
    var a = t * t, b = (1 - t) * (1 - t) * (1 - t);
    return a + b === 0 ? t : a / (a + b);
  }
  // =====================================================

  let active = vA;
  let appliedRate = 1, lastScrollTs = -99999;
  let cueShown = false, cueHidden = false, unlocked = false, autoScrolled = false;

  let TITLE_TOP_P = 0.2, JOURNEY_SPLIT = 0.4;
  function computeSplit(){
    if (sceneTitle && endEl.offsetHeight > 0){
      const top = sceneTitle.getBoundingClientRect().top + window.scrollY;
      const h = endEl.offsetHeight;
      TITLE_TOP_P   = gsap.utils.clamp(0, 0.9, top / h);
      JOURNEY_SPLIT = gsap.utils.clamp(TITLE_TOP_P + 0.02, 0.98, (top + sceneTitle.offsetHeight) / h);
    }
  }
  computeSplit();
  ScrollTrigger.addEventListener('refresh', computeSplit);

  vA.loop = false;
  active.style.opacity = '1';
  if (scrollCue) scrollCue.style.opacity = '0';
  if (overlayLayer) overlayLayer.style.opacity = '0';

  function setRate(r){
    const safe = Math.max(0.0625, Math.min(16, r));
    if (Math.abs(active.playbackRate - safe) > 0.01){ try { active.playbackRate = safe; } catch(e){} }
  }

  function ambientLoop(){
    if (active.paused && !overlay) active.play().catch(()=>{});
    if (active.currentTime >= NARRATIVE.loopEnd){
      active.currentTime = NARRATIVE.loopStart;
    }
    appliedRate = gsap.utils.interpolate(appliedRate, LOOP_RATE, SMOOTH);
    setRate(appliedRate);
  }

  let titleRevealed = false;
  function revealTitle(istantaneo){
    if (titleRevealed || !titleWrap) return;
    titleRevealed = true;
    /* Chi salta l'intro vuole essere gia' arrivato: niente apertura. */
    if (sceneTitle) sceneTitle.classList.remove('hw-velo-spento');
    if (istantaneo){
      gsap.set(titleWrap, { opacity: 1, scale: 1, willChange: 'auto' });
      return;
    }
    if (reduce){
      gsap.to(titleWrap, { opacity: 1, duration: 0.6 });
      return;
    }
    /* Si apre dal centro, non arriva dal basso. */
    /* Solo opacita' e scala: sono le due proprieta' che il browser sa
       comporre sulla scheda grafica, senza ridisegnare nulla. La sfocatura
       che c'era prima obbligava a rifare il disegno a ogni fotogramma su
       un elemento grande quanto lo schermo, e mentre il decoder macinava
       il video il risultato era a scatti — sia il testo che il video.
       Niente will-change: chiederlo proprio in quell'istante fa creare al
       browser un livello nuovo grande quanto lo schermo, ed e' un altro
       modo per vedere un lampo. Opacita e trasformazione le compone gia'
       per conto suo. */
    gsap.to(titleWrap, { opacity: 1, scale: 1,
      duration: SBOCCIO_DURATA, ease: 'power2.out' });
  }
  function autoScrollToTitle(){
    if (window.__hwLenis){
      window.__hwLenis.scrollTo(sceneTitle, { duration: AUTOSCROLL_DUR, onComplete: revealTitle });
      gsap.delayedCall(AUTOSCROLL_DUR + 0.15, revealTitle);
      return;
    }
    if (window.ScrollToPlugin){
      gsap.to(window, { duration: AUTOSCROLL_DUR, ease:'power2.inOut', scrollTo:{ y: sceneTitle, autoKill:true }, onComplete: revealTitle });
    } else { sceneTitle.scrollIntoView({ behavior:'smooth' }); }
    gsap.delayedCall(AUTOSCROLL_DUR + 0.15, revealTitle);
  }

  // ---------- BLOCCO SCROLL ----------
  const prevent = (e) => e.preventDefault();
  const preventKeys = (e) => {
    if (e.target && e.target.closest && e.target.closest('button, a, input, textarea, select, [tabindex]')) return;
    if ([' ','Spacebar','PageDown','PageUp','ArrowDown','ArrowUp','Home','End'].includes(e.key)) e.preventDefault();
  };
  function lockScroll(){
    if (window.__hwLenis) { window.__hwLenis.stop(); }
    /* Niente overflow:hidden: un overflow sull elemento che scorre
       annulla position:sticky, e la scena del video e proprio
       sticky. Il blocco lo fanno i tre preventDefault qui sotto
       piu lo stop dello scorrimento continuo.

       E non si parte da zero ma direttamente dal titolo. Il salto
       a meta strada obbligava il browser a ridisegnare mezza
       pagina proprio mentre il testo si apriva, e per quel tempo
       dietro al titolo si vedeva il fondo bianco del wrapper.
       Partendo gia li non c e niente da ridisegnare. */
    window.scrollTo(0, sceneTitle
      ? Math.round(sceneTitle.getBoundingClientRect().top + window.scrollY)
      : 0);
    window.addEventListener('wheel', prevent, { passive:false });
    window.addEventListener('touchmove', prevent, { passive:false });
    window.addEventListener('keydown', preventKeys, false);
  }
  function unlockScroll(){
    if (unlocked) return;
    unlocked = true;
    if (window.__hwLenis) { window.__hwLenis.start(); }
    window.removeEventListener('wheel', prevent, { passive:false });
    window.removeEventListener('touchmove', prevent, { passive:false });
    window.removeEventListener('keydown', preventKeys, false);
    setTimeout(function () { ScrollTrigger.refresh(); },
               Math.max(0, TITOLO_DOPO + SBOCCIO_DURATA + 0.3 - SCROLL_DA) * 1000);
  }

  // ---------- SKIP INTRO ----------
  let skipBtn = null;
  function skipIntro(){
    if (autoScrolled) return;
    autoScrolled = true;
    hideSkip();
    try { active.currentTime = NARRATIVE.introEnd; } catch(e){}
    unlockScroll();
    /* Saltare vuol dire essere gia' arrivati: la pagina si porta sul
       titolo di colpo e il testo e' gia' li', senza aprirsi. Prima
       restava in cima, e il titolo — che sta uno schermo piu' giu' —
       sembrava salire dal basso. */
    var yT = sceneTitle
      ? Math.round(sceneTitle.getBoundingClientRect().top + window.scrollY)
      : 0;
    if (window.__hwLenis) {
      window.__hwLenis.scrollTo(yT, { immediate: true, force: true });
    } else {
      window.scrollTo(0, yT);
    }
    revealTitle(true);
    setTimeout(agganciaSempre, 300);
  }
  function showSkip(){
    if (skipBtn || !sceneTitle) return;
    skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.textContent = 'Skip Intro';
    skipBtn.setAttribute('aria-label', "Skip intro and go to content");
    Object.assign(skipBtn.style, {
      position:'fixed', bottom:'1.75rem', left:'1.75rem', zIndex:'9999',
      padding:'0.55rem 1.1rem', background:'rgba(0,0,0,0.32)', color:'#fff',
      border:'1px solid rgba(255,255,255,0.45)', borderRadius:'2rem',
      font:'inherit', fontSize:'0.78rem', letterSpacing:'0.06em', textTransform:'uppercase',
      cursor:'pointer', opacity:'0.55', transition:'opacity .3s'
    });
    const hi = ()=>{ skipBtn.style.opacity='1'; };
    const lo = ()=>{ skipBtn.style.opacity='0.55'; };
    skipBtn.addEventListener('mouseenter', hi);
    skipBtn.addEventListener('mouseleave', lo);
    skipBtn.addEventListener('focus', hi);
    skipBtn.addEventListener('blur', lo);
    skipBtn.addEventListener('click', skipIntro);
    (document.querySelector('.hw-lp') || document.body).appendChild(skipBtn);
  }
  function hideSkip(){
    if (!skipBtn) return;
    var b = skipBtn;
    skipBtn = null;
    b.style.visibility = 'hidden';
    b.style.pointerEvents = 'none';
    setTimeout(function () { b.remove(); }, 1000);
  }

  // ---------- TAP-TO-PLAY ----------
  let overlay = null;
  function showTapOverlay(){
    if (overlay) return;
    overlay = document.createElement('button');
    overlay.type='button'; overlay.setAttribute('aria-label','Play the video'); overlay.textContent='►';
    Object.assign(overlay.style,{position:'absolute',inset:'0',zIndex:'50',display:'flex',alignItems:'center',
      justifyContent:'center',background:'rgba(0,0,0,0.35)',color:'#fff',border:'none',fontSize:'3rem',
      cursor:'pointer',width:'100%',height:'100%'});
    overlay.addEventListener('click', () => { vA.play().then(()=>{ overlay.remove(); overlay=null; }).catch(()=>{}); });
    trigger.appendChild(overlay);
  }
  (function tryAutoplay(){
    if (reduce) { vA.loop = true; return; }
    const p = vA.play();
    if (p && p.then) p.then(()=>{ setTimeout(()=>{ if (vA.paused || vA.currentTime===0) showTapOverlay(); },400); }).catch(showTapOverlay);
  })();

  if (reduce) return;

  /* Lo stato di partenza si scrive subito, non quando l'animazione
     parte. Introdurre una trasformazione su un elemento che non ne
     aveva costa un fotogramma, e cadrebbe sul primo dell apertura:
     e lo scatto che si vedeva li. Cosi al secondo 2 restano solo dei
     numeri da muovere, su proprieta che esistono gia. */
  if (titleWrap) gsap.set(titleWrap,
    { opacity: 0, scale: SBOCCIO_DA, transformOrigin: '50% 50%' });

  lockScroll();
  showSkip();

  /* Fino a qui la pagina resta in cima, cosi' l'intro del video si vede
     pulita: la scena del titolo porta davanti a se' un velo scuro radiale,
     e averlo addosso dal primo fotogramma smorzava l'apertura.

     Poi la pagina si sposta sul titolo di colpo, senza planare. Sullo
     schermo non cambia nulla — .scene-hero e' sticky e resta inchiodata
     in alto — quindi il salto non si vede, e il testo puo' comparire
     fermo al centro invece di attraversare lo schermo dal basso. */
  setTimeout(function () {
    if (autoScrolled || overlay) return;
    autoScrolled = true;
    revealTitle();
    /* Il pulsante sparisce il fotogramma dopo: toglierlo dal documento
       costa un ricalcolo, e sullo stesso fotogramma dell apertura si
       sommerebbe al resto. */
    requestAnimationFrame(hideSkip);
  }, TITOLO_DOPO * 1000);

  /* Lo scroll aspetta che il testo sia leggibile. Fino a qui la rotellina
     non muove niente: l'apertura non viene interrotta a meta'. */
  setTimeout(function () {
    unlockScroll();
    agganciaSempre();
  }, SCROLL_DA * 1000);

  /* L'aggancio fra il titolo e la prima scena, permanente e nei due sensi.

     Non e' un salto che avviene una volta sola: finche' si sta su uno dei
     due estremi, ogni gesto nella direzione dell'altro fa volare li'. In
     discesa dal titolo si arriva alla scena, in salita dalla scena si torna
     al titolo, e si puo' fare avanti e indietro quante volte si vuole.

     L'atterraggio non e' il bordo della scena ma il centro del suo testo:
     viene misurato ogni volta, cosi' resta giusto anche se il testo cambia
     lunghezza o la finestra cambia misura.

     inVolo e' quello che tiene in piedi la cosa: senza, i venti eventi di
     una singola rotellata farebbero ripartire il volo venti volte. */
  function agganciaSempre() {
    var scena = document.getElementById('scene-journey-1');
    if (!scena) return;
    var inVolo = false, tolleranza = 60, ultimoTocco = 0;

    function yTitolo() {
      return sceneTitle
        ? Math.round(sceneTitle.getBoundingClientRect().top + window.scrollY)
        : 0;
    }
    function yScena() {
      var testo = scena.querySelector('h1, h2, h3') || scena;
      var r = testo.getBoundingClientRect();
      var centro = r.top + window.scrollY + r.height / 2;
      return Math.max(0, Math.round(centro - window.innerHeight / 2));
    }

    function vola(y) {
      inVolo = true;
      function libera() {
        if (window.__hwLenis) { window.__hwLenis.start(); }
        inVolo = false;
      }
      if (window.__hwLenis) {
        window.__hwLenis.stop();
        window.__hwLenis.scrollTo(y, {
          duration: VOLO_DURATA, easing: VOLO_CURVA,
          force: true, lock: true, onComplete: libera
        });
      } else if (window.ScrollToPlugin) {
        gsap.to(window, { duration: VOLO_DURATA, ease: 'power2.inOut',
                          scrollTo: { y: y, autoKill: false }, onComplete: libera });
      } else {
        window.scrollTo(0, y);
        libera();
        return;
      }
      /* Se onComplete non arrivasse, lo scorrimento resterebbe morto. */
      setTimeout(libera, VOLO_DURATA * 1000 + 400);
    }

    function decidi(giu) {
      if (inVolo) return;
      var y = window.scrollY, A = yTitolo(), B = yScena();
      if (giu && y <= A + tolleranza) { vola(B); }
      else if (!giu && Math.abs(y - B) <= tolleranza) { vola(A); }
    }

    window.addEventListener('wheel', function (e) {
      if (e.deltaY) { decidi(e.deltaY > 0); }
    }, { passive: true });

    window.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].indexOf(e.key) > -1) { decidi(true); }
      else if (['ArrowUp', 'PageUp'].indexOf(e.key) > -1) { decidi(false); }
    });

    /* Il tocco non porta con se' una direzione: si ricava dal movimento. */
    window.addEventListener('touchstart', function (e) {
      ultimoTocco = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      var y = e.touches[0].clientY, d = ultimoTocco - y;
      if (Math.abs(d) > 8) { decidi(d > 0); ultimoTocco = y; }
    }, { passive: true });
  }

  /* Rete di sicurezza: se l autoplay e' stato rifiutato, non restare
     bloccati in eterno. */
  setTimeout(function () { if (!unlocked) unlockScroll(); }, 12000);

  // ---------- SCROLL SENSOR ----------
  const st = ScrollTrigger.create({
    trigger, start:'top top', end:()=>'+='+endEl.offsetHeight, scrub:false,
    onUpdate: (self) => {
      lastScrollTs = performance.now();
      const p = self.progress;
      if (overlayLayer){
        const dp = gsap.utils.clamp(0, 1, (p - JOURNEY_SPLIT) / (1 - JOURNEY_SPLIT));
        overlayLayer.style.opacity = Math.pow(dp, 1.4).toFixed(3);
      }
      if (!cueHidden && p > 0.002 && scrollCue){ cueHidden = true; gsap.to(scrollCue,{opacity:0,duration:0.4}); }
    }
  });

  // ---------- FLOOR ----------
  let floorActive = false, scrollFloor = 0;
  function updateFloor(){ if (sceneTitle) scrollFloor = Math.round(sceneTitle.getBoundingClientRect().top + window.scrollY); }
  updateFloor();
  ScrollTrigger.addEventListener('refresh', updateFloor);
  window.addEventListener('scroll', () => {
    if (!sceneTitle) return;
    if (!floorActive && window.scrollY >= scrollFloor - 1) floorActive = true;
    if (floorActive && window.scrollY < scrollFloor) {
      if (window.__hwLenis) { window.__hwLenis.scrollTo(scrollFloor, { immediate: true }); }
      else { window.scrollTo(0, scrollFloor); }
    }
  }, { passive: true });

  // ---------- MOTORE ----------
  gsap.ticker.add(() => {
    // === FASE INTRO ===
    if (!autoScrolled){
      if (!cueShown && active.currentTime >= CUE_TIME && scrollCue){ cueShown = true; gsap.to(scrollCue,{opacity:1,duration:0.8,ease:'power2.out'}); }
      if (!unlocked && active.currentTime >= UNLOCK_TIME && !overlay) unlockScroll();

      if (active.paused && !overlay) active.play().catch(()=>{});
      appliedRate = gsap.utils.interpolate(appliedRate, 1, SMOOTH);
      setRate(appliedRate);
      return;
    }

    const isScrolling = (performance.now() - lastScrollTs) < IDLE_DELAY;
    const p = st.progress;

    // ★ ZONA TITOLO (glide auto-scroll + riposo): SOLO loop ambientale, mai scrub → niente accelerazione/freeze/salto
    if (p <= TITLE_TOP_P + 0.005){
      ambientLoop();
      return;
    }

    // ★ ZONA SCRUB (discesa 7→11 + journey 11→20)
    let tt;
    if (p < JOURNEY_SPLIT) tt = gsap.utils.mapRange(TITLE_TOP_P, JOURNEY_SPLIT, NARRATIVE.loopEnd, NARRATIVE.diveEnd, p);
    else                   tt = gsap.utils.mapRange(JOURNEY_SPLIT, 1, NARRATIVE.diveEnd, NARRATIVE.journeyEnd, p);
    tt = gsap.utils.clamp(NARRATIVE.loopStart, NARRATIVE.journeyEnd, tt);

    const delta = tt - active.currentTime;
    if (Math.abs(delta) > HARD_RESYNC){ active.currentTime = tt; return; }
    if (!active.paused) active.pause();
    /* Gia' sul fotogramma giusto: cercare ancora darebbe solo tremolio. */
    if (Math.abs(delta) < FRAME_MIN) return;
    active.currentTime = gsap.utils.interpolate(active.currentTime, tt, SCRUB_SMOOTH);
  });
});

/* ripple dei bottoni */
hwPronto(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SPREAD = 2.6;   // quanto l'onda esce OLTRE il bottone (1 = bordo, >2 = ben fuori)

  function spawnRipple(btn, clientX, clientY, soft) {
    const rect = btn.getBoundingClientRect();

    // centro del bottone in coordinate viewport (per l'hover) o punto del cursore (click)
    const cx = clientX != null ? clientX : rect.left + rect.width / 2;
    const cy = clientY != null ? clientY : rect.top  + rect.height / 2;

    // diametro finale: più grande del bottone così esce fuori
    const base = Math.max(rect.width, rect.height);
    const diameter = base * SPREAD;

    const makeRing = (delay, scale, alpha) => {
      const r = document.createElement('span');
      r.className = 'water-ripple';
      r.style.width = r.style.height = diameter * scale + 'px';
      r.style.left = cx + 'px';
      r.style.top  = cy + 'px';
      r.style.borderColor = `rgba(255,255,255,${alpha})`;
      document.body.appendChild(r);           // ← sul body: nessun clipping
      requestAnimationFrame(() => {
        setTimeout(() => r.classList.add('is-animating'), delay);
      });
      r.addEventListener('animationend', () => r.remove());
    };

    makeRing(0, 1, 0.6);                       // anello principale
    if (!soft) makeRing(110, 1.35, 0.35);      // secondo anello più ampio (solo al click)
  }

  // CLICK: onde dal punto del cursore, che si allargano oltre il bottone
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) spawnRipple(btn, e.clientX, e.clientY, false);
  });

  // HOVER: singola onda morbida dal centro
  document.querySelectorAll('.btn').forEach((btn) => {
    let last = 0;
    btn.addEventListener('mouseenter', () => {
      const now = Date.now();
      if (now - last < 500) return;
      last = now;
      spawnRipple(btn, null, null, true);
    });
  });
});
