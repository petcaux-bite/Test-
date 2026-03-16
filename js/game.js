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
            y:             this.world.SURFACE_Y - PLAYER_FEET, // pieds = SURFACE_Y
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
                if (e.key === 'm' || e.key === 'M') {
                    this.showWorldMap = !this.showWorldMap;
                }
                if (e.key === 'Escape') {
                    this.showWorldMap   = false;
                    this.teleportMode   = false;
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

        this.chat.drawBubbles(ctx, this.camera);
        if (this.weather === 'rain' && this.currentMap === 'main') this._drawRain(ctx);
        this._drawDepthOverlay(ctx, canvas);
        this._drawZoneIndicator(ctx);
        this._drawJumpIndicator(ctx);
        this._drawTeleportOverlay(ctx, canvas);
        this._drawControls(ctx);
        if (this.showWorldMap) this._drawWorldMap(ctx, canvas);
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
            '← →/Q D : Déplacer  |  Espace/↑/Z : Sauter (×2)  |  Entrée : Chat  |  M : Carte  |  Clic : Aller',
            10, this.canvas.height - 10
        );
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
        const npc = new NPC(
            'Bot_' + Math.floor(Math.random() * 999),
            this.player.x + 60,
            this.world.SURFACE_Y - PLAYER_FEET,
            { skinColor: AvatarConfig.skinColors[Math.floor(Math.random() * AvatarConfig.skinColors.length)] },
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

    updatePlayerAvatar(avatarConfig) {
        if (this.player) this.player.avatar = new Avatar(avatarConfig);
    }
}
