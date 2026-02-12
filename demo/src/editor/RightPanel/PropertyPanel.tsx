import React from 'react';
import { Form } from 'antd';
import { useEditor } from '@/store/EditorContext';
import { findNode } from '@/utils/schema';
import { materialRegistry } from '@/materials/registry';
import { ComponentSchema } from '@/types';
import * as Setters from './setters';
import styles from './PropertyPanel.module.css';

// Setter映射
const SetterComponents: Record<string, React.ComponentType<any>> = {
    // 基础Setter (12种)
    StringSetter: Setters.StringSetter,
    NumberSetter: Setters.NumberSetter,
    BooleanSetter: Setters.BooleanSetter,
    SelectSetter: Setters.SelectSetter,
    ColorSetter: Setters.ColorSetter,
    DateSetter: Setters.DateSetter,
    TimeSetter: Setters.TimeSetter,
    TextAreaSetter: Setters.TextAreaSetter,
    SliderSetter: Setters.SliderSetter,
    RateSetter: Setters.RateSetter,
    SwitchSetter: Setters.SwitchSetter,
    ClassNameSetter: Setters.ClassNameSetter,

    // 复杂Setter (5种)
    ArraySetter: Setters.ArraySetter,
    JSONSetter: Setters.JSONSetter,
    FunctionSetter: Setters.FunctionSetter,
    EventSetter: Setters.EventSetter,
    ExpressionSetter: Setters.ExpressionSetter,

    // 资源Setter (2种)
    ImageSetter: Setters.ImageSetter,
    IconSetter: Setters.IconSetter,

    // 高级Setter (2种)
    StyleSetter: Setters.StyleSetter,
    MixedSetter: Setters.MixedSetter,
};

const PropertyPanel: React.FC = () => {
    const { schema, selectedNodeId, updateNodeProps, updateSchema } = useEditor();

    if (!selectedNodeId) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>请选择一个组件配置属性</div>
            </div>
        );
    }

    const selectedNode = findNode(schema, selectedNodeId);
    if (!selectedNode) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>未找到选中的组件</div>
            </div>
        );
    }

    const material = materialRegistry.getMaterial(selectedNode.componentName);
    if (!material) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>未找到物料元数据</div>
            </div>
        );
    }

    const handleChange = (propName: string, value: any) => {
        // events属性特殊处理：直接更新selectedNode.events
        if (propName === 'events') {
            // 直接修改schema中的events属性
            const updateEvents = (node: ComponentSchema): ComponentSchema => {
                if (node.id === selectedNodeId) {
                    return { ...node, events: value };
                }
                if (node.children) {
                    return {
                        ...node,
                        children: node.children.map(updateEvents)
                    };
                }
                return node;
            };

            const newSchema = updateEvents(schema);
            updateSchema(newSchema);
            console.log('✅ Events updated:', { nodeId: selectedNodeId, events: value });
        } else {
            // 普通属性更新
            updateNodeProps(selectedNodeId, {
                [propName]: value,
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>{material.title}</div>
                <div className={styles.subtitle}>{selectedNode.componentName}</div>
            </div>
            <div className={styles.content}>
                <Form layout="vertical" size="small">
                    {material.props.map((prop) => {
                        // 支持setter为字符串或对象
                        const setterName = typeof prop.setter === 'string'
                            ? prop.setter
                            : prop.setter.componentName;

                        const SetterComponent = SetterComponents[setterName];

                        if (!SetterComponent) {
                            return (
                                <Form.Item key={prop.name} label={prop.title}>
                                    <div style={{ color: '#999' }}>
                                        未找到Setter: {setterName}
                                    </div>
                                </Form.Item>
                            );
                        }

                        // events属性特殊处理：从selectedNode.events读取，而不是props
                        const currentValue = prop.name === 'events'
                            ? (selectedNode.events ?? prop.defaultValue)
                            : (selectedNode.props?.[prop.name] ?? prop.defaultValue);

                        const setterProps = typeof prop.setter === 'object' ? (prop.setter.props || {}) : {};

                        return (
                            <Form.Item
                                key={prop.name}
                                label={prop.title}
                                tooltip={prop.description}
                            >
                                <SetterComponent
                                    value={currentValue}
                                    onChange={(value: any) => handleChange(prop.name, value)}
                                    {...setterProps}
                                />
                            </Form.Item>
                        );
                    })}
                </Form>
            </div>
        </div>
    );
};

export default PropertyPanel;
