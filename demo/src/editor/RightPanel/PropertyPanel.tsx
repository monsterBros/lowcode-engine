import React from 'react';
import { Form } from 'antd';
import { useEditor } from '@/store/EditorContext';
import { materialRegistry } from '@/materials/registry';
import { findNode } from '@/utils/schema';
import Setters from './setters';
import styles from './PropertyPanel.module.css';

const PropertyPanel: React.FC = () => {
    const { schema, selectedNodeId, updateNodeProps } = useEditor();

    if (!selectedNodeId) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>请选择一个组件</div>
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
                <div className={styles.empty}>未找到组件元数据</div>
            </div>
        );
    }

    const handleChange = (propName: string, value: any) => {
        updateNodeProps(selectedNodeId, { [propName]: value });
    };

    const renderSetter = (propConfig: any) => {
        const SetterComponent =
            Setters[propConfig.setter.componentName as keyof typeof Setters];

        if (!SetterComponent) {
            return <div>未找到Setter: {propConfig.setter.componentName}</div>;
        }

        const currentValue = selectedNode.props?.[propConfig.name];

        return (
            <SetterComponent
                value={currentValue}
                onChange={(value: any) => handleChange(propConfig.name, value)}
                {...propConfig.setter.props}
            />
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>属性配置</div>
                <div className={styles.componentName}>{material.title}</div>
            </div>
            <div className={styles.content}>
                <Form layout="vertical" size="small">
                    {material.props.map((propConfig) => (
                        <Form.Item
                            key={propConfig.name}
                            label={propConfig.title}
                            tooltip={propConfig.description}
                        >
                            {renderSetter(propConfig)}
                        </Form.Item>
                    ))}
                </Form>
            </div>
        </div>
    );
};

export default PropertyPanel;
