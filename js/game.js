// ===== Moteur de Jeu Principal =====

const GRAVITY       = 0.55;
const JUMP_FORCE    = -13.5;
const MAX_FALL      = 18;
const PLAYER_HALF_W = 12;   // demi-largeur collision
const PLAYER_H      = 48;   // hauteur du personnage

class Game {
    constructor(canvas) {
        this.canvas  = canvas;
        this.ctx     = canvas.getContext('2d');
        this.resize();

        this.world   = new World(4000, 1400);
        this.chat    = new ChatSystem();
        this.player  = null;
        this.npcs    = createNPCs(this.world.SURFACE_Y);

        this.camera  = { x: 0, y: 0 };
        this.keys    = {};
        this.mouseTarget    = null;
        this.lastTime       = 0;
        this.running        = false;
        this.isAdmin        = false;
        this.adminPanelOpen = false;

        this._setupInput();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start(playerName, avatarConfig, isAdmin = false) {
        this.isAdmin = isAdmin;

        this.player = {
            name:          playerName,
            x:             200,
            y:             this.world.SURFACE_Y,
            velX:          0,
            velY:          0,
            onGround:      false,
            canDoubleJump: true,
            avatar:        new Avatar(avatarConfig),
            direction:     'right',
            walkFrame:     0,
            isWalking:     false,
            speed:         3,
        };

        this.chat.setPlayer(this.player);
        this.chat.addMessage(null, playerName + ' a rejoint BlabWorld !', true);
        if (isAdmin) {
            this.chat.addMessage(null, '⚜ Connexion en tant qu\'Admin !', true);
            const btn = document.getElementById('btn-admin');
            if (btn) btn.style.display = 'inline-flex';
        }

        this.camera.x = this.player.x - this.canvas.width  / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;

        this.running  = true;
        this.lastTime = performance.now();
        requestAnimationFrame(t => this._loop(t));
    }

    // ------------------------------------------------------------------
    _setupInput() {
        window.addEventListener('keydown', e => {
            this.keys[e.key]  = true;
            this.keys[e.code] = true;

            if (!this.chat.isChatFocused()) {
                if (e.code === 'Space' || e.key === 'ArrowUp'
                        || e.key === 'z' || e.key === 'Z') {
                    e.preventDefault();
                    this._tryJump();
                }
            }
        });
        window.addEventListener('keyup', e => {
            this.keys[e.key]  = false;
            this.keys[e.code] = false;
        });
        this.canvas.addEventListener('click', e => {
            if (this.adminPanelOpen) return;
            const rect   = this.canvas.getBoundingClientRect();
            this.mouseTarget = e.clientX - rect.left + this.camera.x;
        });
    }

    _tryJump() {
        if (!this.player) return;
        if (this.player.onGround) {
            this.player.velY           = JUMP_FORCE;
            this.player.onGround       = false;
        } else if (this.player.canDoubleJump) {
            this.player.velY           = JUMP_FORCE * 0.82;
            this.player.canDoubleJump  = false;
        }
    }

    // ------------------------------------------------------------------
    _loop(timestamp) {
        if (!this.running) return;
        const dt = Math.min(timestamp - this.lastTime, 50);
        this.lastTime = timestamp;
        this._update(dt);
        this._draw();
        requestAnimationFrame(t => this._loop(t));
    }

    // ------------------------------------------------------------------
    _update(dt) {
        if (!this.player) return;
        const p = this.player;

        // Mouvement horizontal
        let moving = false;
        if (!this.chat.isChatFocused()) {
            if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
                p.x += p.speed; p.direction = 'right'; moving = true; this.mouseTarget = null;
            }
            if (this.keys['ArrowLeft'] || this.keys['q'] || this.keys['Q']
                    || this.keys['a'] || this.keys['A']) {
                p.x -= p.speed; p.direction = 'left'; moving = true; this.mouseTarget = null;
            }
        }

        // Déplacement souris (horizontal uniquement)
        if (this.mouseTarget !== null) {
            const dx = this.mouseTarget - p.x;
            if (Math.abs(dx) > 6) {
                p.direction = dx > 0 ? 'right' : 'left';
                p.x += Math.sign(dx) * p.speed;
                moving = true;
            } else {
                this.mouseTarget = null;
            }
        }

        // Gravité
        p.velY += GRAVITY;
        if (p.velY > MAX_FALL) p.velY = MAX_FALL;

        const prevY = p.y;
        p.y += p.velY;

        // Collision avec surfaces
        p.onGround = false;
        for (const surf of this.world.getAllSurfaces()) {
            const pL = p.x - PLAYER_HALF_W;
            const pR = p.x + PLAYER_HALF_W;
            if (pR <= surf.x + 2 || pL >= surf.x + surf.width - 2) continue;

            // Atterrissage (dessus)
            if (prevY <= surf.y && p.y >= surf.y) {
                p.y             = surf.y;
                p.velY          = 0;
                p.onGround      = true;
                p.canDoubleJump = true;
            }
            // Plafond (sols solides uniquement)
            if (surf.type === 'ground') {
                const bot = surf.y + 30;
                if ((prevY - PLAYER_H) >= bot && (p.y - PLAYER_H) < bot) {
                    p.y = bot + PLAYER_H;
                    if (p.velY < 0) p.velY = 0;
                }
            }
        }

        // Limites monde
        p.x = Utils.clamp(p.x, 30, this.world.width - 30);

        // Chute hors monde → réapparition
        if (p.y > this.world.height + 100) {
            p.x = 200; p.y = this.world.SURFACE_Y; p.velY = 0;
            this.chat.addMessage(null, p.name + ' est tombé dans le vide !', true);
        }

        // Zone admin bloquée pour non-admins
        if (!this.isAdmin && this.world.isAdminZone(p.x, p.y)) {
            p.x    = this.world.adminArea.x - 40;
            p.velY = -8;
            this._showNotif('🚫 Zone Admin – Réservé aux administrateurs !');
        }

        // Animations marche
        if (moving && p.onGround) {
            p.walkFrame++;
            p.isWalking = true;
        } else {
            p.walkFrame = 0;
            p.isWalking = false;
        }

        for (const npc of this.npcs) npc.update(dt, this.chat);
        this.chat.update();

        // Caméra 2D smooth follow
        const targetX = p.x - this.canvas.width  / 2;
        const targetY = p.y - PLAYER_H / 2 - this.canvas.height * 0.45;
        this.camera.x = Utils.lerp(this.camera.x, targetX, 0.1);
        this.camera.y = Utils.lerp(this.camera.y, targetY, 0.1);
        this.camera.x = Utils.clamp(this.camera.x, 0, this.world.width  - this.canvas.width);
        this.camera.y = Utils.clamp(this.camera.y, 0, this.world.height - this.canvas.height);
    }

