/**
 * 版本管理系统
 * 支持版本控制、历史记录和回滚
 */

import { ComponentSchema } from '@/types';
import { eventBus } from './EventBus';

export interface Version {
    id: string;
    timestamp: number;
    author: string;
    message: string;
    schema: ComponentSchema;
    pageId?: string;
    meta?: Record<string, any>;
}

export interface VersionDiff {
    added: number;
    removed: number;
    modified: number;
    changes: string[];
}

export class VersionManager {
    private versions: Map<string, Version> = new Map();
    private currentVersionId: string | null = null;
    private maxVersions: number = 50; // 最大保存版本数
    private listeners: Function[] = [];

    /**
     * 创建版本
     */
    createVersion(params: {
        schema: ComponentSchema;
        message: string;
        author?: string;
        pageId?: string;
        meta?: Record<string, any>;
    }): Version {
        const version: Version = {
            id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            author: params.author || 'Anonymous',
            message: params.message,
            schema: JSON.parse(JSON.stringify(params.schema)), // 深拷贝
            pageId: params.pageId,
            meta: params.meta || {}
        };

        this.versions.set(version.id, version);
        this.currentVersionId = version.id;

        // 清理旧版本（保持在最大数量内）
        this.cleanupOldVersions();

        this.notifyListeners();
        eventBus.emit('version:created', version);

        console.log(`✅ Version created: ${version.message} by ${version.author}`);
        return version;
    }

    /**
     * 获取版本
     */
    getVersion(versionId: string): Version | undefined {
        return this.versions.get(versionId);
    }

    /**
     * 获取所有版本
     */
    getAllVersions(): Version[] {
        return Array.from(this.versions.values())
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * 获取当前版本
     */
    getCurrentVersion(): Version | null {
        if (!this.currentVersionId) {
            return null;
        }
        return this.versions.get(this.currentVersionId) || null;
    }

    /**
     * 恢复到指定版本
     */
    restoreVersion(versionId: string): Version | null {
        const version = this.versions.get(versionId);

        if (!version) {
            console.warn(`Version ${versionId} not found`);
            return null;
        }

        // 创建新版本（恢复操作也记录为新版本）
        const restoredVersion = this.createVersion({
            schema: version.schema,
            message: `恢复到版本: ${version.message}`,
            author: version.author,
            pageId: version.pageId,
            meta: {
                ...version.meta,
                restoredFrom: versionId
            }
        });

        eventBus.emit('version:restored', { from: versionId, to: restoredVersion.id });

        return restoredVersion;
    }

    /**
     * 对比两个版本
     */
    compareVersions(versionId1: string, versionId2: string): VersionDiff | null {
        const v1 = this.versions.get(versionId1);
        const v2 = this.versions.get(versionId2);

        if (!v1 || !v2) {
            return null;
        }

        // 简单的对比逻辑
        const diff: VersionDiff = {
            added: 0,
            removed: 0,
            modified: 0,
            changes: []
        };

        const str1 = JSON.stringify(v1.schema);
        const str2 = JSON.stringify(v2.schema);

        if (str1 !== str2) {
            diff.modified = 1;
            diff.changes.push('Schema modified');
        }

        return diff;
    }

    /**
     * 删除版本
     */
    deleteVersion(versionId: string): boolean {
        if (versionId === this.currentVersionId) {
            console.warn('Cannot delete current version');
            return false;
        }

        const deleted = this.versions.delete(versionId);

        if (deleted) {
            this.notifyListeners();
            eventBus.emit('version:deleted', versionId);
        }

        return deleted;
    }

    /**
     * 清理旧版本
     */
    private cleanupOldVersions() {
        const versions = this.getAllVersions();

        if (versions.length > this.maxVersions) {
            const toDelete = versions.slice(this.maxVersions);
            toDelete.forEach(v => {
                if (v.id !== this.currentVersionId) {
                    this.versions.delete(v.id);
                }
            });
        }
    }

    /**
     * 导出版本历史
     */
    export(): Version[] {
        return this.getAllVersions();
    }

    /**
     * 导入版本历史
     */
    import(versions: Version[]) {
        this.versions.clear();

        versions.forEach(version => {
            this.versions.set(version.id, version);
        });

        if (versions.length > 0) {
            this.currentVersionId = versions[0].id;
        }

        this.notifyListeners();
        eventBus.emit('version:imported', versions);
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
     * 获取版本数量
     */
    getVersionCount(): number {
        return this.versions.size;
    }

    /**
     * 清空所有版本
     */
    clear() {
        this.versions.clear();
        this.currentVersionId = null;
        this.notifyListeners();
    }

    /**
     * 设置最大版本数
     */
    setMaxVersions(max: number) {
        this.maxVersions = max;
        this.cleanupOldVersions();
    }
}

// 导出单例
export const versionManager = new VersionManager();
