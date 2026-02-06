/**
 * 组件Schema节点定义
 */
export interface ComponentSchema {
    id: string;
    componentName: string;
    props?: Record<string, any>;
    children?: ComponentSchema[];
}

/**
 * 物料元数据定义
 */
export interface MaterialMeta {
    componentName: string;
    title: string;
    icon?: string;
    category?: string;
    description?: string;
    props: PropertyConfig[];
    configure?: {
        component?: {
            isContainer?: boolean;
        };
    };
}

/**
 * 属性配置定义
 */
export interface PropertyConfig {
    name: string;
    title: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    defaultValue?: any;
    setter: SetterConfig;
    description?: string;
}

/**
 * Setter配置定义
 */
export interface SetterConfig {
    componentName: string;
    props?: Record<string, any>;
}

/**
 * 编辑器状态定义
 */
export interface EditorState {
    schema: ComponentSchema;
    selectedNodeId: string | null;
}

/**
 * 编辑器操作定义
 */
export interface EditorActions {
    setSchema: (schema: ComponentSchema) => void;
    setSelectedNodeId: (id: string | null) => void;
    addNode: (parentId: string | null, node: ComponentSchema) => void;
    deleteNode: (id: string) => void;
    updateNodeProps: (id: string, props: Record<string, any>) => void;
}
