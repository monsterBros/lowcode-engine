import React from 'react';

/**
 * Ref管理器
 * 管理所有组件实例的引用，支持跨组件方法调用
 */
export class RefManager {
    private refs: Map<string, React.RefObject<any>> = new Map();

    /**
     * 注册组件ref
     */
    register(nodeId: string, ref: React.RefObject<any>): void {
        this.refs.set(nodeId, ref);
    }

    /**
     * 注销组件ref
     */
    unregister(nodeId: string): void {
        this.refs.delete(nodeId);
    }

    /**
     * 获取组件ref
     */
    getRef(nodeId: string): React.RefObject<any> | undefined {
        return this.refs.get(nodeId);
    }

    /**
     * 调用组件方法
     */
    callMethod(nodeId: string, methodName: string, ...args: any[]): any {
        const ref = this.refs.get(nodeId);

        if (!ref?.current) {
            console.warn(`Node ${node Id} ref not found`);
            return undefined;
        }

        if (typeof ref.current[methodName] === 'function') {
            try {
                return ref.current[methodName](...args);
            } catch (error) {
                console.error(`Error calling method ${ methodName } on node ${ nodeId }: `, error);
                return undefined;
            }
        } else {
            console.warn(`Method ${ methodName } not found on node ${ nodeId } `);
            return undefined;
        }
    }

    /**
     * 获取组件实例
     */
    getInstance(nodeId: string): any {
        return this.refs.get(nodeId)?.current;
    }

    /**
     * 检查组件ref是否存在
     */
    has(nodeId: string): boolean {
        const ref = this.refs.get(nodeId);
        return !!ref?.current;
    }

    /**
     * 获取所有已注册的节点ID
     */
    getAllNodeIds(): string[] {
        return Array.from(this.refs.keys());
    }

    /**
     * 清空所有ref
     */
    clear(): void {
        this.refs.clear();
    }

    /**
     * 调试工具
     */
    debug(): void {
        console.log('🔗 Registered Refs:', {
            total: this.refs.size,
            nodes: Array.from(this.refs.keys()),
            instances: Array.from(this.refs.entries()).map(([id, ref]) => ({
                id,
                hasInstance: !!ref.current,
                methods: ref.current ? Object.getOwnPropertyNames(Object.getPrototypeOf(ref.current)) : []
            }))
        });
    }
}

// 导出单例
export const refManager = new RefManager();
