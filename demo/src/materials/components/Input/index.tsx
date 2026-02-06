import React from 'react';

interface InputProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'text' | 'password' | 'number';
    size?: 'large' | 'middle' | 'small';
}

const Input: React.FC<InputProps> = ({
    placeholder = 'Please input',
    value,
    onChange,
    type = 'text',
    size = 'middle'
}) => {
    const styles: React.CSSProperties = {
        padding: size === 'large' ? '10px 12px' : size === 'small' ? '4px 8px' : '6px 11px',
        fontSize: size === 'large' ? '16px' : size === 'small' ? '12px' : '14px',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        outline: 'none',
        transition: 'all 0.3s',
        width: '100%',
    };

    return (
        <input
            style={styles}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            type={type}
        />
    );
};

export default Input;
