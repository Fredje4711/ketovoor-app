import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Zap, Target, History, TrendingDown, CheckCircle, ArrowUp, AlertCircle, Star
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
  const K = 'KV_V17_FINAL_FIXED_';

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
    if (e.target.scrollTop > 150) setShowBackToTop(true);
    else setShowBackToTop(false);
  };
  
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
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-1 text-blue-700 font-black text-lg italic uppercase">← TERUG</button>
          <span className="text-xs font-black bg-blue-600 text-white px-4 py-1 rounded-full uppercase italic font-black">GERECHT</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-50 shadow-inner border-b" />
        <div className="p-6">
          <h2 className="text-3xl font-black mb-6 uppercase italic leading-none text-blue-800">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black bg-blue-50/50 p-4 rounded-3xl border-2 border-blue-100 italic">
             <div><p className="text-[10px] opacity-50 uppercase">Kcal</p><p className="text-lg text-orange-600 font-black">{r.macros.kcal}</p></div>
             <div><p className="text-[10px] opacity-50 uppercase font-black italic">Eiwit</p><p className="text-lg text-blue-700 font-black">{r.macros.eiwit}g</p></div>
             <div><p className="text-[10px] opacity-50 uppercase">Vet</p><p className="text-lg text-yellow-700 font-black">{r.macros.vet}g</p></div>
             <div><p className="text-[10px] opacity-50 uppercase">Koolh.</p><p className="text-lg text-green-700 font-black">{r.macros.carbs}g</p></div>
          </div>
          
          <div className="space-y-10 italic">
              <div>
                <h3 className="font-black uppercase text-base border-b-8 border-blue-600/20 pb-1 inline-block mb-4">INGRÉDIËNTEN</h3>
                <div className="space-y-3">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-3 text-xl font-bold text-gray-800 italic"><span>{ing.item}</span><span className="text-blue-700 font-black uppercase text-lg">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
              </div>

              <div>
                <h3 className="font-black uppercase text-base border-b-8 border-blue-600/20 pb-1 inline-block mb-4">BEREIDING</h3>
                <div className="space-y-6">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-xl leading-snug text-gray-700 font-medium border-l-[10px] border-blue-100 pl-4 italic"><p>{ins}</p></div>)}</div>
              </div>

              {r.tips && r.tips.length > 0 && (
                <div className="bg-amber-50 border-4 border-amber-200 p-6 rounded-[2.5rem] mt-10 italic shadow-inner font-black italic">
                   <h4 className="flex items-center gap-2 text-amber-800 text-sm font-black uppercase mb-4 italic italic"><Star size={20} fill="#92400e"/> TIP VAN DE CHEF:</h4>
                   <ul className="space-y-4">{r.tips.map((tip, i) => <li key={i} className="text-lg text-amber-900 leading-tight border-l-4 border-amber-300 pl-3">"{tip}"</li>)}</ul>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex justify-center text-gray-900 select-none">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden italic">
        
        <div ref={scrollRef} onScroll={handleScroll} className="flex-grow overflow-y-auto pb-44 px-4 italic font-black font-black italic">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center text-center px-10">
              <div className="bg-blue-700 p-8 rounded-[3.5rem] shadow-2xl mb-8 text-white"><Utensils size={84} /></div>
              <h1 className="text-7xl font-black italic text-blue-700 mb-2 uppercase leading-none italic font-black">KETO<br/>VOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-sm mb-16 italic font-black">Professional Edition</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-700 text-white py-8 rounded-3xl font-black text-3xl shadow-xl active:scale-95 transition-all uppercase italic font-black italic">START</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="pt-10 flex flex-col h-full italic italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-700 inline-block self-start mb-10 italic">DE QUIZ</h2>
              <div className="space-y-8 italic">
                <div className="bg-blue-50 p-6 rounded-[2.5rem] border-2 border-blue-100 text-center">
                  <label className="text-sm uppercase text-blue-800 mb-4 block tracking-widest font-black italic italic font-black italic">GEWICHT IN KILOGRAM</label>
                  <input type="number" value={profiel.gewicht} placeholder="95" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-white border-4 border-blue-300 p-4 rounded-3xl text-center font-black text-7xl text-blue-700 outline-none shadow-sm" />
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic font-black font-black italic">WAT IS UW DOEL?</label>
                  <div className="grid grid-cols-1 gap-2 italic">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-5 rounded-2xl text-xl font-black border-4 flex justify-between items-center transition-all italic ${profiel.doel === d ? 'border-blue-700 bg-blue-700 text-white shadow-xl translate-x-2 font-black' : 'border-gray-200 text-gray-400 bg-gray-50 font-black'}`}><span className="uppercase font-black">{d}</span>{profiel.doel === d && <CheckCircle size={28}/>}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic text-center font-black">MAALTIJDEN PER DAG</label>
                  <div className="grid grid-cols-3 gap-3 italic">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-5 rounded-2xl text-4xl border-4 transition-all italic font-black ${profiel.aantalMaaltijden === n ? 'border-blue-700 bg-blue-700 text-white shadow-lg font-black' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { if(profiel.gewicht) genereerPlan(profiel, true); else alert("Vul gewicht in."); }} className="mt-12 w-full bg-gray-900 text-white py-8 rounded-3xl font-black uppercase text-2xl shadow-xl active:scale-95 italic">VOORSTEL MAKEN</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="pt-10 italic">
              <div className="flex justify-between items-center mb-10 italic">
                <div><p className="text-xs uppercase text-blue-700 font-black italic tracking-widest">VANDAAG</p><h2 className="text-6xl font-black uppercase italic tracking-tighter italic">MENU</h2></div>
                <button onClick={() => genereerPlan(profiel)} className="bg-blue-700 text-white px-5 py-4 rounded-3xl shadow-xl active:scale-90 flex flex-col items-center gap-1">
                   <RefreshCw size={28} className={isUpdating ? 'animate-spin' : ''}/>
                   <span className="text-[10px] font-black uppercase italic">WISSEL GERECHTEN</span>
                </button>
              </div>
              <div className="space-y-5 font-black italic">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-5 flex items-center gap-5 shadow-sm active:scale-95 transition-all border-b-[10px] border-gray-200">
                    <img src={`/recepten/${r.id}.jpg`} className="w-24 h-24 rounded-[1.8rem] object-cover shadow-md bg-gray-50 border-4 border-white" />
                    <div className="flex-grow italic">
                      <p className="text-xs uppercase text-blue-700 font-black opacity-50 tracking-widest italic">{type}</p>
                      <h3 className="text-2xl leading-none mb-3 text-gray-800 uppercase italic font-black italic tracking-[ -0.05em]">{r.titel}</h3>
                      <div className="flex gap-4 text-xs font-black text-gray-400 uppercase italic"><span className="text-orange-600">{r.macros.kcal} KCAL</span><span className="text-blue-700">{r.macros.eiwit}G EIWIT</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="pt-10 text-left italic">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-700 inline-block mb-10 italic font-black">RESULTAAT</h2>
              <div className="grid grid-cols-2 gap-4 mb-10 font-black italic">
                 <div className="bg-blue-700 p-8 rounded-[2.5rem] text-white shadow-2xl text-center">
                    <p className="text-xs uppercase opacity-60 mb-2 italic">NETTO VERLIES</p>
                    <p className="text-6xl tracking-tighter italic">{stats.verschil} KG</p>
                 </div>
                 <div className="bg-gray-50 p-8 rounded-[2.5rem] text-gray-700 text-center border-b-8 border-gray-200 shadow-inner italic font-black font-black italic">
                    <p className="text-xs uppercase opacity-40 mb-2 italic font-black italic">DAGEN</p>
                    <p className="text-6xl font-black italic italic font-black">{dagenBezig}</p>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] mb-10 border-4 border-gray-50 shadow-xl italic italic">
                <p className="text-xs uppercase text-gray-400 mb-6 text-center font-black italic underline decoration-blue-200 font-black italic">METING VANDAAG OPSLAAN</p>
                <div className="flex flex-col gap-6 italic italic italic">
                  <div className="flex items-center justify-center bg-gray-50 p-6 rounded-[2rem] border-4 border-gray-100 italic">
                    <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-7xl text-blue-700 outline-none italic font-black" />
                    <span className="text-3xl text-blue-200 font-black italic">KG</span>
                  </div>
                  <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, gewicht: nieuwGewicht}); setNieuwGewicht(""); setLaatsteGewichtUpdate(true); } }} className="w-full bg-blue-700 text-white py-6 rounded-3xl font-black uppercase text-2xl shadow-xl active:scale-95 italic">METING OPSLAAN</button>
                </div>
              </div>

              {laatsteGewichtUpdate && (
                <div className="bg-orange-50 border-8 border-orange-400 p-8 rounded-[3rem] mb-10 animate-pulse text-center italic italic">
                    <AlertCircle size={56} className="mx-auto text-orange-600 mb-4 font-black italic font-black" />
                    <p className="text-2xl font-black text-orange-900 uppercase leading-none mb-6 italic italic font-black font-black italic">GEWICHT IS AANGEPAST!</p>
                    <button onClick={() => genereerPlan(profiel)} className="bg-orange-600 text-white w-full py-6 rounded-2xl font-black text-xl uppercase shadow-2xl font-black italic italic">PLAN NU BIJWERKEN →</button>
                    <p className="text-xs text-orange-800 font-black mt-6 uppercase italic italic font-black font-black">DIT PAST UW PORTIES AUTOMATISCH AAN</p>
                </div>
              )}

              <h3 className="uppercase text-sm font-black text-gray-400 mb-6 flex items-center gap-2 px-2 italic font-black font-black"><History size={24}/> HISTORIEK</h3>
              <div className="space-y-3 font-black italic italic italic">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center px-8 py-5 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm italic italic">
                    <span className="text-gray-400 text-[10px] uppercase font-black italic italic font-black">{log.datum}</span>
                    <span className="text-3xl text-gray-800 font-black italic italic font-black">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="pt-10 italic">
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-700 inline-block mb-8 italic italic font-black">WEEKPLAN</h2>
              <div className="space-y-4 italic font-black font-black italic">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-4 rounded-[2.5rem] transition-all border-b-8 ${dag === vandaagNaam ? 'bg-blue-50 border-blue-500 shadow-xl ring-4 ring-blue-100' : 'bg-white border-gray-100 opacity-60 shadow-sm'}`}>
                    <h3 className={`uppercase text-lg mb-4 font-black italic italic italic font-black ${dag === vandaagNaam ? 'text-blue-700 underline decoration-blue-300' : 'text-gray-500'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="grid grid-cols-1 gap-2 italic italic font-black">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-sm active:bg-blue-100 border-2 border-gray-50 italic">
                          <div className="flex items-center gap-4 italic italic font-black italic font-black">
                             <span className="uppercase text-[10px] text-blue-700 font-black italic w-14 border-r pr-2 italic font-black italic font-black">{type}</span>
                             <span className="text-gray-800 font-black text-base uppercase italic tracking-tighter font-black italic italic font-black">{r.titel}</span>
                          </div>
                          <ChevronRight size={28} className="text-blue-100 font-black italic italic font-black"/>
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
              <h2 className="text-4xl font-black uppercase border-b-8 border-blue-700 inline-block mb-10 italic italic font-black font-black">BEHEER</h2>
              
              <div className="bg-gray-900 p-10 rounded-[3.5rem] mb-10 shadow-2xl font-black italic italic italic italic">
                <p className="text-[10px] text-blue-400 uppercase mb-8 tracking-[0.3em] text-center border-b border-white/10 pb-4 italic italic font-black font-black">UW ACTIEF PROFIEL</p>
                <div className="space-y-8 italic font-black text-white italic font-black">
                  <div className="flex justify-between items-center text-3xl italic font-black"><span>GEWICHT</span> <span className="text-blue-400 font-black">{profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-xl italic uppercase text-gray-400 font-black"><span>DOEL</span> <span className="text-white italic">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-3xl italic italic font-black"><span>RITME</span> <span className="text-white italic">{profiel.aantalMaaltijden} P/D</span></div>
                </div>
              </div>

              <div className="bg-blue-700 p-10 rounded-[3.5rem] shadow-2xl mb-12 font-black italic italic italic">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-8 rounded-[2.5rem] font-black uppercase text-2xl mb-8 shadow-2xl flex items-center justify-center gap-4 italic ${isUpdating ? 'bg-orange-500 animate-pulse font-black italic' : 'bg-white text-blue-700 font-black italic'}`}>
                    <RefreshCw size={36} className={isUpdating ? 'animate-spin italic font-black font-black' : 'italic font-black'} />
                    {isUpdating ? 'SYNC...' : 'PLAN HERBEREKENEN'}
                  </button>
                  <p className="text-xs text-white/90 leading-tight uppercase text-center font-black px-4 italic italic font-black italic italic">KLIK HIERBOVEN OM UW MAALTIJDEN AAN TE PASSEN AAN UW NIEUW GEWICHT.</p>
              </div>

              <button onClick={() => { if(window.confirm("Alle gegevens wissen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-10 text-red-600 font-black uppercase text-xl border-4 border-red-50 rounded-[3rem] mt-12 hover:bg-red-600 hover:text-white transition-all italic font-black font-black">WISSEN & OPNIEUW BEGINNEN</button>
            </div>
          )}

        </div>

        {/* ZWEVENDE TERUGKNOP */}
        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-36 right-6 bg-blue-700 text-white p-6 rounded-full shadow-2xl active:scale-90 transition-all z-[100] border-4 border-white animate-in slide-in-from-bottom-5"><ArrowUp size={44} strokeWidth={6} /></button>
        )}

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-[10px] border-gray-100 flex justify-around p-2 pb-14 shadow-2xl z-50 rounded-t-[4.5rem] font-black italic font-black italic">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-24 py-2 italic font-black ${pagina === 'dashboard' ? 'text-blue-700' : 'text-black'}`}>
                <div className={`p-5 rounded-[2rem] ${pagina === 'dashboard' ? 'bg-blue-700 text-white shadow-2xl scale-125 -translate-y-4 font-black italic' : 'bg-transparent text-black'} transition-all`}><Utensils size={36} strokeWidth={5} /></div>
                <span className="text-[12px] uppercase tracking-tighter font-black italic font-black italic font-black">VANDAAG</span>
            </button>
            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-24 py-2 italic font-black ${pagina === 'planner' ? 'text-blue-700' : 'text-black'}`}>
                <div className={`p-5 rounded-[2rem] ${pagina === 'planner' ? 'bg-blue-700 text-white shadow-2xl scale-125 -translate-y-4 font-black italic' : 'bg-transparent text-black'} transition-all`}><Calendar size={36} strokeWidth={5} /></div>
                <span className="text-[12px] uppercase tracking-tighter font-black italic font-black italic font-black">WEEKPLAN</span>
            </button>
            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-24 py-2 italic font-black ${pagina === 'logboek' ? 'text-blue-700' : 'text-black'}`}>
                <div className={`p-5 rounded-[2rem] ${pagina === 'logboek' ? 'bg-blue-700 text-white shadow-2xl scale-125 -translate-y-4 font-black italic' : 'bg-transparent text-black'} transition-all`}><Scale size={36} strokeWidth={5} /></div>
                <span className="text-[12px] uppercase tracking-tighter font-black italic font-black">GEWICHT</span>
            </button>
            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-24 py-2 italic font-black ${pagina === 'instellingen' ? 'text-blue-700' : 'text-black'}`}>
                <div className={`p-5 rounded-[2rem] ${pagina === 'instellingen' ? 'bg-blue-700 text-white shadow-2xl scale-125 -translate-y-4 font-black italic' : 'bg-transparent text-black'} transition-all`}><User size={36} strokeWidth={5} /></div>
                <span className="text-[12px] uppercase tracking-tighter font-black italic font-black italic">BEHEER</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;