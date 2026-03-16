// ===== Monde Admin – Espace de Commandement =====
// Monde secondaire accessible uniquement aux admins via un portail.

class AdminWorld {
    constructor() {
        this.width     = 2400;
        this.height    = 800;
        this.SURFACE_Y = 380;

        this._surfaces = [];
        this.objects   = [];
        this.zones     = [
            { name: '⚜ Salle du Trône',    x: 0,    width: 800,  color: '#CE93D8' },
            { name: '⚜ Salle de Contrôle', x: 800,  width: 800,  color: '#9C27B0' },
            { name: '⚜ Archives Secrètes', x: 1600, width: 800,  color: '#7B1FA2' },
        ];

        // Portail de retour au monde principal (x ≈ 80)
        this.returnPortal = { x: 120, y: this.SURFACE_Y };

        this._build();
    }

    _build() {
        const S = this.SURFACE_Y;

        // Sol principal
        this._addGround(0,    S, 2400);
        // Sol surélevé – salle trône
        this._addGround(400,  S - 120, 200);
        // Plateformes flottantes cristal
        const plats = [
            { x: 80,   y: S - 90,  w: 100 },
            { x: 250,  y: S - 160, w: 80  },
            { x: 500,  y: S - 80,  w: 120 },
            { x: 700,  y: S - 140, w: 90  },
            { x: 850,  y: S - 100, w: 100 },
            { x: 1050, y: S - 180, w: 80  },
            { x: 1200, y: S - 110, w: 100 },
            { x: 1380, y: S - 150, w: 80  },
            { x: 1550, y: S - 90,  w: 120 },
            { x: 1750, y: S - 140, w: 80  },
            { x: 1900, y: S - 80,  w: 100 },
            { x: 2100, y: S - 170, w: 80  },
            { x: 2280, y: S - 110, w: 100 },
        ];
        for (const p of plats) {
            this._surfaces.push({ x: p.x, y: p.y, width: p.w, type: 'platform' });
        }
    }

    _addGround(x, y, width) {
        this._surfaces.push({ x, y, width, type: 'ground' });
    }

    getAllSurfaces() { return this._surfaces; }

    isAdminZone() { return true; } // Tout ce monde est admin

    getZoneAt(wx, wy) {
        for (const z of this.zones) {
            if (wx >= z.x && wx < z.x + z.width) return z;
        }
        return { name: '⚜ Espace Admin', color: '#CE93D8' };
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDU
    // ═══════════════════════════════════════════════════════════════
    draw(ctx, camera) {
        const cw = ctx.canvas.width, ch = ctx.canvas.height;
        this._drawBg(ctx, camera, cw, ch);
        this._drawGround(ctx, camera, cw, ch);
        this._drawPlatforms(ctx, camera, cw, ch);
        this._drawDecorations(ctx, camera, cw, ch);
        this._drawReturnPortal(ctx, camera);
    }

    _drawBg(ctx, camera, cw, ch) {
        // Fond étoilé violet
        const g = ctx.createLinearGradient(0, 0, 0, ch);
        g.addColorStop(0, '#0D0020');
        g.addColorStop(0.5, '#1A0040');
        g.addColorStop(1, '#2D0060');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cw, ch);

        // Étoiles
        const t = Date.now() * 0.0005;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 80; i++) {
            const sx  = ((i * 137.5 + 50) % this.width) - camera.x;
            const sy  = ((i * 91.3  + 30) % 300) - camera.y * 0.1;
            const alp = 0.4 + Math.sin(t + i * 0.7) * 0.35;
            if (sx < -5 || sx > cw + 5 || sy < -5 || sy > ch) continue;
            ctx.globalAlpha = alp;
            ctx.beginPath();
            ctx.arc(sx, sy, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Lueur centrale (logo admin)
        const cx2 = 1200 - camera.x;
        const cy2 = 200  - camera.y;
        if (cx2 > -200 && cx2 < cw + 200) {
            const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 250);
            g2.addColorStop(0,   'rgba(180,0,255,0.12)');
            g2.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = g2;
            ctx.fillRect(0, 0, cw, ch);
        }

        // Piliers de fond
        for (let i = 0; i < 8; i++) {
            const px = (i * 300 + 150) - camera.x;
            const ph = 180 + (i % 3) * 50;
            const py = this.SURFACE_Y - camera.y;
            if (px < -40 || px > cw + 40) continue;
            const gp = ctx.createLinearGradient(px, py - ph, px, py);
            gp.addColorStop(0, 'rgba(180,0,255,0.04)');
            gp.addColorStop(1, 'rgba(120,0,180,0.15)');
            ctx.fillStyle = gp;
            ctx.beginPath();
            ctx.roundRect(px - 18, py - ph, 36, ph, 4);
            ctx.fill();
            // Cristal au sommet
            const alp2 = 0.6 + Math.sin(Date.now() * 0.002 + i) * 0.3;
            ctx.fillStyle = `rgba(220,120,255,${alp2})`;
            ctx.beginPath();
            ctx.moveTo(px, py - ph - 24); ctx.lineTo(px + 10, py - ph - 8);
            ctx.lineTo(px + 8, py - ph);   ctx.lineTo(px - 8, py - ph);
            ctx.lineTo(px - 10, py - ph - 8);
            ctx.closePath(); ctx.fill();
        }
    }

