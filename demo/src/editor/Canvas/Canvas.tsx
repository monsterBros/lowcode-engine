import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useEditor } from '@/store/EditorContext';
import { ComponentSchema } from '@/types';
import { generateId } from '@/utils/uuid';
import { Switch, Space } from 'antd';
import Renderer from './Renderer';
import Simulator from './Simulator';
import styles from './Canvas.module.css';

const Canvas: React.FC = () => {
    const { schema, addNode, setSelectedNodeId, deleteNode, selectedNodeId } = useEditor();
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
            <div className={styles.canvasToolbar}>
                <Space>
                    <span>渲染模式:</span>
                    <Switch
                        checkedChildren="iframe隔离"
                        unCheckedChildren="普通渲染"
                        checked={useSimulator}
                        onChange={setUseSimulator}
                    />
                </Space>
            </div>
            <div ref={drop} className={`${styles.canvas} ${isOver ? styles.isOver : ''}`}>
                {useSimulator ? (
                    <Simulator
                        schema={schema}
                        selectedNodeId={selectedNodeId}
                        onNodeSelect={setSelectedNodeId}
                        onNodeDelete={deleteNode}
                    />
                ) : (
                    <Renderer schema={schema} />
                )}
            </div>
        </div>
    );
};

export default Canvas;
