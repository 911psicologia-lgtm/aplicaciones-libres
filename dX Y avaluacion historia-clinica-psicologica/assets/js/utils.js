/**
 * ============================================
 * HISTORIA CLÍNICA PSICOLÓGICA INTEGRAL
 * Utilidades Compartidas
 * ============================================
 */


function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================
// FECHAS Y EDAD
// ============================================

const DateUtils = {
    formatDate(date, format = 'DD/MM/YYYY') {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year);
    },

    formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        return `${this.formatDate(date)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    },

    calculateAge(birthDate) {
        if (!birthDate) return null;
        
        const birth = new Date(birthDate);
        const today = new Date();
        
        if (isNaN(birth.getTime())) return null;

        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        return { years, months, days };
    },

    formatAge(birthDate, short = false) {
        const age = this.calculateAge(birthDate);
        if (!age) return '';

        if (short) {
            return `${age.years}a ${age.months}m`;
        }

        const parts = [];
        if (age.years > 0) parts.push(`${age.years} año${age.years !== 1 ? 's' : ''}`);
        if (age.months > 0) parts.push(`${age.months} mes${age.months !== 1 ? 'es' : ''}`);
        
        return parts.join(', ') || '0 meses';
    },

    isMinor(birthDate) {
        const age = this.calculateAge(birthDate);
        return age ? age.years < 18 : false;
    },

    getToday() {
        return new Date().toISOString().split('T')[0];
    },

    getNow() {
        return new Date().toISOString();
    }
};

// ============================================
// VALIDACIÓN
// ============================================

const Validation = {
    required(value) {
        return value !== undefined && value !== null && String(value).trim() !== '';
    },

    email(value) {
        if (!value) return true;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    },

    phone(value) {
        if (!value) return true;
        const regex = /^[\d\s\-\+\(\)]{7,20}$/;
        return regex.test(value);
    },

    document(value) {
        if (!value) return true;
        return value.length >= 5;
    }
};

// ============================================
// UTILIDADES DE UI
// ============================================

const UI = {
    toast(message, type = 'info', duration = 3000) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <span>${escapeHTML(message)}</span>
        `;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    hideModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    confirm(message, onConfirm, onCancel) {
        const ok = window.confirm(message);
        if (ok && typeof onConfirm === 'function') return onConfirm();
        if (!ok && typeof onCancel === 'function') return onCancel();
    }
};

// ============================================
// LISTAS DESPLEGABLES
// ============================================

const Dropdowns = {
    gender: [
        { value: '', label: 'Seleccione...' },
        { value: 'masculino', label: 'Masculino' },
        { value: 'femenino', label: 'Femenino' },
        { value: 'intersexual', label: 'Intersexual' },
        { value: 'no_binario', label: 'No binario' },
        { value: 'genero_fluido', label: 'Género fluido' },
        { value: 'agenero', label: 'Agénero' },
        { value: 'prefiere_no_decir', label: 'Prefiere no decir' },
        { value: 'otro', label: 'Otro (especificar)' }
    ],

    maritalStatus: [
        { value: '', label: 'Seleccione...' },
        { value: 'soltero', label: 'Soltero/a' },
        { value: 'casado', label: 'Casado/a' },
        { value: 'union_libre', label: 'Unión libre' },
        { value: 'separado', label: 'Separado/a' },
        { value: 'divorciado', label: 'Divorciado/a' },
        { value: 'viudo', label: 'Viudo/a' },
        { value: 'comprometido', label: 'Comprometido/a' },
        { value: 'relacion_abierta', label: 'Relación abierta' },
        { value: 'otro', label: 'Otro' }
    ],

    education: [
        { value: '', label: 'Seleccione...' },
        { value: 'sin_escolaridad', label: 'Sin escolaridad' },
        { value: 'primaria_incompleta', label: 'Primaria incompleta' },
        { value: 'primaria_completa', label: 'Primaria completa' },
        { value: 'secundaria_incompleta', label: 'Secundaria incompleta' },
        { value: 'secundaria_completa', label: 'Secundaria completa' },
        { value: 'tecnica', label: 'Técnica' },
        { value: 'tecnologica', label: 'Tecnológica' },
        { value: 'universitaria_incompleta', label: 'Universitaria incompleta' },
        { value: 'universitaria_completa', label: 'Universitaria completa' },
        { value: 'especializacion', label: 'Especialización' },
        { value: 'maestria', label: 'Maestría' },
        { value: 'doctorado', label: 'Doctorado' },
        { value: 'posdoctorado', label: 'Posdoctorado' },
        { value: 'otro', label: 'Otro' }
    ],

    sessionModality: [
        { value: '', label: 'Seleccione...' },
        { value: 'presencial', label: 'Presencial' },
        { value: 'virtual', label: 'Virtual' },
        { value: 'telefonica', label: 'Telefónica' },
        { value: 'domiciliaria', label: 'Domiciliaria' }
    ],

    sessionDuration: [
        { value: '', label: 'Seleccione...' },
        { value: '30', label: '30 minutos' },
        { value: '45', label: '45 minutos' },
        { value: '60', label: '60 minutos' },
        { value: '90', label: '90 minutos' },
        { value: '120', label: '120 minutos' }
    ],

    assessmentStatus: [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'aplicado', label: 'Aplicado' },
        { value: 'en_analisis', label: 'En análisis' },
        { value: 'completado', label: 'Completado' }
    ],

    certaintyLevel: [
        { value: '', label: 'Seleccione...' },
        { value: 'bajo', label: 'Bajo' },
        { value: 'medio', label: 'Medio' },
        { value: 'alto', label: 'Alto' }
    ],

    populateSelect(selectId, items, selectedValue = '') {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = items.map(item => 
            `<option value="${item.value}" ${item.value === selectedValue ? 'selected' : ''}>${item.label}</option>`
        ).join('');
    }
};

