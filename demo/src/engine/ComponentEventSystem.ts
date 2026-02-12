import { eventBus } from './EventBus';

/**
 * 组件事件系统
 * 为每个组件提供独立的事件处理能力
 */

export interface EventContext {
    event: any;                                          // 原生事件对象
    nodeId: string;                                      // 当前节点ID
    emit: (eventName: string, data?: any) => void;      // 触发组件事件
    emitGlobal: (eventName: string, data?: any) => void; // 触发全局事件
    getNode: (id: string) => any;                        // 获取其他节点
    updateNode: (id: string, props: any) => void;        // 更新其他节点
    getState: (key: string) => any;                      // 获取全局状态
    setState: (key: string, value: any) => void;         // 设置全局状态
    callRef: (id: string, method: string, ...args: any[]) => any; // 调用组件方法
}

export class ComponentEventSystem {
    private eventHandlers: Map<string, Function> = new Map();

    /**
     * 设置组件事件处理器
     */
    setupComponentEvents(
        nodeId: string,
        events: Record<string, any>,
        contextProviders: {
            getNode: (id: string) => any;
            updateNode: (id: string, props: any) => void;
            getState: (key: string) => any;
            setState: (key: string, value: any) => void;
            callRef: (id: string, method: string, ...args: any[]) => any;
        }
    ) {
        Object.entries(events).forEach(([eventName, handler]) => {
            const eventKey = `component:${nodeId}:${eventName}`;

            if (handler.type === 'JSFunction') {
                // 创建事件处理函数
                const handlerFn = (event: any) => {
                    const context: EventContext = {
                        event,
                        nodeId,
                        emit: (evt: string, data?: any) => {
                            eventBus.emit(`component:${nodeId}:${evt}`, data);
                        },
                        emitGlobal: (evt: string, data?: any) => {
                            eventBus.emit(evt, data);
                        },
                        getNode: contextProviders.getNode,
                        updateNode: contextProviders.updateNode,
                        getState: contextProviders.getState,
                        setState: contextProviders.setState,
                        callRef: contextProviders.callRef,
                    };

                    try {
                        // 使用with创建上下文环境
                        const fn = new Function('context', `
                            with(context) {
                                ${handler.value}
                            }
                        `);
                        fn(context);
                    } catch (error) {
                        console.error(`Error in event handler ${eventKey}:`, error);
                    }
                };

                // 保存处理器引用
                this.eventHandlers.set(eventKey, handlerFn);

                return handlerFn;
            }
        });
    }

    /**
     * 清理组件事件
     */
    cleanupComponentEvents(nodeId: string) {
        const keysToDelete: string[] = [];
        this.eventHandlers.forEach((_, key) => {
            if (key.startsWith(`component:${nodeId}:`)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => this.eventHandlers.delete(key));
    }

    /**
     * 获取组件事件处理器
     */
    getEventHandler(nodeId: string, eventName: string): Function | undefined {
        const eventKey = `component:${nodeId}:${eventName}`;
        return this.eventHandlers.get(eventKey);
    }
}

// 导出单例
export const componentEventSystem = new ComponentEventSystem();
