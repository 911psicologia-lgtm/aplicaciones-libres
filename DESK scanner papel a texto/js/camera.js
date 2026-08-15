export function imageFileToCompressedDataUrl(file, maxWidth=1400, quality=.74){
  return new Promise((resolve,reject)=>{
    if(!file || !file.type.startsWith('image/')){ reject(new Error('Archivo no válido.')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img,0,0,width,height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({dataUrl,width,height,originalName:file.name,size:file.size,compressedBytes:Math.round(dataUrl.length * .75)});
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('No se pudo cargar el archivo.'));
    reader.readAsDataURL(file);
  });
}
