/**
 * Shell API 统一接口层
 * 提供统一的API调用入口，便于二次开发
 */

import { materialRegistry } from '@/materials/registry';
import { eventBus } from '@/engine/EventBus';
import { ComponentSchema, MaterialMeta } from '@/types';

/**
 * 物料API
 */
export const material = {
    /**
     * 注册物料
     */
    register(meta: MaterialMeta) {
        return materialRegistry.register(meta);
    },

    /**
     * 批量注册物料
     */
    registerBatch(metas: MaterialMeta[]) {
        return materialRegistry.registerMaterials(metas);
    },

    /**
     * 获取所有物料
     */
    getAll() {
        return materialRegistry.getAll();
    },

    /**
     * 获取物料元数据
     */
    get(componentName: string) {
        return materialRegistry.getMaterial(componentName);
    },

    /**
     * 按分类获取物料
     */
    getByCategory(category: string) {
        return materialRegistry.getMaterialsByCategory(category);
    },

    /**
     * 判断是否为容器组件
     */
    isContainer(componentName: string) {
        return materialRegistry.isContainer(componentName);
    }
};

/**
 * 事件API
 */
export const event = {
    /**
     * 订阅事件
     */
    on(type: string, handler: Function) {
        return eventBus.on(type, handler);
    },

    /**
     * 发布事件
     */
    emit(type: string, data?: any) {
        return eventBus.emit(type, data);
    },

    /**
     * 取消订阅
     */
    off(type: string, handler: Function) {
        return eventBus.off(type, handler);
    },

    /**
     * 一次性订阅
     */
    once(type: string, handler: Function) {
        const wrappedHandler = (...args: any[]) => {
            handler(...args);
            eventBus.off(type, wrappedHandler);
        };
        return eventBus.on(type, wrappedHandler);
    }
};

/**
 * 项目API
 * 注意：这些方法需要在EditorContext中使用，这里只是接口定义
 */
let editorContextRef: any = null;

export const setEditorContext = (context: any) => {
    editorContextRef = context;
};

export const project = {
    /**
     * 获取当前Schema
     */
    getSchema(): ComponentSchema | null {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return null;
        }
        return editorContextRef.schema;
    },

    /**
     * 设置Schema
     */
    setSchema(schema: ComponentSchema) {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return;
        }
        return editorContextRef.setSchema(schema);
    },

    /**
     * 导出Schema为JSON
     */
    export(): string | null {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return null;
        }
        return JSON.stringify(editorContextRef.schema, null, 2);
    },

    /**
     * 从JSON导入Schema
     */
    import(json: string) {
        try {
            const schema = JSON.parse(json);
            this.setSchema(schema);
        } catch (error) {
            console.error('Failed to import schema:', error);
        }
    },

    /**
     * 添加节点
     */
    addNode(parentId: string | null, node: ComponentSchema) {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return;
        }
        return editorContextRef.addNode(parentId, node);
    },

    /**
     * 删除节点
     */
    deleteNode(id: string) {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return;
        }
        return editorContextRef.deleteNode(id);
    },

    /**
     * 更新节点属性
     */
    updateNodeProps(id: string, props: Record<string, any>) {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return;
        }
        return editorContextRef.updateNodeProps(id, props);
    },

    /**
     * 获取选中的节点ID
     */
    getSelectedNodeId(): string | null {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return null;
        }
        return editorContextRef.selectedNodeId;
    },

    /**
     * 设置选中的节点
     */
    setSelectedNodeId(id: string | null) {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return;
        }
        return editorContextRef.setSelectedNodeId(id);
    }
};

/**
 * 历史API
 */
export const history = {
    /**
     * 撤销
     */
    undo() {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return;
        }
        return editorContextRef.undo();
    },

    /**
     * 重做
     */
    redo() {
        if (!editorContextRef) {
            console.warn('EditorContext not set');
            return;
        }
        return editorContextRef.redo();
    },

    /**
     * 是否可以撤销
     */
    canUndo(): boolean {
        if (!editorContextRef) {
            return false;
        }
        return editorContextRef.canUndo;
    },

    /**
     * 是否可以重做
     */
    canRedo(): boolean {
        if (!editorContextRef) {
            return false;
        }
        return editorContextRef.canRedo;
    }
};

/**
 * 统一导出
 */
export const engine = {
    material,
    event,
    project,
    history,
    setEditorContext
};

// 挂载到window，便于控制台调用
if (typeof window !== 'undefined') {
    (window as any).engine = engine;
    console.log('✅ Shell API已挂载到window.engine');
}

export default engine;
