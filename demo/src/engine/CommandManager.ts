/**
 * 命令管理器
 * 提供统一的命令注册、执行和快捷键绑定
 */

export interface Command {
    name: string;                    // 命令名称
    execute: (...args: any[]) => void | Promise<void>; // 执行函数
    undo?: () => void | Promise<void>;  // 撤销函数（可选）
    description?: string;             // 描述
    hotkey?: string;                 // 快捷键（如 'Ctrl+S'）
    enabled?: () => boolean;         // 是否可用
}

export interface CommandHistory {
    command: string;
    args: any[];
    timestamp: number;
}

export class CommandManager {
    private commands = new Map<string, Command>();
    private hotkeys = new Map<string, string>();  // hotkey -> command name
    private history: CommandHistory[] = [];
    private maxHistory = 50;
    private listeners: Function[] = [];

    constructor() {
        this.initHotkeyListener();
    }

    /**
     * 注册命令
     */
    register(command: Command) {
        this.commands.set(command.name, command);

        // 注册快捷键
        if (command.hotkey) {
            this.hotkeys.set(command.hotkey.toLowerCase(), command.name);
        }

        console.log(`✅ 命令已注册: ${command.name}${command.hotkey ? ` (${command.hotkey})` : ''}`);
    }

    /**
     * 批量注册命令
     */
    registerBatch(commands: Command[]) {
        commands.forEach(cmd => this.register(cmd));
    }

    /**
     * 执行命令
     */
    async execute(name: string, ...args: any[]): Promise<boolean> {
        const command = this.commands.get(name);

        if (!command) {
            console.warn(`Command "${name}" not found`);
            return false;
        }

        // 检查是否可用
        if (command.enabled && !command.enabled()) {
            console.warn(`Command "${name}" is disabled`);
            return false;
        }

        try {
            await command.execute(...args);

            // 记录历史
            this.history.push({
                command: name,
                args,
                timestamp: Date.now()
            });

            // 限制历史记录长度
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }

            // 通知监听器
            this.notifyListeners(name, args);

            return true;
        } catch (error) {
            console.error(`Command "${name}" execution failed:`, error);
            return false;
        }
    }

    /**
     * 撤销命令
     */
    async undo(commandName: string): Promise<boolean> {
        const command = this.commands.get(commandName);

        if (!command || !command.undo) {
            console.warn(`Command "${commandName}" does not support undo`);
            return false;
        }

        try {
            await command.undo();
            return true;
        } catch (error) {
            console.error(`Command "${commandName}" undo failed:`, error);
            return false;
        }
    }

    /**
     * 获取命令
     */
    get(name: string): Command | undefined {
        return this.commands.get(name);
    }

    /**
     * 获取所有命令
     */
    getAll(): Command[] {
        return Array.from(this.commands.values());
    }

    /**
     * 获取命令历史
     */
    getHistory(): CommandHistory[] {
        return [...this.history];
    }

    /**
     * 清除历史
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * 绑定快捷键
     */
    bindHotkey(hotkey: string, commandName: string) {
        this.hotkeys.set(hotkey.toLowerCase(), commandName);
    }

    /**
     * 取消快捷键绑定
     */
    unbindHotkey(hotkey: string) {
        this.hotkeys.delete(hotkey.toLowerCase());
    }

    /**
     * 订阅命令执行事件
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
     * 通知监听器
     */
    private notifyListeners(commandName: string, args: any[]) {
        this.listeners.forEach(cb => cb(commandName, args));
    }

    /**
     * 初始化快捷键监听
     */
    private initHotkeyListener() {
        if (typeof window === 'undefined') return;

        document.addEventListener('keydown', (e) => {
            const hotkeyString = this.getHotkeyString(e);
            const commandName = this.hotkeys.get(hotkeyString);

            if (commandName) {
                // 检查是否在输入框中
                const target = e.target as HTMLElement;
                const isInput = target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable;

                // 如果在输入框中，只响应特定快捷键
                if (isInput && !this.isSpecialHotkey(hotkeyString)) {
                    return;
                }

                e.preventDefault();
                this.execute(commandName);
            }
        });
    }

    /**
     * 获取快捷键字符串
     */
    private getHotkeyString(e: KeyboardEvent): string {
        const parts: string[] = [];

        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');

        // 主键
        let key = e.key.toLowerCase();
        if (key.length === 1) {
            key = key.toUpperCase();
        }
        parts.push(key);

        return parts.join('+').toLowerCase();
    }

    /**
     * 判断是否为特殊快捷键（允许在输入框中触发）
     */
    private isSpecialHotkey(hotkey: string): boolean {
        const specialHotkeys = [
            'ctrl+s',  // 保存
            'ctrl+z',  // 撤销
            'ctrl+y',  // 重做
            'ctrl+shift+z'  // 重做
        ];
        return specialHotkeys.includes(hotkey);
    }

    /**
     * 注销命令
     */
    unregister(name: string) {
        const command = this.commands.get(name);
        if (command && command.hotkey) {
            this.hotkeys.delete(command.hotkey.toLowerCase());
        }
        this.commands.delete(name);
    }
}

// 导出单例
export const commandManager = new CommandManager();
