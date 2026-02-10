/**
 * Simulator - iframe隔离渲染器
 * 
 * 核心功能：
 * 1. 在独立的iframe中渲染用户设计的页面
 * 2. 完全隔离样式和脚本，防止污染主窗口
 * 3. 模拟真实的浏览器环境
 * 
 * 与普通渲染的区别：
 * - 普通渲染：直接在主窗口渲染，共享样式和脚本上下文
 * - iframe渲染：在隔离的iframe中渲染，独立的样式和脚本上下文
 * 
 * 技术要点：
 * - 使用postMessage进行跨iframe通信
 * - 动态注入React和组件库到iframe
 * - 处理样式隔离和组件渲染
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
 * Simulator组件 - iframe隔离渲染
 * 
 * 工作原理：
 * 1. 创建一个独立的iframe
 * 2. 写入基础HTML结构和样式
 * 3. 注入React和组件库
 * 4. 在iframe中渲染schema
 * 5. 通过postMessage处理交互
 */
const Simulator: React.FC<SimulatorProps> = ({
    schema,
    onNodeSelect,
    onNodeDelete,
    selectedNodeId
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeReady, setIframeReady] = useState(false);

    /**
     * 步骤1：初始化iframe
     * 创建独立的HTML文档环境
     */
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const initIframe = () => {
            const iframeDoc = iframe.contentDocument;
            const iframeWin = iframe.contentWindow;
            if (!iframeDoc || !iframeWin) return;

            // 写入完整的HTML结构
            // 这是一个完全独立的HTML文档
            iframeDoc.open();
            iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>预览</title>
            <style>
              /* iframe内部的样式 - 不会影响外部编辑器 */
              * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
              }
              
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: #fff;
              }
              
              .simulator-root { 
                padding: 20px; 
                min-height: 100vh; 
              }
              
              /* 拖拽提示层样式 */
              .drag-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(24, 144, 255, 0.1);
                border: 2px dashed #1890ff;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: #1890ff;
                font-weight: 600;
                pointer-events: none;
              }
              
              /* 节点选中效果 */
              .node-wrapper { 
                position: relative; 
              }
              
              .node-wrapper.selected { 
                outline: 2px solid #1890ff; 
                outline-offset: 2px; 
              }
              
              /* 节点操作工具栏 */
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
              
              .delete-btn:hover { 
                background: rgba(255,255,255,0.2); 
              }
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
             * 关键：在iframe内部监听主窗口的拖拽状态
             * 
             * 方案：通过window.parent访问主窗口
             * 原理：iframe可以访问parent.window来监听主窗口事件
             */

            // 存储拖拽状态
            let isDragging = false;
            let dragData: any = null;

            // 监听主窗口的自定义事件
            const handleDragStart = (e: any) => {
                isDragging = true;
                dragData = e.detail;
                const overlay = iframeDoc.getElementById('drag-overlay');
                if (overlay) {
                    overlay.style.display = 'flex';
                }
                console.log('🎯 Drag started in iframe, data:', dragData);
            };

            const handleDragEnd = (e: any) => {
                isDragging = false;
                const overlay = iframeDoc.getElementById('drag-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }
                console.log('🎯 Drag ended in iframe');
            };

            const handleDrop = (e: any) => {
                e.preventDefault();
                e.stopPropagation();

                // 隐藏提示层
                const overlay = iframeDoc.getElementById('drag-overlay');
                if (overlay) {
                    overlay.style.display = 'none';
                }

                // 从window获取拖拽的物料数据
                const material = (iframeWin as any).__dragMaterial;

                if (material) {
                    console.log('🎯 Drop in iframe! Material:', material);
                    console.log('📍 Drop position:', { x: e.clientX, y: e.clientY });

                    // 通过postMessage通知主窗口
                    window.parent.postMessage({
                        type: 'IFRAME_DROP',
                        material: material,
                        position: { x: e.clientX, y: e.clientY }
                    }, '*');

                    // 清空拖拽数据
                    (iframeWin as any).__dragMaterial = null;
                } else {
                    console.warn('⚠️ No material data found in iframe window on drop');
                }

                isDragging = false;
                dragData = null;
            };

            // 在iframe的document上监听
            iframeWin.addEventListener('dragenter', handleDragStart);
            iframeWin.addEventListener('dragleave', handleDragEnd);
            iframeDoc.addEventListener('drop', handleDrop);
            iframeDoc.addEventListener('dragover', (e) => e.preventDefault());

            setIframeReady(true);

            return () => {
                iframeWin.removeEventListener('dragenter', handleDragStart);
                iframeWin.removeEventListener('dragleave', handleDragEnd);
                iframeDoc.removeEventListener('drop', handleDrop);
            };
        };

        iframe.addEventListener('load', initIframe);
        return () => iframe.removeEventListener('load', initIframe);
    }, []);

    /**
     * 步骤2：渲染内容到iframe
     * 将schema转换为React组件并在iframe中渲染
     */
    useEffect(() => {
        if (!iframeReady || !iframeRef.current) return;

        const iframeDoc = iframeRef.current.contentDocument;
        const iframeWin = iframeRef.current.contentWindow;
        if (!iframeDoc || !iframeWin) return;

        const container = iframeDoc.getElementById('simulator-root');
        if (!container) return;

        /**
         * 关键：将React和组件库注入到iframe的window对象
         * 这样iframe内的代码就可以访问React和所有组件
         */
        (iframeWin as any).React = React;
        (iframeWin as any).ReactDOM = ReactDOM;
        (iframeWin as any).MaterialComponents = MaterialComponents;

        /**
         * 递归渲染函数
         * 将ComponentSchema转换为React元素
         */
        const renderInIframe = (node: ComponentSchema): any => {
            const Component = MaterialComponents[node.componentName as keyof typeof MaterialComponents];

            if (!Component) {
                return React.createElement('div', null, `未知组件: ${node.componentName}`);
            }

            const isSelected = selectedNodeId === node.id;
            const isContainer = materialRegistry.isContainer(node.componentName);

            // 处理事件（从schema中的事件配置）
            const eventProps: any = {};
            if (node.events) {
                Object.keys(node.events).forEach(eventName => {
                    const handler = node.events![eventName];
                    if (handler.type === 'JSFunction') {
                        try {
                            // 执行用户定义的事件处理函数
                            eventProps[eventName] = new Function('return ' + handler.value)();
                        } catch (e) {
                            console.error(`Event handler error:`, e);
                        }
                    }
                });
            }

            // 节点包装器属性（用于选中和交互）
            const wrapperProps = {
                className: `node-wrapper ${isSelected ? 'selected' : ''}`,
                onClick: (e: any) => {
                    e.stopPropagation();
                    onNodeSelect?.(node.id);
                }
            };

            // 选中节点的删除按钮
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

            // 递归渲染子节点（如果是容器组件）
            const children = isContainer && node.children
                ? node.children.map((child) => {
                    const childElement = renderInIframe(child);
                    return childElement;
                })
                : null;

            // 创建React元素
            return React.createElement(
                'div',
                { ...wrapperProps, key: node.id },
                toolbar,
                React.createElement(Component, { ...node.props, ...eventProps, key: `comp-${node.id}` },
                    children ? children.map((c, i) => React.cloneElement(c, { key: node.children![i].id || i })) : null
                )
            );
        };

        /**
         * 使用iframe window中的React和ReactDOM进行渲染
         * 这样渲染出的内容完全在iframe的上下文中
         * 
         * 关键：每次schema变化时，这个useEffect都会重新执行
         * 从而更新iframe中的内容
         */
        try {
            const rootElement = renderInIframe(schema);

            // 使用iframe的ReactDOM.render
            // 注意：React 16使用的是render，不是createRoot
            const container = iframeDoc.getElementById('simulator-root');
            if (container && iframeWin && (iframeWin as any).ReactDOM) {
                (iframeWin as any).ReactDOM.render(rootElement, container);
                console.log('✅ Simulator rendered successfully with schema:', schema);
            }
        } catch (error) {
            console.error('❌ Simulator render error:', error);
        }

    }, [iframeReady, schema, selectedNodeId, onNodeSelect, onNodeDelete]);

    return (
        <iframe
            ref={iframeRef}
            className={styles.iframe}
            title="Simulator - iframe隔离渲染"
        />
    );
};

export default Simulator;
