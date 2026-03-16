// ===== Monde 2D avec plateformes, grottes et zone admin =====

class World {
    constructor(width, height) {
        this.width = width;    // 4000
        this.height = height;  // 1400
        this.SURFACE_Y = 420;  // Niveau du sol principal

        this._surfaces = [];   // Toutes les surfaces physiques (collision)
        this._caves = [];      // Zones de grottes (visuelles)
        this._lavaPools = [];  // Mares de lave

        // Zone admin : forteresse en hauteur
        this.adminArea = { x: 2556, yMax: 318, width: 750 };

        this.objects = [];
        this.zones = [];

        this._buildWorld();
    }

    _buildWorld() {
        this._buildSurfaces();
        this._buildCaves();
        this._buildDecorations();
        this._buildZones();
    }

    // ------------------------------------------------------------------
    // SURFACES PHYSIQUES
    // ------------------------------------------------------------------
    _buildSurfaces() {
        const S = this.SURFACE_Y;

        // ===== SOL DE SURFACE (avec trous = entrées de grottes) =====
        this._addGround(0,    S, 500);      // Village  (0–500)
        // Trou grotte 1 : x=500–590
        this._addGround(590,  S, 360);      // Plaines  (590–950)
        // Trou grotte 2 : x=950–1040
        this._addGround(1040, S, 480);      // Forêt    (1040–1520)
        this._addGround(1520, S - 35, 160); // Colline  (1520–1680)
        // Trou grotte 3 : x=1680–1760
        this._addGround(1760, S, 320);      // Plaines  (1760–2080)
        // Trou grotte 4 : x=2080–2160
        this._addGround(2160, S, 240);      // Désert   (2160–2400)
        this._addGround(2400, S, 1600);     // Admin+fin (2400–4000)

        // ===== PLATEFORMES FLOTTANTES (surface) =====
        const floats = [
            // Village
            { x: 80,   y: S - 100, w: 120 },
            { x: 250,  y: S - 150, w: 100 },
            { x: 390,  y: S - 120, w: 80  },
            { x: 435,  y: S - 165, w: 80  },
            // Plaines
            { x: 620,  y: S - 130, w: 120 },
            { x: 780,  y: S - 170, w: 100 },
            { x: 920,  y: S - 120, w: 80  },
            { x: 1065, y: S - 140, w: 120 },
            { x: 1240, y: S - 180, w: 100 },
            { x: 1395, y: S - 130, w: 80  },
            // Forêt + colline
            { x: 1535, y: S - 100, w: 80  },
            { x: 1610, y: S - 175, w: 100 },
            { x: 1730, y: S - 215, w: 80  },
            { x: 1830, y: S - 140, w: 120 },
            { x: 1995, y: S - 180, w: 100 },
            // Désert + approche admin
            { x: 2130, y: S - 120, w: 80  },
            { x: 2230, y: S - 160, w: 80  },
            { x: 2330, y: S - 220, w: 80  },
            { x: 2395, y: S - 260, w: 80  },
            // Escalier vers forteresse admin
            { x: 2455, y: S - 30,  w: 80  },
            { x: 2495, y: S - 60,  w: 80  },
            { x: 2525, y: S - 90,  w: 80  },
            { x: 2548, y: S - 118, w: 80  }, // mène au sol admin (y=302)
            // Intérieur forteresse
            { x: 2625, y: 215, w: 200 },
            { x: 2885, y: 230, w: 180 },
            { x: 2755, y: 155, w: 120 }, // trône
        ];
        for (const p of floats) {
            this._surfaces.push({ x: p.x, y: p.y, width: p.w, type: 'platform' });
        }

        // ===== SOL GROTTE NIVEAU 1 (y ≈ 820) =====
        this._addGround(400,  820, 360); // 400–760
        // Trou vers grotte profonde : x=760–830
        this._addGround(830,  820, 270); // 830–1100
        // Plateformes intérieures grotte 1
        this._surfaces.push({ x: 455,  y: 700, width: 100, type: 'platform' });
        this._surfaces.push({ x: 605,  y: 660, width: 120, type: 'platform' });
        this._surfaces.push({ x: 755,  y: 730, width: 90,  type: 'platform' });
        this._surfaces.push({ x: 885,  y: 710, width: 100, type: 'platform' });
        this._surfaces.push({ x: 985,  y: 670, width: 80,  type: 'platform' });

        // ===== SOL GROTTE PROFONDE (y ≈ 1140) =====
        this._addGround(680,  1140, 320); // 680–1000
        // Lave : x=1000–1100
        this._addGround(1100, 1140, 650); // 1100–1750
        // Plateformes grotte profonde
        this._surfaces.push({ x: 700,  y: 1000, width: 80,  type: 'platform' });
        this._surfaces.push({ x: 835,  y: 1050, width: 100, type: 'platform' });
        this._surfaces.push({ x: 1005, y: 1080, width: 80,  type: 'platform' });
        this._surfaces.push({ x: 1115, y: 1020, width: 80,  type: 'platform' });
        this._surfaces.push({ x: 1255, y: 980,  width: 100, type: 'platform' });
        this._surfaces.push({ x: 1405, y: 1040, width: 80,  type: 'platform' });
        this._surfaces.push({ x: 1555, y: 1000, width: 80,  type: 'platform' });

        // ===== SOL FORTERESSE ADMIN =====
        this._addGround(2555, 302, 750); // Sol principal admin (2555–3305)
        this._addGround(2585, 213, 530); // Étage supérieur (2585–3115)
        this._addGround(2705, 153, 180); // Salle du trône (2705–2885)
    }

