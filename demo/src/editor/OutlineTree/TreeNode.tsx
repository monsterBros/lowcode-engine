import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DeleteOutlined, LockOutlined, UnlockOutlined, EyeOutlined, EyeInvisibleOutlined, CopyOutlined } from '@ant-design/icons';
import { useEditor } from '@/store/EditorContext';
import { ComponentSchema } from '@/types';
import { materialRegistry } from '@/materials/registry';
import styles from './TreeNode.module.css';

interface TreeNodeProps {
    node: ComponentSchema;
    level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level }) => {
    const { selectedNodeId, setSelectedNodeId, deleteNode } = useEditor();
    const [expanded, setExpanded] = useState(true);
    const [locked, setLocked] = useState(false);
    const [hidden, setHidden] = useState(false);

    const isSelected = selectedNodeId === node.id;
    const isContainer = materialRegistry.isContainer(node.componentName);
    const hasChildren = isContainer && node.children && node.children.length > 0;

    // 拖拽功能
    const [{ isDragging }, drag] = useDrag({
        type: 'TREE_NODE',
        item: { nodeId: node.id, componentName: node.componentName },
        canDrag: !locked,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [{ isOver }, drop] = useDrop({
        accept: 'TREE_NODE',
        canDrop: (item: any) => {
            // 不能拖到自己上
            return item.nodeId !== node.id && isContainer;
        },
        drop: (item: any) => {
            console.log(`拖拽 ${item.nodeId} 到 ${node.id}`);
            // TODO: 实现节点移动逻辑
        },
        collect: (monitor) => ({
            isOver: monitor.isOver() && monitor.canDrop(),
        }),
    });

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!locked) {
            setSelectedNodeId(node.id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!locked && node.id !== 'root') {
            deleteNode(node.id);
        }
    };

    const handleToggleLock = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocked(!locked);
    };

    const handleToggleHidden = (e: React.MouseEvent) => {
        e.stopPropagation();
        setHidden(!hidden);
    };

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: 实现复制功能
        console.log('复制节点:', node.id);
    };

    return (
        <div
            ref={(el) => {
                drag(el);
                drop(el);
            }}
            className={`${styles.nodeWrapper} ${isDragging ? styles.dragging : ''} ${isOver ? styles.dropTarget : ''}`}
            style={{ opacity: hidden ? 0.5 : 1 }}
        >
            <div
                className={`${styles.node} ${isSelected ? styles.selected : ''} ${locked ? styles.locked : ''}`}
                onClick={handleClick}
                style={{ paddingLeft: `${level * 20}px` }}
            >
                <div className={styles.left}>
                    {hasChildren && (
                        <span
                            className={styles.expandIcon}
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(!expanded);
                            }}
                        >
                            {expanded ? '▼' : '▶'}
                        </span>
                    )}
                    {!hasChildren && <span className={styles.placeholder}></span>}
                    <span className={styles.label}>{node.componentName}</span>
                </div>

                <div className={styles.actions}>
                    <span className={styles.action} onClick={handleToggleHidden} title={hidden ? '显示' : '隐藏'}>
                        {hidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                    </span>
                    <span className={styles.action} onClick={handleToggleLock} title={locked ? '解锁' : '锁定'}>
                        {locked ? <LockOutlined /> : <UnlockOutlined />}
                    </span>
                    <span className={styles.action} onClick={handleCopy} title="复制">
                        <CopyOutlined />
                    </span>
                    {node.id !== 'root' && !locked && (
                        <span className={styles.action} onClick={handleDelete} title="删除">
                            <DeleteOutlined />
                        </span>
                    )}
                </div>
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
