import { ComponentSchema } from '@/types';

/**
 * 在Schema树中查找节点
 */
export function findNode(
    schema: ComponentSchema,
    nodeId: string
): ComponentSchema | null {
    if (schema.id === nodeId) {
        return schema;
    }

    if (schema.children) {
        for (const child of schema.children) {
            const found = findNode(child, nodeId);
            if (found) return found;
        }
    }

    return null;
}

/**
 * 查找节点的父节点
 */
export function findParentNode(
    schema: ComponentSchema,
    targetId: string,
    parent: ComponentSchema | null = null
): ComponentSchema | null {
    if (schema.id === targetId) {
        return parent;
    }

    if (schema.children) {
        for (const child of schema.children) {
            const found = findParentNode(child, targetId, schema);
            if (found) return found;
        }
    }

    return null;
}

/**
 * 添加节点到Schema树
 */
export function addNodeToSchema(
    schema: ComponentSchema,
    parentId: string | null,
    newNode: ComponentSchema
): ComponentSchema {
    // 如果没有父节点，添加为根节点的子节点
    if (!parentId) {
        return {
            ...schema,
            children: [...(schema.children || []), newNode],
        };
    }

    // 查找父节点并添加
    const clonedSchema = JSON.parse(JSON.stringify(schema));
    const parent = findNode(clonedSchema, parentId);

    if (parent) {
        parent.children = parent.children || [];
        parent.children.push(newNode);
    }

    return clonedSchema;
}

/**
 * 从Schema树中删除节点
 */
export function deleteNodeFromSchema(
    schema: ComponentSchema,
    nodeId: string
): ComponentSchema {
    const clonedSchema = JSON.parse(JSON.stringify(schema));

    // 不能删除根节点
    if (clonedSchema.id === nodeId) {
        return clonedSchema;
    }

    const parent = findParentNode(clonedSchema, nodeId);
    if (parent && parent.children) {
        parent.children = parent.children.filter((child) => child.id !== nodeId);
    }

    return clonedSchema;
}

/**
 * 更新节点属性
 */
export function updateNodePropsInSchema(
    schema: ComponentSchema,
    nodeId: string,
    props: Record<string, any>
): ComponentSchema {
    const clonedSchema = JSON.parse(JSON.stringify(schema));
    const node = findNode(clonedSchema, nodeId);

    if (node) {
        node.props = { ...node.props, ...props };
    }

    return clonedSchema;
}