    _drawGround(ctx, camera, cw, ch) {
        for (const surf of this._surfaces) {
            if (surf.type !== 'ground') continue;
            const sx = surf.x - camera.x, sy = surf.y - camera.y;
            if (sx + surf.width < 0 || sx > cw || sy > ch) continue;

            // Couche cristalline
            ctx.fillStyle = '#7B1FA2';
            ctx.fillRect(sx, sy - 4, surf.width, 6);
            ctx.fillStyle = '#9C27B0';
            ctx.fillRect(sx, sy + 2, surf.width, 4);
            ctx.fillStyle = '#4A148C';
            ctx.fillRect(sx, sy + 6, surf.width, 20);

            // Lueur sur le sol
            ctx.fillStyle = 'rgba(180,0,255,0.08)';
            ctx.fillRect(sx, sy - 4, surf.width, 30);

            // Runes / sigils sur le sol
            ctx.fillStyle = 'rgba(255,200,255,0.18)';
            ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
            for (let xi = 60; xi < surf.width; xi += 120) {
                ctx.fillText('⚜', sx + xi, sy + 16);
            }
        }
    }

    _drawPlatforms(ctx, camera, cw, ch) {
        const t = Date.now() * 0.001;
        for (const p of this._surfaces) {
            if (p.type !== 'platform') continue;
            const sx = p.x - camera.x, sy = p.y - camera.y;
            if (sx + p.width < 0 || sx > cw || sy > ch) continue;

            // Cristal flottant (lueur pulsante)
            const alp = 0.5 + Math.sin(t + p.x * 0.01) * 0.3;
            ctx.fillStyle = `rgba(240,180,255,${alp})`;
            ctx.beginPath(); ctx.roundRect(sx, sy, p.width, 5, 2); ctx.fill();

            ctx.fillStyle = '#CE93D8';
            ctx.beginPath(); ctx.roundRect(sx, sy + 5, p.width, 6, 2); ctx.fill();

            ctx.fillStyle = '#7B1FA2';
            ctx.beginPath(); ctx.roundRect(sx, sy + 11, p.width, 4, 2); ctx.fill();

            // Lueur sous la plateforme
            const gpl = ctx.createLinearGradient(sx, sy + 15, sx, sy + 40);
            gpl.addColorStop(0, `rgba(180,0,255,${alp * 0.3})`);
            gpl.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gpl;
            ctx.fillRect(sx, sy + 15, p.width, 25);
        }
    }

