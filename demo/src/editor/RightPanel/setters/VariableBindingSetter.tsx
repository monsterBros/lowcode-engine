import React, { useState } from 'react';
import { Select, Button, Input } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { variableManager } from '@/engine/VariableManager';

interface VariableBindingSetterProps {
    value?: {
        type: 'JSExpression';
        value: string;
    } | any;
    onChange?: (value: any) => void;
}

/**
 * 变量绑定Setter
 * 用于将属性绑定到全局变量
 */
const VariableBindingSetter: React.FC<VariableBindingSetterProps> = ({ value, onChange }) => {
    const [mode, setMode] = useState<'static' | 'variable'>(
        value?.type === 'JSExpression' ? 'variable' : 'static'
    );

    const variables = variableManager.getAll();

    const handleModeChange = (newMode: 'static' | 'variable') => {
        setMode(newMode);
        if (newMode === 'static') {
            onChange?.('');
        } else {
            if (variables.length > 0) {
                onChange?.({
                    type: 'JSExpression',
                    value: variables[0].name
                });
            }
        }
    };

    const handleVariableChange = (variableName: string) => {
        onChange?.({
            type: 'JSExpression',
            value: variableName
        });
    };

    const handleStaticChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Select value={mode} onChange={handleModeChange} style={{ width: '100%' }}>
                <Select.Option value="static">静态值</Select.Option>
                <Select.Option value="variable">绑定变量</Select.Option>
            </Select>

            {mode === 'static' ? (
                <Input
                    value={typeof value === 'object' ? '' : value}
                    onChange={handleStaticChange}
                    placeholder="输入静态值"
                />
            ) : (
                <Select
                    value={value?.value}
                    onChange={handleVariableChange}
                    placeholder="选择变量"
                    style={{ width: '100%' }}
                >
                    {variables.map(v => (
                        <Select.Option key={v.name} value={v.name}>
                            {v.name} ({v.type})
                        </Select.Option>
                    ))}
                </Select>
            )}

            {mode === 'variable' && variables.length === 0 && (
                <div style={{ fontSize: 12, color: '#999' }}>
                    暂无可用变量，请先定义变量
                </div>
            )}
        </div>
    );
};

export default VariableBindingSetter;
