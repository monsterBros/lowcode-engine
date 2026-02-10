# 使用示例和Demo代码

## 快速开始

### 1. 创建最简单的低代码应用

```typescript
import { EditorProvider } from '@/store/EditorContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Toolbar from '@/editor/Toolbar/Toolbar';
import Canvas from '@/editor/Canvas/Canvas';
import MaterialList from '@/editor/LeftPanel/MaterialList';
import PropertyPanel from '@/editor/RightPanel/PropertyPanel';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EditorProvider>
        <div style={{ display: 'flex', height: '100vh' }}>
          <MaterialList />
          <Canvas />
          <PropertyPanel />
        </div>
      </EditorProvider>
    </DndProvider>
  );
}
```

### 2. 使用20种Setter

```typescript
// 在物料元数据中配置各种Setter
const materialMeta = {
  componentName: 'Button',
  title: '按钮',
  props: [
    // 基础Setter
    { name: 'text', title: '文本', setter: { componentName: 'StringSetter' } },
    { name: 'size', title: '尺寸', setter: { componentName: 'SelectSetter', props: { options: ['small', 'medium', 'large'] } } },
    { name: 'disabled', title: '禁用', setter: { componentName: 'BooleanSetter' } },
    { name: 'count', title: '数量', setter: { componentName: 'NumberSetter' } },
    
    // 进阶Setter
    { name: 'color', title: '颜色', setter: { componentName: 'ColorSetter' } },
    { name: 'date', title: '日期', setter: { componentName: 'DateSetter' } },
    { name: 'time', title: '时间', setter: { componentName: 'TimeSetter' } },
    { name: 'description', title: '描述', setter: { componentName: 'TextAreaSetter' } },
    
    // 高级Setter
    { name: 'opacity', title: '透明度', setter: { componentName: 'SliderSetter', props: { min: 0, max: 100 } } },
    { name: 'rating', title: '评分', setter: { componentName: 'RateSetter' } },
    { name: 'enabled', title: '启用', setter: { componentName: 'SwitchSetter' } },
    { name: 'className', title: 'CSS类名', setter: { componentName: 'ClassNameSetter' } },
    
    // 复杂Setter
    { name: 'items', title: '列表项', setter: { componentName: 'ArraySetter' } },
    { name: 'config', title: '配置对象', setter: { componentName: 'JSONSetter' } },
    { name: 'handler', title: '处理函数', setter: { componentName: 'FunctionSetter' } },
    { name: 'expression', title: '表达式', setter: { componentName: 'ExpressionSetter' } },
    
    // 资源Setter
    { name: 'image', title: '图片', setter: { componentName: 'ImageSetter' } },
    { name: 'icon', title: '图标', setter: { componentName: 'IconSetter' } },
    
    // 高级Setter
    { name: 'style', title: '样式', setter: { componentName: 'StyleSetter' } },
    { name: 'value', title: '值', setter: { componentName: 'MixedSetter' } },
  ]
};
```

### 3. 使用双代码生成器

```typescript
import { codeGenerator } from '@/engine/CodeGenerator';
import { astCodeGenerator } from '@/engine/ASTCodeGenerator';

// 方式1：字符串拼接（快速原型）
const code1 = codeGenerator.generateReactCode(schema, 'MyApp');
console.log(code1); // 快速生成，适合Demo

// 方式2：AST生成（生产环境）
const code2 = astCodeGenerator.generateReactCode(schema, 'MyApp');
console.log(code2); // 语法100%正确，适合部署

// 生成完整项目
const files = astCodeGenerator.generateProjectStructure(schema, 'my-project');
// files: [{ path: 'src/App.jsx', content: '...' }, ...]
```

### 4. 使用插件系统

```typescript
import { pluginManager } from '@/engine/PluginManager';
import { HotkeyPlugin, AutoSavePlugin } from '@/plugins';

// 注册插件
pluginManager.register(HotkeyPlugin);
pluginManager.register(AutoSavePlugin);

// 初始化所有插件
pluginManager.init({
  config: { autosaveInterval: 30000 } // 30秒自动保存
});

// 创建自定义插件
const MyCustomPlugin = {
  meta: {
    name: 'my-plugin',
    version: '1.0.0',
    description: '我的自定义插件'
  },
  init: (context) => {
    context.logger.log('插件初始化');
    // 你的逻辑...
  },
  destroy: async () => {
    console.log('插件销毁');
  }
};

pluginManager.register(MyCustomPlugin);
```

### 5. 使用数据源管理

```typescript
import { dataSourceManager } from '@/engine/DataSourceManager';

// 注册API数据源
dataSourceManager.register({
  id: 'users',
  name: '用户列表',
  type: 'api',
  config: {
    url: 'https://api.example.com/users',
    method: 'GET'
  }
});

// 注册静态数据源
dataSourceManager.register({
  id: 'menu',
  name: '菜单数据',
  type: 'static',
  config: {
    data: [
      { id: 1, name: '首页' },
      { id: 2, name: '关于' }
    ]
  }
});

// 加载数据
const data = await dataSourceManager.load('users');

// 订阅数据变化
dataSourceManager.subscribe('users', (data) => {
console.log('数据更新:', data);
});
```

