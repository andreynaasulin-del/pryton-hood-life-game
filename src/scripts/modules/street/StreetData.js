export const StreetData = {
    districts: {
        slums: {
            id: 'slums', title: 'ТРУЩОБЫ', subtitle: 'СЕКТОР-7 // ПЕРИФЕРИЯ', icon: 'tent',
            color: '#94a3b8', danger: 1, population: 2,
            mapX: 25, mapY: 70,
            desc: 'Грязные переулки, где каждый сам за себя. Здесь проще всего затеряться.',
            jobs: [
                {
                    id: 'flippers', title: 'Раздача листовок', type: 'legal',
                    icon: 'copy', energy: 10, pay: 300,
                    duration: 5000, stress: 2,
                    desc: 'Нудная работа на жаре. Зато безопасно.'
                },
                {
                    id: 'loader', title: 'Грузчик на складе', type: 'legal',
                    icon: 'package-2', energy: 25, pay: 800,
                    duration: 8000, stress: 5,
                    desc: 'Тяжелые ящики, сорванная спина, честный рубль.'
                },
                {
                    id: 'kladmen', title: 'Работа курьером (Black)', type: 'illegal',
                    icon: 'map-pin', energy: 15, pay: 2500,
                    duration: 10000, risk: 0.2, stress: 15,
                    desc: 'Высокий доход, высокий риск. Не попадись на камеру.'
                }
            ]
        },
        center: {
            id: 'center', title: 'ЦЕНТР', subtitle: 'СЕКТОР-1 // ЯДРО', icon: 'building-2',
            color: '#3b82f6', danger: 2, population: 5,
            mapX: 55, mapY: 40,
            desc: 'Невский проспект. Туристы, бизнес, обилие полиции и камер.',
            jobs: [
                {
                    id: 'busking', title: 'Уличный концерт', type: 'legal',
                    icon: 'music', energy: 20, pay: 1200,
                    duration: 12000, stress: 3,
                    desc: 'Немного хайпа и мелочи в шляпе.'
                },
                {
                    id: 'pickpocket', title: 'Карманная кража', type: 'illegal',
                    icon: 'wallet', energy: 10, pay: 1500,
                    duration: 4000, risk: 0.15, stress: 10,
                    desc: 'Ловкость рук и никакого мошенничества. Почти.'
                },
                {
                    id: 'fraud', title: 'Обнал карт', type: 'illegal',
                    icon: 'credit-card', energy: 5, pay: 5000,
                    duration: 15000, risk: 0.3, stress: 25,
                    desc: 'Чистые деньги из грязного пластика.'
                }
            ]
        },
        industrial: {
            id: 'industrial', title: 'ПРОМЗОНА', subtitle: 'СЕКТОР-9 // ЗАВОДЫ', icon: 'factory',
            color: '#ef4444', danger: 4, population: 1,
            mapX: 80, mapY: 20,
            desc: 'Заброшенные заводы. Идеальное место для темных дел.',
            jobs: [
                {
                    id: 'scrap', title: 'Сбор металла', type: 'legal',
                    icon: 'hammer', energy: 35, pay: 600,
                    duration: 7000, stress: 8,
                    desc: 'Тяжело, грязно, мало платят. Но совесть чиста.'
                },
                {
                    id: 'deal', title: 'Крупная сделка', type: 'illegal',
                    icon: 'briefcase', energy: 20, pay: 8000,
                    duration: 20000, risk: 0.4, stress: 35,
                    desc: 'Передача товара в заброшке. Опаснее всего.'
                }
            ]
        }
    },
    weather: {
        types: ['clear', 'cloudy', 'rain', 'fog'],
        icons: { clear: '☀️', cloudy: '☁️', rain: '🌧️', fog: '🌫️' },
        names: { clear: 'Ясно', cloudy: 'Облачно', rain: 'Дождь', fog: 'Туман' }
    }
};
