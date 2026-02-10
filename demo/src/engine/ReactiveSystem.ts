/**
 * 响应式数据流系统
 * 实现依赖追踪和计算属性
 */

type ComputedGetter<T> = () => T;
type WatchCallback = (newValue: any, oldValue: any) => void;

interface Computed<T = any> {
    getter: ComputedGetter<T>;
    value: T;
    deps: Set<string>;  // 依赖的变量名
}

export class ReactiveSystem {
    private state: Map<string, any> = new Map();
    private computed: Map<string, Computed> = new Map();
    private watchers: Map<string, Set<WatchCallback>> = new Map();
    private currentComputed: string | null = null;
    private tracking = true;

    /**
     * 定义响应式状态
     */
    defineState(name: string, initialValue: any) {
        this.state.set(name, initialValue);
        this.watchers.set(name, new Set());
    }

    /**
     * 获取状态值
     */
    getState(name: string): any {
        // 如果正在计算computed，记录依赖
        if (this.currentComputed && this.tracking) {
            const comp = this.computed.get(this.currentComputed);
            if (comp) {
                comp.deps.add(name);
            }
        }
        return this.state.get(name);
    }

    /**
     * 设置状态值
     */
    setState(name: string, value: any) {
        const oldValue = this.state.get(name);

        if (oldValue === value) {
            return; // 值未变化，不触发更新
        }

        this.state.set(name, value);

        // 触发watchers
        const callbacks = this.watchers.get(name);
        if (callbacks) {
            callbacks.forEach(cb => cb(value, oldValue));
        }

        // 更新依赖此状态的computed
        this.updateDependentComputed(name);
    }

    /**
     * 定义计算属性
     */
    defineComputed<T>(name: string, getter: ComputedGetter<T>) {
        // 临时设置当前计算属性，用于收集依赖
        this.currentComputed = name;

        const comp: Computed<T> = {
            getter,
            value: undefined as any,
            deps: new Set()
        };

        // 首次计算，收集依赖
        comp.value = getter();

        this.currentComputed = null;
        this.computed.set(name, comp);

        return comp.value;
    }

    /**
     * 获取计算属性值
     */
    getComputed(name: string): any {
        const comp = this.computed.get(name);
        if (!comp) {
            console.warn(`Computed property "${name}" not found`);
            return undefined;
        }
        return comp.value;
    }

    /**
     * 更新依赖某个状态的所有computed
     */
    private updateDependentComputed(stateName: string) {
        this.computed.forEach((comp, compName) => {
            if (comp.deps.has(stateName)) {
                // 重新计算
                this.currentComputed = compName;
                comp.deps.clear(); // 清空旧依赖

                const oldValue = comp.value;
                comp.value = comp.getter();

                this.currentComputed = null;

                // 触发computed的watchers
                const callbacks = this.watchers.get(compName);
                if (callbacks) {
                    callbacks.forEach(cb => cb(comp.value, oldValue));
                }
            }
        });
    }

    /**
     * 监听状态或computed变化
     */
    watch(name: string, callback: WatchCallback) {
        if (!this.watchers.has(name)) {
            this.watchers.set(name, new Set());
        }
        this.watchers.get(name)!.add(callback);

        // 返回取消监听的函数
        return () => {
            this.watchers.get(name)?.delete(callback);
        };
    }

    /**
     * 批量更新（暂停依赖追踪）
     */
    batch(fn: () => void) {
        this.tracking = false;
        fn();
        this.tracking = true;
        // 批量更新后，重新计算所有computed
        this.recomputeAll();
    }

    /**
     * 重新计算所有computed
     */
    private recomputeAll() {
        this.computed.forEach((comp, name) => {
            this.currentComputed = name;
            comp.deps.clear();
            comp.value = comp.getter();
            this.currentComputed = null;
        });
    }

    /**
     * 获取所有状态
     */
    getAllState(): Record<string, any> {
        const result: Record<string, any> = {};
        this.state.forEach((value, key) => {
            result[key] = value;
        });
        this.computed.forEach((comp, key) => {
            result[key] = comp.value;
        });
        return result;
    }

    /**
     * 清空所有状态
     */
    clear() {
        this.state.clear();
        this.computed.clear();
        this.watchers.clear();
    }

    /**
     * 获取依赖图（调试用）
     */
    getDependencyGraph(): Record<string, string[]> {
        const graph: Record<string, string[]> = {};
        this.computed.forEach((comp, name) => {
            graph[name] = Array.from(comp.deps);
        });
        return graph;
    }
}

// 导出单例
export const reactiveSystem = new ReactiveSystem();
