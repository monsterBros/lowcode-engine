/**
 * 示例插件 - 快捷键插件
 * 展示如何创建一个简单的lowcode引擎插件
 */

import { Plugin, PluginContext } from '../PluginManager';
import { message } from 'antd';

export const HotkeyPlugin: Plugin = {
    meta: {
        name: 'hotkey-plugin',
        version: '1.0.0',
        description: '快捷键插件 - 提供Ctrl+S保存等快捷键',
    },

    init: (context: PluginContext) => {
        const { logger } = context;
        logger.log('HotkeyPlugin initialized');

        // 注册快捷键
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S 保存
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                message.success('快捷保存 (Ctrl+S)');
                logger.log('Hotkey triggered: Ctrl+S');
            }

            // Ctrl+P 预览
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                message.info('快捷预览 (Ctrl+P)');
                logger.log('Hotkey triggered: Ctrl+P');
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // 保存清理函数
        (context as any).__hotkeyCleanup = () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    },

    destroy: async (context?: any) => {
        if (context?.__hotkeyCleanup) {
            context.__hotkeyCleanup();
        }
    },
};
