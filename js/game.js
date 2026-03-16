// ===== Moteur de Jeu Principal =====

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();

        this.world = new World(2800, 600);
        this.chat = new ChatSystem();

        this.player = null;
        this.npcs = createNPCs(this.world.groundY);

        this.camera = { x: 0, y: 0 };
        this.keys = {};
        this.mouseTarget = null;
        this.lastTime = 0;
        this.running = false;

        this._setupInput();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start(playerName, avatarConfig) {
        this.player = {
            name: playerName,
            x: 1050,
            y: this.world.groundY,
            avatar: new Avatar(avatarConfig),
            direction: 'right',
            walkFrame: 0,
            isWalking: false,
            speed: 2.5,
        };

        this.chat.setPlayer(this.player);
        this.chat.addMessage(null, playerName + ' a rejoint BlabWorld !', true);

        this.camera.x = this.player.x - this.canvas.width / 2;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this._loop(t));
    }

    _setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left + this.camera.x;
            this.mouseTarget = clickX;
        });
    }

    _loop(timestamp) {
        if (!this.running) return;

        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this._update(dt);
        this._draw();

        requestAnimationFrame((t) => this._loop(t));
    }

    _update(dt) {
        if (!this.player) return;

        // Déplacement joueur (clavier)
        let moving = false;
        if (!this.chat.isChatFocused()) {
            if (this.keys['arrowright'] || this.keys['d']) {
                this.player.x += this.player.speed;
                this.player.direction = 'right';
                moving = true;
                this.mouseTarget = null;
            }
            if (this.keys['arrowleft'] || this.keys['q'] || this.keys['a']) {
                this.player.x -= this.player.speed;
                this.player.direction = 'left';
                moving = true;
                this.mouseTarget = null;
            }
        }

        // Déplacement joueur (souris)
        if (this.mouseTarget !== null) {
            const dx = this.mouseTarget - this.player.x;
            if (Math.abs(dx) > 5) {
                this.player.direction = dx > 0 ? 'right' : 'left';
                this.player.x += Math.sign(dx) * this.player.speed;
                moving = true;
            } else {
                this.mouseTarget = null;
            }
        }

        // Limiter le joueur dans le monde
        this.player.x = Utils.clamp(this.player.x, 30, this.world.width - 30);

        if (moving) {
            this.player.walkFrame++;
            this.player.isWalking = true;
        } else {
            this.player.walkFrame = 0;
            this.player.isWalking = false;
        }

        // NPCs
        for (const npc of this.npcs) {
            npc.update(dt, this.chat);
        }

        // Chat
        this.chat.update();

        // Caméra (smooth follow)
        const targetCamX = this.player.x - this.canvas.width / 2;
        const targetCamY = 0;
        this.camera.x = Utils.lerp(this.camera.x, targetCamX, 0.08);
        this.camera.y = Utils.lerp(this.camera.y, targetCamY, 0.08);

        // Limiter la caméra
        this.camera.x = Utils.clamp(this.camera.x, 0, this.world.width - this.canvas.width);
    }

    _draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Monde
        this.world.draw(ctx, this.camera);

        // Collecter toutes les entités et trier par Y (profondeur)
        const entities = [];

        for (const npc of this.npcs) {
            entities.push({ type: 'npc', entity: npc, y: npc.y });
        }

        if (this.player) {
            entities.push({ type: 'player', entity: this.player, y: this.player.y });
        }

        entities.sort((a, b) => a.y - b.y);

        // Dessiner les entités
        for (const e of entities) {
            if (e.type === 'npc') {
                e.entity.draw(ctx, this.camera);
            } else {
                this._drawPlayer(ctx);
            }
        }

        // Bulles de chat
        this.chat.drawBubbles(ctx, this.camera);

        // Zone indicator
        this._drawZoneIndicator(ctx);

        // Indicateur de contrôles
        this._drawControls(ctx);
    }

    _drawPlayer(ctx) {
        const p = this.player;
        const screenX = p.x - this.camera.x;
        const screenY = p.y - this.camera.y;

        p.avatar.draw(ctx, screenX, screenY, p.direction, p.walkFrame);

        // Nom du joueur
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, screenX, screenY - 54);
    }

    _drawZoneIndicator(ctx) {
        if (!this.player) return;
        const zone = this.world.getZoneAt(this.player.x);
        if (zone) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(zone.name, this.canvas.width / 2, 30);
            ctx.fillStyle = '#fff';
            ctx.fillText(zone.name, this.canvas.width / 2 - 1, 29);
        }
    }

    _drawControls(ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Flèches/ZQSD: Se déplacer | Clic: Aller vers | Entrée: Chatter', 10, this.canvas.height - 10);
    }

    updatePlayerAvatar(avatarConfig) {
        if (this.player) {
            this.player.avatar = new Avatar(avatarConfig);
        }
    }
}
