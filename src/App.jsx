import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Zap, Target, History, TrendingDown, CheckCircle, ArrowUp, Star, AlertCircle, HelpCircle, XCircle, AlertTriangle
} from 'lucide-react';
import recipesData from './data/recipes.json';

function App() {
  const [pagina, setPagina] = useState('welkom'); 
  const [geselecteerdRecept, setGeselecteerdRecept] = useState(null);
  const [weekPlan, setWeekPlan] = useState({});
  const [profiel, setProfiel] = useState({ gewicht: "", doel: 'Afvallen', aantalMaaltijden: 3 });
  const [gewichtLog, setGewichtLog] = useState([]);
  const [nieuwGewicht, setNieuwGewicht] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [laatsteGewichtUpdate, setLaatsteGewichtUpdate] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessSaved, setShowSuccessSaved] = useState(false);
  const scrollRef = useRef(null);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const K = 'KV_V37_FINAL_MASTER_';

  // --- FORCEER SCROLL NAAR BOVEN BIJ PAGINAWISSEL ---
  useLayoutEffect(() => {
    const resetScroll = () => {
      if (scrollRef.current) { scrollRef.current.scrollTo(0, 0); }
      window.scrollTo(0, 0);
    };
    resetScroll();
    const t = setTimeout(resetScroll, 50);
    return () => clearTimeout(t);
  }, [pagina, geselecteerdRecept]);

  // --- LADEN ---
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

  // --- OPSLAAN ---
  useEffect(() => {
    if (pagina !== 'welkom' && pagina !== 'onboarding') {
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  // --- FUNCTIES ---
  const gaNaar = (doel) => {
    if (!profiel.gewicht || profiel.gewicht === "") {
      setShowErrorModal(true);
    } else {
      setPagina(doel);
      setGeselecteerdRecept(null);
    }
  };

  const genereerPlan = (p, isFirstTime = false) => {
    if (!p.gewicht || p.gewicht === "") {
      setShowErrorModal(true);
      return;
    }
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
        const o = recipesData.filter(r => r.maaltijd_type === 'ontbijt');
        const l = recipesData.filter(r => r.maaltijd_type === 'middagmaal');
        const d = recipesData.filter(r => r.maaltijd_type === 'diner');
        const match = (list) => list.sort((a,b) => Math.abs(a.macros.kcal - kcalPerMaaltijd) - Math.abs(b.macros.kcal - kcalPerMaaltijd))[Math.floor(Math.random()*3)];
        
        if (p.aantalMaaltijden === 1) tijdelijkPlan[dag].diner = match(d);
        else if (p.aantalMaaltijden === 2) { tijdelijkPlan[dag].ontbijt = match(o); tijdelijkPlan[dag].diner = match(d); }
        else { tijdelijkPlan[dag].ontbijt = match(o); tijdelijkPlan[dag].lunch = match(l); tijdelijkPlan[dag].diner = match(d); }
      });
      setWeekPlan(tijdelijkPlan);
      setProfiel(p);
      setIsUpdating(false);
      setLaatsteGewichtUpdate(false);
      setPagina('dashboard');
    }, 600);
  };

  const fullReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const stats = (() => {
    if (gewichtLog.length < 1) return { start: 0, huidig: 0, verschil: "0.0" };
    const start = parseFloat(gewichtLog[0].kg);
    const huidig = parseFloat(gewichtLog[gewichtLog.length - 1].kg);
    return { start, huidig, verschil: (start - huidig).toFixed(1) };
  })();

  const getDagenBezig = () => {
    if (gewichtLog.length === 0) return 1;
    try {
      const dateParts = gewichtLog[0].datum.split(/[-/]/);
      const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      const diff = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch(e) { return 1; }
  };

  // --- HULP SCHERM (VOLLEDIGE UITLEG) ---
  if (pagina === 'hulp') {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic font-black uppercase">
        <header className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
          <button onClick={() => setPagina('dashboard')} className="flex items-center gap-1 text-blue-600 font-bold text-base uppercase">← TERUG</button>
          <span className="text-xs font-black bg-blue-600 text-white px-4 py-1 rounded-full">INFO</span>
        </header>
        <div className="p-8 space-y-12 overflow-y-auto">
          <h2 className="text-3xl border-b-8 border-blue-600 inline-block mb-2 italic">HANDLEIDING</h2>
          
          <section className="space-y-4">
            <h3 className="text-xl font-black text-blue-800 border-l-8 border-blue-600 pl-3 leading-none italic">1. DE BEDOELING</h3>
            <p className="text-lg text-gray-600 leading-tight font-bold">De app berekent exact uw maaltijden op basis van uw gewicht en doelstelling. Zo krijgt u precies de juiste energie binnen.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-blue-800 border-l-8 border-blue-600 pl-3 leading-none italic">2. HET MENU</h3>
            <p className="text-lg text-gray-600 leading-tight font-bold">Op het scherm "VANDAAG" ziet u de maaltijden. Klik op een gerecht voor de details. Gebruik de knop "WISSEL" voor een nieuw voorstel.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-blue-800 border-l-8 border-blue-600 pl-3 leading-none italic">3. RESULTAAT</h3>
            <p className="text-lg text-gray-600 leading-tight font-bold">Vul onder "RESULTAAT" uw gewicht in. De app onthoudt uw startpunt en laat zien hoeveel u bent afgevallen.</p>
          </section>

          <section className="space-y-4 bg-orange-50 p-6 rounded-3xl border-4 border-orange-200">
            <h3 className="text-xl font-black text-orange-900 leading-none italic uppercase">4. BELANGRIJK!</h3>
            <p className="text-base text-orange-800 leading-tight font-black">NA GEWICHTSVERLIES MOET U IN HET "BEHEER" SCHERM OP "PLAN HERBEREKENEN" KLIKKEN OM UW PORTIES BIJ TE WERKEN.</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-red-800 border-l-8 border-red-600 pl-3 leading-none italic">5. OPNIEUW BEGINNEN</h3>
            <p className="text-lg text-gray-600 leading-tight font-bold">Wilt u alle gegevens wissen en weer helemaal vanaf nul beginnen? Gebruik dan de knop onderaan in het "BEHEER" scherm.</p>
          </section>

          <button onClick={() => setPagina('dashboard')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase text-2xl shadow-xl mt-10">BEGREPEN</button>
        </div>
      </div>
    );
  }

  // --- RECEPT DETAILS ---
  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-50">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-1 text-blue-600 font-black text-sm uppercase italic">← TERUG</button>
          <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full uppercase">RECEPT</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-50 border-b shadow-inner" />
        <div className="p-6">
          <h2 className="text-2xl font-black mb-6 uppercase text-blue-800 border-l-8 border-blue-600 pl-3 italic">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black bg-blue-50/50 p-4 rounded-3xl border border-blue-100 italic uppercase text-[10px]">
             <div><p className="opacity-40">KCAL</p><p className="text-base text-orange-600">{r.macros.kcal}</p></div>
             <div><p className="opacity-40 font-black">EIWIT</p><p className="text-base text-blue-700">{r.macros.eiwit}g</p></div>
             <div><p className="opacity-40 font-black">VET</p><p className="text-base text-yellow-600">{r.macros.vet}g</p></div>
             <div><p className="opacity-40 font-black">KOOLH.</p><p className="text-base text-green-600">{r.macros.carbs}g</p></div>
          </div>
          <div className="space-y-10 font-black italic">
              <div><h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block mb-4">INGRÉDIËNTEN</h3><div className="space-y-1">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-3 text-lg font-bold"><span>{ing.item}</span><span className="text-blue-700 font-black uppercase">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div></div>
              <div><h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block mb-4">BEREIDING</h3><div className="space-y-6">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-lg leading-snug text-gray-700 font-medium border-l-4 border-blue-100 pl-4 italic"><p>{ins}</p></div>)}</div></div>
              {r.tips && r.tips.length > 0 && (<div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl mt-6 italic"><h4 className="flex items-center gap-2 text-amber-800 text-sm font-black uppercase mb-3"><Star size={18} fill="#92400e"/> TIP VAN DE CHEF:</h4><p className="text-lg text-amber-900 leading-tight italic">"{r.tips[0]}"</p></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center text-gray-900 select-none uppercase italic font-black">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        <div ref={scrollRef} key={pagina} className="flex-grow overflow-y-auto pb-44 px-4 font-black">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-600 p-8 rounded-full shadow-2xl mb-8 text-white"><Utensils size={64} /></div>
              <h1 className="text-6xl font-black italic text-blue-600 mb-4 uppercase leading-none">KETO<br/>VOOR</h1>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black text-3xl shadow-xl active:scale-95 transition-all uppercase italic">START</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="pt-6 flex flex-col h-full italic">
              <h2 className="text-3xl uppercase border-b-4 border-blue-600 inline-block self-start mb-6">UW PROFIEL</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center italic font-black">
                  <label className="text-[10px] uppercase text-blue-800 mb-2 block font-black italic">VUL UW GEWICHT IN (KG)</label>
                  <input type="text" inputMode="decimal" value={profiel.gewicht} placeholder="TYP UW GEWICHT" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-white border-2 border-blue-100 p-3 rounded-xl text-center font-black text-5xl text-blue-700 outline-none placeholder:text-blue-100 placeholder:text-base italic font-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-400 block font-black">UW DOELSTELLING</label>
                  {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                    <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-4 rounded-xl text-sm font-black border-2 flex justify-between items-center transition-all italic ${profiel.doel === d ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-gray-100 text-gray-400 bg-gray-50'}`}><span>{d.toUpperCase()}</span>{profiel.doel === d && <CheckCircle size={20}/>}</button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-4 rounded-xl text-2xl border-2 transition-all italic ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-600 text-white shadow-md font-black' : 'bg-gray-50 text-gray-300'}`}>{n}</button>
                  ))}
                </div>
              </div>
              <button onClick={() => genereerPlan(profiel, true)} className="mt-8 w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase text-xl shadow-xl active:scale-95 italic">PLAN GENEREREN</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="pt-6 italic font-black">
              <div className="flex flex-col gap-5 mb-10">
                <div className="flex justify-between items-center italic font-black">
                   <div><p className="text-[10px] uppercase text-blue-700 font-black italic tracking-widest">VANDAAG</p><h2 className="text-6xl font-black uppercase italic tracking-tighter">MENU</h2></div>
                   <button onClick={() => genereerPlan(profiel)} className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl active:scale-90 flex flex-col items-center gap-1">
                      <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''}/>
                      <span className="text-[10px] font-black uppercase">WISSEL</span>
                   </button>
                </div>
                <button onClick={() => setPagina('hulp')} className="w-full bg-white text-blue-600 py-6 rounded-[2rem] text-xl font-black border-4 border-blue-600 flex items-center justify-center gap-3 active:bg-blue-100 shadow-lg italic">HULP & UITLEG <HelpCircle size={32} strokeWidth={3}/></button>
              </div>
              <div className="space-y-4 font-black italic">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border border-gray-100 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-all border-b-8">
                    <img src={`/recepten/${r.id}.jpg`} className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border shadow-sm font-black italic" />
                    <div className="flex-grow">
                      <p className="text-[10px] uppercase text-blue-700 font-black opacity-40 italic tracking-widest">{type}</p>
                      <h3 className="text-lg leading-tight mb-2 text-gray-800 uppercase italic font-black tracking-tight font-black">{r.titel}</h3>
                      <div className="flex gap-4 text-xs font-black text-gray-300 uppercase italic italic font-black"><span className="text-orange-500 font-black">{r.macros.kcal} KCAL</span><span className="text-blue-600 font-black">{r.macros.eiwit}G EIWIT</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="pt-6 text-left italic font-black font-black">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-600 inline-block mb-10 italic">RESULTAAT</h2>
              <div className="grid grid-cols-2 gap-4 mb-10 font-black italic">
                 <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl text-center italic font-black italic">
                    <p className="text-[10px] uppercase opacity-60 mb-1 font-black italic">NETTO VERLIES</p>
                    <p className="text-6xl tracking-tighter italic">{stats.verschil} KG</p>
                 </div>
                 <div className="bg-gray-100 p-8 rounded-3xl text-gray-700 text-center border-b-8 border-gray-200 shadow-inner font-black italic font-black">
                    <p className="text-[10px] uppercase opacity-40 mb-1 font-black italic">DAGEN</p>
                    <p className="text-6xl font-black italic">{getDagenBezig()}</p>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-3xl mb-10 border-4 border-gray-50 shadow-xl italic font-black font-black italic">
                <p className="text-xs uppercase text-gray-400 mb-6 text-center font-black italic underline decoration-blue-200">METING VANDAAG OPSLAAN</p>
                <div className="flex flex-col gap-6 italic">
                  <div className="flex items-center justify-center bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 italic font-black">
                    <input type="text" inputMode="decimal" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-7xl text-blue-700 outline-none font-black italic" />
                    <span className="text-3xl text-blue-200 font-black italic italic">KG</span>
                  </div>
                  <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, weight: nieuwGewicht}); setNieuwGewicht(""); setShowSuccessSaved(true); } }} className="w-full bg-blue-700 text-white py-6 rounded-3xl font-black uppercase text-xl shadow-lg active:scale-95 italic font-black">OPSLAAN</button>
                </div>
              </div>

              <h3 className="uppercase text-sm font-black text-gray-400 mb-6 flex items-center gap-2 px-2 font-black italic"><History size={24}/> HISTORIEK</h3>
              <div className="space-y-3 font-black italic">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center px-8 py-5 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm italic font-black">
                    <span className="text-gray-400 text-[10px] font-black uppercase italic font-black">{log.datum}</span>
                    <span className="text-3xl text-gray-800 font-black italic italic">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="pt-10 italic font-black">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-600 inline-block mb-10 italic">WEEKPLAN</h2>
              <div className="space-y-6 font-black italic font-black">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-4 rounded-3xl border-b-8 ${dag === vandaagNaam ? 'bg-blue-50 border-blue-200 shadow-xl italic font-black' : 'bg-white border-gray-50 opacity-50 shadow-inner'}`}>
                    <h3 className={`uppercase text-lg mb-6 font-black italic italic ${dag === vandaagNaam ? 'text-blue-700 underline decoration-blue-200 font-black' : 'text-gray-500'}`}>{dag} {dag === vandaagNaam && "• ACTUEEL"}</h3>
                    <div className="space-y-4 italic font-black">
                      {(weekPlan[dag] ? Object.entries(weekPlan[dag]) : []).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-2 font-black italic italic">
                          <div className="flex flex-col italic font-black">
                             <span className="uppercase text-[10px] text-blue-700 font-black italic w-14 border-r pr-2 font-black italic">{type}</span>
                             <span className="text-gray-800 uppercase text-lg font-black">{r.titel}</span>
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
            <div className="pt-10 italic font-black">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-10 font-black italic">BEHEER</h2>
              <div className="bg-blue-50 p-10 rounded-[3.5rem] mb-12 border-4 border-blue-100 font-black italic font-black">
                <p className="text-xs text-blue-800 uppercase mb-8 border-b-2 border-blue-200 pb-2 text-center font-black italic italic font-black">UW ACTIEF PROFIEL</p>
                <div className="space-y-8 italic font-black">
                  <div className="flex justify-between items-center text-3xl font-black italic font-black"><span>GEWICHT</span> <span className="text-blue-700 italic font-black font-black">{profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-xl uppercase text-gray-500 italic"><span>DOEL</span> <span className="text-blue-700 font-black italic">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-2xl italic font-black"><span>RITME</span> <span className="text-blue-700 italic font-black italic">{profiel.aantalMaaltijden} P/D</span></div>
                </div>
              </div>
              <div className="space-y-6 font-black italic font-black">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 italic font-black ${isUpdating ? 'bg-orange-500 animate-pulse' : 'bg-blue-600 text-white font-black'}`}>
                    <RefreshCw size={36} className={isUpdating ? 'animate-spin text-white' : ''} />
                    {isUpdating ? 'SYNC...' : 'PLAN HERBEREKENEN'}
                  </button>
                  <p className="text-xs text-gray-400 uppercase text-center font-black italic font-black">KLIK HIERBOVEN OM UW MAALTIJDEN AAN TE PASSEN AAN UW NIEUW GEWICHT.</p>
              </div>
              <button onClick={() => setShowResetModal(true)} className="w-full py-6 text-red-600 font-black uppercase text-sm border-4 border-red-50 rounded-[3rem] mt-16 hover:bg-red-600 hover:text-white transition-all italic font-black font-black">WISSEN & OPNIEUW BEGINNEN</button>
            </div>
          )}
        </div>

        {/* --- CUSTOM MODALS --- */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 uppercase italic font-black font-black">
             <div className="bg-white w-full rounded-[2.5rem] p-10 text-center shadow-2xl border-t-[15px] border-red-600 italic">
                <XCircle size={100} className="text-red-600 mx-auto mb-6 italic" />
                <h3 className="text-4xl font-black mb-4 italic italic font-black">GEWICHT VERGETEN</h3>
                <p className="text-xl text-gray-600 mb-12 font-black italic leading-tight uppercase font-black font-black">U MOET EERST UW GEWICHT INVULLEN VOORDAT U VERDER KUNT GAAN.</p>
                <button onClick={() => setShowErrorModal(false)} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl uppercase italic italic">IK GA HET INVULLEN</button>
             </div>
          </div>
        )}

        {showResetModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 uppercase italic font-black font-black">
             <div className="bg-white w-full rounded-[3.5rem] p-10 text-center shadow-2xl border-t-[15px] border-orange-500 font-black italic font-black font-black">
                <AlertTriangle size={100} className="text-orange-500 mx-auto mb-6 animate-pulse" />
                <h3 className="text-4xl font-black mb-4 italic">ALLES WISSEN?</h3>
                <p className="text-xl text-gray-600 mb-12 font-black italic uppercase italic italic font-black italic">WEET U ZEKER DAT U ALLES WILT WISSEN EN OPNIEUW WILT BEGINNEN?</p>
                <div className="flex flex-col gap-4 font-black italic italic font-black">
                  <button onClick={fullReset} className="w-full bg-red-600 text-white py-6 rounded-3xl font-black text-2xl uppercase font-black italic font-black">JA, WIS ALLES</button>
                  <button onClick={() => setShowResetModal(false)} className="w-full bg-gray-100 text-gray-600 py-4 rounded-3xl font-black text-lg uppercase italic font-black italic">NEE, STOP</button>
                </div>
             </div>
          </div>
        )}

        {showSuccessSaved && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 uppercase italic font-black font-black">
             <div className="bg-white w-full rounded-[3.5rem] p-10 text-center shadow-2xl border-t-[15px] border-blue-600 font-black">
                <CheckCircle size={100} className="text-blue-600 mx-auto mb-6 font-black font-black italic font-black">
                <h3 className="text-3xl font-black mb-4 font-black italic italic font-black">OPGESLAGEN!</h3>
                <p className="text-lg text-gray-600 mb-10 font-black italic italic font-black italic">UW NIEUWE GEWICHT IS GEREGISTREERD.</p>
                <p className="text-sm text-blue-600 font-black mb-6 uppercase italic italic">KLIK HIERNA OP DE BLAUWE KNOP 'PLAN HERBEREKENEN' OM UW MENU BIJ TE WERKEN.</p>
                <button onClick={() => { setShowSuccessSaved(false); setPagina('instellingen'); }} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl uppercase italic italic">PAS MIJN PLAN NU AAN</button>
                </CheckCircle>
             </div>
          </div>
        )}

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 pb-10 shadow-2xl z-50 rounded-t-3xl font-black italic">
            <button onClick={() => gaNaar('dashboard')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'dashboard' ? 'text-blue-700' : 'text-black opacity-80'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'dashboard' ? 'bg-blue-50 font-black' : 'bg-transparent'} transition-all font-black`}><Utensils size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic italic font-black font-black">VANDAAG</span>
            </button>
            <button onClick={() => gaNaar('planner')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'planner' ? 'text-blue-700' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'planner' ? 'bg-blue-50 font-black' : 'bg-transparent'} transition-all font-black`}><Calendar size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic italic font-black font-black">WEEKPLAN</span>
            </button>
            <button onClick={() => gaNaar('logboek')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'logboek' ? 'text-blue-700' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'logboek' ? 'bg-blue-50' : 'bg-transparent'} transition-all font-black`}><Scale size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic italic font-black font-black">RESULTAAT</span>
            </button>
            <button onClick={() => gaNaar('instellingen')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'instellingen' ? 'text-blue-700' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'instellingen' ? 'bg-blue-50' : 'bg-transparent'} transition-all font-black`}><User size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black italic font-black font-black">BEHEER</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;