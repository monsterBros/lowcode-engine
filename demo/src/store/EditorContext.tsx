import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ComponentSchema, EditorState, EditorActions } from '@/types';
import {
    addNodeToSchema,
    deleteNodeFromSchema,
    updateNodePropsInSchema,
} from '@/utils/schema';
import { generateId } from '@/utils/uuid';

// 初始Schema
const initialSchema: ComponentSchema = {
    id: 'root',
    componentName: 'Container',
    props: {
        layout: 'vertical',
        background: '#ffffff',
        padding: 20,
        gap: 10,
    },
    children: [],
};

// 创建Context
const EditorContext = createContext<(EditorState & EditorActions) | null>(null);

// Provider组件
export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [schema, setSchema] = useState<ComponentSchema>(initialSchema);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const addNode = (parentId: string | null, node: ComponentSchema) => {
        const nodeWithId = { ...node, id: node.id || generateId() };
        const newSchema = addNodeToSchema(schema, parentId, nodeWithId);
        setSchema(newSchema);
    };

    const deleteNode = (id: string) => {
        const newSchema = deleteNodeFromSchema(schema, id);
        setSchema(newSchema);
        if (selectedNodeId === id) {
            setSelectedNodeId(null);
        }
    };

    const updateNodeProps = (id: string, props: Record<string, any>) => {
        const newSchema = updateNodePropsInSchema(schema, id, props);
        setSchema(newSchema);
    };

    return (
        <EditorContext.Provider
            value={{
                schema,
                selectedNodeId,
                setSchema,
                setSelectedNodeId,
                addNode,
                deleteNode,
                updateNodeProps,
            }}
        >
            {children}
        </EditorContext.Provider>
    );
};

// 自定义Hook
export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within EditorProvider');
    }
    return context;
};
