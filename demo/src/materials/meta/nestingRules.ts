/**
 * 嵌套规则管理
 * 用于验证组件间的父子关系
 */

export interface NestingRule {
    componentName: string;
    parentWhitelist?: string[]; // 允许的父组件列表
    childWhitelist?: string[];  // 允许的子组件列表
    parentBlacklist?: string[]; // 禁止的父组件列表
    childBlacklist?: string[];  // 禁止的子组件列表
}

const nestingRules: NestingRule[] = [
    {
        componentName: 'Button',
        parentWhitelist: ['Container'], // Button只能在Container中
        childWhitelist: [], // Button不能包含子组件
    },
    {
        componentName: 'Input',
        parentWhitelist: ['Container'],
        childWhitelist: [],
    },
    {
        componentName: 'Container',
        // Container可以在任何地方
        childWhitelist: ['Button', 'Input', 'Container'], // Container可以包含这些组件
    },
];

/**
 * 嵌套规则验证器
 */
export class NestingValidator {
    private rules: Map<string, NestingRule> = new Map();

    constructor(rules: NestingRule[]) {
        rules.forEach(rule => {
            this.rules.set(rule.componentName, rule);
        });
    }

    /**
     * 验证是否可以作为父子关系
     */
    canNest(parentComponentName: string, childComponentName: string): {
        valid: boolean;
        reason?: string;
    } {
        const childRule = this.rules.get(childComponentName);
        const parentRule = this.rules.get(parentComponentName);

        // 检查子组件的父级白名单
        if (childRule?.parentWhitelist) {
            if (!childRule.parentWhitelist.includes(parentComponentName)) {
                return {
                    valid: false,
                    reason: `${childComponentName} 只能放在 ${childRule.parentWhitelist.join(', ')} 中`
                };
            }
        }

        // 检查子组件的父级黑名单
        if (childRule?.parentBlacklist) {
            if (childRule.parentBlacklist.includes(parentComponentName)) {
                return {
                    valid: false,
                    reason: `${childComponentName} 不能放在 ${parentComponentName} 中`
                };
            }
        }

        // 检查父组件的子级白名单
        if (parentRule?.childWhitelist) {
            if (!parentRule.childWhitelist.includes(childComponentName)) {
                return {
                    valid: false,
                    reason: `${parentComponentName} 不能包含 ${childComponentName}`
                };
            }
        }

        // 检查父组件的子级黑名单
        if (parentRule?.childBlacklist) {
            if (parentRule.childBlacklist.includes(childComponentName)) {
                return {
                    valid: false,
                    reason: `${parentComponentName} 不能包含 ${childComponentName}`
                };
            }
        }

        return { valid: true };
    }

    /**
     * 获取可以放入指定父组件的子组件列表
     */
    getValidChildren(parentComponentName: string): string[] {
        const rule = this.rules.get(parentComponentName);
        if (rule?.childWhitelist) {
            return rule.childWhitelist;
        }
        // 如果没有白名单，返回所有组件（除了黑名单）
        const allComponents = Array.from(this.rules.keys());
        if (rule?.childBlacklist) {
            return allComponents.filter(c => !rule.childBlacklist!.includes(c));
        }
        return allComponents;
    }

    /**
     * 获取可以作为指定组件父组件的列表
     */
    getValidParents(childComponentName: string): string[] {
        const rule = this.rules.get(childComponentName);
        if (rule?.parentWhitelist) {
            return rule.parentWhitelist;
        }
        // 如果没有白名单，返回所有组件（除了黑名单）
        const allComponents = Array.from(this.rules.keys());
        if (rule?.parentBlacklist) {
            return allComponents.filter(c => !rule.parentBlacklist!.includes(c));
        }
        return allComponents;
    }
}

// 导出默认验证器
export const nestingValidator = new NestingValidator(nestingRules);
