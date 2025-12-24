#!/usr/bin/env node
/**
 * Скрипт для замены эмодзи на Lucide иконки
 */

import fs from 'fs';
import path from 'path';

const EMOJI_TO_LUCIDE = {
    '🎯': 'target',
    '🎵': 'music',
    '👊': 'fist',
    '⏰': 'clock',
    '💰': 'coins',
    '💚': 'heart',
    '🌪️': 'wind',
    '🎸': 'guitar',
    '🛡️': 'shield',
    '🏥': 'hospital',
    '💉': 'syringe',
    '👻': 'ghost',
    '⭐': 'star',
    '⏳': 'hourglass',
    '🥚': 'egg',
    '🍽️': 'utensils',
    '🚧': 'construction',
    '🎛️': 'sliders',
    '🌱': 'sprout',
    '🚱': 'droplet-off',
    '🌚': 'moon',
    '📺': 'monitor',
    '🤝': 'handshake',
    '🏙️': 'building-2',
    '📼': 'disc',
    '📓': 'book',
    '⚖️': 'scale',
    '💀': 'skull',
    '🔁': 'repeat',
    '⚡': 'zap',
    '🎰': 'dices',
    '🎲': 'dice-5',
    '🚬': 'CIG',
    '👁️': 'eye',
    '🏪': 'store',
    '📅': 'calendar-days',
    '🛏️': 'bed',
    '💊': 'pill',
    '🔫': 'crosshair',
    '🍔': 'sandwich',
    '💤': 'moon',
    '🌿': 'leaf',
    '🎤': 'mic',
    '📱': 'smartphone',
    '💵': 'banknote',
    '🔒': 'lock',
    '✅': 'check',
    '❌': 'x',
    '⚠️': 'alert-triangle',
    '🔥': 'flame',
    '💎': 'gem',
    '👤': 'user',
    '🎭': 'drama',
    '⛓️': 'link',
    '🎪': 'tent',
    '📝': 'file-text',
    '🔧': 'wrench',
    '🍺': 'beer',
    '☕': 'TEA',
    '🍕': 'pizza',
    '🩸': 'droplet',
    '📦': 'package',
    '🎁': 'gift',
    '🪙': 'circle-dollar-sign',
    '🗡️': 'sword',
    '⚔️': 'swords',
    '🎮': 'gamepad-2',
    '💻': 'laptop',
    '🔑': 'key',
    '🏆': 'trophy',
    '🥇': 'medal',
    '🥈': 'medal',
    '🥉': 'medal',
    '🦾': 'biceps-flexed',
    '🧪': 'test-tube',
    '🩹': 'bandage',
    '☠️': 'skull',
    '🆘': 'siren',
    '🧠': 'brain',
    '😵': 'meh',
    '🕵️‍♂️': 'user-round-search',
    '❤️': 'heart',
    '🗺️': 'map',
    '🗣️': 'message-circle',
    '🎴': 'square',
    '💼': 'briefcase',
    '🥄': 'utensils',
    '🧻': 'scroll',
    '👔': 'shirt',
    '✂️': 'scissors'
};

// Простые замены текста (полное удаление эмодзи)
const TEXT_REPLACEMENTS = {
    '🚬': '[сиг]',
    '☕': '[чай]',
    '⚡': '[энерг]',
    '🤝': '',
    '🎯': '',
    '🗺️': '',
    '🗣️': '',
    '🎴': '',
    '💼': '',
    '📦': '',
    '🛡️': '',
    '💊': '',
    '💉': '',
    '💰': '',
    '🥄': '',
    '🧻': '',
    '👔': '',
    '✂️': '',
    '🎵': '',
    '🎰': '',
    '🎲': '',
    '💪': '',
    '🏋️': '',
    '👊': '',
    '🎁': '',
    '🔒': '',
    '👁️': '',
    '✅': '[✓]',
    '❌': '[✗]'
};

function replaceEmojisInFile(filePath, mode = 'icon') {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    for (const [emoji, replacement] of Object.entries(mode === 'text' ? TEXT_REPLACEMENTS : EMOJI_TO_LUCIDE)) {
        if (content.includes(emoji)) {
            // Для icon: 'emoji' паттерна
            const iconPattern = new RegExp(`icon: '${emoji.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}'`, 'g');
            if (iconPattern.test(content)) {
                content = content.replace(iconPattern, `icon: '${replacement}'`);
                modified = true;
            }
        }
    }

    // Для текстовых замен в строках
    if (mode === 'text') {
        for (const [emoji, replacement] of Object.entries(TEXT_REPLACEMENTS)) {
            if (content.includes(emoji)) {
                content = content.replaceAll(emoji, replacement);
                modified = true;
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    }
    return modified;
}

// Обработка файлов
const files = [
    'src/scripts/modules/game-state.js',
    'src/scripts/modules/doctor-system.js',
    'src/scripts/modules/casino-progression.js',
    'src/scripts/modules/prison-system-v2.js',
    'src/scripts/data/constants.js'
];

for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        replaceEmojisInFile(filePath, 'icon');
        replaceEmojisInFile(filePath, 'text');
    }
}

console.log('Done!');
