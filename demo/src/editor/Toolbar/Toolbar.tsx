import React from 'react';
import { Button, Space, message } from 'antd';
import { SaveOutlined, EyeOutlined, ExportOutlined } from '@ant-design/icons';
import { useEditor } from '@/store/EditorContext';
import styles from './Toolbar.module.css';

const Toolbar: React.FC = () => {
    const { schema } = useEditor();

    const handleSave = () => {
        message.success('保存成功！');
        console.log('保存Schema:', schema);
    };

    const handlePreview = () => {
        message.info('预览功能');
        console.log('预览Schema:', schema);
    };

    const handleExport = () => {
        const jsonStr = JSON.stringify(schema, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schema_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        message.success('导出JSON成功！');
    };

    return (
        <div className={styles.toolbar}>
            <div className={styles.left}>
                <h1 className={styles.title}>低代码引擎 Demo</h1>
            </div>
            <div className={styles.right}>
                <Space>
                    <Button icon={<SaveOutlined />} onClick={handleSave}>
                        保存
                    </Button>
                    <Button icon={<EyeOutlined />} onClick={handlePreview}>
                        预览
                    </Button>
                    <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
                        导出JSON
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default Toolbar;
