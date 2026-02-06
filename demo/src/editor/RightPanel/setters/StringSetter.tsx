import React from 'react';
import { Input } from 'antd';

interface StringSetterProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}

const StringSetter: React.FC<StringSetterProps> = ({
    value,
    onChange,
    placeholder = '请输入'
}) => {
    return (
        <Input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            size="small"
        />
    );
};

export default StringSetter;
