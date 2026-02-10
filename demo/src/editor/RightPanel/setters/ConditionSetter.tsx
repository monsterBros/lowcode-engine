import React, { useState } from 'react';
import { Input, Button, Select } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface ConditionSetterProps {
    value?: {
        type: 'JSExpression';
        value: string;
    };
    onChange?: (value: any) => void;
}

/**
 * 条件渲染Setter
 * 用于配置组件的显示/隐藏条件
 */
const ConditionSetter: React.FC<ConditionSetterProps> = ({ value, onChange }) => {
    const [enabled, setEnabled] = useState(!!value);

    const handleEnable = () => {
        setEnabled(true);
        onChange?.({
            type: 'JSExpression',
            value: 'true'
        });
    };

    const handleDisable = () => {
        setEnabled(false);
        onChange?.(undefined);
    };

    const handleChange = (expr: string) => {
        onChange?.({
            type: 'JSExpression',
            value: expr
        });
    };

    if (!enabled) {
        return (
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleEnable}
                block
            >
                设置条件渲染
            </Button>
        );
    }

    return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input.TextArea
                value={value?.value || ''}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="输入表达式，如：state.isVisible"
                rows={2}
                style={{ flex: 1 }}
            />
            <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDisable}
            />
        </div>
    );
};

export default ConditionSetter;
