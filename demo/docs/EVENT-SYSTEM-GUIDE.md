# 事件系统和状态管理完整指南

## 概述

低代码引擎现已支持完整的事件系统和状态管理，包含5种不同的方案供学习和使用。

## 核心系统

### 1. ComponentEventSystem（组件事件系统）

每个组件都可以绑定事件并访问丰富的上下文API。

#### EventContext API

在事件处理函数中，您可以使用以下API：

| API | 说明 | 示例 |
|-----|------|------|
| `event` | 原生事件对象 | `event.target.value` |
| `nodeId` | 当前组件ID | `console.log(nodeId)` |
| `emit(name, data)` | 触发组件事件 | `emit('clicked', {})` |
| `emitGlobal(name, data)` | 触发全局事件 | `emitGlobal('submit', data)` |
| `getNode(id)` | 获取其他组件 | `getNode('input-1')` |
| `updateNode(id, props)` | 更新组件属性 | `updateNode('text-1', {...})` |
| `getState(key)` | 获取全局状态 | `getState('count')` |
| `setState(key, value)` | 设置全局状态 | `setState('count', 10)` |
| `callRef(id, method, ...args)` | 调用组件方法 | `callRef('input-1', 'focus')` |

#### 使用示例

**按钮点击事件**:
```javascript
// 更新文本组件
updateNode('text-1', { 
  children: '按钮已点击！' 
});

// 更新计数
const count = getState('clickCount') || 0;
setState('clickCount', count + 1);

// 触发全局事件
emitGlobal('button-clicked', { 
  timestamp: Date.now() 
});
```

**表单提交事件**:
```javascript
// 获取表单数据
const username = getNode('username-input')?.props.value;
const email = getNode('email-input')?.props.value;

// 验证
if (!username || !email) {
  setState('error', '请填写完整信息');
  return;
}

// 保存到状态
setState('formData', { username, email });
setState('submitStatus', 'success');

// 清空表单
updateNode('username-input', { value: '' });
updateNode('email-input', { value: '' });
```

### 2. StateManager（全局状态管理）

集中式状态管理，支持订阅/发布模式。

#### API

```javascript
// 获取状态
const value = stateManager.get('key');

// 设置状态
stateManager.set('key', 'value');

// 批量更新
stateManager.update({
  loading: false,
  data: result,
  error: null
});

// 订阅状态变化
const unsubscribe = stateManager.subscribe('key', (newValue, oldValue) => {
  console.log('状态改变:', oldValue, '->', newValue);
});

// 订阅所有变化
stateManager.subscribeAll((state) => {
  console.log('全局状态:', state);
});

// 获取所有状态
const allState = stateManager.getAll();

// 删除状态
stateManager.delete('key');

// 清空所有状态
stateManager.clear();
```

#### 在事件中使用

```javascript
// 计数器
const count = getState('count') || 0;
setState('count', count + 1);

// 购物车
const cart = getState('cart') || [];
cart.push({ id: 1, name: '商品' });
setState('cart', cart);

// 用户信息
setState('user', {
  name: 'John',
  age: 25,
  email: 'john@example.com'
});
```

### 3. RefManager（组件引用管理）

直接调用组件方法，适用于DOM操作和第三方组件。

#### API

```javascript
// 调用组件方法
refManager.callMethod('input-1', 'focus');

// 获取组件实例
const instance = refManager.getInstance('modal-1');

// 检查组件是否存在
const exists = refManager.has('input-1');
```

#### 在事件中使用

```javascript
// 聚焦输入框
callRef('username-input', 'focus');

// 重置表单
callRef('user-form', 'reset');

// 滚动到元素
callRef('section-1', 'scrollIntoView');

// 调用带参数的方法
callRef('modal-1', 'open', { title: '提示' });
```

### 4. EventBus（事件总线）

解耦的事件通信系统。

#### API

```javascript
// 订阅事件
eventBus.on('event-name', (data) => {
  console.log('收到事件:', data);
});

// 触发事件
eventBus.emit('event-name', { payload: 'data' });

// 一次性订阅
eventBus.once('event-name', handler);

// 取消订阅
eventBus.off('event-name', handler);
```

#### 在事件中使用

```javascript
// 组件A: 发布数据变化
emitGlobal('data-updated', {
  id: nodeId,
  timestamp: Date.now(),
  data: getState('currentData')
});

// 组件B会通过eventBus.on监听到这个事件
```

## 实战示例

### 示例1: 动态表单

```javascript
// Select onChange事件 - 根据选择显示不同字段
const selectedType = event.target.value;

if (selectedType === 'personal') {
  updateNode('id-card-field', { style: { display: 'block' } });
  updateNode('company-field', { style: { display: 'none' } });
} else if (selectedType === 'company') {
  updateNode('id-card-field', { style: { display: 'none' } });
  updateNode('company-field', { style: { display: 'block' } });
  callRef('company-input', 'focus');
}

setState('formType', selectedType);
```

### 示例2: 搜索功能