    _drawDecorations(ctx, camera, cw, ch) {
        const t = Date.now() * 0.001;
        const S = this.SURFACE_Y;

        // Trône au centre de la salle du trône (x=500)
        const tx = 500 - camera.x, ty = S - camera.y;
        if (tx > -100 && tx < cw + 100) {
            // Base
            ctx.fillStyle = '#4A148C';
            ctx.beginPath(); ctx.roundRect(tx - 30, ty - 60, 60, 60, 4); ctx.fill();
            ctx.fillStyle = '#6A1B9A';
            ctx.beginPath(); ctx.roundRect(tx - 24, ty - 90, 48, 30, 4); ctx.fill();
            // Dossier
            ctx.fillStyle = '#7B1FA2';
            ctx.beginPath(); ctx.roundRect(tx - 20, ty - 120, 40, 35, [8, 8, 0, 0]); ctx.fill();
            // Ornements
            ctx.fillStyle = '#FFD700';
            ctx.font = '20px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('⚜', tx, ty - 98);
            // Lueur du trône
            const gtr = ctx.createRadialGradient(tx, ty - 80, 0, tx, ty - 80, 80);
            gtr.addColorStop(0, 'rgba(255,215,0,0.08)');
            gtr.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gtr;
            ctx.fillRect(tx - 80, ty - 160, 160, 160);
        }

        // Cristaux géants (déco)
        const crystals = [
            { x: 200, h: 80 }, { x: 300, h: 60 }, { x: 750, h: 70 },
            { x: 1100, h: 90 }, { x: 1450, h: 65 }, { x: 1800, h: 75 },
            { x: 2050, h: 55 }, { x: 2300, h: 80 },
        ];
        for (const c of crystals) {
            const cx3 = c.x - camera.x, cy3 = S - camera.y;
            if (cx3 < -30 || cx3 > cw + 30) continue;
            const palp = 0.55 + Math.sin(t + c.x * 0.008) * 0.25;
            ctx.fillStyle = `rgba(200,100,255,${palp})`;
            ctx.beginPath();
            ctx.moveTo(cx3, cy3 - c.h - 10);
            ctx.lineTo(cx3 + 10, cy3 - c.h * 0.4);
            ctx.lineTo(cx3 + 8, cy3);
            ctx.lineTo(cx3 - 8, cy3);
            ctx.lineTo(cx3 - 10, cy3 - c.h * 0.4);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = `rgba(240,200,255,${palp * 0.7})`;
            ctx.beginPath();
            ctx.moveTo(cx3, cy3 - c.h - 8);
            ctx.lineTo(cx3 + 3, cy3 - c.h * 0.5);
            ctx.lineTo(cx3 - 3, cy3 - c.h * 0.5);
            ctx.closePath(); ctx.fill();
        }

        // Portails décoratifs
        const portals = [{ x: 800 }, { x: 1600 }];
        for (const po of portals) {
            const px = po.x - camera.x, py = S - camera.y;
            if (px < -60 || px > cw + 60) continue;
            const rot = t * 0.5;
            ctx.strokeStyle = `rgba(180,0,255,${0.6 + Math.sin(rot) * 0.3})`;
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(px, py - 50, 30, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = `rgba(255,200,255,${0.4 + Math.sin(rot + 1) * 0.2})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(px, py - 50, 22, rot, rot + Math.PI * 1.5); ctx.stroke();
        }
    }

    _drawReturnPortal(ctx, camera) {
        const px = this.returnPortal.x - camera.x;
        const py = this.returnPortal.y - camera.y;
        const t  = Date.now() * 0.002;

        // Arc du portail de retour
        const alp = 0.7 + Math.sin(t) * 0.2;
        ctx.strokeStyle = `rgba(100,200,255,${alp})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px - 26, py);
        ctx.lineTo(px - 26, py - 55);
        ctx.arc(px, py - 55, 26, Math.PI, 0);
        ctx.lineTo(px + 26, py);
        ctx.stroke();

        // Remplissage du portail (ondulant)
        const grad = ctx.createRadialGradient(px, py - 40, 5, px, py - 40, 30);
        grad.addColorStop(0, `rgba(100,200,255,${0.4 + Math.sin(t * 1.5) * 0.2})`);
        grad.addColorStop(1, `rgba(0,100,200,${0.15})`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(px - 26, py);
        ctx.lineTo(px - 26, py - 55);
        ctx.arc(px, py - 55, 26, Math.PI, 0);
        ctx.lineTo(px + 26, py);
        ctx.closePath();
        ctx.fill();

        // Texte
        ctx.fillStyle = 'rgba(180,230,255,0.9)';
        ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('↩ Retour', px, py + 16);

        // Particules de portail
        for (let i = 0; i < 5; i++) {
            const a   = t * 2 + (i / 5) * Math.PI * 2;
            const pr  = 18 + Math.sin(t * 3 + i) * 4;
            const ppx = px + Math.cos(a) * pr;
            const ppy = py - 40 + Math.sin(a) * pr * 0.6;
            ctx.fillStyle = `rgba(150,230,255,${0.5 + Math.sin(t + i) * 0.3})`;
            ctx.beginPath(); ctx.arc(ppx, ppy, 2, 0, Math.PI * 2); ctx.fill();
        }
    }
}
