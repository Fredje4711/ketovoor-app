import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Clock, Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Star, Activity, Zap, Target, History, TrendingDown, Weight, Check, Award, Trophy
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

  // --- 1. LADEN ---
  useEffect(() => {
    const K = 'KV_PRO_V12_';
    const savedUser = localStorage.getItem(K + 'user');
    if (savedUser) {
      setProfiel(JSON.parse(savedUser));
      setWeekPlan(JSON.parse(localStorage.getItem(K + 'plan') || '{}'));
      setGewichtLog(JSON.parse(localStorage.getItem(K + 'gewicht') || '[]'));
      setPagina('dashboard');
    }
  }, []);

  // --- 2. OPSLAAN ---
  useEffect(() => {
    if (pagina !== 'welkom' && pagina !== 'onboarding') {
      const K = 'KV_PRO_V12_';
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  // --- 3. MAALTIJD LOGICA ---
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
        const match = (lijst) => lijst.sort((a,b) => Math.abs(a.macros.kcal - kcalPerMaaltijd) - Math.abs(b.macros.kcal - kcalPerMaaltijd))[Math.floor(Math.random()*3)];
        if (p.aantalMaaltijden === 1) tijdelijkPlan[dag].diner = match(d);
        else if (p.aantalMaaltijden === 2) { tijdelijkPlan[dag].ontbijt = match(o); tijdelijkPlan[dag].diner = match(d); }
        else { tijdelijkPlan[dag].ontbijt = match(o); tijdelijkPlan[dag].lunch = match(l); tijdelijkPlan[dag].diner = match(d); }
      });
      setWeekPlan(tijdelijkPlan);
      setProfiel(p);
      setIsUpdating(false);
      setPagina('dashboard');
    }, 800);
  };

  // --- RESULTAAT BEREKENINGEN ---
  const logInOrde = [...gewichtLog].sort((a, b) => new Date(a.datum) - new Date(b.datum));
  const startGewicht = logInOrde.length > 0 ? parseFloat(logInOrde[0].kg) : parseFloat(profiel.gewicht);
  const huidigGewicht = logInOrde.length > 0 ? parseFloat(logInOrde[logInOrde.length - 1].kg) : parseFloat(profiel.gewicht);
  const totaalVerlies = (huidigGewicht - startGewicht).toFixed(1);

  const getMotivatieBoodschap = () => {
    const v = parseFloat(totaalVerlies);
    if (v < -2) return "Uitzonderlijk resultaat! Je lichaam transformeert.";
    if (v < 0) return "Goed bezig! Elke gram eraf is een overwinning.";
    if (v === 0) return "De start is het moeilijkst. Zet nu door!";
    return "Focus op de basis. Je kunt dit herstellen.";
  };

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans border-x overflow-y-auto pb-10 text-gray-900">
        <header className="p-4 border-b sticky top-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between font-black italic">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-2 text-blue-600 border-2 border-blue-50 px-4 py-1 rounded-full bg-blue-50/50 uppercase text-xs">← Terug</button>
          <span className="text-[10px] uppercase bg-gray-100 px-3 py-1 rounded-full text-gray-400">ID: {r.id}</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover" />
        <div className="p-8 text-left italic">
          <p className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-1">{r.maaltijd_type} • {r.vlees_type}</p>
          <h2 className="text-4xl font-black mb-6 leading-none uppercase tracking-tighter">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-10 text-center font-black italic">
             <div className="bg-gray-50 p-2 rounded-2xl border-b-4 border-gray-100 text-gray-800"><Flame size={18} className="mx-auto text-orange-500 mb-1"/><p className="text-[8px] uppercase opacity-50">Kcal</p><p className="text-xs">{r.macros.kcal}</p></div>
             <div className="bg-blue-50 p-2 rounded-2xl border-b-4 border-blue-100 text-blue-900"><ShieldCheck size={18} className="mx-auto text-blue-600 mb-1"/><p className="text-[8px] uppercase opacity-50">Eiwit</p><p className="text-xs">{r.macros.eiwit}g</p></div>
             <div className="bg-yellow-50 p-2 rounded-2xl border-b-4 border-yellow-100 text-yellow-900"><Zap size={18} className="mx-auto text-yellow-600 mb-1"/><p className="text-[8px] uppercase opacity-50">Vet</p><p className="text-xs">{r.macros.vet}g</p></div>
             <div className="bg-green-50 p-2 rounded-2xl border-b-4 border-green-100 text-green-900"><Activity size={18} className="mx-auto text-green-600 mb-1"/><p className="text-[8px] uppercase opacity-50">Carbs</p><p className="text-xs">{r.macros.carbs}g</p></div>
          </div>
          <div className="space-y-8">
            <div>
               <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-4 flex items-center gap-2"><div className="w-6 h-1 bg-blue-600"></div> Ingrediënten</h3>
               <ul className="space-y-3">{r.ingredienten.map((ing, i) => <li key={i} className="flex justify-between border-b border-gray-50 pb-2 text-sm font-bold text-gray-700 italic"><span>{ing.item}</span><span className="text-blue-600 font-black">{ing.hoeveelheid}{ing.eenheid}</span></li>)}</ul>
            </div>
            <div>
               <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-4 flex items-center gap-2"><div className="w-6 h-1 bg-blue-600"></div> Instructies</h3>
               <div className="space-y-6">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-sm leading-relaxed text-gray-600 font-medium italic"><div className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black shadow-lg italic">{i+1}</div><p>{ins}</p></div>)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex justify-center text-gray-900 select-none italic font-black">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden italic">
        
        <div className="flex-grow overflow-y-auto pb-40 italic">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center p-12 text-center bg-white">
              <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl mb-12 text-white"><Utensils size={64} /></div>
              <h1 className="text-7xl font-black tracking-tighter italic text-blue-600 mb-2 uppercase leading-[0.85]">KETO<br/>VOOR</h1>
              <p className="text-gray-300 uppercase tracking-[0.4em] text-[10px] font-black mb-16">Smart Nutrition Engine</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl active:scale-95 transition-all uppercase">Start Nu</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="p-8 pt-16 flex flex-col h-full text-left italic italic">
              <h2 className="text-5xl uppercase border-b-[12px] border-blue-600 inline-block mb-1 tracking-tighter">De Quiz</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest font-black italic">Persoonlijk profiel</p>
              
              <div className="space-y-12">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-[0.2em]">Uw actueel gewicht (KG)</label>
                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border-4 border-gray-100 flex items-center justify-center italic italic italic">
                    <input type="number" value={profiel.gewicht} placeholder="00" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-transparent text-center font-black text-7xl text-blue-600 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-[0.2em]">Uw doel</label>
                  <div className="space-y-3 italic font-black">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`w-full p-6 rounded-2xl text-left flex justify-between items-center border-2 transition-all ${profiel.doel === d ? 'border-blue-600 bg-blue-600 text-white shadow-xl' : 'border-gray-100 text-gray-400 bg-gray-50'}`}>
                        <span className="uppercase tracking-widest">{d}</span>
                        {profiel.doel === d && <Check size={24}/>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => { if(profiel.gewicht) genereerPlan(profiel); else alert("Gewicht is verplicht."); }} className="mt-16 w-full bg-gray-900 text-white py-7 rounded-[2.5rem] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all text-xl font-black">Genereer Plan</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="p-6 pt-10 text-left font-black italic italic">
              <div className="flex justify-between items-start mb-10 italic">
                <div>
                  <p className="text-[10px] uppercase text-blue-600 tracking-[0.2em] mb-1">Vandaag • {vandaagNaam}</p>
                  <h2 className="text-6xl uppercase italic tracking-[ -0.05em] leading-[0.85]">Mijn<br/>Menu</h2>
                </div>
                <button onClick={() => genereerPlan(profiel)} className={`p-5 rounded-full shadow-2xl transition-all duration-700 ${isUpdating ? 'bg-orange-500 scale-90' : 'bg-blue-600 text-white active:scale-75'}`}>
                   <RefreshCw size={28} className={isUpdating ? 'animate-spin' : ''}/>
                </button>
              </div>

              <div className="space-y-6">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-4 border-gray-50 rounded-[3rem] p-5 flex items-center gap-6 shadow-md active:scale-95 transition-all border-b-[12px]">
                    <div className="relative shrink-0 italic">
                        <img src={`/recepten/${r.id}.jpg`} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg border-2 border-white bg-gray-50" />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg"><Star size={14} fill="white"/></div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-[9px] uppercase text-blue-600 mb-1 opacity-60 tracking-[0.2em]">{type}</p>
                      <h3 className="text-xl leading-[1.1] mb-2 text-gray-800 uppercase italic tracking-tighter">{r.titel}</h3>
                      <div className="flex gap-4 text-[10px] text-gray-300 uppercase italic">
                        <span className="flex items-center gap-1 font-black italic"><Flame size={12} className="text-orange-500"/> {r.macros.kcal}</span>
                        <span className="flex items-center gap-1 font-black italic"><ShieldCheck size={12} className="text-blue-500"/> {r.macros.eiwit}G</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12 italic italic font-black italic">
                <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col justify-between h-44 relative overflow-hidden">
                  <Target size={64} className="absolute -top-4 -right-4 opacity-10"/>
                  <div className="z-10"><p className="text-[10px] uppercase opacity-60 mb-1 tracking-widest underline decoration-blue-400">Doel</p><p className="text-2xl uppercase tracking-tighter">{profiel.doel}</p></div>
                </div>
                <div onClick={() => setPagina('logboek')} className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-2xl active:scale-95 transition-all flex flex-col justify-between h-44 relative overflow-hidden">
                   <TrendingDown size={64} className="absolute -top-4 -right-4 opacity-10 text-blue-500"/>
                   <div className="z-10"><p className="text-[10px] uppercase opacity-40 mb-1 tracking-widest text-blue-400 underline decoration-gray-700 italic">Evolutie</p><p className="text-4xl uppercase tracking-tighter italic">{totaalVerlies} <small className="text-xs opacity-40">KG</small></p></div>
                </div>
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="p-8 pt-16 text-left font-black italic">
              <h2 className="text-5xl uppercase border-b-8 border-blue-600 inline-block mb-1 tracking-tighter">Succes</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest font-black italic">Uw resultaten</p>
              
              {/* MOTIVATIE DASHBOARD */}
              <div className="bg-blue-600 p-10 rounded-[3rem] text-white mb-10 shadow-2xl relative overflow-hidden italic italic">
                 <div className="flex justify-between items-start mb-8 italic">
                    <div className="bg-white/20 p-4 rounded-3xl"><Trophy size={40} className="text-yellow-300 drop-shadow-lg"/></div>
                    <div className="text-right"><p className="text-[10px] uppercase opacity-60">Dagen bezig</p><p className="text-3xl tracking-tighter">{gewichtLog.length > 0 ? Math.ceil((new Date() - new Date(logInOrde[0].datum.split('-').reverse().join('-'))) / (1000 * 60 * 60 * 24)) : 1}</p></div>
                 </div>
                 <p className="text-4xl leading-[0.9] tracking-[ -0.05em] uppercase mb-6">{getMotivatieBoodschap()}</p>
                 <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6 italic italic italic">
                    <div className="text-center font-black"><p className="text-[8px] uppercase opacity-50">Start</p><p className="text-xl">{startGewicht}kg</p></div>
                    <div className="text-center font-black border-x border-white/10"><p className="text-[8px] uppercase opacity-50">Nu</p><p className="text-xl">{huidigGewicht}kg</p></div>
                    <div className="text-center font-black"><p className="text-[8px] uppercase opacity-50 italic">Netto</p><p className={`text-xl ${parseFloat(totaalVerlies) <= 0 ? 'text-green-300' : 'text-orange-300'}`}>{totaalVerlies}kg</p></div>
                 </div>
              </div>

              {/* VISUELE TREND BALKEN */}
              <div className="mb-12 px-2 italic font-black">
                 <h3 className="uppercase text-[10px] text-gray-300 mb-6 tracking-widest flex items-center gap-2 italic"><div className="w-6 h-1 bg-gray-200"></div> Visual Trend</h3>
                 <div className="flex items-end justify-between h-32 gap-2 bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 shadow-inner">
                    {logInOrde.slice(-7).map((log, i) => {
                       const height = 100 - ((parseFloat(log.kg) - 60) * 1); // Simpele visuele weergave
                       return (
                        <div key={i} className="flex-grow flex flex-col items-center gap-2 italic font-black italic">
                            <div className="w-full bg-blue-600 rounded-t-lg transition-all duration-1000 shadow-lg shadow-blue-100" style={{ height: `${height}%` }}></div>
                            <span className="text-[8px] text-gray-400 uppercase italic font-black">{log.datum.split('-')[0]}</span>
                        </div>
                       )
                    })}
                 </div>
              </div>

              <div className="bg-gray-900 p-8 rounded-[3rem] mb-12 shadow-2xl italic font-black italic">
                <p className="text-[10px] uppercase text-blue-400 mb-6 text-center tracking-[0.3em] italic font-black italic">Nieuwe weging invoeren</p>
                <div className="flex gap-4">
                  <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-white/5 p-5 rounded-2xl border-2 border-white/10 font-black text-5xl text-center text-white outline-none focus:border-blue-600" />
                  <button onClick={() => {
                    if(nieuwGewicht) {
                      const nu = new Date().toLocaleDateString('nl-BE');
                      const updateLog = [...gewichtLog, { datum: nu, kg: nieuwGewicht }];
                      setGewichtLog(updateLog);
                      setProfiel({...profiel, gewicht: nieuwGewicht});
                      setNieuwGewicht("");
                      alert("Geregistreerd! Ga naar 'Beheer' om uw plan te synchroniseren.");
                    }
                  }} className="bg-blue-600 text-white px-8 rounded-3xl shadow-xl active:scale-75 transition-all"><Plus size={40}/></button>
                </div>
              </div>

              <h3 className="uppercase text-[10px] text-gray-400 mb-6 flex items-center gap-2 px-4 italic tracking-[0.2em] font-black italic"><History size={14}/> Historische Data</h3>
              <div className="space-y-4 px-2 italic font-black italic font-black italic">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm italic italic">
                    <span className="text-gray-400 text-[10px] font-black uppercase italic tracking-widest font-black italic">{log.datum}</span>
                    <span className="text-3xl text-gray-800 italic font-black italic tracking-tighter font-black">{log.kg} <small className="text-[10px] opacity-30">KG</small></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="p-6 pt-10 text-left font-black italic">
              <h2 className="text-5xl uppercase border-b-8 border-blue-600 inline-block mb-1 tracking-tighter">Week</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest italic font-black italic">Alle menuvoorstellen</p>
              <div className="space-y-10 font-black italic">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-8 rounded-[3rem] transition-all border-b-8 ${dag === vandaagNaam ? 'bg-blue-50 border-blue-200 shadow-xl scale-[1.03]' : 'bg-gray-50 border-gray-100 opacity-50 shadow-inner'}`}>
                    <h3 className={`uppercase text-xs mb-6 tracking-widest font-black italic ${dag === vandaagNaam ? 'text-blue-600' : 'text-gray-400'}`}>{dag} {dag === vandaagNaam && "• ACTUEEL"}</h3>
                    <div className="space-y-4 font-black italic italic italic">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white p-6 rounded-[1.8rem] shadow-sm italic font-black italic border-b-2">
                          <div className="flex flex-col italic font-black">
                            <span className="uppercase text-[8px] text-blue-600 mb-1 opacity-50 tracking-tighter font-black italic font-black">{type}</span>
                            <span className="text-gray-800 uppercase italic tracking-tight text-sm font-black italic">{r.titel}</span>
                          </div>
                          <ChevronRight size={24} className="text-gray-100 shrink-0 font-black italic"/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'instellingen' && (
            <div className="p-8 pt-16 text-left font-black italic">
              <h2 className="text-5xl uppercase border-b-8 border-blue-600 inline-block mb-1 tracking-tighter italic">Beheer</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest italic font-black">Systeem & Account</p>
              
              <div className="bg-gray-900 p-12 rounded-[3.5rem] mb-12 shadow-2xl relative overflow-hidden italic font-black">
                <div className="absolute -top-4 -right-4 opacity-5 italic"><User size={160} className="text-white"/></div>
                <p className="text-[10px] text-blue-400 uppercase mb-10 tracking-[0.4em] italic font-black underline decoration-blue-900 italic font-black italic">Actief Profiel</p>
                <div className="space-y-10 italic font-black">
                  <div className="flex justify-between items-center text-2xl border-b border-white/5 pb-6 italic"><span>Huidig</span> <span className="text-blue-400 bg-white/5 px-6 py-1 rounded-full font-black tracking-tighter italic">{profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-xl border-b border-white/5 pb-6 uppercase italic tracking-tighter font-black"><span>Mijn Doel</span> <span className="text-blue-400 bg-white/5 px-6 py-1 rounded-full text-xs font-black italic">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-2xl font-black italic font-black italic"><span>Maaltijden</span> <span className="text-blue-400 bg-white/5 px-6 py-1 rounded-full font-black italic">{profiel.aantalMaaltijden}X</span></div>
                </div>
              </div>

              <div className="space-y-6 italic font-black italic italic font-black italic">
                <div className="bg-blue-50 p-8 rounded-[3.5rem] border-4 border-blue-100 shadow-2xl relative italic">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-8 rounded-3xl font-black uppercase text-xl mb-8 shadow-2xl active:scale-90 transition-all flex items-center justify-center gap-4 ${isUpdating ? 'bg-orange-500' : 'bg-blue-600 text-white shadow-blue-200'}`}>
                    {isUpdating ? <RefreshCw size={28} className="animate-spin text-white"/> : <RefreshCw size={28} className="text-white shadow-xl shadow-blue-500"/>}
                    {isUpdating ? 'CALCULATING...' : 'SYNC MIJN PLAN'}
                  </button>
                  <div className="flex gap-6 items-start text-blue-800 bg-white/50 p-6 rounded-3xl italic">
                    <Info size={48} className="shrink-0 opacity-20 text-blue-600 italic font-black"/>
                    <p className="text-[10px] font-black italic leading-relaxed uppercase tracking-widest italic italic">
                      Wanneer u gewicht heeft verloren (geregistreerd in het Gewicht scherm), klik dan op de blauwe knop. De app herrekent de calorie-range van alle recepten zodat u blijft afvallen bij uw nieuwe gewicht.
                    </p>
                  </div>
                </div>

                <button onClick={() => { if(window.confirm("Volledige reset?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-400 font-black uppercase text-[10px] opacity-30 hover:opacity-100 transition-all mt-12 tracking-[0.4em] italic text-center font-black">Vernietig alle lokale sessiedata</button>
              </div>
            </div>
          )}

        </div>

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-3xl border-t-[6px] border-gray-50 flex justify-around p-3 pb-12 shadow-2xl z-50 rounded-t-[4rem] font-black italic">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-5 rounded-3xl transition-all duration-300 ${pagina === 'dashboard' ? 'bg-blue-600 text-white shadow-2xl scale-125 -translate-y-2' : 'text-gray-300'}`}>
                    <Utensils size={24} strokeWidth={3} />
                </div>
                <span className={`text-[9px] uppercase tracking-tighter font-black italic ${pagina === 'dashboard' ? 'text-blue-600 opacity-100' : 'text-gray-300 opacity-50'}`}>Vandaag</span>
            </button>

            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-5 rounded-3xl transition-all duration-300 ${pagina === 'planner' ? 'bg-blue-600 text-white shadow-2xl scale-125 -translate-y-2' : 'text-gray-300'}`}>
                    <Calendar size={24} strokeWidth={3} />
                </div>
                <span className={`text-[9px] uppercase tracking-tighter font-black italic ${pagina === 'planner' ? 'text-blue-600 opacity-100' : 'text-gray-300 opacity-50'}`}>Weekplan</span>
            </button>

            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-5 rounded-3xl transition-all duration-300 ${pagina === 'logboek' ? 'bg-blue-600 text-white shadow-2xl scale-125 -translate-y-2' : 'text-gray-300'}`}>
                    <Scale size={24} strokeWidth={3} />
                </div>
                <span className={`text-[9px] uppercase tracking-tighter font-black italic ${pagina === 'logboek' ? 'text-blue-600 opacity-100' : 'text-gray-300 opacity-50'}`}>Gewicht</span>
            </button>

            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-5 rounded-3xl transition-all duration-300 ${pagina === 'instellingen' ? 'bg-blue-600 text-white shadow-2xl scale-125 -translate-y-2' : 'text-gray-300'}`}>
                    <User size={24} strokeWidth={3} />
                </div>
                <span className={`text-[9px] uppercase tracking-tighter font-black italic ${pagina === 'instellingen' ? 'text-blue-600 opacity-100' : 'text-gray-300 opacity-50'}`}>Beheer</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;