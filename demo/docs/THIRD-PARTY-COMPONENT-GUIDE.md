# 第三方组件接入指南

## 🎯快速开始

### 什么是第三方组件接入？

低代码引擎支持接入其他团队开发的自定义组件，扩展物料库功能。只需按照规范开发组件，即可一键导入到引擎中使用。

## 📦 组件开发规范

### 1. 创建组件包

```typescript
// MyCustomButton.tsx
import React from 'react';

// 1. 定义React组件
const MyButton: React.FC<{
  text?: string;
  type?: 'primary' | 'default' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}> = ({ text = '按钮', type = 'default', size = 'medium', onClick }) => {
  return (
    <button
      className={`custom-btn btn-${type} btn-${size}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

// 2. 导出组件包
export const MyButtonPackage = {
  // 必需字段
  name: 'my-custom-button',      // 包名（唯一）
  version: '1.0.0',             // 版本号（semver）
  component: MyButton,           // React组件
  
  meta: {
    // 组件名（必须PascalCase）
    componentName: 'MyCustomButton',
    // 显示名称
    title: '自定义按钮',
    // 属性配置
    props: [
      {
        name: 'text',
        title: '按钮文本',
        setter: { componentName: 'StringSetter' },
        defaultValue: '按钮'
      },
      {
        name: 'type',
        title: '按钮类型',
        setter: {
          componentName: 'SelectSetter',
          props: {
            options: ['primary', 'default', 'danger']
          }
        },
        defaultValue: 'default'
      },
      {
        name: 'size',
        title: '尺寸',
        setter: {
          componentName: 'SelectSetter',
          props: {
            options: ['small', 'medium', 'large']
          }
        }
      }
    ],
    // 事件配置（可选）
    events: [
      {
        name: 'onClick',
        title: '点击事件'
      }
    ]
  },
  
  // 可选字段
  icon: 'data:image/svg+xml;base64,...', // 组件图标
  category: 'custom',                     // 分类
  author: '张三',                         // 作者
  description: '一个自定义按钮组件'      // 描述
};
```

### 2. 可用的Setter类型

| Setter名称 | 用途 | 示例 |
|-----------|------|------|
| StringSetter | 字符串 | 文本内容 |
| NumberSetter | 数字 | 宽度、高度 |
| BooleanSetter | 布尔值 | 是否禁用 |
| SelectSetter | 下拉选择 | 类型选择 |
| ColorSetter | 颜色 | 背景色 |
| DateSetter | 日期 | 日期选择 |
| TimeSetter | 时间 | 时间选择 |
| TextAreaSetter | 多行文本 | 描述 |
| SliderSetter | 滑块 | 透明度 |
| ArraySetter | 数组 | 列表项 |
| JSONSetter | JSON对象 | 配置对象 |
| StyleSetter | 样式 | CSS样式 |
| ImageSetter | 图片 | 图片URL |
| ... | ... | ... |

完整列表请参考源码 `src/editor/RightPanel/setters/`

## 🚀 接入方式

### 方式1: API注册（程序化）

```typescript
import { componentLoader } from 'lowcode-engine';
import { MyButtonPackage } from './MyCustomButton';

// 直接注册
const result = await componentLoader.register(MyButtonPackage);

if (result.success) {
  console.log('✅ 注册成功！');
} else {
  console.error('❌ 注册失败：', result.errors);
}
```

#### 高级选项

```typescript
// 覆盖已存在的组件
await componentLoader.register(MyButtonPackage, {
  overwrite: true
});

// 跳过校验（不推荐）
await componentLoader.register(MyButtonPackage, {
  skipValidation: true
});

// 批量注册
const results = await componentLoader.registerBatch([
  MyButtonPackage,
  MyCardPackage,
  MyFormPackage
]);
```

### 方式2: UI可视化导入

1. 点击工具栏的 **"导入组件"** 按钮
2. 选择导入方式：
   - **URL加载**: 输入组件JS文件URL
   - **代码粘贴**: 直接粘贴组件代码
3. 点击 **"加载并校验"**
4. 查看校验结果
5. 校验通过后自动注册

### 方式3: 从URL加载

```typescript
// 从远程URL加载
const result = await componentLoader.loadFromUrl(
  'https://cdn.example.com/components/my-button.js'
);
```

### 方式4: 从代码字符串加载

```typescript
const code = `
const MyButton = ({ text }) => <button>{text}</button>;

module.exports = {
  name: 'my-button',
  version: '1.0.0',
  component: MyButton,
  meta: { /* ... */ }
};
`;

