/**
 * 插件系统 - 完整插件架构
 * 参考 lowcode-engine 的插件设计
 */

export interface PluginContext {
    editor: any;
    config: Record<string, any>;
    logger: Logger;
    event: any;
}

export interface PluginMeta {
    name: string;
    version: string;
    description?: string;
    dependencies?: string[];
}

export interface Plugin {
    meta: PluginMeta;
    init: (context: PluginContext) => Promise<void> | void;
    destroy?: () => Promise<void> | void;
}

export interface Logger {
    log: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
}

/**
 * 插件管理器
 */
export class PluginManager {
    private plugins: Map<string, Plugin> = new Map();
    private initialized: Set<string> = new Set();
    private context: PluginContext;

    constructor(context: PluginContext) {
        this.context = context;
    }

    /**
     * 注册插件
     */
    async register(plugin: Plugin): Promise<void> {
        const { name, dependencies = [] } = plugin.meta;

        // 检查依赖
        for (const dep of dependencies) {
            if (!this.plugins.has(dep)) {
                throw new Error(`Plugin "${name}" depends on "${dep}" which is not registered`);
            }
        }

        this.plugins.set(name, plugin);
        this.context.logger.log(`Plugin registered: ${name}@${plugin.meta.version}`);
    }

    /**
     * 初始化插件
     */
    async init(pluginName: string): Promise<void> {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) {
            throw new Error(`Plugin "${pluginName}" not found`);
        }

        if (this.initialized.has(pluginName)) {
            this.context.logger.warn(`Plugin "${pluginName}" already initialized`);
            return;
        }

        // 初始化依赖
        for (const dep of plugin.meta.dependencies || []) {
            if (!this.initialized.has(dep)) {
                await this.init(dep);
            }
        }

        // 初始化插件
        await plugin.init(this.context);
        this.initialized.add(pluginName);
        this.context.logger.log(`Plugin initialized: ${pluginName}`);
    }

    /**
     * 初始化所有插件
     */
    async initAll(): Promise<void> {
        for (const [name] of this.plugins) {
            if (!this.initialized.has(name)) {
                await this.init(name);
            }
        }
    }

    /**
     * 销毁插件
     */
    async destroy(pluginName: string): Promise<void> {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) return;

        if (plugin.destroy) {
            await plugin.destroy();
        }

        this.initialized.delete(pluginName);
        this.context.logger.log(`Plugin destroyed: ${pluginName}`);
    }

    /**
     * 销毁所有插件
     */
    async destroyAll(): Promise<void> {
        for (const [name] of this.plugins) {
            if (this.initialized.has(name)) {
                await this.destroy(name);
            }
        }
    }

    /**
     * 获取插件
     */
    get(pluginName: string): Plugin | undefined {
        return this.plugins.get(pluginName);
    }

    /**
     * 获取所有插件
     */
    getAll(): Plugin[] {
        return Array.from(this.plugins.values());
    }

    /**
     * 检查插件是否已初始化
     */
    isInitialized(pluginName: string): boolean {
        return this.initialized.has(pluginName);
    }
}

/**
 * 创建简单的日志器
 */
export function createLogger(prefix: string): Logger {
    return {
        log: (...args) => console.log(`[${prefix}]`, ...args),
        warn: (...args) => console.warn(`[${prefix}]`, ...args),
        error: (...args) => console.error(`[${prefix}]`, ...args),
    };
}
