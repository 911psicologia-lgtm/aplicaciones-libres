
import { downloadBlob } from './utils.js';
import { exportImagesDocx } from './docx-native.js';

const TEMPLATE_URL='./docs/plantillas/Plantilla_KBIT_respuestas_base.webp';
const W=1241,H=1754;
let templatePromise=null;
function loadTemplate(){
  if(templatePromise) return templatePromise;
  templatePromise=new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('No se pudo cargar la plantilla digitalizada.'));im.src=TEMPLATE_URL;});
  return templatePromise;
}
function fmtDate(iso=''){if(!iso)return '';const m=String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:iso;}
function fitText(ctx,text,x,y,maxWidth,font='16px Arial',align='left'){
  ctx.save();ctx.font=font;ctx.fillStyle='#173b56';ctx.textAlign=align;ctx.textBaseline='middle';let s=String(text||'');if(ctx.measureText(s).width>maxWidth){while(s.length>3 && ctx.measureText(s+'…').width>maxWidth)s=s.slice(0,-1);s+='…';}ctx.fillText(s,x,y);ctx.restore();
}
function circleMark(ctx,x,y,score){
  if(!(score===0||score===1||score==='CREDIT'))return;
  const target=score===0?x.zero:x.one;
  ctx.save();ctx.strokeStyle='#173b56';ctx.lineWidth=2.3;ctx.beginPath();ctx.ellipse(target,y,10,8,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
const VE_Y=[338,359,381,402,424,484,505,527,548,570,630,651,673,694,716,776,797,819,840,862,922,943,965,986,1008,1068,1089,1111,1132,1154,1214,1235,1257,1278,1300,1340,1362,1383,1405,1427,1467,1488,1510,1531,1553];
const DEF_Y=[408,429,451,472,494,540,560,581,603,624,646,666,686,708,729,751,773,792,813,834,856,878,899,920,939,961,983,1004,1026,1046,1066,1088,1109,1131,1152,1171,1193];
const MAT_Y=[1602,1624,1646,1667,259,280,302,323,345,430,452,473,495,517,576,598,619,641,663,703,724,746,768,789,829,851,873,894,916,956,978,999,1021,1042,1083,1104,1126,1147,1169,1209,1231,1252,1274,1295,1336,1357,1379,1400];
const SCORE_X={ve:{one:322,zero:358},def:{one:720,zero:758},matFirst:{one:720,zero:758},mat:{one:1119,zero:1158}};

function drawScores(ctx,items,ys,xs,start=0,end=items.length){for(let i=start;i<Math.min(end,items.length,ys.length);i++)circleMark(ctx,xs,ys[i],items[i]?.score);}
function drawCentered(ctx,value,x,y,font='bold 17px Arial',color='#173b56'){ctx.save();ctx.font=font;ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(value??''),x,y);ctx.restore();}
export async function renderAnswerSheetCanvas(caseData,result){
  const bg=await loadTemplate();const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');ctx.drawImage(bg,0,0,W,H);
  fitText(ctx,caseData.patient?.fullName||'',135,136,640,'16px Arial');
  fitText(ctx,fmtDate(caseData.evaluation?.applicationDate||''),925,136,230,'16px Arial');
  fitText(ctx,fmtDate(caseData.patient?.birthDate||''),230,182,265,'16px Arial');
  fitText(ctx,caseData.patient?.institution||caseData.patient?.education||'',585,182,565,'16px Arial');
  const it=caseData.application?.items||{};drawScores(ctx,it.vocabExpresivo||[],VE_Y,SCORE_X.ve);drawScores(ctx,it.definiciones||[],DEF_Y,SCORE_X.def);drawScores(ctx,it.matrices||[],MAT_Y,SCORE_X.matFirst,0,4);drawScores(ctx,it.matrices||[],MAT_Y,SCORE_X.mat,4,48);
  drawCentered(ctx,result?.raw?.exp??'',340,1620);drawCentered(ctx,result?.definitionsActive?result?.raw?.def:'—',738,1401);drawCentered(ctx,result?.raw?.matrices??'',1135,1432);
  // Tabla inferior: puntuación directa/suma y puntuación típica/CI.
  drawCentered(ctx,result?.raw?.vocab??'',1055,1585,'bold 15px Arial');drawCentered(ctx,result?.verbal?.pt??'',1130,1585,'bold 15px Arial');
  drawCentered(ctx,result?.raw?.matrices??'',1055,1619,'bold 15px Arial');drawCentered(ctx,result?.nonverbal?.pt??'',1130,1619,'bold 15px Arial');
  drawCentered(ctx,result?.composite?.sum??'',1055,1654,'bold 15px Arial');drawCentered(ctx,result?.composite?.ci??'',1130,1654,'bold 15px Arial');
  return canvas;
}

function dataUrlToBytes(url){const b64=url.split(',')[1];const bin=atob(b64);const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
function ascii(s){return new TextEncoder().encode(s);}
function concat(parts){const len=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(len);let o=0;for(const p of parts){out.set(p,o);o+=p.length;}return out;}
function makeImagesPdf(images){
  const pageW=595.28,pageH=841.89,n=images.length,objs=[];const pageIds=[],imgIds=[],contentIds=[];let next=3;for(let i=0;i<n;i++){pageIds.push(next++);imgIds.push(next++);contentIds.push(next++);}objs[0]=ascii('<< /Type /Catalog /Pages 2 0 R >>');objs[1]=ascii(`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${n} >>`);for(let i=0;i<n;i++){const im=images[i],pId=pageIds[i],imId=imgIds[i],cId=contentIds[i];objs[pId-1]=ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${i} ${imId} 0 R >> >> /Contents ${cId} 0 R >>`);objs[imId-1]=concat([ascii(`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.length} >>\nstream\n`),im,ascii('\nendstream')]);const content=`q ${pageW} 0 0 ${pageH} 0 0 cm /Im${i} Do Q`;objs[cId-1]=ascii(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);}const head=ascii('%PDF-1.4\n%KBIT\n'),parts=[head],offsets=[0];let off=head.length;for(let i=0;i<objs.length;i++){const o=objs[i],pre=ascii(`${i+1} 0 obj\n`),post=ascii('\nendobj\n');offsets.push(off);parts.push(pre,o,post);off+=pre.length+o.length+post.length;}const xrefOff=off;let xref=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;for(let i=1;i<=objs.length;i++)xref+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';xref+=`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xrefOff}\n%%EOF`;parts.push(ascii(xref));return concat(parts);
}
function shortText(v,n=24){const s=String(v??'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s;}
function drawDetailColumn(ctx,title,items,x,y,w,maxRows=48){ctx.fillStyle='#111';ctx.font='700 20px Arial';ctx.fillText(title,x,y);y+=28;ctx.font='700 13px Arial';ctx.fillStyle='#5e6966';ctx.fillText('Ítem   Respuesta registrada                      1/0   s',x,y);y+=20;ctx.strokeStyle='#cbd1c7';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();y+=16;ctx.font='13px Arial';ctx.fillStyle='#1f2b29';for(const it of items.slice(0,maxRows)){const score=it.score==='CREDIT'?'C':(it.score===0||it.score===1?String(it.score):'—');const sec=it.responseSeconds??'';ctx.fillText(String(it.item).padStart(2,' '),x,y);ctx.fillText(shortText(it.response||'',28),x+38,y);ctx.textAlign='center';ctx.fillText(score,x+w-55,y);ctx.fillText(String(sec),x+w-18,y);ctx.textAlign='left';y+=27;}return y;}
export function renderAnswerDetailCanvas(caseData,result){const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.fillStyle='#1f2b29';ctx.font='700 34px Arial';ctx.fillText('K-BIT - Anexo de respuestas registradas',60,72);ctx.font='15px Arial';ctx.fillStyle='#5e6966';ctx.fillText(`${caseData.patient?.fullName||''} · ${fmtDate(caseData.evaluation?.applicationDate||'')} · Documento complementario de la hoja de anotación`,60,104);ctx.strokeStyle='#2f6459';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(60,124);ctx.lineTo(W-60,124);ctx.stroke();const cols=[{key:'vocabExpresivo',title:'VOCABULARIO EXPRESIVO',x:55},{key:'definiciones',title:'DEFINICIONES',x:455},{key:'matrices',title:'MATRICES',x:855}];for(const col of cols){if(col.key==='definiciones'&&!result.definitionsActive){ctx.font='700 20px Arial';ctx.fillStyle='#111';ctx.fillText(col.title,col.x,170);ctx.font='14px Arial';ctx.fillStyle='#5e6966';ctx.fillText('No administrada por edad.',col.x,205);continue;}drawDetailColumn(ctx,col.title,caseData.application?.items?.[col.key]||[],col.x,170,330);}ctx.fillStyle='#5e6966';ctx.font='13px Arial';ctx.fillText('C = crédito previo por suficiencia del bloque inicial. — = no administrado / sin respuesta literal. La hoja principal conserva el formato original 1/0.',60,H-58);return c;}
export async function answerSheetDataUrl(caseData,result,quality=.92){const canvas=await renderAnswerSheetCanvas(caseData,result);return canvas.toDataURL('image/jpeg',quality);}
export async function exportAnswerSheetPdf(filename,caseData,result){const a=await renderAnswerSheetCanvas(caseData,result),b=renderAnswerDetailCanvas(caseData,result);const pdf=makeImagesPdf([dataUrlToBytes(a.toDataURL('image/jpeg',.92)),dataUrlToBytes(b.toDataURL('image/jpeg',.9))]);downloadBlob(filename,pdf,'application/pdf');}
export async function exportAnswerSheetDocx(filename,caseData,result){const a=await answerSheetDataUrl(caseData,result,.92),b=renderAnswerDetailCanvas(caseData,result).toDataURL('image/jpeg',.9);exportImagesDocx(filename,[a,b]);}
export async function answerSheetHtmlImage(caseData,result){const a=await answerSheetDataUrl(caseData,result,.9),b=renderAnswerDetailCanvas(caseData,result).toDataURL('image/jpeg',.88);return `<div class="answer-sheet-page" style="page-break-before:always;text-align:center"><img src="${a}" alt="Hoja de anotación K-BIT cumplimentada" data-docx-width="620" data-docx-height="876" style="width:100%;max-width:794px;height:auto"></div><div class="answer-sheet-page" style="page-break-before:always;text-align:center"><img src="${b}" alt="Anexo de respuestas registradas K-BIT" data-docx-width="620" data-docx-height="876" style="width:100%;max-width:794px;height:auto"></div>`;}
