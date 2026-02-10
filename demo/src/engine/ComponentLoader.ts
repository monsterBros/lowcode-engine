import React from 'react';
import { ComponentPackage, ValidationResult, LoadOptions } from '@/types/componentPackage';
import { componentValidator } from './ComponentValidator';
import { materialRegistry } from '@/materials/registry';

/**
 * 组件加载器
 * 负责加载和注册第三方组件
 */
export class ComponentLoader {
    /**
     * 注册组件（核心API）
     * @param pkg 组件包
     * @param options 加载选项
     * @returns 校验结果
     */
    async register(pkg: ComponentPackage, options: LoadOptions = {}): Promise<ValidationResult> {
        // 1. 校验组件
        if (!options.skipValidation) {
            const result = componentValidator.validate(pkg);

            if (!result.success) {
                return result;
            }
        }

        // 2. 检查是否覆盖
        if (materialRegistry.has(pkg.meta.componentName) && !options.overwrite) {
            return {
                success: false,
                errors: [{
                    type: 'metadata',
                    field: 'componentName',
                    message: `组件 "${pkg.meta.componentName}" 已存在`,
                    suggestion: '使用 overwrite: true 选项覆盖'
                }],
                warnings: []
            };
        }

        // 3. 注册到物料系统
        try {
            materialRegistry.register({
                componentName: pkg.meta.componentName,
                component: pkg.component,
                meta: {
                    title: pkg.meta.title,
                    icon: pkg.icon,
                    category: pkg.category || 'custom',
                    props: pkg.meta.props,
                    isContainer: pkg.meta.isContainer,
                    screenshot: pkg.meta.screenshot
                }
            });

            console.log(`✅ 组件 "${pkg.meta.componentName}" 注册成功！`);

            return {
                success: true,
                errors: [],
                warnings: [],
                componentName: pkg.meta.componentName
            };
        } catch (error) {
            return {
                success: false,
                errors: [{
                    type: 'runtime',
                    message: `注册失败: ${error instanceof Error ? error.message : '未知错误'}`,
                }],
                warnings: []
            };
        }
    }

    /**
     * 从URL加载组件
     * @param url 组件URL（必须导出ComponentPackage）
     * @param options 加载选项
     */
    async loadFromUrl(url: string, options: LoadOptions = {}): Promise<ValidationResult> {
        try {
            // 动态导入
            const module = await import(/* @vite-ignore */ url);
            const pkg = module.default || module.ComponentPackage;

            if (!pkg) {
                return {
                    success: false,
                    errors: [{
                        type: 'structure',
                        message: 'URL 未导出有效的组件包',
                        suggestion: '确保导出 ComponentPackage 对象'
                    }],
                    warnings: []
                };
            }

            return this.register(pkg, options);
        } catch (error) {
            return {
                success: false,
                errors: [{
                    type: 'runtime',
                    message: `加载失败: ${error instanceof Error ? error.message : '未知错误'}`,
                    suggestion: '检查URL是否正确，组件是否可访问'
                }],
                warnings: []
            };
        }
    }

    /**
     * 从代码字符串加载组件
     * @param code 组件代码（必须导出ComponentPackage）
     * @param options 加载选项
     */
    async loadFromCode(code: string, options: LoadOptions = {}): Promise<ValidationResult> {
        try {
            // 使用Function构造器执行代码（注意：有安全风险）
            if (!options.allowUnsafe) {
                return {
                    success: false,
                    errors: [{
                        type: 'security',
                        message: '从代码加载需要启用 allowUnsafe 选项',
                        suggestion: '使用 loadFromUrl 或确认代码安全后启用 allowUnsafe'
                    }],
                    warnings: []
                };
            }

            // 创建一个安全的执行环境
            const exports: any = {};
            const module = { exports };

            // 执行代码
            const fn = new Function('exports', 'module', 'React', code);
            fn(exports, module, React);

            const pkg = module.exports.default || module.exports;

            if (!pkg) {
                return {
                    success: false,
                    errors: [{
                        type: 'structure',
                        message: '代码未导出有效的组件包',
                        suggestion: '确保使用 module.exports = ComponentPackage'
                    }],
                    warnings: []
                };
            }

            return this.register(pkg, options);
        } catch (error) {
            return {
                success: false,
                errors: [{
                    type: 'runtime',
                    message: `代码执行失败: ${error instanceof Error ? error.message : '未知错误'}`,
                    suggestion: '检查代码语法和导出格式'
                }],
                warnings: []
            };
        }
    }

    /**
     * 批量注册组件
     * @param packages 组件包数组
     * @param options 加载选项
     * @returns 每个组件的校验结果
     */
    async registerBatch(
        packages: ComponentPackage[],
        options: LoadOptions = {}
    ): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];

        for (const pkg of packages) {
            const result = await this.register(pkg, options);
            results.push(result);
        }

        return results;
    }

    /**
     * 卸载组件
     * @param componentName 组件名
     */
    unregister(componentName: string): boolean {
        return materialRegistry.unregister(componentName);
    }

    /**
     * 获取已注册的第三方组件列表
     */
    getRegisteredComponents(): string[] {
        return materialRegistry.getAll()
            .filter(m => m.meta?.category === 'custom')
            .map(m => m.componentName);
    }
}

// 导出单例
export const componentLoader = new ComponentLoader();

// 导出到全局（方便控制台调用）
if (typeof window !== 'undefined') {
    (window as any).componentLoader = componentLoader;
}
