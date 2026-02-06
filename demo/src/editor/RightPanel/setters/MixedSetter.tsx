import React, { useState } from 'react';
import { Select } from 'antd';
import StringSetter from './StringSetter';
import NumberSetter from './NumberSetter';
import BooleanSetter from './BooleanSetter';
import ColorSetter from './ColorSetter';
import DateSetter from './DateSetter';

interface MixedSetterProps {
    value?: any;
    onChange: (value: any) => void;
}

/**
 * 混合类型Setter - 可以在不同类型的Setter间切换
 */
const MixedSetter: React.FC<MixedSetterProps> = ({ value, onChange }) => {
    const [type, setType] = useState<string>('string');

    const setterComponents: Record<string, React.ComponentType<any>> = {
        string: StringSetter,
        number: NumberSetter,
        boolean: BooleanSetter,
        color: ColorSetter,
        date: DateSetter,
    };

    const CurrentSetter = setterComponents[type] || StringSetter;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Select
                value={type}
                onChange={setType}
                style={{ width: '100%' }}
                options={[
                    { label: '文本', value: 'string' },
                    { label: '数字', value: 'number' },
                    { label: '布尔', value: 'boolean' },
                    { label: '颜色', value: 'color' },
                    { label: '日期', value: 'date' },
                ]}
            />
            <CurrentSetter value={value} onChange={onChange} />
        </div>
    );
};

export default MixedSetter;
