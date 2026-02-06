/**
 * 示例插件 - 自动保存插件
 */

import { Plugin, PluginContext } from '../engine/PluginManager';

export const AutoSavePlugin: Plugin = {
    meta: {
        name: 'auto-save-plugin',
        version: '1.0.0',
        description: '自动保存插件 - 每30秒自动保存一次',
        dependencies: [],
    },

    init: (context: PluginContext) => {
        const { logger, config } = context;
        const interval = config.autoSaveInterval || 30000; // 默认30秒

        logger.log(`AutoSavePlugin initialized with interval: ${interval}ms`);

        const timer = setInterval(() => {
            // 这里可以调用保存API
            logger.log('Auto save triggered');
            console.log('[AutoSave] Schema auto-saved');
        }, interval);

        // 保存定时器以便清理
        (context as any).__autoSaveTimer = timer;
    },

    destroy: async (context?: any) => {
        if (context?.__autoSaveTimer) {
            clearInterval(context.__autoSaveTimer);
            context.logger?.log('AutoSavePlugin destroyed');
        }
    },
};
