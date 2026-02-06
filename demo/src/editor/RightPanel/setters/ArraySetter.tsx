import React, { useState } from 'react';
import { Button, Space, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface ArraySetterProps {
    value?: any[];
    onChange: (value: any[]) => void;
}

const ArraySetter: React.FC<ArraySetterProps> = ({ value = [], onChange }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (newItem.trim()) {
            onChange([...value, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemove = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, newValue: string) => {
        const updated = [...value];
        updated[index] = newValue;
        onChange(updated);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {value.map((item, index) => (
                <Space key={index} style={{ width: '100%' }}>
                    <Input
                        value={item}
                        onChange={(e) => handleChange(index, e.target value)}
                        style={{ flex: 1 }}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(index)}
                    />
                </Space>
            ))}
            <Space.Compact style={{ width: '100%' }}>
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onPressEnter={handleAdd}
                    placeholder="添加新项"
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    添加
                </Button>
            </Space.Compact>
        </div>
    );
};

export default ArraySetter;
