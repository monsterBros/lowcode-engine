import React from 'react';
import { Card } from 'antd';
import { useDrag } from 'react-dnd';
import { MaterialMeta } from '@/types';
import styles from './MaterialCard.module.css';

interface MaterialCardProps {
    material: MaterialMeta;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'MATERIAL',
        item: { material },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className={styles.card}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div className={styles.icon}>{material.icon}</div>
            <div className={styles.title}>{material.title}</div>
        </div>
    );
};

export default MaterialCard;
