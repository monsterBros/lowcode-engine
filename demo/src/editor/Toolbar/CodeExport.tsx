import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { DownloadOutlined, CodeOutlined } from '@ant-design/icons';
import { useEditor } from '@/store/EditorContext';
import { codeGenerator } from '@/engine/CodeGenerator';

const CodeExport: React.FC = () => {
    const { schema } = useEditor();
    const [visible, setVisible] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    const handleGenerate = () => {
        const code = codeGenerator.generateReactCode(schema, 'GeneratedApp');
        setGeneratedCode(code);
        setVisible(true);
    };

    const handleDownloadCode = () => {
        const blob = new Blob([generatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'App.jsx';
        a.click();
        URL.revokeObjectURL(url);
        message.success('代码已下载');
    };

    const handleDownloadProject = () => {
        const files = codeGenerator.generateProjectStructure(schema, 'my-app');
        const jsonStr = JSON.stringify(files, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project-files.json';
        a.click();
        URL.revokeObjectURL(url);
        message.success('项目文件列表已下载');
    };

    return (
        <>
            <Button
                icon={<CodeOutlined />}
                onClick={handleGenerate}
            >
                生成代码
            </Button>

            <Modal
                title="代码生成"
                open={visible}
                onCancel={() => setVisible(false)}
                width={800}
                footer={[
                    <Button key="copy" onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        message.success('代码已复制');
                    }}>
                        复制代码
                    </Button>,
                    <Button key="download" onClick={handleDownloadCode}>
                        下载代码
                    </Button>,
                    <Button key="project" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadProject}>
                        下载完整项目
                    </Button>,
                ]}
            >
                <pre style={{
                    background: '#f5f5f5',
                    padding: '16px',
                    borderRadius: '4px',
                    maxHeight: '500px',
                    overflow: 'auto',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    {generatedCode}
                </pre>
            </Modal>
        </>
    );
};

export default CodeExport;
