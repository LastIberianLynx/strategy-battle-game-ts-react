// src/components/StatDisplay/StatDisplay.jsx
import React from 'react';
import './StatDisplay.css';

interface StatDisplayProps {
    label: string;
    value: number | string;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ label, value }) => {
    return (
        <div className="stat-display">
            <span className="stat-label">{label}:</span>
            <span className="stat-value">{value}</span>
        </div>
    );
}
