import React from 'react';
import { Modal } from 'antd';
import { ComponentSchema } from '@/types';
import Renderer from './Renderer';
import styles from './LivePreview.module.css';

interface LivePreviewProps {
    open: boolean;
    onClose: () => void;
    schema: ComponentSchema;
}

/**
 * 实时预览组件
 * 在模态框中渲染完整的schema预览
 */
const LivePreview: React.FC<LivePreviewProps> = ({ open, onClose, schema }) => {
    return (
        <Modal
            title="🔍 实时预览"
            open={open}
            onCancel={onClose}
            width="90%"
            style={{ top: 20 }}
            bodyStyle={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: 0 }}
            footer={null}
        >
            <div className={styles.previewContainer}>
                <div className={styles.previewContent}>
                    <Renderer schema={schema} />
                </div>
            </div>
        </Modal>
    );
};

export default LivePreview;
