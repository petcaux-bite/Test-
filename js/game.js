// ===== Moteur de Jeu Principal =====

const GRAVITY        = 0.55;
const JUMP_FORCE     = -13.5;
const MAX_FALL       = 18;
const PLAYER_HALF_W  = 12;
const PLAYER_FEET    = 0;   // ancre = pieds (y=0 du dessin Avatar = sol)

class Game {
    constructor(canvas) {
        this.canvas  = canvas;
        this.ctx     = canvas.getContext('2d');
        this.resize();

        this.world      = new World(4000, 1400);
        this.adminWorld = new AdminWorld();
        this.currentMap = 'main'; // 'main' | 'admin'
        this.chat       = new ChatSystem();
        this.player     = null;
        this.npcs       = createNPCs(this.world.SURFACE_Y);

        this.camera  = { x: 0, y: 0 };
        this.keys    = {};
        this.mouseTarget    = null;
        this.lastTime       = 0;
        this.running        = false;
        this.isAdmin        = false;
        this.adminPanelOpen = false;
        this.teleportMode   = false;
        this.weather        = 'clear';
        this.rainParticles  = [];
        this._kickedPlayers = new Set();
        this.showWorldMap   = false;

        this.collectibles    = [];
        this.showShop        = false;
        this.showInventory   = false;
        this.shopTab         = 'skins';   // 'skins' | 'potions'
        this._shopHitboxes   = [];

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
            name:           playerName,
            x:              200,
            y:              this.world.SURFACE_Y - PLAYER_FEET,
            velX:           0,
            velY:           0,
            onGround:       false,
            canDoubleJump:  true,
            avatar:         new Avatar(avatarConfig),
            direction:      'right',
            walkFrame:      0,
            isWalking:      false,
            speed:          3,
            coins:          0,
            inventory: {
                potions: { speed: 0, grow: 0, shrink: 0 },
                skins:   [],   // IDs des skins débloqués
            },
            potionEffect:   null,   // { type, expiresAt }
            scaleMultiplier: 1,
        };

        this._initCollectibles();

