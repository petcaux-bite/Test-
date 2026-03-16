// ===== Monde 2D – Graphismes style Blabland =====

class World {
    constructor(width, height) {
        this.width    = width;   // 4000
        this.height   = height;  // 1400
        this.SURFACE_Y = 420;

        this._surfaces   = [];
        this._caves      = [];
        this._lavaPools  = [];
        this.cavePortals = [];

        this.adminArea = { x: 2556, yMax: 318, width: 750 };

        this.objects = [];
        this.zones   = [];

        this._buildWorld();
    }

    _buildWorld() {
        this._buildSurfaces();
        this._buildCaves();
        this._buildDecorations();
        this._buildZones();
    }

    // ══════════════════════════════════════════════════════════════════
    // SURFACES PHYSIQUES
    // ══════════════════════════════════════════════════════════════════
    _buildSurfaces() {
        const S = this.SURFACE_Y;

        // Surface principale (continue – les entrées de grottes se font via portails)
        this._addGround(0,    S, 500);
        this._addGround(500,  S, 90);   // bouche trou 1
        this._addGround(590,  S, 360);
        this._addGround(950,  S, 90);   // bouche trou 2
        this._addGround(1040, S, 480);
        this._addGround(1520, S - 35, 160); // colline
        this._addGround(1680, S, 80);   // bouche trou 3
        this._addGround(1760, S, 320);
        this._addGround(2080, S, 80);   // bouche trou 4
        this._addGround(2160, S, 240);
        this._addGround(2400, S, 1600);

        // Plateformes flottantes
        const floats = [
            { x: 80,   y: S - 100, w: 120 }, { x: 250,  y: S - 150, w: 100 },
            { x: 390,  y: S - 120, w: 80  }, { x: 435,  y: S - 165, w: 80  },
            { x: 620,  y: S - 130, w: 120 }, { x: 780,  y: S - 170, w: 100 },
            { x: 920,  y: S - 120, w: 80  }, { x: 1065, y: S - 140, w: 120 },
            { x: 1240, y: S - 180, w: 100 }, { x: 1395, y: S - 130, w: 80  },
            { x: 1535, y: S - 100, w: 80  }, { x: 1610, y: S - 175, w: 100 },
            { x: 1730, y: S - 215, w: 80  }, { x: 1830, y: S - 140, w: 120 },
            { x: 1995, y: S - 180, w: 100 }, { x: 2130, y: S - 120, w: 80  },
            { x: 2230, y: S - 160, w: 80  }, { x: 2330, y: S - 220, w: 80  },
            { x: 2395, y: S - 260, w: 80  },
            // Escalier forteresse admin
            { x: 2455, y: S - 30,  w: 80  }, { x: 2495, y: S - 60,  w: 80  },
            { x: 2525, y: S - 90,  w: 80  }, { x: 2548, y: S - 118, w: 80  },
            // Intérieur forteresse
            { x: 2625, y: 215, w: 200 }, { x: 2885, y: 230, w: 180 },
            { x: 2755, y: 155, w: 120 },
        ];
        for (const p of floats) {
            this._surfaces.push({ x: p.x, y: p.y, width: p.w, type: 'platform' });
        }

        // Grotte niveau 1
        this._addGround(400, 820, 360);
        this._addGround(760, 820, 70);  // bouche trou fond grotte 1
        this._addGround(830, 820, 270);
        this._surfaces.push({ x: 455,  y: 700, width: 100, type: 'platform' });
        this._surfaces.push({ x: 605,  y: 660, width: 120, type: 'platform' });
        this._surfaces.push({ x: 755,  y: 730, width: 90,  type: 'platform' });
        this._surfaces.push({ x: 885,  y: 710, width: 100, type: 'platform' });
        this._surfaces.push({ x: 985,  y: 670, width: 80,  type: 'platform' });

        // Grotte profonde
        this._addGround(680,  1140, 320);
        this._addGround(1000, 1140, 100); // bouche trou fond grotte profonde
        this._addGround(1100, 1140, 650);
        this._surfaces.push({ x: 700,  y: 1000, width: 80,  type: 'platform' });
        this._surfaces.push({ x: 835,  y: 1050, width: 100, type: 'platform' });
        this._surfaces.push({ x: 1005, y: 1080, width: 80,  type: 'platform' });
        this._surfaces.push({ x: 1115, y: 1020, width: 80,  type: 'platform' });
        this._surfaces.push({ x: 1255, y: 980,  width: 100, type: 'platform' });
        this._surfaces.push({ x: 1405, y: 1040, width: 80,  type: 'platform' });
        this._surfaces.push({ x: 1555, y: 1000, width: 80,  type: 'platform' });

        // Forteresse admin
        this._addGround(2555, 302, 750);
        this._addGround(2585, 213, 530);
        this._addGround(2705, 153, 180);
    }

    _addGround(x, y, width) {
        this._surfaces.push({ x, y, width, type: 'ground' });
    }

    _buildCaves() {
        this._caves.push({ x: 390, width: 780,  ceilY: 490, floorY: 835,  type: 'shallow' });
        this._caves.push({ x: 640, width: 1150, ceilY: 865, floorY: 1160, type: 'deep'    });
        this._lavaPools = [
            { x: 1000, y: 1140, width: 100 },
            { x: 1685, y: 1140, width: 80  },
        ];
    }

