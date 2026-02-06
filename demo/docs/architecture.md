# 低代码引擎架构设计详解

## 📖 使用本Demo学习

本 Demo 是对 alibaba/lowcode-engine 核心架构的学习版实现，帮助你理解低代码引擎的设计思路和各模块如何协作。

## 核心架构图

```
┌─────────────────────────────────────────────────────────┐
│                       用户界面层                          │
├───────────┬──────────────────┬─────────────┬────────────┤
│ 物料面板   │   画布渲染器       │ 属性编辑器  │  大纲树     │
│MaterialList│   Canvas         │PropertyPanel│ OutlineTree│
└─────┬─────┴────────┬─────────┴──────┬──────┴──────┬──────┘
      │              │                │             │
      ▼              ▼                ▼             ▼
┌────────────────────────────────────────────────────────┐
│                   状态管理层 (Context)                   │
│  - Schema (组件树数据)                                   │
│  - selectedNodeId (选中节点)                             │
│  - Actions (增删改查操作)                                │
└───────────────────┬────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │物料注册 │  │渲染引擎 │  │Schema  │
   │Registry│  │Renderer│  │Utils   │
   └────────┘  └────────┘  └────────┘
```

## 1. 物料系统 (Material System)

### 1.1 物料元数据 (ComponentMeta)

**设计理念**：每个组件都有对应的元数据描述

```typescript
// src/materials/meta/schema.ts
interface MaterialMeta {
  componentName: string;    // 组件名
  title: string;           // 显示名称
  category: string;        // 分类
  props: PropertyConfig[]; // 属性配置
  configure: {
    component: {
      isContainer: boolean; // 是否为容器
    }
  }
}
```

**参考源码**: `packages/designer/src/component-meta.ts`
- ComponentMeta 类封装了组件的所有元数据
- 包含嵌套规则 (nestingRule)
- 支持元数据转换管道 (metadata transducer)

### 1.2 物料注册中心 (Material Registry)

**设计模式**: 单例模式

```typescript
// src/materials/registry/index.ts
class MaterialRegistry {
  private materials: Map<string, MaterialMeta>;
  
  // 注册物料
  registerMaterial(meta: MaterialMeta): void
  
  // 获取物料
  getMaterial(name: string): MaterialMeta
  
  // 批量注册
  registerMaterials(metas: MaterialMeta[]): void
}
```

**职责**：
1. 管理所有可用物料
2. 提供物料查询接口
3. 判断组件特性（如是否为容器）

**参考源码**: `packages/shell/src/api/material.ts`
- Material API 提供统一的物料管理接口
- 支持 Assets JSON 格式
- 支持增量加载 (loadIncrementalAssets)

### 1.3 物料组件

**实现要点**：
- 每个物料是纯 UI 组件
- 通过 props 接收配置
- 容器组件支持 children

```typescript
// Button 物料示例
const Button: React.FC<ButtonProps> = ({ 
  text, type, size 
}) => {
  return <button>{text}</button>;
};
```

## 2. 渲染引擎 (Renderer)

### 2.1 渲染流程

```
Schema (JSON)
    ↓
findComponent(componentName)
    ↓
<Component {...props}>
    ↓
递归渲染 children
```

### 2.2 核心代码解析

```typescript
// src/editor/Canvas/Renderer.tsx
const renderNode = (node: ComponentSchema) => {
  // 1. 根据 componentName 获取组件类
  const Component = MaterialComponents[node.componentName];
  
  // 2. 渲染组件
  return (
    <Component {...node.props}>
      {/* 3. 递归渲染子节点 */}
      {node.children?.map(child => renderNode(child))}
    </Component>
  );
};
```

**关键点**：
- 动态组件渲染
- 递归处理嵌套
- 实时响应 Schema 变化

**参考源码**: `packages/react-renderer/src`
- 基于 React 的渲染器实现
- 支持多种渲染模式

## 3. 属性编辑器 (Property Panel)

### 3.1 动态表单生成

**设计思路**: 根据 MaterialMeta 动态生成表单

```typescript
// 流程
getMaterial(componentName)
    ↓
material.props.forEach(propConfig => {
    ↓
  renderSetter(propConfig.setter)
})
```

### 3.2 Setter 机制

**Setter** = 属性值编辑组件

```typescript
interface SetterProps {
  value: any;
  onChange: (value: any) => void;
}

// 内置 Setter
- StringSetter: 文本输入
- NumberSetter: 数字输入
- BooleanSetter: 开关
- SelectSetter: 下拉选择
```

**扩展性**: 可以自定义 Setter
```typescript
// 自定义颜色选择器
const ColorSetter: React.FC<SetterProps> = ({ 
  value, onChange 
}) => {
  return <input type="color" value={value} onChange={e => onChange(e.target.value)} />;
};
```

