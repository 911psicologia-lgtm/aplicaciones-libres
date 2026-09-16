/* ============================================================
   UI - Manejo de interfaz de usuario
   ============================================================ */

const UI = {
    /* Referencias a elementos del DOM */
    el: {},

    init() {
        this.el = {
            hudScore: document.getElementById('hud-score'),
            hudLives: document.getElementById('hud-lives'),
            livesIcons: document.getElementById('lives-icons'),
            hudCoins: document.getElementById('hud-coins'),
            hudNick: document.getElementById('hud-nick'),
            hudLevelname: document.getElementById('hud-levelname'),
            hudSub: document.getElementById('hud-levelstory'),
            progFill: document.getElementById('prog-fill'),
            progLabel: document.getElementById('prog-label'),
            powerShelf: document.getElementById('power-shelf'),
            motivationText: document.getElementById('motivation-text'),
            bossUI: document.getElementById('boss-ui'),
            bossName: document.getElementById('boss-title'),
            bossSpecial: document.getElementById('boss-special'),
            bossHp: document.getElementById('boss-hp'),
            bossCast: document.getElementById('boss-cast'),
            comboBadge: document.getElementById('combo-badge'),
            comboCount: document.getElementById('combo-count'),
            comboLabel: document.getElementById('combo-label'),
            comboStack: document.getElementById('combo-stack'),
            startScreen: document.getElementById('start-screen'),
            selectScreen: document.getElementById('select-screen'),
            princessGrid: document.getElementById('princess-grid'),
            princessInfo: document.getElementById('princess-info'),
            piName: document.getElementById('pi-name'),
            piTitle: document.getElementById('pi-title'),
            piDesc: document.getElementById('pi-desc'),
            piPassive: document.getElementById('pi-passive'),
            hangarScreen: document.getElementById('hangar-screen'),
            pauseScreen: document.getElementById('pause-screen'),
            levelClearScreen: document.getElementById('level-clear-screen'),
            gameOverScreen: document.getElementById('game-over'),
            victoryScreen: document.getElementById('victory-screen'),
            rankStart: document.getElementById('rank-start'),
            rankEnd: document.getElementById('rank-end'),
            rankVictory: document.getElementById('rank-victory'),
            resumeBtn: document.getElementById('btn-resume'),
            rewardBox: document.getElementById('reward-box'),
            hangarGrid: document.getElementById('hangar-grid'),
            hangarCoins: document.getElementById('hangar-coins-val'),
            btnSound: document.getElementById('btn-sound'),
            btnPause: document.getElementById('btn-pause'),
            btnHangar: document.getElementById('btn-hangar'),
            bgCanvas: document.getElementById('bg-canvas'),
            bgLayer: document.getElementById('bg-layer'),
            selectedPrincessKey: 'princess_pink'
        };

        // Carga iconos de botones
        this._setButtonIcons();

        // Event listeners
        this.el.btnSound.addEventListener('click', () => {
            AudioEngine.init();
            AudioEngine.resume();
            const on = AudioEngine.toggle();
            this._setButtonIcons();
            this.el.btnSound.classList.toggle('muted', !on);
        });
        this.el.btnPause.addEventListener('click', () => Game.togglePause());
        this.el.btnHangar.addEventListener('click', () => Game.openHangar());
        document.getElementById('btn-new').addEventListener('click', () => {
            AudioEngine.init();
            AudioEngine.resume();
            this.showSelectScreen();
        });
        document.getElementById('btn-resume').addEventListener('click', () => {
            AudioEngine.init();
            AudioEngine.resume();
            Game.loadGame();
        });
        document.getElementById('btn-hangar-start').addEventListener('click', () => {
            AudioEngine.init();
            AudioEngine.resume();
            Game.openHangar(true);
        });
        document.getElementById('btn-hangar-close').addEventListener('click', () => Game.closeHangar());
        document.getElementById('btn-resume-game').addEventListener('click', () => Game.togglePause());
        document.getElementById('btn-to-hangar').addEventListener('click', () => Game.openHangar(true));
        document.getElementById('btn-quit').addEventListener('click', () => location.reload());
        document.getElementById('btn-next-level').addEventListener('click', () => Game.nextLevel());
        document.getElementById('btn-retry').addEventListener('click', () => location.reload());
        document.getElementById('btn-victory-restart').addEventListener('click', () => location.reload());
        // Selección de princesa
        document.getElementById('btn-select-back').addEventListener('click', () => {
            this.el.selectScreen.classList.add('hidden');
            this.el.startScreen.classList.remove('hidden');
        });
        document.getElementById('btn-select-confirm').addEventListener('click', () => {
            AudioEngine.uiClick();
            Game.startGame(this.el.selectedPrincessKey);
            // Mostrar tutorial en la primera partida
            if (!Storage.loadTutorialSeen()) {
                setTimeout(() => this.showTutorial(), 800);
            }
        });
        // Tutorial
        this._tutorialStep = 0;
        document.getElementById('btn-tut-next').addEventListener('click', () => {
            AudioEngine.uiClick();
            this.nextTutorialStep();
        });
    },

    /* Tutorial para niñas 6-9 años */
    showTutorial() {
        this._tutorialStep = 0;
        this._showTutorialStep();
    },

    _showTutorialStep() {
        const steps = [
            { title: '¡Hola!', icon: '👆', desc: 'Mueve el ratón o tu dedo para mover a tu princesa' },
            { title: '¡Dispara!', icon: '✨', desc: 'Tu princesa dispara sola. ¡Solo muévela para apuntar!' },
            { title: '¡Derrota al jefe!', icon: '👑', desc: 'Destruye enemigos y derrota al jefe del reino. ¡Tú puedes!' }
        ];
        const step = steps[this._tutorialStep];
        document.getElementById('tut-step').textContent = `Paso ${this._tutorialStep + 1} de ${steps.length}`;
        document.getElementById('tut-title').textContent = step.title;
        document.getElementById('tut-icon').textContent = step.icon;
        document.getElementById('tut-desc').textContent = step.desc;
        // Actualizar dots
        for (let i = 1; i <= 3; i++) {
            const dot = document.getElementById('dot-' + i);
            if (dot) dot.classList.toggle('active', i === this._tutorialStep + 1);
        }
        document.getElementById('tutorial-overlay').classList.remove('hidden');
    },

    nextTutorialStep() {
        this._tutorialStep++;
        if (this._tutorialStep >= 3) {
            document.getElementById('tutorial-overlay').classList.add('hidden');
            Storage.saveTutorialSeen();
        } else {
            this._showTutorialStep();
        }
    },

    /* Renderiza la pantalla de selección de princesa */
    renderPrincessSelect() {
        const grid = this.el.princessGrid;
        grid.innerHTML = '';
        const keys = Object.keys(PrincessDefs);
        // Elementales primero
        const elementalKeys = ['princess_ice', 'princess_fire', 'princess_lightning', 'princess_shadow', 'princess_light', 'princess_nature'];
        const orderedKeys = [...elementalKeys, ...keys.filter(k => !elementalKeys.includes(k))];

        orderedKeys.forEach(key => {
            const def = PrincessDefs[key];
            const isElemental = elementalKeys.includes(key);
            const card = document.createElement('div');
            card.className = 'princess-card' + (isElemental ? ' elemental' : '') + (key === this.el.selectedPrincessKey ? ' selected' : '');
            card.dataset.key = key;
            card.innerHTML = `<canvas width="80" height="100"></canvas><div class="pc-name">${def.name.split(' ')[0]}</div>`;
            grid.appendChild(card);

            // Dibujar imagen en canvas
            const canvas = card.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            if (ImageLoader.has(key)) {
                const img = ImageLoader.get(key);
                const aspect = img.width / img.height;
                let w = 80, h = 100;
                if (aspect > 0.8) { h = w / aspect; } else { w = h * aspect; }
                ctx.drawImage(img, (80 - w) / 2, (100 - h) / 2, w, h);
                // Glow elemental
                if (isElemental) {
                    ctx.shadowColor = def.glowColor;
                    ctx.shadowBlur = 12;
                    ctx.strokeStyle = def.glowColor;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(2, 2, 76, 96);
                }
            } else {
                // Placeholder
                ctx.fillStyle = def.glowColor;
                ctx.beginPath();
                ctx.arc(40, 50, 25, 0, Math.PI * 2);
                ctx.fill();
            }

            card.addEventListener('click', () => {
                AudioEngine.uiClick();
                this.el.selectedPrincessKey = key;
                // Actualizar selección visual
                grid.querySelectorAll('.princess-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                // Actualizar info
                this.el.piName.textContent = def.name;
                this.el.piTitle.textContent = def.title;
                this.el.piDesc.textContent = def.desc;
                this.el.piPassive.textContent = '✦ Pasivo: ' + def.passive;
            });
        });

        // Seleccionar la primera por defecto y mostrar info
        const def = PrincessDefs[this.el.selectedPrincessKey];
        this.el.piName.textContent = def.name;
        this.el.piTitle.textContent = def.title;
        this.el.piDesc.textContent = def.desc;
        this.el.piPassive.textContent = '✦ Pasivo: ' + def.passive;
    },

    showSelectScreen() {
        this.el.startScreen.classList.add('hidden');
        this.el.selectScreen.classList.remove('hidden');
        this.renderPrincessSelect();
    },

    _setButtonIcons() {
        this.el.btnSound.innerHTML = '<span class="btn-icon ' + (AudioEngine.on ? 'icon-sound-on' : 'icon-sound-off') + '"></span>';
        this.el.btnPause.innerHTML = '<span class="btn-icon icon-pause"></span>';
        this.el.btnHangar.innerHTML = '<span class="btn-icon icon-hangar"></span>';
    },

    updateHUD() {
        const state = Game.state;
        if (!state) return;
        this.el.hudScore.textContent = state.score.toLocaleString();
        this.el.hudLives.textContent = state.hero.lives;
        this.el.hudCoins.textContent = state.coins.toLocaleString();

        // Iconos de vidas
        let icons = '';
        for (let i = 0; i < state.hero.lives; i++) icons += '<span class="lives-icon"></span>';
        this.el.livesIcons.innerHTML = icons;

        // Combo badge
        if (state.hero.combo >= 3) {
            this.el.comboBadge.classList.remove('hidden');
            this.el.comboCount.textContent = state.hero.combo;
            const labels = ['', '', '', 'COMBO', 'BUENO', 'GENIAL', 'IMPACTO', 'ARROYO', 'TORMENTA', 'FURIA', 'ÉPICO', 'LENDARIO'];
            this.el.comboLabel.textContent = labels[Math.min(state.hero.combo, labels.length - 1)] || 'INFINITO';
        } else {
            this.el.comboBadge.classList.add('hidden');
        }

        // Barra de progreso
        const level = LEVELS[state.levelIdx];
        const target = level.target;
        const progress = Math.min((state.score - state.levelStartScore) / (target - state.levelStartScore), 1);
        this.el.progFill.style.width = (progress * 100) + '%';
        this.el.progLabel.textContent = (state.score - state.levelStartScore) + ' / ' + (target - state.levelStartScore);

        // Shelf de poderes
        this._renderPowerShelf(state);
    },

    _renderPowerShelf(state) {
        const map = {
            triple: { icon: 'triple', color: '#6ef0ff' },
            shield: { icon: 'shield', color: '#6ef0ff' },
            kiss: { icon: 'kiss', color: '#ff6ec7' },
            rose: { icon: 'rose', color: '#ff0066' },
            speed: { icon: 'speed', color: '#ffff00' }
        };
        let html = '';
        for (let p in map) {
            if (state.hero.powers[p] > 0) {
                const sec = Math.ceil(state.hero.powers[p] / 60);
                html += `<div class="power-box"><canvas width="56" height="56" data-power="${p}"></canvas><div class="timer-label">${sec}s</div></div>`;
            }
        }
        this.el.powerShelf.innerHTML = html;
        // Dibujar iconos en canvas
        this.el.powerShelf.querySelectorAll('canvas').forEach(c => {
            const ctx = c.getContext('2d');
            ctx.clearRect(0, 0, 56, 56);
            ctx.save();
            ctx.translate(28, 28);
            ctx.scale(1.4, 1.4);
            Assets.drawPowerUp(ctx, 0, 0, c.dataset.power, Game.state.frames);
            ctx.restore();
        });
    },

    setLevel(level) {
        this.el.hudLevelname.textContent = level.n;
        this.el.hudSub.textContent = level.story;
    },

    showMotivation(text) {
        this.el.motivationText.textContent = text;
        this.el.motivationText.style.opacity = 1;
        clearTimeout(this._motivTimer);
        this._motivTimer = setTimeout(() => {
            this.el.motivationText.style.opacity = 0;
        }, 1800);
    },

    showBossUI(name, special) {
        this.el.bossUI.classList.remove('hidden');
        this.el.bossName.textContent = name;
        this.el.bossSpecial.textContent = special;
    },

    hideBossUI() {
        this.el.bossUI.classList.add('hidden');
    },

    updateBossHp(ratio) {
        this.el.bossHp.style.width = (ratio * 100) + '%';
    },

    showBossCast(text) {
        this.el.bossCast.textContent = text;
        this.el.bossCast.classList.add('show');
        clearTimeout(this._castTimer);
        this._castTimer = setTimeout(() => {
            this.el.bossCast.classList.remove('show');
        }, 1500);
    },

    showScreen(name) {
        const screens = ['start', 'hangar', 'pause', 'levelClear', 'gameOver', 'victory'];
        screens.forEach(s => {
            const el = document.getElementById(s + '-screen') || document.getElementById(s === 'gameOver' ? 'game-over' : (s === 'levelClear' ? 'level-clear-screen' : s + '-screen'));
            if (el) el.classList.add('hidden');
        });
        if (name === 'start') this.el.startScreen.classList.remove('hidden');
        else if (name === 'hangar') this.el.hangarScreen.classList.remove('hidden');
        else if (name === 'pause') this.el.pauseScreen.classList.remove('hidden');
        else if (name === 'levelClear') this.el.levelClearScreen.classList.remove('hidden');
        else if (name === 'gameOver') this.el.gameOverScreen.classList.remove('hidden');
        else if (name === 'victory') this.el.victoryScreen.classList.remove('hidden');
    },

    hideAllScreens() {
        this.el.startScreen.classList.add('hidden');
        this.el.selectScreen.classList.add('hidden');
        this.el.hangarScreen.classList.add('hidden');
        this.el.pauseScreen.classList.add('hidden');
        this.el.levelClearScreen.classList.add('hidden');
        this.el.gameOverScreen.classList.add('hidden');
        this.el.victoryScreen.classList.add('hidden');
    },

    updateRanking() {
        const rank = Storage.getRank();
        const buildHTML = (title) => {
            if (rank.length === 0) return `<div class="rank-title">${title}</div><div style="opacity:0.6;">¡Sé la primera heroína!</div>`;
            const rows = rank.slice(0, 5).map((s, i) => `<div class="rank-row"><span><span class="rank-pos">${i + 1}.</span> ${s.n}</span><span class="rank-score">${s.s.toLocaleString()}</span></div>`).join('');
            return `<div class="rank-title">${title}</div>${rows}`;
        };
        this.el.rankStart.innerHTML = buildHTML('TOP 5 HEROÍNAS');
        this.el.rankEnd.innerHTML = buildHTML('RANKING FINAL');
        this.el.rankVictory.innerHTML = buildHTML('LEYENDAS ESTELARES');
        if (Storage.hasSave()) this.el.resumeBtn.classList.remove('hidden');
    },

    renderHangar() {
        const state = Game.state;
        this.el.hangarCoins.textContent = state.coins.toLocaleString();
        let html = '';
        // Renderizar por categorías
        for (let cat of Hangar.categories) {
            const upgrades = Hangar.upgrades.filter(u => u.category === cat.id);
            if (upgrades.length === 0) continue;
            html += `<div class="hangar-category" style="border-color: ${cat.color};">`;
            html += `<div class="hangar-cat-title" style="color: ${cat.color};">${cat.name}</div>`;
            html += '<div class="hangar-cat-grid">';
            for (let up of upgrades) {
                const level = state.upgrades[up.id] || 0;
                const maxed = level >= up.maxLevel;
                const cost = Hangar.getCost(up, level);
                const canBuy = !maxed && state.coins >= cost;
                const classes = ['hangar-card'];
                if (maxed) classes.push('maxed');
                else if (!canBuy) classes.push('locked');
                const pct = (level / up.maxLevel) * 100;
                html += `<div class="${classes.join(' ')}" data-id="${up.id}" style="border-color: ${maxed ? '#FFD700' : (canBuy ? cat.color : 'rgba(255,255,255,0.2)')};">
                    <canvas width="60" height="60"></canvas>
                    <div class="hc-name">${up.name}</div>
                    <div class="hc-desc">${up.desc}</div>
                    <div class="hc-progress"><div class="hc-progress-fill" style="width: ${pct}%; background: ${cat.color};"></div></div>
                    <div class="hc-level">Nivel ${level} / ${up.maxLevel}</div>
                    <div class="hc-cost ${canBuy ? '' : 'cant'}">${maxed ? 'MÁXIMO' : `<span class="coin-icon"></span> ${cost}`}</div>
                </div>`;
            }
            html += '</div></div>';
        }
        this.el.hangarGrid.innerHTML = html;
        // Dibujar iconos
        this.el.hangarGrid.querySelectorAll('.hangar-card').forEach(card => {
            const canvas = card.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 60, 60);
            ctx.save();
            ctx.translate(30, 30);
            const up = Hangar.upgrades.find(u => u.id === card.dataset.id);
            if (up) up.draw(ctx);
            ctx.restore();
            // Click
            card.addEventListener('click', () => {
                Hangar.buy(card.dataset.id);
            });
            // Hover
            card.addEventListener('mouseenter', () => {
                AudioEngine.uiHover();
            });
        });
    },

    addComboChip(name) {
        const div = document.createElement('div');
        div.className = 'combo-chip';
        div.dataset.name = name;
        div.textContent = name;
        this.el.comboStack.appendChild(div);
    },

    removeComboChip(id) {
        // No implementado por ID - se limpia todo
    },

    clearComboChips() {
        this.el.comboStack.innerHTML = '';
    },

    showRewards(rewards) {
        this.el.rewardBox.innerHTML = `
            <div class="reward-title">${rewards.prize.name}</div>
            <div style="font-size:0.85rem; opacity:0.8; margin-bottom:8px;">${rewards.prize.desc}</div>
            <div class="reward-row"><span>Reino:</span> <span class="reward-amount">${rewards.levelName}</span></div>
            <div class="reward-row"><span>Jefe derrotado:</span> <span class="reward-amount">${rewards.bossName}</span></div>
            <div class="reward-row"><span>Monedas:</span> <span class="reward-amount">+${rewards.coins}</span></div>
            <div class="reward-row"><span>Puntaje:</span> <span class="reward-amount">+${rewards.scoreBonus.toLocaleString()}</span></div>
        `;
    }
};

window.UI = UI;
