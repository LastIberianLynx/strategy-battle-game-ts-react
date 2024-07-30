import React, { useEffect } from 'react';
import './TextMessage.css';

interface Props {
    text: string;
    x: number;
    y: number;
    color: string;
    onAnimationEnd: () => void;
}

const TextMessage: React.FC<Props> = ({ text, x, y, color, onAnimationEnd }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onAnimationEnd();
        }, 3000); // The duration should match the animation duration

        return () => clearTimeout(timer);
    }, [onAnimationEnd]);

    return (
        <div className="text-message" style={{ left: `${x * 100}px`, top: `${y * 100}px`, color}}>
            {text}
        </div>
    );
};

export default TextMessage;
