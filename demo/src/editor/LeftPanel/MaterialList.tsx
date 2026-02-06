import React from 'react';
import { Collapse } from 'antd';
import MaterialCard from './MaterialCard';
import MaterialMarket from './MaterialMarket';
import { materialRegistry } from '@/materials/registry';
import styles from './MaterialList.module.css';

const { Panel } = Collapse;

const MaterialList: React.FC = () => {
    const materials = materialRegistry.getAllMaterials();

    // 按分类分组
    const categories = Array.from(
        new Set(materials.map((m) => m.category || '未分类'))
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>组件库</div>
            <MaterialMarket />
            <Collapse defaultActiveKey={categories} ghost>
                {categories.map((category) => {
                    const categoryMaterials = materials.filter(
                        (m) => (m.category || '未分类') === category
                    );
                    return (
                        <Panel header={category} key={category}>
                            {categoryMaterials.map((material) => (
                                <MaterialCard key={material.componentName} material={material} />
                            ))}
                        </Panel>
                    );
                })}
            </Collapse>
        </div>
    );
};

export default MaterialList;
