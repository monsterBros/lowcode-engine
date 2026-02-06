/**
 * 物料版本管理系统
 */

export interface MaterialVersion {
    version: string;
    publishTime: string;
    description?: string;
    breaking?: boolean; // 是否包含破坏性更新
}

export interface MaterialVersionInfo {
    componentName: string;
    currentVersion: string;
    latestVersion?: string;
    versions: MaterialVersion[];
}

/**
 * 版本管理器
 */
export class MaterialVersionManager {
    private versionMap: Map<string, MaterialVersionInfo> = new Map();

    /**
     * 注册物料版本信息
     */
    register(info: MaterialVersionInfo): void {
        this.versionMap.set(info.componentName, info);
    }

    /**
     * 获取物料版本信息
     */
    getVersionInfo(componentName: string): MaterialVersionInfo | undefined {
        return this.versionMap.get(componentName);
    }

    /**
     * 比较版本号
     */
    compareVersion(v1: string, v2: string): number {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;

            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }

        return 0;
    }

    /**
     * 检查是否有新版本
     */
    hasUpdate(componentName: string): boolean {
        const info = this.versionMap.get(componentName);
        if (!info || !info.latestVersion) return false;

        return this.compareVersion(info.latestVersion, info.currentVersion) > 0;
    }

    /**
     * 获取所有有更新的物料
     */
    getUpdatableMaterials(): string[] {
        const updatable: string[] = [];

        this.versionMap.forEach((info, componentName) => {
            if (this.hasUpdate(componentName)) {
                updatable.push(componentName);
            }
        });

        return updatable;
    }

    /**
     * 检查版本兼容性
     */
    checkCompatibility(componentName: string, targetVersion: string): {
        compatible: boolean;
        warnings: string[];
    } {
        const info = this.versionMap.get(componentName);
        if (!info) {
            return { compatible: true, warnings: [] };
        }

        const warnings: string[] = [];
        const currentParts = info.currentVersion.split('.').map(Number);
        const targetParts = targetVersion.split('.').map(Number);

        // 主版本号变化表示破坏性更新
        if (targetParts[0] > currentParts[0]) {
            warnings.push('主版本号升级，可能包含破坏性更新');
        }

        // 检查是否有标记为破坏性的版本
        const breakingVersions = info.versions.filter(v =>
            v.breaking && this.compareVersion(v.version, info.currentVersion) > 0 &&
            this.compareVersion(v.version, targetVersion) <= 0
        );

        if (breakingVersions.length > 0) {
            warnings.push(`包含${breakingVersions.length}个破坏性更新版本`);
        }

        return {
            compatible: warnings.length === 0,
            warnings
        };
    }

    /**
     * 更新物料版本
     */
    updateVersion(componentName: string, newVersion: string): void {
        const info = this.versionMap.get(componentName);
        if (info) {
            info.currentVersion = newVersion;
            this.versionMap.set(componentName, info);
        }
    }

    /**
     * 获取版本变更日志
     */
    getChangelog(componentName: string, fromVersion: string, toVersion: string): MaterialVersion[] {
        const info = this.versionMap.get(componentName);
        if (!info) return [];

        return info.versions.filter(v =>
            this.compareVersion(v.version, fromVersion) > 0 &&
            this.compareVersion(v.version, toVersion) <= 0
        ).sort((a, b) => this.compareVersion(b.version, a.version));
    }
}

// 导出单例
export const materialVersionManager = new MaterialVersionManager();

// 示例：注册一些物料版本信息
materialVersionManager.register({
    componentName: 'Button',
    currentVersion: '1.0.0',
    latestVersion: '1.2.0',
    versions: [
        { version: '1.0.0', publishTime: '2024-01-01', description: '初始版本' },
        { version: '1.1.0', publishTime: '2024-02-01', description: '添加更多样式' },
        { version: '1.2.0', publishTime: '2024-03-01', description: '性能优化' },
    ]
});
