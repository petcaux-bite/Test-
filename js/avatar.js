// ===== Système d'Avatar =====

const AvatarConfig = {
    skinColors: ['#FFDBB4', '#E8B88A', '#C68642', '#8D5524', '#4A2912', '#F5D0A9'],
    hairColors: ['#2C1B0E', '#5A3214', '#8B6914', '#D4A017', '#C0392B', '#E74C3C', '#2980B9', '#8E44AD', '#1ABC9C', '#ECF0F1'],
    hairStyles: ['court', 'long', 'punk', 'queue', 'afro', 'chauve'],
    topColors: ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#ECF0F1', '#2C3E50', '#FF69B4'],
    topStyles: ['tshirt', 'chemise', 'sweat', 'debardeur'],
    bottomColors: ['#2C3E50', '#34495E', '#2980B9', '#8B4513', '#1A1A2E', '#4A4A4A', '#D4A017', '#C0392B'],
    bottomStyles: ['pantalon', 'short', 'jupe'],
    accessories: ['aucun', 'lunettes', 'casquette', 'bandana', 'collier'],
};

class Avatar {
    constructor(config = {}) {
        this.skinColor = config.skinColor || AvatarConfig.skinColors[0];
        this.hairColor = config.hairColor || AvatarConfig.hairColors[0];
        this.hairStyle = config.hairStyle || 'court';
        this.topColor = config.topColor || AvatarConfig.topColors[0];
        this.topStyle = config.topStyle || 'tshirt';
        this.bottomColor = config.bottomColor || AvatarConfig.bottomColors[0];
        this.bottomStyle = config.bottomStyle || 'pantalon';
        this.accessory = config.accessory || 'aucun';
    }

    clone() {
        return new Avatar({
            skinColor: this.skinColor,
            hairColor: this.hairColor,
            hairStyle: this.hairStyle,
            topColor: this.topColor,
            topStyle: this.topStyle,
            bottomColor: this.bottomColor,
            bottomStyle: this.bottomStyle,
            accessory: this.accessory,
        });
    }

    draw(ctx, x, y, direction, walkFrame) {
        const scale = 1;
        const bounce = Math.sin(walkFrame * 0.15) * 2;
        const isWalking = walkFrame > 0;
        const legSwing = isWalking ? Math.sin(walkFrame * 0.15) * 8 : 0;
        const armSwing = isWalking ? Math.sin(walkFrame * 0.15) * 12 : 0;

        ctx.save();
        ctx.translate(x, y + (isWalking ? bounce : 0));

        // Ombre au sol
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 48, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Jambes
        this._drawLegs(ctx, legSwing);

        // Corps (haut)
        this._drawTop(ctx);

        // Bras
        this._drawArms(ctx, armSwing, direction);

        // Tête
        this._drawHead(ctx, direction);

        // Cheveux
        this._drawHair(ctx, direction);

        // Accessoires
        this._drawAccessory(ctx, direction);

        ctx.restore();
    }

    _drawLegs(ctx, swing) {
        ctx.fillStyle = this.bottomColor;

        const legWidth = this.bottomStyle === 'jupe' ? 20 : 7;
        const legHeight = this.bottomStyle === 'short' ? 16 : 22;

        if (this.bottomStyle === 'jupe') {
            // Jupe
            ctx.beginPath();
            ctx.moveTo(-12, 14);
            ctx.lineTo(12, 14);
            ctx.lineTo(16, 14 + legHeight);
            ctx.lineTo(-16, 14 + legHeight);
            ctx.closePath();
            ctx.fill();
            // Jambes sous la jupe
            ctx.fillStyle = this.skinColor;
            ctx.fillRect(-6 + swing * 0.3, 32, 5, 14);
            ctx.fillRect(1 - swing * 0.3, 32, 5, 14);
        } else {
            // Jambe gauche
            ctx.save();
            ctx.translate(-5, 14);
            ctx.rotate(swing * Math.PI / 180);
            ctx.fillRect(-legWidth / 2, 0, legWidth, legHeight);
            ctx.restore();

            // Jambe droite
            ctx.save();
            ctx.translate(5, 14);
            ctx.rotate(-swing * Math.PI / 180);
            ctx.fillRect(-legWidth / 2, 0, legWidth, legHeight);
            ctx.restore();
        }

        // Chaussures
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(-9 + swing * 0.3, 44, 8, 4);
        ctx.fillRect(1 - swing * 0.3, 44, 8, 4);
    }

    _drawTop(ctx) {
        ctx.fillStyle = this.topColor;

        switch (this.topStyle) {
            case 'chemise':
                // Chemise avec col
                ctx.fillRect(-14, -14, 28, 30);
                ctx.fillStyle = this._darken(this.topColor, 0.15);
                ctx.fillRect(-2, -14, 4, 30);
                // Col
                ctx.fillStyle = this.topColor;
                ctx.beginPath();
                ctx.moveTo(-8, -14);
                ctx.lineTo(0, -10);
                ctx.lineTo(8, -14);
                ctx.stroke();
                break;

            case 'sweat':
                // Sweat à capuche
                ctx.fillRect(-14, -14, 28, 30);
                ctx.fillStyle = this._darken(this.topColor, 0.1);
                // Poche kangourou
                ctx.fillRect(-8, 4, 16, 8);
                break;

            case 'debardeur':
                ctx.fillRect(-10, -14, 20, 30);
                // Épaules nues
                ctx.fillStyle = this.skinColor;
                ctx.fillRect(-14, -12, 5, 8);
                ctx.fillRect(9, -12, 5, 8);
                break;

            default: // tshirt
                ctx.fillRect(-14, -14, 28, 30);
                break;
        }
    }