```javascript
// 按钮onClick事件 - 执行搜索
const keyword = getNode('search-input')?.props.value;

if (!keyword) {
  setState('error', '请输入搜索关键词');
  callRef('search-input', 'focus');
  return;
}

// 更新状态
setState('searching', true);
setState('keyword', keyword);

// 模拟搜索（实际应该调用API）
setTimeout(() => {
  const results = [
    { id: 1, title: '结果1' },
    { id: 2, title: '结果2' }
  ];
  
  setState('searchResults', results);
  setState('searching', false);
  
  // 更新结果显示
  updateNode('result-list', { 
    dataSource: results 
  });
}, 1000);
```

### 示例3: 模态框控制

```javascript
// 打开按钮onClick
setState('modalVisible', true);
setState('modalData', {
  title: '用户详情',
  content: getState('currentUser')
});

// 更新模态框属性
updateNode('user-modal', {
  visible: true,
  title: '用户详情'
});

// 或者使用ref调用
callRef('user-modal', 'show');
```

### 示例4: 组件间通信

```javascript
// 购物车添加按钮
const cart = getState('cart') || [];
const product = {
  id: getNode('product-id')?.props.value,
  name: getNode('product-name')?.props.value,
  price: getNode('product-price')?.props.value
};

cart.push(product);
setState('cart', cart);

// 触发全局事件通知其他组件
emitGlobal('cart-updated', {
  count: cart.length,
  total: cart.reduce((sum, item) => sum + item.price, 0)
});

// 更新购物车图标的badge
updateNode('cart-badge', {
  count: cart.length
});
```

## 最佳实践

### 1. 状态命名规范

```javascript
// ✅ 好的命名
setState('user', {...});
setState('isLoading', true);
setState('errorMessage', '');
setState('formData', {...});

// ❌ 避免的命名
setState('a', 1);
setState('temp', '');
setState('data', '');
```

### 2. 错误处理

```javascript
// 始终验证数据
const input = getNode('input-1');
if (!input || !input.props.value) {
  setState('error', '输入不能为空');
  return;
}

// Try-catch保护
try {
  const data = JSON.parse(getState('jsonData'));
  // 处理数据...
} catch (e) {
  setState('error', '数据格式错误');
}
```

### 3. 性能优化

```javascript
// 批量更新状态
stateManager.update({
  loading: false,
  data: result,
  error: null,
  timestamp: Date.now()
});

// 而不是多次单独设置
// setState('loading', false);
// setState('data', result);
// setState('error', null);
```

### 4. 组件解耦

```javascript
// ✅ 使用事件总线解耦
emitGlobal('user-login', { userId: 123 });

// ❌ 避免直接依赖
// directlyCallOtherComponent();
```

## 调试技巧

### 1. 查看全局状态

```javascript
// 在任何事件中
console.log('📦 当前状态:', getState('*') || stateManager.getAll());
```

### 2. 调试单个组件

```javascript
const node = getNode('component-id');
console.log('🔍 组件信息:', {
  id: node.id,
  componentName: node.componentName,
  props: node.props,
  children: node.children
});
```

### 3. 监听状态变化

```javascript
// 在开发者工具控制台
stateManager.subscribe('*', (state) => {
  console.log('📊 状态变化:', state);
});
```

## 常见问题

### Q: 如何在组件间共享数据？

A: 使用StateManager的全局状态：

```javascript
// 组件A设置
setState('sharedData', { value: 123 });

// 组件B获取
const data = getState('sharedData');
```

### Q: 如何调用第三方组件的方法？

A: 使用callRef:

```javascript
// 调用Ant Design Form的方法
callRef('my-form', 'validateFields');

// 调用Modal的方法
callRef('my-modal', 'open');
```

### Q: 事件中的this是什么？

A: 不要使用this，所有API都通过EventContext提供：

```javascript
// ✅ 正确
setState('count', getState('count') + 1);

// ❌ 错误
this.setState(...);  // this是undefined
```

### Q: 如何防止事件重复触发？

A: 使用状态标记：

```javascript
const isSubmitting = getState('isSubmitting');
if (isSubmitting) return;

setState('isSubmitting', true);
// 执行操作...
setState('isSubmitting', false);
```

## 进阶主题

### 1. 命名空间状态

```javascript
// 使用前缀组织状态
setState('user:name', 'John');
setState('user:email', 'john@example.com');
setState('cart:items', []);
setState('cart:total', 0);
```

### 2. 状态持久化

```javascript
// 保存到localStorage
const state = stateManager.getAll();
localStorage.setItem('app-state', JSON.stringify(state));

// 恢复
const saved = JSON.parse(localStorage.getItem('app-state') || '{}');
stateManager.update(saved);
```

### 3. 复杂联动

```javascript
// 级联选择
const province = event.target.value;
setState('province', province);

// 根据省份获取城市（模拟）
const cities = getCitiesByProvince(province);
updateNode('city-select', { 
  options: cities,
  value: cities[0]?.value
});

// 清空区县
updateNode('district-select', { 
  options: [],
  value: null
});
```

## 参考

- [ComponentEventSystem源码](../src/engine/ComponentEventSystem.ts)
- [StateManager源码](../src/engine/StateManager.ts)
- [RefManager源码](../src/engine/RefManager.ts)
- [EventBus源码](../src/engine/EventBus.ts)

## 更新日志

- **2026-02-12**: 完成P0-P2实现
  - ✅ ComponentEventSystem
  - ✅ StateManager  
  - ✅ RefManager
