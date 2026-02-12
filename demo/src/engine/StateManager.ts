/**
 * 全局状态管理器
 * 支持订阅/发布模式，类似Redux/Zustand
 */

export class StateManager {
    private state: Record<string, any> = {};
    private listeners: Map<string, Set<Function>> = new Map();

    /**
     * 获取状态值
     */
    get<T = any>(key: string): T | undefined {
        return this.state[key];
    }

    /**
     * 设置状态值
     */
    set(key: string, value: any): void {
        const oldValue = this.state[key];
        this.state[key] = value;

        // 只在值真正改变时才通知
        if (oldValue !== value) {
            this.notify(key, value, oldValue);
        }
    }

    /**
     * 批量更新状态
     */
    update(updates: Record<string, any>): void {
        const changedKeys: string[] = [];

        Object.keys(updates).forEach(key => {
            const oldValue = this.state[key];
            this.state[key] = updates[key];
            if (oldValue !== updates[key]) {
                changedKeys.push(key);
            }
        });

        // 批量通知所有改变的key
        changedKeys.forEach(key =>
            this.notify(key, this.state[key], undefined)
        );
    }

    /**
     * 订阅状态变化
     */
    subscribe(key: string, listener: (value: any, oldValue?: any) => void): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(listener);

        // 返回取消订阅函数
        return () => {
            this.listeners.get(key)?.delete(listener);
        };
    }

    /**
     * 订阅所有状态变化
     */
    subscribeAll(listener: (state: Record<string, any>) => void): () => void {
        return this.subscribe('*', listener);
    }

    /**
     * 获取所有状态
     */
    getAll(): Record<string, any> {
        return { ...this.state };
    }

    /**
     * 清空所有状态
     */
    clear(): void {
        this.state = {};
        this.notify('*', this.state);
    }

    /**
     * 删除指定key
     */
    delete(key: string): void {
        const oldValue = this.state[key];
        delete this.state[key];
        this.notify(key, undefined, oldValue);
    }

    /**
     * 检查key是否存在
     */
    has(key: string): boolean {
        return key in this.state;
    }

    /**
     * 通知监听器
     */
    private notify(key: string, value: any, oldValue?: any): void {
        // 通知特定key的监听器
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach(fn => {
                try {
                    fn(value, oldValue);
                } catch (error) {
                    console.error(`Error in state listener for "${key}":`, error);
                }
            });
        }

        // 通知全局监听器
        const allListeners = this.listeners.get('*');
        if (allListeners && key !== '*') {
            allListeners.forEach(fn => {
                try {
                    fn(this.state);
                } catch (error) {
                    console.error('Error in global state listener:', error);
                }
            });
        }
    }

    /**
     * 调试工具 - 打印当前状态
     */
    debug(): void {
        console.log('📦 Global State:', this.state);
        console.log('👂 Listeners:', {
            keys: Array.from(this.listeners.keys()),
            counts: Array.from(this.listeners.entries()).map(([k, v]) => ({ key: k, count: v.size }))
        });
    }
}

// 导出单例
export const stateManager = new StateManager();

// 导出便捷函数
export const getState = <T = any>(key: string): T | undefined => stateManager.get<T>(key);
export const setState = (key: string, value: any): void => stateManager.set(key, value);
export const updateState = (updates: Record<string, any>): void => stateManager.update(updates);
