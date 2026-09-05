
window.SF = window.SF || {};
SF.Storage = (() => {
  const K=()=>SF.Config.storage;
  function parse(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null') ?? fallback;}catch{return fallback;}}
  function saveGame(data){localStorage.setItem(K().save,JSON.stringify(data));}
  function loadGame(){return parse(K().save,null);}
  function deleteGame(){localStorage.removeItem(K().save);}
  function getRank(){return parse(K().rank,[]);}
  function addRank(row){
    const arr=getRank();arr.push(row);
    arr.sort((a,b)=>(b.score||0)-(a.score||0)||(b.wave||0)-(a.wave||0));
    localStorage.setItem(K().rank,JSON.stringify(arr.slice(0,20)));
  }
  function clearRank(){localStorage.removeItem(K().rank);}
  function bestScore(){const r=getRank();return r.length?Math.max(...r.map(x=>x.score||0)):0;}
  function getShip(){
    const raw=localStorage.getItem(K().ship)||'vanguard';
    const best=bestScore();
    const s=SF.Config.ships.find(x=>x.id===raw && best>=x.unlock);
    return s?s.id:'vanguard';
  }
  function setShip(id){localStorage.setItem(K().ship,id);}
  function mapLegacyShip(id){
    if(['interceptor','titan'].includes(id)) return 'warden';
    if(['phantom','nebula','apex'].includes(id)) return 'specter';
    return 'vanguard';
  }
  function migrateLegacy(){
    try{
      if(!localStorage.getItem(K().rank) && localStorage.getItem('xs2_rank')){
        localStorage.setItem(K().rank,localStorage.getItem('xs2_rank'));
      }
      if(!localStorage.getItem(K().save) && localStorage.getItem('xs2_save')){
        const old=parse('xs2_save',null);
        if(old){
          saveGame({
            player:old.player||'PILOTO',wave:old.wave||1,lives:old.lives||5,score:old.score||0,
            shipType:mapLegacyShip(old.shipType),spreadLeft:old.powerLeft||0,
            shieldLeft:old.shieldLeft||0,beamLeft:old.laserLeft||0,missileLeft:0
          });
        }
      }
      if(!localStorage.getItem(K().ship) && localStorage.getItem('xs2_ship')){
        setShip(mapLegacyShip(localStorage.getItem('xs2_ship')));
      }
    }catch(e){console.warn('Legacy migration skipped',e);}
  }
  return {saveGame,loadGame,deleteGame,getRank,addRank,clearRank,bestScore,getShip,setShip,migrateLegacy};
})();
