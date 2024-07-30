// Tile.tsx
import React from 'react';
import './Tile.css';

interface Props {
    image?: string;
    number: number;
    onClick: () => void; // Left click to select
    onContextMenu: (e: React.MouseEvent) => void; // Right click to move
    pieceHighlight?: boolean;
    health?: number; // Add health prop
    flip?: boolean; // Prop to conditionally apply the flip class
    isOpponent?: boolean; // Prop to apply reddish hue
}


interface Pos {
    x: number;
    y: number;
}

const Tile: React.FC<Props> = ({ image, number, onClick, onContextMenu, pieceHighlight, health, flip, isOpponent }) => {
    const tileClass = (number % 2 === 0) ? "tile black-tile" : "tile white-tile";
    const highlightClass = pieceHighlight ? "highlight" : "";
    const pieceClass = `chess-piece ${pieceHighlight ? 'selected' : ''} ${flip ? 'flip' : ''} ${isOpponent ? 'opponent' : ''}`;

    return (
        <div
            className={`${tileClass} ${highlightClass}`}
            onClick={onClick}
            onContextMenu={onContextMenu}
        >
            {image && (
                <div className={pieceClass} style={{ backgroundImage: `url("${image}")` }}>
                    {health !== undefined && (
                        <div className="health-bar">
                            <div className="health-bar-fill" style={{ width: `${health}%` }}></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};



export default Tile;
