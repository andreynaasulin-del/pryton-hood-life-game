/**
 * SOCIAL FEED SYSTEM
 * Симуляция соцсети - посты и комменты к действиям игрока
 */

export class SocialFeed {
    constructor() {
        this.posts = [];
        this.maxPosts = 20;
    }

    init(savedPosts) {
        if (savedPosts && Array.isArray(savedPosts)) {
            this.posts = savedPosts;
        } else {
            // Load from gameState if available
            this.loadFromGameState();
        }
    }

    loadFromGameState() {
        if (typeof gameState !== 'undefined') {
            const state = gameState.getState();
            if (state.socialFeedPosts && state.socialFeedPosts.length > 0) {
                this.posts = state.socialFeedPosts;
            }
        }
    }

    saveToGameState() {
        if (typeof gameState !== 'undefined') {
            const state = gameState.getState();
            state.socialFeedPosts = this.posts;
        }
    }

    addPost(type, content, author, timestamp) {
        const post = {
            id: Date.now() + Math.random(),
            type,
            content,
            author,
            timestamp: timestamp || Date.now(),
            likes: Math.floor(Math.random() * 50),
            comments: this.generateComments(type, 1 + Math.floor(Math.random() * 3))
        };

        this.posts.unshift(post);

        // Ограничить количество постов
        if (this.posts.length > this.maxPosts) {
            this.posts = this.posts.slice(0, this.maxPosts);
        }

        this.saveToGameState(); // Auto-save
        return post;
    }

    generateComments(type, count) {
        const commentTemplates = {
            track_release: [
                { author: '@beats_hunter', text: 'Йо, это огонь! 🔥' },
                { author: '@music_critic', text: 'Слабо. Слышал лучше.' },
                { author: '@underground_kid', text: 'Где скачать?' },
                { author: '@hater228', text: 'Клоун, удали 🤡' },
                { author: '@wannabe_rapper', text: 'Научи делать такое' },
                { author: '@prodbynoname', text: 'Бит годный, текст так себе' }
            ],
            street_action: [
                { author: '@street_news', text: 'Видели его вчера на 5-й' },
                { author: '@cop_spotter', text: 'Менты рядом, осторожнее' },
                { author: '@paranoid_user', text: 'Палево, удаляй пост' },
                { author: '@respect_count', text: 'Уважуха растет 📈' }
            ],
            casino_win: [
                { author: '@casino_regular', text: 'Везунчик! Поделись' },
                { author: '@math_nerd', text: 'Матожидание против тебя' },
                { author: '@broke_gambler', text: 'Дай в долг 😭' },
                { author: '@superstitious', text: 'Какой ритуал делал?' }
            ],
            synthesis: [
                { author: '@chemist_anon', text: 'Рецепт в личку?' },
                { author: '@narc_alert', text: 'Удали пока не поздно' },
                { author: '@customer_1', text: 'Когда будет товар?' },
                { author: '@quality_check', text: 'Чистота какая?' }
            ],
            prison: [
                { author: '@lawyer_bot', text: 'Нужен адвокат?' },
                { author: '@ex_convict', text: 'Держись там, братан' },
                { author: '@troll_account', text: 'Сидишь? Сиди!' },
                { author: '@mom_worried', text: 'Когда домой вернешься?' }
            ],
            default: [
                { author: '@random_user', text: 'Интересно...' },
                { author: '@bot_12345', text: '👍' },
                { author: '@lurker', text: 'Мимо проходил' }
            ]
        };

        const templates = commentTemplates[type] || commentTemplates.default;
        const shuffled = [...templates].sort(() => Math.random() - 0.5);

        return shuffled.slice(0, count);
    }

    onTrackRelease(quality) {
        let content = '';
        if (quality >= 90) {
            content = '🔥 Новый БЭНГЕР только что вышел! Все в шоке!';
        } else if (quality >= 70) {
            content = '🎵 Выпустил новый трек. Зацените!';
        } else if (quality >= 50) {
            content = '🎶 Новый релиз. Не шедевр, но сойдет.';
        } else {
            content = '💿 Кхм... новая песня. Не судите строго.';
        }

        return this.addPost('track_release', content, '@you', Date.now());
    }

    onStreetAction(actionName, success) {
        const content = success
            ? `✅ ${actionName} прошло успешно. Респект на улицах растет.`
            : `⚠️ ${actionName} - были проблемы...`;

        return this.addPost('street_action', content, '@you', Date.now());
    }

    onCasinoWin(amount) {
        const content = amount > 1000
            ? `💰 ДЖЕКПОТ! +₽${amount} в казино! Сегодня мой день!`
            : `🎰 Выиграл ₽${amount} в казино. Везет!`;

        return this.addPost('casino_win', content, '@you', Date.now());
    }

