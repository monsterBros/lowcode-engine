/**
 * 生成唯一ID
 */
export function generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
