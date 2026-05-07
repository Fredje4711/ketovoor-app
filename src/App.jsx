import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Clock, Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Star, Activity, Zap, Target, History, TrendingDown, Weight, Check
} from 'lucide-react';
import recipesData from './data/recipes.json';

function App() {
  // --- STATES ---
  const [pagina, setPagina] = useState('welkom'); 
  const [geselecteerdRecept, setGeselecteerdRecept] = useState(null);
  const [weekPlan, setWeekPlan] = useState({});
  const [profiel, setProfiel] = useState({ 
    gewicht: "", 
    doel: 'Afvallen', 
    aantalMaaltijden: 3 
  });
  const [gewichtLog, setGewichtLog] = useState([]);
  const [nieuwGewicht, setNieuwGewicht] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];

  // --- 1. LADEN ---
  useEffect(() => {
    const K = 'KV_V11_STABLE_';
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
      const K = 'KV_V11_STABLE_';
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  // --- 3. LOGICA ---
  const genereerPlan = (p) => {
    setIsUpdating(true);
    setTimeout(() => {
      const gewichtNum = parseFloat(p.gewicht) || 90;
      let baseKcal = (10 * gewichtNum) + 900; 
      if (p.doel === 'Afvallen') baseKcal -= 400;
      if (p.doel === 'Spieropbouw') baseKcal += 400;

      const kcalPerMaaltijd = baseKcal / p.aantalMaaltijden;
      let tijdelijkPlan = {};
      const data = recipesData || [];

      dagenLijst.forEach(dag => {
        tijdelijkPlan[dag] = {};
        const o = data.filter(r => r.maaltijd_type === 'ontbijt');
        const l = data.filter(r => r.maaltijd_type === 'middagmaal');
        const d = data.filter(r => r.maaltijd_type === 'diner');

        const match = (lijst) => {
          return lijst.sort((a, b) => 
            Math.abs(a.macros.kcal - kcalPerMaaltijd) - Math.abs(b.macros.kcal - kcalPerMaaltijd)
          )[Math.floor(Math.random() * 3)];
        };

        if (p.aantalMaaltijden === 1) tijdelijkPlan[dag].diner = match(d);
        else if (p.aantalMaaltijden === 2) { tijdelijkPlan[dag].ontbijt = match(o); tijdelijkPlan[dag].diner = match(d); }
        else { tijdelijkPlan[dag].ontbijt = match(o); tijdelijkPlan[dag].lunch = match(l); tijdelijkPlan[dag].diner = match(d); }
      });

      setWeekPlan(tijdelijkPlan);
      setProfiel(p);
      setIsUpdating(false);
      if (pagina !== 'dashboard') setPagina('dashboard');
    }, 800);
  };

  // --- BEREKENINGEN VOOR GEWICHT ---
  const startGewicht = gewichtLog.length > 0 ? parseFloat(gewichtLog[0].kg) : parseFloat(profiel.gewicht);
  const huidigGewicht = gewichtLog.length > 0 ? parseFloat(gewichtLog[gewichtLog.length - 1].kg) : parseFloat(profiel.gewicht);
  const totaalVerlies = (huidigGewicht - startGewicht).toFixed(1);

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans border-x overflow-y-auto pb-10 text-gray-900">
        <header className="p-4 border-b sticky top-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft size={20}/> Terug</button>
          <span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full">{r.maaltijd_type}</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover" />
        <div className="p-6 text-left">
          <h2 className="text-3xl font-black mb-4 leading-tight uppercase italic">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black italic">
             <div className="bg-gray-50 p-2 rounded-xl border border-gray-100"><Flame size={16} className="mx-auto text-orange-500 mb-1"/><p className="text-[8px] uppercase opacity-50">Kcal</p><p className="text-xs">{r.macros.kcal}</p></div>
             <div className="bg-blue-50 p-2 rounded-xl border border-blue-100"><ShieldCheck size={16} className="mx-auto text-blue-500 mb-1"/><p className="text-[8px] uppercase opacity-50">Eiwit</p><p className="text-xs">{r.macros.eiwit}g</p></div>
             <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100"><Zap size={16} className="mx-auto text-yellow-600 mb-1"/><p className="text-[8px] uppercase opacity-50">Vet</p><p className="text-xs">{r.macros.vet}g</p></div>
             <div className="bg-green-50 p-2 rounded-xl border border-green-100"><Activity size={16} className="mx-auto text-green-600 mb-1"/><p className="text-[8px] uppercase opacity-50">Carbs</p><p className="text-xs">{r.macros.carbs}g</p></div>
          </div>
          <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-4 border-l-4 border-blue-600 pl-2 italic">Benodigdheden</h3>
          <ul className="mb-8 space-y-2">
            {r.ingredienten.map((ing, i) => <li key={i} className="flex justify-between border-b border-gray-50 py-2 text-sm font-bold text-gray-700 italic"><span>{ing.item}</span><span className="text-blue-600 uppercase">{ing.hoeveelheid} {ing.eenheid}</span></li>)}
          </ul>
          <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-4 border-l-4 border-blue-600 pl-2 italic">Bereidingswijze</h3>
          <div className="space-y-6">
            {r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-sm leading-relaxed text-gray-600 font-medium italic"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black shadow-md italic">{i+1}</span><p>{ins}</p></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex justify-center text-gray-900 select-none">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        <div className="flex-grow overflow-y-auto pb-40">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl mb-10 text-white"><Utensils size={64} /></div>
              <h1 className="text-6xl font-black tracking-tighter italic text-blue-600 mb-2 uppercase">KETOVOOR</h1>
              <p className="text-gray-300 uppercase tracking-[0.4em] text-[10px] font-black mb-12 italic">Personalised Carnivore-Keto</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl active:scale-95 transition-all uppercase italic">Start traject</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="p-8 pt-16 flex flex-col h-full text-left font-black italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block self-start mb-1">De Quiz</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest italic font-black">Configureer uw profiel</p>
              
              <div className="space-y-10">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest italic">Uw huidig gewicht in kilogram</label>
                  <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 flex items-center justify-center relative">
                    <input 
                        type="number" 
                        value={profiel.gewicht} 
                        placeholder="00"
                        onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} 
                        className="w-full bg-transparent text-center font-black text-6xl text-blue-600 outline-none" 
                    />
                    <span className="absolute right-8 text-blue-200 text-2xl">KG</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest italic">Kies uw doelstelling</label>
                  <div className="space-y-3">
                    {['Afvallen', 'Gezondheid behouden', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`w-full p-5 rounded-2xl text-sm border-2 text-left flex justify-between items-center transition-all ${profiel.doel === d ? 'border-blue-600 bg-blue-600 text-white shadow-xl translate-x-2' : 'border-gray-100 text-gray-400 bg-gray-50'}`}>
                        <span className="uppercase">{d}</span>
                        {profiel.doel === d && <Check size={20}/>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest italic text-center">Maaltijden per dag</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-6 rounded-[1.5rem] text-2xl border-2 transition-all ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-gray-100 text-gray-400 bg-gray-50'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { if(profiel.gewicht) genereerPlan(profiel); else alert("Vul aub uw gewicht in."); }} 
                className="mt-16 w-full bg-gray-900 text-white py-7 rounded-[2rem] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all text-xl"
              >
                Plan Genereren
              </button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="p-6 pt-10 text-left font-black italic italic">
              <div className="flex justify-between items-start mb-10 italic">
                <div>
                  <p className="text-[10px] uppercase text-blue-600 tracking-[0.2em] mb-1">Vandaag • {vandaagNaam}</p>
                  <h2 className="text-5xl uppercase italic tracking-tighter">Mijn Menu</h2>
                </div>
                <button onClick={() => genereerPlan(profiel)} className="group flex flex-col items-center gap-1 mt-2">
                  <div className={`p-4 rounded-full shadow-xl transition-all duration-700 ${isUpdating ? 'bg-orange-500 rotate-180' : 'bg-blue-600 text-white group-active:rotate-180'}`}>
                    <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''}/>
                  </div>
                  <span className="text-[8px] uppercase text-blue-600 tracking-tighter">Wissel</span>
                </button>
              </div>

              <div className="space-y-6">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-5 flex items-center gap-5 shadow-sm active:scale-95 transition-all border-b-8">
                    <div className="relative">
                        <img src={`/recepten/${r.id}.jpg`} className="w-24 h-24 rounded-[1.8rem] object-cover shadow-md bg-gray-100" />
                        <div className="absolute -top-2 -left-2 bg-blue-600 text-white p-2 rounded-full shadow-lg"><Star size={12}/></div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-[9px] uppercase text-blue-600 mb-1 opacity-60 tracking-widest">{type}</p>
                      <h3 className="text-lg leading-[1.1] mb-2 text-gray-800 uppercase italic tracking-tighter">{r.titel}</h3>
                      <div className="flex gap-4 text-[10px] text-gray-400 uppercase italic">
                        <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500"/> {r.macros.kcal}</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-500"/> {r.macros.eiwit}g</span>
                      </div>
                    </div>
                    <ChevronRight size={28} className="text-gray-200" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12 italic italic">
                <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-between h-40">
                  <Target size={28} className="opacity-40 mb-2"/>
                  <div>
                    <p className="text-[10px] uppercase opacity-60 tracking-widest mb-1">Mijn Doel</p>
                    <p className="text-lg uppercase leading-none">{profiel.doel}</p>
                  </div>
                </div>
                <div onClick={() => setPagina('logboek')} className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl active:scale-95 transition-all flex flex-col justify-between h-40">
                  <Scale size={28} className="text-blue-500 mb-2"/>
                  <div>
                    <p className="text-[10px] uppercase opacity-40 tracking-widest mb-1 text-gray-400 italic">Gewicht</p>
                    <p className="text-3xl uppercase leading-none">{profiel.gewicht} <small className="text-[10px] opacity-40">KG</small></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="p-8 pt-16 text-left font-black italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-1">Resultaat</h2>
              <p className="text-gray-400 text-[10px] mb-12 tracking-[0.3em] uppercase italic">Uw gewichtsevolutie</p>
              
              <div className="grid grid-cols-3 gap-3 mb-10">
                <div className="bg-gray-50 p-4 rounded-2xl text-center border-b-4 border-gray-200">
                    <p className="text-[8px] uppercase text-gray-400 mb-1 tracking-tighter">Start</p>
                    <p className="text-xl text-gray-800">{startGewicht}kg</p>
                </div>
                <div className="bg-gray-900 p-4 rounded-2xl text-center border-b-4 border-blue-600 col-span-1 shadow-xl">
                    <p className="text-[8px] uppercase text-blue-400 mb-1 tracking-tighter">Huidig</p>
                    <p className="text-xl text-white">{huidigGewicht}kg</p>
                </div>
                <div className={`p-4 rounded-2xl text-center border-b-4 ${totaalVerlies <= 0 ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                    <p className="text-[8px] uppercase mb-1 tracking-tighter italic">Verschil</p>
                    <p className="text-xl">{totaalVerlies}kg</p>
                </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-gray-100 mb-12 italic italic">
                <p className="text-[10px] uppercase text-gray-400 mb-6 text-center tracking-[0.3em] italic">Meting vandaag invoeren</p>
                <div className="flex gap-3">
                  <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-white p-5 rounded-2xl border-4 border-gray-100 font-black text-4xl text-center text-blue-600 outline-none focus:border-blue-600" />
                  <button onClick={() => {
                    if(nieuwGewicht) {
                      const updatedLog = [...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }];
                      setGewichtLog(updatedLog);
                      setProfiel({...profiel, gewicht: nieuwGewicht}); // Update profiel meteen!
                      setNieuwGewicht("");
                      alert("Meting opgeslagen! Vergeet niet uw plan te updaten in het Profiel-scherm.");
                    }
                  }} className="bg-blue-600 text-white px-6 rounded-2xl shadow-xl active:scale-90 transition-all"><Plus size={40}/></button>
                </div>
              </div>

              <h3 className="uppercase text-xs text-gray-400 mb-6 flex items-center gap-2 px-2 italic tracking-[0.2em]"><History size={16}/> Metingen Historiek</h3>
              <div className="space-y-4 italic italic">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white border-2 border-gray-50 rounded-[1.5rem] shadow-sm italic italic">
                    <span className="text-gray-400 text-[10px] font-black uppercase italic">{log.datum}</span>
                    <span className="text-2xl text-gray-800 italic">{log.kg} <small className="text-sm opacity-30">KG</small></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="p-6 pt-10 text-left font-black italic italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-1">Mijn Week</h2>
              <p className="text-gray-400 text-[10px] mb-10 uppercase tracking-[0.2em] italic">Geplande KetoVoor Menu's</p>
              <div className="space-y-8">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-6 rounded-[2.5rem] transition-all border-b-4 ${dag === vandaagNaam ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    <h3 className={`uppercase text-[10px] mb-4 tracking-widest ${dag === vandaagNaam ? 'text-blue-600 font-black italic' : 'text-gray-400'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="space-y-3 italic italic">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center text-xs bg-white p-5 rounded-2xl shadow-sm border-b-2 italic italic">
                          <div className="flex flex-col italic">
                            <span className="uppercase text-[8px] text-blue-600 mb-1 opacity-50 tracking-tighter italic font-black">{type}</span>
                            <span className="text-gray-800 uppercase italic tracking-tighter text-sm italic font-black">{r.titel}</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-200 shrink-0 ml-2 italic font-black"/>
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
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-1">Beheer</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest italic font-black">Instellingen & Profiel</p>
              
              <div className="bg-gray-900 p-10 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><User size={120} className="text-white"/></div>
                <p className="text-[10px] text-blue-400 uppercase mb-8 tracking-[0.3em] italic underline decoration-blue-800">Statusoverzicht</p>
                <div className="space-y-8 italic">
                  <div className="flex justify-between items-center text-xl border-b border-white/5 pb-4"><span>Gewicht</span> <span className="text-blue-400 bg-white/5 px-4 py-1 rounded-full">{profiel.gewicht} kg</span></div>
                  <div className="flex justify-between items-center text-xl border-b border-white/5 pb-4 uppercase tracking-tighter"><span>Doel</span> <span className="text-blue-400 bg-white/5 px-4 py-1 rounded-full text-xs">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-xl italic uppercase tracking-tighter"><span>Maaltijden</span> <span className="text-blue-400 bg-white/5 px-4 py-1 rounded-full">{profiel.aantalMaaltijden}x</span></div>
                </div>
              </div>

              <div className="space-y-6 italic">
                <div className="bg-blue-50 p-8 rounded-[2.5rem] border-4 border-blue-100 shadow-xl relative">
                  <button 
                    onClick={() => genereerPlan(profiel)} 
                    disabled={isUpdating}
                    className={`w-full py-6 rounded-2xl font-black uppercase text-lg mb-6 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isUpdating ? 'bg-orange-500' : 'bg-blue-600 text-white'}`}
                  >
                    {isUpdating ? <RefreshCw size={24} className="animate-spin"/> : <RefreshCw size={24}/>}
                    {isUpdating ? 'REKENEN...' : 'UPDATE MIJN PLAN'}
                  </button>
                  <div className="flex gap-4 items-start text-blue-700 italic">
                    <Info size={32} className="shrink-0 opacity-30"/>
                    <p className="text-[10px] font-black italic leading-relaxed uppercase tracking-tighter">
                      Heeft u een nieuw gewicht ingevoerd in het "Gewicht" scherm? Klik dan hierboven. De app herrekent alle maaltijden voor de komende week op basis van uw nieuwe gewicht.
                    </p>
                  </div>
                </div>

                <button onClick={() => { if(window.confirm("Alles wissen en terug naar start?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-500 font-black uppercase text-[10px] opacity-30 hover:opacity-100 transition-all mt-10 tracking-[0.3em] italic">Reset alle applicatiegegevens</button>
              </div>
            </div>
          )}

        </div>

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-4 border-gray-50 flex justify-around p-2 pb-10 shadow-2xl z-50 rounded-t-[3.5rem] font-black italic italic">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-4 rounded-2xl transition-all ${pagina === 'dashboard' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-gray-300'}`}>
                    <Utensils size={24} />
                </div>
                <span className={`text-[8px] uppercase tracking-tighter ${pagina === 'dashboard' ? 'text-blue-600' : 'text-gray-300'}`}>Vandaag</span>
            </button>

            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-4 rounded-2xl transition-all ${pagina === 'planner' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-gray-300'}`}>
                    <Calendar size={24} />
                </div>
                <span className={`text-[8px] uppercase tracking-tighter ${pagina === 'planner' ? 'text-blue-600' : 'text-gray-300'}`}>Weekplan</span>
            </button>

            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-4 rounded-2xl transition-all ${pagina === 'logboek' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-gray-300'}`}>
                    <Scale size={24} />
                </div>
                <span className={`text-[8px] uppercase tracking-tighter ${pagina === 'logboek' ? 'text-blue-600' : 'text-gray-300'}`}>Gewicht</span>
            </button>

            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-4 rounded-2xl transition-all ${pagina === 'instellingen' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-gray-300'}`}>
                    <User size={24} />
                </div>
                <span className={`text-[8px] uppercase tracking-tighter ${pagina === 'instellingen' ? 'text-blue-600' : 'text-gray-300'}`}>Beheer</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;