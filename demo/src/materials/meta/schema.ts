import { MaterialMeta } from '@/types';

/**
 * 物料元数据配置
 */
export const materialsMeta: MaterialMeta[] = [
    {
        componentName: 'Button',
        title: '按钮',
        icon: '🔘',
        category: '基础组件',
        description: '按钮组件',
        props: [
            {
                name: 'text',
                title: '按钮文本',
                type: 'string',
                defaultValue: 'Button',
                setter: {
                    componentName: 'StringSetter',
                },
            },
            {
                name: 'type',
                title: '按钮类型',
                type: 'string',
                defaultValue: 'default',
                setter: {
                    componentName: 'SelectSetter',
                    props: {
                        options: [
                            { label: '默认', value: 'default' },
                            { label: '主要', value: 'primary' },
                            { label: '虚线', value: 'dashed' },
                            { label: '链接', value: 'link' },
                        ],
                    },
                },
            },
            {
                name: 'size',
                title: '按钮尺寸',
                type: 'string',
                defaultValue: 'middle',
                setter: {
                    componentName: 'SelectSetter',
                    props: {
                        options: [
                            { label: '大', value: 'large' },
                            { label: '中', value: 'middle' },
                            { label: '小', value: 'small' },
                        ],
                    },
                },
            },
            {
                name: 'events',
                title: '事件',
                type: 'object',
                setter: {
                    componentName: 'EventSetter',
                },
            },
        ],
        configure: {
            component: {
                isContainer: false,
            },
        },
    },
    {
        componentName: 'Input',
        title: '输入框',
        icon: '📝',
        category: '基础组件',
        description: '输入框组件',
        props: [
            {
                name: 'placeholder',
                title: '占位符',
                type: 'string',
                defaultValue: 'Please input',
                setter: {
                    componentName: 'StringSetter',
                },
            },
            {
                name: 'type',
                title: '输入类型',
                type: 'string',
                defaultValue: 'text',
                setter: {
                    componentName: 'SelectSetter',
                    props: {
                        options: [
                            { label: '文本', value: 'text' },
                            { label: '密码', value: 'password' },
                            { label: '数字', value: 'number' },
                        ],
                    },
                },
            },
            {
                name: 'size',
                title: '输入框尺寸',
                type: 'string',
                defaultValue: 'middle',
                setter: {
                    componentName: 'SelectSetter',
                    props: {
                        options: [
                            { label: '大', value: 'large' },
                            { label: '中', value: 'middle' },
                            { label: '小', value: 'small' },
                        ],
                    },
                },
            },
        ],
        configure: {
            component: {
                isContainer: false,
            },
        },
    },
    {
        componentName: 'Container',
        title: '容器',
        icon: '📦',
        category: '布局组件',
        description: '容器组件，可以包含其他组件',
        props: [
            {
                name: 'layout',
                title: '布局方向',
                type: 'string',
                defaultValue: 'vertical',
                setter: {
                    componentName: 'SelectSetter',
                    props: {
                        options: [
                            { label: '垂直', value: 'vertical' },
                            { label: '水平', value: 'horizontal' },
                        ],
                    },
                },
            },
            {
                name: 'background',
                title: '背景色',
                type: 'string',
                defaultValue: '#f5f5f5',
                setter: {
                    componentName: 'StringSetter',
                },
            },
            {
                name: 'padding',
                title: '内边距',
                type: 'number',
                defaultValue: 16,
                setter: {
                    componentName: 'NumberSetter',
                },
            },
            {
                name: 'gap',
                title: '间距',
                type: 'number',
                defaultValue: 8,
                setter: {
                    componentName: 'NumberSetter',
                },
            },
        ],
        configure: {
            component: {
                isContainer: true,
            },
        },
    },
];
