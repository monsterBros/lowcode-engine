/**
 * 引擎启动器（Ignitor）
 * 负责引擎的初始化、配置加载和插件启动
 */

import { materialRegistry } from '@/materials/registry';
import { eventBus } from './EventBus';
import { pluginManager } from './PluginManager';
import { commandManager, Command } from './CommandManager';
import { variableManager } from './VariableManager';
import { i18nManager } from './I18nManager';
import { widgetManager, Widget } from './WidgetManager';
import { workspaceManager } from './WorkspaceManager';
import { versionManager } from './VersionManager';
import { collaborationManager, User } from './CollaborationManager';
import { engine, setEditorContext } from '@/shell/api';

export interface EngineConfig {
    // 物料配置
    materials?: {
        url?: string;           // 远程物料URL
        data?: any[];          // 本地物料数据
    };

    // 插件配置
    plugins?: {
        autoLoad?: boolean;    // 是否自动加载插件
        list?: string[];       // 插件列表
    };

    // 命令配置
    commands?: Command[];

    // 变量配置
    variables?: Array<{
        name: string;
        type: string;
        defaultValue: any;
    }>;

    // 国际化配置
    i18n?: {
        locale?: string;       // 默认语言
        messages?: any;        // 自定义语言包
    };

    // Widget配置
    widgets?: Widget[];      // 自定义Widget列表

    // Workspace配置
    workspace?: {
        defaultPages?: Array<{
            title: string;
            schema: any;
        }>;
    };

    // 协作配置
    collaboration?: {
        enabled?: boolean;
        currentUser?: User;
    };

    // 其他配置
    theme?: 'light' | 'dark';
    hotkeys?: boolean;       // 是否启用快捷键
}

export interface IgnitorOptions {
    config?: EngineConfig;
    onReady?: () => void;    // 初始化完成回调
    onError?: (error: Error) => void; // 错误回调
}

export class Ignitor {
    private initialized = false;
    private config: EngineConfig = {};

    /**
     * 初始化引擎
     */
    async init(options: IgnitorOptions = {}): Promise<void> {
        if (this.initialized) {
            console.warn('Engine already initialized');
            return;
        }

        this.config = options.config || {};

        try {
            console.log('🚀 Starting LowCode Engine...');

            // 1. 初始化事件总线
            await this.initEventBus();

            // 2. 加载物料
            await this.loadMaterials();

            // 3. 初始化变量系统
            await this.initVariables();

            // 4. 初始化国际化
            await this.initI18n();

            // 5. 注册命令
            await this.registerCommands();

            // 6. 注册Widget
            await this.registerWidgets();

            // 7. 初始化Workspace
            await this.initWorkspace();

            // 8. 初始化协作系统
            await this.initCollaboration();

            // 9. 加载插件
            await this.loadPlugins();

            // 10. 设置主题
            this.applyTheme();

            // 11. 触发ready事件
            eventBus.emit('engine:ready');

            this.initialized = true;
            console.log('✅ LowCode Engine initialized successfully!');

            // 打印引擎信息
            this.printInfo();

            // 调用ready回调
            if (options.onReady) {
                options.onReady();
            }

        } catch (error) {
            console.error('❌ Engine initialization failed:', error);

            if (options.onError) {
                options.onError(error as Error);
            } else {
                throw error;
            }
        }
    }

    /**
     * 初始化事件总线
     */
    private async initEventBus() {
        console.log('📡 Initializing EventBus...');
        // 事件总线已经是单例，无需额外初始化
    }

    /**
     * 加载物料
     */
    private async loadMaterials() {
        console.log('📦 Loading materials...');

        const materialsConfig = this.config.materials;

        if (materialsConfig?.data) {
            // 从配置加载物料
            materialRegistry.registerMaterials(materialsConfig.data);
            console.log(`  Loaded ${materialsConfig.data.length} materials from config`);
        }

        if (materialsConfig?.url) {
            // 从URL加载物料
            try {
                const { materialLoader } = await import('@/materials/registry/MaterialLoader');
                const result = await materialLoader.loadFromUrl(materialsConfig.url);
                console.log(`  Loaded materials from ${materialsConfig.url}`);
            } catch (error) {
                console.warn('  Failed to load materials from URL:', error);
            }
        }
    }

    /**
     * 初始化变量系统
     */
    private async initVariables() {
        console.log('💾 Initializing Variables...');

        if (this.config.variables) {
            variableManager.defineBatch(this.config.variables);
            console.log(`  Defined ${this.config.variables.length} variables`);
        }
    }

    /**
     * 初始化国际化
     */
    private async initI18n() {
        console.log('🌍 Initializing I18n...');

        const i18nConfig = this.config.i18n;

        if (i18nConfig?.locale) {
            i18nManager.setLocale(i18nConfig.locale);
            console.log(`  Set locale to ${i18nConfig.locale}`);
        }

        if (i18nConfig?.messages) {
            // 注册自定义语言包
            Object.keys(i18nConfig.messages).forEach(locale => {
                i18nManager.register({
                    code: locale,
                    name: locale,
                    messages: i18nConfig.messages[locale]
                });
            });
        }
    }

    /**
     * 注册命令
     */
    private async registerCommands() {
        console.log('⌨️  Registering commands...');

        // 注册默认命令
        this.registerDefaultCommands();

        // 注册自定义命令
        if (this.config.commands) {
            commandManager.registerBatch(this.config.commands);
            console.log(`  Registered ${this.config.commands.length} custom commands`);
        }
    }