        this.chat.setPlayer(this.player);
        if (isAdmin) this.chat.setAdmin(true);
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
                if (e.key === 'm' || e.key === 'M') {
                    this.showWorldMap = !this.showWorldMap;
                }
                if (e.key === 'Escape') {
                    this.showWorldMap   = false;
                    this.teleportMode   = false;
                    this.showShop       = false;
                    this.showInventory  = false;
                }
                if (e.key === 'e' || e.key === 'E') {
                    this._tryInteract();
                }
                if (e.key === 's' || e.key === 'S') {
                    if (this.player) { this.showShop = !this.showShop; this.showInventory = false; }
                }
                if (e.key === 'i' || e.key === 'I') {
                    if (this.player) { this.showInventory = !this.showInventory; this.showShop = false; }
                }
                // Utiliser potions depuis inventaire : 1/2/3
                if (e.key === '1') this._usePotion('speed');
                if (e.key === '2') this._usePotion('grow');
                if (e.key === '3') this._usePotion('shrink');
            }
        });
        window.addEventListener('keyup', e => {
            this.keys[e.key]  = false;
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('click', e => {
            if (this.adminPanelOpen) return;
            const rect   = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left + this.camera.x;
            const clickY = e.clientY - rect.top  + this.camera.y;

            // Mode téléport admin (clic libre)
            if (this.isAdmin && this.teleportMode && this.player) {
                this.player.x    = clickX;
                this.player.y    = clickY;
                this.player.velY = 0;
                this.teleportMode = false;
                const btn = document.getElementById('btn-tp-free');
                if (btn) { btn.textContent = '✈️ Clic libre'; btn.classList.remove('tp-active'); }
                this._showNotif('✈️ Téléporté !');
                return;
            }

            this.mouseTarget = clickX;
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

    _tryInteract() {
        if (!this.player || this.currentMap !== 'main') return;
        const p = this.player;
        for (const portal of this.world.cavePortals) {
            if (Math.abs(p.x - portal.x) < 30 && Math.abs(p.y - portal.y) < 50) {
                p.x    = portal.destX;
                p.y    = portal.destY;
                p.velY = 0;
                this._showNotif(portal.dir === 'down' ? '⛏ Entrée dans la grotte !' : '↑ Retour en surface !');
                return;
            }
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

        const prevY   = p.y;
        p.y          += p.velY;

        // ---- COLLISION SURFACES ----
        const activeWorld = this.currentMap === 'admin' ? this.adminWorld : this.world;
        p.onGround = false;
        for (const surf of activeWorld.getAllSurfaces()) {
            const pL = p.x - PLAYER_HALF_W;
            const pR = p.x + PLAYER_HALF_W;
            if (pR <= surf.x + 2 || pL >= surf.x + surf.width - 2) continue;

            const prevFeet = prevY + PLAYER_FEET;
            const currFeet = p.y  + PLAYER_FEET;

            // Atterrissage sur le dessus
            if (prevFeet <= surf.y && currFeet >= surf.y) {
                p.y             = surf.y - PLAYER_FEET; // pieds exactement sur la surface
                p.velY          = 0;
                p.onGround      = true;
                p.canDoubleJump = true;
            }
            // Plafond (sols solides uniquement)
            if (surf.type === 'ground') {
                const bot     = surf.y + 30;
                const headY   = p.y - 5;
                const prevHead = prevY - 5;
                if (prevHead >= bot && headY < bot) {
                    p.y = bot + 5;
                    if (p.velY < 0) p.velY = 0;
                }
            }
        }

        // Limites monde
        p.x = Utils.clamp(p.x, 30, activeWorld.width - 30);

        // Chute → réapparition
        if (p.y > activeWorld.height + 100) {
            p.x    = this.currentMap === 'admin' ? 300 : 200;
            p.y    = activeWorld.SURFACE_Y;
            p.velY = 0;
            this.chat.addMessage(null, p.name + ' est tombé dans le vide !', true);
        }

        // Zone admin bloquée (monde principal uniquement)
        if (this.currentMap === 'main' && !this.isAdmin && this.world.isAdminZone(p.x, p.y)) {
            p.x    = this.world.adminArea.x - 40;
            p.velY = -8;
            this._showNotif('🚫 Zone Admin – Réservé aux administrateurs !');
        }

        // Portail admin → espace admin (admins seulement)
        if (this.currentMap === 'main' && this.isAdmin) {
            if (Math.abs(p.x - 2750) < 35 && Math.abs(p.y - 302) < 50) {
                this._enterAdminWorld();
            }
        }
        // Portail de retour → monde principal
        if (this.currentMap === 'admin') {
            const rp = this.adminWorld.returnPortal;
            if (Math.abs(p.x - rp.x) < 35 && Math.abs(p.y - rp.y) < 50) {
                this._exitAdminWorld();
            }
        }

        // Animations
        if (moving && p.onGround) {
            p.walkFrame++;
            p.isWalking = true;
        } else {
            p.walkFrame = 0;
            p.isWalking = false;
        }

        // Effets de potion
        if (p.potionEffect && Date.now() > p.potionEffect.expiresAt) {
            p.potionEffect    = null;
            p.scaleMultiplier = 1;
            p.speed           = 3;
        }

        // Collectibles (pièces + potions)
        if (this.currentMap === 'main') this._updateCollectibles(p);

        for (const npc of this.npcs) npc.update(dt, this.chat);
        this._updateRain();
        this.chat.update();

        // Caméra 2D smooth follow
        const midY    = p.y - 26;
        const targetX = p.x - this.canvas.width  / 2;
        const targetY = midY - this.canvas.height * 0.5;
        this.camera.x = Utils.lerp(this.camera.x, targetX, 0.1);
        this.camera.y = Utils.lerp(this.camera.y, targetY, 0.1);
        this.camera.x = Utils.clamp(this.camera.x, 0, Math.max(0, activeWorld.width  - this.canvas.width));
        this.camera.y = Utils.clamp(this.camera.y, 0, Math.max(0, activeWorld.height - this.canvas.height));
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

        const drawWorld = this.currentMap === 'admin' ? this.adminWorld : this.world;
        drawWorld.draw(ctx, this.camera);

        const entities = this.npcs.map(n => ({ type: 'npc', entity: n }));
        if (this.player) entities.push({ type: 'player', entity: this.player });
        entities.sort((a, b) => (a.entity.y + PLAYER_FEET) - (b.entity.y + PLAYER_FEET));

        for (const e of entities) {
            if (e.type === 'npc') e.entity.draw(ctx, this.camera);
            else this._drawPlayer(ctx);
        }

        if (this.currentMap === 'main') this._drawCollectibles(ctx);
        this.chat.drawBubbles(ctx, this.camera);
        if (this.weather === 'rain' && this.currentMap === 'main') this._drawRain(ctx);
        this._drawDepthOverlay(ctx, canvas);
        this._drawZoneIndicator(ctx);
        this._drawJumpIndicator(ctx);
        this._drawTeleportOverlay(ctx, canvas);
        this._drawHUD(ctx);
        this._drawControls(ctx);
        if (this.showInventory) this._drawInventory(ctx, canvas);
        if (this.showShop)      this._drawShop(ctx, canvas);
        if (this.showWorldMap)  this._drawWorldMap(ctx, canvas);
    }

    _drawPlayer(ctx) {
        const p  = this.player;
        const sx = p.x - this.camera.x;
        const sy = p.y - this.camera.y;

        p.avatar.draw(ctx, sx, sy, p.direction, p.isWalking ? p.walkFrame : 0, p.scaleMultiplier || 1);

        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        if (this.isAdmin) {
            ctx.fillStyle = '#FFD700';
            ctx.fillText('⚜ ' + p.name + ' ⚜', sx, sy - 95);
        } else {
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur  = 4;
            ctx.fillText(p.name, sx, sy - 95);
            ctx.shadowBlur = 0;
        }
    }

    _drawDepthOverlay(ctx, canvas) {
        if (!this.player || this.currentMap === 'admin') return;
        const depth = this.player.y - this.world.SURFACE_Y - 70;
        if (depth <= 0) return;
        ctx.fillStyle = `rgba(0,0,0,${Math.min(0.55, depth / 750 * 0.55)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    _drawZoneIndicator(ctx) {
        if (!this.player) return;
        const aw   = this.currentMap === 'admin' ? this.adminWorld : this.world;
        const zone = aw.getZoneAt(this.player.x, this.player.y);
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
        ctx.fillText('✦', sx, sy - 100);
    }

    _drawTeleportOverlay(ctx, canvas) {
        if (!this.teleportMode) return;
        ctx.fillStyle = 'rgba(74, 144, 217, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(74, 144, 217, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        ctx.setLineDash([]);
        ctx.fillStyle = '#4a90d9';
        ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('✈️ Mode Téléport – Clique n\'importe où !', canvas.width / 2, 55);
    }

    _drawControls(ctx) {
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(
            '← →/Q D : Déplacer  |  Espace/↑/Z : Sauter (×2)  |  E : Interagir  |  Entrée : Chat  |  M : Carte  |  Clic : Aller',
            10, this.canvas.height - 10
        );

        // Indice de portail proche
        if (this.player && this.currentMap === 'main') {
            const p = this.player;
            for (const portal of this.world.cavePortals) {
                if (Math.abs(p.x - portal.x) < 40 && Math.abs(p.y - portal.y) < 60) {
                    const hint = portal.dir === 'down' ? '⛏ [E] Entrer dans la grotte' : '↑ [E] Retourner en surface';
                    ctx.fillStyle = 'rgba(255,220,80,0.95)';
                    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 6;
                    ctx.fillText(hint, this.canvas.width / 2, this.canvas.height / 2 + 80);
                    ctx.shadowBlur = 0;
                    break;
                }
            }
        }
    }

    // ------------------------------------------------------------------
    // ADMIN PANEL
    // ------------------------------------------------------------------
    toggleAdminPanel() {
        if (!this.isAdmin) return;
        this.teleportMode   = false;
        this.adminPanelOpen = !this.adminPanelOpen;
        const panel = document.getElementById('admin-panel');
        if (!panel) return;
        panel.classList.toggle('hidden', !this.adminPanelOpen);
        if (this.adminPanelOpen) this._refreshAdminPanel();
    }

    _refreshAdminPanel() {
        const aw   = this.currentMap === 'admin' ? this.adminWorld : this.world;
        const zone = this.player ? aw.getZoneAt(this.player.x, this.player.y) : null;
        const el = document.getElementById('admin-current-zone');
        if (el) el.textContent = zone?.name || 'Inconnue';

        const fakes = [
            { name: this.player?.name || 'Admin', zone: zone?.name || 'Surface', me: true },
            { name: 'Maya',   zone: 'Plaines',  x: 750  },
            { name: 'Thomas', zone: 'Village',  x: 130  },
            { name: 'Léa',   zone: 'Forêt',    x: 1200 },
        ].filter(p => p.me || !this._kickedPlayers.has(p.name));
        const list = document.getElementById('admin-player-list');
        if (list) {
            list.innerHTML = fakes.map(p => `
                <li class="${p.me ? 'admin-me' : ''}">
                    <span class="ap-name">${p.me ? '⚜ ' : ''}${p.name}</span>
                    <span class="ap-zone">${p.zone}</span>
                    ${!p.me
                        ? `<button onclick="window._game.adminKick('${p.name}')">✖</button>
                           <button title="Téléporter à moi" onclick="window._game.adminTpToMe('${p.name}')">⬅️</button>
                           <button title="Téléporter vers lui" onclick="window._game.adminTpToPlayer(${p.x || 200})">➡️</button>`
                        : ''}
                </li>`).join('');
        }
        const cnt = document.getElementById('admin-online-count');
        if (cnt) cnt.textContent = fakes.length;
    }

    // Téléporter le joueur admin vers une zone prédéfinie
    tpTo(x, name) {
        if (!this.player || !this.isAdmin) return;
        this.player.x    = x;
        this.player.y    = this.world.SURFACE_Y - PLAYER_FEET;
        this.player.velY = 0;
        this._showNotif(`✈️ Téléporté → ${name} !`);
        this.adminPanelOpen = false;
        document.getElementById('admin-panel')?.classList.add('hidden');
    }

    // Active le mode téléport libre (clic sur la map)
    toggleTeleportMode() {
        if (!this.isAdmin) return;
        this.teleportMode = !this.teleportMode;
        const btn = document.getElementById('btn-tp-free');
        if (btn) {
            btn.textContent = this.teleportMode ? '🎯 Clique sur la map...' : '✈️ Clic libre';
            btn.classList.toggle('tp-active', this.teleportMode);
        }
        if (this.teleportMode) {
            this.adminPanelOpen = false;
            document.getElementById('admin-panel')?.classList.add('hidden');
            this._showNotif('✈️ Mode Téléport – Clique n\'importe où !');
        }
    }

    // Téléporter un joueur simulé vers le joueur admin
    adminTpToMe(name) {
        this.chat.addMessage(null, `✈ Admin : ${name} a été téléporté vers vous !`, true);
        this._showNotif(`✈️ ${name} téléporté ici !`);
        this._refreshAdminPanel();
    }

    // Téléporter le joueur admin vers un NPC/joueur simulé
    adminTpToPlayer(x) {
        if (!this.player) return;
        this.player.x    = x;
        this.player.y    = this.world.SURFACE_Y - PLAYER_FEET;
        this.player.velY = 0;
        this._showNotif('✈️ Téléporté vers le joueur !');
        this.adminPanelOpen = false;
        document.getElementById('admin-panel')?.classList.add('hidden');
    }

    adminKick(name) {
        this._kickedPlayers.add(name);
        this.chat.addMessage(null, `⚡ ${name} a été banni du monde !`, true);
        this._showNotif(`⚡ ${name} banni !`);
        this._refreshAdminPanel();
    }

    adminSpawnNPC() {
        if (!this.player) return;
        const colors = AvatarConfig.bodyColors;
        const npc = new NPC(
            'Bot_' + Math.floor(Math.random() * 999),
            this.player.x + 60,
            this.world.SURFACE_Y - PLAYER_FEET,
            { bodyColor: colors[Math.floor(Math.random() * colors.length)] },
            ['Bonjour !', 'Sympa ici !', 'Super jeu !', 'Coucou !', 'Waouh !']
        );
        this.npcs.push(npc);
        this.chat.addMessage(null, '🤖 Admin : NPC spawné !', true);
        this._refreshAdminPanel();
    }

    adminToggleWeather() {
        this.weather = this.weather === 'rain' ? 'clear' : 'rain';
        if (this.weather === 'rain') {
            this.rainParticles = [];
            for (let i = 0; i < 220; i++) {
                this.rainParticles.push({
                    x:     this.camera.x + Math.random() * this.canvas.width,
                    y:     this.camera.y + Math.random() * this.canvas.height,
                    speed: 8 + Math.random() * 5,
                    len:   14 + Math.random() * 10,
                    alpha: 0.3 + Math.random() * 0.4,
                });
            }
        } else {
            this.rainParticles = [];
        }
        const label = this.weather === 'rain' ? '🌧️ Pluie' : '☀️ Soleil';
        this.chat.addMessage(null, `Admin : Météo → ${label} !`, true);
        this._showNotif(`${label} !`);
    }

    _updateRain() {
        if (this.weather !== 'rain') return;
        for (const r of this.rainParticles) {
            r.y += r.speed;
            r.x -= r.speed * 0.18;
            if (r.y > this.camera.y + this.canvas.height + 20) {
                r.y = this.camera.y - 10;
                r.x = this.camera.x + Math.random() * this.canvas.width;
            }
        }
    }

    _drawRain(ctx) {
        for (const r of this.rainParticles) {
            const sx = r.x - this.camera.x;
            const sy = r.y - this.camera.y;
            ctx.strokeStyle = `rgba(180,215,255,${r.alpha})`;
            ctx.lineWidth   = 1.2;
            ctx.beginPath();
            ctx.moveTo(sx,                      sy);
            ctx.lineTo(sx - r.len * 0.18, sy + r.len);
            ctx.stroke();
        }
        // Légère teinte bleue sur l'écran
        ctx.fillStyle = 'rgba(100,150,220,0.07)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    adminTeleportAll() {
        this.chat.addMessage(null, '✈️ Admin : Tous les joueurs téléportés vers vous !', true);
    }

    // ── Admin world switching ─────────────────────────────────────
    _enterAdminWorld() {
        this.currentMap = 'admin';
        this.player.x   = 300;
        this.player.y   = this.adminWorld.SURFACE_Y;
        this.player.velY = 0;
        this.camera.x   = 0;
        this.camera.y   = 0;
        this._showNotif('⚜ Bienvenue dans l\'Espace Admin !');
        this.chat.addMessage(null, '⚜ Admin a rejoint l\'Espace Secret !', true);
    }

    _exitAdminWorld() {
        this.currentMap = 'main';
        this.player.x   = 2750;
        this.player.y   = this.world.SURFACE_Y;
        this.player.velY = 0;
        this._showNotif('↩ Retour au monde principal !');
    }

    // ── Carte du Monde ────────────────────────────────────────────
    _drawWorldMap(ctx, canvas) {
        // Fond semi-transparent
        ctx.fillStyle = 'rgba(5, 15, 35, 0.92)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Titre
        ctx.fillStyle = '#FFEB3B';
        ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('🗺️ Carte du Monde – BlabWorld', canvas.width / 2, 44);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '13px sans-serif';
        ctx.fillText('[M] pour fermer', canvas.width / 2, 66);

        const zones = [
            // Rangée principale (monde extérieur)
            { name: '🏘️ Village',          color: '#66BB6A', x:  80, y: 120, w: 130, h: 80, zone: 'main', wx: 200 },
            { name: '🌿 Plaines',           color: '#4CAF50', x: 230, y: 120, w: 130, h: 80, zone: 'main', wx: 750 },
            { name: '🌳 Forêt',             color: '#2E7D32', x: 380, y: 120, w: 150, h: 80, zone: 'main', wx: 1200 },
            { name: '🏜️ Désert',            color: '#FDD835', x: 550, y: 120, w: 120, h: 80, zone: 'main', wx: 2300 },
            // Grottes (sous le village)
            { name: '⛏ Grottes',           color: '#78909C', x: 130, y: 230, w: 140, h: 70, zone: 'main', wx: 700 },
            { name: '🔥 Grottes Profondes', color: '#EF5350', x: 130, y: 325, w: 170, h: 70, zone: 'main', wx: 900 },
            // Zone Admin (monde principal)
            { name: '🛡 Forteresse Admin',  color: '#CE93D8', x: 690, y: 120, w: 160, h: 80, zone: 'main', wx: 2600, adminOnly: true },
            // Espace Admin (second monde)
            { name: '⚜ Espace Admin',      color: '#9C27B0', x: 690, y: 230, w: 160, h: 80, zone: 'admin', wx: 300, adminOnly: true },
        ];

        for (const z of zones) {
            if (z.adminOnly && !this.isAdmin) continue;
            // Box shadow
            ctx.shadowColor   = z.color + '88';
            ctx.shadowBlur    = 10;
            // Fond de la zone
            const isCurrent = this.currentMap === z.zone &&
                this.player && Math.abs(
                    (this.currentMap === 'main' ? this.world : this.adminWorld)
                        .getZoneAt(this.player.x, this.player.y)?.name?.includes(z.name.replace(/^.*? /, ''))
                );
            ctx.fillStyle = isCurrent ? z.color : z.color + '55';
            ctx.beginPath(); ctx.roundRect(z.x, z.y, z.w, z.h, 10); ctx.fill();
            ctx.strokeStyle = z.color; ctx.lineWidth = isCurrent ? 3 : 1.5;
            ctx.beginPath(); ctx.roundRect(z.x, z.y, z.w, z.h, 10); ctx.stroke();
            ctx.shadowBlur = 0;

            // Nom
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(z.name, z.x + z.w / 2, z.y + z.h / 2 + 5);

            // Clic pour téléporter (admin)
            if (this.isAdmin) {
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.font = '10px sans-serif';
                ctx.fillText('Clic → Téléporter', z.x + z.w / 2, z.y + z.h - 12);
            }
        }

        // Position du joueur actuelle
        if (this.player) {
            const curZone = (this.currentMap === 'main' ? this.world : this.adminWorld)
                .getZoneAt(this.player.x, this.player.y);
            ctx.fillStyle = '#FFEB3B';
            ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(`Tu es ici : ${curZone?.name || 'Inconnu'}`, canvas.width / 2, canvas.height - 30);
        }

        // Interactivité : clic sur une zone pour aller dedans
        if (!this._mapClickHandlerSet) {
            this._mapClickHandlerSet = true;
            canvas.addEventListener('click', e => {
                if (!this.showWorldMap) return;
                const rect = canvas.getBoundingClientRect();
                const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
                const zonesDef = [
                    { x:  80, y: 120, w: 130, h: 80, wx: 200,  zone: 'main' },
                    { x: 230, y: 120, w: 130, h: 80, wx: 750,  zone: 'main' },
                    { x: 380, y: 120, w: 150, h: 80, wx: 1200, zone: 'main' },
                    { x: 550, y: 120, w: 120, h: 80, wx: 2300, zone: 'main' },
                    { x: 130, y: 230, w: 140, h: 70, wx: 700,  zone: 'main' },
                    { x: 130, y: 325, w: 170, h: 70, wx: 900,  zone: 'main' },
                    { x: 690, y: 120, w: 160, h: 80, wx: 2600, zone: 'main',  adminOnly: true },
                    { x: 690, y: 230, w: 160, h: 80, wx: 300,  zone: 'admin', adminOnly: true },
                ];
                for (const z of zonesDef) {
                    if (z.adminOnly && !this.isAdmin) continue;
                    if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
                        if (this.isAdmin) {
                            if (z.zone === 'admin' && this.currentMap !== 'admin') {
                                this._enterAdminWorld();
                            } else if (z.zone === 'main') {
                                if (this.currentMap === 'admin') this._exitAdminWorld();
                                this.player.x = z.wx;
                                this.player.y = this.world.SURFACE_Y;
                                this.player.velY = 0;
                            }
                            this._showNotif('✈️ Téléporté !');
                        }
                        this.showWorldMap = false;
                        break;
                    }
                }
                // Clic hors zones = fermer
                this.showWorldMap = false;
            });
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // COLLECTIBLES (pièces + potions)
    // ══════════════════════════════════════════════════════════════════
    _initCollectibles() {
        this.collectibles = [];
        // Seules les pièces apparaissent sur la map — les potions s'achètent en boutique
        for (const sp of this.world.getCoinSpawns()) {
            this.collectibles.push({
                type: 'coin', x: sp.x, y: sp.y,
                collected: false, respawnAt: null,
                bobOffset: Math.random() * Math.PI * 2,
            });
        }
    }

    _updateCollectibles(p) {
        const now = Date.now();
        for (const c of this.collectibles) {
            if (c.collected && c.respawnAt && now > c.respawnAt) {
                c.collected = false; c.respawnAt = null;
            }
            if (c.collected) continue;
            if (Math.abs(p.x - c.x) < 20 && Math.abs(p.y - c.y) < 28) {
                c.collected = true;
                p.coins++;
                c.respawnAt = now + 30000;
            }
        }
    }

    // Ramassage → inventaire
    _applyPotion(type) {
        const p = this.player;
        p.inventory.potions[type]++;
        const labels = { speed: '⚡ Potion Vitesse', grow: '🔵 Potion Géant', shrink: '🟣 Potion Petit' };
        this._showNotif(`${labels[type]} ajoutée à l'inventaire ! [1/2/3]`);
    }

    // Utilisation depuis inventaire
    _usePotion(type) {
        if (!this.player) return;
        const p = this.player;
        if ((p.inventory.potions[type] || 0) <= 0) {
            if (!this.chat.isChatFocused())
                this._showNotif('❌ Aucune potion de ce type dans l\'inventaire !');
            return;
        }
        p.inventory.potions[type]--;
        p.potionEffect = { type, expiresAt: Date.now() + 10000 };
        if (type === 'speed') {
            p.speed = 6;
            this._showNotif('⚡ Vitesse × 2 ! (10s)');
        } else if (type === 'grow') {
            p.scaleMultiplier = 1.7;
            this._showNotif('🔵 Taille × 2 ! (10s)');
        } else if (type === 'shrink') {
            p.scaleMultiplier = 0.55;
            this._showNotif('🟣 Taille réduite ! (10s)');
        }
    }

    _drawCollectibles(ctx) {
        const t = Date.now() * 0.003;
        for (const c of this.collectibles) {
            if (c.collected) continue;
            const sx = c.x - this.camera.x;
            const sy = c.y - this.camera.y;
            if (sx < -30 || sx > this.canvas.width + 30) continue;
            if (sy < -30 || sy > this.canvas.height + 30) continue;

            const bob = Math.sin(t + c.bobOffset) * 4; // flottement

            if (c.type === 'coin') {
                this._drawCoin(ctx, sx, sy - 10 + bob);
            } else if (c.type === 'potion') {
                this._drawPotion(ctx, sx, sy - 12 + bob, c.subtype);
            }
        }
    }

    _drawCoin(ctx, x, y) {
        // Pièce dorée style screenshot (disque simple avec reflet)
        const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 10);
        g.addColorStop(0,   '#FFE566');
        g.addColorStop(0.55, '#FFC107');
        g.addColorStop(1,   '#F57F17');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
        // Contour
        ctx.strokeStyle = '#E65100'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
        // Éclat lumineux haut-gauche
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.ellipse(x - 3, y - 3.5, 4, 2.5, -0.6, 0, Math.PI * 2); ctx.fill();
    }

    _drawPotion(ctx, x, y, subtype) {
        const colors = {
            speed:  { body: '#EF5350', shine: '#FF8A80', label: '⚡' },
            grow:   { body: '#42A5F5', shine: '#90CAF9', label: '↑↑' },
            shrink: { body: '#7E57C2', shine: '#B39DDB', label: '↓↓' },
        };
        const c = colors[subtype] || colors.speed;

        // Bouchon
        ctx.fillStyle = '#795548';
        ctx.fillRect(x - 4, y - 18, 8, 5);
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - 3, y - 20, 6, 4);

        // Corps bouteille
        const g = ctx.createLinearGradient(x - 8, y, x + 8, y);
        g.addColorStop(0, c.shine);
        g.addColorStop(0.5, c.body);
        g.addColorStop(1, c.body);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 14);
        ctx.bezierCurveTo(x - 9, y - 8, x - 9, y + 4, x - 7, y + 12);
        ctx.lineTo(x + 7, y + 12);
        ctx.bezierCurveTo(x + 9, y + 4, x + 9, y - 8, x + 5, y - 14);
        ctx.closePath();
        ctx.fill();

        // Reflet
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(x - 3, y - 4, 3, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(c.label, x, y + 5);
    }

    // ══════════════════════════════════════════════════════════════════
    // HUD (pièces + effets actifs)
    // ══════════════════════════════════════════════════════════════════
    _drawHUD(ctx) {
        if (!this.player) return;
        const p = this.player;

        // Compteur de pièces (haut-gauche)
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.roundRect(10, 10, 110, 34, 8); ctx.fill();

        this._drawCoin(ctx, 30, 27);
        ctx.fillStyle = '#FFD740';
        ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(`${p.coins} Blab$`, 46, 32);

        // Effet de potion actif
        if (p.potionEffect) {
            const remaining = Math.max(0, Math.ceil((p.potionEffect.expiresAt - Date.now()) / 1000));
            const icons = { speed: '⚡', grow: '🔵', shrink: '🔵' };
            const labels = { speed: 'Vitesse', grow: 'Géant', shrink: 'Petit' };
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.roundRect(10, 50, 120, 26, 8); ctx.fill();
            ctx.fillStyle = '#FFE082';
            ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText(`${icons[p.potionEffect.type]} ${labels[p.potionEffect.type]} ${remaining}s`, 16, 67);
        }

        // Potions en inventaire (raccourcis 1/2/3)
        const inv = p.inventory.potions;
        const py2 = p.potionEffect ? 84 : 52;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.roundRect(10, py2, 200, 26, 8); ctx.fill();
        ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
        ctx.fillStyle = inv.speed  > 0 ? '#FF7043' : 'rgba(255,255,255,0.35)';
        ctx.fillText(`⚡[1]×${inv.speed}`, 16, py2 + 17);
        ctx.fillStyle = inv.grow   > 0 ? '#42A5F5' : 'rgba(255,255,255,0.35)';
        ctx.fillText(`🔵[2]×${inv.grow}`,  80, py2 + 17);
        ctx.fillStyle = inv.shrink > 0 ? '#AB47BC' : 'rgba(255,255,255,0.35)';
        ctx.fillText(`🟣[3]×${inv.shrink}`, 144, py2 + 17);

        // Boutons boutique + inventaire
        const py3 = py2 + 32;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.roundRect(10, py3, 100, 26, 8); ctx.fill();
        ctx.fillStyle = '#FFCC02'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('🛒 [S] Boutique', 16, py3 + 17);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.roundRect(116, py3, 94, 26, 8); ctx.fill();
        ctx.fillStyle = '#80DEEA';
        ctx.fillText('🎒 [I] Inventaire', 122, py3 + 17);
    }

    // ══════════════════════════════════════════════════════════════════
    // BOUTIQUE (onglets Skins / Potions)
    // ══════════════════════════════════════════════════════════════════
    _drawShop(ctx, canvas) {
        const p = this.player;
        const cw = canvas.width, ch = canvas.height;
        this._shopHitboxes = [];

        // Fond
        ctx.fillStyle = 'rgba(5,10,30,0.95)';
        ctx.fillRect(0, 0, cw, ch);

        // Titre + solde
        ctx.fillStyle = '#FFCC02';
        ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('🛒 Boutique BlabWorld', cw / 2, 44);
        ctx.fillStyle = 'rgba(255,204,2,0.7)'; ctx.font = '13px sans-serif';
        ctx.fillText(`💰 ${p.coins} Blab$   •   [S] Fermer   •   [I] Inventaire`, cw / 2, 66);

        // Onglets
        const tabs = [{ id: 'skins', label: '👗 Skins' }, { id: 'potions', label: '🧪 Potions' }];
        const tabW = 140, tabH = 36, tabY = 80, tabGap = 8;
        const tabTotalW = tabs.length * tabW + (tabs.length - 1) * tabGap;
        const tabStartX = (cw - tabTotalW) / 2;

        for (let ti = 0; ti < tabs.length; ti++) {
            const tx = tabStartX + ti * (tabW + tabGap);
            const active = this.shopTab === tabs[ti].id;
            ctx.fillStyle = active ? '#FFCC02' : 'rgba(80,80,120,0.7)';
            ctx.beginPath(); ctx.roundRect(tx, tabY, tabW, tabH, [8, 8, 0, 0]); ctx.fill();
            ctx.fillStyle = active ? '#111' : '#ccc';
            ctx.font = `bold 14px sans-serif`; ctx.textAlign = 'center';
            ctx.fillText(tabs[ti].label, tx + tabW / 2, tabY + 24);
            this._shopHitboxes.push({ type: 'tab', value: tabs[ti].id, x: tx, y: tabY, w: tabW, h: tabH });
        }

        const contentY = tabY + tabH + 10;
        if (this.shopTab === 'skins') this._drawShopSkins(ctx, p, cw, contentY);
        else                          this._drawShopPotions(ctx, p, cw, contentY);

        // Fermer au clic hors contenu
        if (!this._shopClickHandlerSet) {
            this._shopClickHandlerSet = true;
            canvas.addEventListener('click', e => {
                if (!this.showShop || !this.player) return;
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left, my = e.clientY - rect.top;
                for (const hb of this._shopHitboxes) {
                    if (mx < hb.x || mx > hb.x + hb.w || my < hb.y || my > hb.y + hb.h) continue;
                    this._handleShopHit(hb);
                    e.stopPropagation(); return;
                }
            });
        }
    }

    _drawShopSkins(ctx, p, cw, startY) {
        const skins = AvatarConfig.rareSkins;
        const cols  = Math.min(3, skins.length);
        const cardW = 160, cardH = 200, gap = 16;
        const totalW = cols * cardW + (cols - 1) * gap;
        const ox     = (cw - totalW) / 2;

        for (let i = 0; i < skins.length; i++) {
            const sk   = skins[i];
            const col  = i % cols, row = Math.floor(i / cols);
            const cx   = ox + col * (cardW + gap);
            const cy   = startY + row * (cardH + gap);
            const owned = p.inventory.skins.includes(sk.id);

            // Fond carte
            ctx.fillStyle = owned ? 'rgba(40,130,40,0.4)' : 'rgba(20,20,60,0.85)';
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 12); ctx.fill();
            ctx.strokeStyle = owned ? '#4CAF50' : '#FFCC02'; ctx.lineWidth = owned ? 2 : 1.5;
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 12); ctx.stroke();

            // Aperçu blob
            const av = new Avatar({ bodyColor: sk.color, accessory: sk.accessory, expression: sk.expression, eyeColor: '#1565C0' });
            ctx.save();
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, 118, [12, 12, 0, 0]); ctx.clip();
            const pg = ctx.createLinearGradient(cx, cy, cx, cy + 118);
            pg.addColorStop(0, '#87CEEB'); pg.addColorStop(1, '#5DBE3A');
            ctx.fillStyle = pg; ctx.fillRect(cx, cy, cardW, 118);
            ctx.fillStyle = '#5DBE3A'; ctx.fillRect(cx, cy + 92, cardW, 30);
            av.draw(ctx, cx + cardW / 2, cy + 108, 'right', 0);
            ctx.restore();

            // Nom
            ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(sk.label, cx + cardW / 2, cy + 135);

            // Bouton achat / équiper
            const btnY = cy + 148, btnH = 22, btnX = cx + 12, btnW = cardW - 24;
            if (owned) {
                ctx.fillStyle = '#4CAF50'; ctx.font = 'bold 11px sans-serif';
                ctx.fillText('✔ Débloqué', cx + cardW / 2, cy + 148);
                ctx.fillStyle = '#388E3C';
                ctx.beginPath(); ctx.roundRect(btnX, cy + 158, btnW, btnH, 6); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
                ctx.fillText('Équiper', cx + cardW / 2, cy + 173);
                this._shopHitboxes.push({ type: 'equip-skin', sk, x: btnX, y: cy + 158, w: btnW, h: btnH });
            } else {
                ctx.fillStyle = p.coins >= sk.price ? '#FFD740' : '#EF5350';
                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(`💰 ${sk.price} Blab$`, cx + cardW / 2, cy + 148);
                const canBuy = p.coins >= sk.price;
                ctx.fillStyle = canBuy ? '#FF9800' : 'rgba(80,80,80,0.7)';
                ctx.beginPath(); ctx.roundRect(btnX, cy + 158, btnW, btnH, 6); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
                ctx.fillText(canBuy ? 'Acheter' : '❌ Insuffisant', cx + cardW / 2, cy + 173);
                if (canBuy) this._shopHitboxes.push({ type: 'buy-skin', sk, x: btnX, y: cy + 158, w: btnW, h: btnH });
            }
        }
    }

    _drawShopPotions(ctx, p, cw, startY) {
        const potionDefs = [
            { type: 'speed',  label: '⚡ Potion Vitesse',  desc: 'Vitesse × 2 pendant 10s', price: 25, color: '#EF5350', dark: '#B71C1C' },
            { type: 'grow',   label: '🔵 Potion Géant',    desc: 'Taille × 2 pendant 10s',  price: 30, color: '#42A5F5', dark: '#1565C0' },
            { type: 'shrink', label: '🟣 Potion Petit',    desc: 'Taille ÷ 2 pendant 10s',  price: 30, color: '#AB47BC', dark: '#6A1B9A' },
        ];
        const cardW = 220, cardH = 130, gap = 20;
        const totalH = potionDefs.length * (cardH + gap) - gap;
        const ox = (cw - cardW) / 2;
        const oy = startY + 10;

        for (let i = 0; i < potionDefs.length; i++) {
            const pd = potionDefs[i];
            const cx = ox, cy = oy + i * (cardH + gap);
            const stock = p.inventory.potions[pd.type] || 0;

            // Carte
            const bg = ctx.createLinearGradient(cx, cy, cx + cardW, cy);
            bg.addColorStop(0, pd.dark + 'cc'); bg.addColorStop(1, 'rgba(20,20,50,0.9)');
            ctx.fillStyle = bg;
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 12); ctx.fill();
            ctx.strokeStyle = pd.color; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 12); ctx.stroke();

            // Icône potion
            this._drawPotion(ctx, cx + 36, cy + cardH / 2, pd.type);

            // Texte
            ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
            ctx.font = 'bold 15px sans-serif'; ctx.fillText(pd.label, cx + 70, cy + 32);
            ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '12px sans-serif'; ctx.fillText(pd.desc, cx + 70, cy + 52);
            ctx.fillStyle = '#FFD740'; ctx.font = 'bold 13px sans-serif'; ctx.fillText(`💰 ${pd.price} Blab$`, cx + 70, cy + 72);
            ctx.fillStyle = stock > 0 ? '#80DEEA' : 'rgba(255,255,255,0.4)';
            ctx.fillText(`En stock : ${stock}`, cx + 70, cy + 90);

            // Boutons
            const canBuy = p.coins >= pd.price;
            const buyX = cx + cardW - 110, buyW = 96, btnH = 24, btnY = cy + cardH - 34;

            ctx.fillStyle = canBuy ? '#FF9800' : 'rgba(80,80,80,0.7)';
            ctx.beginPath(); ctx.roundRect(buyX, btnY, buyW, btnH, 6); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(canBuy ? 'Acheter' : '❌ Insuffisant', buyX + buyW / 2, btnY + 16);
            if (canBuy) this._shopHitboxes.push({ type: 'buy-potion', subtype: pd.type, x: buyX, y: btnY, w: buyW, h: btnH });

            const useX = buyX - 106, useW = 90;
            ctx.fillStyle = stock > 0 ? '#4CAF50' : 'rgba(80,80,80,0.6)';
            ctx.beginPath(); ctx.roundRect(useX, btnY, useW, btnH, 6); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
            ctx.fillText('Utiliser [' + (i + 1) + ']', useX + useW / 2, btnY + 16);
            if (stock > 0) this._shopHitboxes.push({ type: 'use-potion', subtype: pd.type, x: useX, y: btnY, w: useW, h: btnH });
        }
    }

    _handleShopHit(hb) {
        const p = this.player;
        switch (hb.type) {
            case 'tab':
                this.shopTab = hb.value;
                break;
            case 'buy-skin':
                if (p.coins >= hb.sk.price) {
                    p.coins -= hb.sk.price;
                    p.inventory.skins.push(hb.sk.id);
                    this._showNotif(`🎉 Skin "${hb.sk.label}" acheté !`);
                }
                break;
            case 'equip-skin':
                p.avatar = new Avatar({ bodyColor: hb.sk.color, accessory: hb.sk.accessory, expression: hb.sk.expression, eyeColor: p.avatar.eyeColor });
                this._showNotif(`✔ Skin "${hb.sk.label}" équipé !`);
                break;
            case 'buy-potion':
                if (p.coins >= this._potionPrice(hb.subtype)) {
                    p.coins -= this._potionPrice(hb.subtype);
                    p.inventory.potions[hb.subtype]++;
                    this._showNotif(`🧪 Potion achetée ! Stock : ${p.inventory.potions[hb.subtype]}`);
                }
                break;
            case 'use-potion':
                this._usePotion(hb.subtype);
                break;
        }
    }

    _potionPrice(type) { return type === 'speed' ? 25 : 30; }

    // ══════════════════════════════════════════════════════════════════
    // INVENTAIRE avec onglets Potions / Skins possédés
    // ══════════════════════════════════════════════════════════════════
    _drawInventory(ctx, canvas) {
        const p  = this.player;
        const cw = canvas.width, ch = canvas.height;
        const pw = 420, ph = 360;
        const px = (cw - pw) / 2, py = (ch - ph) / 2;

        if (!this.invTab) this.invTab = 'potions';

        // Fond panneau
        ctx.fillStyle = 'rgba(5,10,30,0.96)';
        ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 16); ctx.fill();
        ctx.strokeStyle = '#80DEEA'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 16); ctx.stroke();

        // Titre
        ctx.fillStyle = '#80DEEA'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('🎒 Inventaire', px + pw / 2, py + 30);
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '11px sans-serif';
        ctx.fillText('[I] ou [Échap] pour fermer  •  💰 ' + p.coins + ' Blab$', px + pw / 2, py + 48);

        // Onglets
        const tabs = [{ id: 'potions', label: '🧪 Potions' }, { id: 'skins', label: '👗 Skins possédés' }];
        const tabW = 150, tabH = 32, tabY = py + 58, tabGap = 8;
        const tabTX = px + (pw - (tabs.length * tabW + (tabs.length - 1) * tabGap)) / 2;

        this._invHitboxes = this._invHitboxes || [];
        this._invHitboxes = [];
        for (let ti = 0; ti < tabs.length; ti++) {
            const tx = tabTX + ti * (tabW + tabGap);
            const active = this.invTab === tabs[ti].id;
            ctx.fillStyle = active ? '#80DEEA' : 'rgba(50,60,100,0.7)';
            ctx.beginPath(); ctx.roundRect(tx, tabY, tabW, tabH, [8, 8, 0, 0]); ctx.fill();
            ctx.fillStyle = active ? '#0a0a20' : '#ccc';
            ctx.font = `bold 13px sans-serif`; ctx.textAlign = 'center';
            ctx.fillText(tabs[ti].label, tx + tabW / 2, tabY + 21);
            this._invHitboxes.push({ type: 'tab', value: tabs[ti].id, x: tx, y: tabY, w: tabW, h: tabH });
        }

        const contentY = tabY + tabH + 10;

        if (this.invTab === 'potions') {
            this._drawInvPotions(ctx, p, px, contentY, pw);
        } else {
            this._drawInvSkins(ctx, p, px, contentY, pw);
        }

        // Gestion clics (une seule fois)
        if (!this._invClickHandlerSet) {
            this._invClickHandlerSet = true;
            canvas.addEventListener('click', e => {
                if (!this.showInventory || !this.player) return;
                const rect = canvas.getBoundingClientRect();
                const mx = e.clientX - rect.left, my = e.clientY - rect.top;
                if (!this._invHitboxes) return;
                for (const hb of this._invHitboxes) {
                    if (mx < hb.x || mx > hb.x + hb.w || my < hb.y || my > hb.y + hb.h) continue;
                    if (hb.type === 'tab') { this.invTab = hb.value; }
                    else if (hb.type === 'use-potion') { this._usePotion(hb.subtype); }
                    else if (hb.type === 'equip-skin') {
                        const p = this.player;
                        p.avatar = new Avatar({ bodyColor: hb.sk.color, accessory: hb.sk.accessory, expression: hb.sk.expression, eyeColor: p.avatar.eyeColor });
                        this._showNotif(`✔ Skin "${hb.sk.label}" équipé !`);
                    }
                    e.stopPropagation(); return;
                }
            });
        }
    }

    _drawInvPotions(ctx, p, px, startY, pw) {
        const potionDefs = [
            { type: 'speed',  label: '⚡ Vitesse',  desc: 'Vitesse × 2 (10s)',  color: '#EF5350', key: 'Touche [1]' },
            { type: 'grow',   label: '🔵 Géant',    desc: 'Taille × 2 (10s)',   color: '#42A5F5', key: 'Touche [2]' },
            { type: 'shrink', label: '🟣 Petit',    desc: 'Taille ÷ 2 (10s)',   color: '#AB47BC', key: 'Touche [3]' },
        ];
        const inv = p.inventory.potions;
        const cardW = (pw - 48) / 3, cardH = 100, gap = 8;

        potionDefs.forEach((pd, i) => {
            const cx = px + 20 + i * (cardW + gap), cy = startY;
            const stock = inv[pd.type] || 0;

            ctx.fillStyle = stock > 0 ? pd.color + '30' : 'rgba(30,30,30,0.5)';
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 10); ctx.fill();
            ctx.strokeStyle = stock > 0 ? pd.color : 'rgba(80,80,80,0.5)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 10); ctx.stroke();

            // Potion icon
            this._drawPotion(ctx, cx + 22, cy + 48, pd.type);

            ctx.textAlign = 'right';
            ctx.fillStyle = stock > 0 ? '#fff' : 'rgba(200,200,200,0.4)';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(pd.label, cx + cardW - 6, cy + 22);
            ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '10px sans-serif';
            ctx.fillText(pd.desc, cx + cardW - 6, cy + 38);
            ctx.fillStyle = stock > 0 ? '#FFD740' : 'rgba(180,180,180,0.4)';
            ctx.font = `bold ${stock > 0 ? 22 : 16}px sans-serif`;
            ctx.fillText(`× ${stock}`, cx + cardW - 8, cy + 62);
            ctx.fillStyle = 'rgba(200,200,200,0.45)'; ctx.font = '9px sans-serif';
            ctx.fillText(pd.key, cx + cardW - 8, cy + 76);

            // Bouton utiliser
            const btnX = cx + 6, btnY = cy + cardH - 24, btnW = cardW - 12, btnH = 20;
            ctx.fillStyle = stock > 0 ? pd.color : 'rgba(60,60,60,0.6)';
            ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 5); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(stock > 0 ? 'Utiliser' : 'Vide', btnX + btnW / 2, btnY + 13);
            if (stock > 0) this._invHitboxes.push({ type: 'use-potion', subtype: pd.type, x: btnX, y: btnY, w: btnW, h: btnH });
        });

        // Aide
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = 'italic 11px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Les potions s\'achètent dans la Boutique [S]', px + pw / 2, startY + 120);
    }

    _drawInvSkins(ctx, p, px, startY, pw) {
        const skins = p.inventory.skins;
        if (skins.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = 'italic 13px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('Aucun skin acheté.', px + pw / 2, startY + 40);
            ctx.fillStyle = 'rgba(255,204,2,0.6)'; ctx.font = '12px sans-serif';
            ctx.fillText('Achète des skins dans la Boutique [S] !', px + pw / 2, startY + 62);
            return;
        }

        const cardW = 88, cardH = 115, gap = 12;
        const perRow = Math.floor((pw - 24) / (cardW + gap));

        skins.forEach((sid, i) => {
            const sk = AvatarConfig.rareSkins.find(s => s.id === sid);
            if (!sk) return;
            const col = i % perRow, row = Math.floor(i / perRow);
            const cx = px + 12 + col * (cardW + gap), cy = startY + row * (cardH + gap);

            // Fond carte
            ctx.fillStyle = 'rgba(30,50,30,0.7)';
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 10); ctx.fill();
            ctx.strokeStyle = '#4CAF50'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 10); ctx.stroke();

            // Badge "Possédé"
            ctx.fillStyle = '#4CAF50'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('✔ POSSÉDÉ', cx + cardW / 2, cy + 13);

            // Aperçu blob
            const av = new Avatar({ bodyColor: sk.color, accessory: sk.accessory, expression: sk.expression, eyeColor: '#1565C0' });
            ctx.save();
            ctx.beginPath(); ctx.roundRect(cx + 4, cy + 16, cardW - 8, 68, 6); ctx.clip();
            ctx.fillStyle = '#87CEEB'; ctx.fillRect(cx + 4, cy + 16, cardW - 8, 68);
            ctx.fillStyle = '#5DBE3A'; ctx.fillRect(cx + 4, cy + 62, cardW - 8, 24);
            av.draw(ctx, cx + cardW / 2, cy + 76, 'right', 0, 0.85);
            ctx.restore();

            // Nom
            ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(sk.label, cx + cardW / 2, cy + 96);

            // Bouton équiper
            const btnX = cx + 8, btnY = cy + cardH - 22, btnW = cardW - 16, btnH = 18;
            ctx.fillStyle = '#388E3C';
            ctx.beginPath(); ctx.roundRect(btnX, btnY, btnW, btnH, 4); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif';
            ctx.fillText('Équiper', cx + cardW / 2, btnY + 12);
            this._invHitboxes.push({ type: 'equip-skin', sk, x: btnX, y: btnY, w: btnW, h: btnH });
        });
    }

    // Admin : donner des pièces à un joueur (simulé)
    adminGiveCoins(amount = 50) {
        if (!this.player) return;
        this.player.coins += amount;
        this.chat.addMessage(null, `⚜ Admin a donné ${amount} Blab$ à ${this.player.name} !`, true);
        this._showNotif(`💰 +${amount} Blab$ reçus !`);
        this._refreshAdminPanel();
    }

    updatePlayerAvatar(avatarConfig) {
        if (this.player) this.player.avatar = new Avatar(avatarConfig);
    }
}
