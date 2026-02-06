import React, { useState } from 'react';
import { Button, Form, Input, Select, Space, message, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { dataSourceManager, DataSource } from '@/engine/DataSourceManager';
import styles from './DataSourcePanel.module.css';

const { Panel } = Collapse;

const DataSourcePanel: React.FC = () => {
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = () => {
        const newSource: DataSource = {
            id: `ds_${Date.now()}`,
            name: '新数据源',
            type: 'static',
            config: { data: null },
        };
        dataSourceManager.register(newSource);
        setDataSources([...dataSources, newSource]);
        setEditingId(newSource.id);
    };

    const handleDelete = (id: string) => {
        dataSourceManager.remove(id);
        setDataSources(dataSources.filter(ds => ds.id !== id));
    };

    const handleLoad = async (id: string) => {
        try {
            await dataSourceManager.load(id);
            message.success('数据加载成功');
        } catch (error) {
            message.error('数据加载失败');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>数据源管理</div>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    新增
                </Button>
            </div>
            <div className={styles.content}>
                {dataSources.length === 0 ? (
                    <div className={styles.empty}>暂无数据源，点击新增创建</div>
                ) : (
                    <Collapse>
                        {dataSources.map(ds => (
                            <Panel
                                key={ds.id}
                                header={
                                    <div className={styles.panelHeader}>
                                        <span>{ds.name}</span>
                                        <Space size="small" onClick={e => e.stopPropagation()}>
                                            <Button
                                                size="small"
                                                icon={<ReloadOutlined />}
                                                onClick={() => handleLoad(ds.id)}
                                            />
                                            <Button
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDelete(ds.id)}
                                            />
                                        </Space>
                                    </div>
                                }
                            >
                                <Form layout="vertical" size="small">
                                    <Form.Item label="数据源名称">
                                        <Input value={ds.name} placeholder="数据源名称" />
                                    </Form.Item>
                                    <Form.Item label="类型">
                                        <Select
                                            value={ds.type}
                                            options={[
                                                { label: 'API', value: 'api' },
                                                { label: '静态数据', value: 'static' },
                                                { label: '变量', value: 'variable' },
                                            ]}
                                        />
                                    </Form.Item>
                                    {ds.type === 'api' && (
                                        <>
                                            <Form.Item label="URL">
                                                <Input placeholder="https://api.example.com/data" />
                                            </Form.Item>
                                            <Form.Item label="请求方法">
                                                <Select
                                                    value="GET"
                                                    options={[
                                                        { label: 'GET', value: 'GET' },
                                                        { label: 'POST', value: 'POST' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </>
                                    )}
                                    {ds.type === 'static' && (
                                        <Form.Item label="静态数据（JSON）">
                                            <Input.TextArea
                                                rows={4}
                                                placeholder='{"key": "value"}'
                                            />
                                        </Form.Item>
                                    )}
                                </Form>
                            </Panel>
                        ))}
                    </Collapse>
                )}
            </div>
        </div>
    );
};

export default DataSourcePanel;
