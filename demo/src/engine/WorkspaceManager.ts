/**
 * Workspace工作区管理
 * 支持多页面管理
 */

import { ComponentSchema } from '@/types';
import { eventBus } from './EventBus';

export interface Page {
    id: string;
    title: string;
    schema: ComponentSchema;
    icon?: string;
    closeable?: boolean;
    meta?: Record<string, any>;
}

export class WorkspaceManager {
    private pages: Map<string, Page> = new Map();
    private currentPageId: string | null = null;
    private listeners: Function[] = [];

    /**
     * 创建页面
     */
    createPage(page: Omit<Page, 'id'> & { id?: string }): Page {
        const id = page.id || `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newPage: Page = {
            id,
            title: page.title,
            schema: page.schema,
            icon: page.icon,
            closeable: page.closeable ?? true,
            meta: page.meta || {}
        };

        this.pages.set(id, newPage);

        // 如果是第一个页面，自动激活
        if (this.pages.size === 1) {
            this.setCurrentPage(id);
        }

        this.notifyListeners();
        eventBus.emit('workspace:page-created', newPage);

        console.log(`✅ Page created: ${newPage.title} (${id})`);
        return newPage;
    }

    /**
     * 删除页面
     */
    deletePage(pageId: string): boolean {
        const page = this.pages.get(pageId);

        if (!page) {
            console.warn(`Page ${pageId} not found`);
            return false;
        }

        if (!page.closeable) {
            console.warn(`Page ${pageId} is not closeable`);
            return false;
        }

        this.pages.delete(pageId);

        // 如果删除的是当前页面，切换到其他页面
        if (this.currentPageId === pageId) {
            const remainingPages = Array.from(this.pages.keys());
            this.setCurrentPage(remainingPages[0] || null);
        }

        this.notifyListeners();
        eventBus.emit('workspace:page-deleted', pageId);

        console.log(`🗑️ Page deleted: ${pageId}`);
        return true;
    }

    /**
     * 更新页面
     */
    updatePage(pageId: string, updates: Partial<Omit<Page, 'id'>>): boolean {
        const page = this.pages.get(pageId);

        if (!page) {
            console.warn(`Page ${pageId} not found`);
            return false;
        }

        Object.assign(page, updates);
        this.notifyListeners();
        eventBus.emit('workspace:page-updated', page);

        return true;
    }

    /**
     * 获取页面
     */
    getPage(pageId: string): Page | undefined {
        return this.pages.get(pageId);
    }

    /**
     * 获取所有页面
     */
    getAllPages(): Page[] {
        return Array.from(this.pages.values());
    }

    /**
     * 设置当前页面
     */
    setCurrentPage(pageId: string | null): boolean {
        if (pageId && !this.pages.has(pageId)) {
            console.warn(`Page ${pageId} not found`);
            return false;
        }

        const oldPageId = this.currentPageId;
        this.currentPageId = pageId;

        this.notifyListeners();
        eventBus.emit('workspace:page-switched', {
            from: oldPageId,
            to: pageId
        });

        console.log(`📄 Switched to page: ${pageId}`);
        return true;
    }

    /**
     * 获取当前页面
     */
    getCurrentPage(): Page | null {
        if (!this.currentPageId) {
            return null;
        }
        return this.pages.get(this.currentPageId) || null;
    }

    /**
     * 获取当前页面ID
     */
    getCurrentPageId(): string | null {
        return this.currentPageId;
    }

    /**
     * 复制页面
     */
    duplicatePage(pageId: string): Page | null {
        const sourcePage = this.pages.get(pageId);

        if (!sourcePage) {
            console.warn(`Page ${pageId} not found`);
            return null;
        }

        const newPage = this.createPage({
            title: `${sourcePage.title} (副本)`,
            schema: JSON.parse(JSON.stringify(sourcePage.schema)), // 深拷贝
            icon: sourcePage.icon,
            closeable: true,
            meta: { ...sourcePage.meta }
        });

        return newPage;
    }

    /**
     * 重命名页面
     */
    renamePage(pageId: string, newTitle: string): boolean {
        return this.updatePage(pageId, { title: newTitle });
    }

    /**
     * 移动页面
     */
    movePage(pageId: string, toIndex: number): boolean {
        const pages = this.getAllPages();
        const fromIndex = pages.findIndex(p => p.id === pageId);

        if (fromIndex === -1) {
            return false;
        }

        const [movedPage] = pages.splice(fromIndex, 1);
        pages.splice(toIndex, 0, movedPage);

        // 重新设置顺序
        this.pages.clear();
        pages.forEach(page => {
            this.pages.set(page.id, page);
        });

        this.notifyListeners();
        eventBus.emit('workspace:page-moved', { pageId, fromIndex, toIndex });

        return true;
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
     * 导出所有页面
     */
    export(): { pages: Page[]; currentPageId: string | null } {
        return {
            pages: this.getAllPages(),
            currentPageId: this.currentPageId
        };
    }

    /**
     * 导入页面
     */
    import(data: { pages: Page[]; currentPageId?: string | null }) {
        this.pages.clear();

        data.pages.forEach(page => {
            this.pages.set(page.id, page);
        });

        if (data.currentPageId && this.pages.has(data.currentPageId)) {
            this.currentPageId = data.currentPageId;
        } else if (data.pages.length > 0) {
            this.currentPageId = data.pages[0].id;
        }

        this.notifyListeners();
        eventBus.emit('workspace:imported', data);
    }

    /**
     * 清空所有页面
     */
    clear() {
        this.pages.clear();
        this.currentPageId = null;
        this.notifyListeners();
    }

    /**
     * 获取页面数量
     */
    getPageCount(): number {
        return this.pages.size;
    }
}

// 导出单例
export const workspaceManager = new WorkspaceManager();
