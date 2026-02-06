import React, { useState } from 'react';
import { ComponentSchema } from '@/types';
import { useEditor } from '@/store/EditorContext';
import { materialRegistry } from '@/materials/registry';
import styles from './TreeNode.module.css';

interface TreeNodeProps {
    node: ComponentSchema;
    level?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level = 0 }) => {
    const { selectedNodeId, setSelectedNodeId, deleteNode } = useEditor();
    const [expanded, setExpanded] = useState(true);

    const material = materialRegistry.getMaterial(node.componentName);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNodeId === node.id;

    const handleClick = () => {
        setSelectedNodeId(node.id);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.id !== 'root') {
            deleteNode(node.id);
        }
    };

    return (
        <div className={styles.treeNode}>
            <div
                className={`${styles.nodeContent} ${isSelected ? styles.selected : ''}`}
                style={{ paddingLeft: `${level * 20}px` }}
                onClick={handleClick}
            >
                {hasChildren && (
                    <span className={styles.toggle} onClick={handleToggle}>
                        {expanded ? '▼' : '▶'}
                    </span>
                )}
                {!hasChildren && <span className={styles.toggle}></span>}
                <span className={styles.icon}>{material?.icon || '📄'}</span>
                <span className={styles.name}>{material?.title || node.componentName}</span>
                {node.id !== 'root' && (
                    <button className={styles.deleteBtn} onClick={handleDelete}>
                        ✕
                    </button>
                )}
            </div>
            {hasChildren && expanded && (
                <div className={styles.children}>
                    {node.children!.map((child) => (
                        <TreeNode key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreeNode;