**参考源码**: `packages/shell/src/api/setters.ts`

## 4. Schema 管理

### 4.1 Schema 结构

```json
{
  "id": "node_xxx",
  "componentName": "Container",
  "props": { "layout": "vertical" },
  "children": [
    {
      "id": "node_yyy",
      "componentName": "Button",
      "props": { "text": "Click" }
    }
  ]
}
```

### 4.2 Schema 操作

```typescript
// src/utils/schema.ts

// 查找节点
findNode(schema, nodeId): ComponentSchema | null

// 添加节点
addNodeToSchema(schema, parentId, newNode): ComponentSchema

// 删除节点
deleteNodeFromSchema(schema, nodeId): ComponentSchema

// 更新属性
updateNodePropsInSchema(schema, nodeId, props): ComponentSchema
```

**不可变数据**: 所有操作返回新的 Schema 对象

**参考源码**: `packages/designer/src/document`

## 5. 状态管理

### 5.1 Context 模式

```typescript
// src/store/EditorContext.tsx
interface EditorState {
  schema: ComponentSchema;        // 组件树
  selectedNodeId: string | null;  // 选中节点
}

interface EditorActions {
  addNode: (parentId, node) => void;
  deleteNode: (id) => void;
  updateNodeProps: (id, props) => void;
}
```

### 5.2 数据流

```
用户操作
    ↓
调用 Action
    ↓
更新 State
    ↓
触发重渲染
    ↓
UI 更新
```

## 6. 模块协作流程

### 6.1 添加组件流程

```
1. 用户从物料面板拖拽组件
   ↓
2. Canvas 接收 drop 事件
   ↓
3. 从 Registry 获取 MaterialMeta
   ↓
4. 创建新节点 (包含默认 props)
   ↓
5. 调用 addNode() 添加到 Schema
   ↓
6. Schema 更新触发 Renderer 重渲染
```

### 6.2 编辑属性流程

```
1. 用户点击画布组件
   ↓
2. 设置 selectedNodeId
   ↓
3. PropertyPanel 根据 selectedNodeId 查找节点
   ↓
4. 根据 MaterialMeta 渲染属性表单
   ↓
5. 用户修改属性值
   ↓
6. 调用 updateNodeProps() 更新 Schema
   ↓
7. Renderer 实时更新组件
```

## 7. 关键设计模式

### 7.1 单例模式
- MaterialRegistry：全局唯一的物料注册中心

### 7.2 工厂模式
- 根据 componentName 动态创建组件实例

### 7.3 策略模式
- Setter 机制：根据类型选择不同的编辑器

### 7.4 发布订阅模式
- (未实现) Event Bus：模块间解耦通信

### 7.5 组合模式
- Schema 树结构：统一处理单个节点和组合节点

## 8. 对比真实引擎

| 特性 | 本 Demo | lowcode-engine |
|------|---------|----------------|
| 物料注册 | ✅ 基础实现 | ✅ 完整的 Assets 管理 |
| 渲染器 | ✅ 简单递归渲染 | ✅ iframe 隔离 + 事件代理 |
| 属性编辑 | ✅ 动态表单 | ✅ 高级 Setter + 联动 |
| 大纲树 | ✅ 基础树形展示 | ✅ 拖拽排序 + 锁定 |
| 事件系统 | ❌ 未实现 | ✅ EventBus 全局通信 |
| 插件系统 | ❌ 未实现 | ✅ 完整插件架构 |
| 撤销重做 | ❌ 未实现 | ✅ History 管理 |

## 9. 学习建议

### 阶段 1: 理解数据流
1. 查看 `src/store/EditorContext.tsx` 理解状态管理
2. 调试 `addNode` 看 Schema 如何变化
3. 观察 Renderer 如何响应 Schema 变化

### 阶段 2: 掌握物料系统
1. 创建自定义物料组件
2. 编写物料元数据
3. 注册到 Registry

### 阶段 3: 扩展 Setter
1. 实现自定义 Setter (如颜色选择器)
2. 在物料元数据中引用
3. 测试动态表单生成

### 阶段 4: 深入渲染器
1. 理解递归渲染逻辑
2. 添加事件处理
3. 实现嵌套拖拽

## 10. 扩展方向

1. **事件系统**: 实现 EventBus，支持模块间通信
2. **插件架构**: 允许外部扩展功能
3. **撤销重做**: 实现 History 管理
4. **物料市场**: 支持动态加载远程物料
5. **代码生成**: 将 Schema 转换为可部署代码

## 相关链接

- [lowcode-engine 官方文档](https://lowcode-engine.cn/)
- [lowcode-engine GitHub](https://github.com/alibaba/lowcode-engine)
- [低代码引擎协议规范](https://lowcode-engine.cn/lowcode)
