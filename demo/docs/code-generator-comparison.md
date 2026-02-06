# 代码生成器方案对比与使用指南

## 两种代码生成方案

### 方案1: 字符串拼接 (CodeGenerator.ts)

**文件**: `src/engine/CodeGenerator.ts`

**实现方式**:
```typescript
// 直接拼接字符串生成代码
const code = `
import React from 'react';
import ${componentName} from './components/${componentName}';

const App = () => {
  return <${componentName} ${props} />;
};
`;
```

**优点**:
- ✅ 简单直观，易于理解
- ✅ 无需额外依赖
- ✅ 轻量级，启动快
- ✅ 适合快速原型开发
- ✅ 代码生成速度快

**缺点**:
- ❌ 容易出现语法错误
- ❌ 难以处理复杂结构
- ❌ 代码格式化不稳定
- ❌ 扩展性较差
- ❌ 难以维护复杂逻辑

**适用场景**:
- 简单组件生成
- 快速原型验证
- Demo演示
- 学习和教学

**使用示例**:
```typescript
import { codeGenerator } from '@/engine/CodeGenerator';

const schema = {
  id: 'root',
  componentName: 'Container',
  props: {},
  children: [...]
};

const code = codeGenerator.generateReactCode(schema, 'MyApp');
console.log(code);
```

---

### 方案2: AST生成 (ASTCodeGenerator.ts) ⭐推荐

**文件**: `src/engine/ASTCodeGenerator.ts`

**实现方式**:
```typescript
// 使用 Babel AST 构建代码
import * as t from '@babel/types';
import generate from '@babel/generator';

// 创建 import 语句 AST 节点
const importNode = t.importDeclaration(
  [t.importDefaultSpecifier(t.identifier('React'))],
  t.stringLiteral('react')
);

// 生成代码
const output = generate(program);
```

**优点**:
- ✅ 语法100%正确保证
- ✅ 支持代码格式化和美化
- ✅ 易于扩展和维护
- ✅ 支持复杂代码结构
- ✅ 可进行代码优化
- ✅ 生产级质量
- ✅ 支持SourceMap

**缺点**:
- ❌ 需要额外依赖(@babel/types, @babel/generator)
- ❌ 学习曲线稍陡
- ❌ 代码量较大
- ❌ 生成速度稍慢

**适用场景**:
- 生产环境代码生成
- 复杂组件结构
- 需要代码优化
- 企业级项目
- 可部署的代码

**使用示例**:
```typescript
import { astCodeGenerator } from '@/engine/ASTCodeGenerator';

const schema = {
  id: 'root',
  componentName: 'Container',
  props: {},
  children: [...]
};

const code = astCodeGenerator.generateReactCode(schema, 'MyApp');
console.log(code);
```

---

## 详细对比

| 维度 | 字符串拼接 | AST生成 |
|------|-----------|---------|
| **实现难度** | 简单 ⭐ | 中等 ⭐⭐⭐ |
| **代码质量** | 中 ⭐⭐ | 高 ⭐⭐⭐⭐⭐ |
| **语法保证** | 需手动测试 | 100%正确 ✅ |
| **可维护性** | 低 ⭐⭐ | 高 ⭐⭐⭐⭐ |
| **扩展性** | 低 ⭐⭐ | 高 ⭐⭐⭐⭐⭐ |
| **生成速度** | 快 ⭐⭐⭐⭐⭐ | 中 ⭐⭐⭐ |
| **包大小** | 小 ⭐⭐⭐⭐⭐ | 大 ⭐⭐ |
| **学习成本** | 低 ⭐ | 中 ⭐⭐⭐ |
| **适用场景** | Demo/学习 | 生产环境 |

---

## 核心技术对比

### 字符串拼接核心代码
```typescript
class CodeGenerator {
  generateReactCode(schema: ComponentSchema): string {
    const imports = this.generateImports(schema);
    const jsx = this.generateJSX(schema);
    
    return `
      ${imports}
      
      const App = () => {
        return (
          ${jsx}
        );
      };
      
      export default App;
    `;
  }
  
  private generateJSX(node: ComponentSchema): string {
    const { componentName, props, children } = node;
    const propsStr = this.generateProps(props);
    
    if (!children || children.length === 0) {
      return `<${componentName}${propsStr} />`;
    }
    
    const childrenJSX = children
      .map(child => this.generateJSX(child))
      .join('\n');
    
    return `
      <${componentName}${propsStr}>
        ${childrenJSX}
      </${componentName}>
    `;
  }
}
```

