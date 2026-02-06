import React from 'react';
import { TimePicker } from 'antd';
import moment from 'moment';

interface TimeSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

const TimeSetter: React.FC<TimeSetterProps> = ({ value, onChange }) => {
    return (
        <TimePicker
            value={value ? moment(value, 'HH:mm:ss') : undefined}
            onChange={(time) => onChange(time ? time.format('HH:mm:ss') : '')}
            style={{ width: '100%' }}
        />
    );
};

export default TimeSetter;
