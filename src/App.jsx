import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Clock, Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Star, Activity, Zap, Target, ChevronDown, TrendingDown, History, CheckCircle2
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
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];

  // --- 1. LADEN ---
  useEffect(() => {
    const K = 'KV_V10_FINAL_';
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
      const K = 'KV_V10_FINAL_';
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  // --- 3. DE SLIMME LOGICA ---
  const genereerPlan = (p) => {
    const gewichtNum = parseFloat(p.gewicht) || 90;
    let baseKcal = (10 * gewichtNum) + 900; 
    if (p.doel === 'Afvallen') baseKcal -= 400;
    if (p.doel === 'Spieropbouw') baseKcal += 400;

    const kcalPerMaaltijd = baseKcal / p.aantalMaaltijden;

    let tijdelijkPlan = {};
    const data = recipesData || [];

    dagenLijst.forEach(dag => {
      tijdelijkPlan[dag] = {};
      const ontbijten = data.filter(r => r.maaltijd_type === 'ontbijt');
      const lunches = data.filter(r => r.maaltijd_type === 'middagmaal');
      const diners = data.filter(r => r.maaltijd_type === 'diner');

      const match = (lijst) => {
        return lijst.sort((a, b) => 
          Math.abs(a.macros.kcal - kcalPerMaaltijd) - Math.abs(b.macros.kcal - kcalPerMaaltijd)
        )[Math.floor(Math.random() * 3)];
      };

      if (p.aantalMaaltijden === 1) tijdelijkPlan[dag].diner = match(diners);
      if (p.aantalMaaltijden === 2) { 
        tijdelijkPlan[dag].ontbijt = match(ontbijten); 
        tijdelijkPlan[dag].diner = match(diners); 
      }
      if (p.aantalMaaltijden === 3) { 
        tijdelijkPlan[dag].ontbijt = match(ontbijten); 
        tijdelijkPlan[dag].lunch = match(lunches); 
        tijdelijkPlan[dag].diner = match(diners); 
      }
    });

    setWeekPlan(tijdelijkPlan);
    setProfiel(p);
    setShowUpdatePrompt(false);
    if (pagina !== 'dashboard') setPagina('dashboard');
  };

  // Totaal verlies berekenen (Eerste meting min Laatste meting)
  const totaalVerlies = gewichtLog.length > 1 
    ? (parseFloat(gewichtLog[gewichtLog.length - 1].kg) - parseFloat(gewichtLog[0].kg)).toFixed(1)
    : 0;

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans border-x overflow-y-auto pb-10 text-gray-900">
        <header className="p-4 border-b sticky top-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft size={20}/> Terug</button>
          <span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full">{r.maaltijd_type}</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-100" />
        <div className="p-6">
          <h2 className="text-3xl font-black mb-4 leading-tight">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-6 text-center font-black">
             <div className="bg-gray-50 p-2 rounded-xl"><Flame size={16} className="mx-auto text-orange-500 mb-1"/><p className="text-[8px] uppercase opacity-50">Kcal</p><p className="text-xs">{r.macros.kcal}</p></div>
             <div className="bg-blue-50 p-2 rounded-xl"><ShieldCheck size={16} className="mx-auto text-blue-500 mb-1"/><p className="text-[8px] uppercase opacity-50">Eiwit</p><p className="text-xs">{r.macros.eiwit}g</p></div>
             <div className="bg-yellow-50 p-2 rounded-xl"><Zap size={16} className="mx-auto text-yellow-600 mb-1"/><p className="text-[8px] uppercase opacity-50">Vet</p><p className="text-xs">{r.macros.vet}g</p></div>
             <div className="bg-green-50 p-2 rounded-xl"><Activity size={16} className="mx-auto text-green-600 mb-1"/><p className="text-[8px] uppercase opacity-50">Carbs</p><p className="text-xs">{r.macros.carbs}g</p></div>
          </div>
          <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-2">Ingrediënten</h3>
          <ul className="mb-8 space-y-1">
            {r.ingredienten.map((ing, i) => <li key={i} className="flex justify-between border-b border-gray-50 py-3 text-sm font-bold text-gray-700"><span>{ing.item}</span><span className="text-blue-600">{ing.hoeveelheid} {ing.eenheid}</span></li>)}
          </ul>
          <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-4">Bereiding</h3>
          <div className="space-y-6">
            {r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-sm leading-relaxed text-gray-600 font-medium"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black shadow-md">{i+1}</span><p>{ins}</p></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex justify-center text-gray-900 select-none">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        <div className="flex-grow overflow-y-auto pb-36">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
              <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-2xl mb-10"><Utensils size={64} className="text-white" /></div>
              <h1 className="text-6xl font-black tracking-tighter italic text-blue-600 mb-2 uppercase">KETOVOOR</h1>
              <p className="text-gray-400 uppercase tracking-[0.3em] text-[10px] font-black mb-12 italic">Personalised Engine</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl active:scale-95 transition-all">START DE QUIZ</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="p-8 pt-16 flex flex-col h-full">
              <h2 className="text-4xl font-black mb-2 uppercase italic border-b-8 border-blue-600 self-start">De Quiz</h2>
              <p className="text-gray-400 text-sm mb-12 font-bold uppercase tracking-widest">Uw profiel instellen</p>
              
              <div className="space-y-10">
                <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-widest text-center italic">Uw huidig gewicht in kilogram</label>
                  <input 
                    type="number" 
                    value={profiel.gewicht} 
                    placeholder="00"
                    onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} 
                    className="w-full bg-transparent text-center font-black text-6xl text-blue-600 outline-none placeholder:opacity-20" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-widest italic">Wat is uw hoofddoel?</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['Afvallen', 'Gezondheid behouden', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-5 rounded-2xl font-black text-sm border-2 text-left flex justify-between items-center transition-all ${profiel.doel === d ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md scale-[1.02]' : 'border-gray-100 text-gray-400'}`}>
                        {d} {profiel.doel === d && <CheckCircle2 size={20}/>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-4 block tracking-widest italic text-center">Maaltijden per dag</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-6 rounded-3xl font-black text-2xl border-2 transition-all ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md scale-110' : 'border-gray-100 text-gray-400'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { if(profiel.gewicht) genereerPlan(profiel); else alert("Vul aub eerst uw gewicht in."); }} 
                className="mt-16 w-full bg-gray-900 text-white py-7 rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all text-xl"
              >
                Plan Genereren
              </button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="p-6 pt-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] mb-1 italic">Vandaag • {vandaagNaam}</p>
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter">Mijn Menu</h2>
                </div>
                <button onClick={() => genereerPlan(profiel)} className="group flex flex-col items-center gap-1 mt-2">
                  <div className="p-4 bg-blue-600 text-white rounded-full shadow-xl group-active:rotate-180 transition-all duration-500">
                    <RefreshCw size={24}/>
                  </div>
                  <span className="text-[8px] font-black uppercase text-blue-600 tracking-tighter">Nieuw Menu</span>
                </button>
              </div>

              <div className="space-y-5">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-5 flex items-center gap-5 shadow-sm active:scale-95 transition-all border-b-4">
                    <img src={`/recepten/${r.id}.jpg`} className="w-24 h-24 rounded-[1.8rem] object-cover shadow-inner bg-gray-50" />
                    <div className="flex-grow">
                      <p className="text-[10px] font-black uppercase text-blue-600 mb-1 italic opacity-60 tracking-widest">{type}</p>
                      <h3 className="font-black text-xl leading-none mb-2 text-gray-800">{r.titel}</h3>
                      <div className="flex gap-4 text-[10px] font-black text-gray-400 uppercase italic">
                        <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500"/> {r.macros.kcal}</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-500"/> {r.macros.eiwit}g</span>
                      </div>
                    </div>
                    <ChevronRight size={28} className="text-gray-200" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12">
                <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
                  <Target size={28} className="mb-3 opacity-40"/>
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1 italic text-left">Mijn Doel</p>
                  <p className="text-xl font-black italic text-left">{profiel.doel}</p>
                </div>
                <div onClick={() => setPagina('logboek')} className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl active:scale-95 transition-all">
                  <Scale size={28} className="mb-3 text-blue-500"/>
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-1 italic text-left text-gray-400">Gewicht</p>
                  <p className="text-xl font-black italic text-left">{profiel.gewicht} kg</p>
                </div>
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="p-8 pt-16">
              <h2 className="text-4xl font-black mb-2 uppercase italic border-b-8 border-blue-600 self-start inline-block">Mijn Resultaat</h2>
              <p className="text-gray-400 text-xs font-black mb-12 tracking-widest italic uppercase">Track je evolutie</p>
              
              <div className="bg-blue-600 p-10 rounded-[3rem] text-white mb-10 shadow-2xl text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown size={120}/></div>
                 <p className="text-[12px] font-black uppercase opacity-70 mb-2 tracking-[0.2em]">Totaal Verlies</p>
                 <div className="flex items-center justify-center gap-3">
                    <p className="text-7xl font-black italic tracking-tighter">{totaalVerlies} kg</p>
                 </div>
                 <p className="text-[10px] mt-6 font-black opacity-60 uppercase italic tracking-widest italic">Sinds de start van je KetoVoor traject</p>
              </div>

              {showUpdatePrompt && (
                <div className="bg-orange-50 border-4 border-orange-200 p-6 rounded-3xl mb-10 animate-pulse">
                   <p className="text-orange-800 font-black text-sm mb-4 text-center uppercase tracking-tighter italic">Nieuw gewicht gedetecteerd! Wilt u uw maaltijdplan direct aanpassen aan deze {profiel.gewicht} kg?</p>
                   <button onClick={() => genereerPlan(profiel)} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-lg">JA, REKEN OPNIEUW UIT</button>
                </div>
              )}

              <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-gray-100 mb-12">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-6 text-center tracking-[0.3em] italic">Nieuwe meting</p>
                <div className="flex gap-3">
                  <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-white p-5 rounded-2xl border-4 border-gray-100 font-black text-4xl text-center text-blue-600 outline-none focus:border-blue-600" />
                  <button onClick={() => {
                    if(nieuwGewicht) {
                      const update = [...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }];
                      setGewichtLog(update);
                      setProfiel({...profiel, gewicht: nieuwGewicht});
                      setNieuwGewicht("");
                      setShowUpdatePrompt(true);
                    }
                  }} className="bg-blue-600 text-white px-6 rounded-2xl shadow-xl active:scale-90"><Plus size={40}/></button>
                </div>
              </div>

              <h3 className="font-black uppercase text-xs text-gray-400 mb-6 flex items-center gap-2 px-2 italic tracking-widest"><History size={16}/> Metingen Historiek</h3>
              <div className="space-y-4">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white border-2 border-gray-50 rounded-3xl shadow-sm">
                    <span className="text-gray-400 text-[10px] font-black uppercase italic">{log.datum}</span>
                    <span className="text-3xl font-black italic text-gray-800">{log.kg} <small className="text-sm opacity-30 uppercase">kg</small></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="p-6 pt-10">
              <h2 className="text-4xl font-black uppercase italic mb-2 border-b-8 border-blue-600 inline-block">Mijn Week</h2>
              <p className="text-gray-400 text-[10px] font-black mb-10 uppercase tracking-[0.2em] italic">Alle geplande maaltijden</p>
              <div className="space-y-8">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-6 rounded-[2.5rem] transition-all ${dag === vandaagNaam ? 'bg-blue-50 border-4 border-blue-100' : 'bg-gray-50 border-2 border-gray-50 opacity-40'}`}>
                    <h3 className={`font-black uppercase text-sm mb-4 italic tracking-widest ${dag === vandaagNaam ? 'text-blue-600' : 'text-gray-400'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="space-y-3">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center text-xs font-black bg-white p-5 rounded-2xl shadow-sm border-b-2">
                          <div className="flex flex-col">
                            <span className="uppercase text-[8px] text-blue-600 mb-1 opacity-50 tracking-tighter italic">{type}</span>
                            <span className="text-gray-800 uppercase italic tracking-tighter text-sm">{r.titel}</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-200 shrink-0 ml-2"/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'instellingen' && (
            <div className="p-8 pt-16">
              <h2 className="text-4xl font-black mb-2 uppercase italic border-b-8 border-blue-600 self-start inline-block">Beheer</h2>
              <p className="text-gray-400 text-xs font-black mb-12 uppercase tracking-widest italic">Profiel & Systeem</p>
              
              <div className="bg-gray-50 p-10 rounded-[3rem] mb-12 shadow-inner border-2 border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-8 tracking-[0.2em] italic text-center underline decoration-blue-200">Uw profielgegegevens</p>
                <div className="space-y-8">
                  <div className="flex justify-between items-center font-black italic text-xl border-b border-gray-200 pb-4"><span>Gewicht</span> <span className="text-blue-600 bg-white px-4 py-1 rounded-full text-sm shadow-sm">{profiel.gewicht} kg</span></div>
                  <div className="flex justify-between items-center font-black italic text-xl border-b border-gray-200 pb-4"><span>Mijn Doel</span> <span className="text-blue-600 bg-white px-4 py-1 rounded-full text-xs shadow-sm">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center font-black italic text-xl"><span>Eetritme</span> <span className="text-blue-600 bg-white px-4 py-1 rounded-full text-sm shadow-sm">{profiel.aantalMaaltijden} p/dag</span></div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-8 rounded-[2.5rem] border-4 border-blue-100 shadow-xl">
                  <button onClick={() => setPagina('onboarding')} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-lg mb-6 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                    <RefreshCw size={24}/> Update Mijn Plan
                  </button>
                  <div className="flex gap-4 items-start text-blue-700">
                    <Info size={24} className="shrink-0 opacity-50"/>
                    <p className="text-[10px] font-black italic leading-relaxed uppercase tracking-tighter">
                      Wanneer uw gewicht verandert, is het raadzaam dit plan te updaten. De app berekent dan de nieuwe porties voor uw maaltijden.
                    </p>
                  </div>
                </div>

                <button onClick={() => { if(window.confirm("Alles wissen en terug naar start?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-500 font-black uppercase text-[10px] opacity-30 hover:opacity-100 transition-all mt-10 tracking-[0.3em]">Reset alle applicatiegegevens</button>
              </div>
              
              <div className="mt-20 text-center opacity-30">
                <p className="text-[10px] font-black uppercase italic tracking-[0.3em] text-blue-600 mb-1">KetoVoor v2.0 Professional</p>
                <p className="text-[8px] font-black">Powered by Freddy Sleeuwaert</p>
              </div>
            </div>
          )}

        </div>

        {/* --- NAVIGATIE ONDERAAN (MET TEKST LABELS) --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-4 border-gray-50 flex justify-around p-2 pb-10 shadow-2xl z-50 rounded-t-[3.5rem]">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-3 rounded-2xl transition-all ${pagina === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300'}`}>
                    <Utensils size={24} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${pagina === 'dashboard' ? 'text-blue-600' : 'text-gray-300'}`}>Vandaag</span>
            </button>

            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-3 rounded-2xl transition-all ${pagina === 'planner' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300'}`}>
                    <Calendar size={24} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${pagina === 'planner' ? 'text-blue-600' : 'text-gray-300'}`}>Weekplan</span>
            </button>

            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-3 rounded-2xl transition-all ${pagina === 'logboek' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300'}`}>
                    <Scale size={24} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${pagina === 'logboek' ? 'text-blue-600' : 'text-gray-300'}`}>Gewicht</span>
            </button>

            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className="flex flex-col items-center gap-1 group w-20">
                <div className={`p-3 rounded-2xl transition-all ${pagina === 'instellingen' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300'}`}>
                    <User size={24} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${pagina === 'instellingen' ? 'text-blue-600' : 'text-gray-300'}`}>Profiel</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;