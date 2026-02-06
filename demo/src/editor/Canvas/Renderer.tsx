import React from 'react';
import { ComponentSchema } from '@/types';
import { useEditor } from '@/store/EditorContext';
import { materialRegistry } from '@/materials/registry';
import MaterialComponents from '@/materials/components';
import styles from './Renderer.module.css';

interface RendererProps {
    schema: ComponentSchema;
}

const Renderer: React.FC<RendererProps> = ({ schema }) => {
    const { selectedNodeId, setSelectedNodeId, deleteNode } = useEditor();

    const handleClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedNodeId(id);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteNode(id);
    };

    const renderNode = (node: ComponentSchema): React.ReactNode => {
        const Component = MaterialComponents[node.componentName as keyof typeof MaterialComponents];

        if (!Component) {
            return <div>未知组件: {node.componentName}</div>;
        }

        const isSelected = selectedNodeId === node.id;
        const isContainer = materialRegistry.isContainer(node.componentName);

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
                <Component {...node.props}>
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
