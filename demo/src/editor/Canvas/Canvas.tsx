import React from 'react';
import { useDrop } from 'react-dnd';
import { useEditor } from '@/store/EditorContext';
import { ComponentSchema } from '@/types';
import { generateId } from '@/utils/uuid';
import Renderer from './Renderer';
import styles from './Canvas.module.css';

const Canvas: React.FC = () => {
    const { schema, addNode } = useEditor();

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
        <div ref={drop} className={`${styles.canvas} ${isOver ? styles.isOver : ''}`}>
            <Renderer schema={schema} />
        </div>
    );
};

export default Canvas;
