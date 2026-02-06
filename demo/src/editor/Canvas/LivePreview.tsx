import React, { useState } from 'react';
import { Button, Space, Select } from 'antd';
import { MobileOutlined, TabletOutlined, DesktopOutlined } from '@ant-design/icons';
import { ComponentSchema } from '@/types';
import Renderer from './Renderer';
import Simulator from './Simulator';
import styles from './LivePreview.module.css';

interface LivePreviewProps {
    schema: ComponentSchema;
    selectedNodeId?: string | null;
    onNodeSelect?: (nodeId: string) => void;
    onNodeDelete?: (nodeId: string) => void;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const deviceSizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
};

const LivePreview: React.FC<LivePreviewProps> = (props) => {
    const [device, setDevice] = useState<DeviceType>('desktop');
    const [zoom, setZoom] = useState(100);
    const [useIframe, setUseIframe] = useState(false);

    const currentSize = deviceSizes[device];
    const scale = zoom / 100;

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <Space>
                    <Button
                        icon={<MobileOutlined />}
                        type={device === 'mobile' ? 'primary' : 'default'}
                        onClick={() => setDevice('mobile')}
                    >
                        手机
                    </Button>
                    <Button
                        icon={<TabletOutlined />}
                        type={device === 'tablet' ? 'primary' : 'default'}
                        onClick={() => setDevice('tablet')}
                    >
                        平板
                    </Button>
                    <Button
                        icon={<DesktopOutlined />}
                        type={device === 'desktop' ? 'primary' : 'default'}
                        onClick={() => setDevice('desktop')}
                    >
                        桌面
                    </Button>
                    <Select
                        value={zoom}
                        onChange={setZoom}
                        style={{ width: 100 }}
                        options={[
                            { label: '50%', value: 50 },
                            { label: '75%', value: 75 },
                            { label: '100%', value: 100 },
                            { label: '125%', value: 125 },
                            { label: '150%', value: 150 },
                        ]}
                    />
                    <Button
                        type={useIframe ? 'primary' : 'default'}
                        onClick={() => setUseIframe(!useIframe)}
                    >
                        {useIframe ? 'iframe隔离' : '普通渲染'}
                    </Button>
                </Space>
            </div>
            <div className={styles.previewArea}>
                <div
                    className={styles.device}
                    style={{
                        width: currentSize.width,
                        height: currentSize.height,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                    }}
                >
                    {useIframe ? (
                        <Simulator {...props} />
                    ) : (
                        <div className={styles.normalRenderer}>
                            <Renderer schema={props.schema} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LivePreview;
