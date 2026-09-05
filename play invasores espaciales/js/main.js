
window.SF = window.SF || {};
(async function(){
  SF.Storage.migrateLegacy();
  const status=document.getElementById('assetStatus');
  await SF.Assets.loadAll((done,total)=>{
    if(status)status.textContent=`Cargando assets ${done}/${total}...`;
  });
  if(status)status.textContent=`Sistemas listos · ${Object.keys(SF.Assets.images).length} assets · v${SF.Config.version}`;
  const canvas=document.getElementById('game');
  const input=new SF.Input(canvas);
  const game=new SF.Game(canvas,input);
  const ui=new SF.UI(game);
  window.starfall={game,ui,input,assets:SF.Assets};
  game.boot();

  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
})();
