import React from 'react';
import { Select } from 'antd';

interface SelectSetterProps {
    value?: any;
    onChange?: (value: any) => void;
    options?: Array<{ label: string; value: any }>;
}

const SelectSetter: React.FC<SelectSetterProps> = ({
    value,
    onChange,
    options = []
}) => {
    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
            size="small"
            style={{ width: '100%' }}
        />
    );
};

export default SelectSetter;
