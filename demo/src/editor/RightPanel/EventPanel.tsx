import React, { useState } from 'react';
import { message } from 'antd';
import { useEditor } from '@/store/EditorContext';
import { findNode } from '@/utils/schema';
import { materialRegistry } from '@/materials/registry';
import { eventValidator, VALIDATED_EVENTS } from '@/engine/EventValidator';
import { Form, Input, Select, Button, Space, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './EventPanel.module.css';

const { TextArea } = Input;

const EventPanel: React.FC = () => {
    const { schema, selectedNodeId, updateNodeProps } = useEditor();
    const [customEventName, setCustomEventName] = useState('');
    const [validationError, setValidationError] = useState('');

    if (!selectedNodeId) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>请选择一个组件配置事件</div>
            </div>
        );
    }

    const selectedNode = findNode(schema, selectedNodeId);
    if (!selectedNode) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>未找到选中的组件</div>
            </div>
        );
    }

    const material = materialRegistry.getMaterial(selectedNode.componentName);
    const events = selectedNode.events || {};
    const eventNames = Object.keys(events);

    const handleEventChange = (eventName: string, code: string) => {
        // 验证事件处理器代码
        const validation = eventValidator.validateHandler(code);
        if (!validation.valid) {
            setValidationError(validation.error || '');
            message.error(validation.error);
            return;
        }

        setValidationError('');

        const updatedEvents = {
            ...events,
            [eventName]: {
                type: 'JSFunction',
                value: code,
            },
        };

        updateNodeProps(selectedNodeId, { events: updatedEvents });
        message.success(`事件 ${eventName} 已更新`);
    };

    const handleAddCustomEvent = () => {
        if (!customEventName.trim()) {
            message.warning('请输入事件名称');
            return;
        }

        // 验证事件名称
        const validation = eventValidator.validateEventName(customEventName);
        if (!validation.valid) {
            message.error(validation.error);
            return;
        }

        if (events[customEventName]) {
            message.warning('该事件已存在');
            return;
        }

        const updatedEvents = {
            ...events,
            [customEventName]: {
                type: 'JSFunction',
                value: 'function(event) {\n  console.log(event);\n}',
            },
        };

        updateNodeProps(selectedNodeId, { events: updatedEvents });
        setCustomEventName('');
        message.success(`事件 ${customEventName} 已添加`);
    };

    const handleDeleteEvent = (eventName: string) => {
        const updatedEvents = { ...events };
        delete updatedEvents[eventName];
        updateNodeProps(selectedNodeId, { events: updatedEvents });
        message.success(`事件 ${eventName} 已删除`);
    };

    // 标准事件列表
    const standardEvents = Object.values(VALIDATED_EVENTS);
    const unusedStandardEvents = standardEvents.filter(e => !events[e]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>事件配置</div>
                <div className={styles.subtitle}>{material?.title || selectedNode.componentName}</div>
            </div>

            {validationError && (
                <Alert
                    message="验证错误"
                    description={validationError}
                    type="error"
                    closable
                    onClose={() => setValidationError('')}
                    style={{ margin: '12px 16px' }}
                />
            )}

            <div className={styles.content}>
                {/* 快速添加标准事件 */}
                {unusedStandardEvents.length > 0 && (
                    <Form.Item label="快速添加">
                        <Select
                            placeholder="选择标准事件"
                            options={unusedStandardEvents.map(e => ({ label: e, value: e }))}
                            onChange={(value) => {
                                const updatedEvents = {
                                    ...events,
                                    [value]: {
                                        type: 'JSFunction',
                                        value: 'function(event) {\n  console.log(event);\n}',
                                    },
                                };
                                updateNodeProps(selectedNodeId, { events: updatedEvents });
                            }}
                        />
                    </Form.Item>
                )}

                {/* 自定义事件 */}
                <Form.Item label="自定义事件">
                    <Space.Compact style={{ width: '100%' }}>
                        <Input
                            placeholder="事件名称(如：onClick)"
                            value={customEventName}
                            onChange={(e) => setCustomEventName(e.target.value)}
                            onPressEnter={handleAddCustomEvent}
                        />
                        <Button icon={<PlusOutlined />} onClick={handleAddCustomEvent}>
                            添加
                        </Button>
                    </Space.Compact>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        💡 事件名称必须以"on"开头，使用驼峰命名
                    </div>
                </Form.Item>

                {/* 已配置的事件列表 */}
                {eventNames.length === 0 ? (
                    <div className={styles.empty}>暂无事件配置</div>
                ) : (
                    eventNames.map((eventName) => (
                        <Form.Item key={eventName} label={eventName}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <TextArea
                                    rows={6}
                                    value={events[eventName].value}
                                    onChange={(e) => handleEventChange(eventName, e.target.value)}
                                    placeholder="function(event) { ... }"
                                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                />
                                <Button
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteEvent(eventName)}
                                >
                                    删除
                                </Button>
                            </Space>
                        </Form.Item>
                    ))
                )}
            </div>
        </div>
    );
};

export default EventPanel;
