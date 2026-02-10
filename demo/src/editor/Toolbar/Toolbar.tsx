import React, { useEffect, useState } from 'react';
import { Button, Space, message } from 'antd';
import { SaveOutlined, EyeOutlined, ExportOutlined, UndoOutlined, RedoOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEditor } from '@/store/EditorContext';
import CodeExport from './CodeExport';
import ComponentImport from '@/editor/ComponentImport/ComponentImport';
import styles from './Toolbar.module.css';

const Toolbar: React.FC = () => {
    const { schema, undo, redo, canUndo, canRedo } = useEditor();
    const [showImport, setShowImport] = useState(false);

    // 快捷键支持
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Z 撤销
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) {
                    undo();
                    message.info('撤销');
                }
            }

            // Ctrl+Y 或 Ctrl+Shift+Z 重做
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                if (canRedo) {
                    redo();
                    message.info('重做');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo]);

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
                <span className={styles.badge}>v2.0 Complete</span>
            </div>
            <div className={styles.right}>
                <Space>
                    <Button
                        icon={<UndoOutlined />}
                        onClick={undo}
                        disabled={!canUndo}
                        title="撤销 (Ctrl+Z)"
                    >
                        撤销
                    </Button>
                    <Button
                        icon={<RedoOutlined />}
                        onClick={redo}
                        disabled={!canRedo}
                        title="重做 (Ctrl+Y)"
                    >
                        重做
                    </Button>
                    <Button
                        icon={<PlusCircleOutlined />}
                        onClick={() => setShowImport(true)}
                        type="dashed"
                    >
                        导入组件
                    </Button>
                    <Button icon={<SaveOutlined />} onClick={handleSave}>
                        保存
                    </Button>
                    <Button icon={<EyeOutlined />} onClick={handlePreview}>
                        预览
                    </Button>
                    <CodeExport />
                    <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
                        导出JSON
                    </Button>
                </Space>
            </div>

            <ComponentImport
                isOpen={showImport}
                onClose={() => setShowImport(false)}
                onSuccess={(componentName) => {
                    message.success(`组件 ${componentName} 已可用！`);
                }}
            />
        </div>
    );
};

export default Toolbar;
