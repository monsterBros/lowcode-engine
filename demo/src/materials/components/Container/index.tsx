import React from 'react';

interface ContainerProps {
    children?: React.ReactNode;
    layout?: 'vertical' | 'horizontal';
    background?: string;
    padding?: number;
    gap?: number;
    // 新增：用于拖放支持
    nodeId?: string;
    onDropChild?: (nodeId: string, material: any) => void;
}

const Container: React.FC<ContainerProps> = ({
    children,
    layout = 'vertical',
    background = '#f5f5f5',
    padding = 16,
    gap = 8,
    nodeId,
    onDropChild
}) => {
    // 拖放支持 - 仅在编辑模式下启用
    let isOver = false;
    let canDrop = false;
    let dropRef: any = null;

    // 检查是否在DndProvider上下文中
    let hasDndContext = false;
    try {
        // 动态导入useDrop以避免在没有上下文时崩溃
        const { useDrop } = require('react-dnd');
        const [dropState, drop] = useDrop({
            accept: 'MATERIAL',
            drop: (item: any, monitor) => {
                // 只处理直接拖放到此容器的情况
                const didDrop = monitor.didDrop();
                if (didDrop) {
                    return;
                }

                if (onDropChild && nodeId) {
                    onDropChild(nodeId, item.material);
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
                canDrop: monitor.canDrop(),
            }),
        });
        isOver = dropState.isOver;
        canDrop = dropState.canDrop;
        dropRef = drop;
        hasDndContext = true;
    } catch (e) {
        // 没有DndProvider上下文，使用普通渲染
        hasDndContext = false;
    }

    const styles: React.CSSProperties = {
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        background: isOver && canDrop ? '#e6f7ff' : background,
        padding: `${padding}px`,
        gap: `${gap}px`,
        minHeight: '100px',
        borderRadius: '4px',
        border: isOver && canDrop ? '2px dashed #1890ff' : '1px dashed #d9d9d9',
        position: 'relative',
        transition: 'all 0.2s',
    };

    return (
        <div ref={hasDndContext ? dropRef : null} style={styles}>
            {children && React.Children.count(children) > 0
                ? children
                : <div style={{ color: '#999', textAlign: 'center', width: '100%' }}>拖拽组件到这里</div>
            }
        </div>
    );
};

export default Container;
