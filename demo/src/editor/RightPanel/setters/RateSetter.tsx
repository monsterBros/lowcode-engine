import React from 'react';
import { Rate } from 'antd';

interface RateSetterProps {
    value?: number;
    onChange: (value: number) => void;
}

const RateSetter: React.FC<RateSetterProps> = ({ value = 0, onChange }) => {
    return <Rate value={value} onChange={onChange} />;
};

export default RateSetter;