// ============================================
// EXPORTACIÓN
// ============================================

const ExportUtils = {
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    exportJSON(data, filename) {
        const content = JSON.stringify(data, null, 2);
        this.downloadFile(content, filename, 'application/json');
    },

    exportTXT(content, filename) {
        this.downloadFile(content, filename, 'text/plain');
    },

    exportHTML(content, filename) {
        const fullHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${filename}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c5282; border-bottom: 2px solid #2c5282; padding-bottom: 10px; }
        h2 { color: #4a5568; margin-top: 30px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #718096; }
        .value { margin-left: 10px; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
        this.downloadFile(fullHTML, filename, 'text/html');
    }
};

// Exponer utilidades globalmente
window.DateUtils = DateUtils;
window.Validation = Validation;
window.UI = UI;
window.Dropdowns = Dropdowns;
window.ExportUtils = ExportUtils;
window.escapeHTML = escapeHTML;

// ============================================
// AUTENTICACIÓN (localStorage)
// ============================================

const Auth = {
    key: 'hcp_session',
    ttlMs: 30 * 60 * 1000, // 30 minutos

    getSession() {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw) return null;
            const s = JSON.parse(raw);
            if (!s || !s.lastActivity) return null;
            return s;
        } catch {
            return null;
        }
    },

    isExpired(session) {
        try {
            const last = new Date(session.lastActivity);
            const now = new Date();
            return (now - last) > this.ttlMs;
        } catch {
            return true;
        }
    },

    touch() {
        const s = this.getSession();
        if (!s) return null;
        s.lastActivity = new Date().toISOString();
        localStorage.setItem(this.key, JSON.stringify(s));
        return s;
    },

    requireAuth(redirectTo = 'index.html') {
        const s = this.getSession();
        if (!s || this.isExpired(s)) {
            localStorage.removeItem(this.key);
            window.location.replace(redirectTo);
            return null;
        }
        return this.touch();
    },

    logout(redirectTo = 'index.html') {
        try { localStorage.removeItem(this.key); } catch {}
        window.location.replace(redirectTo);
    },

    async login(username, password) {
        // Requiere db.js cargado
        if (typeof db === 'undefined' || typeof STORES === 'undefined') {
            throw new Error('Base de datos no disponible');
        }
        await db.init();
        const users = await db.getAll(STORES.USERS);
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) return null;
        const session = {
            userId: user.id,
            username: user.username,
            fullName: user.fullName,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };
        localStorage.setItem(this.key, JSON.stringify(session));
        return session;
    }
};

// Alias compatible con páginas existentes
function showToast(message, type = 'info') { UI.toast(message, type); }

window.Auth = Auth;
window.showToast = showToast;


/** ===========================
 * Config & Personalización
 * =========================== */
const HCConfig = {
  key: 'hc_config_v1',
  getAll() {
    try { return JSON.parse(localStorage.getItem(this.key) || '{}'); } catch(e){ return {}; }
  },
  get(path, fallback=null){
    const obj=this.getAll();
    return (obj && Object.prototype.hasOwnProperty.call(obj, path)) ? obj[path] : fallback;
  },
  set(path, value){
    const obj=this.getAll();
    obj[path]=value;
    localStorage.setItem(this.key, JSON.stringify(obj));
    return obj;
  }
};

function isPsychiatryEnabled(){
  const forced = HCConfig.get('psychiatryEnabled', null);
  if (forced !== null) return !!forced;
  const prof = (HCConfig.get('profession','') || '').toLowerCase();
  return prof.includes('psiquiatr');
}

/** ===========================
 * AutoBackup local (sin nube)
 * - guarda snapshots en localStorage por usuario
 * =========================== */