    // ------------------------------------------------------------------
    _showNotif(text) {
        const old = document.getElementById('game-notif');
        if (old) old.remove();
        const div = document.createElement('div');
        div.id = 'game-notif';
        div.textContent = text;
        div.style.cssText = `
            position:fixed;top:24px;left:50%;transform:translateX(-50%);
            background:rgba(0,0,0,0.88);color:#FF5252;
            padding:12px 28px;border-radius:10px;
            font-size:14px;font-weight:bold;
            z-index:500;border:1px solid rgba(255,82,82,0.4);
            animation:notifFade 3s ease forwards;pointer-events:none;
        `;
        document.body.appendChild(div);
        setTimeout(() => { if (div.parentNode) div.remove(); }, 3200);
    }

    // ------------------------------------------------------------------
    _draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.world.draw(ctx, this.camera);

        // Entités triées par Y
        const entities = this.npcs.map(n => ({ type: 'npc', entity: n }));
        if (this.player) entities.push({ type: 'player', entity: this.player });
        entities.sort((a, b) => a.entity.y - b.entity.y);

        for (const e of entities) {
            if (e.type === 'npc') e.entity.draw(ctx, this.camera);
            else this._drawPlayer(ctx);
        }

        this.chat.drawBubbles(ctx, this.camera);
        this._drawDepthOverlay(ctx, canvas);
        this._drawZoneIndicator(ctx);
        this._drawJumpIndicator(ctx);
        this._drawControls(ctx);
    }

    _drawPlayer(ctx) {
        const p  = this.player;
        const sx = p.x - this.camera.x;
        const sy = p.y - this.camera.y;

        p.avatar.draw(ctx, sx, sy, p.direction, p.isWalking ? p.walkFrame : 0);

        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        if (this.isAdmin) {
            ctx.fillStyle = '#FFD700';
            ctx.fillText('⚜ ' + p.name + ' ⚜', sx, sy - 56);
        } else {
            ctx.fillStyle = '#fff';
            ctx.fillText(p.name, sx, sy - 55);
        }
    }

    _drawDepthOverlay(ctx, canvas) {
        if (!this.player) return;
        const depth = this.player.y - this.world.SURFACE_Y - 70;
        if (depth <= 0) return;
        ctx.fillStyle = `rgba(0,0,0,${Math.min(0.55, depth / 750 * 0.55)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    _drawZoneIndicator(ctx) {
        if (!this.player) return;
        const zone = this.world.getZoneAt(this.player.x, this.player.y);
        if (!zone?.name) return;
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillText(zone.name, this.canvas.width / 2, 33);
        ctx.fillStyle = zone.color || '#fff';
        ctx.fillText(zone.name, this.canvas.width / 2 - 1, 32);
    }

    _drawJumpIndicator(ctx) {
        if (!this.player || this.player.onGround || this.player.canDoubleJump) return;
        const sx = this.player.x - this.camera.x;
        const sy = this.player.y - this.camera.y;
        ctx.fillStyle = 'rgba(255,200,0,0.55)';
        ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('✦', sx, sy - 66);
    }

    _drawControls(ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(
            '← →/Q D : Déplacer  |  Espace/↑/Z : Sauter (×2)  |  Entrée : Chat  |  Clic : Aller vers',
            10, this.canvas.height - 10
        );
    }

    // ------------------------------------------------------------------
    // PANNEAU ADMIN
    // ------------------------------------------------------------------
    toggleAdminPanel() {
        if (!this.isAdmin) return;
        this.adminPanelOpen = !this.adminPanelOpen;
        const panel = document.getElementById('admin-panel');
        if (!panel) return;
        panel.classList.toggle('hidden', !this.adminPanelOpen);
        if (this.adminPanelOpen) this._refreshAdminPanel();
    }

    _refreshAdminPanel() {
        const zone = this.player
            ? this.world.getZoneAt(this.player.x, this.player.y)
            : null;
        const el = document.getElementById('admin-current-zone');
        if (el) el.textContent = zone?.name || 'Inconnue';

        const fakes = [
            { name: this.player?.name || 'Admin', zone: zone?.name || 'Surface', me: true },
            { name: 'Maya',   zone: 'Plaines' },
            { name: 'Thomas', zone: 'Village' },
            { name: 'Léa',   zone: 'Forêt' },
        ];
        const list = document.getElementById('admin-player-list');
        if (list) {
            list.innerHTML = fakes.map(p => `
                <li class="${p.me ? 'admin-me' : ''}">
                    <span class="ap-name">${p.me ? '⚜ ' : ''}${p.name}</span>
                    <span class="ap-zone">${p.zone}</span>
                    ${!p.me
                        ? `<button onclick="window._game.adminKick('${p.name}')">✖</button>
                           <button onclick="window._game.adminTp('${p.name}')">✈</button>`
                        : ''}
                </li>`).join('');
        }
        const cnt = document.getElementById('admin-online-count');
        if (cnt) cnt.textContent = fakes.length;
    }

    adminKick(name) {
        this.chat.addMessage(null, `⚡ Admin : ${name} a été éjecté !`, true);
        this._refreshAdminPanel();
    }
    adminTp(name) {
        this.chat.addMessage(null, `✈ Admin : ${name} a été téléporté !`, true);
    }
    adminSpawnNPC() {
        if (!this.player) return;
        const npc = new NPC(
            'Bot_' + Math.floor(Math.random() * 999),
            this.player.x + 60,
            this.world.SURFACE_Y,
            { skinColor: AvatarConfig.skinColors[Math.floor(Math.random() * AvatarConfig.skinColors.length)] },
            ['Bonjour !', 'Sympa ici !', 'Super jeu !', 'Coucou !']
        );
        this.npcs.push(npc);
        this.chat.addMessage(null, '🤖 Admin : NPC spawné !', true);
        this._refreshAdminPanel();
    }
    adminToggleWeather() {
        this.chat.addMessage(null, '🌧️ Admin : Météo changée !', true);
    }
    adminTeleportAll() {
        this.chat.addMessage(null, '✈️ Admin : Tous les joueurs téléportés vers vous !', true);
    }

    updatePlayerAvatar(avatarConfig) {
        if (this.player) this.player.avatar = new Avatar(avatarConfig);
    }
}
