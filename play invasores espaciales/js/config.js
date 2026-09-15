window.SF = window.SF || {};
window.SF.config = {
  SAVE_KEY: 'sf3_save',
  RANK_KEY: 'sf3_rank',
  SHIP_KEY: 'sf3_ship',
  PROFILE_KEY: 'sf3_profile_v1',
  MATRIX_TELEMETRY_KEY: 'sf3_reactive_matrix_telemetry_v1',
  VERSION: '0.6.9',
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
    life: { label: 'VIDA', color: '#ff7588', icon: 'life' },
    drone: { label: 'DRON ALIADO', color: '#7fffd4', icon: 'drone' },
    magnet: { label: 'IMÁN TOTAL', color: '#ffe66a', icon: 'magnet' }
  },

  economy: {
    streaks: {
      5:{xp:12,coins:8,label:'RACHA 5'},
      10:{xp:28,coins:18,label:'RACHA 10'},
      20:{xp:65,coins:42,label:'RACHA 20'},
      30:{xp:110,coins:70,label:'RACHA 30'}
    },
    bossSupply: { enabled:true, firstMs:3200, intervalMs:[6800,9000], maxPerFight:5 },
    catalog: [
      {id:'repair',kind:'heal',type:'consumable',label:'REPARAR',desc:'+5 HP',cost:45,level:1,icon:'✚'},
      {id:'shield',kind:'shield',type:'consumable',label:'ESCUDO',desc:'protección temporal',cost:60,level:1,icon:'◉'},
      {id:'magnet_charge',kind:'magnet',type:'consumable',label:'IMÁN TOTAL',desc:'recoge todo',cost:75,level:1,icon:'◎'},
      {id:'drone',kind:'drone',type:'consumable',label:'DRONES',desc:'activa bahía',cost:95,level:1,icon:'◆'},
      {id:'missile',kind:'missile',type:'consumable',label:'MISILES',desc:'salva temporal',cost:85,level:2,icon:'▲'},
      {id:'chain',kind:'chain',type:'consumable',label:'CADENA',desc:'arco encadenado',cost:95,level:2,icon:'ϟ'},
      {id:'overdrive',kind:'overdrive',type:'consumable',label:'OVERDRIVE',desc:'velocidad + cadencia',cost:105,level:2,icon:'»'},
      {id:'life',kind:'life',type:'consumable',label:'VIDA +1',desc:'acumula una vida',cost:150,level:2,icon:'♥'},
      {id:'revive',kind:'revive',type:'consumable',label:'RESURRECCIÓN',desc:'retorno automático x1',cost:260,level:3,icon:'✦',maxInventory:1},
      {id:'emp',kind:'emp',type:'consumable',label:'EMP',desc:'limpia amenazas menores',cost:145,level:3,icon:'◌'},
      {id:'hull',upgrade:'hull',type:'upgrade',label:'CASCO',desc:'+1 HP permanente',cost:180,step:115,level:1,max:8,icon:'▣'},
      {id:'thruster',upgrade:'thruster',type:'upgrade',label:'MOTORES',desc:'+4% velocidad',cost:200,step:120,level:1,max:5,icon:'↑'},
      {id:'armor',upgrade:'armor',type:'upgrade',label:'ARMADURA',desc:'-5% daño recibido',cost:240,step:145,level:2,max:5,icon:'⬡'},
      {id:'firerate',upgrade:'firerate',type:'upgrade',label:'CADENCIA',desc:'+3% velocidad de fuego',cost:270,step:160,level:2,max:5,icon:'≋'},
      {id:'dronebay',upgrade:'dronebay',type:'upgrade',label:'BAHÍA DRON',desc:'sube de 1 a 4 drones',cost:220,step:190,level:2,max:3,icon:'◇'},
      {id:'magnet',upgrade:'magnet',type:'upgrade',label:'TRACTOR',desc:'+14% recogida',cost:230,step:135,level:2,max:6,icon:'⊙'},
      {id:'power',upgrade:'power',type:'upgrade',label:'CELDA',desc:'+10% duración',cost:260,step:150,level:2,max:6,icon:'⌁'},
      {id:'weapon',upgrade:'weapon',type:'upgrade',label:'ARMAS',desc:'+3.5% daño',cost:330,step:185,level:3,max:6,icon:'✹'}
    ]
  },
  sectors: [
    { name: 'Nebulosa Roja', bg: ['#16070c','#4b0d1c','#9a1733'], fog: '#ff4968' },
    { name: 'Anillo de Titanio', bg: ['#07110c','#24321a','#5f6722'], fog: '#a8ff55' },
    { name: 'Vacío Bioluminiscente', bg: ['#031019','#072f48','#155b7d'], fog: '#4ad8ff' },
    { name: 'Cinturón Abisal', bg: ['#0b0615','#26104b','#562277'], fog: '#d260ff' },
    { name: 'Sector Leviatán', bg: ['#02121b','#07384b','#0c6573'], fog: '#58e6ff' }
  ],

  worldFamilies: {
    enabled: true,
    maxIntegratedWorld: 5,
    cycleBeyondIntegrated: true,
    // v0.5.7: los assets realistas W01–05 pasan a ser arte principal, no simples overlays.
    realisticPrimary: true,
    currentRatioByWave: {1:.62,2:.72,3:.82,4:.78},
    carryoverRatio: .20,
    legacyRatioFloor: .12,
    bossOverlayAlpha: .96,
    subbossOverlayAlpha: .96,
    backgroundOverlayAlpha: .78,
    originalBackgroundGhostAlpha: .14,
    projectileSpriteAlpha: .92,
    bossDeathFxMs: 920
  },

  worldFamilyTactics: {
    enabled: true,
    announceWave1: true,
    worlds: {
      1:{id:'crimson_predation',label:'PREDACIÓN ESCARLATA',desc:'cazadores más agresivos · ataques orgánicos cercanos',diveMul:.82,acidSpread:true},
      2:{id:'yautja_hunt',label:'CAZA DE SOMBRA',desc:'cazadores se camuflan y cambian de carril antes de disparar',cloakMs:1050,cloakEvery:[4300,6500],cloakShift:32},
      3:{id:'nebula_phase',label:'FASE NÉBULA',desc:'unidades energéticas alternan ventanas de fase defensiva',phaseMs:900,phaseEvery:[4400,6200],phaseDamageMul:.48},
      4:{id:'arachnid_web',label:'RED ARÁCNIDA',desc:'más crías y proyectiles de telaraña que ralentizan brevemente',breederMul:.74,webSlow:.68,webSlowMs:950},
      5:{id:'leviathan_tide',label:'MAREA LEVIATÁN',desc:'formación ondulante · presión lateral y pulsos abisales',waveAmpX:14,waveAmpY:7,sentinelRadiusMul:1.18}
    }
  },
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
    hpBase: 36,
    radius: [28, 52],
    mediumRadius: [24, 36],
    largeRadius: [38, 54],
    spinRange: [0.18, 0.62],
    crossSpeed: [28, 52],
    diagonalSpeedY: [7, 15],
    moverChance: .42,
    diagonalChance: .16,
    lowerBandPortrait: [.47,.69],
    lowerBandLandscape: [.45,.67]
  },
  progression: {
    wavesPerSector: 4,
    miniBossWave: 3,
    bossWave: 4,
    extraLifeEvery: 7500,
    checkpointEveryWave: true,
    restartLives: 4,
    lifeLostPauseMs: 1150,
    maxLives: 9
  },
  responsive: {
    mobilePortrait:   { maxWidth: 520,  cols: 10, rows: 5, targetWidth: .88, enemyMin: 22, enemyMax: 38, gapX: 2.5, gapY: 3.5, playerH: 60 },
    tabletPortrait:   { maxWidth: 900,  cols: 13, rows: 6, targetWidth: .92, enemyMin: 24, enemyMax: 45, gapX: 4, gapY: 4.5, playerH: 68 },
    tabletLandscape:  { maxWidth: 1100, cols: 15, rows: 6, targetWidth: .88, enemyMin: 28, enemyMax: 50, gapX: 4.5, gapY: 5, playerH: 70 },
    desktop:          { maxWidth: 1800, cols: 18, rows: 6, targetWidth: .84, enemyMin: 40, enemyMax: 66, gapX: 6, gapY: 5.5, playerH: 82 },
    wideDesktop:      { maxWidth: 9999, cols: 20, rows: 6, targetWidth: .80, enemyMin: 42, enemyMax: 74, gapX: 7, gapY: 5.5, playerH: 88 }
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
  difficultyCurve: {
    // Curva W01–05: inicia accesible, escala de forma visible y reserva la mayor presión para W04–05.
    worlds: [
      {hp:.90,speed:.92,fireCd:1.10,subbossHp:1.58,bossHp:1.55,bossFireCd:.98,eliteChance:.72},
      {hp:.98,speed:.98,fireCd:1.04,subbossHp:1.78,bossHp:1.80,bossFireCd:.91,eliteChance:.88},
      {hp:1.06,speed:1.03,fireCd:1.00,subbossHp:2.02,bossHp:2.10,bossFireCd:.84,eliteChance:1.00},
      {hp:1.14,speed:1.07,fireCd:.96,subbossHp:2.32,bossHp:2.45,bossFireCd:.77,eliteChance:1.12},
      {hp:1.22,speed:1.11,fireCd:.92,subbossHp:2.62,bossHp:2.80,bossFireCd:.70,eliteChance:1.24}
    ],
    waves: {
      1:{hp:.88,speed:.92,fireCd:1.12,eliteMul:.70},
      2:{hp:1.00,speed:1.00,fireCd:1.03,eliteMul:1.00},
      3:{hp:1.10,speed:1.05,fireCd:.96,eliteMul:1.15},
      4:{hp:1.00,speed:1.00,fireCd:1.00,eliteMul:1.00}
    },
    mobileEnemyHpMul:.94,
    mobileBossHpMul:1.00,
    mobileFireCdMul:1.06,
    lowHpGraceFireCdMul:1.12,
    lowHpGraceSpeedMul:.94
  },
  rewards: {
    mobileMagnetRadius: 120,
    desktopMagnetRadius: 96,
    powerMaxExtensionMs: 16000,
    healDropLowHpBonus: .24,
    lifeDropChance: .035,
    eliteLifeDropChance: .16,
    gemDropChance: .18
  },

  subBossIdentity: {
    patterns: [
      {id:'arachnid',name:'ARACHNID',style:0,color:'#ffb36e',signature:'RED DE CAZA',secondary:'NIDO DE FILAMENTOS'},
      {id:'leviathan',name:'LEVIATHAN',style:1,color:'#91c8ff',signature:'DOBLE SINGULARIDAD',secondary:'ESPIRAL DE VACÍO'},
      {id:'dreadnought',name:'DREADNOUGHT',style:2,color:'#d596ff',signature:'BATERÍA TRIDENTE',secondary:'MINAS DE SITIO'}
    ]
  },
  transitionSafety: {
    rewardWatchdogMs: 7600,
    rewardSnapDistance: 34,
    rewardMaxSpeed: 920,
    sectorAdvanceDelayMs: 720,
    loopRecoveryMessageMs: 750
  },
  bossIdentity: {
    patterns: [
      {id:'nova',name:'NÚCLEO NOVA',reward:['spread','overdrive','shield'],resurrect:false,signature:'CORONA HELIOS',accent:'#ff9b72'},
      {id:'lancer',name:'ARCONTE LANZA',reward:['chain','drone','missile'],resurrect:false,signature:'JUICIO AXIAL',accent:'#8fc8ff'},
      {id:'brood',name:'MADRE ENJAMBRE',reward:['drone','spread','heal'],resurrect:true,signature:'SEMILLA DEVORADORA',accent:'#d296ff'},
      {id:'gravity',name:'DEVORADOR GRAVÍTICO',reward:['shield','chain','overdrive'],resurrect:false,signature:'HORIZONTE ROTO',accent:'#75efff'},
      {id:'phoenix',name:'FÉNIX SINTÉTICO',reward:['overdrive','missile','life'],resurrect:true,signature:'ALAS DE RENACIMIENTO',accent:'#ffcf74'}
    ],
    rewardTravelMs: 1350,
    resurrectionHpRatio: .44,
    signatureDisplayMs: 780,
    signaturePulseMs: 520
  },
  permanentAugments: {
    spread:{damage:.04,fireRate:.01,label:'NÚCLEO DE DISPERSIÓN'},
    shield:{maxHp:1,label:'MATRIZ DE ESCUDO'},
    chain:{damage:.03,magnet:.05,label:'CONDUCTOR DE CADENA'},
    missile:{damage:.05,label:'NODO DE MISILES'},
    overdrive:{speed:.035,fireRate:.02,label:'IMPULSOR OVERDRIVE'},
    heal:{maxHp:1,label:'BIOREPARACIÓN'},
    life:{maxLives:1,label:'NÚCLEO VITAL'},
    drone:{damage:.025,magnet:.025,label:'NÚCLEO DE DRON'}
  },

  enemyEcology: {
    sentinelFromWave: 2,
    reanimatorFromWave: 3,
    breederFromWave: 3,
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

  microSwarm: {
    enabled: true,
    fromWave: 1,
    intervalMs: [3800,5600],
    maxBurstsByWave: {1:1,2:2,3:3,4:0},
    triggerAliveRatio: .62,
    mobileCount: [4,6],
    desktopCount: [6,9],
    hpBase: 1,
    durationMs: [2600,3600],
    shotChance: .54
  },
  bossModules: {
    enabled: true,
    countBySector: [2,2,3,3,3],
    hpRatio: .14,
    orbitRadiusX: .58,
    orbitRadiusY: .42,
    orbitSpeed: .00115,
    radiusRatio: .065,
    minRadius: 10,
    maxRadius: 18,
    allBrokenFortressStrip: .46,
    allBrokenCoreExposeMs: 3200,
    reviveOneNodeFromSector: 3
  },
  bossHardpoints: {
    enabled: true,
    countBySector: [2,3,3,4,4],
    hpRatio: .095,
    shieldedDamageMul: .42,
    weaponCooldownPenalty: .24,
    driveMovementMul: .62,
    regulatorFortressStrip: .24,
    allBrokenFortressStrip: .20,
    allBrokenCoreExposeMs: 2600,
    minRadius: 11,
    maxRadius: 18,
    radiusRatio: .072,
    reviveOneFromSector: 4
  },
  assetStreaming: {
    enabled: true,
    keepPreviousWorld: true,
    keepNextWorld: false
  },

  subbossFortress: {
    enabled: true,
    initialShieldRatio: .50,
    armorMul: .72,
    exposedDamageMul: 1.42,
    maxDamagePerHitRatio: .035,
    phaseThreshold: .50,
    phaseRechargeRatio: .35,
    breakExposeMs: 1600,
    phaseGateMs: 620,
    rageFireCdMul: .72,
    rageMoveMul: 1.20
  },

  reactiveMatrix: {
    enabled: true,
    mode: 'assist',
    showHud: true,
    debugConsole: false,
    telemetryMaxEntries: 60,
    dpsWindowMs: 6000,
    updateIntervalMs: 350,
    minDpsSampleMs: 1500,
    hysteresisMs: 1800,
    stateCooldownMs: 3500,
    supportSupplyCooldownMs: 8500,
    supportSupplyMaxPerFight: 2,
    overdriveMitigation: .88,
    overdriveMoveMul: 1.07,
    overdriveSignatureLeadMs: 1250,
    dominanceUsesOverdriveFloor: true,
    expectedDpsBase: 8.4,
    expectedDpsGrowth: .12,
    supportTtkMul: 1.22,
    supportPowerIndex: .72,
    overdriveTtkMul: .82,
    overdrivePowerIndex: 1.55,
    dominanceTtkMul: .50,
    targetWindows: {
      initial:[45,75],
      intermediate:[55,90],
      advanced:[70,110],
      final:[90,130]
    }
  },

  enduranceDirector: {
    // Compensa el crecimiento permanente del jugador sin inflar los minions.
    enabled: true,
    bossRelicHpPer: .025,
    bossChassisHpPer: .045,
    bossDamageAugmentWeight: .70,
    bossMaxPowerScale: 1.70,
    subbossRelicHpPer: .016,
    subbossChassisHpPer: .030,
    subbossDamageAugmentWeight: .45,
    subbossMaxPowerScale: 1.42,
    fortressRelicBonus: .008,
    fortressChassisBonus: .015,
    fortressMaxBonus: .16,
    subShieldRelicBonus: .006,
    subShieldChassisBonus: .012,
    subShieldMaxBonus: .12,
    bossPhasePressureAfterMs: [15000,12500,10000],
    bossPressureFireMul: [1,.88,.78],
    bossPressureMoveMul: [1,1.055,1.11],
    bossPressureSecondStageMul: 1.72,
    subbossPressureAfterMs: 11500,
    subbossPressureFireMul: [1,.90,.82],
    subbossPressureMoveMul: [1,1.05,1.10],
    subbossPressureSecondStageMul: 1.72
  },

  bossFortress: {
    initialShieldRatio: .64,
    phaseRechargeRatio: [0,.34,.44],
    pulseRechargeRatio: [.07,.10,.13],
    armorByPhase: [.66,.60,.54],
    maxDamagePerHitRatio: .015,
    breakExposeMs: 2200,
    powerCooldownMs: [7000,5300,3900],
    pulseProjectileCount: [8,11,14],
    phaseGateMs: 760,
    adaptationWindowMs: 1050,
    adaptationThresholdRatio: .050,
    adaptationDamageMul: .48,
    adaptationMs: 1050,
    quickRebootThresholdSecBySector: [42,48,55,65,75],
    quickRebootHpRatio: .50,
    quickRebootFortressRatio: .44,
    quickRebootMoveMul: 1.16,
    quickRebootFireCdMul: .78
  },

  bossCore: {
    exposeMs: 1700,
    phaseExposeMs: 2050,
    damageMultiplier: 1.62,
    periodicEveryMs: 9400,
    periodicChance: .45
  },

  shipEvolution: {
    // Evolución visual persistente: refleja reliquias absorbidas sin añadir ruido a la interfaz.
    stageThresholds: [0,2,5,8,12],
    maxStage: 4,
    wingExtension: [.0,.08,.13,.18,.24],
    glowStrength: [.0,.12,.18,.24,.32],
    engineTrailMul: [1,1.08,1.16,1.25,1.34]
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


  sectorMutators: {
    sequence: [
      {id:'clear',name:'CORREDOR ESTABLE',desc:'Combate estándar · lectura limpia',scoreMul:1,powerDuration:1,magnetMul:1,enemySpeedMul:1,meteorHpMul:1,eliteBonus:0},
      {id:'ion',name:'TORMENTA IÓNICA',desc:'Poderes duran más · energía inestable',scoreMul:1.08,powerDuration:1.16,magnetMul:1.05,enemySpeedMul:1.04,meteorHpMul:1,eliteBonus:.02},
      {id:'gravity',name:'MAREA GRAVITATORIA',desc:'Premios atraídos con más fuerza · proyectiles curvos',scoreMul:1.1,powerDuration:1,magnetMul:1.34,enemySpeedMul:1.02,meteorHpMul:1.05,eliteBonus:.025},
      {id:'debris',name:'CAMPO DE FRAGMENTOS',desc:'Meteoros reforzados · mayor recompensa al romperlos',scoreMul:1.12,powerDuration:1,magnetMul:1,enemySpeedMul:.98,meteorHpMul:1.35,eliteBonus:.035},
      {id:'berserk',name:'ZONA BERSERKER',desc:'Más élites · puntuación superior',scoreMul:1.18,powerDuration:.96,magnetMul:1,enemySpeedMul:1.1,meteorHpMul:.9,eliteBonus:.07}
    ],
    announceMs: 1150,
    gravityCurve: 36,
    ionPulseEveryMs: 3600
  },
  eliteVariants: {
    fromWave: 2,
    baseChance: .035,
    maxMobile: 2,
    maxDesktop: 4,
    classes: [
      {id:'ace',label:'ACE',hpMul:1.8,scoreMul:2.0,color:'#ffd66b'},
      {id:'bulwark',label:'BULWARK',hpMul:2.45,scoreMul:2.45,color:'#9de8ff'},
      {id:'hunter',label:'HUNTER',hpMul:2.0,scoreMul:2.25,color:'#ff9ed8'}
    ]
  },
  tacticalObjectives: {
    bonusScore: 420,
    bossPartTarget: 2,
    pools: {
      1:[
        {id:'combo',label:'OBJETIVO · RACHA x6',target:6,reward:'overdrive'},
        {id:'pod',label:'OBJETIVO · ABRE UN POD',target:1,reward:'heal'}
      ],
      2:[
        {id:'meteor',label:'OBJETIVO · ROMPE UN METEORO',target:1,reward:'missile'},
        {id:'elite',label:'OBJETIVO · ELIMINA 1 ÉLITE',target:1,reward:'shield'}
      ],
      3:[
        {id:'miniboss',label:'OBJETIVO · DERRIBA EL SUBJEFE',target:1,reward:'drone'},
        {id:'combo',label:'OBJETIVO · RACHA x10',target:10,reward:'overdrive'}
      ],
      4:[
        {id:'bosspart',label:'OBJETIVO · DESTRUYE 2 SISTEMAS DEL JEFE',target:2,reward:'shield'},
        {id:'meteor',label:'OBJETIVO · ROMPE LA ROCA DEFENSORA',target:1,reward:'missile'}
      ]
    }
  },
  bossArena: {
    introInvulnerabilityMs: 1800,
    introMessageMs: 1200,
    bossOnlyWave: true
  },
  bossPrelude: {
    enabled: true,
    durationMsBySector: [13000,14000,15000,16000,17000],
    burstIntervalMs: [1850,2550],
    firstBurstDelayMs: 320,
    mobileCount: [5,8],
    desktopCount: [8,13],
    maxAliveMobile: 18,
    maxAliveDesktop: 28,
    hpBase: 1,
    hpSectorStep: .35,
    speedMul: 1.12,
    shotChance: .50,
    midpointSupplyRatio: .53,
    finalSupplyBeforeMs: 3200,
    maxContextSupplies: 2
  },
  combatFlow: {
    enabled: true,
    bossPhaseSignatureDelayMs: [1250,950,720],
    bossPhaseSignatureCooldownMs: [6200,5400,4600],
    bossSignatureTelegraphMs: [980,840,720],
    bossSignatureSafeRadius: [44,52,60],
    rebootSignatureDelayMs: 1750,
    subbossOpeningSignatureDelayMs: 950,
    subbossPhase2SignatureDelayMs: 720,
    bossEscortRefillCooldownMs: [7200,6200,5200],
    bossEscortFloorByPhase: [0,1,1],
    supplyLowHpRatio: .48
  },
  fusion: {
    durationMs: 5200,
    cooldownMs: 11500,
    arcPulseMs: 680,
    combos: [
      {id:'nova',a:'spread',b:'overdrive',label:'FUSIÓN · NOVA STORM',color:'#ffd27d'},
      {id:'arc',a:'shield',b:'chain',label:'FUSIÓN · ARC AEGIS',color:'#85eaff'},
      {id:'hunter',a:'missile',b:'overdrive',label:'FUSIÓN · HUNTER SALVO',color:'#ffcf72'}
    ]
  },
  allyDrone: {
    durationMs: 15000,
    shotMs: 410,
    orbitRadiusMobile: 34,
    orbitRadiusDesktop: 48,
    damage: .82,
    maxPurchased:4,
    interceptMinBay:2,
    interceptRadius:92,
    interceptCooldownMs:1150,
    interceptsAtMax:2
  },
  bossAlly: {
    enabled:true,
    durationMs:10000,
    cooldownMs:40000,
    shotMs:480,
    damage:1.15,
    signatureAtMs:[250,5200],
    signatureDamage:1.55
  },
  playerSurvival: {
    bossDamageMul:.78,
    subbossDamageMul:.86,
    bossInvulnMs:1120,
    normalInvulnMs:940,
    reviveInvulnMs:2800
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
