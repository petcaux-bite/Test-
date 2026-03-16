// ===== Monde 2D – Graphismes style Blabland =====

class World {
    constructor(width, height) {
        this.width    = width;   // 4000
        this.height   = height;  // 1400
        this.SURFACE_Y = 420;

        this._surfaces  = [];
        this._caves     = [];
        this._lavaPools = [];

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

        // Surface principale (trous = entrées de grottes)
        this._addGround(0,    S, 500);
        // Trou 1 : x 500-590
        this._addGround(590,  S, 360);
        // Trou 2 : x 950-1040
        this._addGround(1040, S, 480);
        this._addGround(1520, S - 35, 160); // colline
        // Trou 3 : x 1680-1760
        this._addGround(1760, S, 320);
        // Trou 4 : x 2080-2160
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
        this._addGround(830, 820, 270);
        this._surfaces.push({ x: 455,  y: 700, width: 100, type: 'platform' });
        this._surfaces.push({ x: 605,  y: 660, width: 120, type: 'platform' });
        this._surfaces.push({ x: 755,  y: 730, width: 90,  type: 'platform' });
        this._surfaces.push({ x: 885,  y: 710, width: 100, type: 'platform' });
        this._surfaces.push({ x: 985,  y: 670, width: 80,  type: 'platform' });

        // Grotte profonde
        this._addGround(680,  1140, 320);
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
        this.objects = [
            // Village
            { type: 'house',    x: 140,  y: S },
            { type: 'tree',     x: 60,   y: S, s: 1.2 },
            { type: 'tree',     x: 220,  y: S, s: 0.9 },
            { type: 'bench',    x: 310,  y: S },
            { type: 'lamp',     x: 390,  y: S },
            { type: 'flower',   x: 55,   y: S, c: '#FF69B4' },
            { type: 'flower',   x: 170,  y: S, c: '#FF4081' },
            { type: 'flower',   x: 455,  y: S, c: '#FFD700' },
            { type: 'heart',    x: 90,   y: S - 20 },
            { type: 'heart',    x: 360,  y: S - 25 },
            { type: 'balloon',  x: 120,  y: S - 90, c: '#FF5252' },
            { type: 'balloon',  x: 350,  y: S - 75, c: '#FFD740' },
            { type: 'sign',     x: 482,  y: S, text: '⛏ Grottes →' },
            // Plaines
            { type: 'tree',     x: 680,  y: S, s: 1.0 },
            { type: 'tree',     x: 800,  y: S, s: 1.1 },
            { type: 'flower',   x: 720,  y: S, c: '#E91E63' },
            { type: 'flower',   x: 850,  y: S, c: '#9C27B0' },
            { type: 'bench',    x: 875,  y: S },
            { type: 'heart',    x: 640,  y: S - 18 },
            { type: 'balloon',  x: 700,  y: S - 85, c: '#69F0AE' },
            { type: 'balloon',  x: 900,  y: S - 70, c: '#FF4081' },
            { type: 'sign',     x: 933,  y: S, text: '⛏ Grottes →' },
            // Forêt
            { type: 'tree',     x: 1105, y: S, s: 1.3 },
            { type: 'tree',     x: 1210, y: S, s: 1.0 },
            { type: 'tree',     x: 1360, y: S, s: 1.2 },
            { type: 'tree',     x: 1610, y: S - 35, s: 0.9 },
            { type: 'palmtree', x: 1905, y: S, s: 1.0 },
            { type: 'flower',   x: 1150, y: S, c: '#FF6D00' },
            { type: 'heart',    x: 1280, y: S - 22 },
            { type: 'balloon',  x: 1100, y: S - 80, c: '#40C4FF' },
            { type: 'balloon',  x: 1500, y: S - 95, c: '#FF4081' },
            // Admin
            { type: 'lamp',     x: 2565, y: 302 },
            { type: 'lamp',     x: 3245, y: 302 },
            { type: 'tree',     x: 2710, y: 302, s: 0.7 },
            { type: 'tree',     x: 3115, y: 302, s: 0.7 },
            { type: 'heart',    x: 2650, y: 302 - 18 },
            { type: 'balloon',  x: 2900, y: 302 - 80, c: '#FFD700' },
            // Grottes
            { type: 'crystal',  x: 505,  y: 820 },
            { type: 'crystal',  x: 705,  y: 820 },
            { type: 'crystal',  x: 905,  y: 820 },
            { type: 'mushroom', x: 605,  y: 820 },
            { type: 'mushroom', x: 855,  y: 820 },
            // Grottes profondes
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

    // ══════════════════════════════════════════════════════════════════
    // ACCESSEURS
    // ══════════════════════════════════════════════════════════════════
    getAllSurfaces() { return this._surfaces; }

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
            // Ciel bleu lumineux style Blabland
            const g = ctx.createLinearGradient(0, 0, 0, ch);
            g.addColorStop(0,   '#5BBFED');
            g.addColorStop(0.5, '#87CEEB');
            g.addColorStop(1,   '#B3E5FC');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, cw, ch);

            this._drawSun(ctx, camera);
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

    _drawCloud(ctx, x, y, r) {
        ctx.fillStyle = '#FFFFFFD0';
        ctx.beginPath(); ctx.arc(x,       y,       r,       0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + r,   y + r * 0.2, r * 0.75, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x - r,   y + r * 0.2, r * 0.7,  0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + r * 0.5, y - r * 0.4, r * 0.65, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x - r * 0.5, y - r * 0.3, r * 0.6,  0, Math.PI * 2); ctx.fill();
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
    // SOL (style Blabland : vert vif + dessous ROSE)
    // ──────────────────────────────────────────────────────────────────
    _drawTerrainSurfaces(ctx, camera, cw, ch) {
        for (const surf of this._surfaces) {
            if (surf.type !== 'ground') continue;
            const sx = surf.x - camera.x, sy = surf.y - camera.y;
            if (sx + surf.width < 0 || sx > cw || sy < -10 || sy > ch) continue;

            const isAdmin = surf.x >= 2550 && surf.y <= 310;
            const isCave  = surf.y >= 800;

            if (isCave) {
                ctx.fillStyle = '#546E7A'; ctx.fillRect(sx, sy, surf.width, 7);
                ctx.fillStyle = '#37474F'; ctx.fillRect(sx, sy + 7, surf.width, 28);
            } else if (isAdmin) {
                ctx.fillStyle = '#CE93D8'; ctx.fillRect(sx, sy - 3, surf.width, 8);
                ctx.fillStyle = '#9C27B0'; ctx.fillRect(sx, sy + 5, surf.width, 8);
                ctx.fillStyle = '#6A1B9A'; ctx.fillRect(sx, sy + 13, surf.width, 16);
            } else {
                // Herbe verte vive (Blabland style)
                ctx.fillStyle = '#7CB342';
                ctx.fillRect(sx, sy - 5, surf.width, 9);
                ctx.fillStyle = '#9CCC65'; // bande claire
                ctx.fillRect(sx, sy - 2, surf.width, 4);
                // Bande rose/magenta en dessous (signature Blabland !)
                ctx.fillStyle = '#EC407A';
                ctx.fillRect(sx, sy + 4, surf.width, 7);
                ctx.fillStyle = '#E91E63';
                ctx.fillRect(sx, sy + 11, surf.width, 4);
                // Terre brune
                ctx.fillStyle = '#6D4C41';
                ctx.fillRect(sx, sy + 15, surf.width, 16);
            }
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // PLATEFORMES (rondes, colorées)
    // ──────────────────────────────────────────────────────────────────
    _drawPlatforms(ctx, camera, cw, ch) {
        for (const p of this._surfaces) {
            if (p.type !== 'platform') continue;
            const sx = p.x - camera.x, sy = p.y - camera.y;
            if (sx + p.width < 0 || sx > cw || sy < -10 || sy > ch) continue;

            const isAdmin = p.x >= 2550, isDeep = p.y > 860, isCave = p.y > 490 && !isDeep;

            if (isAdmin) {
                ctx.fillStyle = '#F3E5F5'; ctx.fillRect(sx, sy, p.width, 6);
                ctx.fillStyle = '#CE93D8'; ctx.fillRect(sx, sy + 6, p.width, 5);
                ctx.fillStyle = '#AB47BC'; ctx.fillRect(sx, sy + 11, p.width, 3);
            } else if (isDeep) {
                ctx.fillStyle = '#78909C'; ctx.fillRect(sx, sy, p.width, 8);
                ctx.fillStyle = '#546E7A'; ctx.fillRect(sx, sy + 8, p.width, 5);
                ctx.fillStyle = 'rgba(120,60,220,0.2)'; ctx.fillRect(sx, sy, p.width, 13);
            } else if (isCave) {
                ctx.fillStyle = '#607D8B'; ctx.fillRect(sx, sy, p.width, 8);
                ctx.fillStyle = '#455A64'; ctx.fillRect(sx, sy + 8, p.width, 5);
            } else {
                // Bois coloré style Blabland (bords arrondis visuels)
                ctx.fillStyle = '#A5D6A7'; ctx.fillRect(sx, sy, p.width, 4);   // bord clair
                ctx.fillStyle = '#8D6E63'; ctx.fillRect(sx, sy + 4, p.width, 6);
                ctx.fillStyle = '#6D4C41'; ctx.fillRect(sx, sy + 10, p.width, 4);
                // Grain bois
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                for (let i = 0; i < Math.floor(p.width / 22); i++) {
                    ctx.fillRect(sx + i * 22 + 5, sy + 5, 2, 8);
                }
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
            case 'tree':     this._drawTree(ctx, sx, sy, obj.s || 1); break;
            case 'palmtree': this._drawPalmTree(ctx, sx, sy, obj.s || 1); break;
            case 'bench':    this._drawBench(ctx, sx, sy); break;
            case 'lamp':     this._drawLamp(ctx, sx, sy); break;
            case 'house':    this._drawHouse(ctx, sx, sy); break;
            case 'flower':   this._drawFlower(ctx, sx, sy, obj.c || '#FF69B4'); break;
            case 'crystal':  this._drawCrystal(ctx, sx, sy); break;
            case 'mushroom': this._drawMushroom(ctx, sx, sy); break;
            case 'sign':     this._drawSign(ctx, sx, sy, obj.text || ''); break;
            case 'balloon':  this._drawBalloon(ctx, sx, sy, obj.c || '#FF5252'); break;
            case 'heart':    this._drawHeart(ctx, sx, sy); break;
        }
    }

    // Arbres très ronds style Blabland
    _drawTree(ctx, x, y, s) {
        // Tronc épais
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.roundRect(x - 7 * s, y - 38 * s, 14 * s, 38 * s, 4);
        ctx.fill();
        // Canopée ronde (grosse)
        ctx.fillStyle = '#388E3C';
        ctx.beginPath(); ctx.arc(x, y - 52 * s, 30 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath(); ctx.arc(x - 12 * s, y - 48 * s, 22 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 14 * s, y - 46 * s, 20 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#66BB6A';
        ctx.beginPath(); ctx.arc(x, y - 58 * s, 18 * s, 0, Math.PI * 2); ctx.fill();
        // Reflet
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.beginPath(); ctx.arc(x - 8 * s, y - 60 * s, 7 * s, 0, Math.PI * 2); ctx.fill();
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
