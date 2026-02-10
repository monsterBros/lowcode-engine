/**
 * 变量管理器
 * 用于管理全局变量和数据绑定
 */

export interface Variable {
    name: string;          // 变量名
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    defaultValue: any;     // 默认值
    description?: string;  // 描述
}

export class VariableManager {
    private variables: Map<string, Variable> = new Map();
    private values: Map<string, any> = new Map();
    private listeners: Map<string, Function[]> = new Map();

    /**
     * 定义变量
     */
    define(variable: Variable) {
        this.variables.set(variable.name, variable);
        this.values.set(variable.name, variable.defaultValue);
    }

    /**
     * 批量定义变量
     */
    defineBatch(variables: Variable[]) {
        variables.forEach(v => this.define(v));
    }

    /**
     * 获取变量定义
     */
    get(name: string): Variable | undefined {
        return this.variables.get(name);
    }

    /**
     * 获取所有变量定义
     */
    getAll(): Variable[] {
        return Array.from(this.variables.values());
    }

    /**
     * 获取变量值
     */
    getValue(name: string): any {
        return this.values.get(name);
    }

    /**
     * 设置变量值
     */
    setValue(name: string, value: any) {
        this.values.set(name, value);
        this.notify(name, value);
    }

    /**
     * 获取所有值（用于表达式求值上下文）
     */
    getAllValues(): Record<string, any> {
        const result: Record<string, any> = {};
        this.values.forEach((value, name) => {
            result[name] = value;
        });
        return result;
    }

    /**
     * 订阅变量变化
     */
    subscribe(name: string, callback: Function) {
        if (!this.listeners.has(name)) {
            this.listeners.set(name, []);
        }
        this.listeners.get(name)!.push(callback);
    }

    /**
     * 取消订阅
     */
    unsubscribe(name: string, callback: Function) {
        const callbacks = this.listeners.get(name);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * 通知订阅者
     */
    private notify(name: string, value: any) {
        const callbacks = this.listeners.get(name);
        if (callbacks) {
            callbacks.forEach(cb => cb(value));
        }
    }

    /**
     * 删除变量
     */
    delete(name: string) {
        this.variables.delete(name);
        this.values.delete(name);
        this.listeners.delete(name);
    }

    /**
     * 清空所有变量
     */
    clear() {
        this.variables.clear();
        this.values.clear();
        this.listeners.clear();
    }
}

// 导出单例
export const variableManager = new VariableManager();
