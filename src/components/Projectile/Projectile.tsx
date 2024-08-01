// TerrainFeature.tsx
import React from 'react';
import './Projectile.css';

interface Props {
    x: number;
    y: number;
    backgroundImage: string;
    // onContextMenu: (e: React.MouseEvent) => void;
}

const Projectile: React.FC<Props> = ({ x, y, backgroundImage/*, onContextMenu */}) => {
    return (
        <div
            className="projectile"
            style={{ left: `${x*100+25}px`, top: `${y*100+25}px`, backgroundImage }}
            // onContextMenu={onContextMenu}
        />
    );
};



export const projectileConfigs = {
    'Arrow': { 
        name: 'Arrow',
        spriteSheet: 'url("assets/images/Arrow.png")',
        attack: 10,
        range: 4,
        bonus: [
            { "Knight": -5 },
            { "Swordsman": +2},
            { "Spearman": +3},
        ],
    },
    'Bolt': { 
        name: 'Bolt',
        spriteSheet: 'url("assets/images/Bolt.png")',
        attack: 16,
        range: 3,
        bonus: [
            { "Knight": 6 }, //because bonus vs armour
            { "Swordsman": +4}
        ],
    },
};


export default Projectile;
