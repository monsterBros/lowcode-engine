import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

interface DateSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

const DateSetter: React.FC<DateSetterProps> = ({ value, onChange }) => {
    return (
        <DatePicker
            value={value ? moment(value) : undefined}
            onChange={(date) => onChange(date ? date.format('YYYY-MM-DD') : '')}
            style={{ width: '100%' }}
        />
    );
};

export default DateSetter;