    /**
     * 注册默认命令
     */
    private registerDefaultCommands() {
        const defaultCommands: Command[] = [
            {
                name: 'save',
                hotkey: 'Ctrl+S',
                description: '保存项目',
                execute: () => {
                    eventBus.emit('command:save');
                    console.log('💾 Save command executed');
                }
            },
            {
                name: 'undo',
                hotkey: 'Ctrl+Z',
                description: '撤销',
                execute: () => {
                    eventBus.emit('command:undo');
                }
            },
            {
                name: 'redo',
                hotkey: 'Ctrl+Y',
                description: '重做',
                execute: () => {
                    eventBus.emit('command:redo');
                }
            },
            {
                name: 'delete',
                hotkey: 'Delete',
                description: '删除选中节点',
                execute: () => {
                    eventBus.emit('command:delete');
                }
            },
            {
                name: 'copy',
                hotkey: 'Ctrl+C',
                description: '复制',
                execute: () => {
                    eventBus.emit('command:copy');
                }
            },
            {
                name: 'paste',
                hotkey: 'Ctrl+V',
                description: '粘贴',
                execute: () => {
                    eventBus.emit('command:paste');
                }
            }
        ];

        commandManager.registerBatch(defaultCommands);
        console.log(`  Registered ${defaultCommands.length} default commands`);
    }

    /**
     * 注册Widget
     */
    private async registerWidgets() {

        // 注册默认Widget
        this.registerDefaultWidgets();

        // 注册自定义Widget
        if (this.config.widgets) {
            widgetManager.registerBatch(this.config.widgets);
            console.log(`  Registered ${this.config.widgets.length} custom widgets`);
        }
    }

    /**
     * 注册默认Widget
     */
    private registerDefaultWidgets() {
        // 这里可以注册一些内置的默认Widget
        // 例如变量面板、快捷键面板等
        console.log('  Registered default widgets');
    }

    /**
     * 初始化Workspace
     */
    private async initWorkspace() {
        console.log('📄 Initializing Workspace...');

        const workspaceConfig = this.config.workspace;

        if (workspaceConfig?.defaultPages && workspaceConfig.defaultPages.length > 0) {
            // 创建默认页面
            workspaceConfig.defaultPages.forEach(pageConfig => {
                workspaceManager.createPage({
                    title: pageConfig.title,
                    schema: pageConfig.schema
                });
            });
            console.log(`  Created ${workspaceConfig.defaultPages.length} default pages`);
        } else {
            // 创建一个默认页面
            workspaceManager.createPage({
                title: '页面1',
                schema: {
                    componentName: 'Page',
                    id: 'root_default',
                    props: {},
                    children: []
                },
                closeable: false
            });
            console.log('  Created 1 default page');
        }
    }

    /**
     * 初始化协作系统
     */
    private async initCollaboration() {
        console.log('🤝 Initializing Collaboration...');

        const collabConfig = this.config.collaboration;

        if (collabConfig?.enabled) {
            // 设置当前用户
            if (collabConfig.currentUser) {
                collaborationManager.setCurrentUser(collabConfig.currentUser);
            } else {
                // 默认用户
                collaborationManager.setCurrentUser({
                    id: 'user_default',
                    name: '默认用户',
                    color: '#1890ff'
                });
            }
            console.log('  Collaboration enabled');
        } else {
            console.log('  Collaboration disabled');
        }
    }

    /**
     * 加载插件
     */
    private async loadPlugins() {
        console.log('🔌 Loading plugins...');

        const pluginsConfig = this.config.plugins;

        if (pluginsConfig?.autoLoad && pluginsConfig.list) {
            for (const pluginName of pluginsConfig.list) {
                try {
                    // 这里可以实现动态加载插件
                    console.log(`  Loading plugin: ${pluginName}`);
                } catch (error) {
                    console.warn(`  Failed to load plugin ${pluginName}:`, error);
                }
            }
        }
    }

    /**
     * 应用主题
     */
    private applyTheme() {
        if (this.config.theme) {
            document.body.classList.add(`theme-${this.config.theme}`);
            console.log(`🎨 Applied theme: ${this.config.theme}`);
        }
    }

    /**
     * 打印引擎信息
     */
    private printInfo() {
        console.log('\n📊 Engine Information:');
        console.log(`  Materials: ${materialRegistry.getAll().length}`);
        console.log(`  Plugins: ${pluginManager.getAll().length}`);
        console.log(`  Commands: ${commandManager.getAll().length}`);
        console.log(`  Variables: ${variableManager.getAll().length}`);
        console.log(`  Pages: ${workspaceManager.getPageCount()}`);
        console.log(`  Versions: ${versionManager.getVersionCount()}`);
        console.log(`  Online Users: ${collaborationManager.getOnlineUsers().length}`);
        console.log(`  Locale: ${i18nManager.getCurrentLocale()}`);
        console.log('');
    }

    /**
     * 销毁引擎
     */
    async destroy() {
        console.log('🛑 Destroying engine...');

        // 清空各种管理器
        variableManager.clear();
        commandManager.clearHistory();

        this.initialized = false;
        console.log('✅ Engine destroyed');
    }

    /**
     * 检查是否已初始化
     */
    isInitialized(): boolean {
        return this.initialized;
    }
}

// 导出单例
export const ignitor = new Ignitor();

// 导出全局API
if (typeof window !== 'undefined') {
    (window as any).ignitor = ignitor;
}