    _buildDecorations() {
        const S = this.SURFACE_Y;

        // Portails d'entrée / sortie des grottes (interaction touche E)
        this.cavePortals = [
            // Entrées surface → grotte 1
            { x: 545,  y: S,    destX: 600,  destY: 790,  label: '⛏ Entrer',   dir: 'down' },
            { x: 995,  y: S,    destX: 880,  destY: 790,  label: '⛏ Entrer',   dir: 'down' },
            // Sorties grotte 1 → surface
            { x: 600,  y: 820,  destX: 545,  destY: S,    label: '↑ Sortir',   dir: 'up'   },
            { x: 880,  y: 820,  destX: 995,  destY: S,    label: '↑ Sortir',   dir: 'up'   },
            // Entrées grotte 1 → grotte profonde
            { x: 720,  y: 820,  destX: 780,  destY: 1110, label: '⛏ Descendre', dir: 'down' },
            // Sortie grotte profonde → grotte 1
            { x: 780,  y: 1140, destX: 720,  destY: 790,  label: '↑ Remonter', dir: 'up'   },
        ];

        this.objects = [
            // Village
            { type: 'house',      x: 140,  y: S },
            { type: 'tree',       x: 60,   y: S, s: 1.2 },
            { type: 'tree',       x: 220,  y: S, s: 0.9 },
            { type: 'bench',      x: 310,  y: S },
            { type: 'lamp',       x: 390,  y: S },
            { type: 'flower',     x: 55,   y: S, c: '#FF69B4' },
            { type: 'flower',     x: 170,  y: S, c: '#FF4081' },
            { type: 'flower',     x: 455,  y: S, c: '#FFD700' },
            { type: 'heart',      x: 90,   y: S - 20 },
            { type: 'heart',      x: 360,  y: S - 25 },
            { type: 'balloon',    x: 120,  y: S - 90,  c: '#FF5252' },
            { type: 'balloon',    x: 350,  y: S - 75,  c: '#FFD740' },
            { type: 'sign',       x: 482,  y: S, text: '⛏ Grottes →' },
            // Pont de pierre (arc sur le trou de grotte 1)
            { type: 'stonearch',  x: 550,  y: S },
            // Plaines
            { type: 'tree',       x: 680,  y: S, s: 1.0 },
            { type: 'tree',       x: 800,  y: S, s: 1.1 },
            { type: 'flower',     x: 720,  y: S, c: '#E91E63' },
            { type: 'flower',     x: 850,  y: S, c: '#9C27B0' },
            { type: 'bench',      x: 875,  y: S },
            { type: 'heart',      x: 640,  y: S - 18 },
            { type: 'balloon',    x: 700,  y: S - 85,  c: '#69F0AE' },
            { type: 'balloon',    x: 900,  y: S - 70,  c: '#FF4081' },
            { type: 'sign',       x: 933,  y: S, text: '⛏ Grottes →' },
            // Forêt
            { type: 'tree',       x: 1105, y: S, s: 1.3 },
            { type: 'tree',       x: 1210, y: S, s: 1.0 },
            { type: 'tree',       x: 1360, y: S, s: 1.2 },
            { type: 'tree',       x: 1610, y: S - 35, s: 0.9 },
            { type: 'palmtree',   x: 1905, y: S, s: 1.0 },
            { type: 'flower',     x: 1150, y: S, c: '#FF6D00' },
            { type: 'heart',      x: 1280, y: S - 22 },
            { type: 'balloon',    x: 1100, y: S - 80,  c: '#40C4FF' },
            { type: 'balloon',    x: 1500, y: S - 95,  c: '#FF4081' },
            // Admin
            { type: 'adminportal',x: 2750, y: 302 },
            { type: 'lamp',       x: 2565, y: 302 },
            { type: 'lamp',       x: 3245, y: 302 },
            { type: 'tree',       x: 2710, y: 302, s: 0.7 },
            { type: 'tree',       x: 3115, y: 302, s: 0.7 },
            { type: 'heart',      x: 2650, y: 302 - 18 },
            { type: 'balloon',    x: 2900, y: 302 - 80,  c: '#FFD700' },
            // Portails grotte (visuels)
            { type: 'caveportal', x: 545,  y: S,    label: '⛏ Grottes', dir: 'down' },
            { type: 'caveportal', x: 995,  y: S,    label: '⛏ Grottes', dir: 'down' },
            { type: 'caveexit',   x: 600,  y: 820,  label: '↑ Sortir',   dir: 'up'   },
            { type: 'caveexit',   x: 880,  y: 820,  label: '↑ Sortir',   dir: 'up'   },
            { type: 'caveportal', x: 720,  y: 820,  label: '⛏ Plus bas', dir: 'down' },
            { type: 'caveexit',   x: 780,  y: 1140, label: '↑ Remonter', dir: 'up'   },
            // Grottes
            { type: 'crystal',    x: 505,  y: 820 },
            { type: 'crystal',    x: 705,  y: 820 },
            { type: 'crystal',    x: 905,  y: 820 },
            { type: 'mushroom',   x: 605,  y: 820 },
            { type: 'mushroom',   x: 855,  y: 820 },
            // Grottes profondes
            { type: 'crystal',    x: 755,  y: 1140 },
            { type: 'crystal',    x: 1205, y: 1140 },
            { type: 'crystal',    x: 1505, y: 1140 },
            { type: 'mushroom',   x: 905,  y: 1140 },
        ];
    }

    _buildZones() {
        this.zones = [
            { name: 'Village',              x: 0,    width: 590,  color: '#4CAF50' },
            { name: 'Plaines',              x: 590,  width: 450,  color: '#66BB6A' },
            { name: 'Forêt',               x: 1040, width: 1120, color: '#43A047' },
            { name: 'Désert',              x: 2160, width: 390,  color: '#FDD835' },
            { name: '🛡️ Forteresse Admin', x: 2550, width: 1450, color: '#CE93D8' },
        ];
    }

    // ══════════════════════════════════════════════════════════════════
    // ACCESSEURS
    // ══════════════════════════════════════════════════════════════════
    getAllSurfaces() { return this._surfaces; }

    getCoinSpawns() {
        const S = this.SURFACE_Y;
        return [
            // Village
            {x: 95,  y: S - 5}, {x: 140, y: S - 5}, {x: 185, y: S - 5},
            // Plateformes flottantes
            {x: 92,  y: S - 108}, {x: 117, y: S - 108},
            {x: 262, y: S - 158}, {x: 292, y: S - 158},
            {x: 642, y: S - 138}, {x: 667, y: S - 138},
            // Plaines
            {x: 705, y: S - 5},  {x: 745, y: S - 5},
            {x: 800, y: S - 178},{x: 830, y: S - 178},
            // Forêt
            {x: 1100, y: S - 5}, {x: 1140, y: S - 5}, {x: 1180, y: S - 5},
            {x: 1070, y: S - 148},{x: 1260, y: S - 188},
            // Désert
            {x: 2200, y: S - 5}, {x: 2250, y: S - 5},
            {x: 2340, y: S - 228},{x: 2000, y: S - 188},
            // Grotte 1
            {x: 510,  y: 810},   {x: 620,  y: 810},   {x: 860, y: 810},
            {x: 610,  y: 652},   {x: 760,  y: 722},
            // Grotte profonde
            {x: 750,  y: 1125},  {x: 910,  y: 1125},  {x: 1210,y: 1125},
            {x: 840,  y: 1042},  {x: 1120, y: 1012},
        ];
    }

    getPotionSpawns() {
        const S = this.SURFACE_Y;
        return [
            {x: 420,  y: S - 5,    type: 'speed'},
            {x: 1560, y: S - 5,    type: 'speed'},
            {x: 795,  y: S - 178,  type: 'grow'},
            {x: 1250, y: S - 5,    type: 'grow'},
            {x: 650,  y: S - 138,  type: 'shrink'},
            {x: 1830, y: S - 5,    type: 'shrink'},
            {x: 700,  y: 810,      type: 'speed'},
            {x: 850,  y: 1125,     type: 'grow'},
        ];
    }

    isAdminZone(px, py) {
        return px >= this.adminArea.x
            && px <= this.adminArea.x + this.adminArea.width
            && py <= this.adminArea.yMax;
    }

    getZoneAt(wx, wy) {
        if (wy > 865) return { name: '🔥 Grottes Profondes', color: '#EF5350' };
        if (wy > 490) return { name: '⛏ Grottes Mystérieuses', color: '#90A4AE' };
        for (const z of this.zones) {
            if (wx >= z.x && wx < z.x + z.width) return z;
        }
        return { name: 'BlabWorld', color: '#fff' };
    }

