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
            <div ref={drop} className={`${styles.canvas} ${isOver ? styles.isOver : ''}`}>
                {useSimulator ? (
                    // iframe隔离模式 - 完全隔离的渲染环境
                    <Simulator
                        schema={schema}
                        selectedNodeId={selectedNodeId}
                        onNodeSelect={setSelectedNodeId}
                        onNodeDelete={deleteNode}
                    />
                ) : (
                    // 普通渲染模式 - 直接渲染，支持拖拽
                    <Renderer schema={schema} />
                )}
            </div>
        </div>
    );
};

export default Canvas;
