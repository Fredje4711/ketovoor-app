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
  const scrollRef = useRef(null);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const K = 'KV_V28_LOCKED_';

  // --- FORCEER SCROLL NAAR BOVEN BIJ PAGINAWISSEL ---
  useLayoutEffect(() => {
    const resetScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo(0, 0);
        scrollRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };
    resetScroll();
    const t = setTimeout(resetScroll, 50);
    return () => clearTimeout(t);
  }, [pagina, geselecteerdRecept]);

  useEffect(() => {
    const savedUser = localStorage.getItem(K + 'user');
    const savedLog = localStorage.getItem(K + 'gewicht');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setProfiel(parsedUser);
      setWeekPlan(JSON.parse(localStorage.getItem(K + 'plan') || '{}'));
      setGewichtLog(JSON.parse(savedLog || '[]'));
      // Enkel naar dashboard als gewicht echt bekend is
      if (parsedUser.gewicht) setPagina('dashboard');
    }
  }, []);

  useEffect(() => {
    if (pagina !== 'welkom' && pagina !== 'onboarding') {
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  // --- BEVEILIGDE NAVIGATIE ---
  const gaNaarPagina = (doel) => {
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

  if (pagina === 'hulp') {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic font-black uppercase">
        <header className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
          <button onClick={() => setPagina('dashboard')} className="flex items-center gap-1 text-blue-600 font-bold text-base uppercase">← TERUG</button>
          <span className="text-xs font-black bg-blue-600 text-white px-4 py-1 rounded-full uppercase">INFO</span>
        </header>
        <div className="p-8 space-y-10 overflow-y-auto">
          <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-2 italic">HOE WERKT HET?</h2>
          <div className="space-y-8 italic font-black">
            <div className="flex gap-4"><div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg">1</div><p className="text-xl leading-tight font-bold text-gray-700 italic">DEZE APP BEREKENT MAALTIJDEN OP BASIS VAN UW GEWICHT.</p></div>
            <div className="flex gap-4"><div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg">2</div><p className="text-xl leading-tight font-bold text-gray-700 italic">WILT U IETS ANDERS ETEN? KLIK OP "WISSEL GERECHTEN".</p></div>
            <div className="flex gap-4 border-l-8 border-orange-400 pl-4 py-4 bg-orange-50"><p className="text-orange-900 font-black uppercase text-base italic">BELANGRIJK: NA GEWICHTSVERLIES, KLIK IN "BEHEER" OP "PLAN HERBEREKENEN".</p></div>
          </div>
          <button onClick={() => setPagina('dashboard')} className="w-full bg-blue-600 text-white py-7 rounded-[2rem] font-black uppercase text-2xl shadow-xl mt-10">BEGREPEN</button>
        </div>
      </div>
    );
  }

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic font-black uppercase">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm font-black">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-1 text-blue-600 font-black text-sm italic">← TERUG</button>
          <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full italic font-black uppercase tracking-widest text-gray-400 italic font-black italic">RECEPT</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-50 border-b" />
        <div className="p-6 italic font-black italic font-black">
          <h2 className="text-3xl font-black mb-6 uppercase leading-tight text-blue-800 border-l-8 border-blue-600 pl-3 italic font-black italic">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black bg-blue-50/50 p-4 rounded-3xl border border-blue-100 italic font-black">
             <div><p className="text-[9px] opacity-40 uppercase">KCAL</p><p className="text-base text-orange-600 font-black italic font-black">{r.macros.kcal}</p></div>
             <div><p className="text-[9px] opacity-40 uppercase italic">EIWIT</p><p className="text-base text-blue-700 font-black italic font-black">{r.macros.eiwit}g</p></div>
             <div><p className="text-[9px] opacity-40 uppercase italic">VET</p><p className="text-base text-yellow-600 font-black italic font-black font-black">{r.macros.vet}g</p></div>
             <div><p className="text-[9px] opacity-40 uppercase italic font-black">KOOLH.</p><p className="text-base text-green-600 font-black italic font-black italic font-black">{r.macros.carbs}g</p></div>
          </div>
          <div className="space-y-10">
              <div>
                <h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block mb-4 tracking-widest italic font-black">INGRÉDIËNTEN</h3>
                <div className="space-y-2 italic font-black">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-3 text-lg font-bold text-gray-700"><span>{ing.item}</span><span className="text-blue-700 font-black tracking-tighter uppercase italic">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
              </div>
              <div>
                <h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block mb-4 tracking-widest italic font-black">BEREIDING</h3>
                <div className="space-y-6 italic font-black">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-lg leading-snug text-gray-700 font-medium border-l-4 border-blue-100 pl-4 italic"><p>{ins}</p></div>)}</div>
              </div>
              {r.tips && r.tips.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl mt-6 italic">
                   <h4 className="flex items-center gap-2 text-amber-800 text-sm font-black uppercase mb-3"><Star size={18} fill="#92400e"/> TIP VAN DE CHEF:</h4>
                   <ul className="space-y-2 italic">{r.tips.map((tip, i) => <li key={i} className="text-lg text-amber-900 leading-tight">"{tip}"</li>)}</ul>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center text-gray-900 select-none uppercase italic font-black">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        <div ref={scrollRef} key={pagina} className="flex-grow overflow-y-auto pb-44 px-4 italic font-black font-black">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-600 p-8 rounded-full shadow-2xl mb-8 text-white italic font-black"><Utensils size={64} /></div>
              <h1 className="text-7xl font-black italic text-blue-600 mb-2 uppercase leading-none italic font-black">KETO<br/>VOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-sm mb-16 italic font-black">Professional Trayect</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black text-3xl shadow-xl active:scale-95 transition-all uppercase">START</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="pt-10 flex flex-col h-full italic">
              <h2 className="text-4xl uppercase border-b-4 border-blue-600 inline-block self-start mb-10 italic font-black">UW PROFIEL</h2>
              <div className="space-y-10 font-black italic">
                <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 text-center">
                  <label className="text-xs uppercase text-blue-800 mb-3 block tracking-widest font-black italic">VUL UW GEWICHT IN (KG)</label>
                  <input type="text" inputMode="decimal" value={profiel.gewicht} placeholder="TYP UW GEWICHT" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-white border-4 border-blue-300 p-6 rounded-3xl text-center font-black text-5xl text-blue-700 outline-none placeholder:text-blue-100 placeholder:text-xl italic" />
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block font-black">UW DOELSTELLING</label>
                  <div className="grid grid-cols-1 gap-2 italic">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-5 rounded-2xl text-xl font-black border-2 flex justify-between items-center transition-all italic ${profiel.doel === d ? 'border-blue-700 bg-blue-700 text-white shadow-xl' : 'border-gray-100 text-gray-400 bg-gray-50'}`}><span className="uppercase font-black">{d}</span>{profiel.doel === d && <CheckCircle size={24}/>}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic text-center font-black">MAALTIJDEN PER DAG</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-5 rounded-2xl text-4xl border-2 transition-all italic ${profiel.aantalMaaltijden === n ? 'border-blue-700 bg-blue-700 text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => genereerPlan(profiel, true)} className="mt-12 w-full bg-gray-900 text-white py-7 rounded-[2rem] font-black uppercase text-2xl shadow-xl active:scale-95 italic">PLAN GENEREREN</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="pt-10 italic font-black">
              <div className="flex flex-col gap-5 mb-10">
                <div className="flex justify-between items-center italic font-black">
                   <div><p className="text-xs uppercase text-blue-700 font-black italic tracking-widest italic font-black">VANDAAG</p><h2 className="text-6xl font-black uppercase italic tracking-tighter">MENU</h2></div>
                   <button onClick={() => genereerPlan(profiel)} className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black italic">
                      <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''}/>
                      <span className="text-[10px] font-black uppercase italic font-black">WISSEL</span>
                   </button>
                </div>
                <button onClick={() => setPagina('hulp')} className="w-full bg-white text-blue-600 py-6 rounded-[2rem] text-xl font-black border-4 border-blue-600 flex items-center justify-center gap-3 active:bg-blue-100 shadow-lg italic">HULP & UITLEG <HelpCircle size={32} strokeWidth={3}/></button>
              </div>
              <div className="space-y-5 font-black italic font-black">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-5 flex items-center gap-5 shadow-sm active:scale-95 transition-all border-b-8">
                    <img src={`/recepten/${r.id}.jpg`} className="w-24 h-24 rounded-[1.8rem] object-cover bg-gray-50 border shadow-sm font-black" />
                    <div className="flex-grow italic font-black">
                      <p className="text-[10px] uppercase text-blue-700 font-black opacity-40 italic">{type}</p>
                      <h3 className="text-2xl leading-none mb-3 text-gray-800 uppercase italic font-black italic font-black tracking-tight">{r.titel}</h3>
                      <div className="flex gap-4 text-xs font-black text-gray-300 uppercase italic italic font-black"><span className="text-orange-500 font-black italic font-black">{r.macros.kcal} KCAL</span><span className="text-blue-600 font-black italic font-black">{r.macros.eiwit}G EIWIT</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="pt-10 text-left italic font-black font-black">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-600 inline-block mb-10 italic font-black italic">RESULTAAT</h2>
              <div className="grid grid-cols-2 gap-4 mb-10 font-black italic">
                 <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl text-center italic font-black">
                    <p className="text-[10px] uppercase opacity-60 mb-1 italic">TOTAAL VERLIES</p>
                    <p className="text-6xl tracking-tighter italic font-black">{stats.verschil} KG</p>
                 </div>
                 <div className="bg-gray-50 p-8 rounded-3xl text-gray-700 text-center border-b-8 border-gray-200 shadow-inner italic font-black">
                    <p className="text-[10px] uppercase opacity-40 mb-1 font-black italic">DAGEN</p>
                    <p className="text-6xl font-black italic">{getDagenBezig()}</p>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] mb-10 border-4 border-gray-50 shadow-xl italic font-black">
                <p className="text-xs uppercase text-gray-400 mb-6 text-center font-black italic underline decoration-blue-200 font-black">METING OPSLAAN</p>
                <div className="flex flex-col gap-6 font-black italic">
                  <div className="flex items-center justify-center bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 italic">
                    <input type="text" inputMode="decimal" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-7xl text-blue-700 outline-none italic font-black" />
                    <span className="text-3xl text-blue-200 font-black italic">KG</span>
                  </div>
                  <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, weight: nieuwGewicht}); setNieuwGewicht(""); setLaatsteGewichtUpdate(true); } }} className="w-full bg-blue-700 text-white py-6 rounded-3xl font-black uppercase text-2xl shadow-xl active:scale-95 italic">METING OPSLAAN</button>
                </div>
              </div>

              {laatsteGewichtUpdate && (
                <div className="bg-orange-50 border-8 border-orange-400 p-8 rounded-[3rem] mb-10 animate-bounce text-center italic font-black">
                    <AlertCircle size={56} className="mx-auto text-orange-600 mb-4 font-black italic" />
                    <p className="text-2xl font-black text-orange-900 uppercase leading-none mb-6 italic">GEWICHT IS AANGEPAST!</p>
                    <button onClick={() => genereerPlan(profiel)} className="bg-orange-600 text-white w-full py-6 rounded-2xl font-black text-xl uppercase shadow-2xl italic font-black">PLAN NU BIJWERKEN →</button>
                </div>
              )}

              <h3 className="uppercase text-sm font-black text-gray-400 mb-6 flex items-center gap-2 px-2 italic font-black"><History size={24}/> HISTORIEK</h3>
              <div className="space-y-3 font-black italic font-black">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center px-8 py-5 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm font-black italic">
                    <span className="text-gray-400 text-xs font-black uppercase italic">{log.datum}</span>
                    <span className="text-2xl text-gray-800 font-black italic">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="pt-10 italic font-black font-black">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-600 inline-block mb-10 italic font-black italic">WEEKPLAN</h2>
              <div className="space-y-6 font-black italic">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-4 rounded-3xl border-b-4 ${dag === vandaagNaam ? 'bg-blue-50 border-blue-400 shadow-xl ring-2 ring-blue-100 italic' : 'bg-white border-gray-100 opacity-60 shadow-sm'}`}>
                    <h3 className={`uppercase text-lg mb-4 font-black italic ${dag === vandaagNaam ? 'text-blue-700 underline decoration-blue-200' : 'text-gray-500 font-black italic'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="grid grid-cols-1 gap-2 italic">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-sm active:bg-blue-50 border border-gray-50 italic">
                          <div className="flex items-center gap-4 italic font-black font-black">
                             <span className="uppercase text-[10px] text-blue-700 font-black italic w-14 border-r pr-2 font-black italic">{type}</span>
                             <span className="text-gray-800 font-black text-lg uppercase italic tracking-tighter italic font-black">{r.titel}</span>
                          </div>
                          <ChevronRight size={24} className="text-gray-200 font-black italic" />
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
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-10 italic font-black">BEHEER</h2>
              
              <div className="bg-blue-50 p-10 rounded-[3.5rem] mb-12 border-4 border-blue-100 font-black italic">
                <p className="text-xs text-blue-800 uppercase mb-8 tracking-widest font-black italic border-b-2 border-blue-200 pb-2 text-center font-black italic">UW ACTIEF PROFIEL</p>
                <div className="space-y-8 italic font-black">
                  <div className="flex justify-between items-center text-3xl font-black"><span>GEWICHT</span> <span className="text-blue-700 italic font-black">{profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-xl font-black text-gray-500 italic uppercase"><span>DOEL</span> <span className="text-blue-700 font-black italic">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-2xl italic font-black"><span>RITME</span> <span className="text-blue-700 italic font-black">{profiel.aantalMaaltijden} P/D</span></div>
                </div>
              </div>

              <div className="space-y-6 font-black italic">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 italic ${isUpdating ? 'bg-orange-500 animate-pulse font-black' : 'bg-blue-600 text-white font-black'}`}>
                    <RefreshCw size={36} className={isUpdating ? 'animate-spin text-white' : 'text-white shadow-xl'} />
                    {isUpdating ? 'SYNC...' : 'PLAN HERBEREKENEN'}
                  </button>
                  <p className="text-xs text-gray-400 uppercase text-center font-black px-6 italic font-black">KLIK HIERBOVEN OM UW MAALTIJDEN AAN TE PASSEN AAN UW NIEUW GEWICHT.</p>
              </div>

              <button onClick={() => setShowResetModal(true)} className="w-full py-6 text-red-600 font-black uppercase text-base border-4 border-red-50 rounded-[3rem] mt-16 hover:bg-red-600 hover:text-white transition-all italic font-black font-black">WISSEN & OPNIEUW BEGINNEN</button>
            </div>
          )}

        </div>

        {/* --- CUSTOM MODALS (GEMAAKT DOOR MIJ, GEEN SYSTEEM POPUPS) --- */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 uppercase italic font-black">
             <div className="bg-white w-full rounded-[3.5rem] p-10 text-center shadow-2xl border-t-[15px] border-red-600">
                <XCircle size={100} className="text-red-600 mx-auto mb-6" />
                <h3 className="text-4xl font-black mb-4 italic font-black">GEWICHT VERGETEN</h3>
                <p className="text-xl text-gray-600 mb-12 font-black italic leading-tight uppercase font-black">U MOET EERST UW GEWICHT INVULLEN VOORDAT U VERDER KUNT GAAN.</p>
                <button onClick={() => setShowErrorModal(false)} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl uppercase italic font-black">IK GA HET INVULLEN</button>
             </div>
          </div>
        )}

        {showResetModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 uppercase italic font-black font-black">
             <div className="bg-white w-full rounded-[3.5rem] p-10 text-center shadow-2xl border-t-[15px] border-orange-500 font-black italic font-black">
                <AlertTriangle size={100} className="text-orange-500 mx-auto mb-6 animate-pulse" />
                <h3 className="text-4xl font-black mb-4 italic font-black">ALLES WISSEN?</h3>
                <p className="text-xl text-gray-600 mb-12 font-black italic uppercase italic">WEET U ZEKER DAT U ALLES WILT WISSEN EN OPNIEUW WILT BEGINNEN?</p>
                <div className="flex flex-col gap-4 font-black italic font-black">
                  <button onClick={fullReset} className="w-full bg-red-600 text-white py-6 rounded-3xl font-black text-2xl uppercase italic font-black font-black">JA, WIS ALLES</button>
                  <button onClick={() => setShowResetModal(false)} className="w-full bg-gray-100 text-gray-600 py-4 rounded-3xl font-black text-lg uppercase italic font-black">NEE, STOP</button>
                </div>
             </div>
          </div>
        )}

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 pb-10 shadow-2xl z-50 rounded-t-3xl font-black italic italic font-black font-black">
            <button onClick={() => gaNaarPagina('dashboard')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'dashboard' ? 'text-blue-700 font-black' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'dashboard' ? 'bg-blue-50 font-black font-black font-black' : 'bg-transparent font-black font-black font-black'} transition-all`}><Utensils size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black">VANDAAG</span>
            </button>
            <button onClick={() => gaNaarPagina('planner')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'planner' ? 'text-blue-700 font-black' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'planner' ? 'bg-blue-50 font-black font-black' : 'bg-transparent font-black font-black'} transition-all`}><Calendar size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black italic">WEEKPLAN</span>
            </button>
            <button onClick={() => gaNaarPagina('logboek')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'logboek' ? 'text-blue-700 font-black' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'logboek' ? 'bg-blue-50 font-black font-black' : 'bg-transparent font-black font-black'} transition-all`}><Scale size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black italic">RESULTAAT</span>
            </button>
            <button onClick={() => gaNaarPagina('instellingen')} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'instellingen' ? 'text-blue-700 font-black' : 'text-black opacity-80 font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'instellingen' ? 'bg-blue-50 font-black font-black' : 'bg-transparent font-black font-black'} transition-all`}><User size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black italic">BEHEER</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;