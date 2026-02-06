import React from 'react';
import { Switch } from 'antd';

interface BooleanSetterProps {
    value?: boolean;
    onChange?: (value: boolean) => void;
}

const BooleanSetter: React.FC<BooleanSetterProps> = ({
    value,
    onChange
}) => {
    return (
        <Switch
            checked={value}
            onChange={onChange}
            size="small"
        />
    );
};

export default BooleanSetter;
