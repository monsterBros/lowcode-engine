/**
 * 示例：自定义按钮组件
 * 演示如何开发符合规范的第三方组件
 */

import React from 'react';
import { ComponentPackage } from '../types/componentPackage';

// 1. 定义组件Props类型
interface MyButtonProps {
    text?: string;
    type?: 'primary' | 'default' | 'danger' | 'success';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: () => void;
}

// 2. 实现React组件
const MyButton: React.FC<MyButtonProps> = ({
    text = '点击我',
    type = 'default',
    size = 'medium',
    disabled = false,
    onClick,
}) => {
    const getButtonClass = () => {
        const classes = ['my-custom-button'];
        classes.push(`btn-type-${type}`);
        classes.push(`btn-size-${size}`);
        if (disabled) classes.push('btn-disabled');
        return classes.join(' ');
    };

    return (
        <button
            className={getButtonClass()}
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: size === 'small' ? '4px 12px' : size === 'large' ? '12px 24px' : '8px 16px',
                fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
                backgroundColor:
                    type === 'primary' ? '#1890ff' :
                        type === 'danger' ? '#ff4d4f' :
                            type === 'success' ? '#52c41a' :
                                '#ffffff',
                color:
                    type === 'primary' || type === 'danger' || type === 'success'
                        ? '#ffffff'
                        : '#000000',
                border:
                    type === 'default'
                        ? '1px solid #d9d9d9'
                        : 'none',
                borderRadius: '4px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
            }}
        >
            {text}
        </button>
    );
};

// 3. 导出组件包
export const MyButtonPackage: ComponentPackage = {
    // 基本信息
    name: 'my-custom-button',
    version: '1.0.0',
    author: '示例作者',
    description: '一个功能完整的自定义按钮组件',
    category: 'custom',

    // React组件
    component: MyButton,

    // 元数据配置
    meta: {
        componentName: 'MyCustomButton',
        title: '自定义按钮',

        // 属性配置
        props: [
            {
                name: 'text',
                title: '按钮文本',
                setter: {
                    componentName: 'StringSetter',
                },
                defaultValue: '点击我',
                description: '显示在按钮上的文本'
            },
            {
                name: 'type',
                title: '按钮类型',
                setter: {
                    componentName: 'SelectSetter',
                    props: {
                        options: [
                            { label: '默认', value: 'default' },
                            { label: '主要', value: 'primary' },
                            { label: '危险', value: 'danger' },
                            { label: '成功', value: 'success' },
                        ]
                    }
                },
                defaultValue: 'default',
                description: '按钮的视觉样式类型'
            },
            {
                name: 'size',
                title: '尺寸',
                setter: {
                    componentName: 'SelectSetter',
                    props: {
                        options: ['small', 'medium', 'large']
                    }
                },
                defaultValue: 'medium',
                description: '按钮的大小'
            },
            {
                name: 'disabled',
                title: '禁用状态',
                setter: {
                    componentName: 'BooleanSetter',
                },
                defaultValue: false,
                description: '是否禁用按钮'
            }
        ],

        // 事件配置
        events: [
            {
                name: 'onClick',
                title: '点击事件',
                description: '按钮被点击时触发',
                params: []
            }
        ],

        // 不是容器组件
        isContainer: false,
    },

    // 组件图标（可选）
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMxODkwZmYiIHJ4PSIyIi8+PC9zdmc+',
};

// 默认导出
export default MyButtonPackage;
