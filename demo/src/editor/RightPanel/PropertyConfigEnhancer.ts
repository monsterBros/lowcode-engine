import { ComponentSchema } from '@/types';

/**
 * 属性配置扩展 - 支持条件显示和属性联动
 */

export interface PropertyCondition {
    /**
     * 条件函数 - 返回true时显示该属性
     */
    check: (node: ComponentSchema) => boolean;
}

export interface PropertyLinkage {
    /**
     * 目标属性名
     */
    target: string;
    /**
     * 值转换函数
     */
    transform: (value: any, node: ComponentSchema) => any;
}

export interface EnhancedPropertyConfig {
    name: string;
    title: string;
    type: string;
    defaultValue?: any;
    setter: {
        componentName: string;
        props?: Record<string, any>;
    };
    description?: string;

    // 新增：条件显示
    condition?: PropertyCondition;

    // 新增：属性联动
    linkage?: PropertyLinkage;

    // 新增：属性分组
    group?: string;
}

/**
 * 属性配置增强器
 */
export class PropertyConfigEnhancer {
    /**
     * 检查属性是否应该显示
     */
    static shouldShow(config: EnhancedPropertyConfig, node: ComponentSchema): boolean {
        if (!config.condition) return true;
        return config.condition.check(node);
    }

    /**
     * 应用属性联动
     */
    static applyLinkage(
        config: EnhancedPropertyConfig,
        value: any,
        node: ComponentSchema
    ): Record<string, any> {
        if (!config.linkage) return { [config.name]: value };

        const updates: Record<string, any> = {
            [config.name]: value
        };

        // 应用联动
        const linkedValue = config.linkage.transform(value, node);
        updates[config.linkage.target] = linkedValue;

        return updates;
    }

    /**
     * 按分组组织属性
     */
    static groupProperties(configs: EnhancedPropertyConfig[]): Map<string, EnhancedPropertyConfig[]> {
        const groups = new Map<string, EnhancedPropertyConfig[]>();

        configs.forEach(config => {
            const group = config.group || '基础属性';
            if (!groups.has(group)) {
                groups.set(group, []);
            }
            groups.get(group)!.push(config);
        });

        return groups;
    }
}

/**
 * 预定义的常用条件
 */
export const CommonConditions = {
    /**
     * 当type为特定值时显示
     */
    whenTypeIs: (targetType: string): PropertyCondition => ({
        check: (node) => node.props?.type === targetType
    }),

    /**
     * 当某个属性为true时显示
     */
    whenPropIsTrue: (propName: string): PropertyCondition => ({
        check: (node) => node.props?.[propName] === true
    }),

    /**
     * 当某个属性不为空时显示
     */
    whenPropNotEmpty: (propName: string): PropertyCondition => ({
        check: (node) => {
            const value = node.props?.[propName];
            return value !== undefined && value !== null && value !== '';
        }
    }),
};

/**
 * 预定义的常用联动
 */
export const CommonLinkages = {
    /**
     * 同步值到另一个属性
     */
    syncTo: (targetProp: string): PropertyLinkage => ({
        target: targetProp,
        transform: (value) => value
    }),

    /**
     * 转换值后同步
     */
    transformTo: (targetProp: string, transformer: (value: any) => any): PropertyLinkage => ({
        target: targetProp,
        transform: transformer
    }),
};

// 示例用法
export const exampleEnhancedProps: EnhancedPropertyConfig[] = [
    {
        name: 'type',
        title: '类型',
        type: 'string',
        setter: { componentName: 'SelectSetter', props: { options: ['text', 'password', 'number'] } },
    },
    {
        name: 'placeholder',
        title: '占位符',
        type: 'string',
        setter: { componentName: 'StringSetter' },
        // 只有type为text时才显示
        condition: CommonConditions.whenTypeIs('text'),
    },
    {
        name: 'maxLength',
        title: '最大长度',
        type: 'number',
        setter: { componentName: 'NumberSetter' },
        // 只有type为text或password时显示
        condition: {
            check: (node) => ['text', 'password'].includes(node.props?.type)
        },
    },
    {
        name: 'width',
        title: '宽度',
        type: 'string',
        setter: { componentName: 'StringSetter' },
        group: '样式',
        // 宽度改变时同步修改minWidth
        linkage: {
            target: 'minWidth',
            transform: (value) => value
        },
    },
];
