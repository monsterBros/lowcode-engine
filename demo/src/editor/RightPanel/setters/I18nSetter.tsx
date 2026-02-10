import React, { useState } from 'react';
import { Input, Select, Button } from 'antd';
import { GlobalOutlined, PlusOutlined } from '@ant-design/icons';
import { i18nManager } from '@/engine/I18nManager';

interface I18nSetterProps {
    value?: {
        type: 'i18n';
        key: string;
    } | string;
    onChange?: (value: any) => void;
}

/**
 * 国际化文本Setter
 * 用于配置多语言文本
 */
const I18nSetter: React.FC<I18nSetterProps> = ({ value, onChange }) => {
    const [mode, setMode] = useState<'static' | 'i18n'>(
        typeof value === 'object' && value?.type === 'i18n' ? 'i18n' : 'static'
    );

    const locales = i18nManager.getAvailableLocales();
    const currentLocale = i18nManager.getCurrentLocale();

    const handleModeChange = (newMode: 'static' | 'i18n') => {
        setMode(newMode);
        if (newMode === 'static') {
            onChange?.('');
        } else {
            onChange?.({
                type: 'i18n',
                key: 'common.text'
            });
        }
    };

    const handleKeyChange = (key: string) => {
        onChange?.({
            type: 'i18n',
            key
        });
    };

    const handleStaticChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    const i18nKey = typeof value === 'object' ? value.key : '';
    const staticValue = typeof value === 'string' ? value : '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Select
                value={mode}
                onChange={handleModeChange}
                style={{ width: '100%' }}
            >
                <Select.Option value="static">静态文本</Select.Option>
                <Select.Option value="i18n">
                    <GlobalOutlined /> 国际化
                </Select.Option>
            </Select>

            {mode === 'static' ? (
                <Input
                    value={staticValue}
                    onChange={handleStaticChange}
                    placeholder="输入文本"
                />
            ) : (
                <>
                    <Input
                        value={i18nKey}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        placeholder="输入i18n key，如：common.save"
                        addonBefore="Key"
                    />

                    <div style={{
                        padding: 8,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 4,
                        fontSize: 12
                    }}>
                        <div style={{ color: '#666', marginBottom: 4 }}>
                            当前语言预览 ({currentLocale}):
                        </div>
                        <div style={{ color: '#1890ff', fontWeight: 500 }}>
                            {i18nKey ? i18nManager.t(i18nKey, `[${i18nKey}]`) : '-'}
                        </div>
                    </div>

                    <div style={{ fontSize: 12, color: '#999' }}>
                        支持的语言: {locales.map(l => l.name).join(', ')}
                    </div>
                </>
            )}
        </div>
    );
};

export default I18nSetter;
