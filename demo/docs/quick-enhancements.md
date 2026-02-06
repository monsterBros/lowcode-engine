# 快速增强指南 - 实现遗漏的核心模块

本指南帮助你快速实现最重要的3个遗漏模块。

## 🎯 模块1：事件绑定系统（最高优先级）

### 步骤1：创建 EventBus

```typescript
// src/engine/EventBus.ts
type EventListener = (...args: any[]) => void;

export class EventBus {
  private events: Map<string, EventListener[]> = new Map();

  on(event: string, listener: EventListener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    
    // 返回取消订阅函数
    return () => this.off(event, listener);
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  off(event: string, listener: EventListener) {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// 导出全局实例
export const eventBus = new EventBus();
```

### 步骤2：扩展 Schema 支持事件

```typescript
// src/types/index.ts - 添加事件配置
export interface ComponentSchema {
  id: string;
  componentName: string;
  props?: Record<string, any>;
  events?: Record<string, EventHandler>;  // 新增
  children?: ComponentSchema[];
}

export interface EventHandler {
  type: 'JSFunction' | 'JSExpression';
  value: string;
}
```

### 步骤3：创建事件配置面板

```typescript
// src/editor/RightPanel/EventPanel.tsx
import React from 'react';
import { Form, Select, Input } from 'antd';
import { useEditor } from '@/store/EditorContext';
import { findNode } from '@/utils/schema';

const EventPanel: React.FC = () => {
  const { schema, selectedNodeId, updateNodeProps } = useEditor();
  
  if (!selectedNodeId) return <div>请选择组件</div>;
  
  const node = findNode(schema, selectedNodeId);
  if (!node) return null;

  const handleEventChange = (eventName: string, code: string) => {
    const events = node.events || {};
    updateNodeProps(selectedNodeId, {
      events: {
        ...events,
        [eventName]: {
          type: 'JSFunction',
          value: code
        }
      }
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>事件配置</h3>
      <Form layout="vertical">
        <Form.Item label="onClick">
          <Input.TextArea
            rows={4}
            placeholder="function() { console.log('clicked'); }"
            value={node.events?.onClick?.value || ''}
            onChange={e => handleEventChange('onClick', e.target.value)}
          />
        </Form.Item>
        <Form.Item label="onChange">
          <Input.TextArea
            rows={4}
            placeholder="function(e) { console.log(e.target.value); }"
            value={node.events?.onChange?.value || ''}
            onChange={e => handleEventChange('onChange', e.target.value)}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

export default EventPanel;
```

### 步骤4：渲染器支持事件执行

```typescript
// src/editor/Canvas/Renderer.tsx - 修改渲染逻辑
const renderNode = (node: ComponentSchema): React.ReactNode => {
  const Component = MaterialComponents[node.componentName];
  
  // 处理事件绑定
  const eventProps: any = {};
  if (node.events) {
    Object.keys(node.events).forEach(eventName => {
      const handler = node.events![eventName];
      if (handler.type === 'JSFunction') {
        try {
          // 执行用户定义的函数
          eventProps[eventName] = new Function('return ' + handler.value)();
        } catch (e) {
          console.error('Event handler error:', e);
        }
      }
    });
  }

  return (
    <Component {...node.props} {...eventProps}>
      {node.children?.map(child => renderNode(child))}
    </Component>
  );
};
```

## 🎯 模块2：容器嵌套拖放

### 步骤1：Container 组件支持拖放

```typescript
// src/materials/components/Container/index.tsx - 修改
import React from 'react';
import { useDrop } from 'react-dnd';

interface ContainerProps {
  children?: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
  background?: string;
  padding?: number;
  gap?: number;
  // 新增：用于拖放
  nodeId?: string;
  onDropChild?: (nodeId: string, material: any) => void;
}

const Container: React.FC<ContainerProps> = ({ 
  children,
  layout = 'vertical',
  background = '#f5f5f5',
  padding = 16,
  gap = 8,
  nodeId,
  onDropChild
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'MATERIAL',
    drop: (item: any) => {
      if (onDropChild && nodeId) {
        onDropChild(nodeId, item.material);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    }),
  });

  const styles: React.CSSProperties = {
    display: 'flex',
    flexDirection: layout === 'vertical' ? 'column' : 'row',
    background: isOver ? '#e6f7ff' : background,
    padding: `${padding}px`,
    gap: `${gap}px`,
    minHeight: '100px',
    borderRadius: '4px',
    border: isOver ? '2px dashed #1890ff' : '1px dashed #d9d9d9',
  };

  return (
    <div ref={drop} style={styles}>
      {children && React.Children.count(children) > 0 
        ? children 
        : <div style={{ color: '#999', textAlign: 'center' }}>拖拽组件到这里</div>
      }
    </div>
  );
};

export default Container;
```

### 步骤2：Renderer 传递拖放回调

