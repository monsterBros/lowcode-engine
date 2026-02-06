import React from 'react';
import { InputNumber } from 'antd';

interface NumberSetterProps {
    value?: number;
    onChange?: (value: number | null) => void;
    min?: number;
    max?: number;
    placeholder?: string;
}

const NumberSetter: React.FC<NumberSetterProps> = ({
    value,
    onChange,
    min,
    max,
    placeholder = '请输入数字'
}) => {
    return (
        <InputNumber
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            placeholder={placeholder}
            size="small"
            style={{ width: '100%' }}
        />
    );
};

export default NumberSetter;