    onSynthesis(quality) {
        let content = '';
        if (quality >= 90) {
            content = '⚗️ Синтез удался на 100%. Чистейший продукт.';
        } else if (quality >= 60) {
            content = '🧪 Новая партия готова. Качество норм.';
        } else {
            content = '🧫 Пытался варить... Получилось так себе.';
        }

        return this.addPost('synthesis', content, '@you', Date.now());
    }

    onPrisonRelease(daysServed) {
        const content = `🔓 Освободился после ${daysServed} дней. Свобода!`;
        return this.addPost('prison', content, '@you', Date.now());
    }

    // Генерировать случайные посты от города
    generateCityPost(day) {
        const cityPosts = [
            { type: 'news', author: '@city_news', content: '📰 Полиция усилила патрули в центре' },
            { type: 'news', author: '@underground_radio', content: '📻 Сегодня ночью - батл в подземке' },
            { type: 'news', author: '@street_rumors', content: '👂 Ходят слухи о новом дилере' },
            { type: 'news', author: '@weather_bot', content: '🌧️ Дождь весь день. Серость.' },
            { type: 'news', author: '@club_promo', content: '🎉 Сегодня в клубе скидки на вход' },
            { type: 'news', author: '@dealer_network', content: '💊 Новый товар в наличии' },
            { type: 'news', author: '@spirit_watcher', content: '👻 Дух наблюдает за тобой...' },
            { type: 'news', author: '@beats_marketplace', content: '🎵 Продаю биты. Огонь треки!' },
            { type: 'news', author: '@studio_promo', content: '🎤 Студия дает скидку - 20%' },
            { type: 'news', author: '@rapper_unknown', content: '🔥 Мой новый трек взорвал все чарты!' },
            { type: 'news', author: '@broke_musician', content: '💸 Кто-нибудь купит мой альбом?' },
            { type: 'news', author: '@hype_train', content: '⚡ Сегодня эпичный рейв в заброшке!' }
        ];

        const randomPost = cityPosts[Math.floor(Math.random() * cityPosts.length)];
        return this.addPost(randomPost.type, randomPost.content, randomPost.author, Date.now());
    }

    // Генерировать фейковую активность от других "пользователей"
    generateRandomUserPosts() {
        const userPosts = [
            { author: '@young_rapper', content: 'Кто хочет коллаб? Пишите в личку 🎤', likes: 23 },
            { author: '@beat_maker_pro', content: 'Продаю биты. Trap, Drill, Phonk. Дёшево! 💰', likes: 15 },
            { author: '@club_kid', content: 'Вчера в клубе было безумие 🔥', likes: 67 },
            { author: '@street_philosopher', content: 'Жизнь - это игра. Ты или играешь, или проигрываешь.', likes: 102 },
            { author: '@hustle_mode', content: 'Работаю 24/7. Нет выходных. 💪', likes: 45 },
            { author: '@paranoid_user', content: '👀 Чувствую за мной следят...', likes: 8 },
            { author: '@party_animal', content: '🍾 Сегодня праздную. Повод найдётся!', likes: 33 },
            { author: '@conspiracy_guy', content: 'Всё контролирует элита. Проснитесь!', likes: 12 },
            { author: '@motivation_bot', content: '💎 Каждый день - новая возможность!', likes: 89 },
            { author: '@local_meme_lord', content: '😂 When life gives you lemons...', likes: 156 }
        ];

        const randomUsers = userPosts
            .sort(() => Math.random() - 0.5)
            .slice(0, 3); // Берём 3 случайных

        randomUsers.forEach((post, i) => {
            setTimeout(() => {
                const newPost = this.addPost('user_post', post.content, post.author, Date.now());
                newPost.likes = post.likes; // Set custom likes
            }, i * 2000); // С задержкой 2 сек между постами
        });
    }

    // Автозаполнение ленты при старте игры
    autoPopulateFeed() {
        if (this._populated) return; // Защита от повторного вызова
        this._populated = true;

        if (this.posts.length < 5) {
            // Добавить несколько стартовых постов
            this.generateCityPost();
            setTimeout(() => this.generateRandomUserPosts(), 1000);
        }
    }

    getRecentPosts(count = 10) {
        return this.posts.slice(0, count);
    }

    getPosts() {
        return this.posts;
    }

    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.likes = (post.likes || 0) + 1;
            this.saveToGameState();
            return true;
        }
        return false;
    }

    save() {
        return this.posts;
    }
}

// Singleton
export const socialFeed = new SocialFeed();
