# 下一步实现计划 (P1优先级)

## 🎯 目标
将Demo从当前的95%核心功能覆盖率提升到接近100%，重点补充高价值特性。

## 📋 推荐实现功能（P1级别）

### 1. 动态渲染能力 ⭐⭐⭐

**优先级**: 最高  
**价值**: 极大提升页面动态性  
**工作量**: 中等（约3-5天）

#### 实现内容

##### 1.1 JSExpression求值引擎
```typescript
// src/renderer/ExpressionEngine.ts
class ExpressionEngine {
  /**
   * 求值表达式
   * @example 
   * evaluate('state.count + 1', { state: { count: 5 } })
   * // => 6
   */
  evaluate(expr: string, context: any): any {
    try {
      const func = new Function('context', `with(context) { return ${expr} }`);
      return func(context);
    } catch (error) {
      console.error('Expression evaluation failed:', error);
      return undefined;
    }
  }
}
```

##### 1.2 条件渲染
```typescript
// 扩展ComponentSchema
interface ComponentSchema {
  condition?: {
    type: '上JSExpression';
    value: string; // 例如: "state.isLoggedIn"
  };
  // ...
}

// 在Renderer中使用
if (node.condition) {
  const shouldRender = expressionEngine.evaluate(
    node.condition.value,
    context
  );
  if (!shouldRender) return null;
}
```

##### 1.3 循环渲染
```typescript
// 扩展ComponentSchema
interface ComponentSchema {
  loop?: {
    dataSource: string; // JSExpression: "state.items"
    itemName?: string;  // 默认'item'
    indexName?: string; // 默认'index'
  };
  // ...
}

// 在Renderer中使用
if (node.loop) {
  const dataSource = expressionEngine.evaluate(
    node.loop.dataSource,
    context
  );
  return dataSource.map((item, index) => {
    const loopContext = {
      ...context,
      [node.loop.itemName || 'item']: item,
      [node.loop.indexName || 'index']: index
    };
    return renderNode(node, loopContext);
  });
}
```

#### 实现步骤
1. 创建 `ExpressionEngine.ts`
2. 扩展 `ComponentSchema` 类型
3. 更新 `Renderer.tsx` 支持条件和循环
4. 创建 `ConditionSetter.tsx` 和 `LoopSetter.tsx`
5. 更新PropertyPanel集成新Setter
6. 编写测试和文档

---

### 2. Workspace多页面管理 ⭐⭐⭐

**优先级**: 高  
**价值**: 支持多页面应用开发  
**工作量**: 中等（约3-4天）

#### 实现方案

##### 2.1 数据结构
```typescript
// src/types/workspace.ts
interface Page {
  id: string;
  name: string;
  path: string;
  schema: ComponentSchema;
  meta?: {
    title?: string;
    description?: string;
    thumbnail?: string;
  };
}

interface Workspace {
  pages: Page[];
  activePage: string;
  globalState?: Record<string, any>;
}
```

##### 2.2 WorkspaceManager
```typescript
// src/workspace/WorkspaceManager.ts
class WorkspaceManager {
  private workspace: Workspace;
  
  createPage(config: Partial<Page>): Page {
    const page: Page = {
      id: generateId(),
      name: config.name || 'New Page',
      path: config.path || '/page-' + Date.now(),
      schema: config.schema || createEmptySchema(),
      meta: config.meta
    };
    this.workspace.pages.push(page);
    this.emit('page:created', page);
    return page;
  }
  
  switchPage(pageId: string): void {
    this.workspace.activePage = pageId;
    this.emit('page:switched', pageId);
  }
  
  deletePage(pageId: string): void {
    this.workspace.pages = this.workspace.pages.filter(p => p.id !== pageId);
    this.emit('page:deleted', pageId);
  }
  
  getActivePage(): Page | undefined {
    return this.workspace.pages.find(p => p.id === this.workspace.activePage);
  }
}
```

##### 2.3 UI组件
```typescript
// src/editor/Workspace/PageTabs.tsx
const PageTabs: React.FC = () => {
  const { pages, activePage, switchPage, createPage } = useWorkspace();
  
  return (
    <div className="page-tabs">
      {pages.map(page => (
        <div
          key={page.id}
          className={activePage === page.id ? 'active' : ''}
          onClick={() => switchPage(page.id)}
        >
          {page.name}
        </div>
      ))}
      <Button onClick={createPage}>+ 新建页面</Button>
    </div>
  );
};
```

#### 实现步骤
1. 定义Workspace类型
2. 实现WorkspaceManager
3. 创建PageTabs组件
4. 更新EditorContext集成Workspace
5. 实现页面切换和数据隔离
6. 更新代码生成器支持多页面

---

### 3. Shell API层 ⭐⭐

**优先级**: 中高  
**价值**: 统一API，便于二次开发  
**工作量**: 较少（约2-3天）

#### 实现方案

