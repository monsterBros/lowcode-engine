# 快速开始指南

## 🚀 安装和运行

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务器
pnpm run dev

# 3. 访问
浏览器打开 http://localhost:3000
```

## 📝 基本使用

### 1. 添加组件
- 从左侧物料面板拖拽组件到画布
- 组件会自动添加到根容器中

### 2. 选中组件
- 点击画布中的组件
- 选中后会显示蓝色边框
- 右侧面板显示该组件的属性

### 3. 编辑属性
- 在右侧属性面板修改属性值
- 画布实时更新显示效果

### 4. 查看结构
- 右下方大纲树显示组件层级
- 可以在大纲树中选中组件
- 点击 ✕ 按钮删除组件

### 5. 导出数据
- 点击顶部"导出JSON"按钮
- 下载完整的 Schema JSON 文件

## 🎯 动手实践

### 练习 1: 创建登录表单

1. 拖拽一个 **Container** 到画布
2. 修改 Container 的 `layout` 为 `vertical`
3. 在 Container 中添加两个 **Input** 组件
4. 修改第一个 Input 的 `placeholder` 为 "用户名"
5. 修改第二个 Input 的 `type` 为 `password`，`placeholder` 为 "密码"
6. 添加一个 **Button**，`text` 改为 "登录"，`type` 改为 `primary`

### 练习 2: 理解嵌套

1. 创建外层 Container (布局: `horizontal`)
2. 在其中添加两个子 Container
3. 左侧 Container 添加按钮
4. 右侧 Container 添加输入框
5. 观察大纲树的层级结构

### 练习 3: 查看 Schema

1. 按照练习1创建表单
2. 点击"导出JSON"
3. 打开下载的 JSON 文件
4. 理解 Schema 的树形结构

## 📖 学习路径

### 第一步: 熟悉UI和操作
- 尝试拖拽所有物料组件
- 修改各种属性看效果
- 导出 Schema 观察数据结构

### 第二步: 理解代码结构
阅读以下文件：
1. `src/store/EditorContext.tsx` - 状态管理
2. `src/materials/registry/index.ts` - 物料注册
3. `src/editor/Canvas/Renderer.tsx` - 渲染引擎
4. `src/editor/RightPanel/PropertyPanel.tsx` - 属性编辑

### 第三步: 扩展功能
1. 添加新物料组件 (参考 Button/Input)
2. 创建自定义 Setter
3. 修改渲染逻辑

### 第四步: 深入引擎
- 阅读 `docs/architecture.md` 理解设计思想
- 对比真实的 lowcode-engine 源码
- 思考如何实现事件系统、插件系统

## 🔧 常见问题

**Q: 如何添加新物料？**
A: 参考 `src/materials/components/Button` 创建组件，然后在 `src/materials/meta/schema.ts` 添加元数据

**Q: 如何自定义 Setter？**
A: 在 `src/editor/RightPanel/setters/` 创建新 Setter，实现 `value` 和 `onChange` 接口

**Q: Schema 保存在哪？**
A: 当前在内存中（Context），刷新会丢失。可以扩展实现 localStorage 持久化

**Q: 如何实现嵌套拖拽？**
A: 需要给容器组件添加 Drop 区域，修改 `Canvas.tsx` 的拖拽逻辑

## 📚 推荐阅读

1. [架构设计详解](./architecture.md) - 核心设计思想
2. [lowcode-engine 官方文档](https://lowcode-engine.cn/)
3. [React DnD 文档](https://react-dnd.github.io/react-dnd/) - 拖拽库

## 💡 下一步

- 实现事件绑定系统
- 添加撤销/重做功能
- 实现代码生成器
- 构建物料市场
