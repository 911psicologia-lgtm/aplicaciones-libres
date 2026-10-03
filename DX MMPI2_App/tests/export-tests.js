const fs=require('fs'); const vm=require('vm'); const assert=require('assert');
const context={console, window:{Storage:{sanitizeSignatureDataURL:()=>''}}, Blob, URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}}, document:{}, setTimeout, Uint8Array, atob};
vm.createContext(context); vm.runInContext(fs.readFileSync('js/lib/export.js','utf8'),context);
const E=context.window.Export;
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const block={tipo:'grafico',figura:1,titulo:'Perfil',series:[{nombre:'Actual',puntos:[{x:'Hs',y:68},{x:'D',y:58}]}],eje_y:{variable:'T',min:30,max:90}};
E._aiExportChartImages=[{dataURL:png}]; E._aiExportChartCursor=0;
const html=E._aiGraficoHTML(block);
assert(html.includes('<img src="data:image/png;base64,'));
assert(html.includes('Tabla de datos accesible'));
console.log('PASS AI HTML embeds PNG and keeps accessible table');

class X{constructor(o){Object.assign(this,o)}}
const docx={Paragraph:X,TextRun:X,Table:X,TableRow:X,TableCell:X,WidthType:{DXA:'DXA'},AlignmentType:{CENTER:'CENTER',JUSTIFIED:'JUSTIFIED'},ImageRun:class ImageRun extends X{},BorderStyle:{}};
(async()=>{
 E._aiWordChartImages=[{dataURL:png}]; E._aiWordChartCursor=0;
 const children=[]; await E._aiBlockToDocx(children,block,docx);
 const hasImage=children.some(p=>Array.isArray(p.children)&&p.children.some(x=>x.constructor.name==='ImageRun'));
 assert(hasImage);
 console.log('PASS AI Word block embeds ImageRun and table fallback');
})().catch(e=>{console.error('FAIL',e);process.exit(1)});
