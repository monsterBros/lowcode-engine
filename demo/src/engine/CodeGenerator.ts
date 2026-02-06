/**
 * 代码生成器 - 将 Schema 转换为可部署的 React 代码
 */

import { ComponentSchema } from '@/types';

export class CodeGenerator {
    /**
     * 生成完整的 React 组件代码
     */
    generateReactCode(schema: ComponentSchema, componentName: string = 'App'): string {
        const imports = this.generateImports(schema);
        const component = this.generateComponent(schema, componentName);
        const exports = `export default ${componentName};`;

        return `${imports}\n\n${component}\n\n${exports}`;
    }

    /**
     * 生成导入语句
     */
    private generateImports(schema: ComponentSchema): string {
        const components = this.collectComponents(schema);
        const uniqueComponents = Array.from(new Set(components));

        const imports = [
            "import React from 'react';",
            ...uniqueComponents.map(comp => {
                // 假设组件都在 components 目录
                return `import ${comp} from './components/${comp}';`;
            })
        ];

        return imports.join('\n');
    }

    /**
     * 收集所有使用的组件
     */
    private collectComponents(node: ComponentSchema): string[] {
        const components: string[] = [];

        if (node.componentName !== 'Container') {
            components.push(node.componentName);
        }

        if (node.children) {
            node.children.forEach(child => {
                components.push(...this.collectComponents(child));
            });
        }

        return components;
    }

    /**
     * 生成组件代码
     */
    private generateComponent(schema: ComponentSchema, componentName: string): string {
        const jsx = this.generateJSX(schema, 2);

        return `const ${componentName} = () => {
  return (
${jsx}
  );
};`;
    }

    /**
     * 生成 JSX 代码
     */
    private generateJSX(node: ComponentSchema, indent: number = 0): string {
        const indentStr = ' '.repeat(indent);
        const { componentName, props = {}, events = {}, children } = node;

        // 生成属性
        const propsStr = this.generateProps(props, events);

        // 处理子节点
        if (children && children.length > 0) {
            const childrenJSX = children
                .map(child => this.generateJSX(child, indent + 2))
                .join('\n');

            return `${indentStr}<${componentName}${propsStr}>
${childrenJSX}
${indentStr}</${componentName}>`;
        } else {
            return `${indentStr}<${componentName}${propsStr} />`;
        }
    }

    /**
     * 生成属性字符串
     */
    private generateProps(
        props: Record<string, any>,
        events: Record<string, any> = {}
    ): string {
        const allProps = { ...props };

        // 添加事件
        Object.keys(events).forEach(eventName => {
            const handler = events[eventName];
            if (handler.type === 'JSFunction') {
                allProps[eventName] = `{${handler.value}}`;
            }
        });

        if (Object.keys(allProps).length === 0) {
            return '';
        }

        const propsArray = Object.entries(allProps).map(([key, value]) => {
            if (typeof value === 'string' && value.startsWith('{')) {
                return ` ${key}=${value}`;
            } else if (typeof value === 'string') {
                return ` ${key}="${value}"`;
            } else if (typeof value === 'number' || typeof value === 'boolean') {
                return ` ${key}={${value}}`;
            } else {
                return ` ${key}={${JSON.stringify(value)}}`;
            }
        });

        return propsArray.join('');
    }

    /**
     * 生成 package.json
     */
    generatePackageJson(projectName: string): string {
        const packageJson = {
            name: projectName,
            version: '1.0.0',
            private: true,
            dependencies: {
                react: '^16.14.0',
                'react-dom': '^16.14.0',
                antd: '^4.24.15'
            },
            scripts: {
                start: 'react-scripts start',
                build: 'react-scripts build'
            }
        };

        return JSON.stringify(packageJson, null, 2);
    }

    /**
     * 生成项目结构（文件列表）
     */
    generateProjectStructure(schema: ComponentSchema, projectName: string): {
        path: string;
        content: string;
    }[] {
        return [
            {
                path: 'src/App.js',
                content: this.generateReactCode(schema, 'App')
            },
            {
                path: 'src/index.js',
                content: `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'antd/dist/antd.css';

ReactDOM.render(<App />, document.getElementById('root'));`
            },
            {
                path: 'package.json',
                content: this.generatePackageJson(projectName)
            },
            {
                path: 'public/index.html',
                content: `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
            }
        ];
    }
}

export const codeGenerator = new CodeGenerator();
