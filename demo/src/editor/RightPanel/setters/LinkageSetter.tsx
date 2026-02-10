import React, { useState } from 'react';
import { Input, Button, Row, Col, Select } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface LinkageRule {
    targetProp: string;      // 目标属性
    condition: string;       // 条件表达式
    value: any;             // 满足条件时的值
}

interface LinkageSetterProps {
    value?: LinkageRule[];
    onChange?: (value: LinkageRule[]) => void;
    availableProps?: string[];  // 可用的属性列表
}

/**
 * 属性联动Setter
 * 用于配置属性之间的联动关系
 */
const LinkageSetter: React.FC<LinkageSetterProps> = ({
    value = [],
    onChange,
    availableProps = []
}) => {
    const handleAdd = () => {
        const newRule: LinkageRule = {
            targetProp: availableProps[0] || '',
            condition: 'true',
            value: ''
        };
        onChange?.([...value, newRule]);
    };

    const handleDelete = (index: number) => {
        const newValue = value.filter((_, i) => i !== index);
        onChange?.(newValue);
    };

    const handleChange = (index: number, field: keyof LinkageRule, val: any) => {
        const newValue = [...value];
        newValue[index] = { ...newValue[index], [field]: val };
        onChange?.(newValue);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {value.map((rule, index) => (
                <div key={index} style={{
                    padding: 12,
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    backgroundColor: '#fafafa'
                }}>
                    <Row gutter={8} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={20}>
                            <div style={{ fontWeight: 500, fontSize: 12, color: '#666' }}>
                                联动规则 {index + 1}
                            </div>
                        </Col>
                        <Col span={4} style={{ textAlign: 'right' }}>
                            <Button
                                type="text"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(index)}
                            />
                        </Col>
                    </Row>

                    <Row gutter={8} style={{ marginBottom: 8 }}>
                        <Col span={24}>
                            <div style={{ fontSize: 12, marginBottom: 4 }}>目标属性</div>
                            {availableProps.length > 0 ? (
                                <Select
                                    value={rule.targetProp}
                                    onChange={(val) => handleChange(index, 'targetProp', val)}
                                    style={{ width: '100%' }}
                                    size="small"
                                >
                                    {availableProps.map(prop => (
                                        <Select.Option key={prop} value={prop}>{prop}</Select.Option>
                                    ))}
                                </Select>
                            ) : (
                                <Input
                                    value={rule.targetProp}
                                    onChange={(e) => handleChange(index, 'targetProp', e.target.value)}
                                    placeholder="属性名"
                                    size="small"
                                />
                            )}
                        </Col>
                    </Row>

                    <Row gutter={8} style={{ marginBottom: 8 }}>
                        <Col span={24}>
                            <div style={{ fontSize: 12, marginBottom: 4 }}>条件（JSExpression）</div>
                            <Input
                                value={rule.condition}
                                onChange={(e) => handleChange(index, 'condition', e.target.value)}
                                placeholder="如：props.type === 'primary'"
                                size="small"
                            />
                        </Col>
                    </Row>

                    <Row gutter={8}>
                        <Col span={24}>
                            <div style={{ fontSize: 12, marginBottom: 4 }}>联动值</div>
                            <Input
                                value={rule.value}
                                onChange={(e) => handleChange(index, 'value', e.target.value)}
                                placeholder="满足条件时的值"
                                size="small"
                            />
                        </Col>
                    </Row>
                </div>
            ))}

            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                block
            >
                添加联动规则
            </Button>

            {value.length === 0 && (
                <div style={{ fontSize: 12, color: '#999', textAlign: 'center', padding: 8 }}>
                    暂无联动规则
                </div>
            )}
        </div>
    );
};

export default LinkageSetter;