const result = await componentLoader.loadFromCode(code, {
  allowUnsafe: true  // 必需，因为有安全风险
});
```

## ✅ 校验规则

组件会经过4层校验：

### 1. 结构校验
- ✅ 必需字段：name, version, component, meta
- ✅ 版本号格式：符合semver（如1.0.0）
- ✅ 组件类型：必须是React组件

### 2. 元数据校验
- ✅ componentName：PascalCase，唯一
- ✅ 属性配置：每个prop必须有name和setter
- ✅ Setter类型：必须是已注册的Setter
- ✅ 事件名称：必须以"on"开头

### 3. 运行时校验
- ✅ 组件能否正常实例化
- ⚠️ 性能警告：代码大小 < 50KB

### 4. 安全校验
- ❌ 禁止使用 `eval()`
- ❌ 禁止使用 `Function` 构造器
- ❌ 禁止 `dangerouslySetInnerHTML`
- ❌ 禁止 `__proto__` 访问

## 📋 完整示例

### 示例1：简单按钮

```typescript
const SimpleButton = ({ text, onClick }) => {
  return <button onClick={onClick}>{text}</button>;
};

export const SimpleButtonPackage = {
  name: 'simple-button',
  version: '1.0.0',
  component: SimpleButton,
  meta: {
    componentName: 'SimpleButton',
    title: '简单按钮',
    props: [
      {
        name: 'text',
        title: '文本',
        setter: { componentName: 'StringSetter' },
        defaultValue: '点击'
      }
    ],
    events: [
      { name: 'onClick', title: '点击事件' }
    ]
  }
};
```

### 示例2：卡片组件（容器）

```typescript
const MyCard = ({ title, children }) => {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
};

export const MyCardPackage = {
  name: 'my-card',
  version: '1.0.0',
  component: MyCard,
  meta: {
    componentName: 'MyCard',
    title: '卡片',
    props: [
      {
        name: 'title',
        title: '标题',
        setter: { componentName: 'StringSetter' }
      }
    ],
    isContainer: true,  // 标记为容器组件
    allowedChildren: ['Button', 'Text', 'Image'] // 允许的子组件
  }
};
```

### 示例3：表单输入框

```typescript
const MyInput = ({ label, placeholder, value, onChange, required }) => {
  return (
    <div className="form-item">
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export const MyInputPackage = {
  name: 'my-input',
  version: '1.0.0',
  component: MyInput,
  meta: {
    componentName: 'MyInput',
    title: '输入框',
    props: [
      {
        name: 'label',
        title: '标签',
        setter: { componentName: 'StringSetter' }
      },
      {
        name: 'placeholder',
        title: '占位符',
        setter: { componentName: 'StringSetter' }
      },
      {
        name: 'required',
        title: '必填',
        setter: { componentName: 'BooleanSetter' },
        defaultValue: false
      }
    ],
    events: [
      {
        name: 'onChange',
        title: '值改变',
        params: ['value']
      }
    ]
  },
  category: 'form'
};
```

## 🔧 控制台调试

组件加载器已导出到全局，可以在控制台直接调用：

```javascript
// 查看已注册的第三方组件
componentLoader.getRegisteredComponents();

// 卸载组件
componentLoader.unregister('MyButton');

// 重新注册
componentLoader.register(MyButtonPackage);
```

## ❓ 常见问题

### Q1: 组件名重复怎么办？
A: 使用 `overwrite: true` 覆盖，或修改componentName

### Q2: 校验失败怎么调试？
A: 查看errors数组中的详细错误信息和修复建议

### Q3: 如何使用自定义Setter？
A: 当前只支持内置Setter，自定义Setter功能即将推出

### Q4: 组件样式如何处理？
A: 可以在组件内使用内联样式或CSS-in-JS

### Q5: 能否导入npm包？
A: 暂不支持，需要打包成单文件或使用CDN

## 🎓 最佳实践

1. **命名规范**: componentName使用PascalCase
2. **版本管理**: 遵循semver语义化版本
3. **属性设计**: 提供合理的defaultValue
4. **类型安全**: 使用TypeScript定义Props类型
5. **性能优化**: 避免过大的组件代码
6. **文档完善**: 添加description和screenshot

## 📞 技术支持

遇到问题？
- 查看校验错误的详细信息和建议
- 参考示例组件代码
- 检查Setter类型是否正确

---

**祝开发顺利！🎉**