```typescript
// src/editor/Canvas/Renderer.tsx - 修改
const Renderer: React.FC<RendererProps> = ({ schema }) => {
  const { addNode } = useEditor();
  
  const handleDropToContainer = (containerId: string, material: any) => {
    // 创建新节点
    const newNode = createNodeFromMaterial(material);
    // 添加到指定容器
    addNode(containerId, newNode);
  };

  const renderNode = (node: ComponentSchema): React.ReactNode => {
    const Component = MaterialComponents[node.componentName];
    const isContainer = materialRegistry.isContainer(node.componentName);
    
    const extraProps = isContainer ? {
      nodeId: node.id,
      onDropChild: handleDropToContainer
    } : {};

    return (
      <Component {...node.props} {...extraProps}>
        {node.children?.map(child => renderNode(child))}
      </Component>
    );
  };

  return renderNode(schema);
};
```

## 🎯 模块3：撤销/重做

### 步骤1：创建 History 管理器

```typescript
// src/engine/History.ts
import { ComponentSchema } from '@/types';

export class History {
  private past: ComponentSchema[] = [];
  private future: ComponentSchema[] = [];
  private present: ComponentSchema;

  constructor(initialState: ComponentSchema) {
    this.present = JSON.parse(JSON.stringify(initialState));
  }

  push(newState: ComponentSchema) {
    this.past.push(this.present);
    this.present = JSON.parse(JSON.stringify(newState));
    this.future = []; // 清空 future
  }

  undo(): ComponentSchema | null {
    if (this.past.length === 0) return null;
    
    this.future.unshift(this.present);
    this.present = this.past.pop()!;
    return this.present;
  }

  redo(): ComponentSchema | null {
    if (this.future.length === 0) return null;
    
    this.past.push(this.present);
    this.present = this.future.shift()!;
    return this.present;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  getCurrent(): ComponentSchema {
    return this.present;
  }
}
```

### 步骤2：集成到 EditorContext

```typescript
// src/store/EditorContext.tsx - 修改
import { History } from '@/engine/History';

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schema, setSchema] = useState<ComponentSchema>(initialSchema);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [history] = useState(() => new History(initialSchema));

  const updateSchema = (newSchema: ComponentSchema) => {
    history.push(newSchema);
    setSchema(newSchema);
  };

  const undo = () => {
    const prevSchema = history.undo();
    if (prevSchema) {
      setSchema(prevSchema);
    }
  };

  const redo = () => {
    const nextSchema = history.redo();
    if (nextSchema) {
      setSchema(nextSchema);
    }
  };

  const addNode = (parentId: string | null, node: ComponentSchema) => {
    const newSchema = addNodeToSchema(schema, parentId, nodeWithId);
    updateSchema(newSchema);  // 使用 updateSchema 替代 setSchema
  };

  // ... 其他操作也改用 updateSchema

  return (
    <EditorContext.Provider value={{ 
      schema, selectedNodeId, 
      addNode, deleteNode, updateNodeProps,
      undo, redo,
      canUndo: history.canUndo(),
      canRedo: history.canRedo()
    }}>
      {children}
    </EditorContext.Provider>
  );
};
```

### 步骤3：添加快捷键和按钮

```typescript
// src/editor/Toolbar/Toolbar.tsx - 添加撤销/重做按钮
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
import { useEditor } from '@/store/EditorContext';

const Toolbar: React.FC = () => {
  const { undo, redo, canUndo, canRedo } = useEditor();

  // 添加快捷键
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>低代码引擎 Demo</h1>
      </div>
      <div className={styles.right}>
        <Space>
          <Button 
            icon={<UndoOutlined />} 
            onClick={undo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
          >
            撤销
          </Button>
          <Button 
            icon={<RedoOutlined />} 
            onClick={redo}
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
          >
            重做
          </Button>
          {/* 其他按钮... */}
        </Space>
      </div>
    </div>
  );
};
```

## 🚀 快速上手

### 实现事件系统（30分钟）
1. 创建 `src/engine/EventBus.ts`
2. 修改 `src/types/index.ts` 添加 events 字段
3. 创建 `src/editor/RightPanel/EventPanel.tsx`
4. 在 App.tsx 中添加事件面板标签页

### 实现嵌套拖放（20分钟）
1. 修改 `src/materials/components/Container/index.tsx`
2. 修改 `src/editor/Canvas/Renderer.tsx`

### 实现撤销/重做（20分钟）
1. 创建 `src/engine/History.ts`
2. 修改 `src/store/EditorContext.tsx`
3. 修改 `src/editor/Toolbar/Toolbar.tsx`

## 📦 依赖检查

所有需要的依赖都已安装，无需额外安装：
- ✅ react-dnd (拖拽)
- ✅ @ant-design/icons (图标)
- ✅ antd (UI组件)

## 💡 测试建议

### 测试事件系统
1. 选中一个Button组件
2. 在事件面板添加onClick: `function() { alert('clicked!'); }`
3. 导出JSON查看events字段
4. 点击按钮验证事件触发

### 测试嵌套拖放
1. 拖拽Container到画布
2. 拖拽Button到Container内部
3. 查看大纲树验证嵌套结构

### 测试撤销/重做
1. 添加几个组件
2. 点击撤销按钮或按 Ctrl+Z
3. 验证组件被移除
4. 点击重做按钮或按 Ctrl+Y
5. 验证组件恢复

好了！这样你的Demo就更接近完整的低代码引擎了！
