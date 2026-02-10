import React, { useState, useEffect } from 'react';
import { widgetManager, WidgetArea } from '@/engine/WidgetManager';
import { Tabs } from 'antd';
import styles from './WidgetContainer.module.css';

interface WidgetContainerProps {
    area: WidgetArea;
    mode?: 'tabs' | 'stack';  // tabs: 标签页模式, stack: 堆叠模式
}

/**
 * Widget容器组件
 * 用于渲染指定区域的所有Widget
 */
const WidgetContainer: React.FC<WidgetContainerProps> = ({ area, mode = 'tabs' }) => {
    const [, forceUpdate] = useState({});

    useEffect(() => {
        // 订阅Widget变化
        const unsubscribe = widgetManager.subscribe(() => {
            forceUpdate({});
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const widgets = widgetManager.getByArea(area);

    if (widgets.length === 0) {
        return null;
    }

    // 标签页模式
    if (mode === 'tabs' && widgets.length > 1) {
        const items = widgets.map(widget => ({
            key: widget.name,
            label: (
                <span>
                    {widget.icon && <span style={{ marginRight: 4 }}>{widget.icon}</span>}
                    {widget.title}
                </span>
            ),
            children: React.createElement(widget.component, widget.props || {}),
            closable: widget.closeable
        }));

        return (
            <Tabs
                items={items}
                className={styles.widgetTabs}
                onEdit={(targetKey, action) => {
                    if (action === 'remove') {
                        widgetManager.hide(targetKey as string);
                    }
                }}
            />
        );
    }

    // 堆叠模式或单个Widget
    return (
        <div className={styles.widgetStack}>
            {widgets.map(widget => (
                <div key={widget.name} className={styles.widgetItem}>
                    {widget.title && (
                        <div className={styles.widgetHeader}>
                            {widget.icon && <span className={styles.widgetIcon}>{widget.icon}</span>}
                            <span className={styles.widgetTitle}>{widget.title}</span>
                            {widget.closeable && (
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => widgetManager.hide(widget.name)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    )}
                    <div className={styles.widgetBody}>
                        {React.createElement(widget.component, widget.props || {})}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WidgetContainer;
