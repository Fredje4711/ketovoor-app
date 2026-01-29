import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, ClipboardList, User, ChevronRight, ArrowLeft, 
  Clock, Flame, ShieldCheck, LogOut, Plus, Scale, RefreshCw, Home, Timer, Droplets, Info, Star, Activity, Zap, HelpCircle
} from 'lucide-react';
import recipesData from './data/recipes.json';

function App() {
  const [pagina, setPagina] = useState('welkom'); 
  const [geselecteerdRecept, setGeselecteerdRecept] = useState(null);
  const [weekPlan, setWeekPlan] = useState({});
  const [profiel, setProfiel] = useState({ doel: 'Gezondheid', aantalMaaltijden: 3 });
  const [waterStatus, setWaterStatus] = useState(0); 
  const [gewichtLog, setGewichtLog] = useState([]);
  const [nieuwGewicht, setNieuwGewicht] = useState("");
  const [melding, setMelding] = useState("");
  const [vastenStartTijd, setVastenStartTijd] = useState(null);
  const [vastenDoel, setVastenDoel] = useState(16);
  const [verstrekenTijd, setVerstrekenTijd] = useState("00:00");

  const dagenLijst = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const vandaagNaam = dagenLijst[new Date().getDay()];
  const standaardFoto = "/recepten/standaard.jpg";

  useEffect(() => {
    try {
      const KEY = 'KV_ULTIMATE_V66_';
      const p = localStorage.getItem(KEY + 'user');
      if (p) {
        setProfiel(JSON.parse(p));
        setWeekPlan(JSON.parse(localStorage.getItem(KEY + 'plan') || '{}'));
        setGewichtLog(JSON.parse(localStorage.getItem(KEY + 'gewicht') || '[]'));
        setWaterStatus(Number(localStorage.getItem(KEY + 'water')) || 0);
        setVastenStartTijd(localStorage.getItem(KEY + 'v_start'));
        setPagina('dashboard');
      }
    } catch (e) { localStorage.clear(); }
  }, []);

  useEffect(() => {
    if (pagina !== 'welkom') {
      const KEY = 'KV_ULTIMATE_V66_';
      localStorage.setItem(KEY + 'user', JSON.stringify(profiel));
      localStorage.setItem(KEY + 'plan', JSON.stringify(weekPlan));
      localStorage.setItem(KEY + 'gewicht', JSON.stringify(gewichtLog));
      localStorage.setItem(KEY + 'water', waterStatus.toString());
      if (vastenStartTijd) localStorage.setItem(KEY + 'v_start', vastenStartTijd);
      else localStorage.removeItem(KEY + 'v_start');
    }
  }, [profiel, weekPlan, gewichtLog, waterStatus, vastenStartTijd, pagina]);

  useEffect(() => {
    let interval;
    if (vastenStartTijd) {
      interval = setInterval(() => {
        const diff = new Date() - new Date(vastenStartTijd);
        const u = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setVerstrekenTijd(`${u.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }, 1000);
    } else { setVerstrekenTijd("00:00"); }
    return () => clearInterval(interval);
  }, [vastenStartTijd]);

  const genereerPlan = (nieuwProfiel) => {
    let tijdelijkPlan = {};
    const data = recipesData || [];
    const o = data.filter(r => r.maaltijd_type === 'ontbijt');
    const l = data.filter(r => r.maaltijd_type === 'middagmaal');
    const d = data.filter(r => r.maaltijd_type === 'diner');
    dagenLijst.forEach(dag => {
      tijdelijkPlan[dag] = {};
      const kies = (list) => list.length > 0 ? list[Math.floor(Math.random() * list.length)] : data[0];
      if (nieuwProfiel.aantalMaaltijden === 1) tijdelijkPlan[dag].diner = kies(d);
      else if (nieuwProfiel.aantalMaaltijden === 2) { tijdelijkPlan[dag].ontbijt = kies(o); tijdelijkPlan[dag].diner = kies(d); }
      else { tijdelijkPlan[dag].ontbijt = kies(o); tijdelijkPlan[dag].lunch = kies(l); tijdelijkPlan[dag].diner = kies(d); }
    });
    setWeekPlan(tijdelijkPlan); setProfiel(nieuwProfiel); setPagina('dashboard');
    setMelding("Menu vernieuwd!"); setTimeout(() => setMelding(""), 2000);
  };

  const PaginaHeader = ({ titel }) => (
    <header className="flex justify-between items-center mb-8 px-2 pt-4">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 border-b-4 border-[#23a9e4] leading-none">{titel}</h2>
      <button 
        onClick={() => window.open('/info.html', '_blank')} 
        className="bg-gray-100 text-gray-400 p-2 rounded-full active:scale-90 shadow-sm"
      >
        <HelpCircle size={24}/>
      </button>
    </header>
  );

  if (geselecteerdRecept) {
    const r = geselecteerdRecept;
    return (
      <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col font-sans border-x overflow-y-auto pb-24 text-gray-900">
        <header className="p-4 border-b sticky top-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between">
          <button onClick={() => setGeselecteerdRecept(null)} className="flex items-center gap-2 text-[#23a9e4] font-bold bg-blue-50 px-4 py-2 rounded-full active:scale-90"><ArrowLeft size={18}/> Terug</button>
          <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{r?.maaltijd_type}</span>
        </header>
        <main>
          <img src={`/recepten/${r?.id}.jpg`} className="h-72 w-full object-cover bg-gray-100" onError={(e) => { e.target.onerror = null; e.target.src = standaardFoto; }} />
          <div className="p-8">
            <h2 className="text-3xl font-black mb-8 leading-tight text-gray-900">{r?.titel}</h2>
            <div className="grid grid-cols-4 gap-2 mb-3 text-center">
               <div className="bg-gray-50 p-2 rounded-xl border border-gray-100"><Clock size={14} className="mx-auto mb-1 text-gray-400"/><p className="text-[9px] font-bold uppercase leading-none">Tijd</p><p className="font-black text-[10px] text-gray-900">{r?.prep_tijd}m</p></div>
               <div className="bg-gray-50 p-2 rounded-xl border border-gray-100"><Flame size={14} className="mx-auto mb-1 text-orange-400"/><p className="text-[9px] font-bold uppercase leading-none">Kcal</p><p className="font-black text-[10px] text-gray-900">{r?.macros?.kcal}</p></div>
               <div className="bg-blue-50 p-2 rounded-xl border border-blue-100"><ShieldCheck size={14} className="mx-auto mb-1 text-[#23a9e4]"/><p className="text-[9px] font-bold uppercase leading-none">Eiwit</p><p className="font-black text-[10px] text-gray-900">{r?.macros?.eiwit}g</p></div>
               <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100"><Zap size={14} className="mx-auto mb-1 text-yellow-600"/><p className="text-[9px] font-bold uppercase leading-none">Vet</p><p className="font-black text-[10px] text-gray-900">{r?.macros?.vet || '0'}g</p></div>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100 text-green-700 mb-8 flex justify-between items-center shadow-sm">
               <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg text-green-600 shadow-sm"><Activity size={20}/></div><p className="font-black uppercase text-xs tracking-widest">Koolhydraten</p></div>
               <p className="text-2xl font-black">{r?.macros?.carbs}g</p>
            </div>
            {r?.micros_info && <div className="bg-gray-900 text-white p-5 rounded-3xl mb-10 flex items-center gap-4 shadow-xl border-b-4 border-[#23a9e4]"><div className="bg-[#23a9e4] p-3 rounded-2xl text-white"><Star size={24} /></div><div><p className="text-[10px] font-black uppercase text-[#23a9e4] tracking-widest mb-0.5 italic">Nutriënten Focus</p><p className="text-xs font-bold opacity-90 leading-tight">{r.micros_info}</p></div></div>}
            <h3 className="font-black uppercase text-xs text-gray-400 mb-4 px-2">Ingrediënten</h3>
            <div className="space-y-2 mb-10">{r?.ingredienten?.map((ing, i) => <div key={i} className="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-600"><span>{ing.item}</span><span className="text-[#23a9e4]">{ing.hoeveelheid}{ing.eenheid}</span></div>)}</div>
            <h3 className="font-black uppercase text-xs text-gray-400 mb-4 px-2 text-left">Bereiding</h3>
            <div className="space-y-6 mb-12">{r?.instructies?.map((s, i) => <div key={i} className="flex gap-4 items-start border-l-4 border-blue-50 pl-4 text-left text-gray-700 font-medium"><div className="bg-[#23a9e4] text-white w-7 h-7 rounded-full flex items-center justify-center font-black shrink-0 text-[10px] mt-0.5 shadow-md">{i+1}</div><p className="text-sm leading-relaxed">{s}</p></div>)}</div>
            {r?.tips && r.tips.length > 0 && <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-100 text-amber-900 mt-10 shadow-sm"><h4 className="font-black uppercase text-xs mb-3 flex items-center gap-2">💡 Tips van de Chef:</h4><ul className="space-y-2">{r.tips.map((tip, i) => <li key={i} className="text-sm font-bold leading-relaxed text-left">• {tip}</li>)}</ul></div>}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 font-sans flex justify-center overflow-x-hidden text-gray-900">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        <div className="flex-grow overflow-y-auto pb-32">
          {pagina === 'welkom' && (
            <div className="h-screen flex flex-col items-center justify-center p-12 text-center bg-white text-gray-900">
              <div className="bg-blue-50 w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-inner"><Utensils size={56} className="text-[#23a9e4]" /></div>
              <h1 className="text-5xl font-black text-[#23a9e4] mb-2 tracking-tighter leading-none italic uppercase">KETOVOOR</h1>
              <p className="text-gray-400 font-bold mb-12 uppercase tracking-[0.4em] text-[10px]">Realistisch Gezond</p>
              <button onClick={() => setPagina('onboarding')} className="w-full bg-[#23a9e4] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl active:scale-95 transition-all uppercase">Start plan</button>
              <button onClick={() => {localStorage.clear(); window.location.reload();}} className="mt-20 text-gray-300 text-[10px] font-black uppercase underline decoration-gray-300">Volledige Reset</button>
            </div>
          )}
          {pagina === 'onboarding' && (
            <div className="p-10 pt-24 h-screen flex flex-col bg-white text-center text-gray-900">
              <h2 className="text-4xl font-black mb-10 italic uppercase border-b-8 border-[#23a9e4] inline-block mx-auto">Planning</h2>
              {[1, 2, 3].map(n => (<button key={n} onClick={() => genereerPlan({...profiel, aantalMaaltijden: n})} className="w-full p-8 rounded-[2.5rem] mb-4 text-center font-bold text-2xl border-2 border-gray-100 bg-gray-50 active:bg-blue-50 shadow-sm">{n} {n === 1 ? 'Maaltijd' : 'Maaltijden'}</button>))}
            </div>
          )}
          {pagina === 'dashboard' && (
            <div className="p-6 text-gray-900">
              <header className="flex justify-between items-center mb-10 px-2">
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter border-b-8 border-[#23a9e4]">Vandaag</h2>
                 <div className="flex gap-2">
                  <button onClick={() => genereerPlan(profiel)} className="bg-[#23a9e4]/10 text-[#23a9e4] px-4 py-2 rounded-full font-black text-[10px] border border-[#23a9e4]/20 active:scale-90 transition-all"><RefreshCw size={14}/> WISSEL</button>
                  <button onClick={() => window.open('/info.html', '_blank')} className="bg-gray-100 text-gray-400 p-2 rounded-full active:scale-90 shadow-sm"><HelpCircle size={24}/></button>
                 </div>
              </header>
              <div onClick={() => setPagina('logboek')} className="bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-2xl mb-10 flex items-center justify-between active:scale-95 transition-all border-b-4 border-[#23a9e4]">
                 <div><p className="text-gray-500 font-black uppercase text-[10px] mb-1 italic">Vasten status</p><p className="text-3xl font-black text-[#23a9e4] tracking-tighter">{verstrekenTijd}</p></div>
                 <div className="bg-white/10 p-5 rounded-full text-[#23a9e4] shadow-inner"><Timer size={36} /></div>
              </div>
              <div className="bg-[#23a9e4] p-10 rounded-[3.5rem] text-white shadow-2xl mb-12 shadow-blue-100 relative overflow-hidden text-center font-bold">
                <h3 className="text-sm font-black uppercase mb-8 opacity-70 text-center tracking-widest italic decoration-white/30 underline">{vandaagNaam} Menu</h3>
                <div className="space-y-4">
                  {weekPlan[vandaagNaam] && Object.entries(weekPlan[vandaagNaam]).map(([type, r]) => r && (
                    <button key={type} onClick={() => setGeselecteerdRecept(r)} className="w-full flex items-center justify-between bg-white/15 p-6 rounded-3xl hover:bg-white/20 border border-white/5 transition-all text-left text-white">
                      <div><p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">{type}</p><p className="text-xl leading-tight">{r.titel}</p></div>
                      <ChevronRight size={24} className="opacity-40 shrink-0"/>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 px-1 text-gray-900">
                <button onClick={() => setPagina('logboek')} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center active:scale-95 transition-all text-center">
                    <Droplets className="text-[#23a9e4] mb-3" size={36}/><p className="text-3xl font-black leading-none mb-1">{waterStatus}</p><p className="text-[10px] uppercase font-black text-gray-400">Glazen</p>
                </button>
                <button onClick={() => setPagina('logboek')} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center active:scale-95 transition-all text-center">
                    <Scale className="text-[#23a9e4] mb-3" size={36}/><p className="text-3xl font-black leading-none mb-1">{gewichtLog[0]?.kg || '--'}</p><p className="text-[10px] uppercase font-black text-gray-400">Kg</p>
                </button>
              </div>
            </div>
          )}
          {pagina === 'planner' && <div className="p-8 pb-32 overflow-y-auto h-full bg-white flex flex-col h-full text-gray-900"><PaginaHeader titel="Weekplan" /><div className="space-y-10 px-2">{dagenLijst.map((dag) => (<div key={dag} className={`border-l-8 pl-6 ${dag === vandaagNaam ? 'border-[#23a9e4]' : 'border-gray-100'}`}><h3 className={`font-black uppercase italic mb-4 text-2xl ${dag === vandaagNaam ? 'text-[#23a9e4]' : 'text-gray-300'}`}>{dag}</h3><div className="space-y-3">{weekPlan[dag] && Object.entries(weekPlan[dag]).map(([type, r]) => r && (<div key={type} onClick={() => setGeselecteerdRecept(r)} className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl text-lg font-bold shadow-sm active:bg-blue-50 transition-all text-left text-gray-800"><span className="text-gray-400 uppercase text-[10px] w-14 font-black shrink-0">{type}</span><span className="flex-grow truncate px-4 font-bold">{r?.titel}</span><ChevronRight size={20} className="text-gray-200 shrink-0"/></div>))}</div></div>))}</div></div>}
          {pagina === 'logboek' && (
            <div className="p-6 pb-32 flex flex-col h-full overflow-y-auto bg-white text-gray-900 text-center">
              <PaginaHeader titel="Logboek" />
              <div className="bg-gray-900 p-8 rounded-[3rem] text-white mb-10 border-b-8 border-[#23a9e4] shadow-2xl text-center">
                  <p className="text-5xl font-black text-[#23a9e4] mb-2">{verstrekenTijd}</p>
                  <p className="text-gray-500 font-bold uppercase text-[10px] mb-8 tracking-widest italic text-center">Tijd gevast</p>
                  {!vastenStartTijd ? <button onClick={() => {setVastenStartTijd(new Date().toISOString());}} className="w-full bg-[#23a9e4] py-5 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all text-xs">Start Vasten</button> : <button onClick={() => setVastenStartTijd(null)} className="w-full bg-red-500 py-5 rounded-2xl font-black uppercase shadow-xl active:scale-95 transition-all text-xs">Stop Vasten</button>}
                  <div className="mt-8 flex gap-3 text-white-500 text-[11px] italic bg-white/5 p-4 rounded-xl border border-white/5 text-left"><Info size={14} className="text-[#23a9e4] shrink-0"/><p>Water, zwarte koffie en thee mogen tijdens het vasten.</p></div>
              </div>
              <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100 mb-10 text-center shadow-inner">
                  <h3 className="text-sm font-black uppercase italic mb-6 text-gray-500 flex items-center gap-2 justify-center font-bold"><Droplets size={16} className="text-[#23a9e4]"/> Water drinken</h3>
                  <div className="flex justify-center gap-10 items-center text-gray-900">
                      <button onClick={() => { setWaterStatus(Math.max(0, waterStatus - 1)); }} className="bg-white w-14 h-14 rounded-full font-black text-2xl shadow-sm text-[#23a9e4] active:scale-90">-</button>
                      <div className="text-center"><p className="text-4xl font-black text-gray-900">{waterStatus}</p><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest text-gray-900 font-bold">Glazen</p></div>
                      <button onClick={() => { setWaterStatus(waterStatus + 1); }} className="bg-[#23a9e4] w-14 h-14 rounded-full font-black text-2xl shadow-xl text-white active:scale-90">+</button>
                  </div>
               </div>
               <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 flex-grow shadow-inner">
                <h3 className="text-sm font-black uppercase italic mb-6 text-gray-400 flex items-center gap-2 justify-center text-gray-900 font-bold text-center"><Scale size={20} className="text-[#23a9e4]"/> Lichaamsgewicht</h3>
                <div className="flex w-full gap-3 mb-8 text-gray-900 font-bold text-center">
                    <input type="number" value={nieuwGewicht} onChange={(e) => setNieuwGewicht(e.target.value)} placeholder="00.0" className="bg-white border-4 border-gray-100 rounded-3xl p-5 w-full font-black text-2xl outline-none focus:border-[#23a9e4] transition-all shadow-sm" />
                    <button onClick={() => { if(nieuwGewicht) { const n = [{ datum: new Date().toLocaleDateString('nl-BE'), kg: nieuwGewicht }, ...gewichtLog]; setGewichtLog(n); setNieuwGewicht(""); } }} className="bg-[#23a9e4] text-white p-5 rounded-3xl font-bold shadow-xl shrink-0 active:scale-90"><Plus size={32} /></button>
                </div>
                <div className="space-y-4">{(gewichtLog || []).slice(0, 5).map((log, i) => (<div key={i} className="flex justify-between items-center p-6 bg-white rounded-3xl border border-gray-100 font-bold shadow-sm animate-in slide-in-from-bottom-2 text-gray-900"><span className="text-gray-500 text-sm italic">{log.datum}</span><span className="text-2xl font-black">{log.kg}kg</span></div>))}</div>
              </div>
            </div>
          )}
          {pagina === 'profiel' && (
            <div className="p-10 pb-32 h-full text-center bg-white flex flex-col h-full text-gray-900">
              <PaginaHeader titel="Beheer" />
              <div className="space-y-6">
                <div className="bg-gray-50 p-10 rounded-[3.5rem] border border-gray-100 mb-12 shadow-inner text-gray-900">
                  <div className="flex justify-between mb-4 font-bold text-xl text-gray-700"><span>Doel:</span> <span className="text-[#23a9e4] font-black uppercase italic">{profiel.doel}</span></div>
                  <div className="flex justify-between font-bold text-xl text-gray-700"><span>Ritme:</span> <span className="text-[#23a9e4] font-black uppercase italic">{profiel.aantalMaaltijden} Per / Dag</span></div>
                </div>
                <button onClick={() => setPagina('onboarding')} className="w-full bg-blue-50 text-[#23a9e4] p-8 rounded-[2rem] font-black text-xl active:scale-95 shadow-sm uppercase text-sm mb-4 text-center">Maaltijden aanpassen</button>
                <button onClick={() => { if(window.confirm("Alles wissen?")) { localStorage.clear(); window.location.reload(); } }} className="w-full bg-red-50 text-red-500 p-8 rounded-[2rem] font-black text-xl active:scale-95 uppercase text-sm text-center">Reset app</button>
                <div className="mt-10 bg-gray-100 p-6 rounded-3xl border border-gray-200 shadow-inner">
                   <div className="flex items-center gap-3 mb-4"><div className="bg-[#23a9e4] p-2 rounded-lg text-white"><ShieldCheck size={20}/></div><h3 className="font-black uppercase text-xs tracking-widest text-gray-700 text-left font-bold">Medische Disclaimer</h3></div>
                   <p className="text-gray-900 text-[10px] leading-relaxed mb-4 font-bold italic text-left">De inhoud van de KetoVoor app is uitsluitend bedoeld voor informatieve doeleinden en vormt geen medisch advies. Freddy Sleeuwaert is niet aansprakelijk voor schade voortvloeiend uit het gebruik van deze app.</p>
                   <div className="border-t border-gray-200 pt-4 text-center"><p className="text-[#23a9e4] font-black text-sm uppercase tracking-tighter italic leading-none">Gemaakt door Freddy Sleeuwaert</p><p className="text-gray-400 text-[9px] font-bold mt-2 uppercase">KetoVoor v1.0 © 2026</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-gray-100 flex justify-around p-6 pb-12 shadow-2xl z-40 rounded-t-[3.5rem]">
            <Utensils size={36} onClick={() => {setPagina('dashboard'); setGeselecteerdRecept(null);}} className={pagina === 'dashboard' ? 'text-[#23a9e4]' : 'text-gray-300'} />
            <Calendar size={36} onClick={() => {setPagina('planner'); setGeselecteerdRecept(null);}} className={pagina === 'planner' ? 'text-[#23a9e4]' : 'text-gray-300'} />
            <ClipboardList size={36} onClick={() => {setPagina('logboek'); setGeselecteerdRecept(null);}} className={pagina === 'logboek' ? 'text-[#23a9e4]' : 'text-gray-300'} />
            <User size={36} onClick={() => {setPagina('profiel'); setGeselecteerdRecept(null);}} className={pagina === 'profiel' ? 'text-[#23a9e4]' : 'text-gray-300'} />
        </nav>
      </div>
    </div>
  );
}

export default App;