import React from 'react';
import { Switch } from 'antd';

interface SwitchSetterProps {
    value?: boolean;
    onChange: (value: boolean) => void;
}

const SwitchSetter: React.FC<SwitchSetterProps> = ({ value = false, onChange }) => {
    return (
        <Switch
            checked={value}
            onChange={onChange}
            checkedChildren="开"
            unCheckedChildren="关"
        />
    );
};

export default SwitchSetter;
