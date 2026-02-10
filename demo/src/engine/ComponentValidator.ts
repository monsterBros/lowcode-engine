import { ComponentPackage, ValidationResult, ValidationError, ValidationWarning } from '@/types/componentPackage';
import { materialRegistry } from '@/materials/registry';
import React from 'react';

/**
 * 组件校验器
 * 负责验证第三方组件是否符合规范
 */
export class ComponentValidator {
    /**
     * 完整校验
     */
    validate(pkg: ComponentPackage): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // 1. 结构校验
        const structureErrors = this.validateStructure(pkg);
        errors.push(...structureErrors);

        // 2. 元数据校验
        const metadataErrors = this.validateMetadata(pkg);
        errors.push(...metadataErrors);

        // 3. 运行时校验
        if (errors.length === 0) {
            const runtimeResult = this.validateRuntime(pkg);
            errors.push(...runtimeResult.errors);
            warnings.push(...runtimeResult.warnings);
        }

        // 4. 安全校验
        const securityErrors = this.validateSecurity(pkg);
        errors.push(...securityErrors);

        return {
            success: errors.length === 0,
            errors,
            warnings,
            componentName: pkg.meta?.componentName
        };
    }

    /**
     * 结构校验
     */
    private validateStructure(pkg: any): ValidationError[] {
        const errors: ValidationError[] = [];

        // 检查必需字段
        if (!pkg.name) {
            errors.push({
                type: 'structure',
                field: 'name',
                message: '缺少组件包名称',
                suggestion: '添加 name 字段，如: "my-component"'
            });
        }

        if (!pkg.version) {
            errors.push({
                type: 'structure',
                field: 'version',
                message: '缺少版本号',
                suggestion: '添加 version 字段，如: "1.0.0"'
            });
        } else if (!this.isValidSemver(pkg.version)) {
            errors.push({
                type: 'structure',
                field: 'version',
                message: '版本号格式不正确',
                suggestion: '使用 semver 格式，如: "1.0.0"'
            });
        }

        if (!pkg.component) {
            errors.push({
                type: 'structure',
                field: 'component',
                message: '缺少组件定义',
                suggestion: '添加 component 字段，必须是 React 组件'
            });
        } else if (!this.isReactComponent(pkg.component)) {
            errors.push({
                type: 'structure',
                field: 'component',
                message: '组件不是有效的 React 组件',
                suggestion: '确保组件是 React.FC 或 React.Component'
            });
        }

        if (!pkg.meta) {
            errors.push({
                type: 'structure',
                field: 'meta',
                message: '缺少组件元数据',
                suggestion: '添加 meta 字段，包含 componentName, title, props 等'
            });
        }

        return errors;
    }

    /**
     * 元数据校验
     */
    private validateMetadata(pkg: ComponentPackage): ValidationError[] {
        const errors: ValidationError[] = [];
        const meta = pkg.meta;

        if (!meta) return errors;

        // 检查componentName
        if (!meta.componentName) {
            errors.push({
                type: 'metadata',
                field: 'meta.componentName',
                message: '缺少组件名称',
                suggestion: '添加 componentName，如: "MyButton"'
            });
        } else {
            // 检查命名规范（PascalCase）
            if (!/^[A-Z][a-zA-Z0-9]*$/.test(meta.componentName)) {
                errors.push({
                    type: 'metadata',
                    field: 'meta.componentName',
                    message: '组件名必须使用 PascalCase',
                    suggestion: `将 "${meta.componentName}" 改为 PascalCase 格式`
                });
            }

            // 检查是否重复
            if (materialRegistry.has(meta.componentName)) {
                errors.push({
                    type: 'metadata',
                    field: 'meta.componentName',
                    message: `组件名 "${meta.componentName}" 已存在`,
                    suggestion: '使用其他名称或启用覆盖模式'
                });
            }
        }

        // 检查title
        if (!meta.title) {
            errors.push({
                type: 'metadata',
                field: 'meta.title',
                message: '缺少组件显示名称',
                suggestion: '添加 title，如: "自定义按钮"'
            });
        }

        // 检查props
        if (!meta.props || !Array.isArray(meta.props)) {
            errors.push({
                type: 'metadata',
                field: 'meta.props',
                message: 'props 必须是数组',
                suggestion: '设置 props: []'
            });
        } else {
            meta.props.forEach((prop, index) => {
                if (!prop.name) {
                    errors.push({
                        type: 'metadata',
                        field: `meta.props[${index}].name`,
                        message: `第 ${index + 1} 个属性缺少 name`,
                        suggestion: '添加属性名'
                    });
                }

                if (!prop.setter) {
                    errors.push({
                        type: 'metadata',
                        field: `meta.props[${index}].setter`,
                        message: `属性 "${prop.name}" 缺少 setter 配置`,
                        suggestion: '添加 setter: { componentName: "StringSetter" }'
                    });
                } else if (!this.isValidSetter(prop.setter.componentName)) {
                    errors.push({
                        type: 'metadata',
                        field: `meta.props[${index}].setter`,
                        message: `Setter "${prop.setter.componentName}" 不存在`,
                        suggestion: '使用已注册的 Setter 类型'
                    });
                }
            });
        }

        // 检查events
        if (meta.events) {
            meta.events.forEach((event, index) => {
                if (!event.name) {
                    errors.push({
                        type: 'metadata',
                        field: `meta.events[${index}].name`,
                        message: `第 ${index + 1} 个事件缺少 name`,
                        suggestion: '添加事件名'
                    });
                } else if (!event.name.startsWith('on')) {
                    errors.push({
                        type: 'metadata',
                        field: `meta.events[${index}].name`,
                        message: `事件名 "${event.name}" 必须以 "on" 开头`,
                        suggestion: `改为 "on${event.name.charAt(0).toUpperCase() + event.name.slice(1)}"`
                    });
                }
            });
        }

        return errors;
    }

    /**
     * 运行时校验
     */
    private validateRuntime(pkg: ComponentPackage): { errors: ValidationError[], warnings: ValidationWarning[] } {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        try {
            // 测试组件是否能正常创建
            const element = React.createElement(pkg.component, {});

            // 性能检查：组件大小
            const componentStr = pkg.component.toString();
            if (componentStr.length > 50000) {
                warnings.push({
                    type: 'performance',
                    message: '组件代码过大（>50KB）',
                    suggestion: '考虑代码分割或优化'
                });
            }
        } catch (error) {
            errors.push({
                type: 'runtime',
                message: `组件实例化失败: ${error instanceof Error ? error.message : '未知错误'}`,
                suggestion: '检查组件定义是否正确'
            });
        }

        return { errors, warnings };
    }

    /**
     * 安全校验
     */
    private validateSecurity(pkg: ComponentPackage): ValidationError[] {
        const errors: ValidationError[] = [];

        const componentStr = pkg.component.toString();

        // 检查危险API
        const dangerousPatterns = [
            { pattern: /eval\s*\(/, name: 'eval' },
            { pattern: /Function\s*\(/, name: 'Function构造器' },
            { pattern: /dangerouslySetInnerHTML/, name: 'dangerouslySetInnerHTML' },
            { pattern: /__proto__/, name: '__proto__访问' },
        ];

        dangerousPatterns.forEach(({ pattern, name }) => {
            if (pattern.test(componentStr)) {
                errors.push({
                    type: 'security',
                    message: `检测到危险代码: ${name}`,
                    suggestion: '移除危险代码或使用安全替代方案'
                });
            }
        });

        return errors;
    }

    /**
     * 检查是否为有效的semver版本号
     */
    private isValidSemver(version: string): boolean {
        return /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(version);
    }

    /**
     * 检查是否为React组件
     */
    private isReactComponent(component: any): boolean {
        return (
            typeof component === 'function' ||
            (typeof component === 'object' && component.$$typeof)
        );
    }

    /**
     * 检查Setter是否存在
     */
    private isValidSetter(setterName: string): boolean {
        const validSetters = [
            'StringSetter', 'NumberSetter', 'BooleanSetter', 'SelectSetter',
            'ColorSetter', 'DateSetter', 'TimeSetter', 'TextAreaSetter',
            'SliderSetter', 'RateSetter', 'SwitchSetter', 'ClassNameSetter',
            'ArraySetter', 'JSONSetter', 'FunctionSetter', 'ExpressionSetter',
            'ImageSetter', 'IconSetter', 'StyleSetter', 'MixedSetter'
        ];
        return validSetters.includes(setterName);
    }
}

// 导出单例
export const componentValidator = new ComponentValidator();
