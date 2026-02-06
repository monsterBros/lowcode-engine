import React from 'react';

interface ButtonProps {
    text?: string;
    type?: 'primary' | 'default' | 'dashed' | 'link';
    size?: 'large' | 'middle' | 'small';
    onClick?: () => void;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    text = 'Button',
    type = 'default',
    size = 'middle',
    onClick,
    children
}) => {
    const styles: React.CSSProperties = {
        padding: size === 'large' ? '10px 20px' : size === 'small' ? '4px 10px' : '6px 15px',
        fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px',
        border: type === 'default' ? '1px solid #d9d9d9' : 'none',
        borderRadius: '4px',
        background: type === 'primary' ? '#1890ff' : type === 'dashed' ? '#fff' : '#fff',
        color: type === 'primary' ? '#fff' : '#000',
        borderStyle: type === 'dashed' ? 'dashed' : 'solid',
        cursor: 'pointer',
        transition: 'all 0.3s',
    };

    return (
        <button style={styles} onClick={onClick}>
            {children || text}
        </button>
    );
};

export default Button;
