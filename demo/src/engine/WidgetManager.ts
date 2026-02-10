/**
 * Widget系统
 * 用于管理和注册可扩展的面板组件
 */

import React from 'react';

export type WidgetArea = 'left' | 'right' | 'top' | 'bottom' | 'toolbar' | 'statusbar';

export interface Widget {
    name: string;                          // Widget唯一名称
    title: string;                         // 显示标题
    area: WidgetArea;                      // 所属区域
    component: React.ComponentType<any>;   // Widget组件
    icon?: React.ReactNode;                // 图标
    order?: number;                        // 排序权重
    visible?: boolean;                     // 是否可见
    closeable?: boolean;                   // 是否可关闭
    props?: Record<string, any>;           // 传递给组件的props
}

export class WidgetManager {
    private widgets: Map<string, Widget> = new Map();
    private listeners: Function[] = [];

    /**
     * 注册Widget
     */
    register(widget: Widget) {
        if (this.widgets.has(widget.name)) {
            console.warn(`Widget "${widget.name}" already exists, overwriting`);
        }

        const fullWidget: Widget = {
            ...widget,
            order: widget.order ?? 100,
            visible: widget.visible ?? true,
            closeable: widget.closeable ?? false,
        };

        this.widgets.set(widget.name, fullWidget);
        this.notifyListeners();

        console.log(`✅ Widget registered: ${widget.name} (${widget.area})`);
    }

    /**
     * 批量注册
     */
    registerBatch(widgets: Widget[]) {
        widgets.forEach(w => this.register(w));
    }

    /**
     * 注销Widget
     */
    unregister(name: string) {
        const existed = this.widgets.delete(name);
        if (existed) {
            this.notifyListeners();
        }
        return existed;
    }

    /**
     * 获取Widget
     */
    get(name: string): Widget | undefined {
        return this.widgets.get(name);
    }

    /**
     * 获取所有Widget
     */
    getAll(): Widget[] {
        return Array.from(this.widgets.values());
    }

    /**
     * 按区域获取Widget
     */
    getByArea(area: WidgetArea): Widget[] {
        return Array.from(this.widgets.values())
            .filter(w => w.area === area && w.visible)
            .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
    }

    /**
     * 显示Widget
     */
    show(name: string) {
        const widget = this.widgets.get(name);
        if (widget) {
            widget.visible = true;
            this.notifyListeners();
        }
    }

    /**
     * 隐藏Widget
     */
    hide(name: string) {
        const widget = this.widgets.get(name);
        if (widget) {
            widget.visible = false;
            this.notifyListeners();
        }
    }

    /**
     * 切换可见性
     */
    toggle(name: string) {
        const widget = this.widgets.get(name);
        if (widget) {
            widget.visible = !widget.visible;
            this.notifyListeners();
        }
    }

    /**
     * 订阅变化
     */
    subscribe(callback: Function) {
        this.listeners.push(callback);
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * 通知监听器
     */
    private notifyListeners() {
        this.listeners.forEach(cb => cb());
    }

    /**
     * 清空所有Widget
     */
    clear() {
        this.widgets.clear();
        this.notifyListeners();
    }
}

// 导出单例
export const widgetManager = new WidgetManager();
