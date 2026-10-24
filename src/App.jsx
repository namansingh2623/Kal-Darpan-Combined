import {Fragment,lazy,Suspense,useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import { Home, MapPin, Move3d } from 'lucide-react';
const ThreeScene=lazy(()=>import('./Scene'));
const MonumentViewer=lazy(()=>import('./viewer/MonumentViewer'));
function Scene(props){return <Suspense fallback={<div className={'scene scene-loading '+(props.mode||'hall')} role='status'>{props.t('Opening the 3D experience…')}</div>}><ThreeScene {...props}/></Suspense>;}
import Chatbot from './Chatbot.jsx';
import useOnDemandSpeech from './useOnDemandSpeech';
import ListenControl from './ListenControl.jsx';
import ClockTransition from './ClockTransition.jsx';
import LiquidCursor from './LiquidCursor.jsx';
import {Chakra,MandalaRing,JaaliTexture,Marker,toDevanagari} from './Ornaments.jsx';
import { LanguageToggle, useLanguage } from './i18n.jsx';
import {galleryExhibits,monuments} from './data';
import './App.css';

const StaticMonumentView=lazy(()=>import('./viewer/StaticMonumentView'));
const HeritageAtlas=lazy(()=>import('./HeritageAtlas.jsx'));
const storageKey='kaal-darpan-progress-v3';
const subscriptionKey='kaal-darpan-pro-subscription';
const macerenaUrl='https://macerena-96e83.web.app/';
const hallIndexMonuments=galleryExhibits.map(({id})=>monuments.find(monument=>monument.id===id)).filter(Boolean);
const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function loadProgress(){
  try{const data=JSON.parse(localStorage.getItem(storageKey));if(!data||typeof data!=='object')return {};return Object.fromEntries(monuments.map(m=>{const entry=data[m.id];return [m.id,{visited:entry?.visited===true,hotspots:Array.isArray(entry?.hotspots)?entry.hotspots.filter(id=>m.hotspots.some(h=>h.id===id)):[],score:Number.isInteger(entry?.score)?Math.max(0,Math.min(m.quiz.length,entry.score)):null}];}));}catch{return {};}
}
const Chars=({text,className='char'})=>[...text].map((c,i)=><span key={i} className={className} aria-hidden="true" style={{'--i':i,'--n':text.length}}>{c===' '?' ':c}</span>);
const Words=({text})=>text.split(' ').map((w,i)=><Fragment key={i}>{i>0&&' '}<span className="word-mask" aria-hidden="true"><span className="word">{w}</span></span></Fragment>);
function ThemeToggle({theme,onToggle,className='',t=(text)=>text}){
  const nextTheme=theme==='dark'?'light':'dark';
  return <button type="button" className={`theme-toggle ${className}`} aria-label={t(`Switch to ${nextTheme} mode`)} aria-pressed={theme==='light'} onClick={onToggle}>
    <span aria-hidden="true">{theme==='dark'?'☼':'☾'}</span>{t(nextTheme)} {t('mode')}
  </button>;
}
function Entrance({onEnter,onGps,onJourney,onAbout,onToggleTheme,hasProSubscription,theme,visited,language,setLanguage,t}){
  const root=useRef(null);
  useEffect(()=>{
    if(reducedMotion())return;
    const ctx=gsap.context(()=>{
      const el=root.current;el.classList.add('is-animating');
      gsap.timeline({defaults:{ease:'expo.out',force3D:true},onComplete:()=>el.classList.remove('is-animating')})
        .from('.cover-video',{opacity:0,duration:2,ease:'power2.out'},0)
        .from('.cover-dial',{opacity:0,duration:2},.1)
        .from('.cover-eyebrow',{opacity:0,y:10,duration:.9},.35)
        .from('.cover-title .char',{yPercent:115,opacity:0,duration:1.2,stagger:.05},.5)
        .from('.cover-deva .word',{yPercent:110,opacity:0,duration:1,stagger:.12},1)
        .from('.cover-tagline .word',{yPercent:110,opacity:0,duration:.8,stagger:.025},1.15)
        .from('.cover-entry-actions',{opacity:0,y:18,duration:.9,clearProps:'transform,opacity'},1.5)
        .from('.cover-top,.cover-foot',{opacity:0,duration:1},1.6);
    },root);
    return()=>ctx.revert();
  },[]);
  return <main className="cover" ref={root}>
    <video className="cover-video" src="/qutub-minar.mp4" poster="/qutub-minar-poster.jpg" autoPlay muted loop playsInline preload="auto" aria-hidden="true"/>
    <div className="cover-veil" aria-hidden="true"/>
    <div className="cover-colorwash" aria-hidden="true"/>
    <div className="cover-jaali" aria-hidden="true"><JaaliTexture/></div>
    <div className="cover-grain" aria-hidden="true"/>
    <header className="cover-top">
      <div className="cover-identity"><span className="cover-brand">Kaal Darpan</span><LanguageToggle language={language} onChange={setLanguage}/></div>
      <nav aria-label="Main navigation">
        <button onClick={onJourney}>{t('Journey')} <span className="count">{visited}/{monuments.length}</span></button>
        <button onClick={onAbout}>{t('About')}</button>
        <a href="/kaal-darpan-pricing/index.html">{t('Pricing and billing')}</a>
        <a className="macerena-entry" href={hasProSubscription?macerenaUrl:'/kaal-darpan-pricing/index.html'}>{t('Macerena')} <span aria-hidden="true">✦</span></a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} t={t}/>
      </nav>
    </header>
    <section className="cover-content">
      <MandalaRing className="cover-dial"/>
      <p className="cover-eyebrow" aria-label={t('Indian Heritage ✦ Immersive History')}><Chars text={t('Indian Heritage ✦ Immersive History')}/></p>
      <h1 className="cover-title" aria-label="Kaal Darpan"><Chars text="KAAL DARPAN"/></h1>
      <p className="cover-deva" lang="hi" aria-label="काल दर्पण"><Words text="काल दर्पण"/></p>
      <p className="cover-tagline" aria-label={t('Where history echoes in motion — step through the mirror of time and walk among monuments brought back to life.')}><Words text={t('Where history echoes in motion — step through the mirror of time and walk among monuments brought back to life.')}/></p>
      <div className="cover-entry-actions">
        <button className="museum-entry" onClick={onEnter}><span className="entry-label">{t('Enter the Museum')}</span><span className="entry-sub">{t('Five monuments · timelines & activities')}</span></button>
        <button className="gps-entry" onClick={onGps}><span className="entry-label"><MapPin size={13} strokeWidth={3}/> GPS</span><span className="entry-sub">{t('Explore the heritage map')}</span></button>
      </div>
    </section>
    <footer className="cover-foot"><span>Kaal Darpan / {toDevanagari('001')}</span><span>{t('Indian Knowledge Systems')}</span></footer>
  </main>;
}
function Quiz({monument,onComplete,t}){
  const [answers,setAnswers]=useState({}),[submitted,setSubmitted]=useState(false);
  const score=monument.quiz.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);
  return <div className="quiz"><p className="muted" data-reveal>{t('Use what you discovered in the model and history panels.')}</p>{monument.quiz.map((q,i)=><fieldset key={i} className="quiz-card" data-reveal style={{'--d':i}}><legend><span className="quiz-num">{toDevanagari(i+1)}</span>{t(q.question)}</legend>{q.options.map((option,j)=><label key={j} className={'answer '+(submitted&&j===q.answer?'correct':'')}><input type="radio" name={monument.id+'-'+i} checked={answers[i]===j} disabled={submitted} onChange={()=>setAnswers({...answers,[i]:j})}/>{t(option)}</label>)}{submitted&&<p className="feedback">{answers[i]===q.answer?'✓ '+t('Correct.') :t('Review: ')} {t(q.why)}</p>}</fieldset>)}{submitted?<div className="quiz-result" role="status"><strong>{toDevanagari(score)} / {toDevanagari(monument.quiz.length)} {t('correct')}</strong><p>{t('Your best score has been saved.')}</p><button className="secondary" onClick={()=>{setAnswers({});setSubmitted(false);}}>{t('Try again')}</button></div>:<button className="explore-button" data-reveal disabled={Object.keys(answers).length<monument.quiz.length} onClick={()=>{setSubmitted(true);onComplete(score);}}>{t('CHECK ANSWERS →')}</button>}</div>;
}
function PhotoFigure({photo,className='',t}){
  if(!photo)return null;
  return <figure className={`material-figure ${className}`}>
    <img src={photo.src} alt={t(photo.alt)} loading="lazy" decoding="async"/>
    <figcaption>
      <span>{t(photo.caption)}</span>
      <span className="photo-credit">
        {t('Photo')} <a href={photo.source} target="_blank" rel="noreferrer">{t(photo.author)}</a>
        {' · '}<a href={photo.licenseUrl} target="_blank" rel="noreferrer">{t(photo.license)}</a>
      </span>
    </figcaption>
  </figure>;
}
function AdditionalInfo({info,t}){
  if(!info?.sections?.length)return <p data-reveal>{t('This space is ready for the additional information you plan to provide.')}</p>;
  return <div className="additional-info">
    <p className="additional-intro" data-reveal>{t(info.intro)}</p>
    <div className="additional-facts">{info.sections.map((section,index)=><article className="additional-fact" key={section.title} data-reveal style={{'--d':index}}>
      <div className="eyebrow additional-fact-number">{toDevanagari(index+1)} / {section.image?t('Material study'):t('Field note')}</div>
      <h3>{t(section.title)}</h3>
      <p>{t(section.body)}</p>
      {section.image&&<PhotoFigure photo={section.image} t={t}/>}
    </article>)}</div>
    {info.didYouKnow?.length>0&&<section className="did-you-know" aria-labelledby="did-you-know-title" data-reveal>
      <div className="eyebrow">{t('A few more details')}</div><h3 id="did-you-know-title">{t('Did you know?')}</h3>
      <ul>{info.didYouKnow.map((fact,index)=><li key={index}>{t(fact)}</li>)}</ul>
    </section>}
    {info.sources?.length>0&&<nav className="additional-sources" aria-label={t('Sources')} data-reveal>
      <div className="eyebrow">{t('Further reading')}</div>
      {info.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{t(source.label)} <span aria-hidden="true">↗</span></a>)}
    </nav>}
  </div>;
}
function useScrollReveal(rootRef,deps){
  useEffect(()=>{
    const root=rootRef.current;if(!root)return;
    const items=[...root.querySelectorAll('[data-reveal]')];
    if(reducedMotion()||!('IntersectionObserver' in window)){items.forEach(el=>el.classList.add('is-in'));return;}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    items.forEach((el,i)=>{el.style.setProperty('--stagger',(i%6)*70+'ms');io.observe(el);});
    return()=>io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },deps);
}
export default function App(){
  const [page,setPage]=useState(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get('page')==='hall')return 'hall';
    if(params.get('page')==='timeline'&&monuments.some(monument=>monument.id===params.get('monument')))return 'timeline';
    return window.location.hash==='#gallery'?'hall':'home';
  }),[selected,setSelected]=useState(()=>{
    const params=new URLSearchParams(window.location.search);
    const id=params.get('monument');
    return params.get('page')==='timeline'&&monuments.some(monument=>monument.id===id)?id:null;
  }),[viewerOrigin,setViewerOrigin]=useState('hall'),[transition,setTransition]=useState(null),[modal,setModal]=useState(null),[tab,setTab]=useState('architecture'),[hotspot,setHotspot]=useState(null),[zoomRequest,setZoomRequest]=useState(0),[resetCount,setResetCount]=useState(0),[progress,setProgress]=useState(loadProgress),[storageNotice,setStorageNotice]=useState(false),[learningModelState,setLearningModelState]=useState({t:1,explode:false}),[visitorMode,setVisitorMode]=useState(false);
  const { language, setLanguage, t } = useLanguage();
  const speech = useOnDemandSpeech();
  const stopSpeech = speech.stop;
  const [theme,setTheme]=useState(()=>{
    try{return localStorage.getItem('kaal-darpan-theme')==='light'?'light':'dark';}
    catch(error){console.warn('Unable to load the saved appearance preference.',error);return 'dark';}
  });
  const [hasProSubscription]=useState(()=>{try{return localStorage.getItem(subscriptionKey)==='active';}catch{return false;}});
  const mainRef=useRef(null),dialogRef=useRef(null),panelRef=useRef(null),textureRef=useRef(null);
  const monument=monuments.find(m=>m.id===selected);
  useEffect(()=>{if(window.location.hash==='#gallery')history.replaceState(null,'',window.location.pathname+window.location.search);},[]);
  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(progress));}catch{queueMicrotask(()=>setStorageNotice(true));}},[progress]);
  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    try{localStorage.setItem('kaal-darpan-theme',theme);}
    catch(error){console.warn('Unable to save the appearance preference.',error);}
  },[theme]);
  useEffect(()=>{mainRef.current?.focus({preventScroll:true});},[page,selected]);
  useEffect(()=>{
    if(!modal)return;const previouslyFocused=document.activeElement;const dialog=dialogRef.current;dialog?.showModal();
    const close=e=>{e.preventDefault();setModal(null);};dialog?.addEventListener('cancel',close);
    return ()=>{dialog?.removeEventListener('cancel',close);dialog?.close();previouslyFocused?.focus();};
  },[modal]);
  useScrollReveal(panelRef,[page,selected,tab,hotspot]);
  useEffect(()=>{stopSpeech();},[page,selected,tab,hotspot,stopSpeech]);
  // While the clock overlay runs, pause continuous effects and drop backdrop blurs underneath it (see App.css).
  useEffect(()=>{
    document.documentElement.classList.toggle('is-transitioning',!!transition);
    return()=>document.documentElement.classList.remove('is-transitioning');
  },[transition]);
  // Warm the heavy lazy chunks (hall/monument Scene and the timeline viewer with three/r3f).
  useEffect(()=>{
    let idleId=0;const idleSupported='requestIdleCallback' in window;
    const warm=()=>Promise.all([import('./Scene'),import('./viewer/MonumentViewer')]).catch(error=>console.error('Unable to preload the museum experience.',error));
    const timer=setTimeout(()=>{idleId=idleSupported?requestIdleCallback(warm,{timeout:3000}):setTimeout(warm,300);},2600);
    return()=>{clearTimeout(timer);if(idleSupported)cancelIdleCallback(idleId);else clearTimeout(idleId);};
  },[]);
  useEffect(()=>{
    const el=panelRef.current,tex=textureRef.current;if(!el||!tex||reducedMotion())return;
    let idle=0;
    const onScroll=()=>{tex.style.willChange='transform';tex.style.transform=`translate3d(0,${-el.scrollTop*.25}px,0)`;clearTimeout(idle);idle=setTimeout(()=>{tex.style.willChange='';},200);};
    el.addEventListener('scroll',onScroll,{passive:true});return()=>{clearTimeout(idle);el.removeEventListener('scroll',onScroll);};
  },[page,selected]);
  function patch(id,change){setProgress(old=>({...old,[id]:{...old[id],...change(old[id]||{})}}));}
  function runTransition(label,action){
    if(transition)return;
    if(reducedMotion()){action();return;}
    setTransition({label,action,key:Date.now()});
  }
  // Opening a monument starts with its construction timeline; "Notes & quiz" continues to the learning page.
  function enter(id){
    const m=monuments.find(x=>x.id===id);
    if(!m)return;
    runTransition(m.name,()=>{setViewerOrigin(page);setSelected(id);setPage('timeline');setTab('architecture');setHotspot(null);setVisitorMode(false);setResetCount(0);patch(id,()=>({visited:true}));});
  }
  function openLearning(modelState){
    runTransition(monument.name,()=>{setLearningModelState(modelState);setPage('monument');setTab('architecture');setHotspot(null);setVisitorMode(false);setResetCount(0);});
  }
  const toggleTheme=()=>setTheme(value=>value==='dark'?'light':'dark');
  function openHotspot(id){setHotspot(id);setZoomRequest(value=>value+1);setTab('architecture');patch(selected,p=>({hotspots:[...new Set([...(p.hotspots||[]),id])]}));}
  const visited=monuments.filter(m=>progress[m.id]?.visited).length;
  const tabs=['architecture','history','challenge','additional-info'];
  return <>
    {page==='home'&&<Entrance theme={theme} onToggleTheme={toggleTheme} visited={visited} hasProSubscription={hasProSubscription} onJourney={()=>setModal('progress')} onAbout={()=>setModal('about')} onGps={()=>runTransition('The Heritage Atlas',()=>setPage('gps'))} onEnter={()=>runTransition('The Heritage Hall',()=>setPage('hall'))} language={language} setLanguage={setLanguage} t={t}/>}
    {page==='gps'&&<Suspense fallback={<div className="atlas-loading" role="status">{t('Opening the Heritage Atlas…')}</div>}><HeritageAtlas theme={theme} selectedMonumentId={selected} onToggleTheme={toggleTheme} onJourney={()=>setModal('progress')} onAbout={()=>setModal('about')} onBack={()=>runTransition('Kaal Darpan',()=>setPage('home'))} onHome={()=>runTransition('Kaal Darpan',()=>setPage('home'))} onEnterHall={()=>runTransition('The Heritage Hall',()=>setPage('hall'))} onExplore={enter} language={language} setLanguage={setLanguage} t={t}/></Suspense>}
    {page==='hall'&&<main className="hall-page" ref={mainRef} tabIndex={-1}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} className="theme-toggle-floating" t={t}/>
      <LanguageToggle language={language} onChange={setLanguage} className="language-toggle-floating"/>
      <button type="button" className="home-icon-button hall-home-button" onClick={()=>runTransition('Kaal Darpan',()=>setPage('home'))} aria-label={t('Open the homepage')} title={t('Open the homepage')}><Home size={18}/></button>
      <Scene theme={theme} onSelect={enter} t={t}/>
      <header className="hall-heading">
        <button className="hall-brand" onClick={()=>runTransition('Kaal Darpan',()=>setPage('home'))}>{t('Kaal Darpan')}</button>
        <h1>{t('The Heritage Hall')}</h1>
        <p>{t('Explore five monuments · timelines and learning activities')}</p>
        <a className="macerena-entry hall-macerena-entry" href={hasProSubscription?macerenaUrl:'/kaal-darpan-pricing/index.html'}>{t('Macerena')} <span aria-hidden="true">✦</span></a>
      </header>
      <nav className="hall-index" aria-label="Monuments">
        <ol>{hallIndexMonuments.map((m,i)=><li key={m.id}><button onClick={()=>enter(m.id)}><span className="idx">0{i+1}</span><span className="nm">{t(m.name)}</span>{progress[m.id]?.visited&&<span className="seen" aria-label={t('Visited')}>✦</span>}</button></li>)}</ol>
      </nav>
    </main>}
    {page==='timeline'&&monument&&<Suspense fallback={<div className="scene scene-loading timeline-loading" role="status">{t('Opening the timeline…')}</div>}><MonumentViewer monumentId={monument.viewerId||monument.id} onBack={()=>runTransition(viewerOrigin==='gps'?'The Heritage Atlas':'The Heritage Hall',()=>setPage(viewerOrigin))} backLabel={viewerOrigin==='gps'?'GPS':'Museum'} onLearn={openLearning} onToggleTheme={toggleTheme} onBackHome={()=>runTransition('Kaal Darpan',()=>setPage('home'))} language={language} setLanguage={setLanguage} t={t}/></Suspense>}
    {page==='monument'&&monument&&<main className="monument-page" ref={mainRef} tabIndex={-1}>
      <button type="button" className="home-icon-button learning-home-button" onClick={()=>runTransition('Kaal Darpan',()=>setPage('home'))} aria-label={t('Open the homepage')} title={t('Open the homepage')}><Home size={18}/></button>
      <LanguageToggle language={language} onChange={setLanguage} className="learning-language-toggle"/>
      <div className="monument-stage"><Suspense fallback={<div className="scene scene-loading" role="status">{t('Opening the monument model…')}</div>}><StaticMonumentView key={monument.id} monumentId={monument.viewerId||monument.id} initial={learningModelState} hotspots={monument.hotspots} activeHotspot={hotspot} onHotspot={openHotspot} zoomRequest={zoomRequest} resetCount={resetCount} visitorMode={visitorMode}/></Suspense>
        <button type="button" className={'visitor-mode-toggle '+(visitorMode?'is-active':'')} aria-pressed={visitorMode} onClick={()=>setVisitorMode(value=>!value)}>
          <Move3d size={16}/>{visitorMode?t('Exit visitor mode'):t('Visitor mode')}
        </button>
        {visitorMode&&<span className="visitor-mode-hint">{t('Click the model · drag to look · WASD to walk')}</span>}
        <div className="model-caption"><span>{t('Interactive scale model (simplified)')}</span><span>{toDevanagari(progress[selected]?.hotspots?.length||0)} / {toDevanagari(monument.hotspots.length)} {t('features explored')}</span></div>
      </div>
      <div className="monument-sidebar">
        <div className="sidebar-header">
          <div className="detail-title"><div className="eyebrow">{monument.location} / {monument.period}</div><h1>{monument.name}</h1></div>
        </div>
        <div className="sidebar-nav">
          <button className="secondary" onClick={()=>runTransition('The Heritage Hall',()=>setPage('hall'))}>← {t('Museum')}</button>
          <button className="secondary" onClick={()=>runTransition(monument.name,()=>setPage('timeline'))}>{t('TIMELINE')}</button>
          <button className="secondary" onClick={()=>{setVisitorMode(false);setResetCount(n=>n+1);}}>{t('RESET VIEW')}</button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} t={t}/>
        </div>
      </div>
      <div className="exploration">
        <aside className="learning-panel">
          <div className="panel-tabs" role="tablist" aria-label={t('Learning panels')} aria-orientation="vertical">{tabs.map((key,i)=><button key={key} id={'tab-'+key} role="tab" aria-selected={tab===key} aria-controls="learning-content" onClick={()=>setTab(key)}><span className="rail-num">{toDevanagari(i+1)}</span><span className="rail-label">{t(({architecture:'Architecture',history:'History',challenge:'Challenge','additional-info':'Additional info'})[key])}</span></button>)}</div>
          <div className="panel-scroll" ref={panelRef}>
            <div className="panel-texture" ref={textureRef}><JaaliTexture/></div>
            <div className="panel-body" id="learning-content" role="tabpanel" aria-labelledby={'tab-'+tab} key={tab}>
              <div className="panel-chakra" aria-hidden="true"><Chakra/></div>
              <div className="panel-content">
              {tab==='architecture'&&<><div className="eyebrow" data-reveal>{t('Field notes')}</div><h2 data-reveal>{hotspot?t(monument.hotspots.find(h=>h.id===hotspot).title):t('Look closer.')}</h2><hr className="gold-rule" data-reveal/><p className="field-note" data-reveal>{hotspot?t(monument.hotspots.find(h=>h.id===hotspot).text):t('Select a glowing marker or an architectural part in the scene. Each feature opens a story about the building.')}</p><div className="feature-list">{monument.hotspots.map((h,i)=><button key={h.id} data-reveal className={hotspot===h.id?'selected':''} onClick={()=>openHotspot(h.id)}><span className="feature-number">{toDevanagari(i+1)}</span>{t(h.title)}<span className="feature-check">{progress[selected]?.hotspots?.includes(h.id)?'✓':'↗'}</span></button>)}</div><p className="muted small" data-reveal>{t('Note: This model is a simplified representation. For the detailed construction timeline with phased building stages, use the Timeline view.')}</p></>}
              {tab==='history'&&<><div className="eyebrow" data-reveal>{t('People · Place · Time')}</div><h2 data-reveal>{t('A place in history.')}</h2><hr className="gold-rule" data-reveal/><p data-reveal>{t(monument.summary)}</p><ListenControl speech={speech} id={'summary-'+monument.id} text={monument.summary} label={t(monument.name)+' summary'}/><ol className="timeline">{monument.timeline.map(([year,text],i)=><li key={year} data-reveal><span className="tl-marker"><Marker/><span>{toDevanagari(i+1)}</span></span><strong>{year}</strong><p>{t(text)}</p></li>)}</ol></>}
              {tab==='challenge'&&<><div className="eyebrow" data-reveal>{t('Your learning challenge')}</div><h2 data-reveal>{t('What did you discover?')}</h2><hr className="gold-rule" data-reveal/><PhotoFigure photo={monument.learningImage} className="learning-photo-header" t={t}/><Quiz key={monument.id} monument={monument} t={t} onComplete={score=>patch(selected,p=>({score:Math.max(p.score??0,score)}))}/></>}
              {tab==='additional-info'&&<><div className="eyebrow" data-reveal>{t('Additional info')}</div><h2 data-reveal>{t('More to discover.')}</h2><hr className="gold-rule" data-reveal/><PhotoFigure photo={monument.learningImage} className="learning-photo-header" t={t}/><AdditionalInfo info={monument.additionalInfo} t={t}/></>}
              <a className="source-link" data-reveal href={monument.source} target="_blank" rel="noreferrer">{t('Historical reference ↗')}</a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>}
    {storageNotice&&<p className="storage-notice" role="status">{t('This browser is blocking saved progress. Your journey is available for this session.')}</p>}
    {transition&&<ClockTransition key={transition.key} label={transition.label} onDone={()=>{transition.action();setTransition(null);}}/>}
    {modal&&<dialog className="modal" data-cursor-hover onClick={(event)=>event.stopPropagation()} ref={dialogRef}><button className="close-button" onClick={()=>setModal(null)} aria-label={t('Close')}>×</button>{modal==='progress'?<><div className="eyebrow">{t('YOUR HERITAGE JOURNEY')}</div><h2>{toDevanagari(visited)} / 3 {t('monuments visited.')}</h2><p className="muted">{t('Saved on this browser and device.')}</p>{monuments.map(m=><div className="journey-row" key={m.id}><div><strong>{t(m.name)}</strong><p>{t(progress[m.id]?.visited?'Visited':'Not yet visited')} · {progress[m.id]?.hotspots?.length||0}/{m.hotspots.length} {t('features')}</p></div><span>{progress[m.id]?.score!=null?progress[m.id].score+'/'+m.quiz.length+' '+t('correct'):t('Quiz pending')}</span></div>)}{storageNotice&&<p>{t('Saving is blocked by your browser settings.')}</p>}</>:<><div className="eyebrow">{t('ABOUT KAAL DARPAN')}</div><h2>{t('History you can explore.')}</h2><p>{t('Enter a museum of Indian heritage, choose a miniature and explore architectural form through 3D models, contextual notes, timelines and learning activities.')}</p><p>{t('This first development stage uses simplified models. Detailed monument assets, walking through interiors, QR access, accounts and AR are future stages.')}</p></>}</dialog>}
    <Chatbot/>
    <LiquidCursor/>
  </>;
}
