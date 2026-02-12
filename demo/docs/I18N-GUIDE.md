# 国际化（i18n）使用指南

## 功能说明

低代码引擎已内置完整的国际化支持，包括：
- ✅ 多语言翻译管理
- ✅ 运行时切换语言
- ✅ I18nSetter 属性设置器
- ✅ React Hook 集成

## 使用方法

### 1. 初始化配置

在App.tsx中配置国际化：

```typescript
const engineConfig: EngineConfig = {
    i18n: {
        locale: 'zh-CN',  // 默认语言
        messages: {
            'zh-CN': {
                common: {
                    save: '保存',
                    cancel: '取消',
                    delete: '删除',
                    edit: '编辑'
                },
                components: {
                    button: {
                        defaultText: '点击我'
                    }
                }
            },
            'en-US': {
                common: {
                    save: 'Save',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    edit: 'Edit'
                },
                components: {
                    button: {
                        defaultText: 'Click Me'
                    }
                }
            }
        }
    }
};
```

### 2. 在组件中使用翻译

#### 方法1：使用t函数

```typescript
import { t } from '@/engine/I18nManager';

// 在组件中
const buttonText = t('common.save');  // 输出：保存
const fallbackText = t('unknown.key', 'Default Text');
```

#### 方法2：使用i18nManager

```typescript
import { i18nManager } from '@/engine/I18nManager';

// 获取翻译
const text = i18nManager.t('common.cancel');

// 切换语言
i18nManager.setLocale('en-US');

// 获取当前语言
const locale = i18nManager.getCurrentLocale();

// 获取所有可用语言
const locales = i18nManager.getAvailableLocales();
```

### 3. 在属性配置中使用

为物料配置I18nSetter：

```typescript
export const ButtonMeta: MaterialMeta = {
    componentName: 'Button',
    title: '按钮',
    configure: {
        props: [
            {
                name: 'children',
                title: '按钮文本',
                setter: {
                    componentName: 'I18nSetter'  // 使用国际化设置器
                },
                defaultValue: 'Button'
            }
        ]
    }
};
```

### 4. 运行时切换语言

创建语言切换器：

```typescript
import { i18nManager } from '@/engine/I18nManager';
import { Select } from 'antd';

const LanguageSwitcher = () => {
    const [locale, setLocale] = useState(i18nManager.getCurrentLocale());
    const locales = i18nManager.getAvailableLocales();

    const handleChange = (newLocale: string) => {
        i18nManager.setLocale(newLocale);
        setLocale(newLocale);
        // 触发界面重新渲染
    };

    return (
        <Select value={locale} onChange={handleChange}>
            {locales.map(loc => (
                <Select.Option key={loc} value={loc}>
                    {loc}
                </Select.Option>
            ))}
        </Select>
    );
};
```

## 示例：完整配置

```typescript
// App.tsx
ignitor.init({
    container: document.getElementById('root')!,
    i18n: {
        locale: 'zh-CN',
        messages: {
            'zh-CN': {
                toolbar: {
                    save: '保存',
                    preview: '预览',
                    export: '导出'
                },
                material: {
                    button: '按钮',
                    input: '输入框',
                    container: '容器'
                }
            },
            'en-US': {
                toolbar: {
                    save: 'Save',
                    preview: 'Preview',
                    export: 'Export'
                },
                material: {
                    button: 'Button',
                    input: 'Input',
                    container: 'Container'
                }
            }
        }
    }
});
```

## I18nSetter 属性设置器

I18nSetter 允许在属性面板中设置国际化文本：

**特性**:
- 支持静态文本 / i18n key 切换
- 实时预览翻译结果
- 显示所有语言版本

**使用示例**:
```typescript
{
    type: 'i18n',
    key: 'common.save'
}
```

## 注册新语言

```typescript
i18nManager.register({
    locale: 'ja-JP',
    label: '日本語',
    messages: {
        common: {
            save: '保存',
            cancel: 'キャンセル'
        }
    }
});
```

## 监听语言变化

```typescript
import { eventBus, EVENTS } from '@/engine/EventBus';

eventBus.on(EVENTS.LOCALE_CHANGE, (locale) => {
    console.log('Language changed to:', locale);
    // 更新界面
});
```

## 最佳实践

1. ✅ 使用有意义的key命名：`module.component.property`
2. ✅ 总是提供fallback文本
3. ✅ 翻译文本集中管理
4. ✅ 为组件属性使用I18nSetter
5. ✅ 支持常用语言（中文、英文、日文等）

## 完整API

### i18nManager.t(key, fallback?)
获取翻译文本

### i18nManager.setLocale(locale)
切换当前语言

### i18nManager.getCurrentLocale()
获取当前语言

### i18nManager.getAvailableLocales()
获取所有可用语言

### i18nManager.register(config)
注册新语言包
