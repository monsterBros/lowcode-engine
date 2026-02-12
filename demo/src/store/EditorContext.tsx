import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ComponentSchema, EditorState, EditorActions } from '@/types';
import {
    addNodeToSchema,
    deleteNodeFromSchema,
    updateNodePropsInSchema,
} from '@/utils/schema';
import { moveNodeInSchema } from '@/utils/schemaHelpers';
import { generateId } from '@/utils/uuid';
import { History } from '@/engine/History';
import { eventBus, EVENTS } from '@/engine/EventBus';

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

// 扩展EditorActions支持撤销/重做
interface ExtendedEditorActions extends EditorActions {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

// 创建Context
const EditorContext = createContext<(EditorState & ExtendedEditorActions) | null>(null);

// Provider组件
export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [schema, setSchema] = useState<ComponentSchema>(initialSchema);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [history] = useState(() => new History(initialSchema));
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // 更新历史状态
    const updateHistoryState = () => {
        setCanUndo(history.canUndo());
        setCanRedo(history.canRedo());
    };

    // 统一的Schema更新方法
    const updateSchema = (newSchema: ComponentSchema, skipHistory = false) => {
        if (!skipHistory) {
            history.push(newSchema);
            updateHistoryState();
        }
        setSchema(newSchema);
        eventBus.emit(EVENTS.SCHEMA_CHANGE, newSchema);
    };

    const addNode = (parentId: string | null, node: ComponentSchema) => {
        const nodeWithId = { ...node, id: node.id || generateId() };
        const newSchema = addNodeToSchema(schema, parentId, nodeWithId);
        updateSchema(newSchema);
        eventBus.emit(EVENTS.NODE_ADD, nodeWithId);
    };

    const deleteNode = (id: string) => {
        const newSchema = deleteNodeFromSchema(schema, id);
        updateSchema(newSchema);
        if (selectedNodeId === id) {
            setSelectedNodeId(null);
        }
        eventBus.emit(EVENTS.NODE_DELETE, id);
    };

    const updateNodeProps = (id: string, props: Record<string, any>) => {
        const newSchema = updateNodePropsInSchema(schema, id, props);
        updateSchema(newSchema);
        eventBus.emit(EVENTS.NODE_UPDATE, { id, props });
    };

    const undo = () => {
        const prevSchema = history.undo();
        if (prevSchema) {
            setSchema(prevSchema);
            updateHistoryState();
            eventBus.emit(EVENTS.HISTORY_CHANGE, 'undo');
        }
    };

    const redo = () => {
        const nextSchema = history.redo();
        if (nextSchema) {
            setSchema(nextSchema);
            updateHistoryState();
            eventBus.emit(EVENTS.HISTORY_CHANGE, 'redo');
        }
    };

    const moveNode = (nodeId: string, targetParentId: string, targetIndex: number) => {
        const newSchema = moveNodeInSchema(schema, nodeId, targetParentId, targetIndex);
        updateSchema(newSchema);
        eventBus.emit(EVENTS.NODE_MOVE, { nodeId, targetParentId, targetIndex });
    };

    // 监听节点选中事件
    useEffect(() => {
        const handleSelect = (nodeId: string | null) => {
            setSelectedNodeId(nodeId);
        };

        return eventBus.on(EVENTS.NODE_SELECT, handleSelect);
    }, []);

    return (
        <EditorContext.Provider
            value={{
                schema,
                selectedNodeId,
                setSchema,
                setSelectedNodeId: (id) => {
                    setSelectedNodeId(id);
                    eventBus.emit(EVENTS.NODE_SELECT, id);
                },
                addNode,
                deleteNode,
                updateNodeProps,
                updateSchema,
                moveNode,
                undo,
                redo,
                canUndo,
                canRedo,
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
