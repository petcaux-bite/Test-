// ===== Système de Chat + Messages Privés + Modération =====

class ChatSystem {
    constructor() {
        this.messages      = [];
        this.bubbles       = [];
        this.maxMessages   = 80;
        this.isAdmin       = false;
        this._idCounter    = 0;
        this.player        = null;

        this.messagesEl = document.getElementById('chat-messages');
        this.inputEl    = document.getElementById('chat-input');
        this.sendBtn    = document.getElementById('chat-send');

        // Joueurs en ligne simulés pour les MP
        this._onlinePlayers = ['Thomas', 'Léa', 'MaxPlayer', 'CoolGamer99', 'BlobKing'];
        this._npcReplies    = [
            'Salut ! 👋', 'Oui je suis là !', 'Haha 😄', 'C\'est quoi ?',
            'Cool !', 'On se rejoint où ?', 'Ok !', 'T\'as vu les nouvelles pièces ?',
            'Je cherche des potions 🔵', 'Viens voir ça !', 'Bientôt !',
            'Trop bien ce monde !', 'Carrément 😎',
        ];

        this._setupEvents();
    }

    setPlayer(player) {
        this.player = player;
    }

    setAdmin(isAdmin) {
        this.isAdmin = isAdmin;
        // Activer les boutons de modération sur les messages existants
        this.messagesEl.querySelectorAll('.msg:not(.system)').forEach(el => {
            if (el.dataset.id) this._addDeleteBtn(el, Number(el.dataset.id));
        });
    }

    // ── Envoi ─────────────────────────────────────────────────────────
    _setupEvents() {
        this.sendBtn.addEventListener('click',   () => this._onSend());
        this.inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') this._onSend(); });
    }

    _onSend() {
        const raw = this.inputEl.value.trim();
        if (!raw || !this.player) return;
        this.inputEl.value = '';

        // Commande /mp → message privé
        if (raw.startsWith('/mp ')) {
            const rest  = raw.slice(4).trim();
            const space = rest.indexOf(' ');
            if (space < 0) {
                this.addMessage(null, '⚠ Usage : /mp NomJoueur message', true);
                return;
            }
            const target  = rest.slice(0, space);
            const content = rest.slice(space + 1).trim();
            if (content) this._sendPM(target, content);
            return;
        }

        this.addMessage(this.player.name, raw);
        this.addBubble(this.player, raw);
    }

    // ── Messages privés ────────────────────────────────────────────────
    _sendPM(target, text) {
        const id = ++this._idCounter;
        this._renderPM({ id, from: this.player.name, to: target, text, dir: 'out' });
        this.messages.push({ id, author: this.player.name, text, type: 'pm-out', to: target });

        // Réponse simulée du destinataire (1.5 – 4.5s)
        const delay = 1500 + Math.random() * 3000;
        setTimeout(() => {
            const replyText = this._npcReplies[Math.floor(Math.random() * this._npcReplies.length)];
            const rid = ++this._idCounter;
            this._renderPM({ id: rid, from: target, to: this.player.name, text: replyText, dir: 'in' });
            this.messages.push({ id: rid, author: target, text: replyText, type: 'pm-in', from: target });
        }, delay);
    }

    // ── Ajout de messages publics ─────────────────────────────────────
    addMessage(author, text, isSystem = false) {
        const id  = ++this._idCounter;
        const msg = { id, author, text, isSystem, time: Date.now() };
        this.messages.push(msg);
        if (this.messages.length > this.maxMessages) this.messages.shift();
        this._renderMessage(msg);
    }

    // ── Modération : suppression ───────────────────────────────────────
    deleteMessage(id) {
        const el = this.messagesEl.querySelector(`[data-id="${id}"]`);
        if (el) { el.classList.add('deleted'); setTimeout(() => el.remove(), 350); }
        const idx = this.messages.findIndex(m => m.id === id);
        if (idx >= 0) this.messages.splice(idx, 1);
    }