### AST生成核心代码
```typescript
class ASTCodeGenerator {
  generateReactCode(schema: ComponentSchema): string {
    // 1. 构建导入语句 AST
    const imports = this.generateImportStatements(schema);
    
    // 2. 构建组件函数 AST
    const componentFunction = this.generateComponentFunction(schema);
    
    // 3. 构建导出语句 AST
    const exportStatement = this.generateExportStatement();
    
    // 4. 组合成程序 AST
    const program = t.program([
      ...imports,
      componentFunction,
      exportStatement
    ]);
    
    // 5. 生成代码
    const output = generate(program, {
      comments: true,
      compact: false
    });
    
    return output.code;
  }
  
  private generateJSXElement(node: ComponentSchema): t.JSXElement {
    const { componentName, props, children } = node;
    
    // 创建开始标签 AST
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier(componentName),
      this.generateJSXAttributes(props),
      !children || children.length === 0
    );
    
    // 如果没有子元素
    if (!children || children.length === 0) {
      return t.jsxElement(openingElement, null, [], true);
    }
    
    // 创建结束标签 AST
    const closingElement = t.jsxClosingElement(
      t.jsxIdentifier(componentName)
    );
    
    // 递归生成子元素 AST
    const jsxChildren = children.map(child => 
      this.generateJSXElement(child)
    );
    
    return t.jsxElement(
      openingElement,
      closingElement,
      jsxChildren,
      false
    );
  }
}
```

---

## AST 核心概念

### 什么是 AST?
Abstract Syntax Tree（抽象语法树）是源代码的树形表示，将代码结构化为可操作的数据结构。

### AST 生成流程
```
Schema对象
    ↓
AST节点构建
    ↓
AST树组合
    ↓
代码生成器
    ↓
JavaScript代码
```

### AST 节点示例
```typescript
// 代码: import React from 'react';
// AST表示:
{
  type: 'ImportDeclaration',
  specifiers: [{
    type: 'ImportDefaultSpecifier',
    local: { type: 'Identifier', name: 'React' }
  }],
  source: { type: 'StringLiteral', value: 'react' }
}

// 代码: <Button onClick={handleClick}>Click</Button>
// AST表示:
{
  type: 'JSXElement',
  openingElement: {
    type: 'JSXOpeningElement',
    name: { type: 'JSXIdentifier', name: 'Button' },
    attributes: [{
      type: 'JSXAttribute',
      name: { type: 'JSXIdentifier', name: 'onClick' },
      value: {
        type: 'JSXExpressionContainer',
        expression: { type: 'Identifier', name: 'handleClick' }
      }
    }]
  },
  children: [{
    type: 'JSXText',
    value: 'Click'
  }]
}
```

---

## 集成到 CodeExport 组件

更新 `CodeExport.tsx` 以支持两种生成方式：

```typescript
import { codeGenerator } from '@/engine/CodeGenerator';
import { astCodeGenerator } from '@/engine/ASTCodeGenerator';

const CodeExport: React.FC = () => {
  const [mode, setMode] = useState<'string' | 'ast'>('ast');
  
  const handleGenerate = () => {
    const generator = mode === 'ast' 
      ? astCodeGenerator 
      : codeGenerator;
      
    const code = generator.generateReactCode(schema, 'App');
    setGeneratedCode(code);
  };
  
  return (
    <Modal>
      <Select value={mode} onChange={setMode}>
        <Option value="string">字符串拼接（快速）</Option>
        <Option value="ast">AST生成（推荐）</Option>
      </Select>
      
      {/* ... */}
    </Modal>
  );
};
```

---

## 安装依赖

使用 AST 生成器需要安装：

```bash
pnpm add @babel/types @babel/generator
pnpm add -D @types/babel__types @types/babel__generator
```

---

## 最佳实践建议

### 开发阶段
- ✅ 使用**字符串拼接**快速验证
- ✅ 快速迭代和调试

### 生产环境
- ✅ 使用**AST生成器**保证质量
- ✅ 部署可靠的代码

### 学习阶段
- ✅ 先学**字符串拼接**理解原理
- ✅ 再学**AST生成**掌握进阶

---

## 总结

两种方案各有优势：

**字符串拼接**：简单快速，适合Demo和学习
**AST生成**：专业可靠，适合生产环境

**推荐策略**：
- Demo演示：字符串拼接 ⚡
- 生产部署：AST生成 ⭐
- 同时提供两种方案给用户选择 ✅

这样既保证了易用性，又提供了专业选项！
