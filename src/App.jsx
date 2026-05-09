import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Zap, Target, History, TrendingDown, CheckCircle, ArrowUp, Star, AlertCircle, HelpCircle, XCircle, AlertTriangle, Info
} from 'lucide-react';
import recipesData from './data/recipes.json';

function App() {
  const [pagina, setPagina] = useState('welkom'); 
  const [uitlegSectie, setUitlegSectie] = useState('hoofd');
  const [geselecteerdRecept, setGeselecteerdRecept] = useState(null);
  const [weekPlan, setWeekPlan] = useState({});
  const [profiel, setProfiel] = useState({ gewicht: "", doel: 'Afvallen', aantalMaaltijden: 3 });
  const [gewichtLog, setGewichtLog] = useState([]);
  const [nieuwGewicht, setNieuwGewicht] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessSaved, setShowSuccessSaved] = useState(false);
  const [contextHulp, setContextHulp] = useState(null);
  const scrollRef = useRef(null);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const K = 'KV_V42_MASTER_';

  useLayoutEffect(() => {
    const resetScroll = () => {
      if (scrollRef.current) { scrollRef.current.scrollTo(0, 0); }
      window.scrollTo(0, 0);
    };
    resetScroll();
    const t = setTimeout(resetScroll, 50);
    return () => clearTimeout(t);
  }, [pagina, geselecteerdRecept, uitlegSectie]);

  useEffect(() => {
    const savedUser = localStorage.getItem(K + 'user');
    const savedLog = localStorage.getItem(K + 'gewicht');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setProfiel(parsedUser);
      setWeekPlan(JSON.parse(localStorage.getItem(K + 'plan') || '{}'));
      setGewichtLog(JSON.parse(savedLog || '[]'));
      if (parsedUser.gewicht) setPagina('dashboard');
    }
  }, []);

  useEffect(() => {
    if (pagina !== 'welkom' && pagina !== 'onboarding' && pagina !== 'uitleg') {
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  const gaNaar = (doel) => {
    if (!profiel.gewicht || profiel.gewicht === "") { setShowErrorModal(true); } 
    else { setPagina(doel); setGeselecteerdRecept(null); }
  };

  const genereerPlan = (p, isFirstTime = false) => {
    if (!p.gewicht || p.gewicht === "") { setShowErrorModal(true); return; }
    setIsUpdating(true);
    if (isFirstTime && gewichtLog.length === 0) {
        setGewichtLog([{ datum: new Date().toLocaleDateString('nl-BE'), kg: p.gewicht }]);
    }
    setTimeout(() => {
      const gewichtNum = parseFloat(p.gewicht) || 90;
      let baseKcal = (10 * gewichtNum) + 900; 
      if (p.doel === 'Afvallen') baseKcal -= 400;
      if (p.doel === 'Spieropbouw') baseKcal += 400;
      const kcalPerMaaltijd = baseKcal / p.aantalMaaltijden;
      let tijdelijkPlan = {};
      dagenLijst.forEach(dag => {
        tijdelijkPlan[dag] = {};
        const match = (list) => list.sort((a,b) => Math.abs(a.macros.kcal - kcalPerMaaltijd) - Math.abs(b.macros.kcal - kcalPerMaaltijd))[Math.floor(Math.random()*3)];
        const o = recipesData.filter(r => r.maaltijd_type === 'ontbijt');
        const l = recipesData.filter(r => r.maaltijd_type === 'middagmaal');
        const d = recipesData.filter(r => r.maaltijd_type === 'diner');
        if (p.aantalMaaltijden === 1) tijdelijkPlan[dag].diner = match(d);
        else if (p.aantalMaaltijden === 2) { tijdelijkPlan[dag].ontbijt = match(o); tijdelijkPlan[dag].diner = match(d); }
        else { tijdelijkPlan[dag].ontbijt = match(o); tijdelijkPlan[dag].lunch = match(l); tijdelijkPlan[dag].diner = match(d); }
      });
      setWeekPlan(tijdelijkPlan); setProfiel(p); setIsUpdating(false); setPagina('dashboard');
    }, 600);
  };

  const fullReset = () => { localStorage.clear(); window.location.reload(); };

  const stats = (() => {
    if (gewichtLog.length < 1) return { start: 0, huidig: 0, verschil: "0.0" };
    const start = parseFloat(gewichtLog[0].kg);
    const huidig = parseFloat(gewichtLog[gewichtLog.length - 1].kg);
    return { start, huidig, verschil: (start - huidig).toFixed(1) };
  })();

  const getDagenBezig = () => {
    if (gewichtLog.length === 0) return 1;
    const dateParts = gewichtLog[0].datum.split(/[-/]/);
    const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    const diff = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  if (pagina === 'uitleg') {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic font-black uppercase">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-50">
          <button onClick={() => uitlegSectie === 'hoofd' ? setPagina('welkom') : setUitlegSectie('hoofd')} className="flex items-center gap-1 text-blue-600 font-bold text-sm uppercase italic">← TERUG</button>
          <span className="text-xs font-black bg-blue-600 text-white px-4 py-1 rounded-full uppercase italic">INFO</span>
        </header>
        <div className="p-6 space-y-6 overflow-y-auto">
          {uitlegSectie === 'hoofd' && (
            <div className="space-y-6">
              <h2 className="text-3xl border-b-8 border-blue-600 inline-block mb-2 italic">KETOVOOR INFO</h2>
              <p className="normal-case text-lg leading-tight font-bold text-gray-700 italic">KetoVoor combineert Keto en Carnivoor. Kies een onderwerp voor meer uitleg:</p>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setUitlegSectie('methode')} className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100 flex justify-between items-center italic"><span>1. DE METHODE</span> <ChevronRight/></button>
                <button onClick={() => setUitlegSectie('doelen')} className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100 flex justify-between items-center italic"><span>2. UW DOELEN</span> <ChevronRight/></button>
                <button onClick={() => setUitlegSectie('toekomst')} className="bg-gray-50 p-5 rounded-2xl border-2 border-gray-100 flex justify-between items-center italic"><span>3. NIEUWE START</span> <ChevronRight/></button>
              </div>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl mt-4 italic uppercase">NAAR MIJN PROFIEL →</button>
            </div>
          )}
          {uitlegSectie === 'methode' && (
            <div className="space-y-6"><h2 className="text-2xl border-b-4 border-blue-600 inline-block italic uppercase">DE KETOVOOR METHODE</h2><p className="normal-case text-lg font-bold text-gray-600 italic leading-snug">Het is een manier van eten die de kracht van vlees, vis en eieren gebruikt om uw lichaam te resetten, aangevuld met gezonde Keto-groenten.</p><button onClick={() => setUitlegSectie('hoofd')} className="w-full py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-black uppercase text-sm italic">TERUG</button></div>
          )}
          {uitlegSectie === 'doelen' && (
            <div className="space-y-6"><h2 className="text-2xl border-b-4 border-blue-600 inline-block italic uppercase">UW DOELEN</h2><div className="space-y-4 font-bold normal-case italic text-gray-700"><div className="border-l-4 border-blue-600 pl-3"><strong>Afvallen:</strong> Vetverbranding door stabiele suikerspiegels.</div><div className="border-l-4 border-blue-600 pl-3"><strong>Gezondheid:</strong> Meer energie en minder ontstekingen.</div><div className="border-l-4 border-blue-600 pl-3"><strong>Spieropbouw:</strong> Kracht door hoogwaardige eiwitten.</div></div><button onClick={() => setUitlegSectie('hoofd')} className="w-full py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-black uppercase text-sm italic">TERUG</button></div>
          )}
          {uitlegSectie === 'toekomst' && (
            <div className="space-y-6"><h2 className="text-2xl border-b-4 border-blue-600 inline-block italic uppercase">NIEUWE START</h2><p className="normal-case text-lg font-bold text-gray-600 italic leading-snug">Gebruik de app als tijdelijke reset of als een volledig nieuwe, blijvende levensstijl.</p><button onClick={() => setUitlegSectie('hoofd')} className="w-full py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-black uppercase text-sm italic">TERUG</button></div>
          )}
        </div>
      </div>
    );
  }

  if (pagina === 'hulp') {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic font-black uppercase">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
          <button onClick={() => setPagina('dashboard')} className="flex items-center gap-1 text-blue-600 font-bold text-base uppercase italic">← TERUG</button>
          <span className="text-xs font-black bg-blue-600 text-white px-4 py-1 rounded-full italic">HULP</span>
        </header>
        <div className="p-6 space-y-10 overflow-y-auto">
          <h2 className="text-3xl border-b-8 border-blue-600 inline-block mb-2 italic">HANDLEIDING</h2>
          <section className="space-y-3"><h3 className="text-xl font-black text-blue-800 uppercase italic">1. BEDOELING</h3><p className="text-base text-gray-600 font-bold italic normal-case leading-tight">De app berekent porties op basis van uw gewicht en doelstelling. Zo krijgt u precies de juiste energie binnen.</p></section>
          <section className="space-y-3"><h3 className="text-xl font-black text-blue-800 uppercase italic">2. MENU</h3><p className="text-base text-gray-600 font-bold italic normal-case leading-tight">Op "VANDAAG" ziet u de maaltijden. Klik op een kaart voor details. Gebruik "WISSEL" voor een nieuw voorstel.</p></section>
          <section className="space-y-3 bg-blue-50 p-5 rounded-2xl border-4 border-blue-100"><h3 className="text-xl font-black text-blue-700 uppercase underline decoration-blue-200">3. BELANGRIJK!</h3><p className="text-base text-blue-900 font-black italic normal-case leading-tight font-black">Wanneer u bent afgevallen, klik dan in "BEHEER" op "PLAN HERBEREKENEN" om de porties aan te passen.</p></section>
          <button onClick={() => setPagina('dashboard')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase text-2xl shadow-xl mt-10">IK BEGRIJP HET</button>
        </div>
      </div>
    );
  }

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-1 text-blue-600 font-black text-sm uppercase font-black">← TERUG</button>
          <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full uppercase">DETAILS</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-60 w-full object-cover bg-gray-50 border-b shadow-inner italic" />
        <div className="p-6 font-black italic">
          <h2 className="text-2xl font-black mb-6 uppercase text-blue-800 border-l-8 border-blue-600 pl-3">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black bg-blue-50/30 p-3 rounded-2xl border border-blue-100 italic">
             <div><p className="text-[9px] opacity-40 uppercase">KCAL</p><p className="text-base text-orange-600">{r.macros.kcal}</p></div>
             <div><p className="text-[9px] opacity-40 uppercase italic font-black">EIWIT</p><p className="text-base text-blue-700 font-black">{r.macros.eiwit}g</p></div>
             <div><p className="text-[9px] opacity-40 uppercase italic font-black">VET</p><p className="text-base text-yellow-600 font-black">{r.macros.vet}g</p></div>
             <div><p className="text-[9px] opacity-40 uppercase italic font-black">KOOLH.</p><p className="text-base text-green-600 font-black font-black font-black">{r.macros.carbs}g</p></div>
          </div>
          <div className="space-y-8 font-black">
              <h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block italic">INGRÉDIËNTEN</h3>
              <div className="space-y-1">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-2 text-base font-bold text-gray-700 font-black"><span>{ing.item}</span><span className="text-blue-700 font-black italic">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
              <h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block font-black italic">BEREIDING</h3>
              <div className="space-y-6">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-base leading-tight text-gray-700 font-medium border-l-4 border-blue-100 pl-4 italic font-black"><p>{ins}</p></div>)}</div>
              {r.tips && r.tips.length > 0 && (<div className="bg-amber-50 border-2 border-amber-100 p-5 rounded-2xl mt-6 italic font-black font-black"><h4 className="flex items-center gap-2 text-amber-800 text-xs font-black uppercase mb-2 italic"><Star size={16} fill="#92400e"/> TIP VAN DE CHEF:</h4><p className="text-base text-amber-900 italic font-black font-black">"{r.tips[0]}"</p></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center text-gray-900 select-none uppercase italic font-black">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden font-black">
        
        {/* CONTEXT HULP OVERLAY */}
        {contextHulp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-8 font-black italic uppercase">
             <div className="bg-white w-full rounded-[3rem] p-8 text-center shadow-2xl border-t-[12px] border-blue-600">
                <Info size={64} className="text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl mb-4 italic">UITLEG</h3>
                <p className="text-base text-gray-600 normal-case font-bold italic leading-snug font-black font-black">
                  {contextHulp === 'profiel' && "Dit zijn uw basisgegevens. Op basis van uw gewicht berekent de app exact de juiste porties voor uw doelstelling."}
                  {contextHulp === 'resultaat' && "Dit scherm toont uw voortgang. Het 'Netto Verlies' wordt berekend door uw allereerste weging te vergelijken met uw laatste."}
                </p>
                <button onClick={() => setContextHulp(null)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl mt-8 italic">BEGREPEN</button>
             </div>
          </div>
        )}

        <div ref={scrollRef} key={pagina} className="flex-grow overflow-y-auto pb-40 px-4 font-black">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-600 p-8 rounded-full shadow-2xl mb-8 text-white"><Utensils size={64} /></div>
              <h1 className="text-6xl font-black italic text-blue-600 mb-4 uppercase leading-none font-black">KETO<br/>VOOR</h1>
              <button onClick={() => setPagina('uitleg')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl active:scale-95 transition-all uppercase italic font-black font-black">START</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="pt-6 flex flex-col h-full italic">
              <div className="flex justify-between items-start mb-6 italic">
                <h2 className="text-3xl uppercase border-b-4 border-blue-600 inline-block font-black">UW PROFIEL</h2>
                <button onClick={() => setContextHulp('profiel')} className="text-blue-600 bg-blue-50 p-2 rounded-full active:scale-90 italic"><HelpCircle size={24} strokeWidth={3}/></button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center font-black">
                  <label className="text-[10px] uppercase text-blue-800 mb-2 block font-black italic">VUL UW GEWICHT IN (KG)</label>
                  <input type="text" inputMode="decimal" value={profiel.gewicht} placeholder="TYP UW GEWICHT" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-white border-2 border-blue-100 p-3 rounded-xl text-center font-black text-5xl text-blue-600 outline-none placeholder:text-blue-100 placeholder:text-base italic font-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-400 block font-black font-black italic font-black">WAT IS UW DOELSTELLING?</label>
                  <div className="flex flex-col gap-2">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`w-full p-4 rounded-xl text-sm font-black border-2 flex justify-between items-center transition-all italic ${profiel.doel === d ? 'border-blue-600 bg-blue-600 text-white shadow-lg font-black' : 'border-gray-100 text-gray-400 bg-gray-50'}`}><span>{d.toUpperCase()}</span>{profiel.doel === d && <CheckCircle size={20}/>}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-400 block font-black italic text-center font-black">MAALTIJDEN PER DAG</label>
                  <div className="grid grid-cols-3 gap-2 italic">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-4 rounded-xl text-2xl border-2 transition-all italic ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-300'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => genereerPlan(profiel, true)} className="mt-8 w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase text-xl shadow-xl active:scale-95 italic">PLAN GENEREREN</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="pt-6 italic font-black font-black font-black">
              <div className="flex flex-col gap-5 mb-10 italic">
                <div className="flex justify-between items-center italic">
                   <div><p className="text-[10px] uppercase text-blue-700 font-black italic tracking-widest font-black">VANDAAG</p><h2 className="text-6xl font-black uppercase italic tracking-tighter italic">MENU</h2></div>
                   <button onClick={() => genereerPlan(profiel)} className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl active:scale-90 flex flex-col items-center gap-1">
                      <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''}/><span className="text-[10px] font-black uppercase italic">WISSEL</span>
                   </button>
                </div>
                <button onClick={() => setPagina('hulp')} className="w-full bg-white text-blue-600 py-3 rounded-xl text-base font-black border-2 border-blue-600 flex items-center justify-center gap-2 mb-2 italic shadow-md font-black italic">HULP & UITLEG <HelpCircle size={20} strokeWidth={3}/></button>
              </div>
              <div className="space-y-4 font-black">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-sm active:scale-95 border-b-8">
                    <img src={`/recepten/${r.id}.jpg`} className="w-20 h-20 rounded-xl object-cover bg-gray-50 border shadow-sm font-black italic" />
                    <div className="flex-grow italic">
                      <p className="text-[9px] uppercase text-blue-700 font-black opacity-40 italic">{type}</p>
                      <h3 className="text-xl leading-tight mb-2 text-gray-800 uppercase italic font-black italic font-black">{r.titel}</h3>
                      <div className="flex gap-4 text-xs font-black text-gray-300 uppercase italic italic font-black"><span className="text-orange-500 font-black italic font-black font-black">{r.macros.kcal} KCAL</span><span className="text-blue-600 font-black font-black font-black font-black">{r.macros.eiwit}G EIWIT</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="pt-6 text-left italic font-black">
              <div className="flex justify-between items-start mb-6 italic">
                <h2 className="text-3xl uppercase border-b-4 border-blue-600 inline-block font-black">RESULTAAT</h2>
                <button onClick={() => setContextHulp('resultaat')} className="text-blue-600 bg-blue-50 p-2 rounded-full active:scale-90 italic"><HelpCircle size={24} strokeWidth={3}/></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6 font-black">
                 <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-xl text-center italic">
                    <p className="text-[10px] uppercase opacity-60 mb-1 italic font-black">NETTO VERLIES</p>
                    <p className="text-4xl tracking-tighter italic font-black font-black">{stats.verschil} KG</p>
                 </div>
                 <div className="bg-gray-50 p-5 rounded-2xl text-gray-700 text-center border-b-8 border-gray-200 shadow-inner font-black font-black">
                    <p className="text-[10px] uppercase opacity-40 mb-1 font-black italic font-black">DAGEN</p>
                    <p className="text-4xl font-black italic font-black font-black">{getDagenBezig()}</p>
                 </div>
              </div>
              <div className="bg-white p-5 rounded-2xl mb-6 border-2 border-gray-50 shadow-lg text-center font-black">
                <p className="text-[10px] uppercase text-gray-400 mb-2 italic underline decoration-blue-100 font-black font-black italic">NIEUWE WEGING OPSLAAN</p>
                <div className="flex items-center justify-center bg-gray-50 p-2 rounded-xl border border-gray-100 mb-4 font-black"><input type="text" inputMode="decimal" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-5xl text-blue-700 outline-none italic font-black" /><span className="text-xl text-blue-200 font-black italic italic font-black">KG</span></div>
                <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, weight: nieuwGewicht}); setNieuwGewicht(""); setShowSuccessSaved(true); } }} className="w-full bg-blue-700 text-white py-4 rounded-xl font-black uppercase text-base shadow-lg active:scale-95 italic font-black font-black">OPSLAAN</button>
              </div>
              <h3 className="uppercase text-[10px] font-black text-gray-400 mb-3 px-2 font-black italic"><History size={24}/> HISTORIEK</h3>
              <div className="space-y-2 font-black italic italic">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm italic italic font-black font-black">
                    <span className="text-gray-400 text-[10px] font-black uppercase italic italic font-black font-black font-black">{log.datum}</span>
                    <span className="text-2xl text-gray-800 font-black italic italic font-black">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="pt-10 italic font-black">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-600 inline-block mb-10 italic">WEEKPLAN</h2>
              <div className="space-y-4 italic font-black">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-4 rounded-3xl border-b-8 ${dag === vandaagNaam ? 'bg-blue-50 border-blue-200 shadow-xl italic font-black' : 'bg-white border-gray-50 opacity-50 shadow-inner italic font-black'}`}>
                    <h3 className={`uppercase text-lg mb-6 font-black italic italic ${dag === vandaagNaam ? 'text-blue-700 underline decoration-blue-200 font-black' : 'text-gray-500 font-black italic'}`}>{dag}</h3>
                    <div className="space-y-2 font-black italic">
                      {(weekPlan[dag] ? Object.entries(weekPlan[dag]) : []).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white p-5 rounded-[1.8rem] shadow-sm border-b-2 font-black italic italic font-black">
                          <div className="flex flex-col italic font-black font-black">
                             <span className="uppercase text-[10px] text-blue-700 font-black italic w-14 border-r pr-2 font-black italic font-black">{type}</span>
                             <span className="text-gray-800 uppercase text-lg italic font-black">{r.titel}</span>
                          </div>
                          <ChevronRight size={24} className="text-gray-100 italic" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'instellingen' && (
            <div className="pt-6 italic font-black">
              <h2 className="text-3xl uppercase border-b-4 border-blue-600 inline-block mb-6 font-black italic">BEHEER</h2>
              <div className="bg-blue-50 p-6 rounded-2xl mb-6 border border-blue-100 font-black italic font-black">
                <p className="text-[10px] text-blue-800 uppercase mb-4 border-b-2 border-blue-200 pb-1 text-center font-black italic italic font-black">UW PROFIEL</p>
                <div className="space-y-2 italic font-black">
                  <div className="flex justify-between items-center text-xl font-black italic font-black font-black"><span>GEWICHT</span> <span className="text-blue-700 italic font-black italic font-black">{profiel.weight || profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-sm uppercase text-gray-500 italic font-black font-black"><span>DOEL</span> <span className="text-blue-700 font-black font-black font-black italic font-black">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-lg italic italic font-black"><span>RITME</span> <span className="text-blue-700 italic font-black font-black italic font-black">{profiel.aantalMaaltijden} P/D</span></div>
                </div>
              </div>
              <div className="space-y-4 font-black italic font-black font-black">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-5 rounded-xl font-black uppercase text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 italic font-black font-black font-black font-black ${isUpdating ? 'bg-orange-500 animate-pulse font-black' : 'bg-blue-600 text-white font-black'}`}>
                    <RefreshCw size={36} className={isUpdating ? 'animate-spin text-white italic font-black' : ''} />{isUpdating ? 'SYNC...' : 'PLAN HERBEREKENEN'}</button>
                  <p className="text-[10px] text-gray-400 uppercase text-center font-black italic italic font-black">Klik hierboven na gewichtsverlies om uw menu bij te werken.</p>
              </div>
              <button onClick={() => setShowResetModal(true)} className="w-full py-4 text-red-600 font-black uppercase text-sm border-2 border-red-50 rounded-xl mt-12 hover:bg-red-50 italic font-black font-black font-black">WISSEN & OPNIEUW BEGINNEN</button>
            </div>
          )}
        </div>

        {/* CUSTOM MODALS */}
        {showErrorModal && (<div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 uppercase italic font-black"><div className="bg-white w-full rounded-[2.5rem] p-8 text-center shadow-2xl border-t-[10px] border-red-600 italic font-black"><XCircle size={100} className="text-red-600 mx-auto mb-4 italic font-black" /><h3 className="text-3xl font-black mb-2 italic">GEWICHT VERGETEN</h3><p className="text-base text-gray-600 mb-8 font-black leading-tight uppercase font-black font-black">U MOET EERST UW GEWICHT INVULLEN VOORDAT U VERDER KUNT GAAN.</p><button onClick={() => setShowErrorModal(false)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl uppercase italic italic font-black font-black">IK GA HET INVULLEN</button></div></div>)}
        {showResetModal && (<div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 uppercase italic font-black font-black"><div className="bg-white w-full rounded-[3.5rem] p-10 text-center shadow-2xl border-t-[15px] border-orange-500 font-black italic font-black"><AlertTriangle size={100} className="text-orange-500 mx-auto mb-4 animate-pulse font-black italic" /><h3 className="text-4xl font-black mb-4 italic italic font-black">ALLES WISSEN?</h3><p className="text-xl text-gray-600 mb-12 font-black italic uppercase italic italic font-black">WEET U ZEKER DAT U ALLES WILT WISSEN EN OPNIEUW WILT BEGINNEN?</p><div className="flex flex-col gap-4 font-black italic italic font-black"><button onClick={fullReset} className="w-full bg-red-600 text-white py-6 rounded-3xl font-black text-2xl uppercase italic font-black font-black">JA, WIS ALLES</button><button onClick={() => setShowResetModal(false)} className="w-full bg-gray-100 text-gray-600 py-4 rounded-3xl font-black text-lg uppercase italic font-black font-black">NEE, STOP</button></div></div></div>)}
        {showSuccessSaved && (<div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 uppercase italic font-black font-black"><div className="bg-white w-full rounded-[2.5rem] p-8 text-center shadow-2xl border-t-[10px] border-blue-600 font-black font-black font-black font-black font-black"><CheckCircle size={100} className="text-blue-600 mx-auto mb-6 font-black font-black font-black font-black" /><h3 className="text-3xl font-black mb-4 font-black italic uppercase italic font-black font-black">OPGESLAGEN!</h3><p className="text-lg text-gray-600 mb-10 font-black italic italic font-black italic font-black">UW NIEUWE GEWICHT IS GEREGISTREERD.</p><button onClick={() => { setShowSuccessSaved(false); setPagina('instellingen'); }} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg uppercase italic italic font-black font-black font-black">PAS MIJN PLAN NU AAN</button></div></div>)}

        {/* NAVIGATIE ONDERAAN */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 flex justify-around p-2 pb-10 shadow-2xl z-50 rounded-t-3xl font-black italic">
            <button onClick={() => gaNaar('dashboard')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'dashboard' ? 'text-blue-700 font-black italic font-black' : 'text-black opacity-80 font-black italic font-black'}`}><div className={`p-3 rounded-xl ${pagina === 'dashboard' ? 'bg-blue-50 font-black font-black' : 'bg-transparent font-black'} transition-all font-black font-black`}><Utensils size={28} strokeWidth={2.5} /></div><span className="text-[10px] uppercase font-black italic font-black italic font-black font-black">VANDAAG</span></button>
            <button onClick={() => gaNaar('planner')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'planner' ? 'text-blue-700 font-black italic font-black' : 'text-black opacity-80 font-black italic font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'planner' ? 'bg-blue-50 font-black font-black' : 'bg-transparent font-black'} transition-all font-black font-black font-black`}><Calendar size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black italic font-black font-black font-black">WEEKPLAN</span>
            </button>
            <button onClick={() => gaNaar('logboek')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'logboek' ? 'text-blue-700' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'logboek' ? 'bg-blue-50 font-black font-black' : 'bg-transparent font-black'} transition-all font-black font-black font-black font-black`}><Scale size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black italic font-black font-black font-black font-black">RESULTAAT</span>
            </button>
            <button onClick={() => gaNaar('instellingen')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'instellingen' ? 'text-blue-700 font-black' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'instellingen' ? 'bg-blue-50 font-black font-black' : 'bg-transparent font-black'} transition-all font-black font-black font-black font-black font-black`}><User size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black italic font-black font-black font-black font-black font-black italic">BEHEER</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;