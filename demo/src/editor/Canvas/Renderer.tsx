import React from 'react';
import { ComponentSchema } from '@/types';
import { useEditor } from '@/store/EditorContext';
import { materialRegistry } from '@/materials/registry';
import MaterialComponents from '@/materials/components';
import { generateId } from '@/utils/uuid';
import styles from './Renderer.module.css';

interface RendererProps {
    schema: ComponentSchema;
}

const Renderer: React.FC<RendererProps> = ({ schema }) => {
    const { selectedNodeId, setSelectedNodeId, deleteNode, addNode } = useEditor();

    const handleClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedNodeId(id);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteNode(id);
    };

    // 处理嵌套容器的拖放
    const handleDropToContainer = (containerId: string, material: any) => {
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

        // 添加到指定容器
        addNode(containerId, newNode);
    };

    const renderNode = (node: ComponentSchema): React.ReactNode => {
        const Component = MaterialComponents[node.componentName as keyof typeof MaterialComponents];

        if (!Component) {
            return <div>未知组件: {node.componentName}</div>;
        }

        const isSelected = selectedNodeId === node.id;
        const isContainer = materialRegistry.isContainer(node.componentName);

        // 处理事件绑定
        const eventProps: any = {};
        if (node.events) {
            Object.keys(node.events).forEach(eventName => {
                const handler = node.events![eventName];
                if (handler.type === 'JSFunction') {
                    try {
                        // 执行用户定义的函数
                        eventProps[eventName] = new Function('return ' + handler.value)();
                    } catch (e) {
                        console.error(`Event handler error for ${eventName}:`, e);
                    }
                }
            });
        }

        // 容器组件额外的props
        const containerProps = isContainer ? {
            nodeId: node.id,
            onDropChild: handleDropToContainer
        } : {};

        const nodeElement = (
            <div
                key={node.id}
                className={`${styles.node} ${isSelected ? styles.selected : ''}`}
                onClick={(e) => handleClick(e, node.id)}
            >
                {isSelected && node.id !== 'root' && (
                    <div className={styles.toolbar}>
                        <button
                            className={styles.deleteBtn}
                            onClick={(e) => handleDelete(e, node.id)}
                        >
                            ✕
                        </button>
                    </div>
                )}
                <Component {...node.props} {...eventProps} {...containerProps}>
                    {isContainer && node.children && node.children.length > 0
                        ? node.children.map((child) => renderNode(child))
                        : null}
                </Component>
            </div>
        );

        return nodeElement;
    };

    return <div className={styles.renderer}>{renderNode(schema)}</div>;
};

export default Renderer;
