// ===== Système d'Avatar – Blob style Blabland =====
// Ancre = pieds (y=0 = sol). Le blob est ENTIÈREMENT au-dessus.

const AvatarConfig = {
    bodyColors: [
        '#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#FF9800',
        '#00BCD4', '#F44336', '#FFEB3B', '#E91E63', '#607D8B',
        '#8BC34A', '#FF4081', '#00E5FF', '#CDDC39', '#FF6D00',
        '#76FF03', '#EA80FC', '#FFFFFF', '#37474F', '#FF80AB',
    ],
    eyeColors:   ['#1565C0', '#2E7D32', '#880E4F', '#4A148C', '#BF360C', '#000000'],
    accessories: ['aucun', 'chapeau', 'couronne', 'antenne', 'lunettes', 'bonnet'],
    expressions: ['content', 'surpris', 'endormi', 'clin_oeil'],
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
    draw(ctx, x, y, direction, walkFrame) {
        const isWalking = walkFrame > 0;
        const t         = walkFrame * 0.15;
        // Rebond vertical quand on marche
        const bounce    = isWalking ? Math.abs(Math.sin(t)) * 4 : 0;
        // Squish horizontal/vertical (comme Blabland)
        const sqX       = 1 + (isWalking ? Math.sin(t) * 0.07 : 0);
        const sqY       = 1 - (isWalking ? Math.abs(Math.sin(t)) * 0.05 : 0);

        ctx.save();
        ctx.translate(x, y - bounce);

        // Ombre au sol
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, bounce + 1, 18 * sqX, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // ─ Corps du blob ─────────────────────────────────────────────
        ctx.save();
        ctx.scale(sqX, sqY);

        const bw = 22, bh = 26; // demi-largeur, demi-hauteur
        // Gradient radial pour la rondeur
        const grad = ctx.createRadialGradient(
            -bw * 0.35, -bh * 1.55, 2,
             0,         -bh,        bw * 1.4
        );
        grad.addColorStop(0,   this._lighten(this.bodyColor, 0.4));
        grad.addColorStop(0.5, this.bodyColor);
        grad.addColorStop(1,   this._darken(this.bodyColor, 0.18));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, -bh, bw, bh, 0, 0, Math.PI * 2);
        ctx.fill();

        // Contour sombre
        ctx.strokeStyle = this._darken(this.bodyColor, 0.3);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -bh, bw, bh, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Reflet brillant
        ctx.fillStyle = 'rgba(255,255,255,0.28)';
        ctx.beginPath();
        ctx.ellipse(-bw * 0.45, -bh * 1.45, bw * 0.4, bh * 0.3, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // scale

        // ─ Yeux ──────────────────────────────────────────────────────
        const dir  = direction === 'left' ? -1 : 1;
        const eyeY = -34;
        this._drawEyes(ctx, dir, eyeY);

        // ─ Expression ────────────────────────────────────────────────
        this._drawExpression(ctx, dir, eyeY);

        // ─ Accessoire ────────────────────────────────────────────────
        this._drawAccessory(ctx, dir);

        ctx.restore();
    }

    _drawEyes(ctx, dir, eyeY) {
        // Position des deux yeux (côté où le blob regarde en avant)
        const lx = dir * (-3), rx = dir * 8;

        switch (this.expression) {
            case 'endormi':
                // Yeux mi-clos
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.ellipse(lx, eyeY,     6,   4, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(rx, eyeY,     6,   4, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#333';
                ctx.beginPath(); ctx.ellipse(lx, eyeY + 1, 5.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(rx, eyeY + 1, 5.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
                return;
            case 'clin_oeil':
                // Un œil fermé (clin d'œil)
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.ellipse(lx, eyeY, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = this.eyeColor;
                ctx.beginPath(); ctx.ellipse(lx, eyeY, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#111';
                ctx.beginPath(); ctx.arc(lx + dir, eyeY, 2.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(lx - 1, eyeY - 2, 1.4, 0, Math.PI * 2); ctx.fill();
                // Œil fermé (trait)
                ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(rx, eyeY, 5, Math.PI + 0.3, -0.3); ctx.stroke();
                return;
        }

        // Yeux normaux (content / surpris)
        const eyeH = this.expression === 'surpris' ? 8 : 7;
        const eyeW = this.expression === 'surpris' ? 6 : 6;

        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(lx, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(rx, eyeY, eyeW, eyeH, 0, 0, Math.PI * 2); ctx.fill();

        // Iris
        ctx.fillStyle = this.eyeColor;
        ctx.beginPath(); ctx.ellipse(lx, eyeY, eyeW * 0.65, eyeH * 0.72, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(rx, eyeY, eyeW * 0.65, eyeH * 0.72, 0, 0, Math.PI * 2); ctx.fill();

        // Pupilles
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(lx + dir, eyeY, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx + dir, eyeY, 2.4, 0, Math.PI * 2); ctx.fill();

        // Reflets
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(lx - 1, eyeY - 2, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(rx - 1, eyeY - 2, 1.4, 0, Math.PI * 2); ctx.fill();
    }

    _drawExpression(ctx, dir, eyeY) {
        switch (this.expression) {
            case 'surpris':
                // Bouche ronde ouverte
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.ellipse(dir * 2, eyeY + 13, 5, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.ellipse(dir * 2, eyeY + 14, 3.5, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'endormi':
                // ZZZ flottant
                ctx.fillStyle = 'rgba(140,200,255,0.9)';
                ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('z', dir * 20, eyeY - 14);
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText('Z', dir * 26, eyeY - 24);
                // Petite bouche endormie
                ctx.strokeStyle = '#888'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(dir * -3, eyeY + 12); ctx.lineTo(dir * 8, eyeY + 12); ctx.stroke();
                break;
            default: // content + clin_oeil
                // Sourire
                ctx.strokeStyle = this._darken(this.bodyColor, 0.3);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(dir * 2, eyeY + 12, 5.5, 0.2, Math.PI - 0.2);
                ctx.stroke();
                break;
        }
    }

    _drawAccessory(ctx, dir) {
        switch (this.accessory) {
            case 'chapeau':
                // Chapeau haut de forme
                ctx.fillStyle = '#1A1A1A';
                ctx.beginPath(); ctx.ellipse(0, -50, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillRect(-10, -68, 20, 18);
                ctx.fillStyle = '#333';
                ctx.beginPath(); ctx.ellipse(0, -68, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
                // Ruban
                ctx.fillStyle = '#E91E63';
                ctx.fillRect(-10, -57, 20, 4);
                break;

            case 'bonnet':
                // Bonnet de laine
                ctx.fillStyle = '#FF5722';
                ctx.beginPath();
                ctx.ellipse(0, -50, 20, 6, 0, Math.PI, 0);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(0, -58, 17, 16, 0, 0, Math.PI * 2);
                ctx.fill();
                // Pompon
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(0, -75, 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#FF5722';
                ctx.beginPath(); ctx.arc(0, -75, 5, 0, Math.PI * 2); ctx.fill();
                // Rayures
                ctx.strokeStyle = '#FFCCBC'; ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(0, -50, 0, 0, 0); // placeholder
                    const ry = -50 - i * 7;
                    ctx.moveTo(-17, ry - 2); ctx.lineTo(17, ry - 2);
                    ctx.stroke();
                }
                break;

            case 'couronne':
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(-14, -50); ctx.lineTo(-14, -62);
                ctx.lineTo(-7,  -57); ctx.lineTo(  0, -66);
                ctx.lineTo(  7, -57); ctx.lineTo( 14, -62);
                ctx.lineTo( 14, -50);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#F9A825'; ctx.lineWidth = 1;
                ctx.stroke();
                // Gemmes
                ctx.fillStyle = '#E53935';
                ctx.beginPath(); ctx.arc(0, -60, 3, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#1565C0';
                ctx.beginPath(); ctx.arc(-10, -55, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc( 10, -55, 2.5, 0, Math.PI * 2); ctx.fill();
                break;

            case 'antenne':
                ctx.strokeStyle = '#AAA'; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(dir * 5, -50);
                ctx.quadraticCurveTo(dir * 18, -60, dir * 14, -70);
                ctx.stroke();
                const pulseR = 4 + Math.sin(Date.now() * 0.004) * 1.5;
                ctx.fillStyle = 'rgba(255,80,80,0.8)';
                ctx.beginPath(); ctx.arc(dir * 14, -71, pulseR, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(dir * 13, -72, 1.5, 0, Math.PI * 2); ctx.fill();
                break;

            case 'lunettes':
                ctx.strokeStyle = '#333'; ctx.lineWidth = 1.8;
                ctx.beginPath(); ctx.ellipse(-3, -34, 8,  8.5, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.ellipse( 8, -34, 8,  8.5, 0, 0, Math.PI * 2); ctx.stroke();
                // Branches
                ctx.beginPath();
                ctx.moveTo(-22, -34); ctx.lineTo(-11, -34);
                ctx.moveTo(  5, -34); ctx.lineTo( 16, -34);
                ctx.stroke();
                break;
        }
    }

    _lighten(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.round(255 * amount));
        const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.round(255 * amount));
        const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.round(255 * amount));
        return `rgb(${r},${g},${b})`;
    }

    _darken(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
        const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
        const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));
        return `rgb(${r},${g},${b})`;
    }
}
