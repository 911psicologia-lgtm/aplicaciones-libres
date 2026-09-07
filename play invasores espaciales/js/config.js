window.SF = window.SF || {};
window.SF.config = {
  SAVE_KEY: 'sf3_save',
  RANK_KEY: 'sf3_rank',
  SHIP_KEY: 'sf3_ship',
  VERSION: '0.3.6',
  ships: [
    { id: 'vanguard', name: 'Vanguard', unlock: 0, speed: 430, fireRate: 0.14, hp: 10, damage: 1, armor:1, hitbox:.92, powerDuration:1.15, magnet:1.18, color: '#7ee6ff', accent: '#ffc867', desc: 'Equilibrada · poderes +15% · buen magnetismo · 10 HP' },
    { id: 'warden', name: 'Warden', unlock: 2500, speed: 380, fireRate: 0.12, hp: 14, damage: 1.18, armor:.82, hitbox:1.02, powerDuration:.95, magnet:1, color: '#ff9375', accent: '#ffe08a', desc: 'Blindada · recibe 18% menos daño · golpe fuerte · 14 HP' },
    { id: 'specter', name: 'Specter', unlock: 7000, speed: 505, fireRate: 0.095, hp: 9, damage: 0.98, armor:1, hitbox:.76, powerDuration:1, magnet:1.05, color: '#c39cff', accent: '#8ff6ff', desc: 'Ágil · hitbox reducido · hipercadencia · 9 HP' }
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
    startRows: 6,
    maxColsPortrait: 15,
    maxColsLandscape: 22,
    maxRowsPortrait: 8,
    maxRowsLandscape: 8,
    baseSpacingX: 6,
    baseSpacingY: 5,
    baseEnemySpeed: 78,
    stepEnemySpeed: 11,
    collectiveDrop: 7,
    zigzagRatio: 0.18
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
    checkpointEveryWave: true,
    restartLives: 3,
    lifeLostPauseMs: 1150,
    maxLives: 6
  },
  responsive: {
    mobilePortrait:   { maxWidth: 520,  cols: 9,  rows: 5, targetWidth: .82, enemyMin: 22, enemyMax: 34, gapX: 3, gapY: 4, playerH: 58 },
    tabletPortrait:   { maxWidth: 900,  cols: 13, rows: 6, targetWidth: .90, enemyMin: 24, enemyMax: 42, gapX: 4, gapY: 5, playerH: 66 },
    tabletLandscape:  { maxWidth: 1100, cols: 14, rows: 6, targetWidth: .86, enemyMin: 28, enemyMax: 48, gapX: 5, gapY: 5, playerH: 68 },
    desktop:          { maxWidth: 1800, cols: 18, rows: 6, targetWidth: .80, enemyMin: 40, enemyMax: 62, gapX: 7, gapY: 6, playerH: 80 },
    wideDesktop:      { maxWidth: 9999, cols: 20, rows: 6, targetWidth: .76, enemyMin: 42, enemyMax: 70, gapX: 8, gapY: 6, playerH: 86 }
  },
  formation: {
    mobileSpeedMultiplier: .62,
    portraitDropEveryBounces: 7,
    landscapeDropEveryBounces: 4,
    portraitDropPx: 4,
    landscapeDropPx: 7,
    portraitMaxDriftRatio: .055,
    landscapeMaxDriftRatio: .09,
    waveGraceMs: 1200,
    diverGraceMs: 2400
  },
  combatDirector: {
    lowHpRatio: .34,
    mercyFireMul: 1.22,
    mercyDiveMul: 1.28,
    hotCombo: 8,
    hotFireMul: .90,
    maxIntensity: 1.22,
    gunnerTelegraphMsMobile: 620,
    gunnerTelegraphMsDesktop: 470,
    bossPhase2Hp: .66,
    bossPhase3Hp: .33,
    waveClearBase: 220,
    perfectWaveBonus: 320,
    sectorClearBase: 1000
  },
  rewards: {
    mobileMagnetRadius: 120,
    desktopMagnetRadius: 96,
    powerMaxExtensionMs: 14000,
    healDropLowHpBonus: .12
  },

  subBossIdentity: {
    patterns: [
      {id:'arachnid',name:'ARACHNID',style:0,color:'#ffb36e'},
      {id:'leviathan',name:'LEVIATHAN',style:1,color:'#91c8ff'},
      {id:'dreadnought',name:'DREADNOUGHT',style:2,color:'#d596ff'}
    ]
  },
  bossIdentity: {
    patterns: [
      {id:'nova',name:'NÚCLEO NOVA',reward:['spread','overdrive','shield'],resurrect:false},
      {id:'lancer',name:'ARCONTE LANZA',reward:['chain','shield','missile'],resurrect:false},
      {id:'brood',name:'MADRE ENJAMBRE',reward:['missile','spread','heal'],resurrect:true},
      {id:'gravity',name:'DEVORADOR GRAVÍTICO',reward:['shield','chain','overdrive'],resurrect:false},
      {id:'phoenix',name:'FÉNIX SINTÉTICO',reward:['overdrive','missile','life'],resurrect:true}
    ],
    rewardTravelMs: 1350,
    resurrectionHpRatio: .44
  },
  permanentAugments: {
    spread:{damage:.04,fireRate:.01,label:'NÚCLEO DE DISPERSIÓN'},
    shield:{maxHp:1,label:'MATRIZ DE ESCUDO'},
    chain:{damage:.03,magnet:.05,label:'CONDUCTOR DE CADENA'},
    missile:{damage:.05,label:'NODO DE MISILES'},
    overdrive:{speed:.035,fireRate:.02,label:'IMPULSOR OVERDRIVE'},
    heal:{maxHp:1,label:'BIOREPARACIÓN'},
    life:{maxLives:1,label:'NÚCLEO VITAL'}
  },

  enemyEcology: {
    sentinelFromWave: 2,
    reanimatorFromWave: 3,
    breederFromWave: 4,
    sentinelShieldHp: 2.2,
    sentinelRadius: 92,
    reanimatorDelayMs: 2100,
    reanimatorMaxRevives: 1,
    breederIntervalMs: 4200,
    breederDroneCapMobile: 2,
    breederDroneCapDesktop: 4,
    reviveHpRatio: .58
  },
  formationPatterns: {
    sequence: ['block','chevron','split','wave','stagger'],
    amplitudePortrait: .52,
    amplitudeLandscape: .7
  },
  bossCore: {
    exposeMs: 1850,
    phaseExposeMs: 2400,
    damageMultiplier: 1.72,
    periodicEveryMs: 7200,
    periodicChance: .68
  },
  weaponEvolution: {
    tier2At: 2,
    tier3At: 4,
    maxTier: 3,
    chainChanceBonus: .035,
    missileHoming: .055,
    shieldPulseRadius: 170,
    relicOrbitMs: 520,
    attachCelebrationMs: 1650
  },
  tutorial: {
    enabled: true,
    hints: [
      {at:1800,text:'MUEVE LA NAVE · EL FUEGO ES AUTOMÁTICO'},
      {at:5200,text:'DISPARA LOS PODS PARA LIBERAR PODERES'},
      {at:9000,text:'LOS METEOROS BLOQUEAN FUEGO DE AMBOS BANDOS'}
    ]
  }
};
