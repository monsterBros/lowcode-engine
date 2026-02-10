/**
 * Simulator - iframe隔离渲染器 (postMessage版本)
 * 
 * 核心功能：
 * 1. 在独立的iframe中渲染用户设计的页面
 * 2. 完全隔离样式和脚本，防止污染主窗口
 * 3. 使用postMessage进行跨iframe通信
 * 
 * 通信方式：
 * - 主窗口 → iframe: type='DRAG_MATERIAL'传递物料数据
 * - iframe → 主窗口: type='IFRAME_DROP'通知drop事件
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
            const iframeWin = iframe.contentWindow;
            if (!iframeDoc || !iframeWin) return;

            // 写入HTML
            iframeDoc.open();
            iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; }
              .simulator-root { padding: 20px; min-height: 100vh; }
              .drag-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(24, 144, 255, 0.1);
                border: 2px dashed #1890ff;
                z-index: 9999;
                display: flex; align-items: center; justify-content: center;
                font-size: 18px; color: #1890ff; font-weight: 600;
                pointer-events: none;
              }
              .node-wrapper { position: relative; }
              .node-wrapper.selected { outline: 2px solid #1890ff; outline-offset: 2px; }
              .node-toolbar {
                position: absolute; top: -30px; right: 0; z-index: 10;
                background: #1890ff; border-radius: 4px; padding: 4px;
              }
              .delete-btn {
                background: transparent; border: none; color: #fff;
                cursor: pointer; font-size: 14px; padding: 2px 8px;
              }
              .delete-btn:hover { background: rgba(255,255,255,0.2); }
            </style>
          </head>
          <body>
            <div id="simulator-root" class="simulator-root"></div>
            <div id="drag-overlay" class="drag-overlay" style="display: none;">
              🎯 松开鼠标添加组件
            </div>
          </body>
        </html>
      `);
            iframeDoc.close();

            /**
             * postMessage通信设置
             */
            let currentMaterial: any = null;

            // 监听主窗口的物料数据
            iframeWin.addEventListener('message', (e: MessageEvent) => {
                if (e.data.type === 'DRAG_MATERIAL') {
                    currentMaterial = e.data.material;
                    const overlay = iframeDoc.getElementById('drag-overlay');
                    if (overlay) overlay.style.display = 'flex';
                    console.log('📬 Received material via postMessage:', currentMaterial);
                }
            });

            // 阻止默认dragover
            iframeDoc.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            // 离开时隐藏提示
            iframeDoc.addEventListener('dragleave', (e) => {
                if (e.target === iframeDoc.body) {
                    const overlay = iframeDoc.getElementById('drag-overlay');
                    if (overlay) overlay.style.display = 'none';
                }
            });

            // 处理drop
            iframeDoc.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const overlay = iframeDoc.getElementById('drag-overlay');
                if (overlay) overlay.style.display = 'none';

                if (currentMaterial) {
                    console.log('🎯 Drop in iframe!', currentMaterial);
                    window.parent.postMessage({
                        type: 'IFRAME_DROP',
                        material: currentMaterial,
                        position: { x: e.clientX, y: e.clientY }
                    }, '*');
                    currentMaterial = null;
                } else {
                    console.warn('⚠️ No material on drop');
                }
            });

            console.log('✅ Iframe communication initialized');
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

        (iframeWin as any).React = React;
        (iframeWin as any).ReactDOM = ReactDOM;
        (iframeWin as any).MaterialComponents = MaterialComponents;

        const renderInIframe = (node: ComponentSchema): any => {
            const Component = MaterialComponents[node.componentName as keyof typeof MaterialComponents];
            if (!Component) return React.createElement('div', null, `未知组件: ${node.componentName}`);

            const isSelected = selectedNodeId === node.id;
            const isContainer = materialRegistry.isContainer(node.componentName);

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

            const wrapperProps = {
                className: `node-wrapper ${isSelected ? 'selected' : ''}`,
                onClick: (e: any) => {
                    e.stopPropagation();
                    onNodeSelect?.(node.id);
                }
            };

            const toolbar = isSelected && node.id !== 'root'
                ? React.createElement('div', { className: 'node-toolbar' },
                    React.createElement('button', {
                        className: 'delete-btn',
                        onClick: (e: any) => {
                            e.stopPropagation();
                            onNodeDelete?.(node.id);
                        }
                    }, '✕'))
                : null;

            const children = isContainer && node.children
                ? node.children.map((child) => renderInIframe(child))
                : null;

            return React.createElement('div', { ...wrapperProps, key: node.id },
                toolbar,
                React.createElement(Component, { ...node.props, ...eventProps, key: `comp-${node.id}` },
                    children ? children.map((c, i) => React.cloneElement(c, { key: node.children![i].id || i })) : null
                )
            );
        };

        try {
            const rootElement = renderInIframe(schema);
            if (container && iframeWin && (iframeWin as any).ReactDOM) {
                (iframeWin as any).ReactDOM.render(rootElement, container);
                console.log('✅ Simulator rendered successfully with schema:', schema);
            }
        } catch (error) {
            console.error('❌ Simulator render error:', error);
        }
    }, [iframeReady, schema, selectedNodeId, onNodeSelect, onNodeDelete]);

    return <iframe ref={iframeRef} className={styles.iframe} title="Simulator" />;
};

export default Simulator;
