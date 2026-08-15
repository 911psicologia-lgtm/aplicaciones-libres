/**
 * ============================================
 * HISTORIA CLÍNICA PSICOLÓGICA INTEGRAL
 * Base de Datos IndexedDB
 * ============================================
 */

const DB_NAME = 'HistoriaClinicaDB';
const DB_VERSION = 1;

// Stores (tablas)
const STORES = {
    USERS: 'users',
    PATIENTS: 'patients',
    SESSIONS: 'sessions',
    ASSESSMENTS: 'assessments',
    DIAGNOSES: 'diagnoses',
    SETTINGS: 'settings',
    BACKUPS: 'backups'
};

class Database {
    constructor() {
        this.db = null;
        this.initPromise = null;
        this.suspendAutoBackup = false;
    }

    async init() {
        if (this.initPromise) return this.initPromise;
        
        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Error abriendo IndexedDB:', request.error);
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB abierta correctamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                console.log('Actualizando base de datos...');
                const db = event.target.result;

                // Store: Usuarios (profesionales)
                if (!db.objectStoreNames.contains(STORES.USERS)) {
                    const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('username', 'username', { unique: true });
                }

                // Store: Pacientes
                if (!db.objectStoreNames.contains(STORES.PATIENTS)) {
                    const patientStore = db.createObjectStore(STORES.PATIENTS, { keyPath: 'id', autoIncrement: true });
                    patientStore.createIndex('historyNumber', 'historyNumber', { unique: true });
                    patientStore.createIndex('document', 'document', { unique: false });
                    patientStore.createIndex('lastName', 'lastName', { unique: false });
                    patientStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                // Store: Sesiones
                if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
                    const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id', autoIncrement: true });
                    sessionStore.createIndex('patientId', 'patientId', { unique: false });
                    sessionStore.createIndex('date', 'date', { unique: false });
                }

                // Store: Evaluaciones
                if (!db.objectStoreNames.contains(STORES.ASSESSMENTS)) {
                    const assessmentStore = db.createObjectStore(STORES.ASSESSMENTS, { keyPath: 'id', autoIncrement: true });
                    assessmentStore.createIndex('patientId', 'patientId', { unique: false });
                    assessmentStore.createIndex('instrument', 'instrument', { unique: false });
                }

                // Store: Diagnósticos
                if (!db.objectStoreNames.contains(STORES.DIAGNOSES)) {
                    const diagnosisStore = db.createObjectStore(STORES.DIAGNOSES, { keyPath: 'id', autoIncrement: true });
                    diagnosisStore.createIndex('patientId', 'patientId', { unique: false });
                }

                // Store: Configuración
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }

