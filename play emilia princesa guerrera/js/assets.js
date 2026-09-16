/* ============================================================
   ASSETS v5 - Sprites 100% canvas (sin imágenes literales)
   Familias de enemigos: menores, medios, mayores, subjefes, jefes
   Cada uno con su estilo único y animación
   ============================================================ */

const Assets = {
    /* ============ HEROÍNA: PRINCESA con imagen + movilidad ============ */
    drawHeroine(ctx, x, y, size, t = 0, invuln = false, princessKey = null, state = null) {
        const key = princessKey || 'princess_pink';
        const def = state && state.hero && state.hero.princessDef ? state.hero.princessDef : null;
        const auraColor = def ? def.auraColor : 'rgba(255, 200, 240, 0.6)';
        const glowColor = def ? def.glowColor : '#ff00cc';

        if (ImageLoader.has(key)) {
            ctx.save();
            // Animación de respiración
            const breathe = 1 + Math.sin(t * 0.08) * 0.03;
            // Tilt al moverse
            let tilt = 0;
            if (state && state.hero) {
                const dx = state.input.x - state.hero.x;
                tilt = Math.max(-0.2, Math.min(0.2, dx * 0.002));
            }
            // Bobbing
            const bob = Math.sin(t * 0.15) * 2;

            ctx.translate(x, y + bob);
            ctx.rotate(tilt);
            ctx.scale(breathe, breathe);

            // Aura mágica
            const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, size * 0.9);
            auraGrad.addColorStop(0, auraColor);
            auraGrad.addColorStop(0.5, auraColor.replace(/[\d.]+\)$/, '0.3)'));
            auraGrad.addColorStop(1, auraColor.replace(/[\d.]+\)$/, '0)'));
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
            ctx.fill();

            // Halo de combo
            if (state && state.hero && state.hero.combo >= 5) {
                const ci = Math.min(state.hero.combo / 30, 1);
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + ci * 0.4})`;
                ctx.lineWidth = 2 + ci * 2;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10 + ci * 15;
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
                if (state.hero.combo >= 15) {
                    for (let i = 0; i < 3; i++) {
                        const a = t * 0.05 + (i / 3) * Math.PI * 2;
                        ctx.fillStyle = `hsl(${(t * 4 + i * 60) % 360}, 100%, 70%)`;
                        ctx.shadowColor = ctx.fillStyle;
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        ctx.arc(Math.cos(a) * size * 0.8, Math.sin(a) * size * 0.4, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.shadowBlur = 0;
                }
            }

            if (invuln && Math.floor(t / 5) % 2 === 0) ctx.globalAlpha = 0.4;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 20;
            const img = ImageLoader.get(key);
            const aspect = img.height / img.width;
            const w = size * 1.1;
            const h = w * aspect;
            // Shake si herida
            let shakeX = 0, shakeY = 0;
            if (state && state.hero && state.hero.invuln > 60) {
                shakeX = (Math.random() - 0.5) * 3;
                shakeY = (Math.random() - 0.5) * 3;
            }
            // Zoom de excitación
            let extra = 1;
            if (state && state.hero && state.hero.combo >= 20) {
                extra = 1 + Math.sin(t * 0.4) * 0.04;
            }
            ctx.scale(extra, extra);
            ctx.drawImage(img, -w / 2 + shakeX, -h / 2 - size * 0.1 + shakeY, w, h);
            ctx.shadowBlur = 0;

            // Estrella orbitante (varita)
            const ang = t * 0.05;
            ctx.fillStyle = `hsl(${(t * 4) % 360}, 100%, 70%)`;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 15;
            this._drawStar(ctx, Math.cos(ang) * size * 0.6, -size * 0.3 + Math.sin(ang) * size * 0.3, 5, 6, 3);
            ctx.shadowBlur = 0;

            // Líneas de velocidad
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
        // Fallback canvas
        this._drawHeroineCanvas(ctx, x, y, size, t, invuln);
    },

    _drawHeroineCanvas(ctx, x, y, size, t = 0, invuln = false) {
        ctx.save();
        ctx.translate(x, y);
        const s = size / 60;
        ctx.scale(s, s);
        const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 50);
        auraGrad.addColorStop(0, 'rgba(255, 200, 240, 0.5)');
        auraGrad.addColorStop(1, 'rgba(255, 105, 180, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
        if (invuln && Math.floor(t / 5) % 2 === 0) ctx.globalAlpha = 0.4;
        // Vestido
        const dressGrad = ctx.createLinearGradient(0, 0, 0, 40);
        dressGrad.addColorStop(0, '#ff6ec7');
        dressGrad.addColorStop(1, '#a020f0');
        ctx.fillStyle = dressGrad;
        ctx.beginPath();
        ctx.moveTo(-22, 5); ctx.lineTo(22, 5); ctx.lineTo(30, 38); ctx.lineTo(-30, 38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-15, 15); ctx.lineTo(15, 15);
        ctx.moveTo(-20, 25); ctx.lineTo(20, 25);
        ctx.stroke();
        // Brazos
        ctx.fillStyle = '#ffdfc4';
        ctx.beginPath();
        ctx.arc(-26, 10, 5, 0, Math.PI * 2);
        ctx.arc(26, 10, 5, 0, Math.PI * 2);
        ctx.fill();
        // Cabeza
        ctx.beginPath();
        ctx.arc(0, -8, 13, 0, Math.PI * 2);
        ctx.fill();
        // Cabello
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
        ctx.beginPath();
        ctx.moveTo(-10, -22); ctx.lineTo(-10, -18); ctx.lineTo(10, -18); ctx.lineTo(10, -22);
        ctx.lineTo(7, -15); ctx.lineTo(3, -22); ctx.lineTo(0, -15); ctx.lineTo(-3, -22); ctx.lineTo(-7, -15);
        ctx.closePath();
        ctx.fill();
        // Ojos
        ctx.fillStyle = '#1a0050';
        ctx.beginPath();
        ctx.arc(-4, -7, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -7, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Varita
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(28, 10); ctx.lineTo(38, -10);
        ctx.stroke();
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

    /* ============ BULLET: con tipos elementales ============ */
    drawBullet(ctx, x, y, type, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        const palettes = {
            NORMAL: { core: '#ffffff', mid: '#6ef0ff', out: '#0066ff' },
            TRIPLE: { core: '#ffffff', mid: '#ff9ed6', out: '#ff00cc' },
            KISS: { core: '#ffffff', mid: '#ff6ec7', out: '#ff0066' },
            ROSE: { core: '#ffffff', mid: '#ff6699', out: '#cc0033' },
            LASER: { core: '#ffffff', mid: '#ffff00', out: '#ff6600' },
            PIERCE: { core: '#ffffff', mid: '#aaff00', out: '#006600' },
            BOMB: { core: '#ffffff', mid: '#ffaa00', out: '#ff3300' },
            ENEMY: { core: '#ff8888', mid: '#ff0033', out: '#660000' },
            BOSS: { core: '#ffaa00', mid: '#ff3300', out: '#330000' },
            ICE: { core: '#ffffff', mid: '#aaffff', out: '#0066cc' },
            FIRE: { core: '#ffffff', mid: '#ffaa00', out: '#cc0000' },
            LIGHTNING: { core: '#ffffff', mid: '#ffff66', out: '#ffaa00' },
            SHADOW: { core: '#cc99ff', mid: '#660099', out: '#1a0010' },
            LIGHT: { core: '#ffffff', mid: '#ffffcc', out: '#FFD700' },
            NATURE: { core: '#ffffff', mid: '#88ff66', out: '#336600' }
        };
        const p = palettes[type] || palettes.NORMAL;
        ctx.shadowColor = p.out;
        ctx.shadowBlur = 16;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        grad.addColorStop(0, p.core);
        grad.addColorStop(0.4, p.mid);
        grad.addColorStop(1, p.out);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = p.core;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        // Formas especiales
        if (type === 'KISS') {
            ctx.fillStyle = 'rgba(255, 105, 180, 0.7)';
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.bezierCurveTo(-6, -8, -10, 0, 0, 6);
            ctx.bezierCurveTo(10, 0, 6, -8, 0, -3);
            ctx.fill();
        } else if (type === 'ROSE') {
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2 + t * 0.1;
                ctx.fillStyle = 'rgba(255, 102, 153, 0.6)';
                ctx.beginPath();
                ctx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 3, 2, a, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (type === 'LASER') {
            ctx.fillStyle = p.mid;
            ctx.fillRect(-3, -14, 6, 28);
        } else if (type === 'PIERCE') {
            ctx.fillStyle = p.mid;
            ctx.beginPath();
            ctx.moveTo(0, -12); ctx.lineTo(4, 0); ctx.lineTo(0, 12); ctx.lineTo(-4, 0);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'BOMB') {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.stroke();
        } else if (type === 'ENEMY' || type === 'BOSS') {
            ctx.fillStyle = p.out;
            ctx.beginPath();
            ctx.moveTo(0, 8); ctx.lineTo(-4, 12); ctx.lineTo(4, 12);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'ICE') {
            ctx.strokeStyle = p.core;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = p.mid;
            ctx.shadowBlur = 8;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + t * 0.05;
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
                ctx.stroke();
                const bx = Math.cos(a) * 6, by = Math.sin(a) * 6;
                ctx.beginPath();
                ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + 0.5) * 3, by + Math.sin(a + 0.5) * 3);
                ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a - 0.5) * 3, by + Math.sin(a - 0.5) * 3);
                ctx.stroke();
            }
        } else if (type === 'FIRE') {
            const flame = Math.sin(t * 0.4) * 0.2 + 1;
            ctx.fillStyle = p.mid;
            ctx.beginPath();
            ctx.moveTo(0, -12 * flame);
            ctx.bezierCurveTo(-6, -6, -6, 4, 0, 8);
            ctx.bezierCurveTo(6, 4, 6, -6, 0, -12 * flame);
            ctx.fill();
        } else if (type === 'LIGHTNING') {
            ctx.strokeStyle = p.core;
            ctx.lineWidth = 2;
            ctx.shadowColor = p.mid;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(0, -12); ctx.lineTo(2, -4); ctx.lineTo(-2, 0); ctx.lineTo(2, 4); ctx.lineTo(0, 12);
            ctx.stroke();
        } else if (type === 'SHADOW') {
            ctx.fillStyle = p.mid;
            ctx.shadowColor = p.out;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let i = 0; i < 7; i++) {
                const a = (i / 7) * Math.PI * 2 + t * 0.08;
                const r = 8 + Math.sin(t * 0.2 + i) * 2;
                const px = Math.cos(a) * r, py = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        } else if (type === 'LIGHT') {
            ctx.fillStyle = p.core;
            ctx.shadowColor = p.mid;
            ctx.shadowBlur = 15;
            this._drawStar(ctx, 0, 0, 6, 9, 4);
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
            ctx.fillStyle = p.mid;
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 4, t * 0.1, 0, Math.PI * 2);
            ctx.fill();
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

    /* ============ ENEMIGOS - FAMILIAS PROPIAS ============
       Cada tipo tiene su sprite canvas único.
       Familias: babosas, abejas, duendes, fantasmas, demonios, esbirros, brujas, etc.
    */
    drawEnemy(ctx, x, y, type, size, t = 0, hpRatio = 1) {
        ctx.save();
        ctx.translate(x, y);
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, size * 0.45, size * 0.4, size * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        const drawer = this._enemyFamilies[type] || this._enemyFamilies.slime;
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

    /* Catálogo de familias de enemigos dibujados con canvas */
    _enemyFamilies: {
        /* ===== FAMILIA BABOSAS (Reino Slime) - menores verdes, medios azules, mayores rojas ===== */
        slimeMinor(ctx, s, t) {
            const wobble = Math.sin(t * 0.15) * 3;
            const grad = ctx.createRadialGradient(-s * 0.15, -s * 0.15, s * 0.05, 0, 0, s * 0.5);
            grad.addColorStop(0, '#aaffaa');
            grad.addColorStop(1, '#33aa55');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, wobble * 0.3, s * 0.45, s * 0.38 + wobble * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            // Brillo
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.ellipse(-s * 0.15, -s * 0.18, s * 0.1, s * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.12, 0, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.12, 0, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            // Boca pequeña
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, s * 0.12, s * 0.05, 0.2, Math.PI - 0.2);
            ctx.stroke();
        },
        slimeMedium(ctx, s, t) {
            const wobble = Math.sin(t * 0.12) * 4;
            const grad = ctx.createRadialGradient(-s * 0.15, -s * 0.15, s * 0.05, 0, 0, s * 0.5);
            grad.addColorStop(0, '#aaccff');
            grad.addColorStop(1, '#3366aa');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, wobble * 0.3, s * 0.48, s * 0.4 + wobble * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            // Manchas
            ctx.fillStyle = 'rgba(50, 100, 200, 0.5)';
            ctx.beginPath();
            ctx.arc(s * 0.15, s * 0.05, s * 0.08, 0, Math.PI * 2);
            ctx.arc(-s * 0.2, s * 0.1, s * 0.06, 0, Math.PI * 2);
            ctx.fill();
            // Brillo
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.ellipse(-s * 0.18, -s * 0.2, s * 0.12, s * 0.06, 0, 0, Math.PI * 2);
            ctx.fill();
            // Ojos con ceño
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.13, -s * 0.05, s * 0.05, 0, Math.PI * 2);
            ctx.arc(s * 0.13, -s * 0.05, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-s * 0.2, -s * 0.15); ctx.lineTo(-s * 0.05, -s * 0.1);
            ctx.moveTo(s * 0.2, -s * 0.15); ctx.lineTo(s * 0.05, -s * 0.1);
            ctx.stroke();
            // Boca con dientes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(0, s * 0.15, s * 0.1, s * 0.06, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillRect(-s * 0.04, s * 0.1, s * 0.03, s * 0.05);
            ctx.fillRect(s * 0.01, s * 0.1, s * 0.03, s * 0.05);
        },
        slimeMajor(ctx, s, t) {
            // Slime grande rojo con pinchos
            const wobble = Math.sin(t * 0.1) * 5;
            const grad = ctx.createRadialGradient(-s * 0.15, -s * 0.15, s * 0.05, 0, 0, s * 0.55);
            grad.addColorStop(0, '#ffaaaa');
            grad.addColorStop(1, '#aa0033');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, wobble * 0.3, s * 0.5, s * 0.42 + wobble * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            // Pinchos
            ctx.fillStyle = '#660022';
            for (let i = 0; i < 5; i++) {
                const a = -Math.PI / 2 + (i - 2) * 0.3;
                const r = s * 0.45;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a - 0.1) * r, Math.sin(a - 0.1) * r);
                ctx.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3);
                ctx.lineTo(Math.cos(a + 0.1) * r, Math.sin(a + 0.1) * r);
                ctx.fill();
            }
            // Ojos malvados
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-s * 0.15, -s * 0.05, s * 0.08, 0, Math.PI * 2);
            ctx.arc(s * 0.15, -s * 0.05, s * 0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(-s * 0.15, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.15, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Boca con colmillos
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(0, s * 0.18, s * 0.12, s * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.moveTo(i * s * 0.06, s * 0.12);
                ctx.lineTo(i * s * 0.06 + s * 0.02, s * 0.22);
                ctx.lineTo(i * s * 0.06 + s * 0.04, s * 0.12);
                ctx.fill();
            }
        },

        /* ===== FAMILIA DUENDES (Bosque Dulce / Selva) ===== */
        goblinMinor(ctx, s, t) {
            // Duende pequeño verde con gorro
            const bob = Math.sin(t * 0.2) * 2;
            // Cuerpo
            ctx.fillStyle = '#55aa33';
            ctx.beginPath();
            ctx.ellipse(0, bob + s * 0.1, s * 0.3, s * 0.28, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabeza
            ctx.fillStyle = '#88cc55';
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.15, s * 0.22, 0, Math.PI * 2);
            ctx.fill();
            // Orejas puntiagudas
            ctx.beginPath();
            ctx.moveTo(-s * 0.22, bob - s * 0.15);
            ctx.lineTo(-s * 0.35, bob - s * 0.25);
            ctx.lineTo(-s * 0.18, bob - s * 0.05);
            ctx.moveTo(s * 0.22, bob - s * 0.15);
            ctx.lineTo(s * 0.35, bob - s * 0.25);
            ctx.lineTo(s * 0.18, bob - s * 0.05);
            ctx.fill();
            // Gorro
            ctx.fillStyle = '#cc0033';
            ctx.beginPath();
            ctx.moveTo(-s * 0.18, bob - s * 0.25);
            ctx.lineTo(0, bob - s * 0.45);
            ctx.lineTo(s * 0.18, bob - s * 0.25);
            ctx.fill();
            // Ojos amarillos
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(-s * 0.07, bob - s * 0.15, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.07, bob - s * 0.15, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.07, bob - s * 0.15, s * 0.02, 0, Math.PI * 2);
            ctx.arc(s * 0.07, bob - s * 0.15, s * 0.02, 0, Math.PI * 2);
            ctx.fill();
            // Boca con dientes
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.05, s * 0.06, 0, Math.PI);
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fillRect(-s * 0.03, bob - s * 0.02, s * 0.02, s * 0.04);
            ctx.fillRect(s * 0.01, bob - s * 0.02, s * 0.02, s * 0.04);
        },
        goblinMedium(ctx, s, t) {
            // Duende guerrero con garrote
            const bob = Math.sin(t * 0.15) * 2;
            // Cuerpo con armadura
            ctx.fillStyle = '#445522';
            ctx.beginPath();
            ctx.ellipse(0, bob + s * 0.1, s * 0.32, s * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            // Armadura pecho
            ctx.fillStyle = '#888888';
            ctx.beginPath();
            ctx.ellipse(0, bob + s * 0.08, s * 0.22, s * 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabeza
            ctx.fillStyle = '#779944';
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.15, s * 0.24, 0, Math.PI * 2);
            ctx.fill();
            // Casco
            ctx.fillStyle = '#666';
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.2, s * 0.24, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#aa3333';
            ctx.fillRect(-s * 0.05, bob - s * 0.4, s * 0.1, s * 0.05);
            // Orejas
            ctx.fillStyle = '#779944';
            ctx.beginPath();
            ctx.moveTo(-s * 0.24, bob - s * 0.15);
            ctx.lineTo(-s * 0.38, bob - s * 0.28);
            ctx.lineTo(-s * 0.18, bob - s * 0.05);
            ctx.moveTo(s * 0.24, bob - s * 0.15);
            ctx.lineTo(s * 0.38, bob - s * 0.28);
            ctx.lineTo(s * 0.18, bob - s * 0.05);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#ff6600';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(-s * 0.08, bob - s * 0.12, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.08, bob - s * 0.12, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Boca
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-s * 0.08, bob); ctx.lineTo(s * 0.08, bob);
            ctx.stroke();
            // Garrote
            ctx.strokeStyle = '#664422';
            ctx.lineWidth = s * 0.06;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(s * 0.35, bob + s * 0.3);
            ctx.lineTo(s * 0.5, bob - s * 0.1);
            ctx.stroke();
            ctx.fillStyle = '#884422';
            ctx.beginPath();
            ctx.arc(s * 0.5, bob - s * 0.15, s * 0.1, 0, Math.PI * 2);
            ctx.fill();
            // Espinas en garrote
            ctx.fillStyle = '#444';
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(s * 0.5 + Math.cos(a) * s * 0.1, bob - s * 0.15 + Math.sin(a) * s * 0.1);
                ctx.lineTo(s * 0.5 + Math.cos(a) * s * 0.15, bob - s * 0.15 + Math.sin(a) * s * 0.15);
                ctx.lineTo(s * 0.5 + Math.cos(a + 0.3) * s * 0.1, bob - s * 0.15 + Math.sin(a + 0.3) * s * 0.1);
                ctx.fill();
            }
        },

        /* ===== FAMILIA DEMONIOS (Valle Fuego) ===== */
        impMinor(ctx, s, t) {
            // Diablillo pequeño rojo con tridente
            const float = Math.sin(t * 0.2) * 3;
            ctx.translate(0, float);
            // Cuerpo
            ctx.fillStyle = '#cc2222';
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.3, s * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabeza
            ctx.beginPath();
            ctx.arc(0, -s * 0.2, s * 0.22, 0, Math.PI * 2);
            ctx.fill();
            // Cuernos
            ctx.fillStyle = '#330000';
            ctx.beginPath();
            ctx.moveTo(-s * 0.15, -s * 0.32);
            ctx.lineTo(-s * 0.22, -s * 0.45);
            ctx.lineTo(-s * 0.08, -s * 0.32);
            ctx.moveTo(s * 0.15, -s * 0.32);
            ctx.lineTo(s * 0.22, -s * 0.45);
            ctx.lineTo(s * 0.08, -s * 0.32);
            ctx.fill();
            // Alas
            ctx.fillStyle = '#660000';
            const wing = Math.sin(t * 0.4) * 0.2;
            ctx.beginPath();
            ctx.moveTo(-s * 0.25, -s * 0.05);
            ctx.lineTo(-s * 0.5, -s * 0.15 + wing * s);
            ctx.lineTo(-s * 0.4, s * 0.1);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(s * 0.25, -s * 0.05);
            ctx.lineTo(s * 0.5, -s * 0.15 + wing * s);
            ctx.lineTo(s * 0.4, s * 0.1);
            ctx.closePath();
            ctx.fill();
            // Ojos amarillos
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(-s * 0.08, -s * 0.2, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.08, -s * 0.2, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Boca con colmillos
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(0, -s * 0.1, s * 0.08, s * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(-s * 0.04, -s * 0.13); ctx.lineTo(-s * 0.02, -s * 0.07); ctx.lineTo(0, -s * 0.13);
            ctx.moveTo(0, -s * 0.13); ctx.lineTo(s * 0.02, -s * 0.07); ctx.lineTo(s * 0.04, -s * 0.13);
            ctx.fill();
        },
        impMajor(ctx, s, t) {
            // Demonio grande con aura de fuego
            const flicker = Math.sin(t * 0.3) * 0.05 + 1;
            // Aura
            const aura = ctx.createRadialGradient(0, 0, s * 0.3, 0, 0, s * 0.7);
            aura.addColorStop(0, 'rgba(255, 100, 0, 0.5)');
            aura.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
            ctx.fill();
            // Cuerpo
            const grad = ctx.createRadialGradient(0, -s * 0.1, s * 0.05, 0, 0, s * 0.5);
            grad.addColorStop(0, '#ffaa00');
            grad.addColorStop(0.5, '#cc3300');
            grad.addColorStop(1, '#330000');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.4, s * 0.45 * flicker, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cuernos grandes
            ctx.fillStyle = '#1a0000';
            ctx.beginPath();
            ctx.moveTo(-s * 0.2, -s * 0.35);
            ctx.lineTo(-s * 0.35, -s * 0.6);
            ctx.lineTo(-s * 0.1, -s * 0.4);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(s * 0.2, -s * 0.35);
            ctx.lineTo(s * 0.35, -s * 0.6);
            ctx.lineTo(s * 0.1, -s * 0.4);
            ctx.fill();
            // Alas grandes
            ctx.fillStyle = '#660000';
            const wing = Math.sin(t * 0.2) * 0.3;
            ctx.beginPath();
            ctx.moveTo(-s * 0.3, -s * 0.1);
            ctx.lineTo(-s * 0.6, -s * 0.3 - wing * s);
            ctx.lineTo(-s * 0.55, s * 0.1);
            ctx.lineTo(-s * 0.35, s * 0.2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(s * 0.3, -s * 0.1);
            ctx.lineTo(s * 0.6, -s * 0.3 - wing * s);
            ctx.lineTo(s * 0.55, s * 0.1);
            ctx.lineTo(s * 0.35, s * 0.2);
            ctx.fill();
            // Ojos ardientes
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.ellipse(-s * 0.12, -s * 0.1, s * 0.07, s * 0.04, 0, 0, Math.PI * 2);
            ctx.ellipse(s * 0.12, -s * 0.1, s * 0.07, s * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Boca
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(0, s * 0.15, s * 0.15, s * 0.07, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(i * s * 0.06, s * 0.1);
                ctx.lineTo(i * s * 0.06 + s * 0.02, s * 0.22);
                ctx.lineTo(i * s * 0.06 + s * 0.04, s * 0.1);
                ctx.fill();
            }
        },

        /* ===== FAMILIA FANTASMAS (Castillo Fantasma) ===== */
        ghostMinor(ctx, s, t) {
            const wave = Math.sin(t * 0.1) * 3;
            const grad = ctx.createRadialGradient(0, -s * 0.1, s * 0.05, 0, 0, s * 0.45);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            grad.addColorStop(0.6, 'rgba(200, 200, 255, 0.7)');
            grad.addColorStop(1, 'rgba(150, 150, 220, 0.3)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, -s * 0.1, s * 0.3, Math.PI, 0);
            ctx.lineTo(s * 0.3, s * 0.25 + wave);
            // Onda inferior
            for (let i = 2; i >= -2; i--) {
                ctx.quadraticCurveTo(i * s * 0.075 + s * 0.04, s * 0.35, i * s * 0.075, s * 0.25);
            }
            ctx.closePath();
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(-s * 0.1, -s * 0.15, s * 0.05, s * 0.07, 0, 0, Math.PI * 2);
            ctx.ellipse(s * 0.1, -s * 0.15, s * 0.05, s * 0.07, 0, 0, Math.PI * 2);
            ctx.fill();
            // Boca
            ctx.beginPath();
            ctx.ellipse(0, s * 0.05, s * 0.05, s * 0.07, 0, 0, Math.PI * 2);
            ctx.fill();
        },
        ghostMajor(ctx, s, t) {
            // Fantasma grande con cadena
            const wave = Math.sin(t * 0.15) * 4;
            // Aura
            const aura = ctx.createRadialGradient(0, 0, s * 0.2, 0, 0, s * 0.6);
            aura.addColorStop(0, 'rgba(170, 170, 255, 0.4)');
            aura.addColorStop(1, 'rgba(100, 100, 200, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
            ctx.fill();
            // Cuerpo
            const grad = ctx.createRadialGradient(0, -s * 0.1, s * 0.05, 0, 0, s * 0.5);
            grad.addColorStop(0, 'rgba(220, 220, 255, 0.95)');
            grad.addColorStop(0.5, 'rgba(150, 150, 220, 0.8)');
            grad.addColorStop(1, 'rgba(80, 80, 150, 0.5)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, -s * 0.1, s * 0.35, Math.PI, 0);
            ctx.lineTo(s * 0.35, s * 0.3 + wave);
            for (let i = 3; i >= -3; i--) {
                ctx.quadraticCurveTo(i * s * 0.085 + s * 0.04, s * 0.42, i * s * 0.085, s * 0.3);
            }
            ctx.closePath();
            ctx.fill();
            // Ojos rojos brillantes
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.ellipse(-s * 0.12, -s * 0.15, s * 0.06, s * 0.1, 0, 0, Math.PI * 2);
            ctx.ellipse(s * 0.12, -s * 0.15, s * 0.06, s * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Boca
            ctx.fillStyle = 'rgba(50, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.ellipse(0, s * 0.05, s * 0.1, s * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cadena
            ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(s * 0.3 + i * s * 0.05, s * 0.1 + i * s * 0.08, s * 0.04, 0, Math.PI * 2);
                ctx.stroke();
            }
        },

        /* ===== FAMILIA BRUJAS (Pantano Oscuro) ===== */
        witchMinor(ctx, s, t) {
            const bob = Math.sin(t * 0.15) * 2;
            // Capa
            ctx.fillStyle = '#1a3300';
            ctx.beginPath();
            ctx.moveTo(-s * 0.3, bob + s * 0.4);
            ctx.lineTo(-s * 0.2, bob - s * 0.1);
            ctx.lineTo(s * 0.2, bob - s * 0.1);
            ctx.lineTo(s * 0.3, bob + s * 0.4);
            ctx.closePath();
            ctx.fill();
            // Cuerpo
            ctx.fillStyle = '#4a7c2a';
            ctx.beginPath();
            ctx.ellipse(0, bob, s * 0.2, s * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabeza verde
            ctx.fillStyle = '#88aa55';
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.2, s * 0.15, 0, Math.PI * 2);
            ctx.fill();
            // Sombrero
            ctx.fillStyle = '#1a0010';
            ctx.beginPath();
            ctx.moveTo(-s * 0.2, bob - s * 0.25);
            ctx.lineTo(0, bob - s * 0.5);
            ctx.lineTo(s * 0.2, bob - s * 0.25);
            ctx.fill();
            ctx.fillStyle = '#aa6633';
            ctx.fillRect(-s * 0.22, bob - s * 0.27, s * 0.44, s * 0.04);
            // Ojos amarillos
            ctx.fillStyle = '#88ff00';
            ctx.shadowColor = '#88ff00';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(-s * 0.05, bob - s * 0.2, s * 0.025, 0, Math.PI * 2);
            ctx.arc(s * 0.05, bob - s * 0.2, s * 0.025, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Nariz
            ctx.fillStyle = '#88aa55';
            ctx.beginPath();
            ctx.moveTo(0, bob - s * 0.18);
            ctx.lineTo(s * 0.08, bob - s * 0.12);
            ctx.lineTo(0, bob - s * 0.1);
            ctx.fill();
            // Boca
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.08, s * 0.04, 0, Math.PI);
            ctx.stroke();
        },
        witchMajor(ctx, s, t) {
            // Bruja grande con caldera y aura tóxica
            const bob = Math.sin(t * 0.1) * 3;
            // Aura
            const aura = ctx.createRadialGradient(0, 0, s * 0.2, 0, 0, s * 0.7);
            aura.addColorStop(0, 'rgba(100, 200, 50, 0.4)');
            aura.addColorStop(1, 'rgba(50, 100, 0, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
            ctx.fill();
            // Capa
            ctx.fillStyle = '#0a1a00';
            ctx.beginPath();
            ctx.moveTo(-s * 0.4, bob + s * 0.4);
            ctx.lineTo(-s * 0.25, bob - s * 0.15);
            ctx.lineTo(s * 0.25, bob - s * 0.15);
            ctx.lineTo(s * 0.4, bob + s * 0.4);
            ctx.closePath();
            ctx.fill();
            // Cuerpo
            ctx.fillStyle = '#4a7c2a';
            ctx.beginPath();
            ctx.ellipse(0, bob, s * 0.25, s * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabeza
            ctx.fillStyle = '#88aa55';
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.2, s * 0.2, 0, Math.PI * 2);
            ctx.fill();
            // Sombrero grande
            ctx.fillStyle = '#1a0010';
            ctx.beginPath();
            ctx.moveTo(-s * 0.28, bob - s * 0.28);
            ctx.lineTo(-s * 0.05, bob - s * 0.55);
            ctx.lineTo(s * 0.05, bob - s * 0.55);
            ctx.lineTo(s * 0.28, bob - s * 0.28);
            ctx.fill();
            ctx.fillStyle = '#aa6633';
            ctx.fillRect(-s * 0.3, bob - s * 0.32, s * 0.6, s * 0.05);
            // Calavera en sombrero
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.3, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.fillRect(-s * 0.02, bob - s * 0.32, s * 0.01, s * 0.01);
            ctx.fillRect(s * 0.01, bob - s * 0.32, s * 0.01, s * 0.01);
            // Ojos brillantes
            ctx.fillStyle = '#88ff00';
            ctx.shadowColor = '#88ff00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(-s * 0.07, bob - s * 0.2, s * 0.03, s * 0.05, 0, 0, Math.PI * 2);
            ctx.ellipse(s * 0.07, bob - s * 0.2, s * 0.03, s * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Nariz ganchuda
            ctx.fillStyle = '#779944';
            ctx.beginPath();
            ctx.moveTo(0, bob - s * 0.18);
            ctx.quadraticCurveTo(s * 0.12, bob - s * 0.1, s * 0.05, bob - s * 0.05);
            ctx.lineTo(0, bob - s * 0.1);
            ctx.fill();
            // Boca
            ctx.strokeStyle = '#1a3300';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-s * 0.06, bob - s * 0.08);
            ctx.quadraticCurveTo(0, bob - s * 0.02, s * 0.06, bob - s * 0.08);
            ctx.stroke();
            // Verruga
            ctx.fillStyle = '#3a5520';
            ctx.beginPath();
            ctx.arc(s * 0.05, bob - s * 0.13, s * 0.02, 0, Math.PI * 2);
            ctx.fill();
        },

        /* ===== FAMILIA ESBIRROS (Trono Supremo) ===== */
        darklingMinor(ctx, s, t) {
            // Sombra pequeña
            const pulse = 0.9 + Math.sin(t * 0.15) * 0.1;
            const grad = ctx.createRadialGradient(0, 0, s * 0.05, 0, 0, s * 0.4);
            grad.addColorStop(0, '#660066');
            grad.addColorStop(1, '#1a0010');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.35 * pulse, 0, Math.PI * 2);
            ctx.fill();
            // Aura
            ctx.strokeStyle = `rgba(255, 0, 102, ${0.5 + Math.sin(t * 0.1) * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
            ctx.stroke();
            // Ojos
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(-s * 0.08, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.08, -s * 0.05, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        },
        darklingMajor(ctx, s, t) {
            // Sombra mayor con tentáculos
            const pulse = 0.95 + Math.sin(t * 0.1) * 0.05;
            // Aura
            const aura = ctx.createRadialGradient(0, 0, s * 0.2, 0, 0, s * 0.7);
            aura.addColorStop(0, 'rgba(255, 0, 100, 0.4)');
            aura.addColorStop(0.5, 'rgba(150, 0, 50, 0.3)');
            aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = aura;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
            ctx.fill();
            // Tentáculos
            ctx.strokeStyle = '#1a0010';
            ctx.lineWidth = s * 0.06;
            ctx.lineCap = 'round';
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + t * 0.03;
                const wave = Math.sin(t * 0.1 + i) * s * 0.05;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * s * 0.25, Math.sin(a) * s * 0.25);
                ctx.quadraticCurveTo(
                    Math.cos(a) * s * 0.4, Math.sin(a) * s * 0.4 + wave,
                    Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5 + wave * 1.5
                );
                ctx.stroke();
            }
            // Cuerpo
            const grad = ctx.createRadialGradient(0, -s * 0.1, s * 0.05, 0, 0, s * 0.4);
            grad.addColorStop(0, '#660033');
            grad.addColorStop(0.5, '#330011');
            grad.addColorStop(1, '#0a0005');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.35, s * 0.4 * pulse, 0, 0, Math.PI * 2);
            ctx.fill();
            // Ojos múltiples
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(-s * 0.12, -s * 0.1, s * 0.05, 0, Math.PI * 2);
            ctx.arc(s * 0.12, -s * 0.1, s * 0.05, 0, Math.PI * 2);
            ctx.arc(-s * 0.05, s * 0.05, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.05, s * 0.05, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        },

        /* ===== FAMILIA ROBOTS (Ciudad Neón) ===== */
        robotMinor(ctx, s, t) {
            const blink = (Math.floor(t / 30) % 4 === 0) ? 0.3 : 1;
            // Cuerpo metálico
            const grad = ctx.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
            grad.addColorStop(0, '#999');
            grad.addColorStop(0.5, '#666');
            grad.addColorStop(1, '#333');
            ctx.fillStyle = grad;
            ctx.fillRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.6);
            // Pantalla
            ctx.fillStyle = '#000';
            ctx.fillRect(-s * 0.22, -s * 0.15, s * 0.44, s * 0.25);
            // Ojo LED
            ctx.fillStyle = `rgba(255, 0, 100, ${blink})`;
            ctx.shadowColor = '#ff0066';
            ctx.shadowBlur = 8;
            ctx.fillRect(-s * 0.15, -s * 0.1, s * 0.3, s * 0.1);
            ctx.shadowBlur = 0;
            // Antena
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.3); ctx.lineTo(0, -s * 0.4);
            ctx.stroke();
            ctx.fillStyle = '#ff0033';
            ctx.beginPath();
            ctx.arc(0, -s * 0.4, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            // Boca
            ctx.fillStyle = '#222';
            ctx.fillRect(-s * 0.1, s * 0.18, s * 0.2, s * 0.04);
        },
        robotMajor(ctx, s, t) {
            // Robot grande con cañones
            const blink = (Math.floor(t / 20) % 4 === 0) ? 0.3 : 1;
            const grad = ctx.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
            grad.addColorStop(0, '#aaa');
            grad.addColorStop(0.5, '#777');
            grad.addColorStop(1, '#333');
            ctx.fillStyle = grad;
            ctx.fillRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
            // Pantalla grande
            ctx.fillStyle = '#000';
            ctx.fillRect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.25);
            // Ojo grande
            ctx.fillStyle = `rgba(255, 0, 50, ${blink})`;
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.ellipse(0, -s * 0.18, s * 0.2, s * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Antenas
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-s * 0.2, -s * 0.4); ctx.lineTo(-s * 0.25, -s * 0.55);
            ctx.moveTo(s * 0.2, -s * 0.4); ctx.lineTo(s * 0.25, -s * 0.55);
            ctx.stroke();
            ctx.fillStyle = '#ff0033';
            ctx.beginPath();
            ctx.arc(-s * 0.25, -s * 0.55, s * 0.05, 0, Math.PI * 2);
            ctx.arc(s * 0.25, -s * 0.55, s * 0.05, 0, Math.PI * 2);
            ctx.fill();
            // Brazos/cañones
            ctx.fillStyle = '#333';
            ctx.fillRect(-s * 0.55, -s * 0.1, s * 0.15, s * 0.4);
            ctx.fillRect(s * 0.4, -s * 0.1, s * 0.15, s * 0.4);
            ctx.fillStyle = '#000';
            ctx.fillRect(-s * 0.55, s * 0.25, s * 0.15, s * 0.1);
            ctx.fillRect(s * 0.4, s * 0.25, s * 0.15, s * 0.1);
            // Boca parrilla
            ctx.fillStyle = '#222';
            for (let i = -2; i <= 2; i++) {
                ctx.fillRect(i * s * 0.06 - s * 0.02, s * 0.05, s * 0.04, s * 0.15);
            }
        },

        /* ===== FAMILIA PIRATAS/ESQUELETOS ===== */
        skeletonMinor(ctx, s, t) {
            const bob = Math.sin(t * 0.2) * 2;
            // Cráneo
            ctx.fillStyle = '#eeeeee';
            ctx.beginPath();
            ctx.arc(0, bob - s * 0.1, s * 0.25, 0, Math.PI * 2);
            ctx.fill();
            // Mandíbula
            ctx.fillRect(-s * 0.18, bob + s * 0.08, s * 0.36, s * 0.12);
            // Cuencas
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-s * 0.1, bob - s * 0.1, s * 0.06, 0, Math.PI * 2);
            ctx.arc(s * 0.1, bob - s * 0.1, s * 0.06, 0, Math.PI * 2);
            ctx.fill();
            // Brillo rojo
            ctx.fillStyle = '#ff0033';
            ctx.shadowColor = '#ff0033';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(-s * 0.1, bob - s * 0.1, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.1, bob - s * 0.1, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Dientes
            ctx.fillStyle = '#000';
            for (let i = -2; i <= 2; i++) {
                ctx.fillRect(i * s * 0.06, bob + s * 0.08, s * 0.04, s * 0.1);
            }
            // Costillas (cuerpo)
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(0, bob + s * 0.2 + i * s * 0.05, s * 0.15, 0.2, Math.PI - 0.2);
                ctx.stroke();
            }
        },

        /* ===== ALIENS (Espacio Estelar) ===== */
        alienMinor(ctx, s, t) {
            const bob = Math.sin(t * 0.15) * 2;
            // Cabeza grande
            const grad = ctx.createRadialGradient(0, bob - s * 0.1, s * 0.05, 0, 0, s * 0.4);
            grad.addColorStop(0, '#88ff66');
            grad.addColorStop(1, '#336611');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, bob, s * 0.25, s * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();
            // Antenas con luces
            ctx.strokeStyle = '#336611';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-s * 0.1, bob - s * 0.3);
            ctx.lineTo(-s * 0.15, bob - s * 0.4);
            ctx.moveTo(s * 0.1, bob - s * 0.3);
            ctx.lineTo(s * 0.15, bob - s * 0.4);
            ctx.stroke();
            ctx.fillStyle = `hsl(${(t * 5) % 360}, 100%, 60%)`;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(-s * 0.15, bob - s * 0.4, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.15, bob - s * 0.4, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            // Ojos grandes negros
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(-s * 0.1, bob - s * 0.05, s * 0.06, s * 0.1, 0, 0, Math.PI * 2);
            ctx.ellipse(s * 0.1, bob - s * 0.05, s * 0.06, s * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            // Boca pequeña
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-s * 0.04, bob + s * 0.15);
            ctx.lineTo(s * 0.04, bob + s * 0.15);
            ctx.stroke();
        },

        /* ===== ABEJAS (Bosque Dulce) ===== */
        beeMinor(ctx, s, t) {
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
            ctx.beginPath();
            ctx.arc(-s * 0.1, -s * 0.2, s * 0.04, 0, Math.PI * 2);
            ctx.arc(s * 0.1, -s * 0.2, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
            // Aguijón
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(0, s * 0.4); ctx.lineTo(-s * 0.05, s * 0.5); ctx.lineTo(s * 0.05, s * 0.5);
            ctx.fill();
        },

        /* ===== DRAGÓN JOVEN (Tierra Dragones) ===== */
        dragonMinor(ctx, s, t) {
            const wing = Math.sin(t * 0.2) * 0.3;
            // Alas
            ctx.fillStyle = '#660033';
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.05);
            ctx.lineTo(-s * 0.4, -s * 0.3 - wing * s);
            ctx.lineTo(-s * 0.25, 0);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.05);
            ctx.lineTo(s * 0.4, -s * 0.3 - wing * s);
            ctx.lineTo(s * 0.25, 0);
            ctx.fill();
            // Cuerpo
            const grad = ctx.createRadialGradient(0, -s * 0.1, s * 0.05, 0, 0, s * 0.3);
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
            ctx.moveTo(-s * 0.05, -s * 0.3); ctx.lineTo(-s * 0.08, -s * 0.4); ctx.lineTo(-s * 0.02, -s * 0.3);
            ctx.moveTo(s * 0.05, -s * 0.3); ctx.lineTo(s * 0.08, -s * 0.4); ctx.lineTo(s * 0.02, -s * 0.3);
            ctx.fill();
            // Ojos
            ctx.fillStyle = '#ff0';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(-s * 0.05, -s * 0.2, s * 0.03, 0, Math.PI * 2);
            ctx.arc(s * 0.05, -s * 0.2, s * 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        },

        /* ===== HIELO GOLEM (Cumbres Hielo) ===== */
        iceGolemMinor(ctx, s, t) {
            const shimmer = Math.sin(t * 0.1) * 0.1 + 0.9;
            const grad = ctx.createLinearGradient(0, -s * 0.3, 0, s * 0.3);
            grad.addColorStop(0, '#e0f8ff');
            grad.addColorStop(0.5, '#6ef0ff');
            grad.addColorStop(1, '#0066aa');
            ctx.fillStyle = grad;
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

        /* ===== GUSANO (Desierto) ===== */
        wormMinor(ctx, s, t) {
            const wave = Math.sin(t * 0.2);
            // Segmentos
            ctx.fillStyle = '#cc9966';
            for (let i = 0; i < 4; i++) {
                const offset = Math.sin(t * 0.2 + i * 0.5) * s * 0.05;
                ctx.beginPath();
                ctx.ellipse(0, -s * 0.2 + i * s * 0.15 + offset, s * 0.2 - i * s * 0.02, s * 0.1, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            // Cabeza con boca
            ctx.fillStyle = '#996633';
            ctx.beginPath();
            ctx.arc(0, -s * 0.3, s * 0.2, 0, Math.PI * 2);
            ctx.fill();
            // Boca circular
            ctx.fillStyle = '#220';
            ctx.beginPath();
            ctx.arc(0, -s * 0.3, s * 0.12, 0, Math.PI * 2);
            ctx.fill();
            // Dientes
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * s * 0.12, -s * 0.3 + Math.sin(a) * s * 0.12);
                ctx.lineTo(Math.cos(a) * s * 0.08, -s * 0.3 + Math.sin(a) * s * 0.08);
                ctx.lineTo(Math.cos(a + 0.2) * s * 0.12, -s * 0.3 + Math.sin(a + 0.2) * s * 0.12);
                ctx.fill();
            }
        },

        /* ===== TIGRE (Selva Mágica) ===== */
        tigerMinor(ctx, s, t) {
            const grad = ctx.createRadialGradient(0, 0, s * 0.05, 0, 0, s * 0.4);
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
            ctx.moveTo(-s * 0.25, -s * 0.25); ctx.lineTo(-s * 0.15, -s * 0.4); ctx.lineTo(-s * 0.1, -s * 0.25);
            ctx.moveTo(s * 0.25, -s * 0.25); ctx.lineTo(s * 0.15, -s * 0.4); ctx.lineTo(s * 0.1, -s * 0.25);
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

        /* ===== DEFAULT (slime menor como fallback) ===== */
        slime(ctx, s, t) {
            this.slimeMinor(ctx, s, t);
        }
    },

    /* ============ COFRE / PREMIO (canvas, sin imagen) ============ */
    drawChest(ctx, x, y, size, t = 0, open = false) {
        ctx.save();
        ctx.translate(x, y);
        const s = size / 40;
        ctx.scale(s, s);

        // Brillo mágico pulsante
        const pulse = 0.5 + Math.sin(t * 0.1) * 0.3;
        const glowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
        glowGrad.addColorStop(0, `rgba(255, 215, 0, ${pulse * 0.5})`);
        glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();

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
            // Brillo dorado saliendo
            const innerGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
            innerGrad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
            innerGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
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
        // Brillo en el oro
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(-17, 5, 4, 1);
        ctx.fillRect(-17, -13, 4, 1);

        ctx.restore();
    },

    /* ============ POWER-UPS (canvas, con titileo mágico) ============ */
    drawPowerUp(ctx, x, y, type, t = 0) {
        ctx.save();
        ctx.translate(x, y);
        // Titileo más pronunciado
        const pulse = 1 + Math.sin(t * 0.15) * 0.2;
        const blink = (Math.floor(t / 20) % 4 === 0) ? 0.7 : 1;
        ctx.scale(pulse, pulse);
        ctx.globalAlpha = blink;

        // Colores temáticos
        const colors = {
            triple: '#6ef0ff',
            shield: '#6ef0ff',
            kiss: '#ff6ec7',
            rose: '#ff0066',
            speed: '#ffff00',
            life: '#ff3366',
            ally: '#ff9ed6',
            bomb: '#ff3300',
            starfall: '#FFD700',
            timeWarp: '#aa66ff'
        };
        const c = colors[type] || '#FFD700';

        // Halo mágico grande
        const haloGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
        haloGrad.addColorStop(0, `rgba(255, 215, 0, ${0.6 * blink})`);
        haloGrad.addColorStop(0.5, this._hexToRgba(c, 0.3));
        haloGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();

        // Anillo giratorio brillante (titileo)
        ctx.strokeStyle = c;
        ctx.lineWidth = 3;
        ctx.shadowColor = c;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 18, t * 0.08, t * 0.08 + Math.PI * 1.4);
        ctx.stroke();
        // Segundo anillo contrario
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 22, -t * 0.06, -t * 0.06 + Math.PI);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Círculo base oscuro
        ctx.fillStyle = 'rgba(20, 5, 40, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icono específico por tipo
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
                ctx.moveTo(0, -8); ctx.lineTo(6, -4); ctx.lineTo(6, 4); ctx.lineTo(0, 8); ctx.lineTo(-6, 4); ctx.lineTo(-6, -4);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.stroke();
            },
            ally: () => {
                ctx.fillStyle = '#ff9ed6';
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFD700';
                this._drawStar(ctx, 0, -7, 5, 4, 2);
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
                ctx.fillStyle = '#660022';
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();
            },
            speed: () => {
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.moveTo(-2, -8); ctx.lineTo(4, -2); ctx.lineTo(0, 0); ctx.lineTo(4, 8); ctx.lineTo(-4, 2); ctx.lineTo(0, 0);
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
                ctx.moveTo(0, -5); ctx.lineTo(3, -8);
                ctx.stroke();
                ctx.fillStyle = '#ff3300';
                ctx.shadowColor = '#ff3300';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(3, -8, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            },
            starfall: () => {
                ctx.fillStyle = '#FFD700';
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                this._drawStar(ctx, 0, 0, 5, 8, 3);
                ctx.shadowBlur = 0;
            },
            timeWarp: () => {
                ctx.strokeStyle = '#aa66ff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 1.5);
                ctx.stroke();
                // Reloj
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.lineTo(0, -6);
                ctx.moveTo(0, 0); ctx.lineTo(4, 2);
                ctx.stroke();
            }
        };
        if (drawers[type]) drawers[type]();

        ctx.restore();
    },

    _hexToRgba(hex, alpha) {
        if (hex.startsWith('rgba')) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
        ctx.fillStyle = '#b8860b';
        this._drawStar(ctx, 0, 0, 5, 4, 2);
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
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const r = size * 0.4 * (0.8 + Math.sin(i * 3) * 0.2);
            const px = Math.cos(a) * r, py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
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
        ctx.moveTo(0, 0); ctx.lineTo(size, -size * 0.15); ctx.lineTo(size * 1.1, 0); ctx.lineTo(size, size * 0.15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
};

window.Assets = Assets;
