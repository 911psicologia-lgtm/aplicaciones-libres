window.SF = window.SF || {};
window.SF.config = {
  SAVE_KEY: 'sf3_save',
  RANK_KEY: 'sf3_rank',
  SHIP_KEY: 'sf3_ship',
  VERSION: '0.3.1',
  ships: [
    { id: 'vanguard', name: 'Vanguard', unlock: 0, speed: 430, fireRate: 0.14, hp: 10, damage: 1, color: '#7ee6ff', accent: '#ffc867', desc: 'Equilibrada · control firme · 10 HP' },
    { id: 'warden', name: 'Warden', unlock: 2500, speed: 380, fireRate: 0.11, hp: 14, damage: 1.15, color: '#ff9375', accent: '#ffe08a', desc: 'Blindada · daño estable · 14 HP' },
    { id: 'specter', name: 'Specter', unlock: 7000, speed: 500, fireRate: 0.095, hp: 9, damage: 0.95, color: '#c39cff', accent: '#8ff6ff', desc: 'Ágil · ráfaga veloz · 9 HP' }
  ],
  powers: {
    spread: { label: 'DISPERSIÓN', color: '#ffb45e', icon: 'spread' },
    shield: { label: 'ESCUDO', color: '#6fefff', icon: 'shield' },
    chain: { label: 'CADENA', color: '#89b5ff', icon: 'chain' },
    emp: { label: 'EMP', color: '#d88fff', icon: 'emp' },
    missile: { label: 'MISILES', color: '#ffd067', icon: 'missile' },
    heal: { label: 'REPARACIÓN', color: '#7cff88', icon: 'heal' },
    overdrive: { label: 'OVERDRIVE', color: '#fff16a', icon: 'overdrive' },
    life: { label: 'VIDA', color: '#ff7588', icon: 'life' }
  },
  sectors: [
    { name: 'Nebulosa Índigo', bg: ['#070b1a','#1e1b48','#422683'], fog: '#6f5cff' },
    { name: 'Órbita Verde', bg: ['#07131a','#0d4654','#15a2a4'], fog: '#56f1bd' },
    { name: 'Falla Carmesí', bg: ['#1a0907','#5e190d','#f95f2d'], fog: '#ff9557' },
    { name: 'Anomalía Dorada', bg: ['#160f05','#54351d','#f8b44d'], fog: '#ffe07f' }
  ],
  wave: {
    startCols: 10,
    startRows: 5,
    maxColsPortrait: 11,
    maxColsLandscape: 14,
    maxRowsPortrait: 8,
    maxRowsLandscape: 7,
    baseSpacingX: 7,
    baseSpacingY: 6,
    baseEnemySpeed: 84,
    stepEnemySpeed: 11,
    collectiveDrop: 14,
    zigzagRatio: 0.22
  },
  obstacles: {
    baseCount: 1,
    maxCount: 2,
    hpBase: 30,
    radius: [24, 42],
    spinRange: [0.4, 1.2]
  },
  progression: {
    wavesPerSector: 5,
    miniBossWave: 3,
    bossWave: 5,
    extraLifeEvery: 9000,
    checkpointEveryWave: true
  }
};
