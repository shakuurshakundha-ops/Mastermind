(function(){
  const $ = id => document.getElementById(id);
  const STORAGE='clean_tracker';
  const GOAL=82;

  const nowEl=$('now'), greeting=$('greeting');
  const daysEl=$('days'), hoursEl=$('hours'), minutesEl=$('minutes'), secondsEl=$('seconds');
  const yearbar=$('yearbar'), elapsedPercent=$('elapsedPercent'), daysPassed=$('daysPassed'), daysRemaining=$('daysRemaining');
  const markClean=$('markClean'), markNotClean=$('markNotClean'), saveToday=$('saveToday');
  const todayType=$('todayType'), noteInput=$('noteInput');
  const cleanCount=$('cleanCount'), notCleanCount=$('notCleanCount'), remaining82=$('remaining82');
  const cleanBar=$('cleanBar'), timeline=$('timeline');
  const historyList=$('historyList'), lastNote=$('lastNote');
  const currentStreak=$('currentStreak'), longestStreak=$('longestStreak'), successRate=$('successRate');

  const todayISO=()=>new Date().toISOString().slice(0,10);
  const load=()=>JSON.parse(localStorage.getItem(STORAGE)||'{"entries":{}}');
  const save=s=>localStorage.setItem(STORAGE,JSON.stringify(s));

  function setGreeting(){
    const h=new Date().getHours();
    greeting.textContent=h<12?'Good morning':h<18?'Good afternoon':'Good evening';
    nowEl.textContent=new Date().toLocaleString();
  }

  function updateClock(){
    const now=new Date(), start=new Date(now.getFullYear(),0,1), end=new Date(now.getFullYear(),11,31,23,59,59,999);
    const total=end-start, passed=now-start, remain=end-now;
    const pct=Math.round((passed/total)*100);
    daysEl.textContent=Math.floor(remain/86400000);
    hoursEl.textContent=String(Math.floor(remain%(86400000)/3600000)).padStart(2,'0');
    minutesEl.textContent=String(Math.floor(remain%(3600000)/60000)).padStart(2,'0');
    secondsEl.textContent=String(Math.floor(remain%(60000)/1000)).padStart(2,'0');
    yearbar.style.width=pct+'%';
    elapsedPercent.textContent=pct+'%';
    daysPassed.textContent=Math.floor(passed/86400000);
    daysRemaining.textContent=Math.floor(remain/86400000);
  }

  function refresh(){
    const data=load(), entries=data.entries||{};
    const keys=Object.keys(entries).sort();
    const clean=keys.filter(k=>entries[k].type==='clean').length;
    const not=keys.filter(k=>entries[k].type==='not').length;
    cleanCount.textContent=clean; notCleanCount.textContent=not;
    remaining82.textContent=Math.max(0,GOAL-clean);
    cleanBar.style.width=Math.min(100,(clean/GOAL)*100)+'%';
    successRate.textContent=keys.length?Math.round((clean/keys.length)*100)+'%':'0%';

    timeline.innerHTML='';
    for(let i=GOAL-1;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      const iso=d.toISOString().slice(0,10);
      const e=entries[iso];
      const dot=document.createElement('div');
      dot.className='dot '+(e?(e.type==='clean'?'clean':'not'):'empty');
      timeline.appendChild(dot);
    }

    historyList.innerHTML=keys.length?'':'<div class="muted">(No entries yet)</div>';
    keys.sort((a,b)=>b.localeCompare(a)).forEach(date=>{
      const e=entries[date];
      const div=document.createElement('div');
      div.className='entry';
      div.innerHTML=`<div><b>${date}</b> <span style="color:${e.type==='clean'?'var(--good)':'var(--bad)'}">${e.type}</span></div><div class="note">${e.note||'(no note)'}</div>`;
      historyList.appendChild(div);
    });
  }

  function addEntry(date,type,note){
    const s=load(); s.entries=s.entries||{}; s.entries[date]={type,note:note||''}; save(s); refresh();
  }

  markClean.onclick=()=>addEntry(todayISO(),'clean','');
  markNotClean.onclick=()=>{const reason=prompt('Reason (optional):');addEntry(todayISO(),'not',reason||'');};
  saveToday.onclick=()=>{addEntry(todayISO(),todayType.value,noteInput.value);noteInput.value='';};
  $('clearAll').onclick=()=>{if(confirm('Clear all data?'))localStorage.removeItem(STORAGE),refresh();};

  setGreeting(); updateClock(); refresh();
  setInterval(updateClock,1000);
})();
