/**
 * 物料加载器 - 支持远程物料加载
 * 参考 lowcode-engine 的 Assets 管理
 */

import { MaterialMeta } from '@/types';
import { materialRegistry } from './index';

/**
 * Assets JSON 格式定义
 */
export interface AssetsJson {
    version: string;
    packages: PackageInfo[];
    components: MaterialMeta[];
}

export interface PackageInfo {
    name: string;
    version: string;
    urls: string[];
    library: string;
}

/**
 * 物料加载器类
 */
export class MaterialLoader {
    private loadedPackages: Set<string> = new Set();

    /**
     * 从URL加载Assets JSON
     */
    async loadFromUrl(url: string): Promise<void> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load assets from ${url}`);
            }

            const assets: AssetsJson = await response.json();
            await this.loadAssets(assets);
        } catch (error) {
            console.error('Load assets failed:', error);
            throw error;
        }
    }

    /**
     * 加载Assets JSON
     */
    async loadAssets(assets: AssetsJson): Promise<void> {
        // 1. 加载依赖包
        if (assets.packages && assets.packages.length > 0) {
            await this.loadPackages(assets.packages);
        }

        // 2. 注册物料元数据
        if (assets.components && assets.components.length > 0) {
            materialRegistry.registerMaterials(assets.components);
        }

        console.log(`✅ Assets loaded: ${assets.components.length} components`);
    }

    /**
     * 加载依赖包（模拟）
     */
    private async loadPackages(packages: PackageInfo[]): Promise<void> {
        for (const pkg of packages) {
            const key = `${pkg.name}@${pkg.version}`;

            if (this.loadedPackages.has(key)) {
                console.log(`📦 Package already loaded: ${key}`);
                continue;
            }

            // 加载外部脚本
            await this.loadScripts(pkg.urls);
            this.loadedPackages.add(key);

            console.log(`✅ Package loaded: ${key}`);
        }
    }

    /**
     * 动态加载脚本
     */
    private loadScripts(urls: string[]): Promise<void[]> {
        return Promise.all(
            urls.map(url => this.loadScript(url))
        );
    }

    /**
     * 加载单个脚本
     */
    private loadScript(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
            document.head.appendChild(script);
        });
    }

    /**
     * 增量加载Assets
     */
    async loadIncrementalAssets(assets: AssetsJson): Promise<void> {
        await this.loadAssets(assets);
    }

    /**
     * 获取已加载的包列表
     */
    getLoadedPackages(): string[] {
        return Array.from(this.loadedPackages);
    }
}

// 导出单例
export const materialLoader = new MaterialLoader();
