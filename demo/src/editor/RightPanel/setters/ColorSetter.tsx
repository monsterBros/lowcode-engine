import React from 'react';

interface ColorSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

const ColorSetter: React.FC<ColorSetterProps> = ({ value = '#1890ff', onChange }) => {
    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: '50px', height: '32px', cursor: 'pointer' }}
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#1890ff"
                style={{ flex: 1, padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '2px' }}
            />
        </div>
    );
};

export default ColorSetter;
