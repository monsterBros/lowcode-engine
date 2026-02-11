import React from 'react';
import { useEditor } from '@/store/EditorContext';
import TreeNode from './TreeNode';
import styles from './Tree.module.css';

const Tree: React.FC = () => {
    const { schema } = useEditor();

    return (
        <div className={styles.container}>
            <div className={styles.header}>大纲树</div>
            <div className={styles.tree}>
                <TreeNode
                    node={schema}
                    level={0}
                    index={0}
                />
            </div>
        </div>
    );
};

export default Tree;
