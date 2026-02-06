import React, { useState } from 'react';
import { Input, Button, message } from 'antd';

const { TextArea } = Input;

interface FunctionSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

const FunctionSetter: React.FC<FunctionSetterProps> = ({ value = '', onChange }) => {
    const [code, setCode] = useState(value);
    const [error, setError] = useState('');

    const handleValidate = () => {
        try {
            // 验证函数语法
            new Function(code);
            setError('');
            onChange(code);
            message.success('函数验证成功');
        } catch (e) {
            const errMsg = (e as Error).message;
            setError(errMsg);
            message.error('函数语法错误');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TextArea
                rows={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="function() { return 'Hello'; }"
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
            {error && (
                <div style={{ color: '#ff4d4f', fontSize: '12px' }}>{error}</div>
            )}
            <Button type="primary" onClick={handleValidate}>
                验证并应用
            </Button>
            <div style={{ fontSize: '12px', color: '#999' }}>
                💡 提示: 输入完整的函数代码，如 function() {'{ return "value"; }'}
            </div>
        </div>
    );
};

export default FunctionSetter;
