# 双模式渲染系统：普通渲染 vs iframe隔离

## 🎯 系统概述

本低代码引擎实现了两种渲染模式，你可以通过Canvas顶部的切换按钮在两者之间切换。

---

## 📊 两种模式对比

### 模式1：普通渲染（Normal Rendering）

**原理**：
- 直接在主窗口的React组件树中渲染
- 与编辑器UI共享同一个DOM和样式上下文
- 使用react-dnd实现拖拽功能

**实现文件**：
- `Canvas.tsx` - 主画布组件
- `Renderer.tsx` - 普通渲染器
- 在DndProvider上下文中运行

**优点**：
- ✅ 实现简单，直接渲染
- ✅ 完整的react-dnd拖拽支持
- ✅ 可以直接访问所有React hooks和context
- ✅ 性能较好，无额外开销

**缺点**：
- ❌ 样式污染：用户的全局样式会影响编辑器UI
- ❌ 脚本冲突：全局变量和事件可能相互干扰
- ❌ 预览不真实：与实际生产环境可能有差异

**适用场景**：
- 简单的Demo和学习项目
- 不需要复杂全局样式的场景
- 快速原型开发

---

### 模式2：iframe隔离（Iframe Isolation）

**原理**：
- 在独立的iframe中渲染用户设计的页面
- 创建完全隔离的DOM、样式和脚本环境
- 通过postMessage进行跨iframe通信

**实现文件**：
- `Canvas.tsx` - 主画布组件
- `Simulator.tsx` - iframe隔离渲染器
- 独立的HTML文档环境

**优点**：
- ✅ 完全的样式隔离：用户样式不会影响编辑器
- ✅ 脚本隔离：全局变量和事件完全独立
- ✅ 真实预览：完全模拟生产环境
- ✅ 安全性：用户代码在沙箱中运行

**缺点**：
- ⚠️ 拖拽复杂：react-dnd上下文无法跨iframe
- ⚠️ 通信复杂：需要postMessage
- ⚠️ 性能开销：创建和维护iframe有开销
- ⚠️ 实现复杂：需要处理更多边界情况

**适用场景**：
- **生产级低代码平台**
- 需要真实预览效果
- 用户会添加全局样式和脚本
- 需要完全的样式隔离

---

## 🔧 实现细节

### 普通渲染实现（Renderer.tsx）

```typescript
// 1. 直接在主窗口渲染
const Renderer = ({ schema }) => {
  // 2. 递归渲染schema
  const renderNode = (node) => {
    const Component = MaterialComponents[node.componentName];
    return (
      <Component {...node.props}>
        {node.children?.map(renderNode)}
      </Component>
    );
  };
  
  // 3. 在DndProvider上下文中，支持拖拽
  return renderNode(schema);
};
```

**关键点**：
- 使用React的正常组件渲染
- 可以直接使用useDrop等react-dnd hooks
- 共享主窗口的样式和脚本

---

### iframe隔离实现（Simulator.tsx）

```typescript
// 1. 创建iframe并写入HTML
const initIframe = () => {
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>/* 独立的样式 */</style>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `);
};

// 2. 注入React和组件库到iframe
iframeWindow.React = React;
iframeWindow.MaterialComponents = MaterialComponents;

// 3. 在iframe中渲染
const rootElement = renderInIframe(schema);
iframeWindow.ReactDOM.render(rootElement, container);

// 4. 事件通信通过回调函数
onClick: (e) => {
  onNodeSelect?.(node.id); // 调用主窗口的回调
}
```

**关键点**：
1. **独立文档**：iframe有自己的document和window
2. **样式隔离**：iframe内的样式不影响外部
3. **组件注入**：将React和组件库注入到iframe.window
4. **事件通信**：通过props传递的回调函数

---

## 🎯 样式污染演示

### 问题场景

假设用户在设计页面时添加了这样的全局样式：

```css
/* 用户的全局样式 */
body {
  background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
  font-family: "Comic Sans MS";
  padding: 50px;
}

* {
  box-sizing: content-box !important;
}

button {
  background: red !important;
  color: yellow !important;
}
```

### 普通渲染的后果

- ❌ 编辑器的工具栏背景变成渐变色
- ❌ 所有字体变成Comic Sans MS
- ❌ 编辑器的按钮变成红底黄字
- ❌ 布局可能错乱（box-sizing改变）

### iframe隔离的效果

- ✅ 这些样式只在iframe内生效
- ✅ 编辑器UI完全不受影响
- ✅ 用户看到真实的预览效果
- ✅ 切换回普通模式可以编辑

---

## 💡 使用建议

### 开发阶段
1. 使用**普通渲染模式**进行拖拽编辑
2. 快速添加和调整组件
3. 利用完整的拖拽功能

### 预览阶段
1. 切换到**iframe隔离模式**
2. 查看真实的渲染效果
3. 确认样式和布局正确

### 生产部署
对于真正的生产级平台，建议：
- 默认使用iframe隔离模式
- 实现跨iframe的拖拽系统
- 或者提供专门的"编辑模式"和"预览模式"

---

## 🚀 技术扩展

### 如何实现跨iframe拖拽？

如果要在iframe模式下支持拖拽编辑，需要：

1. **自定义拖拽系统**（不使用react-dnd）
```typescript
// 使用原生drag事件
element.addEventListener('dragstart', (e) => {
  // postMessage通知主窗口
  window.parent.postMessage({
    type: 'DRAG_START',
    data: { nodeId, position }
  }, '*');
});
```

2. **postMessage通信**
```typescript
// iframe内
window.parent.postMessage({ type: 'ACTION', payload }, '*');

// 主窗口
window.addEventListener('message', (event) => {
  if (event.data.type === 'ACTION') {
    handleAction(event.data.payload);
  }
});
```

3. **位置同步**
```typescript
// 在iframe外绘制拖拽遮罩
// 通过getBoundingClientRect同步位置
```

---

## 📚 学习要点

通过这个双模式系统，你可以学到：

1. **React渲染原理**
   - 组件如何在不同上下文中渲染
   - DOM和样式的作用域

2. **iframe技术**
   - 如何动态创建和控制iframe
   - 跨文档通信

3. **架构设计**
   - 如何处理样式隔离问题
   - 权衡利弊做技术选型

4. **低代码平台架构**
   - 为什么专业平台使用iframe
   - 如何平衡功能和复杂度

---

## 🎓 实践建议

1. **先用普通模式**体验拖拽编辑
2. **添加一些全局样式**到Container组件
3. **切换到iframe模式**看看区别
4. **观察开发者工具**中的DOM结构
5. **尝试修改Simulator.tsx**中的样式

---

**总结**：iframe隔离不是过度设计，而是生产级低代码平台的必需架构！
