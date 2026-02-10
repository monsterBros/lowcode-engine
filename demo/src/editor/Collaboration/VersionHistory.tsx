import React, { useState, useEffect } from 'react';
import { Timeline, Tag, Button, Modal, Input } from 'antd';
import { ClockCircleOutlined, RollbackOutlined, UserOutlined } from '@ant-design/icons';
import { versionManager, Version } from '@/engine/VersionManager';
import styles from './VersionHistory.module.css';

/**
 * 版本历史面板
 */
const VersionHistory: React.FC = () => {
    const [versions, setVersions] = useState<Version[]>([]);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        updateVersions();

        const unsubscribe = versionManager.subscribe(() => {
            updateVersions();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const updateVersions = () => {
        setVersions(versionManager.getAllVersions());
    };

    const handleRestore = (version: Version) => {
        Modal.confirm({
            title: '恢复版本',
            content: `确定要恢复到版本"${version.message}"吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                setRestoring(true);
                versionManager.restoreVersion(version.id);
                setRestoring(false);
            }
        });
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    };

    const currentVersion = versionManager.getCurrentVersion();

    return (
        <div className={styles.versionHistory}>
            <div className={styles.header}>
                <h3>版本历史</h3>
                <Tag color="blue">{versions.length} 个版本</Tag>
            </div>

            <Timeline
                mode="left"
                items={versions.map(version => ({
                    key: version.id,
                    color: version.id === currentVersion?.id ? 'green' : 'gray',
                    dot: <ClockCircleOutlined />,
                    label: formatTime(version.timestamp),
                    children: (
                        <div className={styles.versionItem}>
                            <div className={styles.versionInfo}>
                                <div className={styles.message}>
                                    {version.message}
                                    {version.id === currentVersion?.id && (
                                        <Tag color="green" style={{ marginLeft: 8 }}>当前</Tag>
                                    )}
                                </div>
                                <div className={styles.author}>
                                    <UserOutlined /> {version.author}
                                </div>
                            </div>
                            {version.id !== currentVersion?.id && (
                                <Button
                                    size="small"
                                    icon={<RollbackOutlined />}
                                    onClick={() => handleRestore(version)}
                                    loading={restoring}
                                >
                                    恢复
                                </Button>
                            )}
                        </div>
                    )
                }))}
            />

            {versions.length === 0 && (
                <div className={styles.empty}>
                    暂无版本历史
                </div>
            )}
        </div>
    );
};

export default VersionHistory;
