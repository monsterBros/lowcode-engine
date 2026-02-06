/**
 * 事件总线 - 用于模块间通信
 * 参考 lowcode-engine 的 EventBus 设计
 */

type EventListener = (...args: any[]) => void;

export class EventBus {
    private events: Map<string, EventListener[]> = new Map();

    /**
     * 订阅事件
     */
    on(event: string, listener: EventListener): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event)!.push(listener);

        // 返回取消订阅函数
        return () => this.off(event, listener);
    }

    /**
     * 触发事件
     */
    emit(event: string, ...args: any[]): void {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            });
        }
    }

    /**
     * 取消订阅
     */
    off(event: string, listener: EventListener): void {
        const listeners = this.events.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 一次性订阅
     */
    once(event: string, listener: EventListener): () => void {
        const onceListener = (...args: any[]) => {
            listener(...args);
            this.off(event, onceListener);
        };
        return this.on(event, onceListener);
    }

    /**
     * 清除所有监听器
     */
    clear(): void {
        this.events.clear();
    }
}

// 导出全局事件总线实例
export const eventBus = new EventBus();

// 定义事件常量
export const EVENTS = {
    // 节点相关
    NODE_SELECT: 'node:select',
    NODE_ADD: 'node:add',
    NODE_DELETE: 'node:delete',
    NODE_UPDATE: 'node:update',

    // Schema相关
    SCHEMA_CHANGE: 'schema:change',

    // 历史相关
    HISTORY_CHANGE: 'history:change',
};
