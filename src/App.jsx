import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Info, Zap, Target, History, TrendingDown, CheckCircle
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

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const K = 'KV_V14_FINAL_PRO_';

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

  // --- 3. LOGICA ---
  const genereerPlan = (p, isFirstTime = false) => {
    setIsUpdating(true);
    
    // Als dit de eerste keer is, voeg het startgewicht toe aan het logboek
    if (isFirstTime && gewichtLog.length === 0) {
        const startMeting = { datum: new Date().toLocaleDateString('nl-BE'), kg: p.gewicht };
        setGewichtLog([startMeting]);
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
        const match = (lijst) => lijst.sort((a,b) => Math.abs(a.macros.kcal - kcalPerMaaltijd) - Math.abs(b.macros.kcal - kcalPerMaaltijd))[Math.floor(Math.random()*3)];
        
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

  // --- REKENWERK RESULTAAT ---
  const getResultaten = () => {
    if (gewichtLog.length < 1) return { start: 0, huidig: 0, verschil: "0.0" };
    const start = parseFloat(gewichtLog[0].kg);
    const huidig = parseFloat(gewichtLog[gewichtLog.length - 1].kg);
    const verschil = (start - huidig).toFixed(1); // Positief getal bij afvallen
    return { start, huidig, verschil };
  };

  const stats = getResultaten();
  const dagenBezig = gewichtLog.length > 0 ? Math.max(1, Math.ceil((new Date() - new Date(gewichtLog[0].datum.split('-').reverse().join('-'))) / (1000*60*60*24))) : 1;

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white/95 z-50">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-1 text-blue-600 font-bold uppercase text-xs italic">← Terug</button>
          <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full uppercase italic">Gerecht Details</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-50 shadow-inner" />
        <div className="p-8">
          <h2 className="text-3xl font-black mb-6 uppercase leading-[0.9] italic border-l-[10px] border-blue-600 pl-4">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-10 text-center font-black italic">
             <div className="bg-gray-50 p-2 rounded-xl border border-gray-100"><Flame size={16} className="mx-auto text-orange-500 mb-1"/><p className="text-[8px] opacity-40 uppercase">Kcal</p><p className="text-sm">{r.macros.kcal}</p></div>
             <div className="bg-blue-50 p-2 rounded-xl border border-blue-100"><ShieldCheck size={16} className="mx-auto text-blue-500 mb-1"/><p className="text-[8px] opacity-40 uppercase">Eiwit</p><p className="text-sm">{r.macros.eiwit}g</p></div>
             <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100"><Zap size={16} className="mx-auto text-yellow-600 mb-1"/><p className="text-[8px] opacity-40 uppercase">Vet</p><p className="text-sm">{r.macros.vet}g</p></div>
             <div className="bg-green-50 p-2 rounded-xl border border-green-100"><TrendingDown size={16} className="mx-auto text-green-600 mb-1"/><p className="text-[8px] opacity-40 uppercase">Carbs</p><p className="text-sm">{r.macros.carbs}g</p></div>
          </div>
          <div className="space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] italic flex items-center gap-2"><div className="w-8 h-1 bg-blue-600"></div> Ingrediënten</h3>
              <div className="space-y-2">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-3 text-sm font-bold text-gray-700 uppercase italic italic"><span>{ing.item}</span><span className="text-blue-600 font-black">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] italic flex items-center gap-2"><div className="w-8 h-1 bg-blue-600"></div> Bereidingswijze</h3>
              <div className="space-y-6">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-sm leading-relaxed text-gray-600 italic"><span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black shadow-lg">{i+1}</span><p>{ins}</p></div>)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center text-gray-900 select-none italic font-black">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden italic">
        
        <div className="flex-grow overflow-y-auto pb-40">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center p-12 text-center bg-white italic">
              <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl mb-10 text-white italic"><Utensils size={64} /></div>
              <h1 className="text-7xl font-black tracking-tighter italic text-blue-600 mb-2 uppercase leading-[0.85]">KETO<br/>VOOR</h1>
              <p className="text-gray-300 uppercase tracking-[0.4em] text-[10px] font-black mb-16 italic font-black">Professional Engine</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl active:scale-95 transition-all uppercase italic italic font-black">Start Traject</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="p-8 pt-16 flex flex-col h-full font-black italic">
              <h2 className="text-4xl uppercase border-b-[10px] border-blue-600 inline-block self-start mb-2 italic">De Quiz</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest italic font-black">Stel uw plan samen</p>
              <div className="space-y-12 italic">
                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest italic">Uw gewicht in kilogram (KG)</label>
                  <div className="bg-gray-50 p-6 rounded-[2rem] border-4 border-gray-100 flex items-center justify-center relative italic">
                    <input type="number" value={profiel.gewicht} placeholder="00" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-transparent text-center font-black text-6xl text-blue-600 outline-none placeholder:opacity-10 italic" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest italic font-black">Kies uw doel</label>
                  <div className="grid grid-cols-1 gap-3 italic">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-5 rounded-2xl text-left border-2 flex justify-between items-center transition-all italic ${profiel.doel === d ? 'border-blue-600 bg-blue-600 text-white shadow-xl' : 'border-gray-100 text-gray-400 bg-gray-50'}`}><span className="uppercase font-black text-sm">{d}</span>{profiel.doel === d && <CheckCircle size={18}/>}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-gray-400 mb-4 block tracking-widest italic text-center font-black italic">Maaltijden per dag</label>
                  <div className="grid grid-cols-3 gap-3 italic">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-5 rounded-2xl text-2xl border-2 transition-all italic font-black ${profiel.aantalMaaltijden === n ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white text-gray-300 border-gray-100'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => { if(profiel.gewicht) genereerPlan(profiel, true); else alert("Gewicht is verplicht."); }} className="mt-16 w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black uppercase text-xl shadow-2xl active:scale-95 transition-all italic font-black italic font-black">Bereken Mijn Plan</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="p-6 pt-10 font-black italic italic italic">
              <div className="flex justify-between items-start mb-10 italic italic">
                <div><p className="text-[10px] uppercase text-blue-600 tracking-widest mb-1 italic">Vandaag • {vandaagNaam}</p><h2 className="text-6xl uppercase italic tracking-tighter italic">MIJN MENU</h2></div>
                <button onClick={() => genereerPlan(profiel)} className={`p-5 rounded-full shadow-2xl transition-all duration-700 ${isUpdating ? 'bg-orange-500' : 'bg-blue-600 text-white active:scale-75'}`}><RefreshCw size={28} className={isUpdating ? 'animate-spin text-white italic font-black' : ''}/></button>
              </div>
              <div className="space-y-6 italic italic italic font-black">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-5 flex items-center gap-5 shadow-sm active:scale-95 transition-all border-b-[10px] border-gray-100 italic">
                    <img src={`/recepten/${r.id}.jpg`} className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shadow-lg italic" />
                    <div className="flex-grow italic">
                      <p className="text-[10px] uppercase text-blue-600 mb-1 opacity-40 font-black italic italic">{type}</p>
                      <h3 className="text-lg leading-none mb-2 text-gray-800 uppercase italic font-black italic tracking-tighter">{r.titel}</h3>
                      <div className="flex gap-3 text-[10px] font-black text-gray-300 uppercase italic"><span className="flex items-center gap-1 text-orange-400">{r.macros.kcal} KCAL</span><span className="flex items-center gap-1 text-blue-500 font-black italic">{r.macros.eiwit}G EI</span></div>
                    </div>
                    <ChevronRight size={24} className="text-gray-200 italic" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="p-8 pt-16 font-black italic text-left italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-2 italic">Resultaat</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest italic font-black italic">Uw evolutie</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10 italic">
                 <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl text-center italic">
                    <p className="text-[10px] uppercase opacity-60 mb-2 italic">Totaal Verlies</p>
                    <p className="text-5xl tracking-tighter italic">{stats.verschil} KG</p>
                 </div>
                 <div className="bg-gray-100 p-8 rounded-[2.5rem] text-gray-600 text-center border-b-8 border-gray-200 italic shadow-inner">
                    <p className="text-[10px] uppercase opacity-40 mb-2 italic">Dagen Bezig</p>
                    <p className="text-5xl italic">{dagenBezig}</p>
                 </div>
              </div>

              <div className="bg-gray-50 p-8 rounded-[3rem] mb-12 border-2 border-gray-100 italic">
                <p className="text-[10px] uppercase text-gray-400 mb-8 text-center tracking-[0.3em] italic underline decoration-blue-200">Meting vandaag opslaan</p>
                <div className="flex flex-col gap-5 italic italic">
                  <div className="flex items-center justify-center bg-white p-6 rounded-[2rem] border-4 border-gray-100 italic">
                    <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-6xl text-blue-600 outline-none italic italic font-black" />
                    <span className="text-2xl text-blue-100 italic">KG</span>
                  </div>
                  <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, gewicht: nieuwGewicht}); setNieuwGewicht(""); } }} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xl shadow-xl active:scale-95 italic">Meting Opslaan</button>
                </div>
              </div>

              <h3 className="uppercase text-xs text-gray-400 mb-6 flex items-center gap-2 px-2 italic tracking-[0.2em] font-black italic"><History size={16}/> Geschiedenis</h3>
              <div className="space-y-4 px-1 italic">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white border-2 border-gray-50 rounded-[2rem] shadow-sm italic">
                    <span className="text-gray-400 text-[10px] font-black uppercase italic italic">{log.datum}</span>
                    <span className="text-3xl text-gray-800 font-black italic tracking-tighter">{log.kg} <small className="text-[10px] opacity-30">KG</small></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="p-6 pt-10 text-left font-black italic italic">
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-10 italic">Weekplan</h2>
              <div className="space-y-10 font-black italic">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-8 rounded-[3rem] transition-all border-b-[12px] ${dag === vandaagNaam ? 'bg-blue-50 border-blue-200 shadow-xl' : 'bg-white border-gray-50 opacity-50 shadow-inner italic'}`}>
                    <h3 className={`uppercase text-xs mb-6 tracking-widest font-black italic ${dag === vandaagNaam ? 'text-blue-600' : 'text-gray-400 italic'}`}>{dag} {dag === vandaagNaam && "• ACTUEEL"}</h3>
                    <div className="space-y-4 font-black italic italic">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm italic font-black italic border-b-2">
                          <div className="flex flex-col italic">
                            <span className="uppercase text-[8px] text-blue-600 mb-1 opacity-50 tracking-tighter italic font-black italic font-black">{type}</span>
                            <span className="text-gray-800 uppercase italic tracking-tighter text-[13px] italic font-black">{r.titel}</span>
                          </div>
                          <ChevronRight size={24} className="text-gray-100 shrink-0 font-black italic italic"/>
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
              <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-2 italic">Beheer</h2>
              <p className="text-gray-400 text-[10px] mb-12 uppercase tracking-widest font-black italic">Systeem Instellingen</p>
              
              <div className="bg-gray-50 p-10 rounded-[3rem] mb-10 shadow-inner border-2 border-gray-100 italic">
                <p className="text-[10px] text-gray-400 uppercase mb-8 tracking-[0.3em] italic text-center underline italic italic font-black">Actief Profiel</p>
                <div className="space-y-8 italic italic font-black italic">
                  <div className="flex justify-between items-center text-2xl border-b border-gray-200 pb-4 italic font-black"><span>Gewicht</span> <span className="text-blue-600 italic font-black">{profiel.gewicht} kg</span></div>
                  <div className="flex justify-between items-center text-xl border-b border-gray-200 pb-4 uppercase italic tracking-tighter font-black"><span>Mijn Doel</span> <span className="text-blue-600 italic font-black italic">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-2xl italic font-black italic italic font-black"><span>Aantal</span> <span className="text-blue-600 italic font-black">{profiel.aantalMaaltijden} p/dag</span></div>
                </div>
              </div>

              <div className="bg-blue-50 p-10 rounded-[3rem] border-4 border-blue-100 shadow-2xl mb-12 italic italic italic font-black">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-7 rounded-[2rem] font-black uppercase text-xl mb-8 shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 italic ${isUpdating ? 'bg-orange-500' : 'bg-blue-600 text-white italic font-black'}`}>
                    {isUpdating ? <RefreshCw size={28} className="animate-spin text-white italic font-black" /> : <RefreshCw size={28} className="text-white shadow-xl shadow-blue-500 italic" />}
                    {isUpdating ? 'SYNC...' : 'Plan Herberekenen'}
                  </button>
                  <div className="flex gap-5 items-start text-blue-700 italic italic font-black italic">
                    <Info size={48} className="shrink-0 opacity-30 italic font-black italic font-black"/>
                    <p className="text-[10px] leading-relaxed uppercase tracking-[0.1em] font-black italic font-black">Heeft u een nieuw gewicht ingevoerd in het "GEWICHT" scherm? Klik dan hierboven. De app herberekent uw maaltijden voor de volledige komende week zodat uw kcal-behoefte klopt met uw nieuwe gewicht.</p>
                  </div>
              </div>

              <button onClick={() => { if(window.confirm("Alles wissen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 text-red-500 font-black uppercase text-[10px] opacity-20 text-center hover:opacity-100 tracking-[0.4em] italic font-black">Volledige systeemreset</button>
            </div>
          )}

        </div>

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t-[6px] border-gray-50 flex justify-around p-2 pb-12 shadow-2xl z-50 rounded-t-[4rem] font-black italic">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black italic ${pagina === 'dashboard' ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`p-5 rounded-[1.8rem] transition-all duration-300 ${pagina === 'dashboard' ? 'bg-blue-600 text-white shadow-2xl scale-125 -translate-y-2 italic font-black' : 'bg-transparent text-gray-300'}`}><Utensils size={24} /></div>
                <span className="text-[9px] uppercase tracking-tighter font-black italic italic font-black">Vandaag</span>
            </button>
            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black italic ${pagina === 'planner' ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`p-5 rounded-[1.8rem] transition-all duration-300 ${pagina === 'planner' ? 'bg-blue-600 text-white shadow-2xl scale-125 -translate-y-2 italic font-black' : 'bg-transparent text-gray-300'}`}><Calendar size={24} /></div>
                <span className="text-[9px] uppercase tracking-tighter font-black italic italic font-black italic">Weekplan</span>
            </button>
            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black italic ${pagina === 'logboek' ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`p-5 rounded-[1.8rem] transition-all duration-300 ${pagina === 'logboek' ? 'bg-blue-600 text-white shadow-2xl scale-125 -translate-y-2 italic font-black' : 'bg-transparent text-gray-300'}`}><Scale size={24} /></div>
                <span className="text-[9px] uppercase tracking-tighter font-black italic italic font-black">Gewicht</span>
            </button>
            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black italic ${pagina === 'instellingen' ? 'text-blue-600' : 'text-gray-300'}`}>
                <div className={`p-5 rounded-[1.8rem] transition-all duration-300 ${pagina === 'instellingen' ? 'bg-blue-600 text-white shadow-2xl scale-125 -translate-y-2 italic font-black' : 'bg-transparent text-gray-300'}`}><User size={24} /></div>
                <span className="text-[9px] uppercase tracking-tighter font-black italic italic font-black italic font-black italic">Beheer</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;