```typescript
// src/shell/api/index.ts

// 物料API
export const material = {
  /**
   * 注册物料
   */
  register(meta: MaterialMeta) {
    return materialRegistry.register(meta);
  },
  
  /**
   * 获取所有物料
   */
  getAll() {
    return materialRegistry.getAll();
  },
  
  /**
   * 获取物料元数据
   */
  get(componentName: string) {
    return materialRegistry.getMaterial(componentName);
  }
};

// 事件API
export const event = {
  /**
   * 订阅事件
   */
  on(type: string, handler: Function) {
    return eventBus.on(type, handler);
  },
  
  /**
   * 发布事件
   */
  emit(type: string, data?: any) {
    return eventBus.emit(type, data);
  },
  
  /**
   * 取消订阅
   */
  off(type: string, handler: Function) {
    return eventBus.off(type, handler);
  }
};

// 项目API
export const project = {
  /**
   * 获取当前Schema
   */
  getSchema() {
    return editorContext.schema;
  },
  
  /**
   * 设置Schema
   */
  setSchema(schema: ComponentSchema) {
    return editorContext.setSchema(schema);
  },
  
  /**
   * 导出Schema
   */
  export() {
    return JSON.stringify(editorContext.schema, null, 2);
  }
};

// 历史API
export const history = {
  undo() {
    return editorContext.undo();
  },
  
  redo() {
    return editorContext.redo();
  },
  
  canUndo() {
    return editorContext.canUndo;
  },
  
  canRedo() {
    return editorContext.canRedo;
  }
};

// 统一导出
export const engine = {
  material,
  event,
  project,
  history
};

// 挂载到window
if (typeof window !== 'undefined') {
  (window as any).engine = engine;
}
```

#### 使用示例
```javascript
// 在控制台或脚本中使用
engine.material.register(myComponentMeta);
engine.event.on('node:select', (node) => {
  console.log('Selected:', node);
});
engine.project.export();
engine.history.undo();
```

---

### 4. 命令系统 ⭐⭐

**优先级**: 中  
**价值**: 统一操作抽象，易于扩展  
**工作量**: 中等（约2-3天）

#### 实现方案

```typescript
// src/commands/CommandManager.ts
interface Command {
  name: string;
  execute: (...args: any[]) => void;
  undo?: () => void;
  hotkey?: string;
}

class CommandManager {
  private commands = new Map<string, Command>();
  private hotkeys = new Map<string, string>();
  
  /**
   * 注册命令
   */
  register(command: Command) {
    this.commands.set(command.name, command);
    if (command.hotkey) {
      this.hotkeys.set(command.hotkey, command.name);
    }
  }
  
  /**
   * 执行命令
   */
  execute(name: string, ...args: any[]) {
    const command = this.commands.get(name);
    if (!command) {
      console.warn(`Command "${name}" not found`);
      return;
    }
    command.execute(...args);
  }
  
  /**
   * 绑定快捷键
   */
  bindHotkey(key: string, commandName: string) {
    this.hotkeys.set(key, commandName);
  }
  
  /**
   * 初始化快捷键监听
   */
  init() {
    document.addEventListener('keydown', (e) => {
      const key = this.getHotkeyString(e);
      const commandName = this.hotkeys.get(key);
      if (commandName) {
        e.preventDefault();
        this.execute(commandName);
      }
    });
  }
  
  private getHotkeyString(e: KeyboardEvent): string {
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    parts.push(e.key.toUpperCase());
    return parts.join('+');
  }
}

//使用示例
commandManager.register({
  name: 'delete-node',
  execute: (nodeId) => {
    editorContext.deleteNode(nodeId);
  },
  hotkey: 'Delete'
});

commandManager.register({
  name: 'copy-node',
  execute: (nodeId) => {
    // 复制逻辑
  },
  hotkey: 'Ctrl+C'
});
```

---

## 📅 实施时间表

| 功能 | 工作量 | 预计时间 | 优先级 |
|------|--------|----------|--------|
| 动态渲染能力 | 中 | 3-5天 | P0 ⭐⭐⭐ |
| Workspace多页面 | 中 | 3-4天 | P1 ⭐⭐⭐ |
| Shell API层 | 小 | 2-3天 | P1 ⭐⭐ |
| 命令系统 | 中 | 2-3天 | P1 ⭐⭐ |

**总计**: 约10-15天完成P1所有功能

## 🎓 实现顺序建议

1. **第一周**: Shell API层 + 命令系统
   - 快速见效
   - 为后续开发提供基础

2. **第二周**: 动态渲染能力
   - 核心价值高
   - 需要较多时间打磨

3. **第三周**: Workspace多页面
   - 架构变更较大
   - 需要充分测试

## ✅ 预期效果

完成后Demo将达到：
- ✅ **98%+** 核心功能覆盖率
- ✅ 支持动态页面开发
- ✅ 支持多页面应用
- ✅ 统一的API调用
- ✅ 完善的快捷键系统

## 📚 参考资源

- Alibaba LowCode Engine 官方文档
- React 表达式求值最佳实践
- Workspace架构设计模式
- 命令模式实现

---

**准备好开始了吗？** 🚀
