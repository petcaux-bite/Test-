// ===== Point d'entrée =====

(function () {
    const canvas = document.getElementById('game-canvas');
    const game   = new Game(canvas);
    window._game = game; // référence globale (panels admin)

    // === Modal de connexion ===
    const nameModal  = document.getElementById('name-modal');
    const nameInput  = document.getElementById('player-name-input');
    const passInput  = document.getElementById('player-password-input');
    const btnStart   = document.getElementById('btn-start');
    const adminHint  = document.getElementById('admin-hint');

    let currentAvatarConfig = {
        bodyColor:  AvatarConfig.bodyColors[0],
        eyeColor:   AvatarConfig.eyeColors[0],
        accessory:  'aucun',
        expression: 'content',
    };

    function startGame() {
        const name     = nameInput.value.trim();
        const password = passInput ? passInput.value.trim() : '';

        if (!name) {
            nameInput.style.borderColor = '#E74C3C';
            nameInput.focus();
            return;
        }

        const isAdmin = (name.toLowerCase() === 'admin' && password === 'admin123');

        nameModal.classList.add('hidden');
        game.start(name, currentAvatarConfig, isAdmin);
    }

    btnStart.addEventListener('click', startGame);
    nameInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') startGame();
        nameInput.style.borderColor = 'rgba(255,255,255,0.2)';
    });
    if (passInput) {
        passInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') startGame();
        });
    }
    nameInput.focus();

    if (adminHint && nameInput) {
        nameInput.addEventListener('input', () => {
            adminHint.style.display = nameInput.value.toLowerCase() === 'admin' ? 'block' : 'none';
        });
    }

    // === Bouton admin panel ===
    const btnAdmin = document.getElementById('btn-admin');
    if (btnAdmin) btnAdmin.addEventListener('click', () => game.toggleAdminPanel());

    const btnCloseAdmin = document.getElementById('btn-close-admin');
    if (btnCloseAdmin) btnCloseAdmin.addEventListener('click', () => game.toggleAdminPanel());

    // === Bouton carte du monde ===
    const btnMap = document.getElementById('btn-map');
    if (btnMap) btnMap.addEventListener('click', () => { game.showWorldMap = !game.showWorldMap; });

    // === Personnalisation avatar (Blob style) ===
    const customizeModal   = document.getElementById('customize-modal');
    const btnCustomize     = document.getElementById('btn-customize');
    const btnSaveAvatar    = document.getElementById('btn-save-avatar');
    const btnCancelAvatar  = document.getElementById('btn-cancel-avatar');
    const optionsContainer = document.getElementById('customize-options');
    const previewCanvas    = document.getElementById('avatar-preview');
    const previewCtx       = previewCanvas.getContext('2d');
    const tabBtns          = document.querySelectorAll('.tab-btn');

    let editingAvatar = null;
    let currentTab    = 'blob';

    btnCustomize.addEventListener('click', () => {
        editingAvatar = game.player
            ? game.player.avatar.clone()
            : new Avatar(currentAvatarConfig);
        customizeModal.classList.remove('hidden');
        currentTab = 'blob';
        updateTabs();
        renderOptions();
        renderPreview();
    });

    btnSaveAvatar.addEventListener('click', () => {
        if (editingAvatar) {
            currentAvatarConfig = {
                bodyColor:  editingAvatar.bodyColor,
                eyeColor:   editingAvatar.eyeColor,
                accessory:  editingAvatar.accessory,
                expression: editingAvatar.expression,
            };
            game.updatePlayerAvatar(currentAvatarConfig);
        }
        customizeModal.classList.add('hidden');
    });

    btnCancelAvatar.addEventListener('click', () => customizeModal.classList.add('hidden'));

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentTab = btn.dataset.tab;
            updateTabs();
            renderOptions();
        });
    });

    function updateTabs() {
        tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === currentTab));
    }

    function renderOptions() {
        optionsContainer.innerHTML = '';
        switch (currentTab) {
            case 'blob':
                renderLabel('Couleur du blob :');
                renderColorPicker(AvatarConfig.bodyColors, editingAvatar.bodyColor, c => {
                    editingAvatar.bodyColor = c; renderPreview(); renderOptions();
                });
                break;
            case 'yeux':
                renderLabel('Couleur des yeux :');
                renderColorPicker(AvatarConfig.eyeColors, editingAvatar.eyeColor, c => {
                    editingAvatar.eyeColor = c; renderPreview(); renderOptions();
                });
                break;
            case 'expression':
                renderLabel('Expression :');
                renderStylePicker(AvatarConfig.expressions, editingAvatar.expression, s => {
                    editingAvatar.expression = s; renderPreview(); renderOptions();
                }, {
                    'content':   '😊 Content',
                    'surpris':   '😲 Surpris',
                    'endormi':   '😴 Endormi',
                    'clin_oeil': '😉 Clin d\'œil',
                });
                break;
            case 'accessory':
                renderLabel('Accessoire :');
                renderStylePicker(AvatarConfig.accessories, editingAvatar.accessory, s => {
                    editingAvatar.accessory = s; renderPreview(); renderOptions();
                }, {
                    'aucun':    '✕ Aucun',
                    'chapeau':  '🎩 Chapeau',
                    'couronne': '👑 Couronne',
                    'antenne':  '📡 Antenne',
                    'lunettes': '🕶️ Lunettes',
                    'bonnet':   '🧢 Bonnet',
                });
                break;
        }
    }

    function renderLabel(text) {
        const lbl = document.createElement('p');
        lbl.textContent = text;
        lbl.style.cssText = 'color:rgba(255,255,255,0.7);font-size:12px;margin:4px 0 6px;text-align:center;';
        optionsContainer.appendChild(lbl);
    }

    function renderColorPicker(colors, selected, onChange) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'width:100%;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;';
        colors.forEach(color => {
            const el = document.createElement('div');
            el.className = 'color-option' + (color === selected ? ' selected' : '');
            el.style.backgroundColor = color;
            el.style.border = color === '#FFFFFF' ? '2px solid rgba(255,255,255,0.5)' : '';
            el.addEventListener('click', () => onChange(color));
            wrap.appendChild(el);
        });
        optionsContainer.appendChild(wrap);
    }

    function renderStylePicker(styles, selected, onChange, labels = {}) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'width:100%;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px;';
        styles.forEach(style => {
            const btn = document.createElement('button');
            btn.className = 'style-option' + (style === selected ? ' selected' : '');
            btn.textContent = labels[style] || style;
            btn.addEventListener('click', () => onChange(style));
            wrap.appendChild(btn);
        });
        optionsContainer.appendChild(wrap);
    }

    function renderPreview() {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        // Fond
        const g = previewCtx.createLinearGradient(0, 0, 0, 200);
        g.addColorStop(0, '#87CEEB'); g.addColorStop(1, '#4CAF50');
        previewCtx.fillStyle = g;
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        // Sol
        previewCtx.fillStyle = '#5D8A20';
        previewCtx.fillRect(0, 150, 120, 50);
        if (editingAvatar) editingAvatar.draw(previewCtx, 60, 150, 'right', 0);
    }

    // === Emotes ===
    const btnEmotes = document.getElementById('btn-emotes');
    const emotes    = ['Salut !', 'Lol', 'GG', 'Wow !', 'Bravo !', 'A plus !', 'Bienvenue !', 'Merci !'];
    let emoteMenuOpen = false;

    btnEmotes.addEventListener('click', () => {
        if (emoteMenuOpen) {
            const ex = document.getElementById('emote-menu');
            if (ex) ex.remove();
            emoteMenuOpen = false;
            return;
        }
        const menu = document.createElement('div');
        menu.id = 'emote-menu';
        menu.style.cssText = `
            position:absolute;top:60px;right:12px;
            background:rgba(0,0,0,0.82);border-radius:12px;
            padding:8px;display:flex;flex-direction:column;gap:4px;z-index:100;
        `;
        emotes.forEach(emote => {
            const btn = document.createElement('button');
            btn.textContent = emote;
            btn.style.cssText = `
                padding:8px 16px;background:rgba(255,255,255,0.1);
                border:none;color:#fff;border-radius:8px;cursor:pointer;
                font-size:13px;text-align:left;
            `;
            btn.addEventListener('mouseenter', () => btn.style.background = 'rgba(74,144,217,0.4)');
            btn.addEventListener('mouseleave', () => btn.style.background = 'rgba(255,255,255,0.1)');
            btn.addEventListener('click', () => {
                if (game.player) {
                    game.chat.addMessage(game.player.name, emote);
                    game.chat.addBubble(game.player, emote);
                }
                menu.remove();
                emoteMenuOpen = false;
            });
            menu.appendChild(btn);
        });
        document.getElementById('game-container').appendChild(menu);
        emoteMenuOpen = true;
    });
})();
