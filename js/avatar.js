// ===== Système d'Avatar – Blob style Blabland =====
// Ancre = pieds (y=0 = sol). Le blob est ENTIÈREMENT au-dessus.

const AvatarConfig = {
    bodyColors: [
        '#4FC3F7', '#EF5350', '#FFA726', '#FFEE58', '#66BB6A',
        '#AB47BC', '#F5F5F5', '#F48FB1', '#26C6DA', '#D4E157',
        '#FF7043', '#42A5F5', '#EC407A', '#26A69A', '#8D6E63',
        '#78909C', '#FFF176', '#80CBC4', '#CE93D8', '#A5D6A7',
    ],
    eyeColors: ['#1565C0', '#2E7D32', '#880E4F', '#4A148C', '#BF360C', '#000000'],
    accessories: ['aucun', 'chapeau', 'couronne', 'antenne', 'lunettes', 'bonnet', 'feuille'],
    expressions: ['content', 'surpris', 'endormi', 'clin_oeil', 'fache'],

    // Skins rares achetables en boutique
    rareSkins: [
        { id: 'roi',      label: '👑 Roi',      color: '#FFEE58', accessory: 'couronne', expression: 'content', price: 200 },
        { id: 'cool',     label: '😎 Cool',     color: '#FFEE58', accessory: 'lunettes', expression: 'content', price: 200 },
        { id: 'furieux',  label: '😡 Furieux',  color: '#66BB6A', accessory: 'aucun',    expression: 'fache',   price: 100 },
        { id: 'chapeau',  label: '🎩 Chapeau',  color: '#AB47BC', accessory: 'chapeau',  expression: 'content', price: 150 },
        { id: 'fruit',    label: '🍊 Fruit',    color: '#FFA726', accessory: 'feuille',  expression: 'content', price:  75 },
        { id: 'bonnet',   label: '🧢 Bonnet',   color: '#EF5350', accessory: 'bonnet',   expression: 'content', price:  50 },
    ],
};

class Avatar {
    constructor(config = {}) {
        this.bodyColor  = config.bodyColor  || config.skinColor  || AvatarConfig.bodyColors[0];
        this.eyeColor   = config.eyeColor   || AvatarConfig.eyeColors[0];
        this.accessory  = config.accessory  || 'aucun';
        this.expression = config.expression || 'content';
    }

    clone() {
        return new Avatar({
            bodyColor:  this.bodyColor,
            eyeColor:   this.eyeColor,
            accessory:  this.accessory,
            expression: this.expression,
        });
    }

    // x,y = position des PIEDS (bas du blob = sol).
    draw(ctx, x, y, direction, walkFrame, scale = 1) {
        const isWalking = walkFrame > 0;
        const t         = walkFrame * 0.15;
        const bounce    = isWalking ? Math.abs(Math.sin(t)) * 3 : 0;
        const sqX       = 1 + (isWalking ? Math.sin(t) * 0.06 : 0);
        const sqY       = 1 - (isWalking ? Math.abs(Math.sin(t)) * 0.04 : 0);

        ctx.save();
        ctx.translate(x, y - bounce);
        if (scale !== 1) ctx.scale(scale, scale);

        const r = 22; // rayon du corps (cercle)

        // Ombre au sol
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, bounce / scale + 2, r * 1.1 * sqX, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // ─ Jambes (dessinées AVANT le corps pour être partiellement cachées) ──
        this._drawLegs(ctx, r, direction, walkFrame, sqX);

        // ─ Corps du blob ─────────────────────────────────────────────────────
        ctx.save();
        ctx.scale(sqX, sqY);
        this._drawBody(ctx, r);
        ctx.restore();

        // ─ Yeux ──────────────────────────────────────────────────────────────
        const dir = direction === 'left' ? -1 : 1;
        this._drawEyes(ctx, r, dir);

        // ─ Bouche / expression ───────────────────────────────────────────────
        this._drawMouth(ctx, r, dir);

        // ─ Accessoire ────────────────────────────────────────────────────────
        this._drawAccessory(ctx, r, dir);

        ctx.restore();
    }