    // ══════════════════════════════════════════════════════════════════
    // RENDU
    // ══════════════════════════════════════════════════════════════════
    draw(ctx, camera) {
        const cw = ctx.canvas.width, ch = ctx.canvas.height;

        this._drawBackground(ctx, camera, cw, ch);
        this._drawUndergroundFill(ctx, camera, cw, ch);
        this._drawCaves(ctx, camera, cw, ch);
        this._drawTerrainSurfaces(ctx, camera, cw, ch);
        this._drawPlatforms(ctx, camera, cw, ch);
        this._drawLava(ctx, camera, cw, ch);
        this._drawAdminFortress(ctx, camera, cw, ch);

        for (const obj of this.objects) {
            const sx = obj.x - camera.x, sy = obj.y - camera.y;
            if (sx < -180 || sx > cw + 180) continue;
            this._drawObject(ctx, obj, sx, sy);
        }

        this._drawCaveDecorations(ctx, camera, cw, ch);
    }

    // ──────────────────────────────────────────────────────────────────
    // FOND : CIEL BLABLAND (bleu lumineux de jour)
    // ──────────────────────────────────────────────────────────────────
    _drawBackground(ctx, camera, cw, ch) {
        if (camera.y < 600) {
            // Ciel style screenshot : bleu clair lumineux
            const g = ctx.createLinearGradient(0, 0, 0, ch);
            g.addColorStop(0,    '#87CEEB');
            g.addColorStop(0.55, '#B8E3F5');
            g.addColorStop(1,    '#D4F0FF');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, cw, ch);

            this._drawSun(ctx, camera);
            this._drawBgHills(ctx, camera, cw, ch);
            this._drawClouds(ctx, camera, cw, ch);
            this._drawBuildingBg(ctx, camera, cw, ch);
        } else {
            const depth = Math.max(0, camera.y - 500);
            const r = Math.max(5,  28 - depth * 0.018);
            const g = Math.max(3,  16 - depth * 0.01);
            const b = Math.max(5,  32 - depth * 0.018);
            ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
            ctx.fillRect(0, 0, cw, ch);
        }
    }

    _drawSun(ctx, camera) {
        const sx = 180 - camera.x * 0.04;
        const sy = 85  - camera.y * 0.06;
        if (sy < -80 || sy > 300) return;
        const t = Date.now() * 0.0008;

        // Rayons
        ctx.strokeStyle = 'rgba(255,235,59,0.55)';
        ctx.lineWidth   = 3;
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 + t;
            ctx.beginPath();
            ctx.moveTo(sx + Math.cos(a) * 34, sy + Math.sin(a) * 34);
            ctx.lineTo(sx + Math.cos(a) * 52, sy + Math.sin(a) * 52);
            ctx.stroke();
        }
        // Lueur
        ctx.fillStyle = 'rgba(255,236,64,0.12)';
        ctx.beginPath(); ctx.arc(sx, sy, 65, 0, Math.PI * 2); ctx.fill();
        // Corps
        ctx.fillStyle = '#FFEE58';
        ctx.beginPath(); ctx.arc(sx, sy, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FDD835';
        ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill();
        // Visage kawaii
        ctx.fillStyle = '#F9A825';
        ctx.beginPath(); ctx.arc(sx - 9,  sy - 4, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 9,  sy - 4, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#F9A825'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sx, sy + 4, 8, 0.1, Math.PI - 0.1); ctx.stroke();
        // Joues
        ctx.fillStyle = 'rgba(255,100,100,0.3)';
        ctx.beginPath(); ctx.ellipse(sx - 14, sy + 2, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(sx + 14, sy + 2, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    }

    _drawClouds(ctx, camera, cw, ch) {
        const clouds = [
            { x: 300,  y: 90,  r: 55 }, { x: 650,  y: 70,  r: 45 },
            { x: 1000, y: 100, r: 60 }, { x: 1380, y: 80,  r: 50 },
            { x: 1750, y: 95,  r: 55 }, { x: 2100, y: 75,  r: 48 },
            { x: 2500, y: 100, r: 52 }, { x: 2900, y: 85,  r: 45 },
        ];
        for (const c of clouds) {
            const cx = c.x - camera.x * 0.12 + Math.sin(Date.now() * 0.0002 + c.x) * 8;
            const cy = c.y - camera.y * 0.06;
            if (cx + c.r * 3 < 0 || cx - c.r * 3 > cw) continue;
            if (cy + c.r * 2 < 0 || cy > ch) continue;
            this._drawCloud(ctx, cx, cy, c.r);
        }
    }

    // Collines lointaines (arrière-plan parallaxe, style Blabland)
    _drawBgHills(ctx, camera, cw, ch) {
        const gsy = this.SURFACE_Y - camera.y;
        if (gsy > ch + 20) return;

        const hills = [
            { x: 0,    w: 380, h: 130, c: '#B0D8EE' },
            { x: 300,  w: 280, h: 100, c: '#9DCDE8' },
            { x: 520,  w: 420, h: 150, c: '#AFC6E8' },
            { x: 880,  w: 300, h: 110, c: '#9EC8E8' },
            { x: 1100, w: 360, h: 140, c: '#B5D5EE' },
            { x: 1380, w: 320, h: 120, c: '#A4CDE8' },
            { x: 1620, w: 400, h: 145, c: '#ACCDE8' },
            { x: 1950, w: 340, h: 115, c: '#9BC5E8' },
            { x: 2200, w: 380, h: 135, c: '#B2D3EE' },
            { x: 2500, w: 300, h: 100, c: '#A0C8E8' },
            { x: 2700, w: 360, h: 130, c: '#AACEE8' },
        ];
        for (const h of hills) {
            const hx = h.x - camera.x * 0.22;
            if (hx + h.w + 50 < 0 || hx - 50 > cw) continue;
            ctx.fillStyle = h.c;
            ctx.beginPath();
            ctx.moveTo(hx, gsy);
            ctx.quadraticCurveTo(hx + h.w * 0.25, gsy - h.h * 1.2, hx + h.w * 0.5, gsy - h.h);
            ctx.quadraticCurveTo(hx + h.w * 0.75, gsy - h.h * 0.8, hx + h.w, gsy);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Nuage style screenshot : blanc pur, 3 boules rondes bien définies
    _drawCloud(ctx, x, y, r) {
        // Ombre légère sous le nuage
        ctx.fillStyle = 'rgba(150,185,220,0.25)';
        ctx.beginPath(); ctx.ellipse(x, y + r * 0.55, r * 1.5, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();

        // Corps du nuage (blanc pur)
        ctx.fillStyle = '#FFFFFF';
        // Boule centrale (principale)
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        // Boule gauche
        ctx.beginPath(); ctx.arc(x - r * 0.8, y + r * 0.25, r * 0.72, 0, Math.PI * 2); ctx.fill();
        // Boule droite
        ctx.beginPath(); ctx.arc(x + r * 0.85, y + r * 0.22, r * 0.68, 0, Math.PI * 2); ctx.fill();
        // Petite bosse haut-gauche
        ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.38, r * 0.55, 0, Math.PI * 2); ctx.fill();
        // Petite bosse haut-droite
        ctx.beginPath(); ctx.arc(x + r * 0.38, y - r * 0.3, r * 0.5, 0, Math.PI * 2); ctx.fill();

        // Reflet blanc brillant haut-gauche
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.beginPath(); ctx.ellipse(x - r * 0.28, y - r * 0.22, r * 0.4, r * 0.28, -0.4, 0, Math.PI * 2); ctx.fill();
    }

    _drawBuildingBg(ctx, camera, cw, ch) {
        const buildings = [
            { x: 120,  w: 55, h: 110, c: '#FF8A65' }, { x: 230, w: 70, h: 140, c: '#81C784' },
            { x: 370,  w: 48, h: 95,  c: '#64B5F6' }, { x: 520, w: 65, h: 130, c: '#FFB74D' },
            { x: 680,  w: 80, h: 160, c: '#F06292' }, { x: 860, w: 52, h: 105, c: '#4DB6AC' },
            { x: 1050, w: 68, h: 138, c: '#9575CD' }, { x: 1250,w: 60, h: 120, c: '#FF8A65' },
            { x: 1520, w: 78, h: 155, c: '#81C784' }, { x: 1750,w: 55, h: 108, c: '#64B5F6' },
            { x: 2000, w: 65, h: 130, c: '#F06292' }, { x: 2250,w: 75, h: 148, c: '#FFB74D' },
        ];
        const gsy = this.SURFACE_Y - camera.y;
        for (const b of buildings) {
            const bx = b.x - camera.x * 0.28;
            if (bx + b.w < 0 || bx > cw) continue;
            // Bâtiment coloré
            ctx.fillStyle = b.c + '66'; // alpha 40%
            ctx.fillRect(bx, gsy - b.h, b.w, b.h);
            // Toit triangulaire
            ctx.fillStyle = b.c + '88';
            ctx.beginPath();
            ctx.moveTo(bx - 5,        gsy - b.h);
            ctx.lineTo(bx + b.w / 2,  gsy - b.h - 20);
            ctx.lineTo(bx + b.w + 5,  gsy - b.h);
            ctx.closePath(); ctx.fill();
            // Fenêtres
            ctx.fillStyle = 'rgba(255,240,180,0.35)';
            for (let wy = 10; wy < b.h - 15; wy += 24) {
                for (let wx = 8; wx < b.w - 8; wx += 18) {
                    ctx.fillRect(bx + wx, gsy - b.h + wy, 9, 12);
                }
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // REMPLISSAGE SOUTERRAIN
    // ──────────────────────────────────────────────────────────────────
    _drawUndergroundFill(ctx, camera, cw, ch) {
        const sy = this.SURFACE_Y - camera.y;
        if (sy >= ch) return;
        const dy = Math.max(0, sy);
        const g  = ctx.createLinearGradient(0, dy, 0, dy + Math.min(500, ch - dy));
        g.addColorStop(0,   '#5D3A1A');
        g.addColorStop(0.3, '#4A2F14');
        g.addColorStop(1,   '#2A1A0A');
        ctx.fillStyle = g;
        ctx.fillRect(0, dy, cw, ch - dy);
    }

    _drawCaves(ctx, camera, cw, ch) {
        for (const cave of this._caves) {
            const sx = cave.x - camera.x, sy = cave.ceilY - camera.y;
            if (sx + cave.width < 0 || sx > cw || sy + cave.floorY - cave.ceilY < 0 || sy > ch) continue;
            const g = ctx.createLinearGradient(0, Math.max(0, sy), 0, Math.max(0, sy) + cave.floorY - cave.ceilY);
            if (cave.type === 'deep') {
                g.addColorStop(0, '#0d0a14'); g.addColorStop(0.5, '#100d1a'); g.addColorStop(1, '#0a0810');
            } else {
                g.addColorStop(0, '#1a1520'); g.addColorStop(0.5, '#1e1a28'); g.addColorStop(1, '#151220');
            }
            ctx.fillStyle = g;
            const sh = cave.floorY - cave.ceilY;
            ctx.fillRect(Math.max(0, sx), Math.max(0, sy),
                Math.min(cave.width, cw - Math.max(0, sx)),
                Math.min(sh, ch - Math.max(0, sy)));
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // SOL (style Blabland : herbe verte + sol brun strié)
    // ──────────────────────────────────────────────────────────────────
    _drawTerrainSurfaces(ctx, camera, cw, ch) {
        for (const surf of this._surfaces) {
            if (surf.type !== 'ground') continue;
            const sx = surf.x - camera.x, sy = surf.y - camera.y;
            if (sx + surf.width < 0 || sx > cw || sy < -10 || sy > ch) continue;

            const isAdmin = surf.x >= 2550 && surf.y <= 310;
            const isCave  = surf.y >= 800;

            if (isCave) {
                this._drawGroundSegment(ctx, sx, sy, surf.width, 'cave');
            } else if (isAdmin) {
                // Forteresse admin : violet
                ctx.fillStyle = '#4A148C'; ctx.fillRect(sx, sy, surf.width, 60);
                ctx.fillStyle = '#7B1FA2'; ctx.fillRect(sx, sy, surf.width, 6);
                ctx.strokeStyle = '#9C27B0'; ctx.lineWidth = 1;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath(); ctx.moveTo(sx, sy + 15 + i * 10); ctx.lineTo(sx + surf.width, sy + 15 + i * 10); ctx.stroke();
                }
            } else {
                this._drawGroundSegment(ctx, sx, sy, surf.width, 'normal');
            }
        }
    }

    // Segment de sol style Blabland (herbe verte + terre brune striée)
    _drawGroundSegment(ctx, sx, sy, w, type) {
        const soilH = 60;

        if (type === 'cave') {
            // Grotte : roche sombre
            ctx.fillStyle = '#2e2a38'; ctx.fillRect(sx, sy, w, soilH);
            ctx.strokeStyle = '#3d3650'; ctx.lineWidth = 1.5;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath(); ctx.moveTo(sx, sy + 14 + i * 11); ctx.lineTo(sx + w, sy + 14 + i * 11); ctx.stroke();
            }
            // Bordure supérieure lumineuse
            ctx.fillStyle = '#4a3f60'; ctx.fillRect(sx, sy, w, 5);
            return;
        }

        // Sol normal : terre brune style screenshot
        ctx.fillStyle = '#A0683A'; ctx.fillRect(sx, sy, w, soilH);
        // Stries horizontales (texture terre)
        ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(sx, sy + 10 + i * 10);
            ctx.lineTo(sx + w, sy + 10 + i * 10);
            ctx.stroke();
        }
        // Bande sombre juste sous l'herbe
        ctx.fillStyle = '#7A4A20'; ctx.fillRect(sx, sy, w, 5);

        // ─ Herbe à bosses rondes (style screenshot) ────────────────────
        this._drawGrassBumps(ctx, sx, sy, w);
    }

    // Herbe avec bosses semi-circulaires (style screenshot Blabland)
    _drawGrassBumps(ctx, sx, sy, w) {
        const bR = 7; // rayon des bosses
        const bW = bR * 2; // largeur d'une bosse
        const base = sy; // ligne de base = sommet du sol

        // Couche sombre sous les bosses (border foncé)
        ctx.fillStyle = '#3A8C15';
        ctx.fillRect(sx, base - 2, w, bR + 4);

        // Bosses principales (vert vif)
        ctx.fillStyle = '#5DBE3A';
        ctx.beginPath();
        ctx.moveTo(sx, base + 2);
        let bx = sx + bR;
        while (bx < sx + w + bR) {
            const cx = Math.min(bx, sx + w - bR);
            ctx.arc(cx, base, bR, Math.PI, 0);
            bx += bW;
        }
        ctx.lineTo(sx + w, base + 2);
        ctx.lineTo(sx + w, base + bR + 3);
        ctx.lineTo(sx, base + bR + 3);
        ctx.closePath();
        ctx.fill();

        // Reflet clair sur le dessus de chaque bosse
        ctx.fillStyle = '#7ADB52';
        bx = sx + bR;
        while (bx < sx + w - bR) {
            const cx = Math.min(bx, sx + w - bR);
            ctx.beginPath();
            ctx.arc(cx, base, bR * 0.72, Math.PI + 0.4, -0.4);
            ctx.closePath();
            ctx.fill();
            bx += bW;
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // PLATEFORMES (style Blabland : herbe + brun, lava, glace, pierre)
    // ──────────────────────────────────────────────────────────────────
    _drawPlatforms(ctx, camera, cw, ch) {
        for (const p of this._surfaces) {
            if (p.type !== 'platform') continue;
            const sx = p.x - camera.x, sy = p.y - camera.y;
            if (sx + p.width < 0 || sx > cw || sy < -10 || sy > ch) continue;

            const isAdmin = p.x >= 2550;
            const isDeep  = p.y > 860;
            const isCave  = p.y > 490 && !isDeep;

            if (isAdmin) {
                // Plateforme admin cristal violet
                ctx.fillStyle = '#7B1FA2'; ctx.fillRect(sx, sy, p.width, 14);
                ctx.fillStyle = '#CE93D8'; ctx.fillRect(sx, sy, p.width, 4);
                ctx.fillStyle = 'rgba(200,100,255,0.2)'; ctx.fillRect(sx, sy, p.width, 14);
            } else if (isDeep) {
                // Grotte profonde : roche violacée + lueur
                ctx.fillStyle = '#546E7A'; ctx.fillRect(sx, sy, p.width, 14);
                ctx.fillStyle = '#78909C'; ctx.fillRect(sx, sy, p.width, 4);
                ctx.fillStyle = 'rgba(120,50,220,0.18)'; ctx.fillRect(sx, sy, p.width, 14);
            } else if (isCave) {
                // Grotte niveau 1 : pierre gris-bleuté
                ctx.fillStyle = '#455A64'; ctx.fillRect(sx, sy, p.width, 14);
                ctx.fillStyle = '#607D8B'; ctx.fillRect(sx, sy, p.width, 4);
            } else if (p.stoneType) {
                // Plateforme pierre grise (style screenshot, zone désert/neutre)
                ctx.fillStyle = '#909090'; ctx.fillRect(sx, sy, p.width, 14);
                ctx.fillStyle = '#B0B0B0'; ctx.fillRect(sx, sy, p.width, 4);
                ctx.fillStyle = '#707070'; ctx.fillRect(sx, sy + 10, p.width, 4);
                // Jointures
                ctx.strokeStyle = '#606060'; ctx.lineWidth = 1;
                for (let i = 0; i < Math.floor(p.width / 32); i++) {
                    ctx.beginPath(); ctx.moveTo(sx + i * 32 + 16, sy + 4); ctx.lineTo(sx + i * 32 + 16, sy + 10); ctx.stroke();
                }
            } else {
                // Surface : herbe à bosses + brun (style screenshot)
                const ph = 20;
                ctx.fillStyle = '#A0683A'; ctx.fillRect(sx, sy, p.width, ph);
                ctx.fillStyle = '#7A4A20'; ctx.fillRect(sx, sy, p.width, 5);
                ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(sx, sy + 10); ctx.lineTo(sx + p.width, sy + 10); ctx.stroke();
                this._drawGrassBumps(ctx, sx, sy, p.width);
            }
        }
    }

    _drawLava(ctx, camera, cw, ch) {
        const t = Date.now() * 0.003;
        for (const pool of this._lavaPools) {
            const sx = pool.x - camera.x, sy = pool.y - camera.y;
            if (sx + pool.width < 0 || sx > cw) continue;
            const g = ctx.createLinearGradient(sx, sy, sx, sy + 20);
            g.addColorStop(0, '#FF6D00'); g.addColorStop(0.5, '#DD2C00'); g.addColorStop(1, '#BF360C');
            ctx.fillStyle = g; ctx.fillRect(sx, sy, pool.width, 20);
            ctx.fillStyle = 'rgba(255,100,0,0.12)'; ctx.fillRect(sx, sy - 30, pool.width, 50);
            for (let i = 0; i < 3; i++) {
                const bx = sx + (i + 1) * pool.width / 4 + Math.sin(t + i) * 5;
                const by = sy + Math.sin(t * 2 + i) * 3;
                ctx.fillStyle = '#FF8F00';
                ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
            }
        }
    }

    _drawAdminFortress(ctx, camera, cw, ch) {
        const ax = 2555 - camera.x, ay = 302 - camera.y;
        if (ax + 800 < 0 || ax > cw) return;

        ctx.fillStyle = '#4A148C';
        ctx.fillRect(ax, ay - 125, 65, 125); ctx.fillRect(ax + 690, ay - 125, 65, 125);
        ctx.fillStyle = '#6A1B9A';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(ax + i * 18, ay - 136, 12, 22);
            ctx.fillRect(ax + 690 + i * 18, ay - 136, 12, 22);
        }
        const gx = ax + 380, gy = ay;
        ctx.fillStyle = '#7B1FA2';
        ctx.beginPath(); ctx.moveTo(gx - 26, gy); ctx.lineTo(gx - 26, gy - 52);
        ctx.arc(gx, gy - 52, 26, Math.PI, 0); ctx.lineTo(gx + 26, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#100020';
        ctx.beginPath(); ctx.moveTo(gx - 20, gy); ctx.lineTo(gx - 20, gy - 47);
        ctx.arc(gx, gy - 47, 20, Math.PI, 0); ctx.lineTo(gx + 20, gy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('⚜ ZONE ADMIN ⚜', ax + 380, ay - 152);
        ctx.fillStyle = '#37474F'; ctx.fillRect(ax + 378, ay - 205, 4, 62);
        ctx.fillStyle = '#7B1FA2'; ctx.fillRect(ax + 382, ay - 205, 42, 26);
        ctx.fillStyle = '#FFD700'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('⚜', ax + 396, ay - 188);
        const st = Date.now() * 0.002;
        for (let i = 0; i < 5; i++) {
            const ex = ax + 80 + i * 140 + Math.sin(st + i) * 6;
            const ey = ay - 75 + Math.cos(st + i * 0.7) * 5;
            ctx.fillStyle = `rgba(255,215,0,${0.25 + Math.sin(st + i) * 0.25})`;
            ctx.font = '16px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('✦', ex, ey);
        }
    }

    _drawCaveDecorations(ctx, camera, cw, ch) {
        const t = Date.now() * 0.001;
        for (const cave of this._caves) {
            const sx = cave.x - camera.x, sy = cave.ceilY - camera.y;
            if (sx + cave.width < 0 || sx > cw) continue;
            const col = cave.type === 'deep' ? '#1a1030' : '#2a2440';
            for (let i = 0; i < Math.floor(cave.width / 40); i++) {
                const stx = cave.x + i * 40 + 15 - camera.x;
                if (stx < -10 || stx > cw + 10) continue;
                const h = 15 + (i % 3) * 10 + Math.sin(i * 0.7) * 8;
                ctx.fillStyle = col;
                ctx.beginPath(); ctx.moveTo(stx - 6, sy); ctx.lineTo(stx + 6, sy);
                ctx.lineTo(stx, sy + h); ctx.closePath(); ctx.fill();
            }
        }
        const deep = this._caves.find(c => c.type === 'deep');
        if (!deep) return;
        for (let i = 0; i < 8; i++) {
            const cx = deep.x + 100 + i * 145 - camera.x;
            if (cx < -30 || cx > cw + 30) continue;
            const cy    = deep.floorY - 28 - camera.y;
            const pulse = 0.08 + Math.sin(t + i * 0.8) * 0.06;
            ctx.fillStyle = `rgba(140,50,240,${pulse})`;
            ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fill();
            const alp = 0.55 + Math.sin(t + i) * 0.2;
            ctx.fillStyle = `rgba(180,100,255,${alp})`;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 22); ctx.lineTo(cx + 9, cy - 5);
            ctx.lineTo(cx + 7, cy + 11); ctx.lineTo(cx - 7, cy + 11);
            ctx.lineTo(cx - 9, cy - 5); ctx.closePath(); ctx.fill();
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // OBJETS DÉCORATIFS
    // ══════════════════════════════════════════════════════════════════
    _drawObject(ctx, obj, sx, sy) {
        switch (obj.type) {
            case 'tree':        this._drawTree(ctx, sx, sy, obj.s || 1); break;
            case 'palmtree':    this._drawPalmTree(ctx, sx, sy, obj.s || 1); break;
            case 'bench':       this._drawBench(ctx, sx, sy); break;
            case 'lamp':        this._drawLamp(ctx, sx, sy); break;
            case 'house':       this._drawHouse(ctx, sx, sy); break;
            case 'flower':      this._drawFlower(ctx, sx, sy, obj.c || '#FF69B4'); break;
            case 'crystal':     this._drawCrystal(ctx, sx, sy); break;
            case 'mushroom':    this._drawMushroom(ctx, sx, sy); break;
            case 'sign':        this._drawSign(ctx, sx, sy, obj.text || ''); break;
            case 'balloon':     this._drawBalloon(ctx, sx, sy, obj.c || '#FF5252'); break;
            case 'heart':       this._drawHeart(ctx, sx, sy); break;
            case 'stonearch':   this._drawStoneArch(ctx, sx, sy); break;
            case 'adminportal': this._drawAdminPortal(ctx, sx, sy); break;
            case 'caveportal':  this._drawCavePortal(ctx, sx, sy, obj.label || '⛏', obj.dir || 'down'); break;
            case 'caveexit':    this._drawCaveExit(ctx, sx, sy, obj.label || '↑', obj.dir || 'up'); break;
        }
    }

    // Arbres style Blabland (boule ronde verte sur tronc brun court)
    _drawTree(ctx, x, y, s) {
        // Tronc court et épais
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.roundRect(x - 6 * s, y - 36 * s, 12 * s, 36 * s, [4, 4, 0, 0]);
        ctx.fill();
        ctx.fillStyle = '#6D4C41';
        ctx.beginPath();
        ctx.roundRect(x - 4 * s, y - 36 * s, 8 * s, 36 * s, [3, 3, 0, 0]);
        ctx.fill();

        // Canopée ronde (style screenshot Blabland)
        const cr = 32 * s; // rayon canopée
        const cy = y - 52 * s;

        // Ombre portée de la canopée
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.beginPath(); ctx.ellipse(x + 4, cy + 4, cr, cr, 0, 0, Math.PI * 2); ctx.fill();

        // Corps principal canopée
        ctx.fillStyle = '#33A020';
        ctx.beginPath(); ctx.arc(x, cy, cr, 0, Math.PI * 2); ctx.fill();

        // Bosse gauche
        ctx.fillStyle = '#2E8B18';
        ctx.beginPath(); ctx.arc(x - cr * 0.65, cy + cr * 0.1, cr * 0.7, 0, Math.PI * 2); ctx.fill();
        // Bosse droite
        ctx.beginPath(); ctx.arc(x + cr * 0.6, cy + cr * 0.12, cr * 0.65, 0, Math.PI * 2); ctx.fill();
        // Bosse dessus
        ctx.fillStyle = '#3DBB28';
        ctx.beginPath(); ctx.arc(x, cy - cr * 0.28, cr * 0.78, 0, Math.PI * 2); ctx.fill();

        // Reflet brillant haut-gauche
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath(); ctx.ellipse(x - cr * 0.35, cy - cr * 0.38, cr * 0.38, cr * 0.28, -0.5, 0, Math.PI * 2); ctx.fill();

        // Lianes pendantes (signature Blabland)
        ctx.strokeStyle = '#256015';
        ctx.lineWidth = 2 * s;
        const vineCount = Math.min(5, Math.floor(3 + s * 2));
        for (let i = 0; i < vineCount; i++) {
            const vx  = x - cr * 0.55 + i * (cr * 1.1 / (vineCount - 1));
            const vh  = 22 + Math.sin(i * 1.5) * 10;
            const swy = Date.now() * 0.0008 + i * 0.9;
            ctx.beginPath();
            ctx.moveTo(vx, cy + cr * 0.6);
            ctx.quadraticCurveTo(
                vx + Math.sin(swy) * 5, cy + cr * 0.6 + vh * 0.5,
                vx + Math.sin(swy) * 3, cy + cr * 0.6 + vh
            );
            ctx.stroke();
            // Petite feuille
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.ellipse(vx + Math.sin(swy) * 3, cy + cr * 0.6 + vh, 4 * s, 2.5 * s, Math.sin(swy) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawPalmTree(ctx, x, y, s) {
        ctx.strokeStyle = '#A1887F'; ctx.lineWidth = 9 * s;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 12 * s, y - 40 * s, x + 6 * s, y - 82 * s);
        ctx.stroke();
        ctx.strokeStyle = '#81C784'; ctx.lineWidth = 3;
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x + 6 * s, y - 82 * s);
            ctx.quadraticCurveTo(
                x + 6 * s + Math.cos(a) * 32 * s, y - 82 * s + Math.sin(a) * 16 * s - 8,
                x + 6 * s + Math.cos(a) * 44 * s, y - 82 * s + Math.sin(a) * 22 * s + 6
            ); ctx.stroke();
        }
    }

    _drawBench(ctx, x, y) {
        ctx.fillStyle = '#A1887F';
        ctx.beginPath(); ctx.roundRect(x - 22, y - 16, 44, 5, 3); ctx.fill();
        ctx.fillStyle = '#795548';
        ctx.fillRect(x - 20, y - 16, 4, 16); ctx.fillRect(x + 16, y - 16, 4, 16);
        ctx.fillStyle = '#A1887F';
        ctx.beginPath(); ctx.roundRect(x - 22, y - 30, 44, 4, 2); ctx.fill();
    }

    _drawLamp(ctx, x, y) {
        ctx.fillStyle = '#546E7A'; ctx.fillRect(x - 2, y - 72, 4, 72);
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath(); ctx.arc(x, y - 74, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,220,80,0.12)';
        ctx.beginPath(); ctx.arc(x, y - 52, 52, 0, Math.PI * 2); ctx.fill();
    }

    // Maison style Blabland (colorée, ronde)
    _drawHouse(ctx, x, y) {
        // Base
        ctx.fillStyle = '#FFF9C4';
        ctx.beginPath(); ctx.roundRect(x - 38, y - 68, 76, 68, 8); ctx.fill();
        // Contour
        ctx.strokeStyle = '#FF8A65'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(x - 38, y - 68, 76, 68, 8); ctx.stroke();
        // Toit
        ctx.fillStyle = '#EF5350';
        ctx.beginPath();
        ctx.moveTo(x - 44, y - 68); ctx.lineTo(x, y - 98); ctx.lineTo(x + 44, y - 68);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#C62828'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 44, y - 68); ctx.lineTo(x, y - 98); ctx.lineTo(x + 44, y - 68);
        ctx.stroke();
        // Porte
        ctx.fillStyle = '#FF8A65';
        ctx.beginPath(); ctx.roundRect(x - 10, y - 32, 20, 32, [6, 6, 0, 0]); ctx.fill();
        // Fenêtres
        ctx.fillStyle = '#B3E5FC';
        ctx.beginPath(); ctx.roundRect(x - 32, y - 58, 18, 15, 3); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x + 14, y - 58, 18, 15, 3); ctx.fill();
        ctx.strokeStyle = '#0288D1'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(x - 32, y - 58, 18, 15, 3); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(x + 14, y - 58, 18, 15, 3); ctx.stroke();
        // Cœur sur la maison
        this._drawHeart(ctx, x, y - 80);
    }

    _drawFlower(ctx, x, y, color) {
        ctx.strokeStyle = '#66BB6A'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 18); ctx.stroke();
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 5, y - 18 + Math.sin(a) * 5, 4, 5, a, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#FFF176';
        ctx.beginPath(); ctx.arc(x, y - 18, 3.5, 0, Math.PI * 2); ctx.fill();
    }

    _drawCrystal(ctx, x, y) {
        const alp = 0.65 + Math.sin(Date.now() * 0.002 + x * 0.01) * 0.2;
        ctx.fillStyle = `rgba(150,80,255,${alp})`;
        ctx.beginPath();
        ctx.moveTo(x, y - 26); ctx.lineTo(x + 9, y - 8);
        ctx.lineTo(x + 7, y); ctx.lineTo(x - 7, y); ctx.lineTo(x - 9, y - 8);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(220,160,255,${alp * 0.8})`;
        ctx.beginPath(); ctx.moveTo(x, y - 23); ctx.lineTo(x + 3, y - 10); ctx.lineTo(x - 3, y - 10); ctx.closePath(); ctx.fill();
    }

    _drawMushroom(ctx, x, y) {
        ctx.fillStyle = '#E53935';
        ctx.beginPath(); ctx.arc(x, y - 18, 16, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#FFEBEE';
        ctx.beginPath(); ctx.arc(x - 6, y - 22, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 6, y - 24, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FAFAFA';
        ctx.beginPath(); ctx.roundRect(x - 6, y - 18, 12, 18, [0, 0, 3, 3]); ctx.fill();
    }

    _drawSign(ctx, x, y, text) {
        ctx.fillStyle = '#A1887F'; ctx.fillRect(x - 2, y - 44, 4, 44);
        ctx.fillStyle = '#FFCC02';
        ctx.beginPath(); ctx.roundRect(x - 28, y - 54, 56, 20, 5); ctx.fill();
        ctx.strokeStyle = '#F57F17'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(x - 28, y - 54, 56, 20, 5); ctx.stroke();
        ctx.fillStyle = '#5D4037'; ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center'; ctx.fillText(text, x, y - 40);
    }

    // BALLON animé
    _drawBalloon(ctx, x, y, color) {
        const t  = Date.now() * 0.001;
        const by = Math.sin(t + x * 0.008) * 8;
        // Ficelle
        ctx.strokeStyle = 'rgba(100,100,100,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + by + 16);
        ctx.quadraticCurveTo(x + 4, y + by + 28, x, y + by + 44);
        ctx.stroke();
        // Corps du ballon
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.ellipse(x, y + by, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
        // Reflet
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.ellipse(x - 4, y + by - 5, 4, 6, -0.4, 0, Math.PI * 2); ctx.fill();
        // Noeud
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.ellipse(x, y + by + 16, 3, 3, 0, 0, Math.PI * 2); ctx.fill();
    }

    // PONT DE PIERRE (arc style Blabland)
    _drawStoneArch(ctx, x, y) {
        const aw = 80; // demi-largeur de l'arche
        // Piliers
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(x - aw - 12, y - 60, 22, 60);
        ctx.fillRect(x + aw - 10, y - 60, 22, 60);
        // Corps de l'arche (demi-cercle)
        ctx.strokeStyle = '#78909C'; ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.arc(x, y, aw + 5, Math.PI, 0);
        ctx.stroke();
        ctx.strokeStyle = '#90A4AE'; ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(x, y, aw + 5, Math.PI, 0);
        ctx.stroke();
        // Pierres décoratives sur l'arche
        ctx.fillStyle = '#B0BEC5';
        for (let i = 0; i <= 8; i++) {
            const a  = Math.PI + i * (Math.PI / 8);
            const bx = x + Math.cos(a) * (aw + 5);
            const by = y + Math.sin(a) * (aw + 5);
            ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
        }
        // Tablier du pont (planches)
        ctx.fillStyle = '#A1887F';
        ctx.fillRect(x - aw - 12, y - 14, (aw + 12) * 2, 14);
        ctx.fillStyle = '#8D6E63';
        for (let i = 0; i < (aw + 12) * 2; i += 18) {
            ctx.fillRect(x - aw - 12 + i, y - 14, 2, 14);
        }
        // Garde-corps
        ctx.strokeStyle = '#795548'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - aw - 12, y - 14);
        ctx.lineTo(x - aw - 12, y - 30);
        ctx.moveTo(x + aw + 12, y - 14);
        ctx.lineTo(x + aw + 12, y - 30);
        ctx.stroke();
        ctx.strokeStyle = '#A1887F'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - aw - 12, y - 30);
        ctx.lineTo(x + aw + 12, y - 30);
        ctx.stroke();
    }

    // PORTAIL ADMIN (dans le monde principal – entrée vers l'espace admin)
    _drawAdminPortal(ctx, x, y) {
        const t = Date.now() * 0.002;

        // Arc du portail
        const alp = 0.75 + Math.sin(t) * 0.2;
        ctx.strokeStyle = `rgba(200,100,255,${alp})`;
        ctx.lineWidth   = 5;
        ctx.beginPath();
        ctx.moveTo(x - 30, y);
        ctx.lineTo(x - 30, y - 65);
        ctx.arc(x, y - 65, 30, Math.PI, 0);
        ctx.lineTo(x + 30, y);
        ctx.stroke();

        // Remplissage ondulant violet
        const gr = ctx.createRadialGradient(x, y - 45, 5, x, y - 45, 35);
        gr.addColorStop(0, `rgba(160,0,255,${0.55 + Math.sin(t * 1.4) * 0.2})`);
        gr.addColorStop(1, `rgba(80,0,180,0.15)`);
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(x - 28, y);
        ctx.lineTo(x - 28, y - 65);
        ctx.arc(x, y - 65, 28, Math.PI, 0);
        ctx.lineTo(x + 28, y);
        ctx.closePath();
        ctx.fill();

        // Étoiles dans le portail
        for (let i = 0; i < 5; i++) {
            const a   = t * 1.5 + (i / 5) * Math.PI * 2;
            const pr  = 14 + Math.sin(t * 3 + i) * 5;
            const ppx = x + Math.cos(a) * pr;
            const ppy = y - 48 + Math.sin(a) * pr * 0.55;
            ctx.fillStyle = `rgba(255,220,255,${0.6 + Math.sin(t + i) * 0.3})`;
            ctx.beginPath(); ctx.arc(ppx, ppy, 2, 0, Math.PI * 2); ctx.fill();
        }

        // Texte
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('⚜ Zone Admin', x, y + 18);

        // Symbole ⚜ animé
        ctx.fillStyle = `rgba(255,215,0,${0.8 + Math.sin(t * 2) * 0.2})`;
        ctx.font = `${14 + Math.sin(t) * 2}px sans-serif`;
        ctx.fillText('⚜', x, y - 52);
    }

    // PORTAIL ENTRÉE GROTTE (marron/orange, flèche vers le bas)
    _drawCavePortal(ctx, x, y, label, dir) {
        const t   = Date.now() * 0.0015;
        const alp = 0.6 + Math.sin(t) * 0.25;

        // Arc portail brun
        ctx.strokeStyle = `rgba(180,100,40,${alp})`;
        ctx.lineWidth   = 4;
        ctx.beginPath();
        ctx.moveTo(x - 22, y);
        ctx.lineTo(x - 22, y - 48);
        ctx.arc(x, y - 48, 22, Math.PI, 0);
        ctx.lineTo(x + 22, y);
        ctx.stroke();

        // Remplissage
        const gr = ctx.createRadialGradient(x, y - 34, 3, x, y - 34, 24);
        gr.addColorStop(0, `rgba(120,60,10,${0.5 + Math.sin(t * 1.3) * 0.15})`);
        gr.addColorStop(1, `rgba(60,30,5,0.1)`);
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(x - 20, y);
        ctx.lineTo(x - 20, y - 48);
        ctx.arc(x, y - 48, 20, Math.PI, 0);
        ctx.lineTo(x + 20, y);
        ctx.closePath();
        ctx.fill();

        // Flèche ↓ animée
        const ay = Math.sin(t * 2) * 3;
        ctx.fillStyle = `rgba(255,200,80,${0.8 + Math.sin(t * 2) * 0.2})`;
        ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('▼', x, y - 28 + ay);

        // Label
        ctx.fillStyle = 'rgba(255,200,100,0.9)';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(label, x, y + 14);
    }

    // PORTAIL SORTIE GROTTE (bleu/cyan, flèche vers le haut)
    _drawCaveExit(ctx, x, y, label, dir) {
        const t   = Date.now() * 0.0015;
        const alp = 0.6 + Math.sin(t + 1) * 0.25;

        // Arc portail cyan
        ctx.strokeStyle = `rgba(80,200,220,${alp})`;
        ctx.lineWidth   = 4;
        ctx.beginPath();
        ctx.moveTo(x - 22, y);
        ctx.lineTo(x - 22, y - 48);
        ctx.arc(x, y - 48, 22, Math.PI, 0);
        ctx.lineTo(x + 22, y);
        ctx.stroke();

        // Remplissage
        const gr = ctx.createRadialGradient(x, y - 34, 3, x, y - 34, 24);
        gr.addColorStop(0, `rgba(0,160,200,${0.45 + Math.sin(t * 1.3) * 0.15})`);
        gr.addColorStop(1, `rgba(0,80,120,0.1)`);
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(x - 20, y);
        ctx.lineTo(x - 20, y - 48);
        ctx.arc(x, y - 48, 20, Math.PI, 0);
        ctx.lineTo(x + 20, y);
        ctx.closePath();
        ctx.fill();

        // Flèche ↑ animée
        const ay = Math.sin(t * 2) * 3;
        ctx.fillStyle = `rgba(150,240,255,${0.85 + Math.sin(t * 2) * 0.15})`;
        ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('▲', x, y - 28 - ay);

        // Label
        ctx.fillStyle = 'rgba(150,230,255,0.9)';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(label, x, y + 14);
    }

    // CŒUR flottant
    _drawHeart(ctx, x, y) {
        const t   = Date.now() * 0.002;
        const by  = Math.sin(t + x * 0.01) * 4;
        const sc  = 0.85 + Math.sin(t * 0.6 + x) * 0.1;
        ctx.save();
        ctx.translate(x, y + by);
        ctx.scale(sc, sc);
        ctx.fillStyle = '#FF4081';
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.bezierCurveTo(-2, 2, -8, 0, -8, -5);
        ctx.bezierCurveTo(-8, -11, -1, -13, 0, -9);
        ctx.bezierCurveTo(1, -13, 8, -11, 8, -5);
        ctx.bezierCurveTo(8, 0, 2, 2, 0, 5);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.ellipse(-3, -7, 2, 3, -0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}