    // ── Rendu HTML ────────────────────────────────────────────────────
    _renderMessage(msg) {
        const div = document.createElement('div');
        div.dataset.id = msg.id;
        div.className  = 'msg';

        if (msg.isSystem) {
            div.classList.add('system');
            div.textContent = msg.text;
        } else {
            const nameSpan = document.createElement('span');
            nameSpan.className   = 'author';
            nameSpan.textContent = msg.author + ':';
            nameSpan.title       = `Envoyer un MP à ${msg.author}`;
            nameSpan.style.cursor = 'pointer';
            nameSpan.addEventListener('click', () => {
                this.inputEl.value = `/mp ${msg.author} `;
                this.inputEl.focus();
            });
            div.appendChild(nameSpan);
            div.appendChild(document.createTextNode(' ' + msg.text));

            if (this.isAdmin) this._addDeleteBtn(div, msg.id);
        }

        this.messagesEl.appendChild(div);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    _renderPM({ id, from, to, text, dir }) {
        const div = document.createElement('div');
        div.dataset.id = id;
        div.className  = dir === 'out' ? 'msg pm pm-out' : 'msg pm pm-in';

        const tag = document.createElement('span');
        tag.className   = 'pm-tag';
        tag.textContent = dir === 'out' ? `→ ${to}` : `✉ ${from}`;
        tag.title       = dir === 'in' ? `Répondre à ${from}` : '';
        if (dir === 'in') {
            tag.style.cursor = 'pointer';
            tag.addEventListener('click', () => {
                this.inputEl.value = `/mp ${from} `;
                this.inputEl.focus();
            });
        }
        div.appendChild(tag);
        div.appendChild(document.createTextNode(' ' + text));

        if (this.isAdmin) this._addDeleteBtn(div, id);
        this.messagesEl.appendChild(div);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    _addDeleteBtn(div, id) {
        if (div.querySelector('.del-btn')) return;
        const btn = document.createElement('button');
        btn.className   = 'del-btn';
        btn.title       = 'Supprimer ce message (modération)';
        btn.textContent = '✖';
        btn.addEventListener('click', e => { e.stopPropagation(); this.deleteMessage(id); });
        div.appendChild(btn);
    }

    // ── Bulles en jeu ─────────────────────────────────────────────────
    addBubble(entity, text) {
        this.bubbles.push({
            entity,
            text,
            createdAt: Date.now(),
            duration:  Math.min(3000 + text.length * 50, 8000),
        });
    }

    update() {
        const now = Date.now();
        this.bubbles = this.bubbles.filter(b => now - b.createdAt < b.duration);
    }

    drawBubbles(ctx, camera) {
        const now = Date.now();
        for (const bubble of this.bubbles) {
            const { entity, text, createdAt, duration } = bubble;
            const progress = (now - createdAt) / duration;
            let alpha = 1;
            if (progress > 0.8) alpha = 1 - (progress - 0.8) / 0.2;
            if (progress < 0.05) alpha = progress / 0.05;

            const screenX = entity.x - camera.x;
            const screenY = entity.y - camera.y - 65;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = '12px sans-serif';
            const lines      = Utils.wrapText(ctx, text, 160);
            const lineH      = 16, pad = 8;
            const bW         = Math.min(Math.max(...lines.map(l => ctx.measureText(l).width)) + pad * 2, 180);
            const bH         = lines.length * lineH + pad * 2;
            const bx         = screenX - bW / 2, by = screenY - bH;

            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            this._roundRect(ctx, bx, by, bW, bH, 10);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(screenX - 6, screenY); ctx.lineTo(screenX + 6, screenY);
            ctx.lineTo(screenX, screenY + 8); ctx.closePath(); ctx.fill();

            ctx.fillStyle = '#333'; ctx.textAlign = 'center';
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], screenX, by + pad + 12 + i * lineH);
            }
            ctx.restore();
        }
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y,         x + r, y);
        ctx.closePath();
    }

    isChatFocused() {
        return document.activeElement === this.inputEl;
    }
}
