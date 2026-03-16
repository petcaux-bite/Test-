// ===== Système de Chat =====

class ChatSystem {
    constructor() {
        this.messages = [];
        this.bubbles = []; // Bulles au-dessus des personnages
        this.maxMessages = 50;
        this.messagesEl = document.getElementById('chat-messages');
        this.inputEl = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('chat-send');

        this._setupEvents();
    }

    _setupEvents() {
        this.sendBtn.addEventListener('click', () => this._onSend());
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._onSend();
        });
    }

    setPlayer(player) {
        this.player = player;
    }

    _onSend() {
        const text = this.inputEl.value.trim();
        if (!text || !this.player) return;

        this.addMessage(this.player.name, text);
        this.addBubble(this.player, text);
        this.inputEl.value = '';
    }

    addMessage(author, text, isSystem = false) {
        const msg = { author, text, isSystem, time: Date.now() };
        this.messages.push(msg);

        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }

        this._renderMessage(msg);
    }

    addBubble(entity, text) {
        this.bubbles.push({
            entity,
            text,
            createdAt: Date.now(),
            duration: Math.min(3000 + text.length * 50, 8000),
        });
    }

    _renderMessage(msg) {
        const div = document.createElement('div');
        div.className = 'msg' + (msg.isSystem ? ' system' : '');

        if (msg.isSystem) {
            div.textContent = msg.text;
        } else {
            const authorSpan = document.createElement('span');
            authorSpan.className = 'author';
            authorSpan.textContent = msg.author + ': ';
            div.appendChild(authorSpan);
            div.appendChild(document.createTextNode(msg.text));
        }

        this.messagesEl.appendChild(div);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    update() {
        const now = Date.now();
        this.bubbles = this.bubbles.filter(b => now - b.createdAt < b.duration);
    }

    drawBubbles(ctx, camera) {
        const now = Date.now();

        for (const bubble of this.bubbles) {
            const entity = bubble.entity;
            const elapsed = now - bubble.createdAt;
            const progress = elapsed / bubble.duration;

            // Fade out dans les derniers 20%
            let alpha = 1;
            if (progress > 0.8) {
                alpha = 1 - (progress - 0.8) / 0.2;
            }
            // Fade in
            if (progress < 0.05) {
                alpha = progress / 0.05;
            }

            const screenX = entity.x - camera.x;
            const screenY = entity.y - camera.y - 65;

            ctx.save();
            ctx.globalAlpha = alpha;

            // Mesurer le texte
            ctx.font = '12px sans-serif';
            const lines = Utils.wrapText(ctx, bubble.text, 160);
            const lineHeight = 16;
            const padding = 8;
            const bubbleWidth = Math.min(
                Math.max(...lines.map(l => ctx.measureText(l).width)) + padding * 2,
                180
            );
            const bubbleHeight = lines.length * lineHeight + padding * 2;

            const bx = screenX - bubbleWidth / 2;
            const by = screenY - bubbleHeight;

            // Bulle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            this._roundRect(ctx, bx, by, bubbleWidth, bubbleHeight, 10);
            ctx.fill();

            // Petit triangle
            ctx.beginPath();
            ctx.moveTo(screenX - 6, screenY);
            ctx.lineTo(screenX + 6, screenY);
            ctx.lineTo(screenX, screenY + 8);
            ctx.closePath();
            ctx.fill();

            // Texte
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], screenX, by + padding + 12 + i * lineHeight);
            }

            ctx.restore();
        }
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    isChatFocused() {
        return document.activeElement === this.inputEl;
    }
}