const AutoBackup = {
  lastKeyPrefix: 'hc_autobackup_',
  maxSnapshots: 10,
  async snapshot(reason='auto'){
    try{
      if(!window.db || !db.exportAll) return;
      const sess = Auth.getSession() || { username:'local' };
      const key = this.lastKeyPrefix + (sess.username || 'local');
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      const data = await db.exportAll();
      arr.unshift({ ts: new Date().toISOString(), reason, data });
      while(arr.length > this.maxSnapshots) arr.pop();
      localStorage.setItem(key, JSON.stringify(arr));
    }catch(e){
      console.warn('AutoBackup snapshot failed', e);
    }
  },
  getSnapshots(){
    const sess = Auth.getSession() || { username:'local' };
    const key = this.lastKeyPrefix + (sess.username || 'local');
    try{ return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; }
  }
};

/** ===========================
 * DOCX real (offline) - Zip STORE
 * =========================== */
const DocxExport = (() => {
  function crc32(buf){
    let crc = -1;
    for(let i=0;i<buf.length;i++){
      crc = (crc>>>8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i=0;i<256;i++){
      let c=i;
      for(let k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1);
      t[i]=c>>>0;
    }
    return t;
  })();

  function u16(v){ return new Uint8Array([v & 255, (v>>>8)&255]); }
  function u32(v){ return new Uint8Array([v & 255, (v>>>8)&255, (v>>>16)&255, (v>>>24)&255]); }

  function strToU8(str){
    return new TextEncoder().encode(str);
  }

  function zipStore(files){ // {name:Uint8Array}
    const localParts=[];
    const centralParts=[];
    let offset=0;
    let fileCount=0;

    for(const name of Object.keys(files)){
      const data = files[name];
      const nameBytes = strToU8(name);
      const c = crc32(data);

      // local header
      const lh = [];
      lh.push(u32(0x04034b50));
      lh.push(u16(20)); // version
      lh.push(u16(0));  // flags
      lh.push(u16(0));  // store
      lh.push(u16(0));  // mod time
      lh.push(u16(0));  // mod date
      lh.push(u32(c));
      lh.push(u32(data.length));
      lh.push(u32(data.length));
      lh.push(u16(nameBytes.length));
      lh.push(u16(0)); // extra len
      const lhBytes = concat(lh);
      localParts.push(lhBytes, nameBytes, data);

      // central dir header
      const ch=[];
      ch.push(u32(0x02014b50));
      ch.push(u16(20)); // ver made
      ch.push(u16(20)); // ver needed
      ch.push(u16(0));
      ch.push(u16(0));
      ch.push(u16(0));
      ch.push(u16(0));
      ch.push(u32(c));
      ch.push(u32(data.length));
      ch.push(u32(data.length));
      ch.push(u16(nameBytes.length));
      ch.push(u16(0)); // extra
      ch.push(u16(0)); // comment
      ch.push(u16(0)); // disk
      ch.push(u16(0)); // int attr
      ch.push(u32(0)); // ext attr
      ch.push(u32(offset));
      const chBytes = concat(ch);
      centralParts.push(chBytes, nameBytes);

      offset += lhBytes.length + nameBytes.length + data.length;
      fileCount++;
    }

    const centralSize = centralParts.reduce((a,b)=>a+b.length,0);
    const centralOffset = offset;

    const eocd=[];
    eocd.push(u32(0x06054b50));
    eocd.push(u16(0)); // disk
    eocd.push(u16(0)); // disk start
    eocd.push(u16(fileCount));
    eocd.push(u16(fileCount));
    eocd.push(u32(centralSize));
    eocd.push(u32(centralOffset));
    eocd.push(u16(0)); // comment len
    const eocdBytes=concat(eocd);

    return concat([...localParts, ...centralParts, eocdBytes]);
  }

  function concat(chunks){
    const total = chunks.reduce((s,c)=>s+c.length,0);
    const out = new Uint8Array(total);
    let o=0;
    for(const c of chunks){ out.set(c,o); o+=c.length; }
    return out;
  }

  function escXml(s){
    return (s||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function buildDocXml(title, bodyLines){
    const paras = bodyLines.map(line => `
      <w:p><w:r><w:t xml:space="preserve">${escXml(line)}</w:t></w:r></w:p>
    `).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    <w:p><w:r><w:t>${escXml(title)}</w:t></w:r></w:p>
    ${paras}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
  }

  function buildDocxBytes(title, text){
    const lines = (text||'').split(/\r?\n/);
    const files = {
      '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`),
      '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`),
      'word/document.xml': strToU8(buildDocXml(title, lines)),
      'word/_rels/document.xml.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),
      'word/styles.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="24"/></w:rPr>
  </w:style>
</w:styles>`)
    };
    return zipStore(files);
  }

  return {
    download(title, text, filename){
      const bytes = buildDocxBytes(title, text);
      const blob = new Blob([bytes], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
      const url = URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=filename.endsWith('.docx')?filename:(filename+'.docx');
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=>URL.revokeObjectURL(url), 1000);
    }
  };
})();

window.HCConfig = HCConfig;
window.isPsychiatryEnabled = isPsychiatryEnabled;
window.AutoBackup = AutoBackup;
window.DocxExport = DocxExport;
