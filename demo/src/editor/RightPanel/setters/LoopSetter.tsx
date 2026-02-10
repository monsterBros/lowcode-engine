import React, { useState } from 'react';
import { Input, Button, Row, Col } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface LoopSetterProps {
    value?: {
        dataSource: any;
        itemName?: string;
        indexName?: string;
    };
    onChange?: (value: any) => void;
}

/**
 * 循环渲染Setter
 * 用于配置组件的循环渲染
 */
const LoopSetter: React.FC<LoopSetterProps> = ({ value, onChange }) => {
    const [enabled, setEnabled] = useState(!!value);

    const handleEnable = () => {
        setEnabled(true);
        onChange?.({
            dataSource: {
                type: 'JSExpression',
                value: 'state.list'
            },
            itemName: 'item',
            indexName: 'index'
        });
    };

    const handleDisable = () => {
        setEnabled(false);
        onChange?.(undefined);
    };

    const handleDataSourceChange = (expr: string) => {
        onChange?.({
            ...value,
            dataSource: {
                type: 'JSExpression',
                value: expr
            }
        });
    };

    const handleItemNameChange = (name: string) => {
        onChange?.({
            ...value,
            itemName: name || 'item'
        });
    };

    const handleIndexNameChange = (name: string) => {
        onChange?.({
            ...value,
            indexName: name || 'index'
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
                设置循环渲染
            </Button>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row gutter={8} align="middle">
                <Col flex="auto">
                    <Input
                        value={value?.dataSource?.value || ''}
                        onChange={(e) => handleDataSourceChange(e.target.value)}
                        placeholder="数据源表达式，如：state.items"
                        addonBefore="数据源"
                    />
                </Col>
                <Col>
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDisable}
                    />
                </Col>
            </Row>
            <Row gutter={8}>
                <Col span={12}>
                    <Input
                        value={value?.itemName || 'item'}
                        onChange={(e) => handleItemNameChange(e.target.value)}
                        placeholder="item"
                        addonBefore="项变量"
                    />
                </Col>
                <Col span={12}>
                    <Input
                        value={value?.indexName || 'index'}
                        onChange={(e) => handleIndexNameChange(e.target.value)}
                        placeholder="index"
                        addonBefore="索引变量"
                    />
                </Col>
            </Row>
        </div>
    );
};

export default LoopSetter;
