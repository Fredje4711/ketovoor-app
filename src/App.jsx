import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Zap, Target, History, TrendingDown, CheckCircle, ArrowUp
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
  const [showScrollTop, setShowBackToTop] = useState(false);
  const scrollRef = useRef(null);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const K = 'KV_V15_SENIOR_';

  // --- 1. LADEN ---
  useEffect(() => {
    const savedUser = localStorage.getItem(K + 'user');
    const savedLog = localStorage.getItem(K + 'gewicht');
    if (savedUser) {
      setProfiel(JSON.parse(savedUser));
      setWeekPlan(JSON.parse(localStorage.getItem(K + 'plan') || '{}'));
      setGewichtLog(JSON.parse(savedLog || '[]'));
      setPagina('dashboard');
    }
  }, []);

  // --- 2. OPSLAAN ---
  useEffect(() => {
    if (pagina !== 'welkom' && pagina !== 'onboarding') {
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  // Scroll detectie voor zwevende knop
  const handleScroll = (e) => {
    setShowBackToTop(e.target.scrollTop > 300);
  };

  const scrollToTop = () => {
    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 3. LOGICA ---
  const genereerPlan = (p, isFirstTime = false) => {
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
      setPagina('dashboard');
    }, 600);
  };

  const startGewicht = gewichtLog.length > 0 ? parseFloat(gewichtLog[0].kg) : parseFloat(profiel.gewicht) || 0;
  const huidigGewicht = gewichtLog.length > 0 ? parseFloat(gewichtLog[gewichtLog.length - 1].kg) : parseFloat(profiel.gewicht) || 0;
  const totaalVerlies = (startGewicht - huidigGewicht).toFixed(1);
  const dagenBezig = gewichtLog.length > 0 ? Math.max(1, Math.ceil((new Date() - new Date(gewichtLog[0].datum.split('-').reverse().join('-'))) / (1000*60*60*24))) : 1;

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x">
        <header className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-2 text-blue-600 font-black text-sm">← TERUG</button>
          <span className="text-xs font-black bg-blue-50 text-blue-600 px-4 py-1 rounded-full uppercase tracking-tighter">{r.maaltijd_type}</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-50 shadow-inner" />
        <div className="p-6">
          <h2 className="text-3xl font-black mb-6 uppercase leading-tight text-gray-800">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black">
             <div className="bg-gray-50 p-2 rounded-xl border border-gray-100"><Flame size={20} className="mx-auto text-orange-500 mb-1"/><p className="text-[10px] opacity-60 uppercase">Kcal</p><p className="text-sm">{r.macros.kcal}</p></div>
             <div className="bg-blue-50 p-2 rounded-xl border border-blue-100"><ShieldCheck size={20} className="mx-auto text-blue-500 mb-1"/><p className="text-[10px] opacity-60 uppercase">Eiwit</p><p className="text-sm">{r.macros.eiwit}g</p></div>
             <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100"><Zap size={20} className="mx-auto text-yellow-600 mb-1"/><p className="text-[10px] opacity-60 uppercase">Vet</p><p className="text-sm">{r.macros.vet}g</p></div>
             <div className="bg-green-50 p-2 rounded-xl border border-green-100"><TrendingDown size={20} className="mx-auto text-green-600 mb-1"/><p className="text-[10px] opacity-60 uppercase">Koolh.</p><p className="text-sm">{r.macros.carbs}g</p></div>
          </div>
          <div className="space-y-10">
            <div>
              <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2"><div className="w-8 h-1 bg-blue-600"></div> Benodigdheden</h3>
              <div className="space-y-2">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-3 text-lg font-bold text-gray-700"><span>{ing.item}</span><span className="text-blue-600 font-black">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2"><div className="w-8 h-1 bg-blue-600"></div> Bereidingswijze</h3>
              <div className="space-y-6">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-lg leading-relaxed text-gray-700"><span className="bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black shadow-lg">{i+1}</span><p>{ins}</p></div>)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 font-sans flex justify-center text-gray-900 select-none font-bold">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        <div ref={scrollRef} onScroll={handleScroll} className="flex-grow overflow-y-auto pb-44 px-4">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl mb-12 text-white"><Utensils size={72} /></div>
              <h1 className="text-6xl font-black italic text-blue-600 mb-4 uppercase leading-none">KETOVOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-sm mb-16">Eenvoudig Gezond Eten</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black text-2xl shadow-xl active:scale-95 transition-all uppercase">START NU</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="pt-10 flex flex-col h-full">
              <h2 className="text-4xl font-black uppercase italic border-b-8 border-blue-600 self-start mb-10">DE QUIZ</h2>
              <div className="space-y-10">
                <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 text-center">
                  <label className="text-sm font-black uppercase text-gray-400 mb-4 block tracking-widest">Uw huidig gewicht (KG)</label>
                  <input type="number" value={profiel.gewicht} placeholder="95" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-40 bg-white border-4 border-blue-100 p-4 rounded-2xl text-center font-black text-5xl text-blue-600 outline-none shadow-inner" />
                </div>
                <div>
                  <label className="text-sm font-black uppercase text-gray-400 mb-4 block tracking-widest">Wat is uw doel?</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-6 rounded-2xl text-lg font-black border-4 flex justify-between items-center transition-all ${profiel.doel === d ? 'border-blue-600 bg-blue-600 text-white shadow-xl' : 'border-gray-100 text-gray-400 bg-gray-50'}`}><span className="uppercase">{d}</span>{profiel.doel === d && <CheckCircle size={24}/>}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-black uppercase text-gray-400 mb-4 block tracking-widest text-center">Maaltijden per dag</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-6 rounded-2xl text-3xl font-black border-4 transition-all ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { if(profiel.gewicht) genereerPlan(profiel, true); else alert("Vul aub uw gewicht in."); }} className="mt-16 w-full bg-gray-900 text-white py-8 rounded-3xl font-black uppercase text-xl shadow-2xl active:scale-95 transition-all">BEREKEN MIJN PLAN</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="pt-10">
              <div className="flex justify-between items-end mb-10">
                <div><p className="text-xs uppercase text-blue-600 tracking-[0.2em] mb-1 font-black">VANDAAG • {vandaagNaam}</p><h2 className="text-6xl font-black uppercase italic tracking-tighter">MENU</h2></div>
                <button onClick={() => genereerPlan(profiel)} className="flex flex-col items-center gap-1 group">
                   <div className={`p-5 rounded-full shadow-2xl bg-blue-600 text-white active:scale-75 transition-all ${isUpdating ? 'animate-spin' : ''}`}><RefreshCw size={32}/></div>
                   <span className="text-[10px] font-black text-blue-600 uppercase">Wissel Gerechten</span>
                </button>
              </div>
              <div className="space-y-6">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-4 border-gray-50 rounded-[3rem] p-5 flex items-center gap-6 shadow-md active:scale-95 transition-all border-b-[12px] border-gray-100">
                    <img src={`/recepten/${r.id}.jpg`} className="w-24 h-24 rounded-[2rem] object-cover bg-gray-100 shadow-md border-2 border-white" />
                    <div className="flex-grow">
                      <p className="text-xs uppercase text-blue-600 mb-1 font-black opacity-50">{type}</p>
                      <h3 className="text-xl leading-none mb-2 text-gray-800 uppercase italic font-black">{r.titel}</h3>
                      <div className="flex gap-4 text-[10px] font-black text-gray-300 uppercase italic"><span className="flex items-center gap-1 text-orange-500">{r.macros.kcal} KCAL</span><span className="flex items-center gap-1 text-blue-600">{r.macros.eiwit}G EI</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="pt-10 text-left">
              <h2 className="text-4xl font-black uppercase italic border-b-8 border-blue-600 inline-block mb-10">RESULTAAT</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl text-center flex flex-col justify-center">
                    <p className="text-xs uppercase font-black opacity-60 mb-2 tracking-widest">Totaal Verlies</p>
                    <p className="text-5xl font-black italic">{totaalVerlies} KG</p>
                 </div>
                 <div className="bg-gray-100 p-8 rounded-[2.5rem] text-gray-600 text-center border-b-[10px] border-gray-200 shadow-inner flex flex-col justify-center font-black italic">
                    <p className="text-xs uppercase font-black opacity-40 mb-2 tracking-widest italic">Dagen Bezig</p>
                    <p className="text-5xl">{dagenBezig}</p>
                 </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-[3rem] mb-12 border-2 border-gray-100 shadow-sm">
                <p className="text-sm font-black uppercase text-gray-400 mb-6 text-center tracking-widest">Meting van vandaag invoeren</p>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-center bg-white p-6 rounded-[2rem] border-4 border-gray-200">
                    <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-6xl text-blue-600 outline-none" />
                    <span className="text-2xl text-blue-200 font-black">KG</span>
                  </div>
                  <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, gewicht: nieuwGewicht}); setNieuwGewicht(""); alert("Uw gewicht is opgeslagen!"); } }} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black uppercase text-2xl shadow-xl active:scale-95 transition-all">METING OPSLAAN</button>
                </div>
              </div>

              <h3 className="uppercase text-sm font-black text-gray-400 mb-6 tracking-widest flex items-center gap-2 italic"><History size={20}/> Historiek</h3>
              <div className="space-y-4 font-black italic">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm">
                    <span className="text-gray-400 text-xs font-black uppercase italic">{log.datum}</span>
                    <span className="text-3xl text-gray-800 italic">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="pt-10">
              <h2 className="text-4xl font-black uppercase italic border-b-8 border-blue-600 inline-block mb-10">WEEKPLAN</h2>
              <div className="space-y-10">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-8 rounded-[3rem] transition-all border-b-[12px] ${dag === vandaagNaam ? 'bg-blue-50 border-blue-200 shadow-xl' : 'bg-white border-gray-100 opacity-60 shadow-inner'}`}>
                    <h3 className={`uppercase text-lg mb-6 tracking-widest font-black italic ${dag === vandaagNaam ? 'text-blue-600' : 'text-gray-400'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="space-y-4">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border-b-2 border-gray-100 active:bg-blue-50">
                          <div className="flex flex-col"><span className="uppercase text-[10px] text-blue-600 font-black mb-1 opacity-50 tracking-widest italic">{type}</span><span className="text-gray-800 uppercase italic font-black text-sm">{r.titel}</span></div>
                          <ChevronRight size={24} className="text-gray-200 shrink-0"/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'instellingen' && (
            <div className="pt-10">
              <h2 className="text-4xl font-black uppercase italic border-b-8 border-blue-600 inline-block mb-10">BEHEER</h2>
              
              <div className="bg-white p-10 rounded-[3rem] mb-12 shadow-xl border-4 border-gray-50 font-black italic">
                <p className="text-xs text-gray-400 uppercase mb-8 tracking-[0.3em] text-center border-b border-gray-100 pb-4 italic font-black">Actief Profiel</p>
                <div className="space-y-8">
                  <div className="flex justify-between items-center text-3xl italic"><span>GEWICHT</span> <span className="text-blue-600 font-black underline decoration-blue-100">{profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-xl italic uppercase font-black"><span>DOEL</span> <span className="text-blue-600 font-black italic">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-3xl italic"><span>MAALTIJDEN</span> <span className="text-blue-600 font-black italic font-black italic">{profiel.aantalMaaltijden} P/D</span></div>
                </div>
              </div>

              <div className="bg-blue-50 p-8 rounded-[3rem] border-4 border-blue-100 shadow-2xl mb-12 font-black italic italic">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-8 rounded-[2rem] font-black uppercase text-2xl mb-6 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 ${isUpdating ? 'bg-orange-500 animate-pulse' : 'bg-blue-600 text-white font-black'}`}>
                    <RefreshCw size={32} className={isUpdating ? 'animate-spin' : ''} />
                    {isUpdating ? 'EVEN GEDULD...' : 'PLAN HERBEREKENEN'}
                  </button>
                  <p className="text-sm text-blue-700 leading-relaxed uppercase text-center font-black px-4 italic">Klik hierboven om de porties aan te passen aan uw nieuw gewicht.</p>
              </div>

              <button onClick={() => { if(window.confirm("Alle gegevens wissen en opnieuw beginnen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-10 text-red-600 font-black uppercase text-lg border-t-2 border-dashed border-red-100 mt-10 hover:text-red-800 transition-all underline decoration-red-200">WISSEN & OPNIEUW BEGINNEN</button>
            </div>
          )}

        </div>

        {/* ZWEVENDE TERUGKNOP */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-32 right-8 bg-blue-600 text-white p-5 rounded-full shadow-2xl active:scale-90 transition-all z-[100] border-4 border-white"><ArrowUp size={32} strokeWidth={4} /></button>
        )}

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-[8px] border-gray-100 flex justify-around p-2 pb-12 shadow-2xl z-50 rounded-t-[4rem] font-black italic italic">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 ${pagina === 'dashboard' ? 'text-blue-600 scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}>
                <Utensils size={36} strokeWidth={pagina === 'dashboard' ? 4 : 2} />
                <span className={`text-[11px] uppercase tracking-tighter font-black ${pagina === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`}>VANDAAG</span>
            </button>
            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 ${pagina === 'planner' ? 'text-blue-600 scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}>
                <Calendar size={36} strokeWidth={pagina === 'planner' ? 4 : 2} />
                <span className={`text-[11px] uppercase tracking-tighter font-black ${pagina === 'planner' ? 'text-blue-600' : 'text-gray-500'}`}>WEEKPLAN</span>
            </button>
            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 ${pagina === 'logboek' ? 'text-blue-600 scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}>
                <Scale size={36} strokeWidth={pagina === 'logboek' ? 4 : 2} />
                <span className={`text-[11px] uppercase tracking-tighter font-black ${pagina === 'logboek' ? 'text-blue-600' : 'text-gray-500'}`}>RESULTAAT</span>
            </button>
            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 ${pagina === 'instellingen' ? 'text-blue-600 scale-110' : 'text-gray-400 opacity-60 hover:opacity-100'}`}>
                <User size={36} strokeWidth={pagina === 'instellingen' ? 4 : 2} />
                <span className={`text-[11px] uppercase tracking-tighter font-black ${pagina === 'instellingen' ? 'text-blue-600' : 'text-gray-500'}`}>BEHEER</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;