    _addGround(x, y, width) {
        this._surfaces.push({ x, y, width, type: 'ground' });
    }

    // ------------------------------------------------------------------
    // GROTTES (visuelles)
    // ------------------------------------------------------------------
    _buildCaves() {
        this._caves.push({
            x: 390, width: 780,
            ceilY: 490, floorY: 835,
            type: 'shallow', name: '⛏ Grottes Mystérieuses',
        });
        this._caves.push({
            x: 640, width: 1150,
            ceilY: 865, floorY: 1160,
            type: 'deep', name: '🔥 Grottes Profondes',
        });
        this._lavaPools = [
            { x: 1000, y: 1140, width: 100 },
            { x: 1685, y: 1140, width: 80  },
        ];
    }

    // ------------------------------------------------------------------
    // DÉCORATIONS
    // ------------------------------------------------------------------
    _buildDecorations() {
        const S = this.SURFACE_Y;
        this.objects = [
            // Village
            { type: 'house',    x: 140,  y: S },
            { type: 'tree',     x: 60,   y: S, size: 1.2 },
            { type: 'tree',     x: 220,  y: S, size: 0.9 },
            { type: 'bench',    x: 310,  y: S },
            { type: 'lamp',     x: 390,  y: S },
            { type: 'flower',   x: 55,   y: S },
            { type: 'flower',   x: 455,  y: S },
            { type: 'sign',     x: 482,  y: S, text: '⛏ Grottes →' },
            // Plaines
            { type: 'tree',     x: 680,  y: S, size: 1.0 },
            { type: 'tree',     x: 800,  y: S, size: 1.1 },
            { type: 'flower',   x: 720,  y: S },
            { type: 'bench',    x: 875,  y: S },
            { type: 'sign',     x: 933,  y: S, text: '⛏ Grottes →' },
            // Forêt
            { type: 'tree',     x: 1105, y: S, size: 1.3 },
            { type: 'tree',     x: 1210, y: S, size: 1.0 },
            { type: 'tree',     x: 1360, y: S, size: 1.2 },
            { type: 'tree',     x: 1610, y: S - 35, size: 0.9 },
            { type: 'palmtree', x: 1905, y: S, size: 1.0 },
            // Admin
            { type: 'lamp',     x: 2565, y: 302 },
            { type: 'lamp',     x: 3245, y: 302 },
            { type: 'tree',     x: 2710, y: 302, size: 0.7 },
            { type: 'tree',     x: 3115, y: 302, size: 0.7 },
            // Décos grottes niveau 1
            { type: 'crystal',  x: 505,  y: 820 },
            { type: 'crystal',  x: 705,  y: 820 },
            { type: 'crystal',  x: 905,  y: 820 },
            { type: 'mushroom', x: 605,  y: 820 },
            { type: 'mushroom', x: 855,  y: 820 },
            // Décos grottes profondes
            { type: 'crystal',  x: 755,  y: 1140 },
            { type: 'crystal',  x: 1205, y: 1140 },
            { type: 'crystal',  x: 1505, y: 1140 },
            { type: 'mushroom', x: 905,  y: 1140 },
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

    // ------------------------------------------------------------------
    // ACCESSEURS
    // ------------------------------------------------------------------
    getAllSurfaces() {
        return this._surfaces;
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

    // ------------------------------------------------------------------
    // RENDU PRINCIPAL
    // ------------------------------------------------------------------
    draw(ctx, camera) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        this._drawBackground(ctx, camera, cw, ch);
        this._drawUndergroundFill(ctx, camera, cw, ch);
        this._drawCaves(ctx, camera, cw, ch);
        this._drawTerrainSurfaces(ctx, camera, cw, ch);
        this._drawPlatforms(ctx, camera, cw, ch);
        this._drawLava(ctx, camera, cw, ch);
        this._drawAdminFortress(ctx, camera, cw, ch);

        for (const obj of this.objects) {
            const sx = obj.x - camera.x;
            const sy = obj.y - camera.y;
            if (sx < -160 || sx > cw + 160) continue;
            this._drawObject(ctx, obj, sx, sy);
        }

        this._drawCaveDecorations(ctx, camera, cw, ch);
    }

    // ------------------------------------------------------------------
    _drawBackground(ctx, camera, cw, ch) {
        if (camera.y < 600) {
            const g = ctx.createLinearGradient(0, 0, 0, ch);
            g.addColorStop(0,   '#0d1b2a');
            g.addColorStop(0.4, '#1a3a5c');
            g.addColorStop(0.8, '#2563a8');
            g.addColorStop(1,   '#4a90d9');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, cw, ch);
            this._drawStars(ctx, camera);
            this._drawMoon(ctx, camera);
            this._drawClouds(ctx, camera);
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

    _drawStars(ctx, camera) {
        for (let i = 0; i < 60; i++) {
            const sx = ((i * 137 + 50) % 800) + ((-camera.x * 0.02) % 800);
            const sy = (i * 73 + 20) % 240;
            ctx.globalAlpha = 0.35 + Math.sin(Date.now() * 0.001 + i) * 0.25;
            ctx.fillStyle = '#fff';
            ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
        }
        ctx.globalAlpha = 1;
    }

    _drawMoon(ctx, camera) {
        const mx = 620 - camera.x * 0.05;
        const my = 80  - camera.y * 0.08;
        if (my < -60 || my > 350) return;
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath(); ctx.arc(mx, my, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(200,190,160,0.4)';
        ctx.beginPath(); ctx.arc(mx - 8, my - 5, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(mx + 10, my + 8, 4, 0, Math.PI * 2); ctx.fill();
    }

    _drawClouds(ctx, camera) {
        const clouds = [
            { x: 200, y: 100, w: 120, h: 30 }, { x: 500,  y: 80,  w: 80,  h: 20 },
            { x: 900, y: 120, w: 150, h: 35 }, { x: 1400, y: 90,  w: 100, h: 25 },
            { x: 1900,y: 70,  w: 130, h: 30 }, { x: 2500, y: 100, w: 110, h: 28 },
        ];
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        for (const c of clouds) {
            const cx = c.x - camera.x * 0.1 + Math.sin(Date.now() * 0.0002 + c.x) * 10;
            const cy = c.y - camera.y * 0.05;
            ctx.beginPath();
            ctx.ellipse(cx, cy, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawBuildingBg(ctx, camera, cw, ch) {
        const buildings = [
            { x: 100, w: 60, h: 120 }, { x: 200, w: 80, h: 160 }, { x: 320, w: 50, h: 100 },
            { x: 500, w: 70, h: 140 }, { x: 650, w: 90, h: 180 }, { x: 800, w: 55, h: 110 },
            { x: 1000,w: 75, h: 150 }, { x: 1200,w: 65, h: 130 }, { x: 1500,w: 85, h: 170 },
            { x: 1700,w: 60, h: 120 }, { x: 1900,w: 70, h: 140 }, { x: 2200,w: 80, h: 160 },
        ];
        const gsy = this.SURFACE_Y - camera.y;
        for (const b of buildings) {
            const bx = b.x - camera.x * 0.3;
            ctx.fillStyle = 'rgba(15,15,40,0.55)';
            ctx.fillRect(bx, gsy - b.h, b.w, b.h);
            ctx.fillStyle = 'rgba(255,220,100,0.22)';
            for (let wy = 10; wy < b.h - 10; wy += 22) {
                for (let wx = 8; wx < b.w - 8; wx += 16) {
                    ctx.fillRect(bx + wx, gsy - b.h + wy, 8, 10);
                }
            }
        }
    }

    _drawUndergroundFill(ctx, camera, cw, ch) {
        const sy = this.SURFACE_Y - camera.y;
        if (sy >= ch) return;
        const dy = Math.max(0, sy);
        const g = ctx.createLinearGradient(0, dy, 0, dy + Math.min(500, ch - dy));
        g.addColorStop(0,   '#3E2723');
        g.addColorStop(0.3, '#33251c');
        g.addColorStop(1,   '#1a1210');
        ctx.fillStyle = g;
        ctx.fillRect(0, dy, cw, ch - dy);
    }

    _drawCaves(ctx, camera, cw, ch) {
        for (const cave of this._caves) {
            const sx = cave.x - camera.x;
            const sy = cave.ceilY - camera.y;
            const sw = cave.width;
            const sh = cave.floorY - cave.ceilY;
            if (sx + sw < 0 || sx > cw || sy + sh < 0 || sy > ch) continue;

            const g = ctx.createLinearGradient(0, Math.max(0, sy), 0, Math.max(0, sy) + sh);
            if (cave.type === 'deep') {
                g.addColorStop(0, '#0d0a14'); g.addColorStop(0.5, '#100d1a'); g.addColorStop(1, '#0a0810');
            } else {
                g.addColorStop(0, '#1a1520'); g.addColorStop(0.5, '#1e1a28'); g.addColorStop(1, '#151220');
            }
            ctx.fillStyle = g;
            ctx.fillRect(
                Math.max(0, sx), Math.max(0, sy),
                Math.min(sw, cw - Math.max(0, sx)),
                Math.min(sh, ch - Math.max(0, sy))
            );
        }
    }

    _drawTerrainSurfaces(ctx, camera, cw, ch) {
        for (const surf of this._surfaces) {
            if (surf.type !== 'ground') continue;
            const sx = surf.x - camera.x;
            const sy = surf.y - camera.y;
            if (sx + surf.width < 0 || sx > cw || sy < -10 || sy > ch) continue;

            const isAdmin = surf.x >= 2550 && surf.y <= 310;
            const isCave  = surf.y >= 800;

            if (isCave) {
                ctx.fillStyle = '#37474F'; ctx.fillRect(sx, sy, surf.width, 7);
                ctx.fillStyle = '#263238'; ctx.fillRect(sx, sy + 7, surf.width, 28);
            } else if (isAdmin) {
                ctx.fillStyle = '#9C27B0'; ctx.fillRect(sx, sy - 3, surf.width, 7);
                ctx.fillStyle = '#6A1B9A'; ctx.fillRect(sx, sy + 4, surf.width, 24);
            } else {
                ctx.fillStyle = '#2E7D32'; ctx.fillRect(sx, sy - 3, surf.width, 7);
                ctx.fillStyle = '#388E3C'; ctx.fillRect(sx, sy, surf.width, 4);
                ctx.fillStyle = '#5D4037'; ctx.fillRect(sx, sy + 4, surf.width, 22);
            }
        }
    }

    _drawPlatforms(ctx, camera, cw, ch) {
        for (const p of this._surfaces) {
            if (p.type !== 'platform') continue;
            const sx = p.x - camera.x;
            const sy = p.y - camera.y;
            if (sx + p.width < 0 || sx > cw || sy < -10 || sy > ch) continue;

            const isAdmin = p.x >= 2550;
            const isDeep  = p.y > 860;
            const isCave  = p.y > 490 && !isDeep;

            if (isAdmin) {
                ctx.fillStyle = '#CE93D8'; ctx.fillRect(sx, sy, p.width, 6);
                ctx.fillStyle = '#AB47BC'; ctx.fillRect(sx, sy + 6, p.width, 6);
            } else if (isDeep) {
                ctx.fillStyle = '#546E7A'; ctx.fillRect(sx, sy, p.width, 8);
                ctx.fillStyle = '#37474F'; ctx.fillRect(sx, sy + 8, p.width, 5);
                ctx.fillStyle = 'rgba(120,60,220,0.18)'; ctx.fillRect(sx, sy, p.width, 13);
            } else if (isCave) {
                ctx.fillStyle = '#455A64'; ctx.fillRect(sx, sy, p.width, 8);
                ctx.fillStyle = '#37474F'; ctx.fillRect(sx, sy + 8, p.width, 5);
            } else {
                ctx.fillStyle = '#8D6E63'; ctx.fillRect(sx, sy, p.width, 8);
                ctx.fillStyle = '#6D4C41'; ctx.fillRect(sx, sy + 8, p.width, 5);
                ctx.fillStyle = '#795548';
                for (let i = 0; i < Math.floor(p.width / 22); i++) {
                    ctx.fillRect(sx + i * 22 + 5, sy + 2, 2, 10);
                }
            }
        }
    }

    _drawLava(ctx, camera, cw, ch) {
        const t = Date.now() * 0.003;
        for (const pool of this._lavaPools) {
            const sx = pool.x - camera.x;
            const sy = pool.y - camera.y;
            if (sx + pool.width < 0 || sx > cw) continue;
            const g = ctx.createLinearGradient(sx, sy, sx, sy + 20);
            g.addColorStop(0, '#FF6D00'); g.addColorStop(0.5, '#DD2C00'); g.addColorStop(1, '#BF360C');
            ctx.fillStyle = g;
            ctx.fillRect(sx, sy, pool.width, 20);
            ctx.fillStyle = 'rgba(255,100,0,0.12)';
            ctx.fillRect(sx, sy - 30, pool.width, 50);
            for (let i = 0; i < 3; i++) {
                const bx = sx + (i + 1) * pool.width / 4 + Math.sin(t + i) * 5;
                const by = sy + Math.sin(t * 2 + i) * 3;
                ctx.fillStyle = '#FF8F00';
                ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
            }
        }
    }

    _drawAdminFortress(ctx, camera, cw, ch) {
        const ax = 2555 - camera.x;
        const ay = 302  - camera.y;
        if (ax + 800 < 0 || ax > cw) return;

        // Tours latérales
        ctx.fillStyle = '#4A148C';
        ctx.fillRect(ax,       ay - 125, 65, 125);
        ctx.fillRect(ax + 690, ay - 125, 65, 125);

        // Créneaux
        ctx.fillStyle = '#6A1B9A';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(ax +       i * 18, ay - 136, 12, 22);
            ctx.fillRect(ax + 690 + i * 18, ay - 136, 12, 22);
        }

        // Portail arrondi
        const gx = ax + 380, gy = ay;
        ctx.fillStyle = '#7B1FA2';
        ctx.beginPath();
        ctx.moveTo(gx - 26, gy); ctx.lineTo(gx - 26, gy - 52);
        ctx.arc(gx, gy - 52, 26, Math.PI, 0);
        ctx.lineTo(gx + 26, gy); ctx.closePath(); ctx.fill();

        ctx.fillStyle = '#100020';
        ctx.beginPath();
        ctx.moveTo(gx - 20, gy); ctx.lineTo(gx - 20, gy - 47);
        ctx.arc(gx, gy - 47, 20, Math.PI, 0);
        ctx.lineTo(gx + 20, gy); ctx.closePath(); ctx.fill();

        // Panneau
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('⚜ ZONE ADMIN ⚜', ax + 380, ay - 152);

        // Drapeau
        ctx.fillStyle = '#37474F';
        ctx.fillRect(ax + 378, ay - 205, 4, 62);
        ctx.fillStyle = '#7B1FA2';
        ctx.fillRect(ax + 382, ay - 205, 42, 26);
        ctx.fillStyle = '#FFD700'; ctx.font = '13px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('⚜', ax + 396, ay - 188);

        // Étincelles animées
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

        // Stalactites
        for (const cave of this._caves) {
            const sx = cave.x - camera.x;
            const sy = cave.ceilY - camera.y;
            if (sx + cave.width < 0 || sx > cw) continue;
            const col = cave.type === 'deep' ? '#1a1030' : '#2a2440';
            for (let i = 0; i < Math.floor(cave.width / 40); i++) {
                const stx = cave.x + i * 40 + 15 - camera.x;
                if (stx < -10 || stx > cw + 10) continue;
                const h = 15 + (i % 3) * 10 + Math.sin(i * 0.7) * 8;
                ctx.fillStyle = col;
                ctx.beginPath();
                ctx.moveTo(stx - 6, sy); ctx.lineTo(stx + 6, sy); ctx.lineTo(stx, sy + h);
                ctx.closePath(); ctx.fill();
            }
        }

        // Lueur cristaux (grotte profonde)
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

    // ------------------------------------------------------------------
    // OBJETS DÉCORATIFS
    // ------------------------------------------------------------------
    _drawObject(ctx, obj, sx, sy) {
        switch (obj.type) {
            case 'tree':     this._drawTree(ctx, sx, sy, obj.size || 1); break;
            case 'palmtree': this._drawPalmTree(ctx, sx, sy, obj.size || 1); break;
            case 'bench':    this._drawBench(ctx, sx, sy); break;
            case 'lamp':     this._drawLamp(ctx, sx, sy); break;
            case 'house':    this._drawHouse(ctx, sx, sy); break;
            case 'flower':   this._drawFlower(ctx, sx, sy); break;
            case 'crystal':  this._drawCrystal(ctx, sx, sy); break;
            case 'mushroom': this._drawMushroom(ctx, sx, sy); break;
            case 'sign':     this._drawSign(ctx, sx, sy, obj.text || ''); break;
        }
    }

    _drawTree(ctx, x, y, s) {
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - 5 * s, y - 40 * s, 10 * s, 40 * s);
        ctx.fillStyle = '#1B5E20';
        ctx.beginPath(); ctx.arc(x, y - 55 * s, 25 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath(); ctx.arc(x - 10 * s, y - 50 * s, 18 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 12 * s, y - 48 * s, 16 * s, 0, Math.PI * 2); ctx.fill();
    }

    _drawPalmTree(ctx, x, y, s) {
        ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 8 * s;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 10 * s, y - 40 * s, x + 5 * s, y - 80 * s);
        ctx.stroke();
        ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x + 5 * s, y - 80 * s);
            ctx.quadraticCurveTo(
                x + 5 * s + Math.cos(a) * 30 * s, y - 80 * s + Math.sin(a) * 15 * s - 10,
                x + 5 * s + Math.cos(a) * 40 * s, y - 80 * s + Math.sin(a) * 20 * s + 5
            ); ctx.stroke();
        }
    }

    _drawBench(ctx, x, y) {
        ctx.fillStyle = '#795548';
        ctx.fillRect(x - 20, y - 16, 40, 4);
        ctx.fillRect(x - 18, y - 16, 3, 16); ctx.fillRect(x + 15, y - 16, 3, 16);
        ctx.fillRect(x - 20, y - 28, 40, 3);
        ctx.fillRect(x - 18, y - 28, 3, 14); ctx.fillRect(x + 15, y - 28, 3, 14);
    }

    _drawLamp(ctx, x, y) {
        ctx.fillStyle = '#37474F'; ctx.fillRect(x - 2, y - 70, 4, 70);
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath(); ctx.arc(x, y - 72, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,213,79,0.07)';
        ctx.beginPath(); ctx.arc(x, y - 50, 50, 0, Math.PI * 2); ctx.fill();
    }

    _drawHouse(ctx, x, y) {
        ctx.fillStyle = '#BCAAA4'; ctx.fillRect(x - 35, y - 60, 70, 60);
        ctx.fillStyle = '#D84315';
        ctx.beginPath();
        ctx.moveTo(x - 42, y - 60); ctx.lineTo(x, y - 90); ctx.lineTo(x + 42, y - 60);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#5D4037'; ctx.fillRect(x - 8, y - 30, 16, 30);
        ctx.fillStyle = '#FFF8E1';
        ctx.fillRect(x - 28, y - 50, 14, 12); ctx.fillRect(x + 14, y - 50, 14, 12);
    }

    _drawFlower(ctx, x, y) {
        ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 15); ctx.stroke();
        const cols = ['#E91E63','#FF5722','#FFC107','#9C27B0'];
        ctx.fillStyle = cols[Math.abs(Math.round(x)) % cols.length];
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            ctx.beginPath(); ctx.arc(x + Math.cos(a) * 4, y - 15 + Math.sin(a) * 4, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#FDD835'; ctx.beginPath(); ctx.arc(x, y - 15, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    _drawCrystal(ctx, x, y) {
        const alp = 0.65 + Math.sin(Date.now() * 0.002 + x * 0.01) * 0.2;
        ctx.fillStyle = `rgba(150,80,255,${alp})`;
        ctx.beginPath();
        ctx.moveTo(x, y - 26); ctx.lineTo(x + 9, y - 8);
        ctx.lineTo(x + 7, y); ctx.lineTo(x - 7, y); ctx.lineTo(x - 9, y - 8);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(220,160,255,${alp * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(x, y - 23); ctx.lineTo(x + 3, y - 10); ctx.lineTo(x - 3, y - 10);
        ctx.closePath(); ctx.fill();
    }

    _drawMushroom(ctx, x, y) {
        ctx.fillStyle = '#B71C1C';
        ctx.beginPath(); ctx.arc(x, y - 18, 14, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(x - 5, y - 20, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 5, y - 22, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F5F5DC'; ctx.fillRect(x - 5, y - 18, 10, 18);
    }

    _drawSign(ctx, x, y, text) {
        ctx.fillStyle = '#5D4037'; ctx.fillRect(x - 2, y - 42, 4, 42);
        ctx.fillStyle = '#8D6E63'; ctx.fillRect(x - 26, y - 52, 52, 20);
        ctx.fillStyle = '#FFF8DC'; ctx.font = '9px sans-serif';
        ctx.textAlign = 'center'; ctx.fillText(text, x, y - 38);
    }
}
