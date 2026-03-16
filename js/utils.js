// ===== Utilitaires =====

const Utils = {
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },

    // Wrap text pour les bulles de chat
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }
};