    _drawBody(ctx, r) {
        const cy = -r; // centre du cercle (bas à y=0)

        // Gradient radial (brillance haut-gauche)
        const grad = ctx.createRadialGradient(
            -r * 0.35, cy - r * 0.38, r * 0.08,
             0,         cy,            r * 1.35
        );
        grad.addColorStop(0,   this._lighten(this.bodyColor, 0.42));
        grad.addColorStop(0.45, this.bodyColor);
        grad.addColorStop(1,   this._darken(this.bodyColor, 0.2));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Contour sombre léger
        ctx.strokeStyle = this._darken(this.bodyColor, 0.3);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Reflet brillant (haut-gauche)
        ctx.fillStyle = 'rgba(255,255,255,0.32)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.32, cy - r * 0.36, r * 0.36, r * 0.24, -0.45, 0, Math.PI * 2);
        ctx.fill();

        // Joues rosées
        ctx.fillStyle = 'rgba(255,140,140,0.26)';
        ctx.beginPath(); ctx.ellipse(-r * 0.58, cy + r * 0.12, r * 0.26, r * 0.17, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse( r * 0.58, cy + r * 0.12, r * 0.26, r * 0.17, 0, 0, Math.PI * 2); ctx.fill();
    }

    _drawLegs(ctx, r, direction, walkFrame, sqX) {
        const t   = walkFrame * 0.3;
        const cy  = -r;
        const legY = cy + r - 2; // bas du corps – les jambes dépassent légèrement

        const lSwing = Math.sin(t) * 3;
        const rSwing = -Math.sin(t) * 3;

        ctx.fillStyle = this._darken(this.bodyColor, 0.22);
        // Jambe gauche
        ctx.beginPath();
        ctx.ellipse(-r * 0.38 + lSwing, legY + 7, r * 0.22, r * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
        // Jambe droite
        ctx.beginPath();
        ctx.ellipse( r * 0.38 + rSwing, legY + 7, r * 0.22, r * 0.26, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawEyes(ctx, r, dir) {
        const cy    = -r;
        const eyeY  = cy - r * 0.06;
        const eyeSep = r * 0.42;
        const ew = r * 0.30, eh = r * 0.34;

        if (this.expression === 'endormi') {
            // Yeux fermés – traits courbés
            ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(-eyeSep, eyeY + eh * 0.1, ew * 0.75, Math.PI + 0.2, -0.2); ctx.stroke();
            ctx.beginPath(); ctx.arc( eyeSep, eyeY + eh * 0.1, ew * 0.75, Math.PI + 0.2, -0.2); ctx.stroke();
            return;
        }

        const drawOneEye = (ex) => {
            const eew = this.expression === 'surpris' ? ew * 1.25 : ew;
            const eeh = this.expression === 'surpris' ? eh * 1.25 : eh;
            // Blanc
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.ellipse(ex, eyeY, eew, eeh, 0, 0, Math.PI * 2); ctx.fill();
            // Iris
            ctx.fillStyle = this.eyeColor;
            ctx.beginPath(); ctx.ellipse(ex + dir * eew * 0.22, eyeY + eeh * 0.08, eew * 0.60, eeh * 0.62, 0, 0, Math.PI * 2); ctx.fill();
            // Pupille
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(ex + dir * eew * 0.28, eyeY + eeh * 0.10, eew * 0.32, 0, Math.PI * 2); ctx.fill();
            // Reflet
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(ex + dir * eew * 0.08, eyeY - eeh * 0.22, eew * 0.16, 0, Math.PI * 2); ctx.fill();
        };

        if (this.expression === 'clin_oeil') {
            drawOneEye(-eyeSep);
            // Œil fermé (clin d'œil)
            ctx.strokeStyle = '#555'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(eyeSep, eyeY + eh * 0.1, ew * 0.75, Math.PI + 0.2, -0.2); ctx.stroke();
            return;
        }

        drawOneEye(-eyeSep);
        drawOneEye( eyeSep);

        if (this.expression === 'fache') {
            // Sourcils froncés
            ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-eyeSep - ew * 1.1, eyeY - eh * 0.9);
            ctx.lineTo(-eyeSep + ew * 0.2, eyeY - eh * 1.25);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo( eyeSep + ew * 1.1, eyeY - eh * 0.9);
            ctx.lineTo( eyeSep - ew * 0.2, eyeY - eh * 1.25);
            ctx.stroke();
        }
    }

    _drawMouth(ctx, r, dir) {
        const cy   = -r;
        const mX   = dir * r * 0.06;
        const mY   = cy + r * 0.44;

        switch (this.expression) {
            case 'surpris':
                ctx.fillStyle = '#333';
                ctx.beginPath(); ctx.ellipse(mX, mY, r * 0.14, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#222';
                ctx.beginPath(); ctx.ellipse(mX, mY, r * 0.10, r * 0.13, 0, 0, Math.PI * 2); ctx.fill();
                break;
            case 'endormi':
                ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(mX - r * 0.14, mY); ctx.lineTo(mX + r * 0.14, mY); ctx.stroke();
                // ZZZ
                ctx.fillStyle = 'rgba(140,200,255,0.9)';
                ctx.font = `bold ${r * 0.4}px sans-serif`; ctx.textAlign = 'center';
                ctx.fillText('z', r * 0.9, cy - r * 1.1);
                ctx.font = `bold ${r * 0.55}px sans-serif`;
                ctx.fillText('Z', r * 1.2, cy - r * 1.45);
                break;
            case 'fache':
                ctx.strokeStyle = this._darken(this.bodyColor, 0.35);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mX, mY - r * 0.06, r * 0.18, Math.PI + 0.3, -0.3);
                ctx.stroke();
                break;
            default: // content, clin_oeil, surpris default = sourire
                ctx.strokeStyle = this._darken(this.bodyColor, 0.32);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mX, mY - r * 0.04, r * 0.18, 0.2, Math.PI - 0.2);
                ctx.stroke();
                break;
        }
    }

    _drawAccessory(ctx, r, dir) {
        const cy  = -r;
        const top = cy - r + 2; // sommet du corps

        switch (this.accessory) {
            case 'couronne': {
                // Couronne dorée
                const cx = 0, cw = r * 0.64;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(-cw, top + r * 0.18);
                ctx.lineTo(-cw, top - r * 0.08);
                ctx.lineTo(-cw * 0.5, top + r * 0.12);
                ctx.lineTo(0,  top - r * 0.22);
                ctx.lineTo( cw * 0.5, top + r * 0.12);
                ctx.lineTo( cw, top - r * 0.08);
                ctx.lineTo( cw, top + r * 0.18);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#F9A825'; ctx.lineWidth = 1;
                ctx.stroke();
                // Gems
                const gemColors = ['#EF5350', '#64B5F6', '#EF5350'];
                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = gemColors[i];
                    ctx.beginPath();
                    ctx.arc(-cw * 0.5 + i * cw * 0.5, top + r * 0.04, r * 0.09, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            }
            case 'lunettes': {
                const gy   = cy - r * 0.06;
                const eyeSep = r * 0.42;
                ctx.fillStyle = 'rgba(20,20,40,0.88)';
                ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5;
                // Lentille gauche
                ctx.beginPath(); ctx.roundRect(-eyeSep - r * 0.3, gy - r * 0.34, r * 0.6, r * 0.5, 4); ctx.fill(); ctx.stroke();
                // Lentille droite
                ctx.beginPath(); ctx.roundRect( eyeSep - r * 0.3, gy - r * 0.34, r * 0.6, r * 0.5, 4); ctx.fill(); ctx.stroke();
                // Pont
                ctx.strokeStyle = '#444'; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-eyeSep + r * 0.3, gy - r * 0.12);
                ctx.lineTo( eyeSep - r * 0.3, gy - r * 0.12);
                ctx.stroke();
                // Reflets
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.beginPath(); ctx.ellipse(-eyeSep - r * 0.06, gy - r * 0.12, r * 0.15, r * 0.09, -0.3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( eyeSep - r * 0.06, gy - r * 0.12, r * 0.15, r * 0.09, -0.3, 0, Math.PI * 2); ctx.fill();
                break;
            }
            case 'chapeau': {
                // Chapeau cylindrique rouge
                const htop = top - r * 0.36;
                // Bord
                ctx.fillStyle = '#B71C1C';
                ctx.beginPath(); ctx.ellipse(0, htop + r * 0.36, r * 0.74, r * 0.17, 0, 0, Math.PI * 2); ctx.fill();
                // Cylindre
                ctx.fillStyle = '#C62828';
                ctx.beginPath();
                ctx.moveTo(-r * 0.46, htop + r * 0.36);
                ctx.lineTo(-r * 0.46, htop);
                ctx.arc(0, htop, r * 0.46, Math.PI, 0);
                ctx.lineTo( r * 0.46, htop + r * 0.36);
                ctx.closePath(); ctx.fill();
                // Bande décorative
                ctx.fillStyle = '#FF6F00';
                ctx.fillRect(-r * 0.46, htop + r * 0.14, r * 0.92, r * 0.14);
                // Bouton
                ctx.fillStyle = '#FF8F00';
                ctx.beginPath(); ctx.arc(0, htop, r * 0.1, 0, Math.PI * 2); ctx.fill();
                break;
            }
            case 'bonnet': {
                // Bonnet de laine orange/rouge
                const btop = top - r * 0.32;
                ctx.fillStyle = '#FF5722';
                ctx.beginPath(); ctx.ellipse(0, btop + r * 0.3, r * 0.72, r * 0.18, 0, Math.PI, 0); ctx.fill();
                ctx.beginPath(); ctx.arc(0, btop, r * 0.58, Math.PI, 0); ctx.fill();
                // Pompon
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(0, btop - r * 0.6, r * 0.22, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#FF5722';
                ctx.beginPath(); ctx.arc(0, btop - r * 0.6, r * 0.16, 0, Math.PI * 2); ctx.fill();
                break;
            }
            case 'feuille': {
                // Feuille verte sur le côté
                const lx = r * 0.2, ly = top - r * 0.02;
                ctx.fillStyle = '#388E3C';
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.bezierCurveTo(lx + r * 0.55, ly - r * 0.48, lx + r * 0.65, ly + r * 0.12, lx, ly + r * 0.28);
                ctx.bezierCurveTo(lx - r * 0.18, ly + r * 0.12, lx - r * 0.1, ly - r * 0.14, lx, ly);
                ctx.fill();
                ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + r * 0.22, ly + r * 0.22); ctx.stroke();
                break;
            }
            case 'antenne': {
                // Antenne avec boule lumineuse
                ctx.strokeStyle = '#9E9E9E'; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dir * r * 0.18, top + r * 0.08);
                ctx.quadraticCurveTo(dir * r * 0.55, top - r * 0.35, dir * r * 0.52, top - r * 0.65);
                ctx.stroke();
                const pulseR = r * 0.14 + Math.sin(Date.now() * 0.004) * r * 0.04;
                ctx.fillStyle = 'rgba(255,80,80,0.82)';
                ctx.beginPath(); ctx.arc(dir * r * 0.52, top - r * 0.68, pulseR, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(dir * r * 0.48, top - r * 0.72, pulseR * 0.4, 0, Math.PI * 2); ctx.fill();
                break;
            }
        }
    }

    _lighten(color, amount) {
        const hex = color.replace('#', '');
        if (hex.length < 6) return color;
        const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.round(255 * amount));
        const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.round(255 * amount));
        const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.round(255 * amount));
        return `rgb(${r},${g},${b})`;
    }

    _darken(color, amount) {
        const hex = color.replace('#', '');
        if (hex.length < 6) return color;
        const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
        const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
        const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));
        return `rgb(${r},${g},${b})`;
    }
}
