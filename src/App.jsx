import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Zap, Target, History, TrendingDown, CheckCircle, ArrowUp, AlertCircle
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
  const [laatsteGewichtUpdate, setLaatsteGewichtUpdate] = useState(false);
  const scrollRef = useRef(null);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const K = 'KV_V16_FINAL_';

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

  useEffect(() => {
    if (pagina !== 'welkom' && pagina !== 'onboarding') {
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  const handleScroll = (e) => { setShowBackToTop(e.target.scrollTop > 200); };
  const scrollToTop = () => { scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); };

  const genereerPlan = (p, isFirstTime = false) => {
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

  const dagenBezig = gewichtLog.length > 0 ? Math.max(1, Math.ceil((new Date() - new Date(gewichtLog[0].datum.split('-').reverse().join('-'))) / (1000*60*60*24))) : 1;

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-1 text-blue-700 font-black text-base italic uppercase">← TERUG</button>
          <span className="text-xs font-black bg-blue-600 text-white px-4 py-1 rounded-full uppercase italic">GERECHT</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-60 w-full object-cover bg-gray-50" />
        <div className="p-6">
          <h2 className="text-3xl font-black mb-6 uppercase italic leading-none text-blue-800">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black bg-gray-50 p-3 rounded-2xl border-2 border-gray-100 italic">
             <div className="border-r border-gray-200"><p className="text-[10px] opacity-50 uppercase">Kcal</p><p className="text-base text-orange-600">{r.macros.kcal}</p></div>
             <div className="border-r border-gray-200"><p className="text-[10px] opacity-50 uppercase">Eiwit</p><p className="text-base text-blue-600">{r.macros.eiwit}g</p></div>
             <div className="border-r border-gray-200"><p className="text-[10px] opacity-50 uppercase">Vet</p><p className="text-base text-yellow-600">{r.macros.vet}g</p></div>
             <div><p className="text-[10px] opacity-50 uppercase">Koolh.</p><p className="text-base text-green-600">{r.macros.carbs}g</p></div>
          </div>
          <div className="space-y-8 italic">
              <h3 className="font-black uppercase text-sm border-b-4 border-blue-600 pb-1 inline-block">INGRÉDIËNTEN</h3>
              <div className="space-y-2">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-3 text-lg font-bold text-gray-700"><span>{ing.item}</span><span className="text-blue-700 font-black uppercase text-base">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
              <h3 className="font-black uppercase text-sm border-b-4 border-blue-600 pb-1 inline-block">BEREIDING</h3>
              <div className="space-y-6">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-lg leading-snug text-gray-700 font-medium border-l-4 border-blue-100 pl-4 italic"><p>{ins}</p></div>)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 font-sans flex justify-center text-gray-900 select-none">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        <div ref={scrollRef} onScroll={handleScroll} className="flex-grow overflow-y-auto pb-44 px-4 italic font-black">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl mb-8 text-white"><Utensils size={80} /></div>
              <h1 className="text-7xl font-black italic text-blue-600 mb-2 uppercase leading-none">KETO<br/>VOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-xs mb-16">Eenvoudig Gezond Eten</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black text-3xl shadow-xl active:scale-95 transition-all uppercase">START NU</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="pt-10 flex flex-col h-full italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block self-start mb-10 italic">DE QUIZ</h2>
              <div className="space-y-8">
                <div className="bg-blue-50 p-5 rounded-3xl border-2 border-blue-100 text-center italic">
                  <label className="text-xs uppercase text-blue-800 mb-3 block tracking-widest font-black italic">GEWICHT IN KILOGRAM</label>
                  <input type="number" value={profiel.gewicht} placeholder="95" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-white border-4 border-blue-200 p-4 rounded-2xl text-center font-black text-6xl text-blue-700 outline-none shadow-sm" />
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic font-black">WAT IS UW DOEL?</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-5 rounded-2xl text-xl font-black border-4 flex justify-between items-center transition-all ${profiel.doel === d ? 'border-blue-600 bg-blue-600 text-white shadow-xl' : 'border-gray-200 text-gray-400 bg-gray-50'}`}><span className="uppercase">{d}</span>{profiel.doel === d && <CheckCircle size={28}/>}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic text-center font-black">AANTAL MAALTIJDEN PER DAG</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-5 rounded-2xl text-4xl border-4 transition-all ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { if(profiel.gewicht) genereerPlan(profiel, true); else alert("Vul gewicht in."); }} className="mt-12 w-full bg-gray-900 text-white py-8 rounded-3xl font-black uppercase text-2xl shadow-xl active:scale-95 italic">PLAN BEREKENEN</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="pt-10 italic">
              <div className="flex justify-between items-center mb-8">
                <div><p className="text-xs uppercase text-blue-600 font-black italic tracking-widest">VANDAAG</p><h2 className="text-6xl font-black uppercase italic tracking-tighter italic">MENU</h2></div>
                <button onClick={() => genereerPlan(profiel)} className="bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-xl active:scale-90 flex flex-col items-center gap-1">
                   <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''}/>
                   <span className="text-[10px] font-black uppercase italic">WISSEL</span>
                </button>
              </div>
              <div className="space-y-4 font-black italic">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-100 rounded-3xl p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-all border-b-8 border-gray-200">
                    <img src={`/recepten/${r.id}.jpg`} className="w-20 h-20 rounded-2xl object-cover shadow-sm bg-gray-50 border-2 border-white" />
                    <div className="flex-grow">
                      <p className="text-[10px] uppercase text-blue-600 font-black opacity-50 tracking-widest italic">{type}</p>
                      <h3 className="text-lg leading-tight mb-1 text-gray-800 uppercase italic font-black">{r.titel}</h3>
                      <div className="flex gap-4 text-[10px] font-black text-gray-300 uppercase italic"><span className="text-orange-600">{r.macros.kcal} KCAL</span><span className="text-blue-600">{r.macros.eiwit}G EI</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="pt-10 text-left italic">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-600 inline-block mb-10 italic italic">RESULTAAT</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-10 font-black italic">
                 <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl text-center">
                    <p className="text-xs uppercase opacity-60 mb-2 italic">NETTO VERLIES</p>
                    <p className="text-5xl tracking-tighter italic">{stats.verschil} KG</p>
                 </div>
                 <div className="bg-gray-100 p-6 rounded-3xl text-gray-600 text-center border-b-8 border-gray-200 italic">
                    <p className="text-xs uppercase opacity-40 mb-2 italic">DAGEN</p>
                    <p className="text-5xl italic">{dagenBezig}</p>
                 </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-[2.5rem] mb-10 border-2 border-gray-100 italic">
                <p className="text-xs uppercase text-gray-600 mb-5 text-center font-black italic">VOER UW GEWICHT VAN VANDAAG IN</p>
                <div className="flex items-center justify-center bg-white p-4 rounded-2xl border-4 border-gray-200 mb-4 italic">
                    <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-6xl text-blue-700 outline-none italic" />
                    <span className="text-xl text-blue-200 font-black italic">KG</span>
                </div>
                <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, gewicht: nieuwGewicht}); setNieuwGewicht(""); setLaatsteGewichtUpdate(true); } }} className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xl shadow-xl active:scale-95 italic italic font-black">GEWICHT OPSLAAN</button>
              </div>

              {laatsteGewichtUpdate && (
                <div className="bg-orange-50 border-4 border-orange-400 p-6 rounded-3xl mb-10 animate-bounce text-center">
                    <AlertCircle size={40} className="mx-auto text-orange-600 mb-3" />
                    <p className="text-lg font-black text-orange-800 uppercase leading-none mb-4 italic">Gewicht aangepast naar {profiel.gewicht}kg!</p>
                    <button onClick={() => genereerPlan(profiel)} className="bg-orange-600 text-white w-full py-4 rounded-xl font-black text-lg uppercase shadow-lg">MENU NU BIJWERKEN →</button>
                    <p className="text-[10px] text-orange-700 font-bold mt-4 uppercase italic italic">DIT PAST UW PORTIES AAN UW NIEUW GEWICHT AAN</p>
                </div>
              )}

              <h3 className="uppercase text-sm font-black text-gray-400 mb-6 flex items-center gap-2 px-2 italic italic font-black"><History size={20}/> HISTORIEK</h3>
              <div className="space-y-2 font-black italic">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center px-6 py-4 bg-white border-2 border-gray-50 rounded-2xl shadow-sm italic">
                    <span className="text-gray-400 text-xs uppercase italic font-black italic">{log.datum}</span>
                    <span className="text-2xl text-gray-800 font-black italic">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="pt-10 italic">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-600 inline-block mb-10 italic">WEEKPLAN</h2>
              <div className="space-y-4">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-4 rounded-3xl border-b-4 ${dag === vandaagNaam ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <h3 className={`uppercase text-base mb-3 font-black italic italic ${dag === vandaagNaam ? 'text-blue-700 underline decoration-blue-200' : 'text-gray-500'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="grid grid-cols-1 gap-1">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl shadow-sm active:bg-blue-50 border border-gray-100 italic">
                          <span className="uppercase text-[9px] text-blue-700 font-black italic w-12 italic">{type}</span>
                          <span className="flex-grow text-gray-800 font-black text-sm truncate uppercase italic tracking-tighter">{r.titel}</span>
                          <ChevronRight size={18} className="text-gray-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'instellingen' && (
            <div className="pt-10 italic">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-600 inline-block mb-10 italic italic font-black">BEHEER</h2>
              
              <div className="bg-gray-50 p-6 rounded-3xl mb-8 border-2 border-gray-100 font-black italic italic italic">
                <p className="text-[10px] text-gray-400 uppercase mb-6 tracking-widest text-center border-b border-gray-200 pb-2 italic">UW ACTIEF PROFIEL</p>
                <div className="space-y-4 italic font-black">
                  <div className="flex justify-between items-center text-2xl italic font-black italic font-black italic font-black"><span>GEWICHT</span> <span className="text-blue-700">{profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-base italic uppercase text-gray-500 font-black italic"><span>DOEL</span> <span>{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-xl italic italic font-black"><span>RITME</span> <span>{profiel.aantalMaaltijden} P/DAG</span></div>
                </div>
              </div>

              <div className="bg-blue-600 p-6 rounded-3xl shadow-xl mb-12 italic italic font-black italic">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-6 rounded-2xl font-black uppercase text-xl mb-4 shadow-xl flex items-center justify-center gap-4 italic ${isUpdating ? 'bg-orange-500 animate-pulse' : 'bg-white text-blue-700 shadow-blue-800'}`}>
                    <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''} />
                    {isUpdating ? 'BEZIG...' : 'PLAN HERBEREKENEN'}
                  </button>
                  <p className="text-[11px] text-white/80 leading-snug uppercase text-center font-black px-2 italic italic">Heeft u een nieuw gewicht? Klik hierboven. De app past al uw maaltijden aan voor de komende week.</p>
              </div>

              <button onClick={() => { if(window.confirm("Alle gegevens wissen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-8 text-red-600 font-black uppercase text-base border-2 border-dashed border-red-200 rounded-3xl mt-12 hover:bg-red-50 transition-all italic">WISSEN & OPNIEUW BEGINNEN</button>
            </div>
          )}

        </div>

        {/* ZWEVENDE TERUGKNOP */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-36 right-6 bg-blue-700 text-white p-5 rounded-full shadow-2xl active:scale-90 transition-all z-[100] border-4 border-white"><ArrowUp size={36} strokeWidth={5} /></button>
        )}

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-[8px] border-gray-100 flex justify-around p-2 pb-12 shadow-2xl z-50 rounded-t-[4rem] font-black italic italic font-black">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'dashboard' ? 'text-blue-700' : 'text-gray-400'}`}>
                <div className={`p-4 rounded-2xl ${pagina === 'dashboard' ? 'bg-blue-700 text-white shadow-2xl scale-110 -translate-y-1' : 'bg-transparent text-black'} transition-all`}><Utensils size={32} strokeWidth={4} /></div>
                <span className="text-[10px] uppercase tracking-tighter italic">VANDAAG</span>
            </button>
            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'planner' ? 'text-blue-700' : 'text-gray-400'}`}>
                <div className={`p-4 rounded-2xl ${pagina === 'planner' ? 'bg-blue-700 text-white shadow-2xl scale-110 -translate-y-1' : 'bg-transparent text-black'} transition-all`}><Calendar size={32} strokeWidth={4} /></div>
                <span className="text-[10px] uppercase tracking-tighter italic">WEEKPLAN</span>
            </button>
            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'logboek' ? 'text-blue-700' : 'text-gray-400'}`}>
                <div className={`p-4 rounded-2xl ${pagina === 'logboek' ? 'bg-blue-700 text-white shadow-2xl scale-110 -translate-y-1' : 'bg-transparent text-black'} transition-all`}><Scale size={32} strokeWidth={4} /></div>
                <span className="text-[10px] uppercase tracking-tighter italic">RESULTAAT</span>
            </button>
            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'instellingen' ? 'text-blue-700' : 'text-gray-400'}`}>
                <div className={`p-4 rounded-2xl ${pagina === 'instellingen' ? 'bg-blue-700 text-white shadow-2xl scale-110 -translate-y-1' : 'bg-transparent text-black'} transition-all`}><User size={32} strokeWidth={4} /></div>
                <span className="text-[10px] uppercase tracking-tighter italic">BEHEER</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;