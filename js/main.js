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
        skinColor:   AvatarConfig.skinColors[0],
        hairColor:   AvatarConfig.hairColors[0],
        hairStyle:   'court',
        topColor:    AvatarConfig.topColors[0],
        topStyle:    'tshirt',
        bottomColor: AvatarConfig.bottomColors[0],
        bottomStyle: 'pantalon',
        accessory:   'aucun',
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

    // Afficher indice admin quand on tape "admin"
    if (adminHint && nameInput) {
        nameInput.addEventListener('input', () => {
            if (nameInput.value.toLowerCase() === 'admin') {
                adminHint.style.display = 'block';
            } else {
                adminHint.style.display = 'none';
            }
        });
    }

    // === Bouton admin panel ===
    const btnAdmin = document.getElementById('btn-admin');
    if (btnAdmin) {
        btnAdmin.addEventListener('click', () => game.toggleAdminPanel());
    }

    // Fermer admin panel
    const btnCloseAdmin = document.getElementById('btn-close-admin');
    if (btnCloseAdmin) {
        btnCloseAdmin.addEventListener('click', () => game.toggleAdminPanel());
    }

    // === Personnalisation avatar ===
    const customizeModal  = document.getElementById('customize-modal');
    const btnCustomize    = document.getElementById('btn-customize');
    const btnSaveAvatar   = document.getElementById('btn-save-avatar');
    const btnCancelAvatar = document.getElementById('btn-cancel-avatar');
    const optionsContainer = document.getElementById('customize-options');
    const previewCanvas   = document.getElementById('avatar-preview');
    const previewCtx      = previewCanvas.getContext('2d');
    const tabBtns         = document.querySelectorAll('.tab-btn');

    let editingAvatar = null;
    let currentTab    = 'body';

    btnCustomize.addEventListener('click', () => {
        editingAvatar = game.player
            ? game.player.avatar.clone()
            : new Avatar(currentAvatarConfig);
        customizeModal.classList.remove('hidden');
        currentTab = 'body';
        updateTabs();
        renderOptions();
        renderPreview();
    });

    btnSaveAvatar.addEventListener('click', () => {
        if (editingAvatar) {
            currentAvatarConfig = {
                skinColor:   editingAvatar.skinColor,
                hairColor:   editingAvatar.hairColor,
                hairStyle:   editingAvatar.hairStyle,
                topColor:    editingAvatar.topColor,
                topStyle:    editingAvatar.topStyle,
                bottomColor: editingAvatar.bottomColor,
                bottomStyle: editingAvatar.bottomStyle,
                accessory:   editingAvatar.accessory,
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
            case 'body':
                renderColorPicker(AvatarConfig.skinColors, editingAvatar.skinColor, c => {
                    editingAvatar.skinColor = c; renderPreview(); renderOptions();
                });
                break;
            case 'hair':
                renderColorPicker(AvatarConfig.hairColors, editingAvatar.hairColor, c => {
                    editingAvatar.hairColor = c; renderPreview(); renderOptions();
                });
                renderStylePicker(AvatarConfig.hairStyles, editingAvatar.hairStyle, s => {
                    editingAvatar.hairStyle = s; renderPreview(); renderOptions();
                });
                break;
            case 'top':
                renderColorPicker(AvatarConfig.topColors, editingAvatar.topColor, c => {
                    editingAvatar.topColor = c; renderPreview(); renderOptions();
                });
                renderStylePicker(AvatarConfig.topStyles, editingAvatar.topStyle, s => {
                    editingAvatar.topStyle = s; renderPreview(); renderOptions();
                });
                break;
            case 'bottom':
                renderColorPicker(AvatarConfig.bottomColors, editingAvatar.bottomColor, c => {
                    editingAvatar.bottomColor = c; renderPreview(); renderOptions();
                });
                renderStylePicker(AvatarConfig.bottomStyles, editingAvatar.bottomStyle, s => {
                    editingAvatar.bottomStyle = s; renderPreview(); renderOptions();
                });
                break;
            case 'accessory':
                renderStylePicker(AvatarConfig.accessories, editingAvatar.accessory, s => {
                    editingAvatar.accessory = s; renderPreview(); renderOptions();
                });
                break;
        }
    }

    function renderColorPicker(colors, selected, onChange) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'width:100%;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;';
        colors.forEach(color => {
            const el = document.createElement('div');
            el.className = 'color-option' + (color === selected ? ' selected' : '');
            el.style.backgroundColor = color;
            el.addEventListener('click', () => onChange(color));
            wrap.appendChild(el);
        });
        optionsContainer.appendChild(wrap);
    }

    function renderStylePicker(styles, selected, onChange) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'width:100%;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px;';
        styles.forEach(style => {
            const btn = document.createElement('button');
            btn.className = 'style-option' + (style === selected ? ' selected' : '');
            btn.textContent = style;
            btn.addEventListener('click', () => onChange(style));
            wrap.appendChild(btn);
        });
        optionsContainer.appendChild(wrap);
    }

    function renderPreview() {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.fillStyle = 'rgba(0,0,0,0.2)';
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
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
