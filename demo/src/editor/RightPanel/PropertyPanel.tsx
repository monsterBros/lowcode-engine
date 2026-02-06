import React from 'react';
import { Form } from 'antd';
import { useEditor } from '@/store/EditorContext';
import { findNode } from '@/utils/schema';
import { materialRegistry } from '@/materials/registry';
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

    // 复杂Setter (4种)
    ArraySetter: Setters.ArraySetter,
    JSONSetter: Setters.JSONSetter,
    FunctionSetter: Setters.FunctionSetter,
    ExpressionSetter: Setters.ExpressionSetter,

    // 资源Setter (2种)
    ImageSetter: Setters.ImageSetter,
    IconSetter: Setters.IconSetter,

    // 高级Setter (2种)
    StyleSetter: Setters.StyleSetter,
    MixedSetter: Setters.MixedSetter,
};

const PropertyPanel: React.FC = () => {
    const { schema, selectedNodeId, updateNodeProps } = useEditor();

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
        updateNodeProps(selectedNodeId, {
            [propName]: value,
        });
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
                        const SetterComponent = SetterComponents[prop.setter.componentName];

                        if (!SetterComponent) {
                            return (
                                <Form.Item key={prop.name} label={prop.title}>
                                    <div style={{ color: '#999' }}>
                                        未找到Setter: {prop.setter.componentName}
                                    </div>
                                </Form.Item>
                            );
                        }

                        const currentValue = selectedNode.props?.[prop.name] ?? prop.defaultValue;

                        return (
                            <Form.Item
                                key={prop.name}
                                label={prop.title}
                                tooltip={prop.description}
                            >
                                <SetterComponent
                                    value={currentValue}
                                    onChange={(value: any) => handleChange(prop.name, value)}
                                    {...(prop.setter.props || {})}
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
