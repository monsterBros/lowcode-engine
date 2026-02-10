/**
 * 国际化管理器
 * 支持多语言切换
 */

export interface I18nMessages {
    [key: string]: string | I18nMessages;
}

export interface Locale {
    code: string;           // 语言代码，如 'zh-CN', 'en-US'
    name: string;           // 显示名称
    messages: I18nMessages;  // 翻译文本
}

export class I18nManager {
    private locales: Map<string, Locale> = new Map();
    private currentLocale: string = 'zh-CN';
    private listeners: Function[] = [];

    constructor() {
        // 注册默认中文
        this.register({
            code: 'zh-CN',
            name: '简体中文',
            messages: {
                toolbar: {
                    save: '保存',
                    preview: '预览',
                    export: '导出',
                    undo: '撤销',
                    redo: '重做',
                    import: '导入组件',
                },
                panel: {
                    materials: '组件',
                    properties: '属性',
                    events: '事件',
                    dataSource: '数据源',
                    outline: '大纲',
                },
                common: {
                    confirm: '确认',
                    cancel: '取消',
                    delete: '删除',
                    add: '添加',
                }
            }
        });

        // 注册English
        this.register({
            code: 'en-US',
            name: 'English',
            messages: {
                toolbar: {
                    save: 'Save',
                    preview: 'Preview',
                    export: ' Export',
                    undo: 'Undo',
                    redo: 'Redo',
                    import: 'Import Component',
                },
                panel: {
                    materials: 'Components',
                    properties: 'Properties',
                    events: 'Events',
                    dataSource: 'Data Source',
                    outline: 'Outline',
                },
                common: {
                    confirm: 'Confirm',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    add: 'Add',
                }
            }
        });
    }

    /**
     * 注册语言包
     */
    register(locale: Locale) {
        this.locales.set(locale.code, locale);
    }

    /**
     * 切换语言
     */
    setLocale(localeCode: string) {
        if (this.locales.has(localeCode)) {
            this.currentLocale = localeCode;
            this.notify();
        } else {
            console.warn(`Locale ${localeCode} not found`);
        }
    }

    /**
     * 获取当前语言代码
     */
    getCurrentLocale(): string {
        return this.currentLocale;
    }

    /**
     * 获取所有可用语言
     */
    getAvailableLocales(): Locale[] {
        return Array.from(this.locales.values());
    }

    /**
     * 翻译文本
     * @param key 翻译键，支持点号分隔的路径，如 'toolbar.save'
     * @param fallback 找不到时的备用文本
     */
    t(key: string, fallback?: string): string {
        const locale = this.locales.get(this.currentLocale);
        if (!locale) {
            return fallback || key;
        }

        const keys = key.split('.');
        let value: any = locale.messages;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback || key;
            }
        }

        return typeof value === 'string' ? value : (fallback || key);
    }

    /**
     * 订阅语言变化
     */
    subscribe(callback: Function) {
        this.listeners.push(callback);
    }

    /**
     * 取消订阅
     */
    unsubscribe(callback: Function) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * 通知订阅者
     */
    private notify() {
        this.listeners.forEach(cb => cb(this.currentLocale));
    }
}

// 导出单例
export const i18nManager = new I18nManager();

// 导出快捷方法
export const t = (key: string, fallback?: string) => i18nManager.t(key, fallback);
