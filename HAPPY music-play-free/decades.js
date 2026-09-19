// ════════════════════════════════════════════════════════════════
// MP_DECADES · R10.25
// Clasificación automática por década. No falsificar el año.
// ════════════════════════════════════════════════════════════════
(() => {
'use strict';
const STORE_KEY='mp-decades-cache-v1';
const DECADES=['50s','60s','70s','80s','90s','2000s','2010s','2020s'];
const UNIDENTIFIED='unknown';
let cache={};
let scanInProgress=false;
function loadCache(){try{cache=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');}catch{cache={};}}
function saveCache(){try{localStorage.setItem(STORE_KEY,JSON.stringify(cache));}catch{}}
function yearToDecade(year){if(!year||!Number.isFinite(year))return UNIDENTIFIED;const y=Math.floor(year);if(y<1960)return'50s';if(y<1970)return'60s';if(y<1980)return'70s';if(y<1990)return'80s';if(y<2000)return'90s';if(y<2010)return'2000s';if(y<2020)return'2010s';return'2020s';}
function decadeLabel(d){return d===UNIDENTIFIED?'Sin identificar':d;}
function parseYearFromString(s){if(!s)return null;const str=String(s).trim();const m1=str.match(/^(\d{4})[-/]/);if(m1)return parseInt(m1[1],10);if(/^\d{4}$/.test(str))return parseInt(str,10);const m2=str.match(/\b(19[5-9]\d|20[0-2]\d)\b/);if(m2)return parseInt(m2[1],10);return null;}
function detectFromLocalMetadata(track){const c=[track.year,track.date,track.releaseDate,track.tdrc,track.tdor,track.originalDate,track.recordingDate];for(const v of c){const y=parseYearFromString(v);if(y)return{year:y,source:'ID3',confidence:'HIGH'};}return null;}
function detectFromYouTubeMetadata(track){const h=[track.title,track.artist,track.album].filter(Boolean).join(' ');const m=h.match(/\b(19[5-9]\d|20[0-2]\d)\b/);if(m){return{year:parseInt(m[1],10),source:'YOUTUBE_METADATA',confidence:'MEDIUM'};}return null;}
function inferFromText(track){const h=[track.title,track.artist,track.album].filter(Boolean).join(' ');if(!h)return null;const m=h.match(/\b(19[5-9]\d|20[0-2]\d)\b/);if(m)return{year:parseInt(m[1],10),source:'INFERRED',confidence:'LOW'};return null;}
function scanTrack(track){if(!track)return null;const cached=cache[track.id];if(cached&&cached.source==='MANUAL')return cached;let result=null;if(track.sourceKind==='local'||track.sourceKind==='direct')result=detectFromLocalMetadata(track);if(!result&&(track.sourceKind==='youtube'||track.sourceKind==='youtube-playlist'))result=detectFromYouTubeMetadata(track);if(!result)result=inferFromText(track);if(!result)result={year:null,source:'UNKNOWN',confidence:'LOW'};const entry={year:result.year,decade:result.year?yearToDecade(result.year):UNIDENTIFIED,source:result.source,confidence:result.confidence,scannedAt:Date.now()};if(cached&&cached.source==='MANUAL')return cached;cache[track.id]=entry;return entry;}
function startIncrementalScan(){const mp=window.MP;if(!mp?.state?.tracks)return;if(scanInProgress)return;scanInProgress=true;const toScan=mp.state.tracks.filter(t=>{const c=cache[t.id];if(!c)return true;if(c.source==='UNKNOWN')return true;if(c.scannedAt&&(Date.now()-c.scannedAt)>7*24*60*60*1000)return true;return false;});if(!toScan.length){scanInProgress=false;return;}let idx=0;function processBatch(){const batch=toScan.slice(idx,idx+5);if(!batch.length){scanInProgress=false;saveCache();try{window.dispatchEvent(new CustomEvent('mp:decades-updated'));}catch{}return;}for(const t of batch)scanTrack(t);idx+=5;saveCache();setTimeout(processBatch,50);}processBatch();}
function getTrackDecade(trackId){return cache[trackId]||null;}
function getDecadeCounts(){const counts={};for(const d of DECADES)counts[d]=0;counts[UNIDENTIFIED]=0;const mp=window.MP;if(!mp?.state?.tracks)return counts;for(const t of mp.state.tracks){const c=cache[t.id];if(c&&c.decade)counts[c.decade]=(counts[c.decade]||0)+1;else counts[UNIDENTIFIED]++;}return counts;}
function getTracksByDecade(decade){const mp=window.MP;if(!mp?.state?.tracks)return[];return mp.state.tracks.filter(t=>{const c=cache[t.id];return c&&c.decade===decade;});}
function getActiveDecades(){const counts=getDecadeCounts();const active=DECADES.filter(d=>counts[d]>0);if(counts[UNIDENTIFIED]>0)active.push(UNIDENTIFIED);return active;}
function setManualYear(trackId,year){const y=parseInt(year,10);if(!Number.isFinite(y))return false;cache[trackId]={year:y,decade:yearToDecade(y),source:'MANUAL',confidence:'HIGH',scannedAt:Date.now(),manualAt:Date.now()};saveCache();try{window.dispatchEvent(new CustomEvent('mp:decades-updated'));}catch{}return true;}
function clearManualYear(trackId){if(cache[trackId]&&cache[trackId].source==='MANUAL'){delete cache[trackId];saveCache();try{window.dispatchEvent(new CustomEvent('mp:decades-updated'));}catch{}return true;}return false;}
async function playDecadeJourney(decade){const mp=window.MP;if(!mp?.state)return;const tracks=getTracksByDecade(decade).filter(t=>['local','direct','youtube','youtube-playlist'].includes(t.sourceKind));if(!tracks.length)return;const shuffled=[...tracks].sort(()=>Math.random()-0.5);const ids=shuffled.map(t=>t.id);await mp.playTrack(ids[0],ids);}
function init(){loadCache();setTimeout(()=>startIncrementalScan(),3000);}
window.MP_DECADES=Object.freeze({DECADES,UNIDENTIFIED,init,startIncrementalScan,getTrackDecade,getDecadeCounts,getTracksByDecade,getActiveDecades,setManualYear,clearManualYear,playDecadeJourney,yearToDecade,decadeLabel,isScanning:()=>scanInProgress});
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{const t=()=>{if(window.MP?.state)init();else setTimeout(t,200);};t();});}else{const t=()=>{if(window.MP?.state)init();else setTimeout(t,200);};t();}
})();
