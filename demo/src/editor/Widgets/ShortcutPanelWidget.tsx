import React from 'react';
import { List, Tag } from 'antd';
import { commandManager } from '@/engine/CommandManager';
import { CodeOutlined } from '@ant-design/icons';

/**
 * 快捷键面板Widget
 * 显示所有注册的命令和快捷键
 */
const ShortcutPanelWidget: React.FC = () => {
    const commands = commandManager.getAll();
    const commandsWithHotkey = commands.filter(cmd => cmd.hotkey);

    return (
        <div style={{ padding: '8px 0' }}>
            <List
                dataSource={commandsWithHotkey}
                size="small"
                renderItem={command => (
                    <List.Item style={{ padding: '8px 12px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>
                                <CodeOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                                {command.name}
                            </div>
                            {command.description && (
                                <div style={{ fontSize: 12, color: '#999' }}>
                                    {command.description}
                                </div>
                            )}
                        </div>
                        <Tag color="blue">{command.hotkey}</Tag>
                    </List.Item>
                )}
            />

            {commandsWithHotkey.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#999',
                    fontSize: 14
                }}>
                    暂无快捷键
                </div>
            )}
        </div>
    );
};

export default ShortcutPanelWidget;
