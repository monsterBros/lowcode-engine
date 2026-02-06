import React, { useState } from 'react';
import { Modal, Input, Button, message, Spin } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { materialLoader } from '@/materials/registry/MaterialLoader';
import styles from './MaterialMarket.module.css';

const { TextArea } = Input;

/**
 * 物料市场 - 支持远程加载物料
 */
const MaterialMarket: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [assetsUrl, setAssetsUrl] = useState('');
    const [assetsJson, setAssetsJson] = useState('');

    // 从URL加载
    const handleLoadFromUrl = async () => {
        if (!assetsUrl.trim()) {
            message.warning('请输入 Assets URL');
            return;
        }

        setLoading(true);
        try {
            await materialLoader.loadFromUrl(assetsUrl);
            message.success('物料加载成功！');
            setVisible(false);
            setAssetsUrl('');
        } catch (error) {
            message.error('物料加载失败: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // 从JSON加载
    const handleLoadFromJson = async () => {
        if (!assetsJson.trim()) {
            message.warning('请输入 Assets JSON');
            return;
        }

        setLoading(true);
        try {
            const assets = JSON.parse(assetsJson);
            await materialLoader.loadAssets(assets);
            message.success('物料加载成功！');
            setVisible(false);
            setAssetsJson('');
        } catch (error) {
            message.error('物料加载失败: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    // 示例Assets JSON
    const exampleAssets = {
        version: '1.0.0',
        packages: [],
        components: [
            {
                componentName: 'Text',
                title: '文本',
                icon: '📝',
                category: '基础组件',
                description: '文本展示组件',
                props: [
                    {
                        name: 'content',
                        title: '文本内容',
                        type: 'string',
                        defaultValue: 'Hello World',
                        setter: { componentName: 'StringSetter' }
                    }
                ]
            }
        ]
    };

    return (
        <>
            <div className={styles.trigger}>
                <Button
                    type="dashed"
                    icon={<CloudDownloadOutlined />}
                    onClick={() => setVisible(true)}
                    block
                >
                    加载远程物料
                </Button>
            </div>

            <Modal
                title="物料市场"
                open={visible}
                onCancel={() => setVisible(false)}
                footer={null}
                width={600}
            >
                <Spin spinning={loading}>
                    <div className={styles.content}>
                        <div className={styles.section}>
                            <h4>📡 从 URL 加载</h4>
                            <Input
                                placeholder="输入 Assets JSON URL"
                                value={assetsUrl}
                                onChange={e => setAssetsUrl(e.target.value)}
                                onPressEnter={handleLoadFromUrl}
                            />
                            <Button
                                type="primary"
                                onClick={handleLoadFromUrl}
                                style={{ marginTop: 8 }}
                            >
                                加载
                            </Button>
                        </div>

                        <div className={styles.divider}>或</div>

                        <div className={styles.section}>
                            <h4>📄 从 JSON 加载</h4>
                            <TextArea
                                rows={10}
                                placeholder="粘贴 Assets JSON"
                                value={assetsJson}
                                onChange={e => setAssetsJson(e.target.value)}
                            />
                            <Button
                                type="primary"
                                onClick={handleLoadFromJson}
                                style={{ marginTop: 8 }}
                            >
                                加载
                            </Button>
                        </div>

                        <div className={styles.example}>
                            <h4>💡 示例 Assets JSON</h4>
                            <pre>{JSON.stringify(exampleAssets, null, 2)}</pre>
                            <Button
                                size="small"
                                onClick={() => setAssetsJson(JSON.stringify(exampleAssets, null, 2))}
                            >
                                使用示例
                            </Button>
                        </div>
                    </div>
                </Spin>
            </Modal>
        </>
    );
};

export default MaterialMarket;
