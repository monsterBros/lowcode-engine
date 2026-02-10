import React, { useState } from 'react';
import { Modal, Tabs, Input, Button, Alert, message, Collapse, Tag } from 'antd';
import { UploadOutlined, LinkOutlined, CodeOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { componentLoader } from '@/engine/ComponentLoader';
import { ValidationResult } from '@/types/componentPackage';
import styles from './ComponentImport.module.css';

const { TextArea } = Input;
const { Panel } = Collapse;

interface ComponentImportProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: (componentName: string) => void;
}

const ComponentImport: React.FC<ComponentImportProps> = ({ visible, onClose, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('url');
    const [url, setUrl] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

    const handleReset = () => {
        setUrl('');
        setCode('');
        setValidationResult(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    // 从URL加载
    const handleLoadFromUrl = async () => {
        if (!url.trim()) {
            message.error('请输入URL');
            return;
        }

        setLoading(true);
        setValidationResult(null);

        try {
            const result = await componentLoader.loadFromUrl(url);
            setValidationResult(result);

            if (result.success) {
                message.success(`组件 "${result.componentName}" 注册成功！`);
                onSuccess?.(result.componentName || '');
                setTimeout(handleClose, 2000);
            } else {
                message.error('组件校验失败，请查看详情');
            }
        } catch (error) {
            message.error('加载失败：' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    // 从代码加载
    const handleLoadFromCode = async () => {
        if (!code.trim()) {
            message.error('请输入代码');
            return;
        }

        setLoading(true);
        setValidationResult(null);

        try {
            const result = await componentLoader.loadFromCode(code, {
                allowUnsafe: true, // 允许从代码加载
            });
            setValidationResult(result);

            if (result.success) {
                message.success(`组件 "${result.componentName}" 注册成功！`);
                onSuccess?.(result.componentName || '');
                setTimeout(handleClose, 2000);
            } else {
                message.error('组件校验失败，请查看详情');
            }
        } catch (error) {
            message.error('加载失败：' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    // 渲染校验结果
    const renderValidationResult = () => {
        if (!validationResult) return null;

        const { success, errors, warnings } = validationResult;

        return (
            <div className={styles.validationResult}>
                <Alert
                    type={success ? 'success' : 'error'}
                    message={success ? '✅ 校验通过' : '❌ 校验失败'}
                    description={
                        success
                            ? `组件 "${validationResult.componentName}" 已成功注册到物料库`
                            : '请修复以下错误后重试'
                    }
                    showIcon
                />

                {errors.length > 0 && (
                    <Collapse className={styles.errorList} defaultActiveKey={['1']}>
                        <Panel
                            header={
                                <span>
                                    <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                                    错误 ({errors.length})
                                </span>
                            }
                            key="1"
                        >
                            {errors.map((error, index) => (
                                <div key={index} className={styles.errorItem}>
                                    <Tag color="red">{error.type}</Tag>
                                    <div className={styles.errorMessage}>
                                        {error.field && <strong>[{error.field}] </strong>}
                                        {error.message}
                                    </div>
                                    {error.suggestion && (
                                        <div className={styles.suggestion}>
                                            💡 建议: {error.suggestion}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Panel>
                    </Collapse>
                )}

                {warnings.length > 0 && (
                    <Collapse className={styles.warningList}>
                        <Panel
                            header={
                                <span>
                                    <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                                    警告 ({warnings.length})
                                </span>
                            }
                            key="1"
                        >
                            {warnings.map((warning, index) => (
                                <div key={index} className={styles.warningItem}>
                                    <Tag color="orange">{warning.type}</Tag>
                                    <div className={styles.warningMessage}>{warning.message}</div>
                                    {warning.suggestion && (
                                        <div className={styles.suggestion}>
                                            💡 建议: {warning.suggestion}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Panel>
                    </Collapse>
                )}
            </div>
        );
    };

    return (
        <Modal
            title="📦 导入第三方组件"
            visible={visible}
            onCancel={handleClose}
            width={700}
            footer={null}
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab={<span><LinkOutlined /> URL加载</span>} key="url">
                    <div className={styles.tabContent}>
                        <Alert
                            message="从URL加载组件"
                            description="输入组件的远程URL（必须导出ComponentPackage对象）"
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <Input
                            placeholder="https://example.com/components/my-button.js"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            size="large"
                        />
                        <Button
                            type="primary"
                            icon={<UploadOutlined />}
                            onClick={handleLoadFromUrl}
                            loading={loading}
                            block
                            style={{ marginTop: 16 }}
                        >
                            加载并校验
                        </Button>
                    </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span><CodeOutlined /> 代码粘贴</span>} key="code">
                    <div className={styles.tabContent}>
                        <Alert
                            message="从代码导入组件"
                            description="粘贴组件代码（使用 module.exports 导出ComponentPackage）"
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        <TextArea
                            placeholder={`// 示例代码
const MyButton = ({ text, onClick }) => {
  return <button onClick={onClick}>{text}</button>;
};

module.exports = {
  name: 'my-button',
  version: '1.0.0',
  component: MyButton,
  meta: {
    componentName: 'MyButton',
    title: '自定义按钮',
    props: [
      {
        name: 'text',
        title: '文本',
        setter: { componentName: 'StringSetter' }
      }
    ]
  }
};`}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={12}
                            style={{ fontFamily: 'monospace' }}
                        />
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={handleLoadFromCode}
                            loading={loading}
                            block
                            style={{ marginTop: 16 }}
                        >
                            执行并校验
                        </Button>
                    </div>
                </Tabs.TabPane>
            </Tabs>

            {renderValidationResult()}
        </Modal>
    );
};

export default ComponentImport;
