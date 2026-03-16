// ===== PNJs (personnages non-joueurs) =====

class NPC {
    constructor(name, x, groundY, avatarConfig, dialogues) {
        this.name = name;
        this.x = x;
        this.y = groundY;
        this.groundY = groundY;
        this.avatar = new Avatar(avatarConfig);
        this.dialogues = dialogues;
        this.direction = 'right';
        this.walkFrame = 0;
        this.isWalking = false;

        // IA de mouvement
        this.targetX = x;
        this.speed = 0.8;
        this.waitTimer = 0;
        this.wanderRadius = 150;
        this.homeX = x;
        this.chatCooldown = 0;
    }

    update(dt, chat) {
        // Timer de cooldown pour le chat
        if (this.chatCooldown > 0) this.chatCooldown -= dt;

        // Attente
        if (this.waitTimer > 0) {
            this.waitTimer -= dt;
            this.isWalking = false;
            this.walkFrame = 0;
            return;
        }

        // Se déplacer vers la cible
        const dx = this.targetX - this.x;
        if (Math.abs(dx) > 3) {
            this.isWalking = true;
            this.direction = dx > 0 ? 'right' : 'left';
            this.x += Math.sign(dx) * this.speed;
            this.walkFrame++;
        } else {
            this.isWalking = false;
            this.walkFrame = 0;

            // Choisir une nouvelle cible
            this.targetX = this.homeX + (Math.random() - 0.5) * this.wanderRadius * 2;
            this.targetX = Utils.clamp(this.targetX, 50, 2750);
            this.waitTimer = 2000 + Math.random() * 5000;

            // Parler de temps en temps
            if (this.chatCooldown <= 0 && Math.random() < 0.3) {
                const msg = Utils.randomChoice(this.dialogues);
                chat.addMessage(this.name, msg);
                chat.addBubble(this, msg);
                this.chatCooldown = 15000 + Math.random() * 20000;
            }
        }
    }

    draw(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Ne pas dessiner si hors écran
        if (screenX < -50 || screenX > ctx.canvas.width + 50) return;

        this.avatar.draw(ctx, screenX, screenY, this.direction, this.walkFrame);

        // Nom au-dessus
        ctx.fillStyle = '#88ccff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX, screenY - 95);
    }
}

function createNPCs(groundY) {
    return [
        new NPC('Marie', 200, groundY, {
            skinColor: '#FFDBB4',
            hairColor: '#8B6914',
            hairStyle: 'long',
            topColor: '#E91E63',
            topStyle: 'chemise',
            bottomColor: '#2C3E50',
            bottomStyle: 'jupe',
            accessory: 'collier',
        }, [
            'Il fait beau aujourd\'hui !',
            'T\'as vu la nouvelle fontaine ?',
            'J\'adore me promener dans le parc.',
            'Salut ! Comment ça va ?',
            'La plage est magnifique !',
        ]),

        new NPC('Lucas', 1100, groundY, {
            skinColor: '#E8B88A',
            hairColor: '#2C1B0E',
            hairStyle: 'court',
            topColor: '#3498DB',
            topStyle: 'sweat',
            bottomColor: '#34495E',
            bottomStyle: 'pantalon',
            accessory: 'casquette',
        }, [
            'Yo ! Tu viens d\'arriver ?',
            'J\'attends mes potes ici.',
            'La place centrale c\'est le meilleur spot.',
            'Tu connais cet endroit ?',
            'Check ma casquette !',
        ]),

        new NPC('Jade', 1650, groundY, {
            skinColor: '#C68642',
            hairColor: '#1ABC9C',
            hairStyle: 'punk',
            topColor: '#9B59B6',
            topStyle: 'debardeur',
            bottomColor: '#F9A825',
            bottomStyle: 'short',
            accessory: 'lunettes',
        }, [
            'La plage c\'est la vie !',
            'J\'ai des lunettes de soleil stylées non ?',
            'L\'eau est trop bonne.',
            'Tu viens nager ?',
            'J\'adore le sunset ici.',
        ]),

        new NPC('Thomas', 2300, groundY, {
            skinColor: '#8D5524',
            hairColor: '#ECF0F1',
            hairStyle: 'afro',
            topColor: '#2ECC71',
            topStyle: 'tshirt',
            bottomColor: '#1A1A2E',
            bottomStyle: 'pantalon',
            accessory: 'bandana',
        }, [
            'Bienvenue dans le quartier !',
            'Tu cherches quelqu\'un ?',
            'J\'habite juste là.',
            'C\'est tranquille par ici.',
            'Les maisons sont jolies, hein ?',
        ]),
    ];
}
