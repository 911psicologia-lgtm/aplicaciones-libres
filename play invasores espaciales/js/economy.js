window.SF = window.SF || {};
(function(NS){
  const C=NS.config;
  const S=()=>NS.storage;
  const defaults=()=>({
    xp:0,coins:120,level:1,totalKills:0,bossKills:0,subbossKills:0,bestStreak:0,
    totalEarnedCoins:120,purchases:0,
    inventory:{heal:0,shield:0,missile:0,chain:0,overdrive:0,drone:0,emp:0,life:0},
    upgrades:{hull:0,magnet:0,power:0,weapon:0},bossPowers:{},bossesDefeated:{}
  });
  function xpForNext(level){ const l=Math.max(1,level|0); return Math.round(120 + (l-1)*72 + Math.pow(l-1,1.28)*28); }
  function normalize(raw){
    const d=defaults(), p={...d,...(raw||{})};
    p.inventory={...d.inventory,...(raw?.inventory||{})}; p.upgrades={...d.upgrades,...(raw?.upgrades||{})};
    p.bossPowers={...(raw?.bossPowers||{})}; p.bossesDefeated={...(raw?.bossesDefeated||{})};
    p.xp=Math.max(0,Number(p.xp)||0); p.coins=Math.max(0,Math.floor(Number(p.coins)||0));
    p.level=Math.max(1,Number(p.level)||1);
    let rem=p.xp, lvl=1, need=xpForNext(1);
    while(rem>=need && lvl<99){ rem-=need; lvl++; need=xpForNext(lvl); }
    p.level=lvl; return p;
  }
  let P=normalize(S().loadProfile());
  function save(){ S().saveProfile(P); return P; }
  function add(xp=0,coins=0){
    const before=P.level; P.xp+=Math.max(0,Math.round(xp)); P.coins+=Math.max(0,Math.round(coins)); P.totalEarnedCoins+=Math.max(0,Math.round(coins));
    P=normalize(P); save(); return {level:P.level,leveled:P.level>before,xp,coins};
  }
  function rewardKill(meta={}){
    const role=meta.role||'formation', sector=Math.max(1,meta.sector||1), elite=!!meta.elite;
    let xp=2, coins=1;
    if(elite){xp=10+sector*2;coins=6+sector;}
    else if(role==='guardian'){xp=15+sector*2;coins=8+sector;}
    else if(role==='miniboss'){xp=45+sector*8;coins=24+sector*4;P.subbossKills++;}
    else if(role==='boss'){xp=120+sector*35;coins=75+sector*20;P.bossKills++;}
    P.totalKills++; const r=add(xp,coins); return {...r,label:role==='boss'?'JEFE':role==='miniboss'?'SUBJEFE':elite?'ÉLITE':''};
  }
  function rewardStreak(combo){
    P.bestStreak=Math.max(P.bestStreak,combo||0); const cfg=C.economy?.streaks?.[combo];
    if(!cfg){save();return null;} const r=add(cfg.xp,cfg.coins); return {...r,label:cfg.label};
  }
  function rewardWave(sector,perfect,combo){ return add(18+sector*5+(perfect?10:0)+(combo>=10?8:0),8+sector*3+(perfect?6:0)); }
  function rewardSector(sector,perfect){ return add(48+sector*18+(perfect?22:0),28+sector*12+(perfect?12:0)); }
  function grantBossPowers(kinds,sector){
    const granted=[]; P.bossesDefeated[String(sector)]=true;
    for(const kind of [...new Set(kinds||[])]){
      P.bossPowers[kind]=Math.max(Number(P.bossPowers[kind])||0,sector||1);
      P.inventory[kind]=(P.inventory[kind]||0)+1; granted.push(kind);
    }
    save(); return granted;
  }
  function bossPowerPool(){ return Object.keys(P.bossPowers).filter(k=>C.powers[k]); }
  function upgradeLevel(key){ return Math.max(0,Number(P.upgrades[key])||0); }
  function inventoryCount(kind){ return Math.max(0,Number(P.inventory[kind])||0); }
  function priceOf(item){ return item.type==='upgrade' ? item.cost + upgradeLevel(item.upgrade)*(item.step||0) : item.cost; }
  function catalog(){ return (C.economy?.catalog||[]).map(item=>{
    const levelOk=P.level>=item.level, maxed=item.type==='upgrade' && upgradeLevel(item.upgrade)>=item.max;
    const price=priceOf(item), affordable=levelOk&&!maxed&&P.coins>=price;
    return {...item,price,levelOk,maxed,affordable,owned:item.type==='consumable'?inventoryCount(item.kind):upgradeLevel(item.upgrade)};
  }); }
  function buy(id){
    const item=(C.economy?.catalog||[]).find(x=>x.id===id); if(!item) return {ok:false,reason:'NO EXISTE'};
    const price=priceOf(item); if(P.level<item.level) return {ok:false,reason:`NIVEL ${item.level}`};
    if(item.type==='upgrade' && upgradeLevel(item.upgrade)>=item.max) return {ok:false,reason:'MÁXIMO'};
    if(P.coins<price) return {ok:false,reason:'MONEDAS INSUFICIENTES'};
    P.coins-=price; P.purchases++;
    if(item.type==='upgrade') P.upgrades[item.upgrade]=upgradeLevel(item.upgrade)+1;
    else P.inventory[item.kind]=inventoryCount(item.kind)+1;
    save(); return {ok:true,item:{...item,price},profile:state()};
  }
  function consume(kind){ if(inventoryCount(kind)<=0) return false; P.inventory[kind]--; save(); return true; }
  function state(){
    P=normalize(P); const spent=P.xp; let rem=spent; for(let l=1;l<P.level;l++) rem-=xpForNext(l);
    const need=xpForNext(P.level); return JSON.parse(JSON.stringify({...P,xpIntoLevel:Math.max(0,rem),xpToNext:need}));
  }
  NS.economy={state,catalog,buy,consume,add,rewardKill,rewardStreak,rewardWave,rewardSector,grantBossPowers,bossPowerPool,upgradeLevel,inventoryCount,xpForNext};
})(window.SF);
