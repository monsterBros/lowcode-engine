import React from 'react';
import { Input, Button, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface Slot {
    name: string;
    title: string;
    description?: string;
}

interface SlotSetterProps {
    value?: Slot[];
    onChange?: (value: Slot[]) => void;
}

/**
 * 插槽配置Setter
 * 用于配置组件的插槽
 */
const SlotSetter: React.FC<SlotSetterProps> = ({ value = [], onChange }) => {
    const handleAdd = () => {
        const newSlot: Slot = {
            name: `slot${value.length + 1}`,
            title: '新插槽',
            description: ''
        };
        onChange?.([...value, newSlot]);
    };

    const handleDelete = (index: number) => {
        const newValue = value.filter((_, i) => i !== index);
        onChange?.(newValue);
    };

    const handleChange = (index: number, field: keyof Slot, val: string) => {
        const newValue = [...value];
        newValue[index] = { ...newValue[index], [field]: val };
        onChange?.(newValue);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {value.map((slot, index) => (
                <div
                    key={index}
                    style={{
                        padding: 12,
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        backgroundColor: '#fafafa'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8
                    }}>
                        <span style={{ fontWeight: 500, fontSize: 12, color: '#666' }}>
                            插槽 {index + 1}
                        </span>
                        <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(index)}
                        />
                    </div>

                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>名称</div>
                        <Input
                            value={slot.name}
                            onChange={(e) => handleChange(index, 'name', e.target.value)}
                            placeholder="插槽名称（英文）"
                            size="small"
                        />
                    </div>

                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>显示名</div>
                        <Input
                            value={slot.title}
                            onChange={(e) => handleChange(index, 'title', e.target.value)}
                            placeholder="插槽显示名称"
                            size="small"
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 12, marginBottom: 4 }}>描述</div>
                        <Input.TextArea
                            value={slot.description}
                            onChange={(e) => handleChange(index, 'description', e.target.value)}
                            placeholder="插槽描述"
                            size="small"
                            rows={2}
                        />
                    </div>
                </div>
            ))}

            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                block
            >
                添加插槽
            </Button>

            {value.length === 0 && (
                <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: 8 }}>
                    暂无插槽配置
                </div>
            )}
        </div>
    );
};

export default SlotSetter;
