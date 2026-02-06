# 低代码引擎 Demo

基于 [alibaba/lowcode-engine](https://github.com/alibaba/lowcode-engine) 项目架构设计的完备低代码引擎 Demo 框架。

## ✨ 功能特性

- 📦 **物料组件管理** - 物料注册中心、元数据管理、分类展示
- 🎨 **可视化画布** - 拖拽式组件添加、实时渲染、选中高亮
- ⚙️ **属性配置器** - 动态属性表单、多种Setter支持
- 🌲 **大纲树** - 树形展示组件层级、支持选中联动
- 💾 **数据导出** - 支持导出JSON Schema
- 🎯 **树形JSON结构** - 完整的组件树Schema定义

## 🏗️ 技术栈

- **框架**: React 16
- **构建工具**: Vite
- **UI组件库**: Ant Design 4
- **拖拽功能**: react-dnd
- **状态管理**: Context API
- **样式方案**: CSS Modules
- **类型支持**: TypeScript

## 📁 项目结构

```
demo/
├── src/
│   ├── materials/          # 物料系统
│   │   ├── components/     # 物料组件库（Button, Input, Container）
│   │   ├── registry/       # 物料注册中心
│   │   └── meta/           # 物料元数据配置
│   ├── editor/             # 编辑器核心
│   │   ├── Canvas/         # 中间画布渲染器
│   │   ├── LeftPanel/      # 左侧物料面板
│   │   ├── RightPanel/     # 右侧属性配置器
│   │   ├── OutlineTree/    # 大纲树
│   │   └── Toolbar/        # 工具栏
│   ├── store/              # 状态管理
│   ├── utils/              # 工具函数
│   ├── types/              # 类型定义
│   └── App.tsx             # 主应用
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🚀 快速开始

### 安装依赖

```bash
cd demo
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
```

## 📖 使用说明

### 1. 添加组件

从左侧物料面板拖拽组件到中间画布即可添加组件。

### 2. 配置属性

点击画布中的组件，右侧属性面板会显示该组件的属性配置项，可以实时编辑。

### 3. 查看大纲

右侧下方的大纲树展示了完整的组件层级结构，可以在大纲树中选中和删除组件。

### 4. 导出JSON

点击顶部工具栏的"导出JSON"按钮，可以导出完整的组件树JSON Schema。

## 🎯 核心功能

### 物料系统

- **物料注册中心**: 统一管理所有物料组件
- **物料元数据**: 完整定义组件的属性、Setter、默认值等
- **物料分类**: 按类别组织物料（基础组件、布局组件等）

### 渲染引擎

- **递归渲染**: 根据JSON Schema递归渲染组件树
- **组件嵌套**: 支持容器组件嵌套子组件
- **实时更新**: 属性修改实时反映到画布

### 属性配置

提供多种Setter支持:
- StringSetter - 字符串输入
- NumberSetter - 数字输入
- BooleanSetter - 开关切换
- SelectSetter - 下拉选择

### 树形结构

完整的JSON Schema定义:

```json
{
  "id": "root",
  "componentName": "Container",
  "props": { ... },
  "children": [
    {
      "id": "node_xxx",
      "componentName": "Button",
      "props": { "text": "Click Me" }
    }
  ]
}
```

## 🔧 扩展开发

### 添加新物料

1. 在 `src/materials/components` 创建新组件
2. 在 `src/materials/meta/schema.ts` 添加元数据配置
3. 在 `src/materials/components/index.ts` 导出组件

### 添加新Setter

1. 在 `src/editor/RightPanel/setters` 创建新Setter组件
2. 在 `src/editor/RightPanel/setters/index.ts` 导出

## 📝 License

MIT

## 🙏 致谢

本项目基于 [alibaba/lowcode-engine](https://github.com/alibaba/lowcode-engine) 的架构设计理念。
