/**
 * 第三方组件包类型定义
 */
export interface ComponentPackage {
    // 必需字段
    name: string;              // 组件包名称（唯一）
    version: string;           // 版本号（semver格式）
    component: React.ComponentType<any>; // React组件
    meta: ThirdPartyComponentMeta; // 组件元数据

    // 可选字段
    icon?: string;             // 图标URL或base64
    category?: string;         // 分类（custom/form/layout等）
    dependencies?: Record<string, string>; // 依赖声明
    author?: string;           // 作者
    description?: string;      // 描述
}

/**
 * 第三方组件元数据（扩展自ComponentSchema.meta）
 */
export interface ThirdPartyComponentMeta {
    componentName: string;     // 组件名（必须唯一，PascalCase）
    title: string;             // 中文显示名称
    props: PropMeta[];         // 属性配置
    events?: EventMeta[];      // 事件配置
    isContainer?: boolean;     // 是否容器组件
    allowedParents?: string[]; // 允许的父组件（空=所有）
    allowedChildren?: string[]; // 允许的子组件（空=所有）
    screenshot?: string;       // 组件截图
}

/**
 * 属性元数据
 */
export interface PropMeta {
    name: string;              // 属性名
    title: string;             // 显示名称
    setter: SetterConfig;      // Setter配置
    defaultValue?: any;        // 默认值
    required?: boolean;        // 是否必需
    description?: string;      // 描述
}

/**
 * Setter配置
 */
export interface SetterConfig {
    componentName: string;     // Setter组件名
    props?: Record<string, any>; // Setter的props
}

/**
 * 事件元数据
 */
export interface EventMeta {
    name: string;              // 事件名（onXxx格式）
    title: string;             // 显示名称
    description?: string;      // 描述
    params?: string[];         // 参数列表
}

/**
 * 校验结果
 */
export interface ValidationResult {
    success: boolean;          // 是否通过
    errors: ValidationError[]; // 错误列表
    warnings: ValidationWarning[]; // 警告列表
    componentName?: string;    // 组件名
}

/**
 * 校验错误
 */
export interface ValidationError {
    type: 'structure' | 'metadata' | 'runtime' | 'security';
    field?: string;            // 出错字段
    message: string;           // 错误信息
    suggestion?: string;       // 修复建议
}

/**
 * 校验警告
 */
export interface ValidationWarning {
    type: 'performance' | 'compatibility' | 'best-practice';
    message: string;
    suggestion?: string;
}

/**
 * 组件加载选项
 */
export interface LoadOptions {
    skipValidation?: boolean;  // 跳过校验（不推荐）
    allowUnsafe?: boolean;     // 允许不安全代码（慎用）
    overwrite?: boolean;       // 覆盖已存在组件
}
