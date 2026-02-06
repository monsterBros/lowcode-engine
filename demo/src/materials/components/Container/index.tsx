import React from 'react';

interface ContainerProps {
    children?: React.ReactNode;
    layout?: 'vertical' | 'horizontal';
    background?: string;
    padding?: number;
    gap?: number;
}

const Container: React.FC<ContainerProps> = ({
    children,
    layout = 'vertical',
    background = '#f5f5f5',
    padding = 16,
    gap = 8
}) => {
    const styles: React.CSSProperties = {
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        background,
        padding: `${padding}px`,
        gap: `${gap}px`,
        minHeight: '100px',
        borderRadius: '4px',
        border: '1px dashed #d9d9d9',
    };

    return (
        <div style={styles}>
            {children || <div style={{ color: '#999', textAlign: 'center' }}>拖拽组件到这里</div>}
        </div>
    );
};

export default Container;
