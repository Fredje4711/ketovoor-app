import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Zap, Target, History, TrendingDown, CheckCircle, ArrowUp, Star
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
  const K = 'KV_V18_ELEGANT_';

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

  const handleScroll = (e) => { 
    setShowBackToTop(e.target.scrollTop > 200);
  };
  
  const scrollToTop = () => {
    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-50 shadow-sm">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-1 text-blue-600 font-black text-sm uppercase">← TERUG</button>
          <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full uppercase italic">GERECHT DETAILS</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-50 border-b" />
        <div className="p-6">
          <h2 className="text-3xl font-black mb-6 uppercase leading-tight text-blue-800">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black bg-blue-50/30 p-4 rounded-2xl border border-blue-100 italic">
             <div><p className="text-[10px] opacity-40 uppercase">KCAL</p><p className="text-lg text-orange-600">{r.macros.kcal}</p></div>
             <div><p className="text-[10px] opacity-40 uppercase">EIWIT</p><p className="text-lg text-blue-700">{r.macros.eiwit}g</p></div>
             <div><p className="text-[10px] opacity-40 uppercase">VET</p><p className="text-lg text-yellow-600">{r.macros.vet}g</p></div>
             <div><p className="text-[10px] opacity-40 uppercase">KOOLH.</p><p className="text-lg text-green-600">{r.macros.carbs}g</p></div>
          </div>
          
          <div className="space-y-10">
              <div>
                <h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block mb-4 tracking-widest">INGRÉDIËNTEN</h3>
                <div className="space-y-2">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-3 text-lg font-bold text-gray-700 italic"><span>{ing.item}</span><span className="text-blue-700 font-black">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
              </div>
              <div>
                <h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block mb-4 tracking-widest">BEREIDING</h3>
                <div className="space-y-6">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-lg leading-snug text-gray-700 font-medium border-l-4 border-blue-100 pl-4 italic"><p>{ins}</p></div>)}</div>
              </div>
              {r.tips && r.tips.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl italic">
                   <h4 className="flex items-center gap-2 text-amber-800 text-sm font-black uppercase mb-3"><Star size={18} fill="#92400e"/> TIP VAN DE CHEF:</h4>
                   <ul className="space-y-3">{r.tips.map((tip, i) => <li key={i} className="text-lg text-amber-900 leading-tight">"{tip}"</li>)}</ul>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center text-gray-900 select-none">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden italic font-black">
        
        <div ref={scrollRef} onScroll={handleScroll} className="flex-grow overflow-y-auto pb-48 px-4 italic font-black">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-600 p-8 rounded-full shadow-2xl mb-8 text-white"><Utensils size={64} /></div>
              <h1 className="text-6xl font-black italic text-blue-600 mb-4 uppercase leading-none">KETOVOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-sm mb-16 italic font-black">Professional Traject</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-3xl shadow-xl active:scale-95 transition-all uppercase italic">START</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="pt-10 flex flex-col h-full italic">
              <h2 className="text-4xl uppercase border-b-4 border-blue-600 inline-block self-start mb-10 italic">DE QUIZ</h2>
              <div className="space-y-10">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-center italic">
                  <label className="text-xs uppercase text-blue-800 mb-3 block tracking-widest font-black italic">GEWICHT IN KG</label>
                  <input type="number" value={profiel.gewicht} placeholder="95" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-white border-2 border-blue-100 p-4 rounded-2xl text-center font-black text-6xl text-blue-600 outline-none" />
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic font-black">UW DOELSTELLING</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-4 rounded-2xl text-xl font-black border-2 flex justify-between items-center transition-all italic ${profiel.doel === d ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-gray-100 text-gray-400 bg-gray-50'}`}><span className="uppercase">{d}</span>{profiel.doel === d && <CheckCircle size={24}/>}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic text-center font-black">MAALTIJDEN PER DAG</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-4 rounded-2xl text-3xl font-black border-2 transition-all italic ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-600 text-white' : 'bg-gray-50 text-gray-300'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { if(profiel.gewicht) genereerPlan(profiel, true); else alert("Vul gewicht in."); }} className="mt-12 w-full bg-gray-900 text-white py-6 rounded-2xl font-black uppercase text-xl shadow-xl active:scale-95 italic">PLAN GENEREREN</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="pt-10 italic">
              <div className="flex justify-between items-center mb-10 italic">
                <div><p className="text-xs uppercase text-blue-600 font-black italic tracking-widest">VANDAAG</p><h2 className="text-6xl font-black uppercase italic tracking-tighter">MENU</h2></div>
                <button onClick={() => genereerPlan(profiel)} className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                   <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''}/>
                   <span className="text-[10px] font-black uppercase italic">WISSEL GERECHTEN</span>
                </button>
              </div>
              <div className="space-y-4">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border border-gray-100 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-all border-b-4 italic italic font-black">
                    <img src={`/recepten/${r.id}.jpg`} className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border shadow-sm" />
                    <div className="flex-grow">
                      <p className="text-[10px] uppercase text-blue-700 font-black opacity-40 italic tracking-widest">{type}</p>
                      <h3 className="text-xl leading-tight mb-2 text-gray-800 uppercase italic font-black">{r.titel}</h3>
                      <div className="flex gap-4 text-[10px] font-black uppercase italic italic font-black"><span className="text-orange-500">{r.macros.kcal} KCAL</span><span className="text-blue-600">{r.macros.eiwit}G EIWIT</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="pt-10 text-left italic">
              <h2 className="text-4xl font-black uppercase border-b-4 border-blue-600 inline-block mb-10 italic">RESULTAAT</h2>
              <div className="grid grid-cols-2 gap-4 mb-10 italic">
                 <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl text-center italic">
                    <p className="text-[10px] uppercase opacity-60 mb-1">TOTAAL VERLIES</p>
                    <p className="text-4xl tracking-tighter font-black italic">{stats.verschil} KG</p>
                 </div>
                 <div className="bg-gray-100 p-6 rounded-3xl text-gray-600 text-center border-b-4 border-gray-200 italic shadow-inner">
                    <p className="text-[10px] uppercase opacity-40 mb-1">DAGEN</p>
                    <p className="text-4xl font-black italic">{dagenBezig}</p>
                 </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl mb-10 border border-gray-100 italic font-black">
                <p className="text-xs uppercase text-gray-500 mb-5 text-center font-black italic underline decoration-blue-200">METING OPSLAAN</p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center bg-white p-4 rounded-2xl border-2 border-gray-100 italic">
                    <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-5xl text-blue-700 outline-none italic font-black" />
                    <span className="text-xl text-blue-200 font-black italic italic">KG</span>
                  </div>
                  <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, gewicht: nieuwGewicht}); setNieuwGewicht(""); } }} className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-xl shadow-lg active:scale-95 italic font-black">OPSLAAN</button>
                </div>
              </div>

              <h3 className="uppercase text-sm font-black text-gray-400 mb-6 flex items-center gap-2 italic"><History size={20}/> HISTORIEK</h3>
              <div className="space-y-2">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm italic italic font-black">
                    <span className="text-gray-400 text-xs font-black uppercase italic">{log.datum}</span>
                    <span className="text-2xl text-gray-800 italic">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="pt-10 italic">
              <h2 className="text-4xl font-black uppercase border-b-4 border-blue-600 inline-block mb-8 italic italic">WEEKPLAN</h2>
              <div className="space-y-4">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-4 rounded-3xl border-b-2 ${dag === vandaagNaam ? 'bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-100' : 'bg-white border-gray-100 opacity-60 shadow-sm'}`}>
                    <h3 className={`uppercase text-sm mb-3 font-black italic italic ${dag === vandaagNaam ? 'text-blue-700 underline decoration-blue-200' : 'text-gray-500'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="space-y-1">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white px-4 py-2 rounded-xl active:bg-blue-50 border border-gray-50 italic">
                          <div className="flex items-center gap-4 italic font-black">
                             <span className="uppercase text-[9px] text-blue-700 font-black italic w-12 border-r italic font-black">{type}</span>
                             <span className="text-gray-800 font-black text-base uppercase italic tracking-tighter italic font-black">{r.titel}</span>
                          </div>
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
            <div className="pt-10 italic italic font-black">
              <h2 className="text-4xl uppercase border-b-4 border-blue-600 inline-block mb-10 italic font-black font-black italic">BEHEER</h2>
              
              <div className="bg-blue-50 p-6 rounded-3xl mb-8 border border-blue-100 font-black italic italic italic italic font-black">
                <p className="text-[12px] text-blue-800 uppercase mb-6 tracking-widest font-black italic border-b border-blue-200 pb-1 italic font-black">UW ACTIEF PROFIEL</p>
                <div className="space-y-4 italic font-black italic">
                  <div className="flex justify-between items-center text-2xl italic font-black"><span>GEWICHT:</span> <span className="text-blue-700">{profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-lg italic uppercase text-gray-500 font-black"><span>DOEL:</span> <span className="text-blue-700">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-xl italic italic font-black"><span>RITME:</span> <span className="text-blue-700">{profiel.aantalMaaltijden} P/D</span></div>
                </div>
              </div>

              <div className="space-y-6">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-6 rounded-2xl font-black uppercase text-xl shadow-xl flex items-center justify-center gap-4 italic transition-all ${isUpdating ? 'bg-orange-500 animate-pulse' : 'bg-blue-700 text-white'}`}>
                    <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''} />
                    {isUpdating ? 'BEZIG...' : 'PLAN HERBEREKENEN'}
                  </button>
                  <p className="text-xs text-gray-400 uppercase text-center font-black px-4 italic leading-tight italic">Herbereken uw maaltijden voor de volledige komende week op basis van uw nieuw gewicht.</p>
              </div>

              <button onClick={() => { if(window.confirm("Alle gegevens wissen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-6 text-red-500 font-black uppercase text-sm border-2 border-red-50 rounded-2xl mt-12 hover:bg-red-50 italic italic font-black">WISSEN & OPNIEUW BEGINNEN</button>
            </div>
          )}

        </div>

        {/* ZWEVENDE TERUGKNOP */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-28 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-all z-[999] border-2 border-white"><ArrowUp size={28} /></button>
        )}

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 pb-10 shadow-2xl z-50 rounded-t-3xl font-black italic italic">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'dashboard' ? 'text-blue-700' : 'text-black opacity-80'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'dashboard' ? 'bg-blue-50' : 'bg-transparent'} transition-all`}><Utensils size={28} strokeWidth={2} /></div>
                <span className="text-[10px] uppercase font-black">VANDAAG</span>
            </button>
            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'planner' ? 'text-blue-700' : 'text-black opacity-80'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'planner' ? 'bg-blue-50' : 'bg-transparent'} transition-all`}><Calendar size={28} strokeWidth={2} /></div>
                <span className="text-[10px] uppercase font-black">WEEKPLAN</span>
            </button>
            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'logboek' ? 'text-blue-700' : 'text-black opacity-80'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'logboek' ? 'bg-blue-50' : 'bg-transparent'} transition-all`}><Scale size={28} strokeWidth={2} /></div>
                <span className="text-[10px] uppercase font-black">RESULTAAT</span>
            </button>
            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'instellingen' ? 'text-blue-700' : 'text-black opacity-80'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'instellingen' ? 'bg-blue-50' : 'bg-transparent'} transition-all`}><User size={28} strokeWidth={2} /></div>
                <span className="text-[10px] uppercase font-black">BEHEER</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;