    _drawArms(ctx, swing, direction) {
        ctx.fillStyle = this.skinColor;

        // Bras gauche
        ctx.save();
        ctx.translate(-14, -10);
        ctx.rotate(swing * Math.PI / 180);
        ctx.fillRect(-3, 0, 6, 18);
        ctx.restore();

        // Bras droit
        ctx.save();
        ctx.translate(14, -10);
        ctx.rotate(-swing * Math.PI / 180);
        ctx.fillRect(-3, 0, 6, 18);
        ctx.restore();
    }

    _drawHead(ctx, direction) {
        // Cou
        ctx.fillStyle = this.skinColor;
        ctx.fillRect(-4, -20, 8, 8);

        // Tête
        ctx.fillStyle = this.skinColor;
        ctx.beginPath();
        ctx.ellipse(0, -30, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Yeux
        ctx.fillStyle = '#2C1B0E';
        const eyeOffsetX = direction === 'left' ? -3 : direction === 'right' ? 3 : 0;
        ctx.beginPath();
        ctx.ellipse(-5 + eyeOffsetX, -32, 2.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(5 + eyeOffsetX, -32, 2.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pupilles
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-5 + eyeOffsetX + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0), -32, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5 + eyeOffsetX + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0), -32, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Bouche
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(eyeOffsetX, -24, 4, 0.1, Math.PI - 0.1);
        ctx.stroke();
    }

    _drawHair(ctx, direction) {
        ctx.fillStyle = this.hairColor;

        switch (this.hairStyle) {
            case 'long':
                ctx.beginPath();
                ctx.ellipse(0, -34, 16, 14, 0, Math.PI + 0.3, -0.3);
                ctx.fill();
                // Mèches sur les côtés
                ctx.fillRect(-16, -36, 5, 24);
                ctx.fillRect(11, -36, 5, 24);
                break;

            case 'punk':
                ctx.beginPath();
                ctx.moveTo(-8, -44);
                ctx.lineTo(-4, -56);
                ctx.lineTo(0, -44);
                ctx.lineTo(4, -58);
                ctx.lineTo(8, -44);
                ctx.lineTo(12, -52);
                ctx.lineTo(14, -40);
                ctx.lineTo(-14, -40);
                ctx.closePath();
                ctx.fill();
                break;

            case 'queue':
                ctx.beginPath();
                ctx.ellipse(0, -34, 15, 12, 0, Math.PI + 0.4, -0.4);
                ctx.fill();
                // Queue de cheval
                ctx.beginPath();
                ctx.moveTo(0, -44);
                ctx.quadraticCurveTo(14, -42, 12, -20);
                ctx.quadraticCurveTo(10, -18, 6, -22);
                ctx.quadraticCurveTo(8, -38, 0, -40);
                ctx.closePath();
                ctx.fill();
                break;

            case 'afro':
                ctx.beginPath();
                ctx.ellipse(0, -36, 22, 22, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'chauve':
                // Pas de cheveux, juste un reflet
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.beginPath();
                ctx.ellipse(-4, -40, 5, 4, -0.3, 0, Math.PI * 2);
                ctx.fill();
                break;

            default: // court
                ctx.beginPath();
                ctx.ellipse(0, -34, 15, 12, 0, Math.PI + 0.4, -0.4);
                ctx.fill();
                break;
        }
    }

    _drawAccessory(ctx, direction) {
        switch (this.accessory) {
            case 'lunettes':
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1.5;
                const eyeOff = direction === 'left' ? -3 : direction === 'right' ? 3 : 0;
                ctx.beginPath();
                ctx.ellipse(-5 + eyeOff, -32, 5, 4, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(5 + eyeOff, -32, 5, 4, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0 + eyeOff, -32);
                ctx.lineTo(0 + eyeOff, -32);
                ctx.stroke();
                // Branche
                ctx.beginPath();
                ctx.moveTo(-10 + eyeOff, -32);
                ctx.lineTo(-16, -32);
                ctx.moveTo(10 + eyeOff, -32);
                ctx.lineTo(16, -32);
                ctx.stroke();
                break;

            case 'casquette':
                ctx.fillStyle = '#C0392B';
                ctx.beginPath();
                ctx.ellipse(0, -43, 16, 6, 0, Math.PI, 0);
                ctx.fill();
                // Visière
                ctx.fillStyle = '#922B21';
                ctx.beginPath();
                ctx.ellipse(direction === 'left' ? -8 : direction === 'right' ? 8 : 0, -42, 14, 4, 0, 0, Math.PI);
                ctx.fill();
                break;

            case 'bandana':
                ctx.fillStyle = '#8E44AD';
                ctx.fillRect(-15, -42, 30, 5);
                // Noeud
                ctx.beginPath();
                ctx.moveTo(14, -42);
                ctx.lineTo(20, -38);
                ctx.lineTo(18, -34);
                ctx.lineTo(14, -37);
                ctx.closePath();
                ctx.fill();
                break;

            case 'collier':
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(0, -15, 10, 4, 0, 0, Math.PI);
                ctx.stroke();
                // Pendentif
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(0, -11, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    _darken(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
        const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
        const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));
        return `rgb(${r},${g},${b})`;
    }
}
