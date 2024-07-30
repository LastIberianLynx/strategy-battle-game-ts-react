// BlackSquare.tsx
import React from 'react';
import './BlackSquare.css';

interface Props {
    x: number;
    y: number;
    onContextMenu: (e: React.MouseEvent) => void;
}

const BlackSquare: React.FC<Props> = ({ x, y , onContextMenu}) => {
    return (
        <div className="black-square" style={{ left: `${x * 100}px`, top: `${y * 100}px`}} 
        onContextMenu={onContextMenu}
        />
    );
};

export default BlackSquare;