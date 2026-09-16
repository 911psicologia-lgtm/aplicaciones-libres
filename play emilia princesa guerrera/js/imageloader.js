/* ============================================================
   IMAGE LOADER - Carga todas las imágenes de assets/
   ============================================================ */

const ImageLoader = {
    images: {},
    loaded: false,
    onload: null,

    /* Lista de todas las imágenes a cargar */
    manifest: {
        // Heroínas (12 princesas del collage + 6 elementales nuevas + 2 individuales)
        princess_pink: 'assets/princesses/princess_pink.png',
        princess_silver: 'assets/princesses/princess_silver.png',
        princess_01: 'assets/princesses/princess_01.png',
        princess_02: 'assets/princesses/princess_02.png',
        princess_03: 'assets/princesses/princess_03.png',
        princess_04: 'assets/princesses/princess_04.png',
        princess_05: 'assets/princesses/princess_05.png',
        princess_06: 'assets/princesses/princess_06.png',
        princess_07: 'assets/princesses/princess_07.png',
        princess_08: 'assets/princesses/princess_08.png',
        princess_09: 'assets/princesses/princess_09.png',
        princess_10: 'assets/princesses/princess_10.png',
        princess_11: 'assets/princesses/princess_11.png',
        princess_12: 'assets/princesses/princess_12.png',
        // Nuevas princesas elementales con poderes únicos
        princess_ice: 'assets/princesses/princess_ice.png',
        princess_fire: 'assets/princesses/princess_fire.png',
        princess_lightning: 'assets/princesses/princess_lightning.png',
        princess_shadow: 'assets/princesses/princess_shadow.png',
        princess_light: 'assets/princesses/princess_light.png',
        princess_nature: 'assets/princesses/princess_nature.png',

        // Villanos (6 del collage)
        villain_01: 'assets/villains/villain_01.png',
        villain_02: 'assets/villains/villain_02.png',
        villain_03: 'assets/villains/villain_03.png',
        villain_04: 'assets/villains/villain_04.png',
        villain_05: 'assets/villains/villain_05.png',
        villain_06: 'assets/villains/villain_06.png',

        // Criaturas (9 del collage)
        creature_01: 'assets/enemies/creature_01.png',
        creature_02: 'assets/enemies/creature_02.png',
        creature_03: 'assets/enemies/creature_03.png',
        creature_04: 'assets/enemies/creature_04.png',
        creature_05: 'assets/enemies/creature_05.png',
        creature_06: 'assets/enemies/creature_06.png',
        creature_07: 'assets/enemies/creature_07.png',
        creature_08: 'assets/enemies/creature_08.png',
        creature_09: 'assets/enemies/creature_09.png',

        // Cofres (6 estados)
        chest_closed: 'assets/chests/chest_01.png',
        chest_open_empty: 'assets/chests/chest_02.png',
        chest_open_gold: 'assets/chests/chest_03.png',
        chest_closed_red: 'assets/chests/chest_04.png',
        chest_open_red_gold: 'assets/chests/chest_05.png',
        chest_ornate: 'assets/chests/chest_06.png',

        // Fondos realistas por mundo
        bg_slime: 'assets/backgrounds/bg_slime_meadow.png',
        bg_candy: 'assets/backgrounds/bg_candy_forest.png',
        bg_fire: 'assets/backgrounds/bg_volcano.png',
        bg_ice: 'assets/backgrounds/bg_ice_peaks.png',
        bg_neon: 'assets/backgrounds/bg_neon_city.png',
        bg_cookie: 'assets/backgrounds/bg_cookie_world.png',
        bg_ocean: 'assets/backgrounds/bg_underwater.png',
        bg_desert: 'assets/backgrounds/bg_desert.png',
        bg_jungle: 'assets/backgrounds/bg_jungle.png',
        bg_haunted: 'assets/backgrounds/bg_haunted.png',
        bg_clouds: 'assets/backgrounds/bg_clouds.png',
        bg_space: 'assets/backgrounds/bg_space.png',
        bg_roses: 'assets/backgrounds/bg_rose_garden.png',
        bg_mine: 'assets/backgrounds/bg_crystal_mine.png',
        bg_sun: 'assets/backgrounds/bg_sun_temple.png',
        bg_dragon: 'assets/backgrounds/bg_dragon_lands.png',
        bg_swamp: 'assets/backgrounds/bg_swamp.png',
        bg_toys: 'assets/backgrounds/bg_toy_workshop.png',
        bg_crystal: 'assets/backgrounds/bg_crystal_dimension.png',
        bg_dark: 'assets/backgrounds/bg_dark_throne.png',

        // Castillos (también como fondos alternativos)
        castle_pink_blue: 'assets/backgrounds/castle_pink_blue.png',
        castle_pink_towers: 'assets/backgrounds/castle_pink_towers.png',
        castle_bridge: 'assets/backgrounds/castle_bridge.png',
        castle_landscape: 'assets/backgrounds/castle_landscape.png',
        castle_clouds_rainbow: 'assets/backgrounds/castle_clouds_rainbow.png',
        castle_gothic_night: 'assets/backgrounds/castle_gothic_night.png',
        castle_gothic_cliff: 'assets/backgrounds/castle_gothic_cliff.png',

        // Iconos kawaii y lavanda para power-ups
        icon_kawaii_01: 'assets/icons/kawaii_01.png',
        icon_kawaii_02: 'assets/icons/kawaii_02.png',
        icon_kawaii_03: 'assets/icons/kawaii_03.png',
        icon_kawaii_04: 'assets/icons/kawaii_04.png',
        icon_kawaii_05: 'assets/icons/kawaii_05.png',
        icon_kawaii_06: 'assets/icons/kawaii_06.png',
        icon_kawaii_07: 'assets/icons/kawaii_07.png',
        icon_kawaii_08: 'assets/icons/kawaii_08.png',
        icon_kawaii_09: 'assets/icons/kawaii_09.png',
        icon_kawaii_10: 'assets/icons/kawaii_10.png',
        icon_lavender_01: 'assets/icons/lavender_01.png',
        icon_lavender_02: 'assets/icons/lavender_02.png',
        icon_lavender_03: 'assets/icons/lavender_03.png',
        icon_lavender_04: 'assets/icons/lavender_04.png',
        icon_lavender_05: 'assets/icons/lavender_05.png'
    },

    /* Mapeo de tipos de bala a iconos */
    bulletIconMap: {
        triple: 'icon_kawaii_05',
        shield: 'icon_kawaii_06',
        kiss: 'icon_kawaii_07',
        rose: 'icon_kawaii_08',
        speed: 'icon_kawaii_09',
        life: 'icon_kawaii_10',
        ally: 'icon_kawaii_04',
        bomb: 'icon_lavender_01'
    },

    /* Inicia la carga asíncrona de todas las imágenes */
    loadAll(callback) {
        this.onload = callback;
        const keys = Object.keys(this.manifest);
        let loaded = 0;
        const total = keys.length;

        if (total === 0) {
            this.loaded = true;
            if (callback) callback();
            return;
        }

        keys.forEach(key => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                loaded++;
                if (loaded >= total) {
                    this.loaded = true;
                    if (callback) callback();
                }
            };
            img.onerror = () => {
                // No fallar si una imagen no carga, solo continuar
                loaded++;
                if (loaded >= total) {
                    this.loaded = true;
                    if (callback) callback();
                }
            };
            img.src = this.manifest[key];
        });
    },

    /* Obtiene una imagen por clave */
    get(key) {
        return this.images[key] || null;
    },

    /* Verifica si una imagen está cargada */
    has(key) {
        return !!this.images[key];
    },

    /* Dibuja una imagen escalada y centrada, opcionalmente con flip horizontal */
    draw(ctx, key, x, y, size, opts = {}) {
        const img = this.get(key);
        if (!img) return false;
        const w = opts.width || size;
        const h = opts.height || size;
        const flip = opts.flip || false;
        const tint = opts.tint || null;
        const alpha = opts.alpha !== undefined ? opts.alpha : 1;
        const glow = opts.glow || false;
        const glowColor = opts.glowColor || '#ffffff';

        ctx.save();
        ctx.globalAlpha = alpha;
        if (glow) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = 15;
        }
        if (flip) {
            ctx.translate(x, y);
            ctx.scale(-1, 1);
            ctx.translate(-x, -y);
        }
        if (tint) {
            // Dibuja imagen, luego aplica tinte
            ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = tint;
            ctx.fillRect(x - w / 2, y - h / 2, w, h);
        } else {
            ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
        }
        ctx.restore();
        return true;
    },

    /* Dibuja imagen con rotación */
    drawRotated(ctx, key, x, y, size, angle, opts = {}) {
        const img = this.get(key);
        if (!img) return false;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = opts.alpha !== undefined ? opts.alpha : 1;
        if (opts.glow) {
            ctx.shadowColor = opts.glowColor || '#ffffff';
            ctx.shadowBlur = 15;
        }
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        ctx.restore();
        return true;
    },

    /* Dibuja imagen como fondo cubriendo toda la pantalla con parallax sutil */
    drawBackground(ctx, key, canvasW, canvasH, scrollY = 0, opts = {}) {
        const img = this.get(key);
        if (!img) return false;
        const imgRatio = img.width / img.height;
        const canvasRatio = canvasW / canvasH;
        let dw, dh;
        if (imgRatio > canvasRatio) {
            // Imagen más ancha, ajustar por altura
            dh = canvasH;
            dw = dh * imgRatio;
        } else {
            dw = canvasW;
            dh = dw / imgRatio;
        }
        // Centrar y aplicar scroll vertical sutil
        const dx = (canvasW - dw) / 2;
        const dy = (canvasH - dh) / 2 + scrollY * 0.3;

        ctx.save();
        ctx.globalAlpha = opts.alpha !== undefined ? opts.alpha : 1;
        ctx.drawImage(img, dx, dy, dw, dh);

        // Overlay de color opcional
        if (opts.tint) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = opts.tint;
            ctx.fillRect(0, 0, canvasW, canvasH);
        }
        // Viñeta
        if (opts.vignette !== false) {
            ctx.globalCompositeOperation = 'source-over';
            const grad = ctx.createRadialGradient(canvasW / 2, canvasH / 2, canvasH * 0.3, canvasW / 2, canvasH / 2, canvasH * 0.8);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(0,0,0,0.5)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvasW, canvasH);
        }
        ctx.restore();
        return true;
    }
};

window.ImageLoader = ImageLoader;
