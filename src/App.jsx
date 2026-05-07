import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Clock, Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Star, Activity, Zap, Target, ChevronDown, TrendingDown, History
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

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];

  // --- 1. LADEN ---
  useEffect(() => {
    const K = 'KV_V9_PRO_';
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
      const K = 'KV_V9_PRO_';
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
    setPagina('dashboard');
  };

  // Bereken totaal verlies
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
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover" />
        <div className="p-6">
          <h2 className="text-3xl font-black mb-4 leading-tight">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-6">
             <div className="bg-gray-50 p-2 rounded-xl text-center"><Flame size={16} className="mx-auto text-orange-500"/><p className="text-[9px] font-bold">Kcal</p><p className="font-black text-sm">{r.macros.kcal}</p></div>
             <div className="bg-blue-50 p-2 rounded-xl text-center"><ShieldCheck size={16} className="mx-auto text-blue-500"/><p className="text-[9px] font-bold">Eiwit</p><p className="font-black text-sm">{r.macros.eiwit}g</p></div>
             <div className="bg-yellow-50 p-2 rounded-xl text-center"><Zap size={16} className="mx-auto text-yellow-600"/><p className="text-[9px] font-bold">Vet</p><p className="font-black text-sm">{r.macros.vet}g</p></div>
             <div className="bg-green-50 p-2 rounded-xl text-center"><Activity size={16} className="mx-auto text-green-600"/><p className="text-[9px] font-bold">Carbs</p><p className="font-black text-sm">{r.macros.carbs}g</p></div>
          </div>
          <h3 className="font-black uppercase text-xs text-gray-400 mb-2">Ingrediënten</h3>
          <ul className="mb-6 space-y-1">
            {r.ingredienten.map((ing, i) => <li key={i} className="flex justify-between border-b py-2 text-sm"><span>{ing.item}</span><span className="font-bold">{ing.hoeveelheid} {ing.eenheid}</span></li>)}
          </ul>
          <h3 className="font-black uppercase text-xs text-gray-400 mb-2">Bereiding</h3>
          <div className="space-y-4">
            {r.instructies.map((ins, i) => <div key={i} className="flex gap-3 text-sm leading-relaxed"><span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">{i+1}</span>{ins}</div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex justify-center text-gray-900">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative overflow-hidden">
        
        <div className="flex-grow overflow-y-auto pb-32">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
              <div className="bg-blue-600 p-6 rounded-3xl shadow-2xl mb-8"><Utensils size={48} className="text-white" /></div>
              <h1 className="text-5xl font-black tracking-tighter italic text-blue-600 mb-2 uppercase">KETOVOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-[10px] font-bold mb-10 italic">Personalised Carnivore-Keto</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all">START DE QUIZ</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="p-8 pt-16 flex flex-col h-full">
              <h2 className="text-3xl font-black mb-2 uppercase italic border-b-4 border-blue-600 self-start">De Quiz</h2>
              <p className="text-gray-400 text-sm mb-10 font-bold">Stel je persoonlijke plan samen.</p>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Uw huidig gewicht in kilogram</label>
                  <input 
                    type="number" 
                    value={profiel.gewicht} 
                    placeholder="bijv. 95"
                    onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} 
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 font-black text-3xl text-blue-600 focus:border-blue-600 outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Jouw Doelstelling</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Afvallen', 'Gezondheid behouden', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-4 rounded-xl font-black text-sm border-2 text-left flex justify-between items-center ${profiel.doel === d ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}>
                        {d} {profiel.doel === d && <Target size={16}/>}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Aantal maaltijden per dag</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-5 rounded-2xl font-black text-xl border-2 ${profiel.aantalMaaltijden === n ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { if(profiel.gewicht) genereerPlan(profiel); else alert("Vul aub uw gewicht in."); }} 
                className="mt-12 w-full bg-gray-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Genereer mijn plan
              </button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="p-6 pt-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1 italic">Vandaag • {vandaagNaam}</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">Jouw Menu</h2>
                </div>
                <button onClick={() => genereerPlan(profiel)} className="group flex flex-col items-center gap-1">
                  <div className="p-3 bg-blue-600 text-white rounded-full shadow-lg group-active:rotate-180 transition-all duration-500">
                    <RefreshCw size={24}/>
                  </div>
                  <span className="text-[8px] font-black uppercase text-blue-600">Nieuwe voorstellen</span>
                </button>
              </div>

              <div className="space-y-4">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-all">
                    <img src={`/recepten/${r.id}.jpg`} className="w-24 h-24 rounded-[1.5rem] object-cover shadow-md" />
                    <div className="flex-grow">
                      <p className="text-[9px] font-black uppercase text-blue-600 mb-1 italic">{type}</p>
                      <h3 className="font-black text-lg leading-tight mb-1">{r.titel}</h3>
                      <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        <span className="flex items-center gap-1"><Flame size={10} className="text-orange-500"/> {r.macros.kcal} kcal</span>
                        <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-blue-500"/> {r.macros.eiwit}g</span>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-gray-200" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-100">
                  <Target size={24} className="mb-2 opacity-50"/>
                  <p className="text-[10px] font-black uppercase opacity-70">Jouw Doel</p>
                  <p className="text-xl font-black italic">{profiel.doel}</p>
                </div>
                <div onClick={() => setPagina('logboek')} className="bg-gray-900 p-6 rounded-[2rem] text-white shadow-lg shadow-gray-200 active:scale-95 transition-all">
                  <Scale size={24} className="mb-2 text-blue-500"/>
                  <p className="text-[10px] font-black uppercase opacity-70">Huidig Gewicht</p>
                  <p className="text-xl font-black italic">{profiel.gewicht} kg</p>
                </div>
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="p-8 pt-16">
              <h2 className="text-3xl font-black mb-2 uppercase italic border-b-4 border-blue-600 self-start inline-block">Voortgang</h2>
              <p className="text-gray-400 text-sm mb-10 font-bold italic text-left uppercase">Track je succes op lange termijn.</p>
              
              <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white mb-8 shadow-xl text-center">
                 <p className="text-[10px] font-black uppercase opacity-70 mb-1">Totaal resultaat</p>
                 <div className="flex items-center justify-center gap-2">
                    <TrendingDown size={32} className={totaalVerlies <= 0 ? "text-green-300" : "text-red-300"} />
                    <p className="text-5xl font-black italic tracking-tighter">{totaalVerlies} kg</p>
                 </div>
                 <p className="text-[9px] mt-4 font-bold opacity-60 uppercase italic">Sinds je eerste meting</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 mb-8">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-4 text-center tracking-widest">Nieuwe weging toevoegen</p>
                <div className="flex gap-2">
                  <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00.0" className="w-full p-4 rounded-2xl border-2 border-gray-200 font-black text-2xl outline-none focus:border-blue-600" />
                  <button onClick={() => {
                    if(nieuwGewicht) {
                      const update = [{ datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }, ...gewichtLog];
                      setGewichtLog(update);
                      setProfiel({...profiel, gewicht: nieuwGewicht});
                      setNieuwGewicht("");
                    }
                  }} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg active:scale-90"><Plus size={32}/></button>
                </div>
              </div>

              <h3 className="font-black uppercase text-xs text-gray-400 mb-4 flex items-center gap-2 px-2"><History size={14}/> Historiek</h3>
              <div className="space-y-3">
                {gewichtLog.map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-400 text-xs font-black uppercase italic">{log.datum}</span>
                    <span className="text-2xl font-black italic text-gray-800">{log.kg} kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="p-6 pt-10">
              <h2 className="text-3xl font-black uppercase italic mb-2 border-b-4 border-blue-600 inline-block">Weekplan</h2>
              <p className="text-gray-400 text-xs font-bold mb-8 uppercase tracking-widest italic">Overzicht van je menu's</p>
              <div className="space-y-6">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-5 rounded-[2rem] ${dag === vandaagNaam ? 'bg-blue-50 border-2 border-blue-100' : 'bg-gray-50 border-2 border-gray-50 opacity-60'}`}>
                    <h3 className={`font-black uppercase text-xs mb-3 italic ${dag === vandaagNaam ? 'text-blue-600' : 'text-gray-400'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="space-y-2">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center text-xs font-black bg-white p-4 rounded-xl shadow-sm">
                          <span className="uppercase text-[8px] text-blue-600 w-12 italic">{type}</span>
                          <span className="flex-grow truncate px-2 text-gray-800 uppercase italic tracking-tighter">{r.titel}</span>
                          <ChevronRight size={14} className="text-gray-300"/>
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
              <h2 className="text-3xl font-black mb-2 uppercase italic border-b-4 border-blue-600 self-start inline-block text-left">Instellingen</h2>
              <p className="text-gray-400 text-xs font-bold mb-10 uppercase tracking-widest italic text-left">Beheer je profiel en plan.</p>
              
              <div className="bg-gray-50 p-8 rounded-[2rem] mb-10 shadow-inner">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-widest text-left">Jouw Actueel Profiel</p>
                <div className="space-y-6">
                  <div className="flex justify-between font-black italic text-lg border-b border-gray-200 pb-2"><span>Gewicht:</span> <span className="text-blue-600">{profiel.gewicht} kg</span></div>
                  <div className="flex justify-between font-black italic text-lg border-b border-gray-200 pb-2"><span>Doel:</span> <span className="text-blue-600">{profiel.doel}</span></div>
                  <div className="flex justify-between font-black italic text-lg"><span>Ritme:</span> <span className="text-blue-600">{profiel.aantalMaaltijden} p/dag</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <button onClick={() => setPagina('onboarding')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm mb-4 shadow-lg active:scale-95 transition-all">
                    Update Plan (Nieuw Gewicht)
                  </button>
                  <p className="text-[10px] text-blue-700 font-bold italic leading-relaxed text-left">
                    <Info size={12} className="inline mr-1 mb-1"/> 
                    Gebruik deze knop als je gewicht is veranderd. De app berekent dan opnieuw je caloriebehoefte en kiest passendere recepten uit de database.
                  </p>
                </div>

                <button onClick={() => { if(window.confirm("Alles wissen en terug naar start?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-500 font-black uppercase text-[10px] opacity-40 hover:opacity-100">Reset alle gegevens</button>
              </div>
              
              <div className="mt-20 text-center opacity-30">
                <p className="text-[10px] font-black uppercase italic tracking-widest text-blue-600 mb-1">KetoVoor v2.0 Professional</p>
                <p className="text-[8px] font-bold">Gemaakt door Freddy Sleeuwaert</p>
              </div>
            </div>
          )}

        </div>

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-4 pb-10 shadow-2xl z-50 rounded-t-[3rem]">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={`p-3 rounded-2xl transition-all ${pagina === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-300'}`}><Utensils size={28} /></button>
            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={`p-3 rounded-2xl transition-all ${pagina === 'planner' ? 'bg-blue-50 text-blue-600' : 'text-gray-300'}`}><Calendar size={28} /></button>
            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={`p-3 rounded-2xl transition-all ${pagina === 'logboek' ? 'bg-blue-50 text-blue-600' : 'text-gray-300'}`}><Scale size={28} /></button>
            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className={`p-3 rounded-2xl transition-all ${pagina === 'instellingen' ? 'bg-blue-50 text-blue-600' : 'text-gray-300'}`}><User size={28} /></button>
        </nav>

      </div>
    </div>
  );
}

export default App;