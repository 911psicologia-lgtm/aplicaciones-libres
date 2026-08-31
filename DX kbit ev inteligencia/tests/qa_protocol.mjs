import fs from 'node:fs';
import assert from 'node:assert/strict';
import { calculateChronologicalAge } from '../assets/js/utils.js';
import { getStartPlan, prepareSubtest, advanceProtocol, administrationSummary, ensureProtocol } from '../assets/js/administration.js';

const rules=JSON.parse(fs.readFileSync(new URL('../data/application-rules.json', import.meta.url),'utf8'));
const counts={vocabExpresivo:45,definiciones:37,matrices:48};
function mkItems(n){return Array.from({length:n},(_,i)=>({item:i+1,score:'',response:'',note:'',firstScore:null,firstResponse:'',responseSeconds:null,timerStart:null,timedOut:false,reapplications:[]}));}
function mkCase(){return {application:{activeSubtest:'vocabExpresivo',activeIndex:0,items:{vocabExpresivo:mkItems(45),definiciones:mkItems(37),matrices:mkItems(48)},adjustments:{} }};}
function age(y,m=0,d=0){return {years:y,months:m,days:d,totalMonths:y*12+m};}
function fillBlock(c,key,start,end,scores){for(let n=start;n<=end;n++)c.application.items[key][n-1].score=scores[n-start];c.application.activeIndex=end-1;c.application.protocol.subtests[key].currentIndex=end-1;}
function pass(name,fn){try{fn();console.log('PASS',name);}catch(e){console.error('FAIL',name,e.message);throw e;}}

pass('Edad cronológica con préstamo 30 días/12 meses',()=>{
  assert.deepEqual(calculateChronologicalAge('1988-05-30','2020-10-27'),{years:32,months:4,days:27,totalMonths:388,method:'K-BIT: resta con préstamo 30 días/12 meses'});
});
pass('QA-01 Edad 5 VE inicia 1',()=>assert.equal(getStartPlan(rules,'vocabExpresivo',5).startItem,1));
pass('QA-02 Edad 13 VE inicia 31',()=>assert.equal(getStartPlan(rules,'vocabExpresivo',13).startItem,31));
pass('QA-03 Edad 7 Definiciones omitida',()=>assert.equal(getStartPlan(rules,'definiciones',7).omitted,true));
pass('QA-04 Edad 14 Definiciones inicia 1',()=>assert.equal(getStartPlan(rules,'definiciones',14).startItem,1));
pass('QA-05 Edad 15 Definiciones inicia 6',()=>assert.equal(getStartPlan(rules,'definiciones',15).startItem,6));
pass('QA-06 Edad 12 Matrices B correcto inicia 15',()=>assert.equal(getStartPlan(rules,'matrices',12,true).startItem,15));
pass('QA-07 Edad 12 Matrices B incorrecto inicia 10',()=>assert.equal(getStartPlan(rules,'matrices',12,false).startItem,10));
pass('QA-08 Start>1 + 2 aciertos -> continuar y crédito previo',()=>{
  const c=mkCase();ensureProtocol(c,age(10),rules);prepareSubtest(c,'vocabExpresivo',age(10),rules);
  fillBlock(c,'vocabExpresivo',21,25,[1,1,0,0,0]);const d=advanceProtocol(c,'vocabExpresivo',rules);
  assert.equal(d.nextItem,26);assert.equal(c.application.protocol.subtests.vocabExpresivo.creditPrior,20);
  assert.equal(c.application.items.vocabExpresivo.slice(0,20).every(it=>it.score==='CREDIT'),true);
});
pass('QA-09 Start>1 + 1 acierto -> retorno',()=>{
  const c=mkCase();ensureProtocol(c,age(10),rules);prepareSubtest(c,'vocabExpresivo',age(10),rules);
  fillBlock(c,'vocabExpresivo',21,25,[1,0,0,0,0]);const d=advanceProtocol(c,'vocabExpresivo',rules);
  assert.equal(d.returned,true);assert.equal(d.nextItem,1);assert.equal(c.application.protocol.subtests.vocabExpresivo.stage,'return');
});
pass('QA-10 Start>1 + 0 -> retorno; bloque cero en retorno termina',()=>{
  const c=mkCase();ensureProtocol(c,age(10),rules);prepareSubtest(c,'vocabExpresivo',age(10),rules);
  fillBlock(c,'vocabExpresivo',21,25,[0,0,0,0,0]);let d=advanceProtocol(c,'vocabExpresivo',rules);assert.equal(d.returned,true);
  fillBlock(c,'vocabExpresivo',1,5,[0,0,0,0,0]);d=advanceProtocol(c,'vocabExpresivo',rules);assert.equal(d.complete,true);assert.match(d.reason,/retorno/i);
});
pass('QA-11 Start=1 primer bloque todo 0 -> terminación',()=>{
  const c=mkCase();ensureProtocol(c,age(5),rules);prepareSubtest(c,'vocabExpresivo',age(5),rules);
  fillBlock(c,'vocabExpresivo',1,5,[0,0,0,0,0]);const d=advanceProtocol(c,'vocabExpresivo',rules);assert.equal(d.complete,true);
});
pass('QA-12 Definiciones tiene límite 30 s',()=>assert.equal(rules.definiciones.timeLimitSeconds,30));
pass('QA-13 Tras discontinuación, ítems futuros quedan SKIP',()=>{
  const c=mkCase();ensureProtocol(c,age(5),rules);prepareSubtest(c,'vocabExpresivo',age(5),rules);
  fillBlock(c,'vocabExpresivo',1,5,[0,0,0,0,0]);advanceProtocol(c,'vocabExpresivo',rules);
  assert.equal(c.application.items.vocabExpresivo.slice(5).every(it=>it.score==='SKIP'),true);
  assert.equal(administrationSummary(c,'vocabExpresivo').direct,0);
});
pass('QA-14 Retorno termina antes del start -> sin crédito de brecha',()=>{
  const c=mkCase();ensureProtocol(c,age(10),rules);prepareSubtest(c,'vocabExpresivo',age(10),rules);
  fillBlock(c,'vocabExpresivo',21,25,[1,0,0,0,0]);advanceProtocol(c,'vocabExpresivo',rules);
  fillBlock(c,'vocabExpresivo',1,5,[1,0,0,0,0]);let d=advanceProtocol(c,'vocabExpresivo',rules);assert.equal(d.nextItem,6);
  fillBlock(c,'vocabExpresivo',6,10,[0,0,0,0,0]);d=advanceProtocol(c,'vocabExpresivo',rules);assert.equal(d.complete,true);
  const s=administrationSummary(c,'vocabExpresivo');assert.equal(s.creditPrior,0);assert.equal(s.direct,2); // ítem 21 previo + ítem 1
});

console.log('\nTODAS LAS PRUEBAS OBLIGATORIAS PASARON.');
