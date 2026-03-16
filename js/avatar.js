// ===== Système d'Avatar =====
// Ancre = pieds (y=0 = sol). Tout le dessin est AU-DESSUS (y négatif).

const AvatarConfig = {
    skinColors:   ['#FFDBB4', '#E8B88A', '#C68642', '#8D5524', '#4A2912', '#F5D0A9'],
    hairColors:   ['#2C1B0E', '#5A3214', '#8B6914', '#D4A017', '#C0392B', '#E74C3C',
                   '#2980B9', '#8E44AD', '#1ABC9C', '#ECF0F1'],
    hairStyles:   ['court', 'long', 'punk', 'queue', 'afro', 'chauve'],
    topColors:    ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C',
                   '#E67E22', '#ECF0F1', '#2C3E50', '#FF69B4'],
    topStyles:    ['tshirt', 'chemise', 'sweat', 'debardeur'],
    bottomColors: ['#2C3E50', '#34495E', '#2980B9', '#8B4513', '#1A1A2E',
                   '#4A4A4A', '#D4A017', '#C0392B'],
    bottomStyles: ['pantalon', 'short', 'jupe'],
    accessories:  ['aucun', 'lunettes', 'casquette', 'bandana', 'collier'],
};

class Avatar {
    constructor(config = {}) {
        this.skinColor   = config.skinColor   || AvatarConfig.skinColors[0];
        this.hairColor   = config.hairColor   || AvatarConfig.hairColors[0];
        this.hairStyle   = config.hairStyle   || 'court';
        this.topColor    = config.topColor    || AvatarConfig.topColors[0];
        this.topStyle    = config.topStyle    || 'tshirt';
        this.bottomColor = config.bottomColor || AvatarConfig.bottomColors[0];
        this.bottomStyle = config.bottomStyle || 'pantalon';
        this.accessory   = config.accessory   || 'aucun';
    }

    clone() {
        return new Avatar({
            skinColor:   this.skinColor,
            hairColor:   this.hairColor,
            hairStyle:   this.hairStyle,
            topColor:    this.topColor,
            topStyle:    this.topStyle,
            bottomColor: this.bottomColor,
            bottomStyle: this.bottomStyle,
            accessory:   this.accessory,
        });
    }

    // x,y = position des PIEDS sur le sol.
    draw(ctx, x, y, direction, walkFrame) {
        const isWalking = walkFrame > 0;
        const bounce    = isWalking ? Math.sin(walkFrame * 0.15) * 1.5 : 0;
        const legSwing  = isWalking ? Math.sin(walkFrame * 0.15) * 10  : 0;
        const armSwing  = isWalking ? Math.sin(walkFrame * 0.15) * 14  : 0;

        ctx.save();
        ctx.translate(x, y + bounce);

        // Ombre au sol (y ≈ 0)
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 1, 13, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        this._drawLegs(ctx, legSwing);
        this._drawTop(ctx);
        this._drawArms(ctx, armSwing);
        this._drawHead(ctx, direction);
        this._drawHair(ctx, direction);
        this._drawAccessory(ctx, direction);

        ctx.restore();
    }

