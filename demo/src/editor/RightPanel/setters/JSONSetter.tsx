import React, { useState } from 'react';
import { Input, Button, message } from 'antd';

const { TextArea } = Input;

interface JSONSetterProps {
    value?: any;
    onChange: (value: any) => void;
}

const JSONSetter: React.FC<JSONSetterProps> = ({ value, onChange }) => {
    const [jsonText, setJsonText] = useState(() => JSON.stringify(value, null, 2));
    const [error, setError] = useState<string>('');

    const handleChange = (text: string) => {
        setJsonText(text);
        setError('');
    };

    const handleApply = () => {
        try {
            const parsed = JSON.parse(jsonText);
            onChange(parsed);
            message.success('JSON已应用');
            setError('');
        } catch (e) {
            const errMsg = (e as Error).message;
            setError(errMsg);
            message.error('JSON格式错误');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TextArea
                rows={8}
                value={jsonText}
                onChange={(e) => handleChange(e.target.value)}
                placeholder='{"key": "value"}'
                style={{ fontFamily: 'monospace' }}
            />
            {error && <div style={{ color: '#ff4d4f', fontSize: '12px' }}>{error}</div>}
            <Button type="primary" onClick={handleApply}>
                应用
            </Button>
        </div>
    );
};

export default JSONSetter;
