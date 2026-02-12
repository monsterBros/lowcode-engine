import React, { useState, Suspense, lazy } from 'react';
import { Button, Select, Space, Collapse, Modal, Input } from 'antd';
import { DeleteOutlined, CodeOutlined } from '@ant-design/icons';

// 动态导入Monaco，如果加载失败则使用TextArea
const MonacoEditor = lazy(() =>
    import('@monaco-editor/react').catch(() => ({
        default: ({ value, onChange }: any) => (
            <Input.TextArea
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                rows={20}
                placeholder="编辑事件代码..."
                style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
        )
    }))
);

interface EventHandler {
    type: 'JSFunction';
    value: string;
}

interface EventSetterProps {
    value?: Record<string, EventHandler>;
    onChange?: (value: Record<string, EventHandler>) => void;
}

// 事件类型定义
const EVENT_TYPES = [
    { label: 'onClick - 点击事件', value: 'onClick' },
    { label: 'onChange - 值改变', value: 'onChange' },
    { label: 'onFocus - 获得焦点', value: 'onFocus' },
    { label: 'onBlur - 失去焦点', value: 'onBlur' },
    { label: 'onMouseEnter - 鼠标进入', value: 'onMouseEnter' },
    { label: 'onMouseLeave - 鼠标离开', value: 'onMouseLeave' },
    { label: 'onSubmit - 提交事件', value: 'onSubmit' },
    { label: 'onInput - 输入事件', value: 'onInput' },
];

// 代码模板
const CODE_TEMPLATES = {
    basic: `// 基础示例
console.log('事件触发', event);
`,
    updateComponent: `// 更新其他组件
updateNode('component-id', {
  children: '新文本'
});
`,
    setState: `// 更新全局状态
const count = getState('count') || 0;
setState('count', count + 1);
`,
    callMethod: `// 调用组件方法
callRef('input-1', 'focus');
`,
    form: `// 表单提交
const formData = {
  name: getNode('name-input')?.props.value,
  email: getNode('email-input')?.props.value
};

if (!formData.name || !formData.email) {
  setState('error', '请填写完整信息');
  return;
}

setState('formData', formData);
setState('submitStatus', 'success');
`,
    api: `// API调用示例
setState('loading', true);

// 模拟API调用
setTimeout(() => {
  setState('loading', false);
  setState('data', { result: 'success' });
}, 1000);
`,
};