    // ── Jambes & chaussures ─────────────────────────────────────────
    _drawLegs(ctx, swing) {
        if (this.bottomStyle === 'jupe') {
            // Jupe trapézoïdale de y=-22 à y=0
            ctx.fillStyle = this.bottomColor;
            ctx.beginPath();
            ctx.moveTo(-14, -22);
            ctx.lineTo( 14, -22);
            ctx.lineTo( 18,   0);
            ctx.lineTo(-18,   0);
            ctx.closePath();
            ctx.fill();
            // Jambes visibles sous la jupe
            ctx.fillStyle = this.skinColor;
            ctx.beginPath(); ctx.roundRect(-8 + swing * 0.3, -12, 7, 12, 3); ctx.fill();
            ctx.beginPath(); ctx.roundRect( 1 - swing * 0.3, -12, 7, 12, 3); ctx.fill();
        } else {
            const lh   = this.bottomStyle === 'short' ? 10 : 16;
            const topY = -8 - lh; // bas de jambe à y=-8 (dessus de la chaussure)

            // Jambe gauche
            ctx.save();
            ctx.translate(-5, topY);
            ctx.rotate(swing * Math.PI / 180);
            ctx.fillStyle = this.bottomColor;
            ctx.beginPath(); ctx.roundRect(-4, 0, 8, lh, [3, 3, 2, 2]); ctx.fill();
            ctx.restore();

            // Jambe droite
            ctx.save();
            ctx.translate(5, topY);
            ctx.rotate(-swing * Math.PI / 180);
            ctx.fillStyle = this.bottomColor;
            ctx.beginPath(); ctx.roundRect(-4, 0, 8, lh, [3, 3, 2, 2]); ctx.fill();
            ctx.restore();
        }

        // Chaussures grosses (chibi) de y=-8 à y=0
        ctx.fillStyle = '#222';
        ctx.beginPath(); ctx.roundRect(-13 + swing * 0.35, -8, 12, 8, [3, 5, 5, 3]); ctx.fill();
        ctx.beginPath(); ctx.roundRect(  1 - swing * 0.35, -8, 12, 8, [3, 5, 5, 3]); ctx.fill();
        // Reflet
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.ellipse(-8 + swing * 0.35, -5, 4, 2, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse( 6 - swing * 0.35, -5, 4, 2, -0.3, 0, Math.PI * 2); ctx.fill();
    }

    // ── Corps / haut ────────────────────────────────────────────────
    _drawTop(ctx) {
        ctx.fillStyle = this.topColor;
        // Corps de y=-42 à y=-20
        switch (this.topStyle) {
            case 'chemise':
                ctx.beginPath(); ctx.roundRect(-13, -42, 26, 22, 4); ctx.fill();
                // Boutonnière
                ctx.fillStyle = this._darken(this.topColor, 0.15);
                ctx.fillRect(-2, -42, 4, 22);
                break;
            case 'sweat':
                ctx.beginPath(); ctx.roundRect(-13, -42, 26, 22, 4); ctx.fill();
                // Poche kangourou
                ctx.fillStyle = this._darken(this.topColor, 0.1);
                ctx.beginPath(); ctx.roundRect(-8, -29, 16, 9, 3); ctx.fill();
                break;
            case 'debardeur':
                ctx.beginPath(); ctx.roundRect(-10, -42, 20, 22, 4); ctx.fill();
                // Épaules nues
                ctx.fillStyle = this.skinColor;
                ctx.fillRect(-14, -42, 4, 10);
                ctx.fillRect( 10, -42, 4, 10);
                break;
            default: // tshirt
                ctx.beginPath(); ctx.roundRect(-13, -42, 26, 22, 4); ctx.fill();
                break;
        }
    }

    // ── Bras ────────────────────────────────────────────────────────
    _drawArms(ctx, swing) {
        // Bras gauche
        ctx.save();
        ctx.translate(-15, -40);
        ctx.rotate(swing * Math.PI / 180);
        ctx.fillStyle = this.topColor;
        ctx.beginPath(); ctx.roundRect(-4, 0, 8, 11, 3); ctx.fill();
        ctx.fillStyle = this.skinColor;
        ctx.beginPath(); ctx.roundRect(-3, 10, 6, 9, 2); ctx.fill();
        ctx.restore();

        // Bras droit
        ctx.save();
        ctx.translate(15, -40);
        ctx.rotate(-swing * Math.PI / 180);
        ctx.fillStyle = this.topColor;
        ctx.beginPath(); ctx.roundRect(-4, 0, 8, 11, 3); ctx.fill();
        ctx.fillStyle = this.skinColor;
        ctx.beginPath(); ctx.roundRect(-3, 10, 6, 9, 2); ctx.fill();
        ctx.restore();
    }

    // ── Tête chibi ──────────────────────────────────────────────────
    _drawHead(ctx, direction) {
        const eox = direction === 'left' ? -3 : direction === 'right' ? 3 : 0;

        // Cou (y=-48 à y=-40)
        ctx.fillStyle = this.skinColor;
        ctx.beginPath(); ctx.roundRect(-4, -48, 8, 8, 2); ctx.fill();

        // Grande tête ronde chibi (centre y=-64, rx=20, ry=22)
        ctx.fillStyle = this.skinColor;
        ctx.beginPath();
        ctx.ellipse(0, -64, 20, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Joues roses
        ctx.fillStyle = 'rgba(255,110,110,0.35)';
        ctx.beginPath(); ctx.ellipse(-14 + eox, -60, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse( 14 + eox, -60, 6, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Yeux kawaii — blanc de l'œil
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(-6 + eox, -67, 5.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse( 6 + eox, -67, 5.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();

        // Iris colorés
        ctx.fillStyle = '#3a6fad';
        ctx.beginPath(); ctx.ellipse(-6 + eox, -66, 3.8, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse( 6 + eox, -66, 3.8, 5, 0, 0, Math.PI * 2); ctx.fill();

        // Pupilles
        const pupX = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(-6 + eox + pupX, -66, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc( 6 + eox + pupX, -66, 2.2, 0, Math.PI * 2); ctx.fill();

        // Reflets brillants
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-7 + eox, -68, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc( 5 + eox, -68, 1.4, 0, Math.PI * 2); ctx.fill();

        // Sourire
        ctx.strokeStyle = this._darken(this.skinColor, 0.3);
        ctx.lineWidth   = 1.8;
        ctx.beginPath();
        ctx.arc(eox, -58, 5, 0.15, Math.PI - 0.15);
        ctx.stroke();
    }

    // ── Cheveux ─────────────────────────────────────────────────────
    _drawHair(ctx, direction) {
        ctx.fillStyle = this.hairColor;

        switch (this.hairStyle) {
            case 'long':
                // Calotte
                ctx.beginPath();
                ctx.ellipse(0, -70, 22, 18, 0, Math.PI + 0.2, -0.2);
                ctx.fill();
                // Mèches latérales longues
                ctx.beginPath(); ctx.roundRect(-24, -78, 8, 38, 4); ctx.fill();
                ctx.beginPath(); ctx.roundRect( 16, -78, 8, 38, 4); ctx.fill();
                break;

            case 'punk':
                ctx.beginPath();
                ctx.moveTo(-12, -82);
                ctx.lineTo( -6, -98);
                ctx.lineTo(  0, -80);
                ctx.lineTo(  6,-102);
                ctx.lineTo( 12, -80);
                ctx.lineTo( 16, -92);
                ctx.lineTo( 20, -78);
                ctx.lineTo(-20, -78);
                ctx.closePath();
                ctx.fill();
                break;

            case 'queue':
                // Calotte
                ctx.beginPath();
                ctx.ellipse(0, -70, 21, 17, 0, Math.PI + 0.3, -0.3);
                ctx.fill();
                // Queue de cheval
                ctx.beginPath();
                ctx.moveTo(2, -84);
                ctx.quadraticCurveTo(22, -80, 20, -54);
                ctx.quadraticCurveTo(18, -50, 13, -54);
                ctx.quadraticCurveTo(14, -74,  0, -78);
                ctx.closePath();
                ctx.fill();
                break;

            case 'afro':
                ctx.beginPath();
                ctx.ellipse(0, -70, 28, 26, 0, 0, Math.PI * 2);
                ctx.fill();
                // Texture afro
                ctx.fillStyle = this._darken(this.hairColor, 0.1);
                for (let i = 0; i < 7; i++) {
                    const a = (i / 7) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.arc(Math.cos(a) * 18, -70 + Math.sin(a) * 18, 7, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 'chauve':
                // Simple reflet de crâne
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.beginPath(); ctx.ellipse(-5, -80, 7, 5, -0.3, 0, Math.PI * 2); ctx.fill();
                break;

            default: // court
                // Calotte
                ctx.beginPath();
                ctx.ellipse(0, -70, 21, 16, 0, Math.PI + 0.3, -0.3);
                ctx.fill();
                // Petite touffe sur le dessus
                ctx.beginPath();
                ctx.ellipse(0, -82, 9, 7, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    // ── Accessoires ─────────────────────────────────────────────────
    _drawAccessory(ctx, direction) {
        const eox = direction === 'left' ? -3 : direction === 'right' ? 3 : 0;

        switch (this.accessory) {
            case 'lunettes':
                ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.ellipse(-6 + eox, -67, 7.5, 8, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.ellipse( 6 + eox, -67, 7.5, 8, 0, 0, Math.PI * 2); ctx.stroke();
                // Branches
                ctx.beginPath();
                ctx.moveTo(-22 + eox, -67); ctx.lineTo(-14 + eox, -67);
                ctx.moveTo( 14 + eox, -67); ctx.lineTo( 20 + eox, -67);
                ctx.stroke();
                break;

            case 'casquette':
                // Calotte
                ctx.fillStyle = '#C0392B';
                ctx.beginPath(); ctx.ellipse(0, -82, 22, 8, 0, Math.PI, 0); ctx.fill();
                // Visière
                ctx.fillStyle = '#922B21';
                const vx = direction === 'left' ? -12 : direction === 'right' ? 12 : 0;
                ctx.beginPath(); ctx.ellipse(vx, -80, 18, 5, 0, 0, Math.PI); ctx.fill();
                break;

            case 'bandana':
                ctx.fillStyle = '#8E44AD';
                ctx.beginPath(); ctx.roundRect(-21, -80, 42, 8, 3); ctx.fill();
                // Nœud
                ctx.beginPath();
                ctx.moveTo(18, -80); ctx.lineTo(24, -75);
                ctx.lineTo(22, -70); ctx.lineTo(17, -73);
                ctx.closePath(); ctx.fill();
                break;

            case 'collier':
                ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.ellipse(0, -44, 11, 4, 0, 0, Math.PI); ctx.stroke();
                ctx.fillStyle = '#FFD700';
                ctx.beginPath(); ctx.arc(0, -40, 4, 0, Math.PI * 2); ctx.fill();
                break;
        }
    }

    _darken(color, amount) {
        const hex = color.replace('#', '');
        const r   = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
        const g   = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
        const b   = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));
        return `rgb(${r},${g},${b})`;
    }
}
