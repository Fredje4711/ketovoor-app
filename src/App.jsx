import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { 
  Utensils, Calendar, User, ChevronRight, ArrowLeft, 
  Flame, ShieldCheck, Plus, Scale, RefreshCw, 
  Zap, Target, History, TrendingDown, CheckCircle, ArrowUp, Star, AlertCircle, HelpCircle, XCircle
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
  const [laatsteGewichtUpdate, setLaatsteGewichtUpdate] = useState(false);
  const [showError, setShowError] = useState(false); // Voor de popup
  const scrollRef = useRef(null);

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const K = 'KV_V25_PRO_';

  // --- MOBIELE SCROLL FIX ---
  useLayoutEffect(() => {
    const resetScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo(0, 0);
        scrollRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };
    resetScroll();
    const t = setTimeout(resetScroll, 50);
    return () => clearTimeout(t);
  }, [pagina, geselecteerdRecept]);

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

  const genereerPlan = (p, isFirstTime = false) => {
    // Check of gewicht is ingevuld
    if (!p.gewicht || p.gewicht === "") {
      setShowError(true);
      return;
    }

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
    if (!gewichtLog || gewichtLog.length < 1) return { start: 0, huidig: 0, verschil: "0.0" };
    const start = parseFloat(gewichtLog[0].kg);
    const huidig = parseFloat(gewichtLog[gewichtLog.length - 1].kg);
    return { start, huidig, verschil: (start - huidig).toFixed(1) };
  })();

  const getDagenBezig = () => {
    if (gewichtLog.length === 0) return 1;
    const dateParts = gewichtLog[0].datum.split(/[-/]/);
    const startDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    const diff = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  if (pagina === 'hulp') {
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic font-black uppercase">
        <header className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-50">
          <button onClick={() => setPagina('dashboard')} className="flex items-center gap-1 text-blue-600 font-bold uppercase text-sm italic font-black">← TERUG</button>
          <span className="text-xs font-black bg-blue-600 text-white px-4 py-1 rounded-full italic font-black">INFO</span>
        </header>
        <div className="p-8 space-y-10 overflow-y-auto italic font-black font-black">
          <h2 className="text-4xl uppercase border-b-8 border-blue-600 inline-block mb-2 italic">HOE WERKT HET?</h2>
          <div className="space-y-8 font-black italic">
            <div className="flex gap-4 italic font-black"><div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg">1</div><p className="text-xl leading-tight font-bold text-gray-700 italic font-black">DEZE APP BEREKENT MAALTIJDEN OP BASIS VAN UW GEWICHT.</p></div>
            <div className="flex gap-4 italic font-black"><div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg">2</div><p className="text-xl leading-tight font-bold text-gray-700 italic font-black">WILT U IETS ANDERS ETEN? KLIK OP "WISSEL GERECHTEN".</p></div>
            <div className="flex gap-4 border-l-8 border-orange-400 pl-4 py-4 bg-orange-50 font-black italic"><p className="text-orange-900 font-black uppercase text-base italic">BELANGRIJK: NA GEWICHTSVERLIES, KLIK IN HET "BEHEER" SCHERM OP "PLAN HERBEREKENEN".</p></div>
          </div>
          <button onClick={() => setPagina('dashboard')} className="w-full bg-blue-600 text-white py-7 rounded-[2rem] font-black uppercase text-2xl shadow-xl mt-10 italic">BEGREPEN</button>
        </div>
      </div>
    );
  }

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans text-gray-900 border-x italic font-black uppercase">
        <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-50">
          <button onClick={() => setGeselecteerdRecept(null)} className="text-blue-600 font-black text-sm italic">← TERUG</button>
          <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full italic font-black">DETAILS</span>
        </header>
        <img src={`/recepten/${r.id}.jpg`} className="h-64 w-full object-cover bg-gray-50 italic font-black" />
        <div className="p-6 italic font-black">
          <h2 className="text-3xl font-black mb-6 uppercase leading-tight text-blue-800 italic font-black">{r.titel}</h2>
          <div className="grid grid-cols-4 gap-2 mb-8 text-center font-black bg-blue-50/30 p-3 rounded-2xl border border-blue-100 italic">
             <div><p className="text-[9px] opacity-40 italic">KCAL</p><p className="text-base text-orange-600 italic">{r.macros.kcal}</p></div>
             <div><p className="text-[9px] opacity-40 italic">EIWIT</p><p className="text-base text-blue-700 italic">{r.macros.eiwit}g</p></div>
             <div><p className="text-[9px] opacity-40 italic">VET</p><p className="text-base text-yellow-600 italic">{r.macros.vet}g</p></div>
             <div><p className="text-[9px] opacity-40 italic">KOOLH.</p><p className="text-base text-green-600 italic">{r.macros.carbs}g</p></div>
          </div>
          <div className="space-y-8 italic font-black italic">
              <h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block italic font-black">INGRÉDIËNTEN</h3>
              <div className="space-y-1 italic">{r.ingredienten.map((ing, i) => <div key={i} className="flex justify-between border-b border-gray-50 py-2 text-lg italic"><span>{ing.item}</span><span className="text-blue-700 font-black">{ing.hoeveelheid} {ing.eenheid}</span></div>)}</div>
              <h3 className="font-black uppercase text-sm border-b-2 border-blue-600 pb-1 inline-block italic font-black">BEREIDING</h3>
              <div className="space-y-6 italic">{r.instructies.map((ins, i) => <div key={i} className="flex gap-4 text-lg leading-tight text-gray-700 italic border-l-4 border-blue-100 pl-4 italic"><p>{ins}</p></div>)}</div>
              {r.tips && r.tips.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl italic mt-6 font-black italic font-black">
                   <h4 className="flex items-center gap-2 text-amber-800 text-sm font-black uppercase mb-3 font-black italic italic font-black"><Star size={18} fill="#92400e"/> TIP VAN DE CHEF:</h4>
                   <ul className="space-y-2 italic font-black">{r.tips.map((tip, i) => <li key={i} className="text-lg text-amber-900 leading-tight italic font-black italic">"{tip}"</li>)}</ul>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex justify-center text-gray-900 select-none italic font-black font-black uppercase">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden italic font-black">
        
        <div ref={scrollRef} key={pagina} className="flex-grow overflow-y-auto pb-44 px-4 italic font-black">
          
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center text-center px-10 italic font-black italic">
              <div className="bg-blue-600 p-8 rounded-full shadow-2xl mb-8 text-white italic font-black"><Utensils size={80} /></div>
              <h1 className="text-7xl font-black italic text-blue-600 mb-2 uppercase leading-none font-black italic font-black italic font-black">KETO<br/>VOOR</h1>
              <p className="text-gray-400 uppercase tracking-widest text-xs mb-16 italic font-black font-black italic font-black">Professional Trayect</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black text-3xl shadow-xl active:scale-95 transition-all uppercase italic font-black">START</button>
            </div>
          )}

          {pagina === 'onboarding' && (
            <div className="pt-10 flex flex-col h-full italic italic font-black font-black">
              <h2 className="text-4xl uppercase border-b-4 border-blue-600 inline-block self-start mb-10 italic font-black italic font-black font-black italic">UW PROFIEL</h2>
              <div className="space-y-10 italic font-black italic">
                <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 text-center italic font-black">
                  <label className="text-sm uppercase text-blue-800 mb-3 block tracking-widest font-black italic font-black font-black">VUL UW GEWICHT IN (KG)</label>
                  <input type="text" inputMode="decimal" value={profiel.gewicht} placeholder="TYP UW GEWICHT" onChange={(e) => setProfiel({...profiel, gewicht: e.target.value})} className="w-full bg-white border-4 border-blue-300 p-6 rounded-3xl text-center font-black text-6xl text-blue-700 outline-none placeholder:text-blue-100 placeholder:text-xl italic font-black font-black" />
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic font-black">UW DOELSTELLING</label>
                  <div className="grid grid-cols-1 gap-2 italic">
                    {['Afvallen', 'Gezondheid', 'Spieropbouw'].map(d => (
                      <button key={d} onClick={() => setProfiel({...profiel, doel: d})} className={`p-5 rounded-2xl text-xl font-black border-2 flex justify-between items-center transition-all italic ${profiel.doel === d ? 'border-blue-700 bg-blue-700 text-white shadow-lg' : 'border-gray-100 text-gray-400 bg-gray-50'}`}><span className="uppercase font-black">{d}</span>{profiel.doel === d && <CheckCircle size={24}/>}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm uppercase text-gray-400 mb-4 block italic text-center font-black">MAALTIJDEN PER DAG</label>
                  <div className="grid grid-cols-3 gap-3 italic">
                    {[1, 2, 3].map(n => (
                      <button key={n} onClick={() => setProfiel({...profiel, aantalMaaltijden: n})} className={`p-5 rounded-2xl text-4xl border-2 transition-all italic ${profiel.aantalMaaltijden === n ? 'border-blue-700 bg-blue-700 text-white shadow-lg' : 'bg-gray-50 text-gray-300'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => genereerPlan(profiel, true)} className="mt-12 w-full bg-gray-900 text-white py-7 rounded-3xl font-black uppercase text-2xl shadow-xl active:scale-95 italic">PLAN GENEREREN</button>
            </div>
          )}

          {pagina === 'dashboard' && (
            <div className="pt-10 italic">
              <div className="flex flex-col gap-6 mb-10 italic">
                <div className="flex justify-between items-center italic">
                   <div><p className="text-xs uppercase text-blue-600 font-black italic tracking-widest">VANDAAG</p><h2 className="text-6xl font-black uppercase italic tracking-tighter">MENU</h2></div>
                   <button onClick={() => genereerPlan(profiel)} className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-black italic">
                      <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''}/>
                      <span className="text-xs font-black uppercase italic">WISSEL</span>
                   </button>
                </div>
                <button onClick={() => setPagina('hulp')} className="w-full bg-blue-50 text-blue-700 py-6 rounded-[2rem] text-xl font-black border-4 border-blue-200 flex items-center justify-center gap-3 active:bg-blue-100 shadow-lg italic">HULP & UITLEG <HelpCircle size={32} strokeWidth={3}/></button>
              </div>
              <div className="space-y-4 font-black italic">
                {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => (
                  <div key={type} onClick={() => setGeselecteerdRecept(r)} className="bg-white border border-gray-100 rounded-[2.5rem] p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-all border-b-8 italic">
                    <img src={`/recepten/${r.id}.jpg`} className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border shadow-sm font-black italic font-black italic" />
                    <div className="flex-grow italic font-black">
                      <p className="text-[10px] uppercase text-blue-700 font-black opacity-40 tracking-widest italic">{type}</p>
                      <h3 className="text-xl leading-tight mb-2 text-gray-800 uppercase italic font-black italic tracking-tighter">{r.titel}</h3>
                      <div className="flex gap-4 text-xs font-black text-gray-400 uppercase italic font-black italic"><span className="text-orange-500 font-black italic">{r.macros.kcal} KCAL</span><span className="text-blue-600 font-black">{r.macros.eiwit}G EIWIT</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'logboek' && (
            <div className="pt-10 text-left italic font-black font-black">
              <h2 className="text-4xl font-black uppercase border-b-4 border-blue-600 inline-block mb-10 italic">RESULTAAT</h2>
              <div className="grid grid-cols-2 gap-4 mb-10 font-black italic">
                 <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl text-center italic font-black italic">
                    <p className="text-[10px] uppercase opacity-60 mb-1 font-black italic">TOTAAL VERLIES</p>
                    <p className="text-4xl tracking-tighter font-black italic">{stats.verschil} KG</p>
                 </div>
                 <div className="bg-gray-100 p-8 rounded-3xl text-gray-600 text-center border-b-4 border-gray-200 shadow-inner font-black italic font-black italic font-black">
                    <p className="text-[10px] uppercase opacity-40 mb-1 font-black italic">DAGEN</p>
                    <p className="text-4xl font-black italic">{getDagenBezig()}</p>
                 </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl mb-10 border border-gray-100 font-black italic">
                <p className="text-xs uppercase text-gray-500 mb-5 text-center font-black italic underline decoration-blue-200 font-black italic font-black">METING OPSLAAN</p>
                <div className="flex flex-col gap-4 italic font-black font-black italic">
                  <div className="flex items-center justify-center bg-white p-4 rounded-2xl border-2 border-gray-100 italic">
                    <input type="text" inputMode="decimal" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00" className="w-full bg-transparent text-center font-black text-5xl text-blue-700 outline-none italic font-black font-black font-black" />
                    <span className="text-xl text-blue-200 font-black italic">KG</span>
                  </div>
                  <button onClick={() => { if(nieuwGewicht) { setGewichtLog([...gewichtLog, { datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }]); setProfiel({...profiel, gewicht: nieuwGewicht}); setNieuwGewicht(""); setLaatsteGewichtUpdate(true); } }} className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black uppercase text-xl shadow-lg active:scale-95 italic font-black font-black font-black">OPSLAAN</button>
                </div>
              </div>

              {laatsteGewichtUpdate && (
                <div className="bg-orange-50 border-8 border-orange-400 p-8 rounded-[3rem] mb-10 animate-bounce text-center italic font-black font-black font-black italic">
                    <AlertCircle size={56} className="mx-auto text-orange-600 mb-4 font-black italic font-black" />
                    <p className="text-2xl font-black text-orange-900 uppercase leading-none mb-6 italic">GEWICHT IS AANGEPAST!</p>
                    <button onClick={() => genereerPlan(profiel)} className="bg-orange-600 text-white w-full py-6 rounded-2xl font-black text-xl uppercase shadow-2xl font-black italic font-black font-black font-black">PLAN NU BIJWERKEN →</button>
                </div>
              )}

              <h3 className="uppercase text-sm font-black text-gray-400 mb-6 flex items-center gap-2 px-2 italic font-black italic font-black font-black"><History size={20}/> HISTORIEK</h3>
              <div className="space-y-2 font-black italic italic font-black">
                {[...gewichtLog].reverse().map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm font-black italic italic font-black">
                    <span className="text-gray-400 text-xs font-black uppercase italic font-black italic font-black">{log.datum}</span>
                    <span className="text-2xl text-gray-800 font-black italic italic font-black italic">{log.kg} KG</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'planner' && (
            <div className="pt-10 italic font-black">
              <h2 className="text-4xl font-black uppercase border-b-4 border-blue-600 inline-block mb-8 italic italic font-black font-black">WEEKPLAN</h2>
              <div className="space-y-4 font-black italic font-black font-black font-black">
                {dagenLijst.map(dag => (
                  <div key={dag} className={`p-4 rounded-3xl border-b-2 font-black italic ${dag === vandaagNaam ? 'bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-100 italic' : 'bg-white border-gray-100 opacity-60 shadow-sm'}`}>
                    <h3 className={`uppercase text-sm mb-3 font-black italic ${dag === vandaagNaam ? 'text-blue-700 underline decoration-blue-200' : 'text-gray-500'}`}>{dag} {dag === vandaagNaam && "• VANDAAG"}</h3>
                    <div className="space-y-1 italic font-black italic">
                      {weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => (
                        <div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-white px-4 py-2 rounded-xl active:bg-blue-50 border border-gray-50 italic">
                          <div className="flex items-center gap-4 font-black">
                             <span className="uppercase text-[9px] text-blue-700 font-black italic w-12 border-r italic font-black">{type}</span>
                             <span className="text-gray-800 font-black text-base uppercase italic tracking-tighter italic font-black italic">{r.titel}</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-200 italic font-black font-black" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagina === 'instellingen' && (
            <div className="pt-10 italic font-black">
              <div className="flex justify-between items-start mb-10 italic">
                <div><h2 className="text-4xl uppercase border-b-4 border-blue-600 inline-block italic font-black">BEHEER</h2></div>
                <button onClick={() => setPagina('hulp')} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-black border-2 border-blue-600 flex items-center gap-2 italic">HULP <HelpCircle size={18} strokeWidth={3}/></button>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-3xl mb-8 border border-blue-100 font-black italic">
                <p className="text-[12px] text-blue-800 uppercase mb-6 tracking-widest font-black italic border-b border-blue-200 pb-1 italic font-black">UW ACTIEF PROFIEL</p>
                <div className="space-y-4 italic font-black italic font-black">
                  <div className="flex justify-between items-center text-2xl italic font-black"><span>GEWICHT:</span> <span className="text-blue-700 font-black italic font-black">{profiel.gewicht} KG</span></div>
                  <div className="flex justify-between items-center text-lg italic uppercase text-gray-500 font-black font-black font-black"><span>DOEL:</span> <span className="text-blue-700 font-black italic italic font-black">{profiel.doel}</span></div>
                  <div className="flex justify-between items-center text-xl italic font-black font-black"><span>RITME:</span> <span className="text-blue-700 font-black italic font-black italic">{profiel.aantalMaaltijden} P/D</span></div>
                </div>
              </div>

              <div className="space-y-6 font-black italic">
                  <button onClick={() => genereerPlan(profiel)} disabled={isUpdating} className={`w-full py-6 rounded-2xl font-black uppercase text-xl shadow-xl flex items-center justify-center gap-4 italic transition-all font-black ${isUpdating ? 'bg-orange-500 animate-pulse font-black' : 'bg-blue-700 text-white font-black font-black'}`}>
                    <RefreshCw size={24} className={isUpdating ? 'animate-spin' : ''} />
                    {isUpdating ? 'BEZIG...' : 'PLAN HERBEREKENEN'}
                  </button>
                  <p className="text-xs text-gray-400 uppercase text-center font-black px-4 italic leading-tight font-black italic font-black">Herbereken uw maaltijden voor de volledige komende week op basis van uw nieuw gewicht.</p>
              </div>

              <button onClick={() => { if(window.confirm("Alle gegevens wissen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-6 text-red-500 font-black uppercase text-sm border-2 border-red-50 rounded-2xl mt-12 hover:bg-red-50 italic font-black font-black font-black font-black">WISSEN & OPNIEUW BEGINNEN</button>
            </div>
          )}

        </div>

        {/* POPUP MELDING (Foutmelding bij ontbrekend gewicht) */}
        {showError && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-6 italic font-black font-black uppercase">
            <div className="bg-white w-full rounded-[3rem] p-10 text-center shadow-2xl border-t-[12px] border-red-500 animate-in zoom-in duration-200 italic font-black">
              <XCircle size={80} className="text-red-500 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-gray-900 mb-4 italic font-black uppercase italic">GEWICHT ONTBREERT</h2>
              <p className="text-lg text-gray-500 font-black mb-10 italic uppercase font-black">VUL AUB EERST UW ACTUEEL GEWICHT IN OM VERDER TE GAAN.</p>
              <button onClick={() => setShowError(false)} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl shadow-xl active:scale-95 italic font-black italic font-black">IK GA HET INVULLEN</button>
            </div>
          </div>
        )}

        {/* --- NAVIGATIE ONDERAAN --- */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 pb-10 shadow-2xl z-50 rounded-t-3xl font-black italic italic font-black">
            <button onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black italic font-black ${pagina === 'dashboard' ? 'text-blue-700 font-black' : 'text-black opacity-80 font-black font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'dashboard' ? 'bg-blue-50' : 'bg-transparent'} transition-all font-black italic font-black font-black`}><Utensils size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic italic font-black italic font-black">VANDAAG</span>
            </button>
            <button onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'planner' ? 'text-blue-700' : 'text-black opacity-80 font-black italic font-black font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'planner' ? 'bg-blue-50' : 'bg-transparent'} transition-all font-black font-black`}><Calendar size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic italic font-black italic">WEEKPLAN</span>
            </button>
            <button onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'logboek' ? 'text-blue-700' : 'text-black opacity-80 font-black font-black font-black font-black font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'logboek' ? 'bg-blue-50' : 'bg-transparent'} transition-all font-black font-black font-black font-black font-black`}><Scale size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic italic font-black font-black font-black">RESULTAAT</span>
            </button>
            <button onClick={() => {setPagina('instellingen'); setGeselecteerdRecept(null);}} className={`flex flex-col items-center gap-1 group w-20 py-2 italic font-black ${pagina === 'instellingen' ? 'text-blue-700' : 'text-black opacity-80 font-black font-black font-black font-black font-black font-black font-black font-black'}`}>
                <div className={`p-3 rounded-xl ${pagina === 'instellingen' ? 'bg-blue-50' : 'bg-transparent'} transition-all font-black font-black font-black font-black`}><User size={28} strokeWidth={2.5} /></div>
                <span className="text-[10px] uppercase font-black italic font-black italic font-black font-black font-black">BEHEER</span>
            </button>
        </nav>

      </div>
    </div>
  );
}

export default App;