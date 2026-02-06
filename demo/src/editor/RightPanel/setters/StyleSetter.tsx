import React, { useState } from 'react';
import { Input, Row, Col, Button, Select } from 'antd';

interface StyleSetterProps {
    value?: React.CSSProperties;
    onChange: (value: React.CSSProperties) => void;
}

const StyleSetter: React.FC<StyleSetterProps> = ({ value = {}, onChange }) => {
    const commonStyles = [
        { name: 'width', label: '宽度', type: 'text' },
        { name: 'height', label: '高度', type: 'text' },
        { name: 'margin', label: '外边距', type: 'text' },
        { name: 'padding', label: '内边距', type: 'text' },
        { name: 'backgroundColor', label: '背景色', type: 'color' },
        { name: 'color', label: '文字色', type: 'color' },
        { name: 'fontSize', label: '字号', type: 'text' },
        { name: 'fontWeight', label: '字重', type: 'select', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
        { name: 'textAlign', label: '对齐', type: 'select', options: ['left', 'center', 'right', 'justify'] },
        { name: 'display', label: '显示', type: 'select', options: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] },
    ];

    const handleChange = (styleName: string, styleValue: any) => {
        onChange({ ...value, [styleName]: styleValue });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {commonStyles.map((style) => (
                <Row key={style.name} gutter={8} align="middle">
                    <Col span={8}>
                        <label style={{ fontSize: '12px' }}>{style.label}</label>
                    </Col>
                    <Col span={16}>
                        {style.type === 'color' ? (
                            <input
                                type="color"
                                value={value[style.name as keyof React.CSSProperties] as string || '#000000'}
                                onChange={(e) => handleChange(style.name, e.target.value)}
                                style={{ width: '100%', height: '32px' }}
                            />
                        ) : style.type === 'select' ? (
                            <Select
                                value={value[style.name as keyof React.CSSProperties] as string}
                                onChange={(val) => handleChange(style.name, val)}
                                style={{ width: '100%' }}
                                options={style.options?.map(opt => ({ label: opt, value: opt }))}
                            />
                        ) : (
                            <Input
                                value={value[style.name as keyof React.CSSProperties] as string}
                                onChange={(e) => handleChange(style.name, e.target.value)}
                                placeholder="auto"
                                size="small"
                            />
                        )}
                    </Col>
                </Row>
            ))}
        </div>
    );
};

export default StyleSetter;
