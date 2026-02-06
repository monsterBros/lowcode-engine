import React, { useState } from 'react';
import { Select, Input } from 'antd';
import * as Icons from '@ant-design/icons';

interface IconSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

// 常用图标列表
const commonIcons = [
    'HomeOutlined', 'UserOutlined', 'SettingOutlined', 'SearchOutlined',
    'PlusOutlined', 'DeleteOutlined', 'EditOutlined', 'SaveOutlined',
    'CloseOutlined', 'CheckOutlined', 'StarOutlined', 'HeartOutlined',
    'DownloadOutlined', 'UploadOutlined', 'FileOutlined', 'FolderOutlined',
];

const IconSetter: React.FC<IconSetterProps> = ({ value = 'StarOutlined', onChange }) => {
    const [searchText, setSearchText] = useState('');

    const filteredIcons = commonIcons.filter(icon =>
        icon.toLowerCase().includes(searchText.toLowerCase())
    );

    const IconComponent = value ? (Icons as any)[value] : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Input
                placeholder="搜索图标"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
                value={value}
                onChange={onChange}
                showSearch
                style={{ width: '100%' }}
            >
                {filteredIcons.map(icon => {
                    const Icon = (Icons as any)[icon];
                    return (
                        <Select.Option key={icon} value={icon}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {Icon && <Icon />}
                                <span>{icon}</span>
                            </div>
                        </Select.Option>
                    );
                })}
            </Select>
            {IconComponent && (
                <div style={{ textAlign: 'center', padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <IconComponent style={{ fontSize: '32px' }} />
                </div>
            )}
        </div>
    );
};

export default IconSetter;
