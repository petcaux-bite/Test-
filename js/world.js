// ===== Monde / Décor 2D =====

class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.groundY = height - 100;
        this.objects = [];
        this.zones = [];
        this._buildWorld();
    }

    _buildWorld() {
        // Ciel dégradé sera dessiné en temps réel

        // Sol et zones
        this.zones = [
            { name: 'Parc', x: 0, width: 800, color: '#4CAF50', groundColor: '#388E3C' },
            { name: 'Place Centrale', x: 800, width: 600, color: '#FF9800', groundColor: '#F57C00' },
            { name: 'Plage', x: 1400, width: 700, color: '#FDD835', groundColor: '#F9A825' },
            { name: 'Quartier', x: 2100, width: 700, color: '#78909C', groundColor: '#546E7A' },
        ];

        // Décorations
        this.objects = [
            // Parc
            { type: 'tree', x: 100, size: 1.2 },
            { type: 'tree', x: 250, size: 0.9 },
            { type: 'tree', x: 450, size: 1.1 },
            { type: 'bench', x: 350 },
            { type: 'flower', x: 150 },
            { type: 'flower', x: 500 },
            { type: 'flower', x: 620 },
            { type: 'lamp', x: 700 },

            // Place Centrale
            { type: 'fountain', x: 1050 },
            { type: 'lamp', x: 880 },
            { type: 'lamp', x: 1250 },
            { type: 'bench', x: 950 },
            { type: 'bench', x: 1180 },

            // Plage
            { type: 'palmtree', x: 1500, size: 1.0 },
            { type: 'palmtree', x: 1750, size: 1.3 },
            { type: 'umbrella', x: 1600 },
            { type: 'umbrella', x: 1850 },

            // Quartier
            { type: 'house', x: 2200 },
            { type: 'house', x: 2450 },
            { type: 'lamp', x: 2350 },
            { type: 'tree', x: 2600, size: 1.0 },
        ];
    }

    draw(ctx, camera) {
        const { width, height } = ctx.canvas;

        // Ciel
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
        skyGrad.addColorStop(0, '#1a1a3e');
        skyGrad.addColorStop(0.4, '#2d2d6b');
        skyGrad.addColorStop(0.7, '#4a3f8a');
        skyGrad.addColorStop(1, '#7c5fbf');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, this.groundY - camera.y);

        // Étoiles
        this._drawStars(ctx, camera);

        // Lune
        this._drawMoon(ctx, camera);

        // Nuages (parallax)
        this._drawClouds(ctx, camera);

        // Bâtiments en fond (parallax)
        this._drawBackground(ctx, camera);

        // Sol par zones
        for (const zone of this.zones) {
            const zx = zone.x - camera.x;
            if (zx + zone.width < 0 || zx > width) continue;

            // Sol
            ctx.fillStyle = zone.groundColor;
            ctx.fillRect(zx, this.groundY - camera.y, zone.width, height - this.groundY + camera.y + 100);

            // Herbe / texture du sol
            ctx.fillStyle = zone.color;
            ctx.fillRect(zx, this.groundY - camera.y - 4, zone.width, 8);

            // Nom de la zone
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(zone.name, zx + zone.width / 2, this.groundY - camera.y + 24);
        }

        // Objets décoratifs
        for (const obj of this.objects) {
            const ox = obj.x - camera.x;
            if (ox < -100 || ox > width + 100) continue;
            this._drawObject(ctx, obj, ox, this.groundY - camera.y);
        }
    }

    _drawStars(ctx, camera) {
        ctx.fillStyle = '#fff';
        // Étoiles fixes (pseudo-aléatoires basées sur position)
        for (let i = 0; i < 60; i++) {
            const sx = ((i * 137 + 50) % 800) + ((-camera.x * 0.02) % 800);
            const sy = (i * 73 + 20) % (this.groundY - 80);
            const size = (i % 3 === 0) ? 2 : 1;
            ctx.globalAlpha = 0.4 + (Math.sin(Date.now() * 0.001 + i) * 0.3);
            ctx.fillRect(sx, sy, size, size);
        }
        ctx.globalAlpha = 1;
    }

    _drawMoon(ctx, camera) {
        const mx = 600 - camera.x * 0.05;
        const my = 80;
        ctx.fillStyle = '#FFF8DC';
        ctx.beginPath();
        ctx.arc(mx, my, 30, 0, Math.PI * 2);
        ctx.fill();
        // Cratères
        ctx.fillStyle = 'rgba(200,190,160,0.4)';
        ctx.beginPath();
        ctx.arc(mx - 8, my - 5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx + 10, my + 8, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawClouds(ctx, camera) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        const clouds = [
            { x: 200, y: 60, w: 120, h: 30 },
            { x: 500, y: 100, w: 80, h: 20 },
            { x: 900, y: 40, w: 150, h: 35 },
            { x: 1400, y: 80, w: 100, h: 25 },
            { x: 1800, y: 50, w: 130, h: 30 },
        ];
        for (const c of clouds) {
            const cx = c.x - camera.x * 0.1 + Math.sin(Date.now() * 0.0002 + c.x) * 10;
            ctx.beginPath();
            ctx.ellipse(cx, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawBackground(ctx, camera) {
        // Silhouettes de bâtiments en arrière-plan
        ctx.fillStyle = 'rgba(20, 20, 50, 0.6)';
        const buildings = [
            { x: 100, w: 60, h: 120 },
            { x: 200, w: 80, h: 160 },
            { x: 320, w: 50, h: 100 },
            { x: 500, w: 70, h: 140 },
            { x: 650, w: 90, h: 180 },
            { x: 800, w: 55, h: 110 },
            { x: 1000, w: 75, h: 150 },
            { x: 1200, w: 65, h: 130 },
            { x: 1500, w: 85, h: 170 },
            { x: 1700, w: 60, h: 120 },
            { x: 1900, w: 70, h: 140 },
            { x: 2200, w: 80, h: 160 },
            { x: 2500, w: 55, h: 100 },
        ];
        for (const b of buildings) {
            const bx = b.x - camera.x * 0.3;
            ctx.fillRect(bx, this.groundY - camera.y - b.h, b.w, b.h);
            // Fenêtres
            ctx.fillStyle = 'rgba(255, 220, 100, 0.3)';
            for (let wy = 10; wy < b.h - 10; wy += 20) {
                for (let wx = 8; wx < b.w - 8; wx += 16) {
                    ctx.fillRect(bx + wx, this.groundY - camera.y - b.h + wy, 8, 10);
                }
            }
            ctx.fillStyle = 'rgba(20, 20, 50, 0.6)';
        }
    }

    _drawObject(ctx, obj, x, groundY) {
        switch (obj.type) {
            case 'tree':
                this._drawTree(ctx, x, groundY, obj.size || 1);
                break;
            case 'palmtree':
                this._drawPalmTree(ctx, x, groundY, obj.size || 1);
                break;
            case 'bench':
                this._drawBench(ctx, x, groundY);
                break;
            case 'lamp':
                this._drawLamp(ctx, x, groundY);
                break;
            case 'fountain':
                this._drawFountain(ctx, x, groundY);
                break;
            case 'flower':
                this._drawFlower(ctx, x, groundY);
                break;
            case 'umbrella':
                this._drawUmbrella(ctx, x, groundY);
                break;
            case 'house':
                this._drawHouse(ctx, x, groundY);
                break;
        }
    }

    _drawTree(ctx, x, y, size) {
        // Tronc
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - 5 * size, y - 40 * size, 10 * size, 40 * size);
        // Feuillage
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(x, y - 55 * size, 25 * size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#388E3C';
        ctx.beginPath();
        ctx.arc(x - 10 * size, y - 50 * size, 18 * size, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 12 * size, y - 48 * size, 16 * size, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawPalmTree(ctx, x, y, size) {
        // Tronc courbé
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 8 * size;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 10 * size, y - 40 * size, x + 5 * size, y - 80 * size);
        ctx.stroke();
        // Feuilles
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(x + 5 * size, y - 80 * size);
            ctx.quadraticCurveTo(
                x + 5 * size + Math.cos(angle) * 30 * size,
                y - 80 * size + Math.sin(angle) * 15 * size - 10,
                x + 5 * size + Math.cos(angle) * 40 * size,
                y - 80 * size + Math.sin(angle) * 20 * size + 5
            );
            ctx.stroke();
        }
        // Noix de coco
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.arc(x + 3 * size, y - 76 * size, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawBench(ctx, x, y) {
        ctx.fillStyle = '#795548';
        // Assise
        ctx.fillRect(x - 20, y - 16, 40, 4);
        // Pieds
        ctx.fillRect(x - 18, y - 16, 3, 16);
        ctx.fillRect(x + 15, y - 16, 3, 16);
        // Dossier
        ctx.fillRect(x - 20, y - 28, 40, 3);
        ctx.fillRect(x - 18, y - 28, 3, 14);
        ctx.fillRect(x + 15, y - 28, 3, 14);
    }

    _drawLamp(ctx, x, y) {
        // Poteau
        ctx.fillStyle = '#37474F';
        ctx.fillRect(x - 2, y - 70, 4, 70);
        // Luminaire
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(x, y - 72, 8, 0, Math.PI * 2);
        ctx.fill();
        // Halo lumineux
        ctx.fillStyle = 'rgba(255, 213, 79, 0.08)';
        ctx.beginPath();
        ctx.arc(x, y - 50, 50, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawFountain(ctx, x, y) {
        // Base
        ctx.fillStyle = '#90A4AE';
        ctx.beginPath();
        ctx.ellipse(x, y - 4, 35, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        // Bassin
        ctx.fillStyle = '#4FC3F7';
        ctx.beginPath();
        ctx.ellipse(x, y - 6, 30, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Colonne
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(x - 4, y - 30, 8, 26);
        // Jets d'eau
        ctx.strokeStyle = '#4FC3F7';
        ctx.lineWidth = 2;
        const t = Date.now() * 0.003;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(x, y - 30);
            ctx.quadraticCurveTo(
                x + i * 15,
                y - 45 - Math.sin(t + i) * 5,
                x + i * 20,
                y - 15
            );
            ctx.stroke();
        }
    }

    _drawFlower(ctx, x, y) {
        // Tige
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 15);
        ctx.stroke();
        // Pétales
        const colors = ['#E91E63', '#FF5722', '#FFC107', '#9C27B0'];
        const color = colors[Math.abs(Math.round(x)) % colors.length];
        ctx.fillStyle = color;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(x + Math.cos(angle) * 4, y - 15 + Math.sin(angle) * 4, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        // Centre
        ctx.fillStyle = '#FDD835';
        ctx.beginPath();
        ctx.arc(x, y - 15, 2.5, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawUmbrella(ctx, x, y) {
        const colors = ['#E91E63', '#FF9800'];
        const color = colors[Math.abs(Math.round(x)) % colors.length];
        // Poteau
        ctx.fillStyle = '#795548';
        ctx.fillRect(x - 2, y - 50, 4, 50);
        // Parasol
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y - 50, 28, 10, 0, Math.PI, 0);
        ctx.fill();
        // Rayures
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(x, y - 50, 28, 10, 0, Math.PI + 0.5, Math.PI + 1.2);
        ctx.fill();
    }

    _drawHouse(ctx, x, y) {
        // Mur
        ctx.fillStyle = '#BCAAA4';
        ctx.fillRect(x - 35, y - 60, 70, 60);
        // Toit
        ctx.fillStyle = '#D84315';
        ctx.beginPath();
        ctx.moveTo(x - 42, y - 60);
        ctx.lineTo(x, y - 90);
        ctx.lineTo(x + 42, y - 60);
        ctx.closePath();
        ctx.fill();
        // Porte
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - 8, y - 30, 16, 30);
        // Fenêtres
        ctx.fillStyle = '#FFF8E1';
        ctx.fillRect(x - 28, y - 50, 14, 12);
        ctx.fillRect(x + 14, y - 50, 14, 12);
        // Croisillons
        ctx.strokeStyle = '#795548';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 28, y - 44);
        ctx.lineTo(x - 14, y - 44);
        ctx.moveTo(x - 21, y - 50);
        ctx.lineTo(x - 21, y - 38);
        ctx.moveTo(x + 14, y - 44);
        ctx.lineTo(x + 28, y - 44);
        ctx.moveTo(x + 21, y - 50);
        ctx.lineTo(x + 21, y - 38);
        ctx.stroke();
    }

    getZoneAt(x) {
        for (const zone of this.zones) {
            if (x >= zone.x && x < zone.x + zone.width) {
                return zone;
            }
        }
        return null;
    }
}
