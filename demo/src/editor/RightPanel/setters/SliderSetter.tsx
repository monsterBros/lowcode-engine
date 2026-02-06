import React from 'react';
import { Slider, InputNumber, Row, Col } from 'antd';

interface SliderSetterProps {
    value?: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

const SliderSetter: React.FC<SliderSetterProps> = ({
    value = 0,
    onChange,
    min = 0,
    max = 100,
    step = 1
}) => {
    return (
        <Row gutter={8}>
            <Col span={16}>
                <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                />
            </Col>
            <Col span={8}>
                <InputNumber
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(val) => onChange(val || 0)}
                    style={{ width: '100%' }}
                />
            </Col>
        </Row>
    );
};

export default SliderSetter;