### 6. 使用事件验证

```typescript
import { eventValidator, VALIDATED_EVENTS } from '@/engine/EventValidator';

// 验证事件名称
const result1 = eventValidator.validateEventName('onClick'); 
// { valid: true }

const result2 = eventValidator.validateEventName('handleClick'); 
// { valid: false, error: '事件名称必须以"on"开头' }

// 验证事件处理器代码
const result3 = eventValidator.validateHandler('function(e) { console.log(e); }');
// { valid: true }

// 使用标准事件常量
console.log(VALIDATED_EVENTS.CLICK); // 'onClick'
console.log(VALIDATED_EVENTS.CHANGE); // 'onChange'
```

### 7. 使用属性条件显示和联动

```typescript
import { CommonConditions, CommonLinkages } from '@/editor/RightPanel/PropertyConfigEnhancer';

const props = [
  {
    name: 'type',
    title: '类型',
    setter: { componentName: 'SelectSetter', props: { options: ['text', 'password'] } }
  },
  {
    name: 'placeholder',
    title: '占位符',
    setter: { componentName: 'StringSetter' },
    // 只有type为text时才显示
    condition: CommonConditions.whenTypeIs('text')
  },
  {
    name: 'width',
    title: '宽度',
    setter: { componentName: 'StringSetter' },
    // 宽度改变时同步到minWidth
    linkage: CommonLinkages.syncTo('minWidth')
  }
];
```

### 8. 使用物料版本管理

```typescript
import { materialVersionManager } from '@/materials/registry/MaterialVersionManager';

// 检查是否有更新
if (materialVersionManager.hasUpdate('Button')) {
  const info = materialVersionManager.getVersionInfo('Button');
  console.log(`按钮组件有新版本：${info.latestVersion}`);
}

// 检查兼容性
const compat = materialVersionManager.checkCompatibility('Button', '2.0.0');
if (!compat.compatible) {
  console.warn('版本不兼容:', compat.warnings);
}

// 更新版本
materialVersionManager.updateVersion('Button', '2.0.0');
```

### 9. 使用TreeNode拖拽排序

```typescript
// TreeNode组件已内置拖拽排序功能
// 只需使用EditorContext的moveNode方法

const { moveNode } = useEditor();

// 移动节点
moveNode('node-123', 'parent-456', 0); // 移动到parent-456的第一个位置
```

### 10. 完整示例：创建表单页面

```typescript
const formSchema = {
  id: 'root',
  componentName: 'Container',
  props: { layout: 'vertical', padding: 20 },
  children: [
    {
      id: 'title',
      componentName: 'Text',
      props: { 
        text: '用户注册表单',
        fontSize: 24,
        fontWeight: 'bold'
      }
    },
    {
      id: 'name-input',
      componentName: 'Input',
      props: {
        placeholder: '请输入姓名',
        required: true
      },
      events: {
        onChange: {
          type: 'JSFunction',
          value: 'function(e) { console.log("Name:", e.target.value); }'
        }
      }
    },
    {
      id: 'gender-select',
      componentName: 'Select',
      props: {
        placeholder: '请选择性别',
        options: ['男', '女', '其他']
      }
    },
    {
      id: 'birthday-picker',
      componentName: 'DatePicker',
      props: {
        placeholder: '请选择生日'
      }
    },
    {
      id: 'submit-btn',
      componentName: 'Button',
      props: {
        text: '提交',
        type: 'primary'
      },
      events: {
        onClick: {
          type: 'JSFunction',
          value: 'function() { alert("表单提交"); }'
        }
      }
    }
  ]
};

// 使用schema
<EditorProvider initialSchema={formSchema}>
  {/* your app */}
</EditorProvider>
```

## 更多示例

查看 `examples/` 目录获取更多完整示例：
- `examples/basic-editor/` - 基础编辑器
- `examples/form-builder/` - 表单构建器
- `examples/dashboard-builder/` - 仪表板构建器
- `examples/plugin-development/` - 插件开发示例
- `examples/custom-setters/` - 自定义Setter示例

## 最佳实践

1. **使用TypeScript** - 获得完整的类型提示
2. **使用AST生成器** - 生产环境代码生成
3. **合理使用插件** - 扩展功能而不修改核心
4. **数据源分离** - 解耦数据和UI
5. **事件验证** - 确保事件处理器正确性
6. **属性联动** - 提升用户体验

## 常见问题

### Q1: 如何创建自定义Setter?
参考 `src/editor/RightPanel/setters/StringSetter.tsx` 创建你的Setter组件。

### Q2: 如何扩展物料组件?
在 `src/materials/components/` 目录下创建新组件，并在 `src/materials/meta/` 中定义元数据。

### Q3: 如何调试生成的代码?
使用CodeExport组件的预览功能，或直接console.log生成的代码。

### Q4: 性能优化建议?
- 使用React.memo包裹Setter组件
- 合理使用History的maxSize限制
- 大型Schema考虑虚拟滚动

## 贡献指南

欢迎贡献代码！请参考 `CONTRIBUTING.md` 了解详情。

## License

MIT
