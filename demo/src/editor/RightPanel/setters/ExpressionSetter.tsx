import React from 'react';
import { Input } from 'antd';

const { TextArea } = Input;

interface ExpressionSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

const ExpressionSetter: React.FC<ExpressionSetterProps> = ({ value = '', onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TextArea
                rows={3}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="state.data.filter(item => item.active)"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            <div style={{ fontSize: '12px', color: '#999' }}>
                💡 提示: 输入JavaScript表达式，可以访问全局变量和state
            </div>
        </div>
    );
};

export default ExpressionSetter;
