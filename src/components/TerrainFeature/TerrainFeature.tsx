// TerrainFeature.tsx
import React from 'react';
import './TerrainFeature.css';

interface Props {
    x: number;
    y: number;
    backgroundImage: string;
    onContextMenu: (e: React.MouseEvent) => void;
}

const TerrainFeature: React.FC<Props> = ({ x, y, backgroundImage, onContextMenu }) => {
    return (
        <div
            className="terrain-feature"
            style={{ left: `${x * 100}px`, top: `${y * 100}px`, backgroundImage }}
            onContextMenu={onContextMenu}
        />
    );
};



export const terrainConfigs = {
    'Mountain': { 
        name: 'Mountain',
        spriteSheet: 'url("assets/images/mountain1.png")',
        CombatBonus: [
            { "Defense": +20 },
        ],
        UnitBonus: [
            { "Knight": -10 },
            { "Archer": +5}
        ],
    },
    'Forest': { 
        name: 'Forest',
        spriteSheet: 'url("assets/images/forest1.png")',
        CombatBonus: [
            { "Defense": +10 },
        ],
        UnitBonus: [
            { "Knight": -15 },
            { "Archer": -10 },
        ],
    },
};

export default TerrainFeature;
