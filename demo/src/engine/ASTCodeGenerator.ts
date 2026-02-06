/**
 * AST 代码生成器 - 基于 Babel
 * 使用抽象语法树生成更可靠、更易维护的React代码
 * 
 * 优势：
 * - 语法保证正确
 * - 支持代码格式化
 * - 易于扩展和维护
 * - 支持复杂代码结构
 * 
 * 适用场景：
 * - 生产环境代码生成
 * - 复杂组件结构
 * - 需要代码优化
 */

import * as t from '@babel/types';
import generate from '@babel/generator';
import { ComponentSchema } from '@/types';

export class ASTCodeGenerator {
    /**
     * 生成 React 组件代码（基于AST）
     */
    generateReactCode(schema: ComponentSchema, componentName: string = 'App'): string {
        // 1. 生成导入语句
        const imports = this.generateImportStatements(schema);

        // 2. 生成组件函数
        const componentFunction = this.generateComponentFunction(schema, componentName);

        // 3. 生成导出语句
        const exportStatement = this.generateExportStatement(componentName);

        // 4. 组合成完整的 AST 程序
        const program = t.program([
            ...imports,
            componentFunction,
            exportStatement
        ]);

        // 5. 生成代码字符串
        const output = generate(program, {
            comments: true,
            compact: false,
            retainLines: false
        });

        return output.code;
    }

    /**
     * 生成导入语句的 AST 节点
     */
    private generateImportStatements(schema: ComponentSchema): t.Statement[] {
        const components = this.collectComponents(schema);
        const uniqueComponents = Array.from(new Set(components));

        const imports: t.Statement[] = [
            // import React from 'react';
            t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier('React'))],
                t.stringLiteral('react')
            )
        ];

        // import ComponentName from './components/ComponentName';
        uniqueComponents.forEach(comp => {
            imports.push(
                t.importDeclaration(
                    [t.importDefaultSpecifier(t.identifier(comp))],
                    t.stringLiteral(`./components/${comp}`)
                )
            );
        });

        return imports;
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
     * 生成组件函数的 AST 节点
     */
    private generateComponentFunction(
        schema: ComponentSchema,
        componentName: string
    ): t.FunctionDeclaration {
        // 生成 JSX 元素
        const jsxElement = this.generateJSXElement(schema);

        // 创建函数体
        const functionBody = t.blockStatement([
            t.returnStatement(jsxElement)
        ]);

        // 创建函数声明
        // const ComponentName = () => { return <JSX />; };
        return t.functionDeclaration(
            t.identifier(componentName),
            [],
            functionBody
        );
    }

    /**
     * 生成 JSX 元素的 AST 节点
     */
    private generateJSXElement(node: ComponentSchema): t.JSXElement {
        const { componentName, props = {}, events = {}, children } = node;

        // 创建 JSX 开始标签
        const openingElement = t.jsxOpeningElement(
            t.jsxIdentifier(componentName),
            this.generateJSXAttributes(props, events),
            children && children.length > 0 ? false : true // 是否自闭合
        );

        // 如果没有子元素，返回自闭合标签
        if (!children || children.length === 0) {
            return t.jsxElement(
                openingElement,
                null,
                [],
                true
            );
        }

        // 创建 JSX 结束标签
        const closingElement = t.jsxClosingElement(
            t.jsxIdentifier(componentName)
        );

        // 递归生成子元素
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

    /**
     * 生成 JSX 属性的 AST 节点
     */
    private generateJSXAttributes(
        props: Record<string, any>,
        events: Record<string, any>
    ): t.JSXAttribute[] {
        const attributes: t.JSXAttribute[] = [];

        // 处理普通属性
        Object.entries(props).forEach(([key, value]) => {
            attributes.push(this.createJSXAttribute(key, value));
        });

        // 处理事件
        Object.entries(events).forEach(([eventName, handler]) => {
            if (handler.type === 'JSFunction') {
                // 创建事件处理器的 AST 表达式
                const functionExpression = t.arrowFunctionExpression(
                    [t.identifier('event')],
                    t.blockStatement([
                        t.expressionStatement(
                            t.callExpression(
                                t.memberExpression(
                                    t.identifier('console'),
                                    t.identifier('log')
                                ),
                                [t.identifier('event')]
                            )
                        )
                    ])
                );

                attributes.push(
                    t.jsxAttribute(
                        t.jsxIdentifier(eventName),
                        t.jsxExpressionContainer(functionExpression)
                    )
                );
            }
        });

        return attributes;
    }

    /**
     * 创建单个 JSX 属性
     */
    private createJSXAttribute(name: string, value: any): t.JSXAttribute {
        let attributeValue: t.JSXAttribute['value'];

        if (typeof value === 'string') {
            attributeValue = t.stringLiteral(value);
        } else if (typeof value === 'number') {
            attributeValue = t.jsxExpressionContainer(t.numericLiteral(value));
        } else if (typeof value === 'boolean') {
            attributeValue = t.jsxExpressionContainer(t.booleanLiteral(value));
        } else {
            // 复杂对象转为表达式
            attributeValue = t.jsxExpressionContainer(
                t.identifier(JSON.stringify(value))
            );
        }

        return t.jsxAttribute(
            t.jsxIdentifier(name),
            attributeValue
        );
    }

    /**
     * 生成导出语句的 AST 节点
     */
    private generateExportStatement(componentName: string): t.ExportDefaultDeclaration {
        return t.exportDefaultDeclaration(t.identifier(componentName));
    }

    /**
     * 生成完整项目结构（AST版本）
     */
    generateProjectStructure(schema: ComponentSchema, projectName: string): {
        path: string;
        content: string;
    }[] {
        return [
            {
                path: 'src/App.jsx',
                content: this.generateReactCode(schema, 'App')
            },
            {
                path: 'src/index.jsx',
                content: this.generateIndexFile()
            },
            {
                path: 'package.json',
                content: this.generatePackageJson(projectName)
            },
            {
                path: 'README.md',
                content: this.generateReadme(projectName)
            }
        ];
    }

    /**
     * 生成 index 文件
     */
    private generateIndexFile(): string {
        const program = t.program([
            // import React from 'react';
            t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier('React'))],
                t.stringLiteral('react')
            ),
            // import ReactDOM from 'react-dom';
            t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier('ReactDOM'))],
                t.stringLiteral('react-dom')
            ),
            // import App from './App';
            t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier('App'))],
                t.stringLiteral('./App')
            ),
            // ReactDOM.render(<App />, document.getElementById('root'));
            t.expressionStatement(
                t.callExpression(
                    t.memberExpression(
                        t.identifier('ReactDOM'),
                        t.identifier('render')
                    ),
                    [
                        t.jsxElement(
                            t.jsxOpeningElement(t.jsxIdentifier('App'), [], true),
                            null,
                            [],
                            true
                        ),
                        t.callExpression(
                            t.memberExpression(
                                t.identifier('document'),
                                t.identifier('getElementById')
                            ),
                            [t.stringLiteral('root')]
                        )
                    ]
                )
            )
        ]);

        return generate(program).code;
    }

    /**
     * 生成 package.json
     */
    private generatePackageJson(projectName: string): string {
        return JSON.stringify({
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
        }, null, 2);
    }

    /**
     * 生成 README
     */
    private generateReadme(projectName: string): string {
        return `# ${projectName}

Generated by lowcode-engine Demo (AST Generator)

## Install

\`\`\`bash
npm install
\`\`\`

## Run

\`\`\`bash
npm start
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`
`;
    }
}

// 导出单例
export const astCodeGenerator = new ASTCodeGenerator();
