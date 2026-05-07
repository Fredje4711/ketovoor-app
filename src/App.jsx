import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Clock, Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Star, Activity, Zap, Target, ChevronDown
} from 'lucide-react';
import recipesData from './data/recipes.json';

function App() {
  // --- STATES ---
  const [pagina, setPagina] = useState('welkom'); 
  const [geselecteerdRecept, setGeselecteerdRecept] = useState(null);
  const [weekPlan, setWeekPlan] = useState({});
  const [profiel, setProfiel] = useState({ 
    gewicht: 95, 
    doel: 'Afvallen', 
    aantalMaaltijden: 3,
    activiteit: 'Gemiddeld' 
  });
  const [gewichtLog, setGewichtLog] = useState([]);
  const [nieuwGewicht, setNieuwGewicht] = useState("");

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];

  // --- 1. LADEN ---
  useEffect(() => {
    const K = 'KV_V8_CARNI_';
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
      const K = 'KV_V8_CARNI_';
      localStorage.setItem(K + 'user', JSON.stringify(profiel));
      localStorage.setItem(K + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(K + 'gewicht', JSON.stringify(gewichtLog));
    }
  }, [profiel, weekPlan, gewichtLog, pagina]);

  // --- 3. DE SLIMME LOGICA (De "Carnimeat" Engine) ---
  const genereerPlan = (p) => {
    // 1. Bereken dagelijkse behoefte (Mifflin-St Jeor versimpeld)
    // Voor een man van 95kg is de basis ongeveer 2000 kcal.
    let baseKcal = (10 * p.gewicht) + 900; 
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

      // Zoek recepten die het dichtst bij de kcal-behoefte liggen
      const match = (lijst) => {
        return lijst.sort((a, b) => 
          Math.abs(a.macros.kcal - kcalPerMaaltijd) - Math.abs(b.macros.kcal - kcalPerMaaltijd)
        )[Math.floor(Math.random() * 3)]; // Neem één van de top 3 matches voor variatie
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
    setPagina('dashboard');
  };

  // --- RENDER RECEPT DETAIL (Onveranderd qua data, mooier qua UI) ---
  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans border-x overflow-y-auto pb-10">
        <header className="p-4 border-b sticky top-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft size={20}/> Terug</button>
          <span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full">{r.maaltijd_type}</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover" />
        <div className="p-6">
          <h2 className="text-3xl font-black mb-4">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-gray-50 p-2 rounded-xl text-center"><Flame size={16} className="mx-auto text-orange-500"/><p className="text-[10px] font-bold">Kcal</p><p className="font-black">{r.macros.kcal}</p></div>
            <div className="bg-blue-50 p-2 rounded-xl text-center"><ShieldCheck size={16} className="mx-auto text-blue-500"/><p className="text-[10px] font-bold">Eiwit</p><p className="font-black">{r.macros.eiwit}g</p></div>
            <div className="bg-yellow-50 p-2 rounded-xl text-center"><Zap size={16} className="mx-auto text-yellow-600"/><p className="text-[10px] font-bold">Vet</p><p className="font-black">{r.macros.vet}g</p></div>
            <div className="bg-green-50 p-2 rounded-xl text-center"><Activity size={16} className="mx-auto text-green-600"/><p className="text-[10px] font-bold">Carbs</p><p className="font-black">{r.macros.carbs}g</p></div>
          </div>
          <h3 className="font-black uppercase text-xs text-gray-400 mb-2">Ingrediënten</h3>
          <ul className="mb-6 space-y-1">
            {r.ingredienten.map((ing, i) => <li key={i} className="flex justify-between border-b py-2 text-sm"><span>{ing.item}</span><span className="font-bold">{ing.hoeveelheid} {ing.eenheid}</span></li>)}
          </ul>
          <h3 className="font-black uppercase text-xs text-gray-400 mb-2">Bereiding</h3>
          <div className="space-y-4">
            {r.instructies.map((ins, i) => <div key={i} className="flex gap-3 text-sm leading-relaxed"><span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]">{i+1}</span>{ins}</div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex justify-center text-gray-900">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative overflow-hidden">
        
        {/* --- PAGINA CONTENT --- */}
        <div className="flex-grow overflow-y-auto pb-24">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
              <div className="bg-blue-600 p-6 rounded-3xl shadow-2xl mb-8 animate-bounce"><Utensils size={48} className="text-white" /></div>
              <h1 className="text-5xl font-black tracking-tighter italic text-blue-600 mb-2">KETOVOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-10">Jouw plan op maat</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all">START DE QUIZ</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="p-8 pt-16 flex flex-col h-full">
              <h2 className="text-3xl font-black mb-2 uppercase italic">Stel je plan samen</h2>
              <p className="text-gray-400 text-sm mb-10">We berekenen je behoeften op basis van je profiel.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400">Huidig Gewicht (kg)</label>
                  <input type="number" value={profiel.gewicht} onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl border-2 border-gray-100 font-bold text-xl mt-1 focus:border-blue-600 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400">Jouw Doel</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-3 rounded-xl font-bold text-xs border-2 ${profiel.doel === d ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}>{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400">Maaltijden per dag</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-4 rounded-xl font-bold border-2 ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => genereerPlan(profiel)} className="mt-12 w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">Genereer mijn plan</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="p-6 pt-10">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Vandaag • {vandaagNaam}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">Jouw Menu</h2>
                </div>
                <button onClick={() => genereerPlan(profiel)} className="p-3 bg-gray-100 rounded-full text-gray-400 active:rotate-180 transition-all duration-500"><RefreshCw size={20}/></button>
              </div>

              {/* DASHBOARD MAALTIJDEN */}
              <div className="space-y-4">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-50 rounded-[2rem] p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-all">
                    <img src={`/recepten/${r.id}.jpg`} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                    <div className="flex-grow">
                      <p className="text-[9px] font-black uppercase text-blue-600 mb-1">{type}</p>
                      <h3 className="font-bold text-lg leading-none mb-1">{r.titel}</h3>
                      <div className="flex gap-3 text-[10px] font-bold text-gray-400">
                        <span className="flex items-center gap-1"><Flame size={10}/> {r.macros.kcal} kcal</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={10}/> {r.macros.eiwit}g</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-200" />
                  </div>
                ))}
              </div>

              {/* STATS SNELKOPPELING */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-blue-600 p-6 rounded-[2rem] text-white">
                  <Target size={24} className="mb-2 opacity-50"/>
                  <p className="text-[10px] font-black uppercase opacity-70">Doel</p>
                  <p className="text-xl font-black">{profiel.doel}</p>
                </div>
                <div onClick={() => setPagina('logboek')} className="bg-gray-900 p-6 rounded-[2rem] text-white">
                  <Scale size={24} className="mb-2 opacity-50"/>
                  <p className="text-[10px] font-black uppercase opacity-70">Gewicht</p>
                  <p className="text-xl font-black">{profiel.gewicht} kg</p>
                </div>
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="p-6 pt-10">
              <h2 className="text-3xl font-black uppercase italic mb-8 border-b-4 border-blue-600 inline-block">Weekoverzicht</h2>
              <div className="space-y-6">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-4 rounded-3xl ${dag === vandaagNaam ? 'bg-blue-50 border-2 border-blue-100' : 'bg-gray-50 border-2 border-gray-50'}`}>
                    <h3 className={`font-black uppercase text-sm mb-3 ${dag === vandaagNaam ? 'text-blue-600' : 'text-gray-400'}`}>{dag}</h3>
                    <div className="space-y-2">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center text-xs font-bold bg-white p-3 rounded-xl shadow-sm">
                          <span className="uppercase text-[9px] text-gray-400 w-12">{type}</span>
                          <span className="flex-grow truncate px-2">{r.titel}</span>
                          <ChevronRight size={14} className="text-gray-300"/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="p-8 pt-16">
              <h2 className="text-3xl font-black mb-10 uppercase italic">Voortgang</h2>
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-gray-100 mb-6">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-4 text-center tracking-widest">Nieuwe meting</p>
                <div className="flex gap-2">
                  <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00.0" className="w-full p-4 rounded-2xl border-2 border-gray-200 font-black text-2xl outline-none focus:border-blue-600" />
                  <button onClick={() => {
                    if(nieuwGewicht) {
                      setGewichtLog([{ datum: new Date().toLocaleDateString(), kg: nieuwGewicht }, ...gewichtLog]);
                      setProfiel({...profiel, gewicht: nieuwGewicht});
                      setNieuwGewicht("");
                    }
                  }} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg"><Plus size={32}/></button>
                </div>
              </div>
              <div className="space-y-3">
                {gewichtLog.map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-400 text-xs font-bold">{log.datum}</span>
                    <span className="text-xl font-black">{log.kg} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'instellingen' && (
            <div className="p-8 pt-16">
              <h2 className="text-3xl font-black mb-10 uppercase italic">Instellingen</h2>
              <div className="bg-gray-50 p-6 rounded-3xl mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Jouw Profiel</p>
                <div className="space-y-4">
                  <div className="flex justify-between font-bold"><span>Huidig gewicht:</span> <span className="text-blue-600">{profiel.gewicht}kg</span></div>
                  <div className="flex justify-between font-bold"><span>Doel:</span> <span className="text-blue-600">{profiel.doel}</span></div>
                  <div className="flex justify-between font-bold"><span>Ritme:</span> <span className="text-blue-600">{profiel.aantalMaaltijden} p/dag</span></div>
                </div>
              </div>
              <button onClick={() => setPagina('onboarding')} className="w-full py-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-black uppercase text-xs mb-4">Plan herberekenen</button>
              <button onClick={() => { if(window.confirm("Alles wissen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-500 font-black uppercase text-[10px]">Reset alle gegevens</button>
              
              <div className="mt-12 text-center opacity-30">
                <p className="text-[10px] font-black uppercase">KetoVoor v2.0</p>
                <p className="text-[9px]">Gemaakt door Freddy Sleeuwaert</p>
              </div>
            </div>
          )}

        </div>

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-4 pb-8 shadow-2xl z-50 rounded-t-[2.5rem]">
            <button onClick={() => setPagina('dashboard')} className={`p-2 ${pagina === 'dashboard' ? 'text-blue-600' : 'text-gray-300'}`}><Utensils size={28} /></button>
            <button onClick={() => setPagina('planner')} className={`p-2 ${pagina === 'planner' ? 'text-blue-600' : 'text-gray-300'}`}><Calendar size={28} /></button>
            <button onClick={() => setPagina('logboek')} className={`p-2 ${pagina === 'logboek' ? 'text-blue-600' : 'text-gray-300'}`}><Scale size={28} /></button>
            <button onClick={() => setPagina('instellingen')} className={`p-2 ${pagina === 'instellingen' ? 'text-blue-600' : 'text-gray-300'}`}><User size={28} /></button>
        </nav>

      </div>
    </div>
  );
}

export default App;