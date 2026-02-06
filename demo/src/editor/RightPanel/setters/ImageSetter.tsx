import React, { useState } from 'react';
import { Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ImageSetterProps {
    value?: string;
    onChange: (value: string) => void;
}

const ImageSetter: React.FC<ImageSetterProps> = ({ value = '', onChange }) => {
    const [url, setUrl] = useState(value);

    const handleUpload = (file: any) => {
        // 模拟上传，实际应该上传到服务器
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            onChange(dataUrl);
            setUrl(dataUrl);
        };
        reader.readAsDataURL(file);
        return false; // 阻止默认上传
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Input
                value={url}
                onChange={(e) => {
                    setUrl(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder="输入图片URL"
            />
            <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                accept="image/*"
            >
                <Button icon={<UploadOutlined />} block>
                    上传图片
                </Button>
            </Upload>
            {url && (
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <img
                        src={url}
                        alt="preview"
                        style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px' }}
                    />
                </div>
            )}
        </div>
    );
};

export default ImageSetter;
