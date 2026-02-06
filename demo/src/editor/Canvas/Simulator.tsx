/**
 * Simulator - iframe隔离渲染器
 * 参考 lowcode-engine 的 Simulator 设计
 */

import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ComponentSchema } from '@/types';
import MaterialComponents from '@/materials/components';
import { materialRegistry } from '@/materials/registry';
import styles from './Simulator.module.css';

interface SimulatorProps {
    schema: ComponentSchema;
    onNodeSelect?: (nodeId: string) => void;
    onNodeDelete?: (nodeId: string) => void;
    selectedNodeId?: string | null;
}

/**
 * Simulator组件 - 在iframe中隔离渲染
 */
const Simulator: React.FC<SimulatorProps> = ({
    schema,
    onNodeSelect,
    onNodeDelete,
    selectedNodeId
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeReady, setIframeReady] = useState(false);

    // 初始化iframe
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const initIframe = () => {
            const iframeDoc = iframe.contentDocument;
            if (!iframeDoc) return;

            // 写入基础HTML结构
            iframeDoc.open();
            iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
              .simulator-root { padding: 20px; min-height: 100vh; }
              .node-wrapper { position: relative; }
              .node-wrapper.selected { outline: 2px solid #1890ff; outline-offset: 2px; }
              .node-toolbar {
                position: absolute;
                top: -30px;
                right: 0;
                z-index: 10;
                background: #1890ff;
                border-radius: 4px;
                padding: 4px;
              }
              .delete-btn {
                background: transparent;
                border: none;
                color: #fff;
                cursor: pointer;
                font-size: 14px;
                padding: 2px 8px;
              }
              .delete-btn:hover { background: rgba(255,255,255,0.2); }
            </style>
          </head>
          <body>
            <div id="simulator-root" class="simulator-root"></div>
          </body>
        </html>
      `);
            iframeDoc.close();

            setIframeReady(true);
        };

        iframe.addEventListener('load', initIframe);
        return () => iframe.removeEventListener('load', initIframe);
    }, []);

    // 渲染内容到iframe
    useEffect(() => {
        if (!iframeReady || !iframeRef.current) return;

        const iframeDoc = iframeRef.current.contentDocument;
        const iframeWin = iframeRef.current.contentWindow;
        if (!iframeDoc || !iframeWin) return;

        const container = iframeDoc.getElementById('simulator-root');
        if (!container) return;

        // 将React和物料组件注入到iframe
        (iframeWin as any).React = React;
        (iframeWin as any).ReactDOM = ReactDOM;
        (iframeWin as any).MaterialComponents = MaterialComponents;

        // 渲染函数
        const renderInIframe = (node: ComponentSchema): any => {
            const Component = MaterialComponents[node.componentName as keyof typeof MaterialComponents];

            if (!Component) {
                return React.createElement('div', null, `未知组件: ${node.componentName}`);
            }

            const isSelected = selectedNodeId === node.id;
            const isContainer = materialRegistry.isContainer(node.componentName);

            // 处理事件（事件代理到主窗口）
            const eventProps: any = {};
            if (node.events) {
                Object.keys(node.events).forEach(eventName => {
                    const handler = node.events![eventName];
                    if (handler.type === 'JSFunction') {
                        try {
                            eventProps[eventName] = new Function('return ' + handler.value)();
                        } catch (e) {
                            console.error(`Event handler error:`, e);
                        }
                    }
                });
            }

            // 点击事件代理
            const wrapperProps = {
                className: `node-wrapper ${isSelected ? 'selected' : ''}`,
                onClick: (e: any) => {
                    e.stopPropagation();
                    onNodeSelect?.(node.id);
                }
            };

            const toolbar = isSelected && node.id !== 'root'
                ? React.createElement('div',
                    { className: 'node-toolbar' },
                    React.createElement('button', {
                        className: 'delete-btn',
                        onClick: (e: any) => {
                            e.stopPropagation();
                            onNodeDelete?.(node.id);
                        }
                    }, '✕')
                )
                : null;

            const children = isContainer && node.children
                ? node.children.map(child => renderInIframe(child))
                : null;

            return React.createElement(
                'div',
                wrapperProps,
                toolbar,
                React.createElement(Component, { ...node.props, ...eventProps }, children)
            );
        };

        // 使用iframe的React渲染
        const rootElement = renderInIframe(schema);
        (iframeWin as any).ReactDOM.render(rootElement, container);

    }, [iframeReady, schema, selectedNodeId, onNodeSelect, onNodeDelete]);

    return (
        <iframe
            ref={iframeRef}
            className={styles.iframe}
            title="Simulator"
        />
    );
};

export default Simulator;
