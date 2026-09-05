window.SF = window.SF || {};
SF.Config = {
  version: '0.2.0',
  storage: {
    // Keep v0.1 keys so existing local saves remain compatible.
    save: 'sf_v01_save',
    rank: 'sf_v01_rank',
    ship: 'sf_v01_ship'
  },
  performance: {
    maxPlayerBullets: 54,
    maxEnemyBullets: 128,
    maxParticles: 230,
    maxPowerups: 4,
    spriteCacheEntries: 72
  },
  ships: [
    {
      id:'vanguard', name:'VANGUARD', asset:'ship_vanguard', unlock:0,
      speed:1.10, fireCd:92, bulletSpeed:1180, hp:1,
      desc:'Equilibrada · respuesta rápida · presión continua.'
    },
    {
      id:'warden', name:'WARDEN', asset:'ship_warden', unlock:4000,
      speed:0.96, fireCd:86, bulletSpeed:1070, hp:3,
      desc:'Asalto pesado · doble cañón · blindaje triple.'
    },
    {
      id:'specter', name:'SPECTER', asset:'ship_specter', unlock:9000,
      speed:1.34, fireCd:64, bulletSpeed:1380, hp:1,
      desc:'Alta movilidad · precisión · hipercadencia.'
    }
  ],
  enemyAssets: {
    squid:'enemy_swarm_1', crab:'enemy_swarm_2', octo:'enemy_swarm_3', ufo:'enemy_swarm_4',
    mosquito:'enemy_attacker_1', kamikaze:'enemy_attacker_1', carrier:'enemy_attacker_2',
    scarab:'enemy_attacker_2', plasma_orb:'enemy_attacker_3', wraith:'enemy_attacker_3',
    hive_drone:'enemy_swarm_4',
    elite_hornet:'enemy_attacker_1', elite_beetle:'enemy_attacker_2',
    elite_eye:'enemy_attacker_3', elite_plasma:'enemy_attacker_3',
    guardian:'enemy_elite_1',
    boss:'enemy_elite_1', boss_beetle:'enemy_elite_1', boss_mantis:'enemy_elite_1',
    boss_wasp:'enemy_elite_1', boss_spider:'enemy_elite_1', boss_eye:'enemy_elite_1',
    boss_hydra:'enemy_elite_1', boss_queen:'enemy_elite_1', boss_dread:'enemy_elite_1'
  },
  backgrounds: [
    {id:'bg_nebula', from:1, to:4, label:'SECTOR NÉBULA'},
    {id:'bg_orbit', from:5, to:8, label:'ÓRBITA PLANETARIA'},
    {id:'bg_anomaly', from:9, to:999, label:'ANOMALÍA PROFUNDA'}
  ],
  powers: {
    spread:{label:'DISPERSIÓN', duration:9000, asset:'vfx_spread'},
    beam:{label:'PLASMA', duration:3600, asset:'vfx_beam'},
    missiles:{label:'MISILES', duration:10000, asset:'vfx_missiles'},
    shield:{label:'ESCUDO', duration:9000, asset:'vfx_shield'},
    chain:{label:'CADENA', duration:0, asset:'vfx_chain'},
    emp:{label:'EMP', duration:0, asset:'vfx_emp'}
  },
  powerDropWeights: {spread:25,beam:18,missiles:19,shield:20,chain:10,emp:8},
  obstacleTypes: [
    {id:'asteroids', asset:'obs_asteroids', minWave:2, weight:34, minSize:50, maxSize:88, hp:5, destructible:true, score:20},
    {id:'wreckage', asset:'obs_wreckage_a', minWave:2, weight:28, minSize:54, maxSize:104, hp:6, destructible:true, score:25},
    {id:'meteor', asset:'obs_meteor_large', minWave:3, weight:34, minSize:50, maxSize:86, hp:3, destructible:true, score:30},
    {id:'planet', asset:'obs_planet', minWave:5, weight:8, minSize:104, maxSize:154, hp:999, destructible:false, score:0},
    {id:'destroyed', asset:'obs_destroyed', minWave:6, weight:10, minSize:94, maxSize:146, hp:999, destructible:false, score:0}
  ],
  waveProfile(wave){
    const w=Math.max(1,wave|0);
    return {
      // Denser formation from the first sector; grows gradually without exploding draw cost.
      cols: Math.min(14, 9 + Math.floor((w-1)/2)),
      rows: Math.min(8, 5 + Math.floor((w-1)/3)),
      formationSpeed: Math.min(116, 54 + w*5.2),
      formationDrop: Math.min(17, 8 + w*.58),
      diagonalChance: Math.min(.36, .12 + w*.024),
      diagonalAmp: Math.min(22, 8 + w*.75),
      enemyFire: Math.max(285, 900 - w*38),
      enemyBulletSpeed: Math.min(460, 245 + w*12),
      guardian: w>=2,
      guardianHp: Math.round(10 + w*2.7),
      guardianFire: Math.max(540, 1280 - w*34),
      obstacleInterval: Math.max(1750, 5700 - w*260),
      obstacleSpeed: Math.min(210, 78 + w*9.5),
      maxObstacles: Math.min(5, 1 + Math.floor(w/2)),
      obstacleDiagonalChance: w < 3 ? 0 : Math.min(.56, .14 + (w-3)*.05),
      staticChance: w < 7 ? 0 : Math.min(.20, .04 + (w-7)*.02),
      backgroundScroll: Math.min(.095, .046 + w*.0032)
    };
  },
  bossEvery: 5
};
