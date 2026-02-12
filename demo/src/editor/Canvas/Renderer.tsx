import React from 'react';
import { ComponentSchema } from '@/types';
import { useEditor } from '@/store/EditorContext';
import { materialRegistry } from '@/materials/registry';
import MaterialComponents from '@/materials/components';
import { generateId } from '@/utils/uuid';
import { expressionEngine } from '@/engine/ExpressionEngine';
import { findNode } from '@/utils/schema';
import { componentEventSystem } from '@/engine/ComponentEventSystem';
import { stateManager } from '@/engine/StateManager';
import { refManager } from '@/engine/RefManager';
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

    const renderNode = (node: ComponentSchema, loopContext?: any): React.ReactNode => {
        // 1. 条件渲染：如果有condition且不满足，直接返回null
        if (node.condition) {
            const context = {
                state: {},  // TODO: 从EditorContext获取state
                props: node.props,
                ...loopContext
            };
            const shouldRender = expressionEngine.parseValue(node.condition, context);
            if (!shouldRender) {
                return null;
            }
        }

        // 2. 循环渲染：如果有loop，渲染多个副本
        if (node.loop) {
            const context = {
                state: {},  // TODO: 从EditorContext获取state
                props: node.props,
                ...loopContext
            };

            // 获取数据源
            const dataSource = expressionEngine.parseValue(
                node.loop.dataSource,
                context
            );

            if (!Array.isArray(dataSource)) {
                console.warn('Loop dataSource is not an array:', dataSource);
                return null;
            }

            const itemName = node.loop.itemName || 'item';
            const indexName = node.loop.indexName || 'index';

            // 渲染每一项
            return (
                <>
                    {dataSource.map((item, index) => {
                        const newLoopContext = {
                            ...loopContext,
                            [itemName]: item,
                            [indexName]: index
                        };
                        // 递归渲染，但不带loop配置（避免无限循环）
                        const loopNode = { ...node, loop: undefined };
                        return (
                            <React.Fragment key={`${node.id}-${index}`}>
                                {renderNode(loopNode, newLoopContext)}
                            </React.Fragment>
                        );
                    })}
                </>
            );
        }

        // 3. 正常渲染
        const Component = MaterialComponents[node.componentName as keyof typeof MaterialComponents];

        if (!Component) {
            return <div>未知组件: {node.componentName}</div>;
        }

        const isSelected = selectedNodeId === node.id;
        const isContainer = materialRegistry.isContainer(node.componentName);

        // 处理事件绑定 - 使用增强的组件事件系统
        const eventProps: any = {};
        if (node.events) {

            componentEventSystem.setupComponentEvents(
                node.id,
                node.events,
                {
                    getNode: (id: string) => findNode(schema, id),
                    updateNode: updateNodeProps,
                    getState: (key: string) => stateManager.get(key),
                    setState: (key: string, value: any) => stateManager.set(key, value),
                    callRef: (id: string, method: string, ...args: any[]) =>
                        refManager.callMethod(id, method, ...args)
                }
            );

            // 为每个事件创建处理器
            Object.keys(node.events).forEach(eventName => {
                const handler = componentEventSystem.getEventHandler(node.id, eventName);
                if (handler) {
                    eventProps[eventName] = handler;
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
                        ? node.children.map((child) => renderNode(child, loopContext))
                        : null}
                </Component>
            </div>
        );

        return nodeElement;
    };

    return <div className={styles.renderer}>{renderNode(schema)}</div>;
};

export default Renderer;
