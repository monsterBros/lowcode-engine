import React, { useState } from 'react';
import { Modal, Button, message, Select, Tabs } from 'antd';
import { DownloadOutlined, CodeOutlined } from '@ant-design/icons';
import { useEditor } from '@/store/EditorContext';
import { codeGenerator } from '@/engine/CodeGenerator';
import { astCodeGenerator } from '@/engine/ASTCodeGenerator';

const { TabPane } = Tabs;

const CodeExport: React.FC = () => {
    const { schema } = useEditor();
    const [visible, setVisible] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [generatorType, setGeneratorType] = useState<'string' | 'ast'>('ast');

    const handleGenerate = () => {
        try {
            // 根据选择的类型生成代码
            const generator = generatorType === 'ast' ? astCodeGenerator : codeGenerator;
            const code = generator.generateReactCode(schema, 'GeneratedApp');
            setGeneratedCode(code);
            setVisible(true);
            message.success(`使用${generatorType === 'ast' ? 'AST' : '字符串拼接'}方式生成代码成功`);
        } catch (error) {
            message.error('代码生成失败：' + (error as Error).message);
        }
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

    const handleDownloadProject = async () => {
        try {
            // 导入ProjectGenerator
            const { projectGenerator } = await import('@/engine/ProjectGenerator');

            // 生成并下载完整的React项目
            await projectGenerator.generateProject(schema, {
                name: 'my-lowcode-app',
                version: '1.0.0',
                description: '由低代码引擎生成的React项目',
                author: ''
            });

            message.success('React项目已生成并下载！');
        } catch (error) {
            message.error('项目生成失败：' + (error as Error).message);
            console.error('Project generation error:', error);
        }
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
                width={900}
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
                        生成React项目(ZIP)
                    </Button>,
                ]}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Select
                        value={generatorType}
                        onChange={setGeneratorType}
                        style={{ width: 200 }}
                        options={[
                            {
                                label: '🚀 AST生成（推荐）',
                                value: 'ast',
                            },
                            {
                                label: '⚡ 字符串拼接（快速）',
                                value: 'string',
                            },
                        ]}
                    />
                    <span style={{ marginLeft: '12px', color: '#999', fontSize: '12px' }}>
                        {generatorType === 'ast'
                            ? '使用Babel AST生成，语法100%正确，适合生产环境'
                            : '简单快速的字符串拼接，适合快速验证和Demo'}
                    </span>
                </div>

                <Tabs defaultActiveKey="1">
                    <TabPane tab="生成的代码" key="1">
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
                    </TabPane>
                    <TabPane tab="使用说明" key="2">
                        <div style={{ padding: '16px', lineHeight: '1.8' }}>
                            <h3>代码生成方式对比</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa' }}>
                                        <th style={{ padding: '8px', border: '1px solid #e8e8e8' }}>特性</th>
                                        <th style={{ padding: '8px', border: '1px solid #e8e8e8' }}>字符串拼接</th>
                                        <th style={{ padding: '8px', border: '1px solid #e8e8e8' }}>AST生成</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>实现难度</td>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>简单 ⭐</td>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>中等 ⭐⭐⭐</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>代码质量</td>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>中 ⭐⭐</td>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>高 ⭐⭐⭐⭐⭐</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>语法保证</td>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>需手动测试</td>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>100%正确 ✅</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>适用场景</td>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>Demo/学习</td>
                                        <td style={{ padding: '8px', border: '1px solid #e8e8e8' }}>生产环境</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p style={{ marginTop: '16px', color: '#666' }}>
                                💡 提示：生产环境推荐使用AST生成方式，确保代码质量和可维护性。
                            </p>
                        </div>
                    </TabPane>
                </Tabs>
            </Modal>
        </>
    );
};

export default CodeExport;
