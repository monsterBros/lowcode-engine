import React from 'react';
import { Table, Tag } from 'antd';
import { widgetManager } from '@/engine/WidgetManager';
import { variableManager } from '@/engine/VariableManager';

/**
 * 变量面板Widget
 * 显示和管理全局变量
 */
const VariablePanelWidget: React.FC = () => {
    const variables = variableManager.getAll();

    const columns = [
        {
            title: '变量名',
            dataIndex: 'name',
            key: 'name',
            width: 120,
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            render: (type: string) => {
                const colorMap: Record<string, string> = {
                    string: 'blue',
                    number: 'green',
                    boolean: 'orange',
                    object: 'purple',
                    array: 'cyan',
                };
                return <Tag color={colorMap[type] || 'default'}>{type}</Tag>;
            }
        },
        {
            title: '当前值',
            dataIndex: 'defaultValue',
            key: 'value',
            render: (value: any, record: any) => {
                const currentValue = variableManager.getValue(record.name);
                return (
                    <span style={{ fontSize: 12, color: '#666' }}>
                        {JSON.stringify(currentValue ?? value)}
                    </span>
                );
            }
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            render: (desc: string) => desc || '-'
        }
    ];

    return (
        <div>
            <Table
                columns={columns}
                dataSource={variables}
                rowKey="name"
                size="small"
                pagination={false}
                style={{ fontSize: 12 }}
            />

            {variables.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#999',
                    fontSize: 14
                }}>
                    暂无全局变量
                </div>
            )}
        </div>
    );
};

export default VariablePanelWidget;
