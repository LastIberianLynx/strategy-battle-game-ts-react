
// Define the types for your enemy configurations
interface UnitConfig {
    name: string;
    spriteSheet: string;
    attack: number;
    defense: number;
    health: number;
    moves: number;
    bonus: Array<{ [key: string]: number }>;
}

export const enemyConfigs = {
    // 'Axeman': { 
    //     name: 'Axeman',
    //     spriteSheet: "light infantry - elite7",
    //     attack: 25,
    //     defense: 1,
    //     health: 100,
    //     moves: 2,        
    //     bonus: [
    //         { "Archer": 4 },
    //         { "Swordsman": 3 }
    //     ],
    // },
    // 'MilitiaAxeman': { 
    //     name: 'MilitiaAxeman',
    //     spriteSheet: "light infantry - elite7",
    //     attack: 30,
    //     defense: 2,
    //     health: 120,
    //     moves: 2,
    //     bonus: [
    //         { "Archer": 4 },
    //         { "Swordsman": 3 }
    //     ],
    // },
    'Archer': { 
        name: 'Archer',
        spriteSheet: "64 light infantry3",
        attack: 15,
        defense: 0,
        health: 100,
        moves: 2,
        bonus: [
            { "Spearman": 10 },
            { "Axeman": 5 }
        ],
        projectile: "Arrow"
    },
    'Knight': { 
        name: 'Knight',
        spriteSheet: "64 cavalry - heavy1",
        attack: 35,
        defense: 6,
        health: 150,
        moves: 3,
        bonus: [
            { "Archer": 30 },
            { "Axeman": 12 },
            { "Swordsman": 7 }
        ], 
        projectile: "None"
    },
    'Spearman': { 
        name: 'Spearman',
        spriteSheet: "64 heavy infantry1",
        attack: 15,
        defense: 2,
        health: 100,
        moves: 1,
        bonus: [
            { "Knight": 20 }
        ],
         projectile: "None"
    },
    'Swordsman': { 
        name: 'Swordsman',
        spriteSheet: "64 heavy infantry - elite8",
        attack: 20,
        defense: 3,
        health: 100,
        moves: 1,
        bonus: [
            { "Spearman": 15 },
            { "Archer": 20 },
        ],
         projectile: "None"
        
    },
};

