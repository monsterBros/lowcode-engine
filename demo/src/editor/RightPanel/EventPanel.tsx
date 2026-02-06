import React from 'react';
import { Form, Input, Tabs, Collapse } from 'antd';
import { useEditor } from '@/store/EditorContext';
import { findNode } from '@/utils/schema';
import styles from './EventPanel.module.css';

const { Panel } = Collapse;
const { TextArea } = Input;

/**
 * 事件配置面板 - 为组件配置事件处理器
 */
const EventPanel: React.FC = () => {
    const { schema, selectedNodeId, updateNodeProps } = useEditor();

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

    const handleEventChange = (eventName: string, code: string) => {
        const events = selectedNode.events || {};
        updateNodeProps(selectedNodeId, {
            events: {
                ...events,
                [eventName]: {
                    type: 'JSFunction',
                    value: code
                }
            }
        });
    };

    // 常用事件列表
    const commonEvents = [
        { name: 'onClick', label: '点击事件', placeholder: 'function() { console.log("clicked"); }' },
        { name: 'onChange', label: '变更事件', placeholder: 'function(e) { console.log(e.target.value); }' },
        { name: 'onFocus', label: '聚焦事件', placeholder: 'function() { console.log("focused"); }' },
        { name: 'onBlur', label: '失焦事件', placeholder: 'function() { console.log("blurred"); }' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>事件配置</div>
            </div>
            <div className={styles.content}>
                <Collapse defaultActiveKey={['common']} ghost>
                    <Panel header="常用事件" key="common">
                        <Form layout="vertical" size="small">
                            {commonEvents.map(event => (
                                <Form.Item
                                    key={event.name}
                                    label={event.label}
                                >
                                    <TextArea
                                        rows={4}
                                        placeholder={event.placeholder}
                                        value={selectedNode.events?.[event.name]?.value || ''}
                                        onChange={e => handleEventChange(event.name, e.target.value)}
                                    />
                                </Form.Item>
                            ))}
                        </Form>
                    </Panel>
                </Collapse>

                <div className={styles.help}>
                    <h4>💡 使用提示</h4>
                    <ul>
                        <li>事件处理函数使用 JavaScript 编写</li>
                        <li>函数会在运行时动态执行</li>
                        <li>可以使用闭包访问外部变量</li>
                        <li>示例: <code>function() {'{'} alert('Hello!'); {'}'}</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EventPanel;
