export const DOCTOR_CONFIG = {
    meds: [
        { id: 'sedative', name: 'Седатив', price: 500, effects: { anxiety: -20, mood: 5 } },
        { id: 'vitamin', name: 'Витамины B12', price: 300, effects: { health: 10, energy: 10 } },
        { id: 'neuroleptic', name: 'Нейролептик', price: 1200, effects: { adequacy: 30, trip: -50 } }
    ],
    diagnoses: [
        { threshold: 80, text: 'Стабилен. Поверхностная тревога.', level: 'low' },
        { threshold: 50, text: 'Пограничное состояние. Требуется режим.', level: 'medium' },
        { threshold: 20, text: 'Острый психоз. Риск госпитализации!', level: 'critical' }
    ]
};
