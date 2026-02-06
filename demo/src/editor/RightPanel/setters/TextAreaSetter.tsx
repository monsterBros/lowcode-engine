import React from 'react';
import { Input } from 'antd';

const { TextArea } = Input;

interface TextAreaSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

const TextAreaSetter: React.FC<TextAreaSetterProps> = ({ value, onChange }) => {
    return (
        <TextArea
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="输入文本内容"
        />
    );
};

export default TextAreaSetter;
