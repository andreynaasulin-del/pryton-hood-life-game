/**
 * FARM DATA - GPU & COOLING CONFIGURATIONS
 */
export const FARM_DATA = {
    gpus: [
        {
            id: 'gtx_1060',
            name: 'GTX 1060 (Ржавая)',
            hashrate: 1.2, // Coins per hour
            heat: 15, // deg C
            cost: 8000,
            desc: 'Классика притона. Греется как печка, но работает.'
        },
        {
            id: 'rtx_3080',
            name: 'RTX 3080 (Neon Edition)',
            hashrate: 5.5,
            heat: 25,
            cost: 45000,
            desc: 'Мощная карта с неоновой подсветкой. Требует серьезного обдува.'
        },
        {
            id: 'quantum_chip',
            name: 'Квантовый Чип "Void"',
            hashrate: 25.0,
            heat: 40,
            cost: 250000,
            desc: 'Технология будущего. Разоряет на электричестве, плавит бетон.'
        }
    ],
    coolers: [
        {
            id: 'basic_fan',
            name: 'Китайский Кулер',
            cooling: 10, // Reduction in deg C
            cost: 2000,
            power: 5,
            desc: 'Шумит, но дует.'
        },
        {
            id: 'liquid_nitrogen',
            name: 'Азотный Контур',
            cooling: 40,
            cost: 15000,
            power: 20,
            desc: 'Ледяной поцелуй для твоей фермы.'
        }
    ],
    baseTemp: 22,
    overheatThreshold: 90,
    electricityCostPerRig: 50, // Rubles per hour

    // Greenhouse Data
    seeds: [
        {
            id: 'neon_haze',
            name: 'Семена "Neon Haze"',
            growthTime: 3600, // 1 hour in real-time
            yield: 50, // grams
            pricePerGram: 1200,
            aroma: 15,
            cost: 5000
        },
        {
            id: 'void_berry',
            name: 'Void Berry (Ген-мод)',
            growthTime: 7200,
            yield: 80,
            pricePerGram: 2500,
            aroma: 30,
            cost: 15000
        }
    ],
    equipment: [
        {
            id: 'carbon_filter',
            name: 'Угольный Фильтр',
            desc: 'Снижает запах в оранжерее на 80%.',
            cost: 25000,
            reduction: 0.8
        }
    ]
};