const EventSetter: React.FC<EventSetterProps> = ({ value = {}, onChange }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState<string | null>(null);
    const [editorCode, setEditorCode] = useState('');

    const handleAddEvent = (eventType: string) => {
        const newValue = {
            ...value,
            [eventType]: {
                type: 'JSFunction' as const,
                value: CODE_TEMPLATES.basic
            }
        };
        onChange?.(newValue);
    };

    const handleDeleteEvent = (eventType: string) => {
        const newValue = { ...value };
        delete newValue[eventType];
        onChange?.(newValue);
    };

    const handleEditEvent = (eventType: string) => {
        setEditingEvent(eventType);
        setEditorCode(value[eventType]?.value || '');
        setModalVisible(true);
    };

    const handleSaveCode = () => {
        if (editingEvent) {
            const newValue = {
                ...value,
                [editingEvent]: {
                    type: 'JSFunction' as const,
                    value: editorCode
                }
            };
            onChange?.(newValue);
        }
        setModalVisible(false);
        setEditingEvent(null);
    };

    const handleInsertTemplate = (template: string) => {
        setEditorCode(editorCode + '\n' + CODE_TEMPLATES[template as keyof typeof CODE_TEMPLATES]);
    };

    const existingEvents = Object.keys(value);
    const availableEvents = EVENT_TYPES.filter(
        e => !existingEvents.includes(e.value)
    );

    // 调试日志
    console.log('🎯 EventSetter渲染:', {
        value,
        existingEvents,
        availableEvents,
        existingEventsLength: existingEvents.length,
        availableEventsLength: availableEvents.length
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                事件管理 (已添加{existingEvents.length}个)
            </div>

            {/* 添加事件按钮 - 始终显示在最上面 */}
            <div>
                <Select
                    placeholder="➕ 添加事件"
                    style={{ width: '100%' }}
                    onChange={handleAddEvent}
                    value={undefined}
                    options={availableEvents}
                    disabled={availableEvents.length === 0}
                />
                {availableEvents.length === 0 && (
                    <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                        已添加所有可用事件
                    </div>
                )}
            </div>

            {/* 已添加的事件列表 */}
            {existingEvents.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    {existingEvents.map(eventType => (
                        <div key={eventType} style={{
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            padding: 12,
                            marginBottom: 8,
                            background: '#fafafa'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 8
                            }}>
                                <span style={{ fontWeight: 500 }}>
                                    <CodeOutlined style={{ marginRight: 8 }} />
                                    {eventType}
                                </span>
                                <Space>
                                    <Button
                                        size="small"
                                        type="link"
                                        onClick={() => handleEditEvent(eventType)}
                                    >
                                        编辑
                                    </Button>
                                    <Button
                                        size="small"
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteEvent(eventType)}
                                    />
                                </Space>
                            </div>
                            <pre style={{
                                maxHeight: 100,
                                overflow: 'auto',
                                background: '#fff',
                                padding: 8,
                                borderRadius: 4,
                                fontSize: 12,
                                margin: 0,
                                border: '1px solid #e8e8e8'
                            }}>
                                {value[eventType]?.value}
                            </pre>
                        </div>
                    ))}
                </div>
            )}

            {existingEvents.length === 0 && (
                <div style={{
                    padding: 16,
                    textAlign: 'center',
                    color: '#999',
                    background: '#fafafa',
                    borderRadius: 4,
                    fontSize: 12,
                    border: '1px dashed #d9d9d9'
                }}>
                    暂无事件，请使用上方下拉框添加
                </div>
            )}

            {/* 代码编辑器模态框 */}
            <Modal
                title={`编辑事件: ${editingEvent}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSaveCode}
                width={800}
                style={{ top: 20 }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {/* 代码模板快捷插入 */}
                    <div>
                        <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
                            快速插入模板：
                        </div>
                        <Space wrap>
                            <Button size="small" onClick={() => handleInsertTemplate('updateComponent')}>
                                更新组件
                            </Button>
                            <Button size="small" onClick={() => handleInsertTemplate('setState')}>
                                状态管理
                            </Button>
                            <Button size="small" onClick={() => handleInsertTemplate('callMethod')}>
                                调用方法
                            </Button>
                            <Button size="small" onClick={() => handleInsertTemplate('form')}>
                                表单处理
                            </Button>
                            <Button size="small" onClick={() => handleInsertTemplate('api')}>
                                API调用
                            </Button>
                        </Space>
                    </div>

                    {/* Monaco编辑器 */}
                    <div style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}>
                        <Suspense fallback={
                            <div style={{ padding: 20, textAlign: 'center' }}>
                                加载编辑器...
                            </div>
                        }>
                            <MonacoEditor
                                height="400px"
                                defaultLanguage="javascript"
                                value={editorCode}
                                onChange={(val: string) => setEditorCode(val || '')}
                                theme="vs-light"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 2,
                                }}
                            />
                        </Suspense>
                    </div>

                    {/* API提示 */}
                    <div style={{
                        background: '#f0f9ff',
                        padding: 12,
                        borderRadius: 4,
                        fontSize: 12
                    }}>
                        <div style={{ fontWeight: 500, marginBottom: 4 }}>💡 可用API：</div>
                        <div style={{ color: '#666', lineHeight: 1.8 }}>
                            • <code>event</code> - 事件对象<br />
                            • <code>updateNode(id, props)</code> - 更新组件<br />
                            • <code>getNode(id)</code> - 获取组件<br />
                            • <code>setState(key, value)</code> - 设置状态<br />
                            • <code>getState(key)</code> - 获取状态<br />
                            • <code>callRef(id, method, ...args)</code> - 调用方法<br />
                            • <code>emit(event, data)</code> - 触发组件事件<br />
                            • <code>emitGlobal(event, data)</code> - 触发全局事件
                        </div>
                    </div>
                </Space>
            </Modal>
        </div>
    );
};

export default EventSetter;
