import React from 'react';
import { Select, Tag } from 'antd';

interface ClassNameSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

// 常用CSS类名建议
const commonClasses = [
    'container', 'wrapper', 'header', 'footer', 'nav', 'main',
    'sidebar', 'content', 'card', 'button', 'form', 'input',
    'flex', 'grid', 'center', 'text-center', 'text-left', 'text-right',
    'hidden', 'visible', 'bold', 'italic', 'underline',
];

const ClassNameSetter: React.FC<ClassNameSetterProps> = ({ value = '', onChange }) => {
    const classes = value ? value.split(' ').filter(Boolean) : [];

    const handleChange = (newClasses: string[]) => {
        onChange(newClasses.join(' '));
    };

    return (
        <Select
            mode="tags"
            value={classes}
            onChange={handleChange}
            placeholder="输入CSS类名"
            style={{ width: '100%' }}
            tagRender={(props) => {
                const { label, closable, onClose } = props;
                return (
                    <Tag
                        closable={closable}
                        onClose={onClose}
                        style={{ marginRight: 3 }}
                    >
                        {label}
                    </Tag>
                );
            }}
        >
            {commonClasses.map(cls => (
                <Select.Option key={cls} value={cls}>
                    {cls}
                </Select.Option>
            ))}
        </Select>
    );
};

export default ClassNameSetter;
