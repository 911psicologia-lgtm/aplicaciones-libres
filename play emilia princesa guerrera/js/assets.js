/* ============================================================
   ASSETS - Sprites dibujados en canvas + imágenes reales
   Usa imágenes cuando estén disponibles, fallback a canvas
   ============================================================ */

const Assets = {
    /* Mapeo de tipos de enemigo a imágenes de criaturas */
    creatureImageMap: {
        slime: 'creature_01',
        bee: 'creature_02',
        butterfly: 'creature_03',
        fireImp: 'creature_04',
        iceGolem: 'creature_05',
        robot: 'creature_06',
        cookie: 'creature_07',
        octopus: 'creature_08',
        fish: 'creature_09',
        scorpion: 'creature_01',
        tiger: 'creature_02',
        ghost: 'creature_03',
        skull: 'creature_04',
        cloud: 'creature_05',
        alien: 'creature_06',
        rose: 'creature_07',
        gem: 'creature_08',
        sun: 'creature_09',
        dragon: 'creature_01',
        croc: 'creature_02',
        teddy: 'creature_03',
        crystal: 'creature_04',
        darkling: 'creature_05'
    },

    /* ============ HEROÍNA: PRINCESA EMILIA (con imagen real + movilidad) ============ */
    drawHeroine(ctx, x, y, size, t = 0, invuln = false, princessKey = null, state = null) {
        // Usa imagen real si está disponible
        const key = princessKey || 'princess_pink';
        const def = state && state.hero && state.hero.princessDef ? state.hero.princessDef : null;
        const auraColor = def ? def.auraColor : 'rgba(255, 200, 240, 0.6)';
        const glowColor = def ? def.glowColor : '#ff00cc';
        const bulletColor = def ? def.bulletColor : '#ff9ed6';

        if (ImageLoader.has(key)) {
            ctx.save();

            // Animación de respiración (escala sutil)
            const breathe = 1 + Math.sin(t * 0.08) * 0.03;

            // Tilt al moverse (basado en velocidad horizontal)
            let tilt = 0;
            if (state && state.hero) {
                const dx = state.input.x - state.hero.x;
                tilt = Math.max(-0.2, Math.min(0.2, dx * 0.002));
            }

            // Offset de "andar" (sutil bobbing)
            const bob = Math.sin(t * 0.15) * 2;

            // Estado de expresión (basado en combo y vida)
            let expression = 'normal'; // normal | happy | angry | hurt | excited
            if (state && state.hero) {
                if (state.hero.invuln > 0) expression = 'hurt';
                else if (state.hero.combo >= 20) expression = 'excited';
                else if (state.hero.combo >= 5) expression = 'happy';
                else if (state.hero.lives <= 1) expression = 'angry';
            }

            ctx.translate(x, y + bob);
            ctx.rotate(tilt);
            ctx.scale(breathe, breathe);

            // Aura mágica detrás
            const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, size * 0.9);
            auraGrad.addColorStop(0, auraColor);
            auraGrad.addColorStop(0.5, auraColor.replace(/[\d.]+\)$/, '0.3)'));
            auraGrad.addColorStop(1, auraColor.replace(/[\d.]+\)$/, '0)'));
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
            ctx.fill();

            // Halo de combo (animado, más intenso con combos altos)
            if (state && state.hero && state.hero.combo >= 5) {
                const comboIntensity = Math.min(state.hero.combo / 30, 1);
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + comboIntensity * 0.4})`;
                ctx.lineWidth = 2 + comboIntensity * 2;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10 + comboIntensity * 15;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
                // Anillos orbitantes para combos altos
                if (state.hero.combo >= 15) {
                    for (let i = 0; i < 3; i++) {
                        const a = t * 0.05 + (i / 3) * Math.PI * 2;
                        const rx = Math.cos(a) * size * 0.8;
                        const ry = Math.sin(a) * size * 0.4;
                        ctx.fillStyle = `hsl(${(t * 4 + i * 60) % 360}, 100%, 70%)`;
                        ctx.shadowColor = ctx.fillStyle;
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        ctx.arc(rx, ry, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.shadowBlur = 0;
                }
            }

            // Imagen de la princesa con glow mágico
            if (invuln && Math.floor(t / 5) % 2 === 0) {
                ctx.globalAlpha = 0.4;
            }
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 20;
            const img = ImageLoader.get(key);
            const aspect = img.height / img.width;
            const w = size * 1.1;
            const h = w * aspect;

            // Efecto de expresión: ligero temblor si está herida
            let shakeX = 0, shakeY = 0;
            if (expression === 'hurt' && state.hero.invuln > 60) {
                shakeX = (Math.random() - 0.5) * 3;
                shakeY = (Math.random() - 0.5) * 3;
            }
            // Zoom de excitación
            let extraScale = 1;
            if (expression === 'excited') {
                extraScale = 1 + Math.sin(t * 0.4) * 0.04;
            }
            ctx.scale(extraScale, extraScale);
            ctx.drawImage(img, -w / 2 + shakeX, -h / 2 - size * 0.1 + shakeY, w, h);
            ctx.shadowBlur = 0;

            // Estrella orbitante (varita mágica)
            const ang = t * 0.05;
            const sx = Math.cos(ang) * size * 0.6;
            const sy = -size * 0.3 + Math.sin(ang) * size * 0.3;
            ctx.fillStyle = `hsl(${(t * 4) % 360}, 100%, 70%)`;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 15;
            this._drawStar(ctx, sx, sy, 5, 6, 3);
            ctx.shadowBlur = 0;

            // Estrellas adicionales para combos altos
            if (state && state.hero && state.hero.combo >= 10) {
                for (let i = 0; i < 2; i++) {
                    const a = -ang + i * Math.PI;
                    const r = size * 0.7;
                    ctx.fillStyle = '#FFD700';
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 10;
                    this._drawStar(ctx, Math.cos(a) * r, Math.sin(a) * r, 5, 4, 2);
                    ctx.shadowBlur = 0;
                }
            }

            // Líneas de velocidad cuando se mueve rápido
            if (state && state.hero) {
                const dx = state.input.x - state.hero.x;
                const dy = state.input.y - state.hero.y;
                const speed = Math.hypot(dx, dy);
                if (speed > 50) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(speed / 200, 0.6)})`;
                    ctx.lineWidth = 1.5;
                    for (let i = 0; i < 3; i++) {
                        ctx.beginPath();
                        ctx.moveTo(-size * 0.5 - i * 5, -size * 0.2 + i * 8);
                        ctx.lineTo(-size * 0.9 - i * 8, -size * 0.2 + i * 8);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(size * 0.5 + i * 5, -size * 0.2 + i * 8);
                        ctx.lineTo(size * 0.9 + i * 8, -size * 0.2 + i * 8);
                        ctx.stroke();
                    }
                }
            }

            ctx.restore();
            return;
        }

        // Fallback al método canvas original
        this._drawHeroineCanvas(ctx, x, y, size, t, invuln);
    },

    /* Método canvas original (fallback si no hay imagen) */
    _drawHeroineCanvas(ctx, x, y, size, t = 0, invuln = false) {
        ctx.save();
        ctx.translate(x, y);
        const s = size / 60;
        ctx.scale(s, s);

        // Aura mágica
        const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 50);
        auraGrad.addColorStop(0, 'rgba(255, 200, 240, 0.5)');
        auraGrad.addColorStop(1, 'rgba(255, 105, 180, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();

        if (invuln && Math.floor(t / 5) % 2 === 0) {
            ctx.globalAlpha = 0.4;
        }

        // Vestido (triángulo)
        const dressGrad = ctx.createLinearGradient(0, 0, 0, 40);
        dressGrad.addColorStop(0, '#ff6ec7');
        dressGrad.addColorStop(1, '#a020f0');
        ctx.fillStyle = dressGrad;
        ctx.beginPath();
        ctx.moveTo(-22, 5);
        ctx.lineTo(22, 5);
        ctx.lineTo(30, 38);
        ctx.lineTo(-30, 38);
        ctx.closePath();
        ctx.fill();

        // Detalles del vestido (líneas doradas)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-15, 15);
        ctx.lineTo(15, 15);
        ctx.moveTo(-20, 25);
        ctx.lineTo(20, 25);
        ctx.stroke();

        // Brazos
        ctx.fillStyle = '#ffdfc4';
        ctx.beginPath();
        ctx.arc(-26, 10, 5, 0, Math.PI * 2);
        ctx.arc(26, 10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Cabeza
        ctx.fillStyle = '#ffdfc4';
        ctx.beginPath();
        ctx.arc(0, -8, 13, 0, Math.PI * 2);
        ctx.fill();

        // Cabello (dorado)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, -10, 14, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-10, -5, 5, 12, 0.3, 0, Math.PI * 2);
        ctx.ellipse(10, -5, 5, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Corona
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-10, -22);
        ctx.lineTo(-10, -18);
        ctx.lineTo(10, -18);
        ctx.lineTo(10, -22);
        ctx.lineTo(7, -15);
        ctx.lineTo(3, -22);
        ctx.lineTo(0, -15);
        ctx.lineTo(-3, -22);
        ctx.lineTo(-7, -15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Joya de la corona
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(0, -19, 2, 0, Math.PI * 2);
        ctx.fill();

        // Ojos
        ctx.fillStyle = '#1a0050';
        ctx.beginPath();
        ctx.arc(-4, -7, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -7, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Mejillas sonrosadas
        ctx.fillStyle = 'rgba(255, 105, 180, 0.5)';
        ctx.beginPath();
        ctx.arc(-7, -3, 2.5, 0, Math.PI * 2);
        ctx.arc(7, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Sonrisa
        ctx.strokeStyle = '#cc0066';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, -3, 3, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Varita mágica (con animación de partícula)
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(28, 10);
        ctx.lineTo(38, -10);
        ctx.stroke();
        // Estrella de la varita
        ctx.fillStyle = `hsl(${(t * 4) % 360}, 100%, 70%)`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        this._drawStar(ctx, 38, -10, 5, 5, 2);
        ctx.shadowBlur = 0;

        ctx.restore();
    },

    _drawStar(ctx, cx, cy, spikes, outer, inner) {
        let rot = -Math.PI / 2;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outer);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
            rot += step;
        }
        ctx.closePath();
        ctx.fill();
    },

    /* ============ BULLET: ORBE MÁGICO (con tipos elementales) ============ */
    drawBullet(ctx, x, y, type, t = 0) {
        ctx.save();
        ctx.translate(x, y);

        const palettes = {
            NORMAL: { core: '#ffffff', mid: '#6ef0ff', out: '#0066ff' },
            TRIPLE: { core: '#ffffff', mid: '#ff9ed6', out: '#ff00cc' },
            KISS:   { core: '#ffffff', mid: '#ff6ec7', out: '#ff0066' },
            ROSE:   { core: '#ffffff', mid: '#ff6699', out: '#cc0033' },
            LASER:  { core: '#ffffff', mid: '#ffff00', out: '#ff6600' },
            PIERCE: { core: '#ffffff', mid: '#aaff00', out: '#006600' },
            BOMB:   { core: '#ffffff', mid: '#ffaa00', out: '#ff3300' },
            ENEMY:  { core: '#ff8888', mid: '#ff0033', out: '#660000' },
            BOSS:   { core: '#ffaa00', mid: '#ff3300', out: '#330000' },
            // Nuevos tipos elementales
            ICE:        { core: '#ffffff', mid: '#aaffff', out: '#0066cc' },
            FIRE:       { core: '#ffffff', mid: '#ffaa00', out: '#cc0000' },
            LIGHTNING:  { core: '#ffffff', mid: '#ffff66', out: '#ffaa00' },
            SHADOW:     { core: '#cc99ff', mid: '#660099', out: '#1a0010' },
            LIGHT:      { core: '#ffffff', mid: '#ffffcc', out: '#FFD700' },
            NATURE:     { core: '#ffffff', mid: '#88ff66', out: '#336600' }
        };
        const p = palettes[type] || palettes.NORMAL;

        ctx.shadowColor = p.out;
        ctx.shadowBlur = 16;

        // Halo exterior
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        grad.addColorStop(0, p.core);
        grad.addColorStop(0.4, p.mid);
        grad.addColorStop(1, p.out);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo brillante
        ctx.shadowBlur = 0;
        ctx.fillStyle = p.core;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Estela para tipos especiales
        if (type === 'KISS') {
            ctx.fillStyle = 'rgba(255, 105, 180, 0.7)';
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.bezierCurveTo(-6, -8, -10, 0, 0, 6);
            ctx.bezierCurveTo(10, 0, 6, -8, 0, -3);
            ctx.fill();
        } else if (type === 'ROSE') {
            // Pétalos alrededor
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2 + t * 0.1;
                ctx.fillStyle = 'rgba(255, 102, 153, 0.6)';
                ctx.beginPath();
                ctx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 3, 2, a, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === 'LASER') {
            // Rayo elongado
            ctx.fillStyle = p.mid;
            ctx.fillRect(-3, -14, 6, 28);
        } else if (type === 'PIERCE') {
            // Pica afilada
            ctx.fillStyle = p.mid;
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(4, 0);
            ctx.lineTo(0, 12);
            ctx.lineTo(-4, 0);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'BOMB') {
            // Mecha
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.stroke();
        } else if (type === 'ENEMY' || type === 'BOSS') {
            // Punta triangular
            ctx.fillStyle = p.out;
            ctx.beginPath();
            ctx.moveTo(0, 8);
            ctx.lineTo(-4, 12);
            ctx.lineTo(4, 12);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'ICE') {
            // COPOR DE NIEVE - 6 brazos
            ctx.strokeStyle = p.core;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = p.mid;
            ctx.shadowBlur = 8;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + t * 0.05;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
                ctx.stroke();
                // Ramas
                const bx = Math.cos(a) * 6, by = Math.sin(a) * 6;
                const a1 = a + 0.5, a2 = a - 0.5;
                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + Math.cos(a1) * 3, by + Math.sin(a1) * 3);
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + Math.cos(a2) * 3, by + Math.sin(a2) * 3);
                ctx.stroke();
            }
        } else if (type === 'FIRE') {
            // LLAMA - animada
            const flame = Math.sin(t * 0.4) * 0.2 + 1;
            ctx.fillStyle = p.mid;
            ctx.beginPath();
            ctx.moveTo(0, -12 * flame);
            ctx.bezierCurveTo(-6, -6, -6, 4, 0, 8);
            ctx.bezierCurveTo(6, 4, 6, -6, 0, -12 * flame);
            ctx.fill();
            ctx.fillStyle = p.core;
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'LIGHTNING') {
            // RAYO en zigzag
            ctx.strokeStyle = p.core;
            ctx.lineWidth = 2;
            ctx.shadowColor = p.mid;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(2, -4);
            ctx.lineTo(-2, 0);
            ctx.lineTo(2, 4);
            ctx.lineTo(0, 12);
            ctx.stroke();
        } else if (type === 'SHADOW') {
            // SOMBRA - forma irregular
            ctx.fillStyle = p.mid;
            ctx.shadowColor = p.out;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            const points = 7;
            for (let i = 0; i < points; i++) {
                const a = (i / points) * Math.PI * 2 + t * 0.08;
                const r = 8 + Math.sin(t * 0.2 + i) * 2;
                const px = Math.cos(a) * r, py = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        } else if (type === 'LIGHT') {
            // RAYO DE LUZ - estrella brillante
            ctx.fillStyle = p.core;
            ctx.shadowColor = p.mid;
            ctx.shadowBlur = 15;
            this._drawStar(ctx, 0, 0, 6, 9, 4);
            // Rayos largos
            ctx.strokeStyle = p.core;
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const a = (i / 4) * Math.PI * 2 + t * 0.03;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5);
                ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
                ctx.stroke();
            }
        } else if (type === 'NATURE') {
            // ESPORA - hoja
            ctx.fillStyle = p.mid;
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 4, t * 0.1, 0, Math.PI * 2);
            ctx.fill();
            // Esporas pequeñas
            for (let i = 0; i < 3; i++) {
                const a = t * 0.1 + i * 2.1;
                ctx.fillStyle = p.core;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * 6, Math.sin(a) * 6, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    },

    /* ============ ENEMIGOS GENÉRICOS (con imágenes reales) ============ */
    drawEnemy(ctx, x, y, type, size, t = 0, hpRatio = 1) {
        // Usa imagen de criatura si está disponible
        const imgKey = this.creatureImageMap[type];
        if (imgKey && ImageLoader.has(imgKey)) {
            ctx.save();
            // Sombra
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(x, y + size * 0.5, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();

            // Glow temático
            const glowColors = {
                slime: '#88ff99', bee: '#ffcc66', butterfly: '#ff66cc',
                fireImp: '#ff6600', iceGolem: '#6ef0ff', robot: '#ff00cc',
                cookie: '#d2691e', octopus: '#66ccff', fish: '#ff6600',
                scorpion: '#aa6633', tiger: '#ffaa33', ghost: '#aaaaff',
                skull: '#ffffff', cloud: '#ffffff', alien: '#88ff66',
                rose: '#ff3366', gem: '#00ffff', sun: '#ffaa00',
                dragon: '#33aa33', croc: '#4a7c2a', teddy: '#c8865c',
                crystal: '#aaccff', darkling: '#ff0033'
            };
            const glow = glowColors[type] || '#ffffff';
            ctx.shadowColor = glow;
            ctx.shadowBlur = 12;
            
            // Animación de flotación
            const float = Math.sin(t * 0.1) * size * 0.05;
            
            const img = ImageLoader.get(imgKey);
            const aspect = img.height / img.width;
            const w = size;
            const h = w * aspect;
            ctx.drawImage(img, x - w / 2, y - h / 2 + float, w, h);
            ctx.shadowBlur = 0;

            // Barra de vida
            if (hpRatio < 1) {
                const bw = size * 0.7;
                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(x - bw / 2, y - size * 0.6, bw, 4);
                ctx.fillStyle = hpRatio > 0.5 ? '#00ff66' : (hpRatio > 0.25 ? '#ffaa00' : '#ff0033');
                ctx.fillRect(x - bw / 2, y - size * 0.6, bw * hpRatio, 4);
            }
            ctx.restore();
            return;
        }

        // Fallback al método canvas original
        this._drawEnemyCanvas(ctx, x, y, type, size, t, hpRatio);
    },

    _drawEnemyCanvas(ctx, x, y, type, size, t = 0, hpRatio = 1) {
        ctx.save();
        ctx.translate(x, y);

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, size * 0.5, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        const drawer = this._enemies[type] || this._enemies.slime;
        drawer.call(this, ctx, size, t);

        // Barra de vida
        if (hpRatio < 1) {
            const w = size * 0.7;
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(-w / 2, -size * 0.6, w, 4);
            ctx.fillStyle = hpRatio > 0.5 ? '#00ff66' : (hpRatio > 0.25 ? '#ffaa00' : '#ff0033');
            ctx.fillRect(-w / 2, -size * 0.6, w * hpRatio, 4);
        }

        ctx.restore();
    },

    _enemies: {
        // Slime del Reino Slime
        slime(ctx, s, t) {
            const wobble = Math.sin(t * 0.1) * 2;
            const grad = ctx.createRadialGradient(0, -5, 5, 0, 0, s * 0.5);
            grad.addColorStop(0, '#a8f8c8');
            grad.addColorStop(1, '#2a8055');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.45, s * 0.35 + wobble, 0, 0, Math.PI * 2);
            ctx.fill();
            // Brillo
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.ellipse(-s * 0.15, -s * 0.15, s * 0.1, s * 0.06, 0, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.12, 0, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.12, 0, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            // Boca
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, s * 0.1, s * 0.08, 0.2, Math.PI - 0.2);
            ctx.stroke();
        },

        // Abeja del Bosque Dulce
        bee(ctx, s, t) {
            const wing = Math.sin(t * 0.5) * 0.3 + 0.7;
            // Alas
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.ellipse(-s * 0.25, -s * 0.25, s * 0.2, s * 0.1 * wing, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(s * 0.25, -s * 0.25, s * 0.2, s * 0.1 * wing, 0.5, 0, Math.PI * 2);
            ctx.fill();
            // Cuerpo
            const grad = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.3);
            grad.addColorStop(0, '#FFD700');
            grad.addColorStop(1, '#b8860b');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.3, s * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Rayas
            ctx.fillStyle = '#000';
            for (let i = -1; i <= 1; i++) {
                ctx.fillRect(-s * 0.28, i * s * 0.13, s * 0.56, s * 0.05);
            }
            // Ojos
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.2, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.2, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            // Aguijón
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(0, s * 0.4);
            ctx.lineTo(-s * 0.05, s * 0.5);
            ctx.lineTo(s * 0.05, s * 0.5);
            ctx.closePath();
            ctx.fill();
        },

        // Mariposa
        butterfly(ctx, s, t) {
            const flap = Math.sin(t * 0.3) * 0.4 + 0.6;
            // Alas
            for (let side of [-1, 1]) {
                const grad = ctx.createRadialGradient(side * s * 0.2, -s * 0.1, 2, side * s * 0.25, 0, s * 0.35);
                grad.addColorStop(0, '#ff9ed6');
                grad.addColorStop(0.5, '#ff00cc');
                grad.addColorStop(1, '#660066');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(side * s * 0.25 * flap, -s * 0.15, s * 0.25, s * 0.2, side * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(side * s * 0.25 * flap, s * 0.15, s * 0.2, s * 0.15, side * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            // Cuerpo
            ctx.fillStyle = '#2a0050';
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.05, s * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
        },

        // Imp de fuego
        fireImp(ctx, s, t) {
            const flicker = Math.sin(t * 0.4) * 0.1 + 0.9;
            // Llama
            const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, s * 0.5);
            grad.addColorStop(0, '#ffff00');
            grad.addColorStop(0.5, '#ff6600');
            grad.addColorStop(1, '#cc0000');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.45 * flicker);
            ctx.bezierCurveTo(-s * 0.3, -s * 0.2, -s * 0.35, s * 0.2, 0, s * 0.4);
            ctx.bezierCurveTo(s * 0.35, s * 0.2, s * 0.3, -s * 0.2, 0, -s * 0.45 * flicker);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-s * 0.1, 0, s * 0.06, 0, Math.PI * 2);
            ctx.arc(s * 0.1, 0, s * 0.06, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.1, 0, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.1, 0, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
            // Boca
            ctx.strokeStyle = '#330000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-s * 0.08, s * 0.15);
            ctx.lineTo(0, s * 0.08);
            ctx.lineTo(s * 0.08, s * 0.15);
            ctx.stroke();
        },

        // Golem de hielo
        iceGolem(ctx, s, t) {
            const shimmer = Math.sin(t * 0.1) * 0.1 + 0.9;
            const grad = ctx.createLinearGradient(0, -s * 0.5, 0, s * 0.5);
            grad.addColorStop(0, '#e0f8ff');
            grad.addColorStop(0.5, '#6ef0ff');
            grad.addColorStop(1, '#0066aa');
            ctx.fillStyle = grad;
            // Cuerpo cuadrado
            ctx.fillRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.6);
            // Brillos
            ctx.fillStyle = `rgba(255,255,255,${0.4 * shimmer})`;
            ctx.fillRect(-s * 0.25, -s * 0.25, s * 0.1, s * 0.1);
            ctx.fillRect(s * 0.1, s * 0.05, s * 0.08, s * 0.08);
            // Ojos
            ctx.fillStyle = '#003355';
            ctx.fillRect(-s * 0.15, -s * 0.08, s * 0.08, s * 0.08);
            ctx.fillRect(s * 0.07, -s * 0.08, s * 0.08, s * 0.08);
            // Boca
            ctx.fillRect(-s * 0.1, s * 0.1, s * 0.2, s * 0.05);
        },

        // Robot
        robot(ctx, s, t) {
            const blink = (Math.floor(t / 30) % 4 === 0) ? 0.1 : 1;
            // Cabeza
            const grad = ctx.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
            grad.addColorStop(0, '#999');
            grad.addColorStop(1, '#444');
            ctx.fillStyle = grad;
            ctx.fillRect(-s * 0.3, -s * 0.35, s * 0.6, s * 0.7);
            // Pantalla
            ctx.fillStyle = '#000';
            ctx.fillRect(-s * 0.22, -s * 0.15, s * 0.44, s * 0.25);
            // Ojos LED
            ctx.fillStyle = `rgba(0, 255, 100, ${blink})`;
            ctx.fillRect(-s * 0.18, -s * 0.1, s * 0.12, s * 0.1);
            ctx.fillRect(s * 0.06, -s * 0.1, s * 0.12, s * 0.1);
            // Antena
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.35);
            ctx.lineTo(0, -s * 0.45);
            ctx.stroke();
            ctx.fillStyle = '#ff0033';
            ctx.beginPath();
            ctx.arc(0, -s * 0.45, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
            // Boca
            ctx.fillStyle = '#222';
            ctx.fillRect(-s * 0.15, s * 0.18, s * 0.3, s * 0.04);
        },

        // Cookie monster
        cookie(ctx, s, t) {
            const grad = ctx.createRadialGradient(0, -s * 0.1, 5, 0, 0, s * 0.5);
            grad.addColorStop(0, '#e8b870');
            grad.addColorStop(1, '#8b4513');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
            ctx.fill();
            // Chips de chocolate
            ctx.fillStyle = '#3a1a0a';
            const chips = [[-0.15, -0.1], [0.15, 0.05], [-0.05, 0.2], [0.2, -0.15], [-0.2, 0.15]];
            chips.forEach(([cx, cy]) => {
                ctx.beginPath();
                ctx.arc(cx * s, cy * s, s * 0.05, 0, Math.PI * 2);
                ctx.fill();
            });
            // Ojos
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.18, s * 0.07, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.18, s * 0.07, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.18, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.18, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
        },

        // Pulpo del océano
        octopus(ctx, s, t) {
            // Tentáculos
            ctx.strokeStyle = '#ff6ec7';
            ctx.lineWidth = s * 0.08;
            ctx.lineCap = 'round';
            for (let i = 0; i < 6; i++) {
                const a = (i / 6 - 0.5) * Math.PI;
                const wave = Math.sin(t * 0.1 + i) * s * 0.05;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * s * 0.2, Math.sin(a) * s * 0.2);
                ctx.quadraticCurveTo(
                    Math.cos(a) * s * 0.35, Math.sin(a) * s * 0.4 + wave,
                    Math.cos(a) * s * 0.45, Math.sin(a) * s * 0.5
                );
                ctx.stroke();
            }
            // Cabeza
            const grad = ctx.createRadialGradient(0, -s * 0.1, 5, 0, 0, s * 0.4);
            grad.addColorStop(0, '#ff9ed6');
            grad.addColorStop(1, '#a020f0');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.05, s * 0.07, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.05, s * 0.07, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.05, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.05, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
        },

        // Pez
        fish(ctx, s, t) {
            const tailWag = Math.sin(t * 0.3) * 0.2;
            const grad = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
            grad.addColorStop(0, '#ff6600');
            grad.addColorStop(1, '#ffaa00');
            ctx.fillStyle = grad;
            // Cuerpo
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.3, s * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cola
            ctx.beginPath();
            ctx.moveTo(s * 0.25, 0);
            ctx.lineTo(s * 0.45, -s * 0.15 + tailWag * s);
            ctx.lineTo(s * 0.45, s * 0.15 + tailWag * s);
            ctx.closePath();
            ctx.fill();
            // Ojo
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-s * 0.15, -s * 0.03, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.15, -s * 0.03, s * 0.02, 0, Math.PI * 2);
            ctx.fill();
        },

        // Escorpión
        scorpion(ctx, s, t) {
            const grad = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.3);
            grad.addColorStop(0, '#aa6633');
            grad.addColorStop(1, '#553311');
            ctx.fillStyle = grad;
            // Cuerpo
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.3, s * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pinzas
            ctx.strokeStyle = '#553311';
            ctx.lineWidth = s * 0.06;
            ctx.beginPath();
            ctx.moveTo(-s * 0.25, 0);
            ctx.lineTo(-s * 0.4, -s * 0.2);
            ctx.moveTo(-s * 0.25, 0);
            ctx.lineTo(-s * 0.4, s * 0.2);
            ctx.stroke();
            // Cola
            ctx.beginPath();
            ctx.moveTo(s * 0.25, 0);
            ctx.quadraticCurveTo(s * 0.45, -s * 0.2, s * 0.4, -s * 0.4);
            ctx.stroke();
            // Aguijón
            ctx.fillStyle = '#220';
            ctx.beginPath();
            ctx.arc(s * 0.4, -s * 0.4, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#ff0';
            ctx.fillRect(-s * 0.18, -s * 0.05, s * 0.04, s * 0.03);
            ctx.fillRect(-s * 0.05, -s * 0.05, s * 0.04, s * 0.03);
        },

        // Tigre
        tiger(ctx, s, t) {
            const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, s * 0.4);
            grad.addColorStop(0, '#ffaa33');
            grad.addColorStop(1, '#cc5500');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.32, 0, Math.PI * 2);
            ctx.fill();
            // Rayas
            ctx.strokeStyle = '#1a0a00';
            ctx.lineWidth = 2;
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(i * s * 0.1, -s * 0.3);
                ctx.lineTo(i * s * 0.1, -s * 0.1);
                ctx.stroke();
            }
            // Orejas
            ctx.fillStyle = '#cc5500';
            ctx.beginPath();
            ctx.moveTo(-s * 0.25, -s * 0.25);
            ctx.lineTo(-s * 0.15, -s * 0.4);
            ctx.lineTo(-s * 0.1, -s * 0.25);
            ctx.closePath();
            ctx.moveTo(s * 0.25, -s * 0.25);
            ctx.lineTo(s * 0.15, -s * 0.4);
            ctx.lineTo(s * 0.1, -s * 0.25);
            ctx.closePath();
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.05, s * 0.05, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.05, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.05, s * 0.02, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.05, s * 0.02, 0, Math.PI * 2);
            ctx.fill();
        },

        // Fantasma
        ghost(ctx, s, t) {
            const wave = Math.sin(t * 0.15) * s * 0.05;
            const grad = ctx.createRadialGradient(0, -s * 0.1, 5, 0, 0, s * 0.4);
            grad.addColorStop(0, 'rgba(255,255,255,0.9)');
            grad.addColorStop(1, 'rgba(180,200,255,0.6)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, -s * 0.05, s * 0.3, Math.PI, 0);
            ctx.lineTo(s * 0.3, s * 0.3 + wave);
            for (let i = 2; i >= -2; i--) {
                ctx.quadraticCurveTo(i * s * 0.15 + s * 0.075, s * 0.4, i * s * 0.15, s * 0.3);
            }
            ctx.closePath();
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(-s * 0.1, -s * 0.05, s * 0.05, s * 0.07, 0, 0, Math.PI * 2);
            ctx.ellipse(s * 0.1, -s * 0.05, s * 0.05, s * 0.07, 0, 0, Math.PI * 2);
            ctx.fill();
            // Boca
            ctx.beginPath();
            ctx.ellipse(0, s * 0.1, s * 0.06, s * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
        },

        // Calavera
        skull(ctx, s, t) {
            const grad = ctx.createRadialGradient(0, -s * 0.1, 5, 0, 0, s * 0.4);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, '#888');
            ctx.fillStyle = grad;
            // Cráneo
            ctx.beginPath();
            ctx.arc(0, -s * 0.05, s * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Mandíbula
            ctx.fillRect(-s * 0.2, s * 0.15, s * 0.4, s * 0.15);
            // Cuencas
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.12, -s * 0.05, s * 0.07, 0, Math.PI * 2);
            ctx.arc(s * 0.12, -s * 0.05, s * 0.07, 0, Math.PI * 2);
            ctx.fill();
            // Brillo rojo en los ojos
            ctx.fillStyle = '#ff0033';
            ctx.beginPath();
            ctx.arc(-s * 0.12, -s * 0.05, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.12, -s * 0.05, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
            // Dientes
            ctx.fillStyle = '#000';
            for (let i = -2; i <= 2; i++) {
                ctx.fillRect(i * s * 0.06 - s * 0.02, s * 0.16, s * 0.04, s * 0.1);
            }
        },

        // Nube
        cloud(ctx, s, t) {
            const wave = Math.sin(t * 0.1) * s * 0.03;
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.beginPath();
            ctx.arc(-s * 0.2, 0, s * 0.18, 0, Math.PI * 2);
            ctx.arc(0, -s * 0.1 + wave, s * 0.22, 0, Math.PI * 2);
            ctx.arc(s * 0.2, 0, s * 0.18, 0, Math.PI * 2);
            ctx.arc(0, s * 0.1, s * 0.18, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#336';
            ctx.beginPath();
            ctx.arc(-s * 0.08, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.08, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            // Sonrisa
            ctx.strokeStyle = '#336';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, s * 0.05, s * 0.06, 0.2, Math.PI - 0.2);
            ctx.stroke();
        },

        // Alien
        alien(ctx, s, t) {
            const grad = ctx.createRadialGradient(0, -s * 0.1, 5, 0, 0, s * 0.4);
            grad.addColorStop(0, '#88ff66');
            grad.addColorStop(1, '#336611');
            ctx.fillStyle = grad;
            // Cabeza grande
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.25, s * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            // Antenas
            ctx.strokeStyle = '#336611';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-s * 0.1, -s * 0.3);
            ctx.lineTo(-s * 0.15, -s * 0.4);
            ctx.moveTo(s * 0.1, -s * 0.3);
            ctx.lineTo(s * 0.15, -s * 0.4);
            ctx.stroke();
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(-s * 0.15, -s * 0.4, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.15, -s * 0.4, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            // Ojos grandes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(-s * 0.1, -s * 0.05, s * 0.06, s * 0.1, 0, 0, Math.PI * 2);
            ctx.ellipse(s * 0.1, -s * 0.05, s * 0.06, s * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
        },

        // Rosa con espinas
        rose(ctx, s, t) {
            // Tallo
            ctx.strokeStyle = '#2a5500';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, s * 0.3);
            ctx.lineTo(0, -s * 0.1);
            ctx.stroke();
            // Hoja
            ctx.fillStyle = '#336611';
            ctx.beginPath();
            ctx.ellipse(s * 0.1, s * 0.15, s * 0.1, s * 0.04, 0.5, 0, Math.PI * 2);
            ctx.fill();
            // Flor
            const grad = ctx.createRadialGradient(0, -s * 0.15, 2, 0, -s * 0.1, s * 0.25);
            grad.addColorStop(0, '#ff6699');
            grad.addColorStop(1, '#990033');
            ctx.fillStyle = grad;
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2 + t * 0.02;
                ctx.beginPath();
                ctx.ellipse(Math.cos(a) * s * 0.1, -s * 0.1 + Math.sin(a) * s * 0.1, s * 0.12, s * 0.08, a, 0, Math.PI * 2);
                ctx.fill();
            }
            // Centro
            ctx.fillStyle = '#660022';
            ctx.beginPath();
            ctx.arc(0, -s * 0.1, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
        },

        // Gema
        gem(ctx, s, t) {
            const sparkle = (Math.floor(t / 20) % 4 === 0) ? 1 : 0.7;
            const grad = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.3);
            grad.addColorStop(0, '#aaffff');
            grad.addColorStop(0.5, '#00cccc');
            grad.addColorStop(1, '#006666');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.3);
            ctx.lineTo(s * 0.25, -s * 0.1);
            ctx.lineTo(s * 0.18, s * 0.3);
            ctx.lineTo(-s * 0.18, s * 0.3);
            ctx.lineTo(-s * 0.25, -s * 0.1);
            ctx.closePath();
            ctx.fill();
            // Brillos
            ctx.strokeStyle = `rgba(255,255,255,${sparkle})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.3);
            ctx.lineTo(0, s * 0.3);
            ctx.moveTo(-s * 0.25, -s * 0.1);
            ctx.lineTo(s * 0.25, -s * 0.1);
            ctx.stroke();
        },

        // Sol
        sun(ctx, s, t) {
            // Rayos
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 3;
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2 + t * 0.02;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * s * 0.3, Math.sin(a) * s * 0.3);
                ctx.lineTo(Math.cos(a) * s * 0.4, Math.sin(a) * s * 0.4);
                ctx.stroke();
            }
            // Cuerpo
            const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, s * 0.3);
            grad.addColorStop(0, '#ffff66');
            grad.addColorStop(1, '#ff6600');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
            ctx.fill();
            // Cara
            ctx.fillStyle = '#cc4400';
            ctx.beginPath();
            ctx.arc(-s * 0.08, -s * 0.05, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.08, -s * 0.05, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#cc4400';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, s * 0.05, s * 0.08, 0.2, Math.PI - 0.2);
            ctx.stroke();
        },

        // Dragón
        dragon(ctx, s, t) {
            const wingFlap = Math.sin(t * 0.2) * 0.3;
            // Alas
            ctx.fillStyle = '#660033';
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.05);
            ctx.lineTo(-s * 0.4, -s * 0.3 - wingFlap * s);
            ctx.lineTo(-s * 0.25, 0);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.05);
            ctx.lineTo(s * 0.4, -s * 0.3 - wingFlap * s);
            ctx.lineTo(s * 0.25, 0);
            ctx.closePath();
            ctx.fill();
            // Cuerpo
            const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, s * 0.3);
            grad.addColorStop(0, '#33aa33');
            grad.addColorStop(1, '#003300');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.2, s * 0.28, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabeza
            ctx.beginPath();
            ctx.ellipse(0, -s * 0.2, s * 0.15, s * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cuernos
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(-s * 0.05, -s * 0.3);
            ctx.lineTo(-s * 0.08, -s * 0.4);
            ctx.lineTo(-s * 0.02, -s * 0.3);
            ctx.closePath();
            ctx.moveTo(s * 0.05, -s * 0.3);
            ctx.lineTo(s * 0.08, -s * 0.4);
            ctx.lineTo(s * 0.02, -s * 0.3);
            ctx.closePath();
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(-s * 0.05, -s * 0.2, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.05, -s * 0.2, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
        },

        // Cocodrilo
        croc(ctx, s, t) {
            const grad = ctx.createLinearGradient(0, -s * 0.2, 0, s * 0.2);
            grad.addColorStop(0, '#4a7c2a');
            grad.addColorStop(1, '#1a3300');
            ctx.fillStyle = grad;
            // Cuerpo
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.35, s * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            // Espinas
            ctx.fillStyle = '#1a3300';
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(i * s * 0.1 - s * 0.03, -s * 0.15);
                ctx.lineTo(i * s * 0.1, -s * 0.25);
                ctx.lineTo(i * s * 0.1 + s * 0.03, -s * 0.15);
                ctx.fill();
            }
            // Hocico
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(-s * 0.3, s * 0.05, s * 0.1, s * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            // Dientes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(-s * 0.35, s * 0.08);
            ctx.lineTo(-s * 0.32, s * 0.15);
            ctx.lineTo(-s * 0.29, s * 0.08);
            ctx.fill();
            // Ojo
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(-s * 0.11, -s * 0.07, s * 0.02, s * 0.04);
        },

        // Oso de peluche
        teddy(ctx, s, t) {
            // Cuerpo
            const grad = ctx.createRadialGradient(0, -s * 0.1, 5, 0, 0, s * 0.4);
            grad.addColorStop(0, '#c8865c');
            grad.addColorStop(1, '#6b3a1a');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Orejas
            ctx.beginPath();
            ctx.arc(-s * 0.2, -s * 0.25, s * 0.08, 0, Math.PI * 2);
            ctx.arc(s * 0.2, -s * 0.25, s * 0.08, 0, Math.PI * 2);
            ctx.fill();
            // Hocico
            ctx.fillStyle = '#e8c9a0';
            ctx.beginPath();
            ctx.ellipse(0, s * 0.05, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            // Nariz
            ctx.beginPath();
            ctx.arc(0, s * 0.02, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
            // Costuras
            ctx.strokeStyle = '#6b3a1a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-s * 0.3, s * 0.1);
            ctx.lineTo(s * 0.3, s * 0.1);
            ctx.stroke();
        },

        // Cristal
        crystal(ctx, s, t) {
            const sparkle = (Math.floor(t / 15) % 3 === 0) ? 1 : 0.6;
            ctx.fillStyle = `rgba(180, 220, 255, ${sparkle})`;
            ctx.strokeStyle = '#88aaff';
            ctx.lineWidth = 2;
            // Forma de cristal hexagonal
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.35);
            ctx.lineTo(s * 0.2, -s * 0.15);
            ctx.lineTo(s * 0.2, s * 0.15);
            ctx.lineTo(0, s * 0.35);
            ctx.lineTo(-s * 0.2, s * 0.15);
            ctx.lineTo(-s * 0.2, -s * 0.15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // Brillo interno
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.35);
            ctx.lineTo(s * 0.05, -s * 0.1);
            ctx.lineTo(-s * 0.05, -s * 0.1);
            ctx.closePath();
            ctx.fill();
        },

        // Esbirro genérico del jefe final
        darkling(ctx, s, t) {
            const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, s * 0.4);
            grad.addColorStop(0, '#660066');
            grad.addColorStop(1, '#1a0010');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Aura
            ctx.strokeStyle = `rgba(255, 0, 102, ${0.5 + Math.sin(t * 0.1) * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
            ctx.stroke();
            // Ojos
            ctx.fillStyle = '#ff0033';
            ctx.beginPath();
            ctx.arc(-s * 0.08, -s * 0.05, s * 0.05, 0, Math.PI * 2);
            ctx.arc(s * 0.08, -s * 0.05, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    /* ============ COFRE / PREMIO (con imagen real) ============ */
    drawChest(ctx, x, y, size, t = 0, open = false) {
        // Usa imagen real de cofre si está disponible
        const chestKey = open ? 'chest_open_gold' : 'chest_closed_red';
        if (ImageLoader.has(chestKey)) {
            ctx.save();
            // Brillo mágico
            const pulse = 0.5 + Math.sin(t * 0.1) * 0.3;
            const glowGrad = ctx.createRadialGradient(x, y, 5, x, y, size * 0.8);
            glowGrad.addColorStop(0, `rgba(255, 215, 0, ${pulse * 0.5})`);
            glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Sombra
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(x, y + size * 0.4, size * 0.4, size * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();

            // Imagen del cofre
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            const img = ImageLoader.get(chestKey);
            const aspect = img.height / img.width;
            const w = size * 1.1;
            const h = w * aspect;
            ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
            ctx.shadowBlur = 0;
            ctx.restore();
            return;
        }

        // Fallback canvas
        this._drawChestCanvas(ctx, x, y, size, t, open);
    },

    _drawChestCanvas(ctx, x, y, size, t = 0, open = false) {
        ctx.save();
        ctx.translate(x, y);
        const s = size / 40;
        ctx.scale(s, s);

        if (open) {
            // Brillo saliendo del cofre
            const glowGrad = ctx.createRadialGradient(0, -10, 2, 0, -10, 30);
            glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
            glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(0, -10, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cuerpo del cofre
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-18, -2, 36, 20);
        // Tapa
        ctx.fillStyle = '#a0522d';
        if (open) {
            ctx.save();
            ctx.translate(0, -2);
            ctx.rotate(-0.7);
            ctx.fillRect(-18, -12, 36, 12);
            ctx.restore();
        } else {
            ctx.fillRect(-18, -14, 36, 12);
        }
        // Bandas doradas
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-18, 4, 36, 3);
        ctx.fillRect(-18, -6, 36, 2);
        // Cerradura
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-3, 0, 6, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(-1, 3, 2, 3);

        ctx.restore();
    },

    /* ============ POWER-UPS (con iconos kawaii reales) ============ */
    drawPowerUp(ctx, x, y, type, t = 0) {
        // Usa icono kawaii si está disponible
        const iconMap = {
            triple: 'icon_kawaii_05',
            shield: 'icon_kawaii_06',
            kiss: 'icon_kawaii_07',
            rose: 'icon_kawaii_08',
            speed: 'icon_kawaii_09',
            life: 'icon_kawaii_10',
            ally: 'icon_kawaii_04',
            bomb: 'icon_lavender_01'
        };
        const iconKey = iconMap[type];
        if (iconKey && ImageLoader.has(iconKey)) {
            ctx.save();
            ctx.translate(x, y);
            const pulse = 1 + Math.sin(t * 0.1) * 0.15;
            ctx.scale(pulse, pulse);

            // Halo mágico
            const haloGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
            haloGrad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
            haloGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 30, 0, Math.PI * 2);
            ctx.fill();

            // Anillo giratorio
            const colors = {
                triple: '#6ef0ff', shield: '#6ef0ff', kiss: '#ff6ec7',
                rose: '#ff0066', speed: '#ffff00', life: '#ff3366',
                ally: '#ff9ed6', bomb: '#ff3300'
            };
            ctx.strokeStyle = colors[type] || '#FFD700';
            ctx.lineWidth = 2;
            ctx.shadowColor = colors[type] || '#FFD700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, 18, t * 0.05, t * 0.05 + Math.PI * 1.5);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Icono
            const img = ImageLoader.get(iconKey);
            const aspect = img.height / img.width;
            const w = 24;
            const h = w * aspect;
            ctx.drawImage(img, -w / 2, -h / 2, w, h);

            ctx.restore();
            return;
        }

        // Fallback canvas original
        this._drawPowerUpCanvas(ctx, x, y, type, t);
    },

    _drawPowerUpCanvas(ctx, x, y, type, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        const pulse = 1 + Math.sin(t * 0.1) * 0.1;
        ctx.scale(pulse, pulse);

        // Halo mágico
        const haloGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 25);
        haloGrad.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
        haloGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        // Círculo base
        ctx.fillStyle = 'rgba(20, 5, 40, 0.9)';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const drawers = {
            triple: () => {
                ctx.fillStyle = '#6ef0ff';
                for (let i = -1; i <= 1; i++) {
                    ctx.beginPath();
                    ctx.arc(i * 5, 0, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            shield: () => {
                ctx.fillStyle = '#6ef0ff';
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(6, -4);
                ctx.lineTo(6, 4);
                ctx.lineTo(0, 8);
                ctx.lineTo(-6, 4);
                ctx.lineTo(-6, -4);
                ctx.closePath();
                ctx.fill();
            },
            ally: () => {
                ctx.fillStyle = '#ff9ed6';
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(0, -9);
                ctx.lineTo(2, -5);
                ctx.lineTo(0, -3);
                ctx.lineTo(-2, -5);
                ctx.closePath();
                ctx.fill();
            },
            life: () => {
                ctx.fillStyle = '#ff3366';
                ctx.beginPath();
                ctx.moveTo(0, 6);
                ctx.bezierCurveTo(-10, -4, -6, -10, 0, -4);
                ctx.bezierCurveTo(6, -10, 10, -4, 0, 6);
                ctx.fill();
            },
            kiss: () => {
                ctx.fillStyle = '#ff6ec7';
                ctx.beginPath();
                ctx.moveTo(0, -3);
                ctx.bezierCurveTo(-6, -8, -10, 0, 0, 6);
                ctx.bezierCurveTo(10, 0, 6, -8, 0, -3);
                ctx.fill();
            },
            rose: () => {
                ctx.fillStyle = '#ff0066';
                for (let i = 0; i < 5; i++) {
                    const a = (i / 5) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.ellipse(Math.cos(a) * 4, Math.sin(a) * 4, 4, 2, a, 0, Math.PI * 2);
                    ctx.fill();
                }
            },
            speed: () => {
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.moveTo(-2, -8);
                ctx.lineTo(4, -2);
                ctx.lineTo(0, 0);
                ctx.lineTo(4, 8);
                ctx.lineTo(-4, 2);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();
            },
            bomb: () => {
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(0, 2, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -5);
                ctx.lineTo(3, -8);
                ctx.stroke();
                ctx.fillStyle = '#ff3300';
                ctx.beginPath();
                ctx.arc(3, -8, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        if (drawers[type]) drawers[type]();

        ctx.restore();
    },

    /* ============ MONEDA ============ */
    drawCoin(ctx, x, y, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        const spin = Math.abs(Math.cos(t * 0.1));
        ctx.scale(spin, 1);

        const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
        grad.addColorStop(0, '#fff8b0');
        grad.addColorStop(0.6, '#FFD700');
        grad.addColorStop(1, '#b8860b');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Estrella
        ctx.fillStyle = '#b8860b';
        this._drawStar(ctx, 0, 0, 5, 4, 2);

        ctx.restore();
    },

    /* ============ SECRETO / LLAVE ============ */
    drawKey(ctx, x, y, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(t * 0.1) * 0.2);

        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-5, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(12, 0);
        ctx.moveTo(8, 0);
        ctx.lineTo(8, 4);
        ctx.moveTo(12, 0);
        ctx.lineTo(12, 4);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
    },

    /* ============ OBSTÁCULOS ============ */
    drawAsteroid(ctx, x, y, size, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(t * 0.01);

        const grad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.1, 0, 0, size * 0.5);
        grad.addColorStop(0, '#888');
        grad.addColorStop(1, '#333');
        ctx.fillStyle = grad;
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const a = (i / points) * Math.PI * 2;
            const r = size * 0.4 * (0.8 + Math.sin(i * 3) * 0.2);
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Cráteres
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(-size * 0.1, -size * 0.1, size * 0.08, 0, Math.PI * 2);
        ctx.arc(size * 0.1, size * 0.05, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    drawCrystalBarrier(ctx, x, y, size, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        const pulse = 0.8 + Math.sin(t * 0.1) * 0.2;
        ctx.fillStyle = `rgba(110, 240, 255, ${0.6 * pulse})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.4);
        ctx.lineTo(size * 0.3, 0);
        ctx.lineTo(0, size * 0.4);
        ctx.lineTo(-size * 0.3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Brillos
        ctx.fillStyle = `rgba(255,255,255,${pulse})`;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.4);
        ctx.lineTo(size * 0.08, -size * 0.1);
        ctx.lineTo(-size * 0.08, -size * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    drawEnergyWall(ctx, x, y, w, h, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(255, 0, 102, 0.2)');
        grad.addColorStop(0.5, `rgba(255, 0, 102, ${0.6 + Math.sin(t * 0.2) * 0.2})`);
        grad.addColorStop(1, 'rgba(255, 0, 102, 0.2)');
        ctx.fillStyle = grad;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        // Líneas eléctricas
        ctx.strokeStyle = 'rgba(255, 200, 220, 0.8)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const yOff = -h / 2 + (h / 3) * i + Math.sin(t * 0.3 + i) * 5;
            ctx.moveTo(-w / 2, yOff);
            for (let x = -w / 2; x <= w / 2; x += 8) {
                ctx.lineTo(x, yOff + Math.sin(t * 0.5 + x * 0.1) * 3);
            }
            ctx.stroke();
        }
        ctx.restore();
    },

    drawSpike(ctx, x, y, size, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        const grad = ctx.createLinearGradient(0, 0, size, 0);
        grad.addColorStop(0, '#555');
        grad.addColorStop(0.5, '#aaa');
        grad.addColorStop(1, '#555');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, -size * 0.15);
        ctx.lineTo(size * 1.1, 0);
        ctx.lineTo(size, size * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
};

window.Assets = Assets;
