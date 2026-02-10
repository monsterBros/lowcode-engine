import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useEditor } from '@/store/EditorContext';
import { ComponentSchema } from '@/types';
import { generateId } from '@/utils/uuid';
import { Switch, Space, Tooltip, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import Renderer from './Renderer';
import Simulator from './Simulator';
import styles from './Canvas.module.css';

/**
 * Canvas - 画布组件
 * 
 * 支持两种渲染模式：
 * 1. 普通渲染模式（Normal）- 直接渲染，支持拖拽，但可能有样式污染
 * 2. iframe隔离模式（Iframe）- 完全隔离，防止样式污染，模拟真实环境
 */
const Canvas: React.FC = () => {
    const { schema, addNode, setSelectedNodeId, deleteNode, selectedNodeId } = useEditor();

    // 渲染模式：'normal' 或 'iframe'
    const [useSimulator, setUseSimulator] = useState(false);

    const [{ isOver }, drop] = useDrop({
        accept: 'MATERIAL',
        drop: (item: any) => {
            const { material } = item;

            // 创建新节点，使用物料的默认props
            const defaultProps: Record<string, any> = {};
            material.props.forEach((prop: any) => {
                if (prop.defaultValue !== undefined) {
                    defaultProps[prop.name] = prop.defaultValue;
                }
            });

            const newNode: ComponentSchema = {
                id: generateId(),
                componentName: material.componentName,
                props: defaultProps,
                children: material.configure?.component?.isContainer ? [] : undefined,
            };

            // 添加到根节点
            addNode('root', newNode);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });

    return (
        <div className={styles.canvasWrapper}>
            {/* 渲染模式切换工具栏 */}
            <div className={styles.canvasToolbar}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <Space>
                        <span style={{ fontWeight: 500 }}>渲染模式:</span>
                        <Switch
                            checkedChildren="iframe隔离"
                            unCheckedChildren="普通渲染"
                            checked={useSimulator}
                            onChange={setUseSimulator}
                        />
                        <Tooltip title="点击查看两种模式的区别说明">
                            <InfoCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                        </Tooltip>
                    </Space>

                    {/* 模式说明 */}
                    {useSimulator ? (
                        <Alert
                            message="iframe隔离模式"
                            description="页面在独立iframe中渲染，完全隔离样式和脚本，防止污染编辑器。适合真实预览。"
                            type="info"
                            showIcon
                            closable
                        />
                    ) : (
                        <Alert
                            message="普通渲染模式"
                            description="直接在主窗口渲染，支持完整的拖拽编辑功能。但全局样式可能影响编辑器UI。"
                            type="success"
                            showIcon
                            closable
                        />
                    )}
                </Space>
            </div>

            {/* 画布区域 */}
            <div
                ref={drop}
                className={`${styles.canvas} ${isOver ? styles.isOver : ''}`}
                style={{
                    position: 'relative',
                }}
            >
                {useSimulator ? (
                    <>
                        {/* iframe隔离模式 - 完全隔离的渲染环境 */}
                        <Simulator
                            schema={schema}
                            selectedNodeId={selectedNodeId}
                            onNodeSelect={setSelectedNodeId}
                            onNodeDelete={deleteNode}
                        />

                        {/* 
                            关键：拖拽时的透明覆盖层
                            
                            问题：iframe会阻挡外层的drop事件
                            解决：拖拽时在iframe上方显示一个透明div来接收drop
                            
                            原理：
                            - isOver=true时显示
                            - 完全覆盖iframe
                            - 透明但能接收drop事件
                            - drop事件由外层div的ref={drop}处理
                        */}
                        {isOver && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(24, 144, 255, 0.1)',
                                border: '2px dashed #1890ff',
                                zIndex: 1000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                color: '#1890ff',
                                fontWeight: 600,
                            }}>
                                🎯 松开鼠标添加组件到页面
                            </div>
                        )}
                    </>
                ) : (
                    // 普通渲染模式 - 直接渲染，支持拖拽
                    <Renderer schema={schema} />
                )}
            </div>
        </div>
    );
};

export default Canvas;