                // Store: Respaldos
                if (!db.objectStoreNames.contains(STORES.BACKUPS)) {
                    db.createObjectStore(STORES.BACKUPS, { keyPath: 'id', autoIncrement: true });
                }
            };
        });

        return this.initPromise;
    }

    // Operaciones CRUD genéricas
    async add(storeName, data) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            transaction.oncomplete = () => { try{ !this.suspendAutoBackup && window.AutoBackup && AutoBackup.snapshot && AutoBackup.snapshot('add'); }catch(e){} };
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            transaction.oncomplete = () => { try{ !this.suspendAutoBackup && window.AutoBackup && AutoBackup.snapshot && AutoBackup.snapshot('put'); }catch(e){} };
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            transaction.oncomplete = () => { try{ !this.suspendAutoBackup && window.AutoBackup && AutoBackup.snapshot && AutoBackup.snapshot('delete'); }catch(e){} };
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // Métodos específicos
    async getNextHistoryNumber() {
        const patients = await this.getAll(STORES.PATIENTS);
        if (patients.length === 0) return 'HC-000001';
        
        const numbers = patients.map(p => {
            const match = String(p.historyNumber || '').match(/(\d+)(?!.*\d)/);
            return match ? parseInt(match[1], 10) : 0;
        });
        
        const maxNumber = Math.max(...numbers);
        return `HC-${String(maxNumber + 1).padStart(6, '0')}`;
    }

    async searchPatients(query) {
        const patients = await this.getAll(STORES.PATIENTS);
        if (!query) return patients;
        
        const lowerQuery = query.toLowerCase();
        return patients.filter(p => 
            (p.firstName && p.firstName.toLowerCase().includes(lowerQuery)) ||
            (p.lastName && p.lastName.toLowerCase().includes(lowerQuery)) ||
            (p.document && p.document.toLowerCase().includes(lowerQuery)) ||
            (p.historyNumber && p.historyNumber.toLowerCase().includes(lowerQuery))
        );
    }

    async getPatientSessions(patientId) {
        return this.getByIndex(STORES.SESSIONS, 'patientId', patientId);
    }

    async getPatientAssessments(patientId) {
        return this.getByIndex(STORES.ASSESSMENTS, 'patientId', patientId);
    }

    async getPatientDiagnoses(patientId) {
        return this.getByIndex(STORES.DIAGNOSES, 'patientId', patientId);
    }

    // Configuración
    async getSetting(key, defaultValue = null) {
        const setting = await this.get(STORES.SETTINGS, key);
        return setting ? setting.value : defaultValue;
    }

    async setSetting(key, value) {
        await this.put(STORES.SETTINGS, { key, value });
    }

    // Backup y restauración
    async exportAllData() {
        const data = {
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
        for (const storeName of Object.values(STORES)) {
            data[storeName] = await this.getAll(storeName);
        }
        return JSON.stringify(data, null, 2);
    }

    // Alias para compatibilidad
    async exportAll() {
        return await this.exportAllData();
    }

    async clearStore(storeName) {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async importData(jsonData) {
        await this.init();
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        this.suspendAutoBackup = true;
        try {

        // MODO 1: Importar/actualizar un caso individual exportado desde export.html
        // Estructura esperada: { exportedAt, patient, sessions, assessments, diagnoses }
        // Si ya existe un paciente con el mismo historyNumber, se ACTUALIZA ese caso
        // y se reemplazan sus sesiones/evaluaciones/diagnósticos para evitar duplicados.
        if (data.patient && typeof data.patient === 'object') {
            const incomingPatient = { ...data.patient };
            const oldPatientId = incomingPatient.id;
            const historyNumber = (incomingPatient.historyNumber || '').trim();
            const firstName = (incomingPatient.firstName || '').trim().toLowerCase();
            const lastName = (incomingPatient.lastName || '').trim().toLowerCase();

            const currentPatients = await this.getAll(STORES.PATIENTS);
            let existingPatient = null;

            if (historyNumber) {
                existingPatient = currentPatients.find(p => (p.historyNumber || '').trim() === historyNumber) || null;
            }

            if (!existingPatient && firstName && lastName) {
                existingPatient = currentPatients.find(p =>
                    (p.firstName || '').trim().toLowerCase() === firstName &&
                    (p.lastName || '').trim().toLowerCase() === lastName
                ) || null;
            }

            let targetPatientId;
            if (existingPatient) {
                targetPatientId = existingPatient.id;
                incomingPatient.id = targetPatientId;
                incomingPatient.updatedAt = new Date().toISOString();
                await this.put(STORES.PATIENTS, incomingPatient);

                // Reemplazar datos relacionados del mismo paciente para que el caso quede actualizado.
                const relatedStores = [STORES.SESSIONS, STORES.ASSESSMENTS, STORES.DIAGNOSES];
                for (const storeName of relatedStores) {
                    const allItems = await this.getAll(storeName);
                    const patientItems = allItems.filter(item => item.patientId === targetPatientId || item.patientId === oldPatientId);
                    for (const item of patientItems) {
                        if (item.id !== undefined && item.id !== null) {
                            await this.delete(storeName, item.id);
                        }
                    }
                }
            } else {
                delete incomingPatient.id;
                incomingPatient.createdAt = incomingPatient.createdAt || new Date().toISOString();
                incomingPatient.updatedAt = new Date().toISOString();
                targetPatientId = await this.add(STORES.PATIENTS, incomingPatient);
            }

            const relatedStores = [
                [STORES.SESSIONS, data.sessions || []],
                [STORES.ASSESSMENTS, data.assessments || []],
                [STORES.DIAGNOSES, data.diagnoses || []]
            ];

            const counts = { sessions: 0, assessments: 0, diagnoses: 0 };
            for (const [storeName, items] of relatedStores) {
                if (!Array.isArray(items)) continue;
                for (const original of items) {
                    const item = { ...original };
                    delete item.id;
                    item.patientId = targetPatientId;
                    item.createdAt = item.createdAt || new Date().toISOString();
                    item.updatedAt = new Date().toISOString();
                    await this.add(storeName, item);
                    if (storeName === STORES.SESSIONS) counts.sessions++;
                    if (storeName === STORES.ASSESSMENTS) counts.assessments++;
                    if (storeName === STORES.DIAGNOSES) counts.diagnoses++;
                }
            }

            return {
                mode: existingPatient ? 'single-case-updated' : 'single-case-created',
                patientId: targetPatientId,
                patientName: `${incomingPatient.firstName || ''} ${incomingPatient.lastName || ''}`.trim(),
                counts
            };
        }

        // MODO 2: Restaurar respaldo completo exportado desde Configuración
        // Estructura esperada: { exportedAt, version, users, patients, sessions, assessments, diagnoses, settings, backups }
        // Se limpia la base y se preservan IDs para mantener relaciones patientId.
        const storeNames = Object.values(STORES);
        const hasBackupStores = storeNames.some(storeName => Array.isArray(data[storeName]));
        if (!hasBackupStores) {
            throw new Error('Formato JSON no reconocido: no contiene patient ni tablas de respaldo.');
        }

        // Si el JSON trae usuarios/configuración, se asume respaldo completo y se reemplaza todo.
        // Si solo trae tablas clínicas, se reemplazan únicamente datos clínicos para no borrar acceso/configuración.
        const isStrictFullBackup = Array.isArray(data[STORES.USERS]) || Array.isArray(data[STORES.SETTINGS]);
        const clearOrder = isStrictFullBackup ? [
            STORES.SESSIONS,
            STORES.ASSESSMENTS,
            STORES.DIAGNOSES,
            STORES.PATIENTS,
            STORES.BACKUPS,
            STORES.SETTINGS,
            STORES.USERS
        ] : [
            STORES.SESSIONS,
            STORES.ASSESSMENTS,
            STORES.DIAGNOSES,
            STORES.PATIENTS,
            STORES.BACKUPS
        ];

        for (const storeName of clearOrder) {
            await this.clearStore(storeName);
        }

        const importOrder = isStrictFullBackup ? [
            STORES.USERS,
            STORES.SETTINGS,
            STORES.PATIENTS,
            STORES.SESSIONS,
            STORES.ASSESSMENTS,
            STORES.DIAGNOSES,
            STORES.BACKUPS
        ] : [
            STORES.PATIENTS,
            STORES.SESSIONS,
            STORES.ASSESSMENTS,
            STORES.DIAGNOSES,
            STORES.BACKUPS
        ];

        const counts = {};
        for (const storeName of importOrder) {
            const items = data[storeName];
            if (!Array.isArray(items)) continue;
            counts[storeName] = items.length;
            for (const item of items) {
                await this.add(storeName, { ...item });
            }
        }

        return { mode: 'full-backup', counts };
        } finally {
            this.suspendAutoBackup = false;
            try { window.AutoBackup && AutoBackup.snapshot && AutoBackup.snapshot('post-import'); } catch(e) {}
        }
    }
}

// Instancia global
const db = new Database();

// Inicializar usuario por defecto si no existe
async function initDefaultUser() {
    try {
        await db.init();
        const users = await db.getAll(STORES.USERS);
        
        if (users.length === 0) {
            await db.add(STORES.USERS, {
                username: 'admin',
                password: 'admin123',
                fullName: 'Administrador',
                createdAt: new Date().toISOString()
            });
            console.log('Usuario por defecto creado');
        }
    } catch (error) {
        console.error('Error creando usuario por defecto:', error);
    }
}

// Exponer globalmente
window.db = db;
window.STORES = STORES;
window.initDefaultUser = initDefaultUser;
