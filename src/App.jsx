import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Zap, Target, History, TrendingDown, CheckCircle
} from 'lucide-react';
import recipesData from './data/recipes.json';

function App() {
  // --- STATES ---
  const [pagina, setPagina] = useState('welkom'); 
  const [geselecteerdRecept, setGeselecteerdRecept] = useState(null);
  const [weekPlan, setWeekPlan] = useState({});
  const [profiel, setProfiel] = useState({ gewicht: "", doel: 'Afvallen', aantalMaaltijden: 3 });
  const [gewichtLog, setGewichtLog] = useState([]);
  const [nieuwGewicht, setNieuwGewicht] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const K = 'KV_V13_CLEAN_';

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

  // --- 3. BEREKENINGEN ---
  const genereerPlan = (p) => {
    setIsUpdating(true);
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
  const totaalVerlies = (huidigGewicht - startGewicht).toFixed(1);
  const dagenBezig = gewichtLog.length > 0 ? Math.max(1, Math.ceil((new Date() - new Date(gewichtLog[0].datum.split('-').reverse().join('-'))) / (1000*60*60*24))) : 1;

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white/95 z-50">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-1 text-blue-600 font-bold"><ArrowLeft size={20}/> TERUG</button>
          <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full uppercase">{r.maaltijd_type}</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-50" />
        <div className="p-6">
          <h2 className="text-2xl font-black mb-6 uppercase leading-tight border-l-4 border-blue-600 pl-3">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-bold">
             <div className="bg-gray-50 p-2 rounded-xl"><Flame size={16} className="mx-auto text-orange-500 mb-1"/><p className="text-[8px] opacity-50 uppercase italic">Kcal</p><p className="text-sm">{r.macros.kcal}</p></div>
             <div className="bg-blue-50 p-2 rounded-xl"><ShieldCheck size={16} className="mx-auto text-blue-500 mb-1"/><p className="text-[8px] opacity-50 uppercase italic">Eiwit</p><p className="text-sm">{r.macros.eiwit}g</p></div>
             <div className="bg-yellow-50 p-2 rounded-xl"><Zap size={16} className="mx-auto text-yellow-600 mb-1"/><p className="text-[8px] opacity-50 uppercase italic">Vet</p><p className="text-sm">{r.macros.vet}g</p></div>
             <div className="bg-green-50 p-2 rounded-xl"><TrendingDown size={16} className="mx-auto text-green-600 mb-1"/><p className="text-[8px] opacity-50 uppercase italic">Carbs</p><p className="text-sm">{r.macros.carbs}g</p></div>
          </div>
          <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest italic">Ingrediënten</h3>
          <div className="space-y-2 mb-8">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-100 py-2 text-sm"><span>{ing.item}</span><span className="font-black text-blue-600 uppercase">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
          <h3 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest italic">Bereiding</h3>
          <div className="space-y-4">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-sm leading-relaxed text-gray-600"><span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black">{i+1}</span><p>{ins}</p></div>)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center text-gray-900 select-none">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        <div className="flex-grow overflow-y-auto pb-32">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
              <div className="bg-blue-600 p-6 rounded-3xl shadow-xl mb-8 text-white"><Utensils size={48} /></div>
              <h1 className="text-5xl font-black text-blue-600 mb-4 tracking-tighter uppercase italic leading-none">KETOVOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-12 italic">Uw Plan • Uw Resultaat</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all uppercase italic tracking-widest">Start Quiz</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="p-8 pt-16 flex flex-col h-full font-black">
              <h2 className="text-3xl uppercase italic border-b-4 border-blue-600 self-start mb-10">De Quiz</h2>
              <div className="space-y-12">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest">Huidig gewicht (KG)</label>
                  <input type="number" value={profiel.gewicht} placeholder="00" onChange={(e) => setPagina('onboarding') || setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 text-center font-black text-5xl text-blue-600 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest text-left">Doelstelling</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-4 rounded-xl text-left border-2 flex justify-between items-center ${profiel.doel === d ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}><span className="uppercase text-sm">{d}</span>{profiel.doel === d && <CheckCircle size={18}/>}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest italic">Maaltijden per dag</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-5 rounded-2xl text-2xl border-2 ${profiel.aantalMaaltijden === n ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { if(profiel.gewicht) genereerPlan(profiel); else alert("Vul gewicht in"); }} className="mt-16 w-full bg-gray-900 text-white py-6 rounded-2xl font-black uppercase text-xl shadow-xl active:scale-95 transition-all italic tracking-tighter">Plan Genereren</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="p-6 pt-10 font-black italic">
              <div className="flex justify-between items-start mb-10 italic">
                <div><p className="text-[10px] uppercase text-blue-600 tracking-widest mb-1 italic">VANDAAG • {vandaagNaam}</p><h2 className="text-5xl uppercase italic tracking-tighter">MENU</h2></div>
                <button onClick={() => genereerPlan(profiel)} className={`p-4 rounded-full shadow-lg ${isUpdating ? 'bg-orange-500 animate-spin' : 'bg-blue-600 text-white active:scale-75'}`}><RefreshCw size={24}/></button>
              </div>
              <div className="space-y-6">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-5 flex items-center gap-5 shadow-sm active:scale-95 transition-all border-b-8 border-gray-200">
                    <img src={`/recepten/${r.id}.jpg`} className="w-20 h-20 rounded-2xl object-cover bg-gray-100" />
                    <div className="flex-grow">
                      <p className="text-[9px] uppercase text-blue-600 mb-1 opacity-50">{type}</p>
                      <h3 className="text-lg leading-none mb-2 text-gray-800 uppercase italic tracking-tighter">{r.titel}</h3>
                      <div className="flex gap-3 text-[10px] font-black text-gray-400 uppercase"><span className="flex items-center gap-1 text-orange-500">{r.macros.kcal} KCAL</span><span className="flex items-center gap-1 text-blue-600">{r.macros.eiwit}G EI</span></div>
                    </div>
                    <ChevronRight size={24} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="p-8 pt-16 font-black italic text-left">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-10">Resultaat</h2>
              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl text-center">
                    <p className="text-[10px] uppercase opacity-60 mb-2">Totaal Verlies</p>
                    <p className="text-4xl">{totaalVerlies} KG</p>
                 </div>
                 <div className="bg-gray-100 p-6 rounded-3xl text-gray-600 text-center border-b-4 border-gray-200 shadow-sm">
                    <p className="text-[10px] uppercase opacity-60 mb-2 italic">Dagen Bezig</p>
                    <p className="text-4xl">{dagenBezig}</p>
                 </div>
              </div>
              <div className="bg-gray-50 p-8 rounded-3xl mb-12 border-2 border-gray-100">
                <p className="text-[10px] uppercase text-gray-400 mb-6 text-center tracking-widest italic underline">Meting vandaag toevoegen</p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center bg-white p-4 rounded-2xl border-4 border-gray-100">
                    <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-5xl text-blue-600 outline-none" />
                    <span className="text-xl text-blue-200">KG</span>
                  </div>
                  <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, gewicht: nieuwGewicht}); setNieuwGewicht(""); } }} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-lg shadow-lg active:scale-95">Meting Opslaan</button>
                </div>
              </div>
              <h3 className="uppercase text-[10px] text-gray-400 mb-6 tracking-widest flex items-center gap-2 px-2 italic"><History size={16}/> Metingen Historiek</h3>
              <div className="space-y-3">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm italic italic">
                    <span className="text-gray-400 text-[10px] font-black uppercase italic">{log.datum}</span>
                    <span className="text-2xl text-gray-800 font-black italic">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="p-6 pt-10 text-left font-black italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-10 italic">Weekplan</h2>
              <div className="space-y-6">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-5 rounded-3xl transition-all ${dag === vandaagNaam ? 'bg-blue-50 border-4 border-blue-100 shadow-md' : 'bg-white border-2 border-gray-50 opacity-60'}`}>
                    <h3 className={`uppercase text-[10px] mb-4 tracking-widest ${dag === vandaagNaam ? 'text-blue-600 font-black italic italic' : 'text-gray-400 italic'}`}>{dag}</h3>
                    <div className="space-y-2">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border-b-2 border-gray-100 italic">
                          <div className="flex flex-col"><span className="uppercase text-[8px] text-blue-600 font-black mb-1 opacity-50">{type}</span><span className="text-gray-800 uppercase italic text-[11px] leading-none">{r.titel}</span></div>
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
            <div className="p-8 pt-16 text-left font-black italic italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-10">Beheer</h2>
              <div className="space-y-4 mb-10">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                   <p className="text-[10px] uppercase text-gray-400 italic">Actueel Gewicht</p>
                   <p className="text-2xl text-blue-600">{profiel.gewicht} KG</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                   <p className="text-[10px] uppercase text-gray-400 italic">Doelstelling</p>
                   <p className="text-sm text-gray-800 uppercase italic">{profiel.doel}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                   <p className="text-[10px] uppercase text-gray-400 italic">Aantal Maaltijden</p>
                   <p className="text-xl text-gray-800">{profiel.aantalMaaltijden}X</p>
                </div>
              </div>
              <div className="bg-blue-50 p-8 rounded-3xl border-4 border-blue-100 shadow-xl mb-12 italic">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-6 rounded-2xl font-black uppercase text-xl mb-6 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 ${isUpdating ? 'bg-orange-500' : 'bg-blue-600 text-white font-black'}`}>
                    {isUpdating ? <RefreshCw size={24} className="animate-spin text-white"/> : <RefreshCw size={24}/>}
                    {isUpdating ? 'BEREKENEN...' : 'Plan Herberekenen'}
                  </button>
                  <div className="flex gap-4 items-start text-blue-700 p-2 italic italic">
                    <Info size={36} className="shrink-0 opacity-40"/>
                    <p className="text-[9px] leading-relaxed uppercase tracking-tighter">Wanneer u in het vorige scherm ("GEWICHT") een nieuwe weging heeft opgeslagen, klik dan hierboven. De app herberekent uw maaltijden voor de volledige komende week zodat u op koers blijft.</p>
                  </div>
              </div>
              <button onClick={() => { if(window.confirm("Alles wissen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-500 font-black uppercase text-[10px] opacity-30 text-center hover:opacity-100 tracking-[0.3em]">Systeem volledig resetten</button>
            </div>
          )}

        </div>

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 flex justify-around p-2 pb-10 shadow-2xl z-50 rounded-t-[3rem] font-black italic">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 ${pagina === 'dashboard' ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`p-4 rounded-2xl ${pagina === 'dashboard' ? 'bg-blue-600 text-white shadow-lg scale-110 -translate-y-1' : 'bg-transparent text-gray-300'} transition-all`}><Utensils size={24} /></div>
                <span className="text-[8px] uppercase tracking-tighter">Vandaag</span>
            </button>
            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 ${pagina === 'planner' ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`p-4 rounded-2xl ${pagina === 'planner' ? 'bg-blue-600 text-white shadow-lg scale-110 -translate-y-1' : 'bg-transparent text-gray-300'} transition-all`}><Calendar size={24} /></div>
                <span className="text-[8px] uppercase tracking-tighter">Weekplan</span>
            </button>
            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 ${pagina === 'logboek' ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`p-4 rounded-2xl ${pagina === 'logboek' ? 'bg-blue-600 text-white shadow-lg scale-110 -translate-y-1' : 'bg-transparent text-gray-300'} transition-all`}><Scale size={24} /></div>
                <span className="text-[8px] uppercase tracking-tighter">Gewicht</span>
            </button>
            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 ${pagina === 'instellingen' ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`p-4 rounded-2xl ${pagina === 'instellingen' ? 'bg-blue-600 text-white shadow-lg scale-110 -translate-y-1' : 'bg-transparent text-gray-300'} transition-all`}><User size={24} /></div>
                <span className="text-[8px] uppercase tracking-tighter">Beheer</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;