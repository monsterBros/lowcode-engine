import { ComponentSchema } from '@/types';

/**
 * 在schema中移动节点
 */
export function moveNodeInSchema(
    schema: ComponentSchema,
    nodeId: string,
    targetParentId: string,
    targetIndex: number
): ComponentSchema {
    // 1. 找到要移动的节点
    const nodeToMove = findNode(schema, nodeId);
    if (!nodeToMove) return schema;

    // 2. 从原位置删除节点
    const schemaWithoutNode = deleteNodeFromSchema(schema, nodeId);

    // 3. 在新位置插入节点
    return insertNodeAtPosition(schemaWithoutNode, nodeToMove, targetParentId, targetIndex);
}

/**
 * 在指定位置插入节点
 */
function insertNodeAtPosition(
    schema: ComponentSchema,
    node: ComponentSchema,
    parentId: string,
    index: number
): ComponentSchema {
    if (schema.id === parentId) {
        const newChildren = [...(schema.children || [])];
        newChildren.splice(index, 0, node);
        return {
            ...schema,
            children: newChildren
        };
    }

    if (schema.children) {
        return {
            ...schema,
            children: schema.children.map(child =>
                insertNodeAtPosition(child, node, parentId, index)
            )
        };
    }

    return schema;
}

// Export existing functions
export { findNode, deleteNodeFromSchema } from './schema';
