import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EditorProvider } from '@/store/EditorContext';
import { Tabs } from 'antd';
import Toolbar from '@/editor/Toolbar/Toolbar';
import MaterialList from '@/editor/LeftPanel/MaterialList';
import Canvas from '@/editor/Canvas/Canvas';
import LivePreview from '@/editor/Canvas/LivePreview';
import PropertyPanel from '@/editor/RightPanel/PropertyPanel';
import EventPanel from '@/editor/RightPanel/EventPanel';
import DataSourcePanel from '@/editor/RightPanel/DataSourcePanel';
import Tree from '@/editor/OutlineTree/Tree';
import { useEditor } from '@/store/EditorContext';
import { ignitor } from '@/engine/Ignitor';
import { commandManager } from '@/engine/CommandManager';
import { eventBus } from '@/engine/EventBus';
import './App.css';

const EditorContent: React.FC = () => {
    const { schema, selectedNodeId, setSelectedNodeId, deleteNode, undo, redo } = useEditor();

    // 在组件挂载时初始化引擎
    useEffect(() => {
        // 初始化引擎（如果还未初始化）
        if (!ignitor.isInitialized()) {
            ignitor.init({
                config: {
                    materials: {
                        // 可以配置远程物料URL
                    },
                    variables: [
                        // 预定义一些变量
                        { name: 'appTitle', type: 'string', defaultValue: '低代码应用' },
                        { name: 'isDebug', type: 'boolean', defaultValue: false },
                    ],
                    i18n: {
                        locale: 'zh-CN'
                    }
                },
                onReady: () => {
                    console.log('✅ 引擎初始化完成！');
                }
            });
        }

        // 监听命令事件并集成到编辑器
        const handleUndo = () => undo();
        const handleRedo = () => redo();
        const handleDelete = () => {
            if (selectedNodeId) {
                deleteNode(selectedNodeId);
            }
        };

        eventBus.on('command:undo', handleUndo);
        eventBus.on('command:redo', handleRedo);
        eventBus.on('command:delete', handleDelete);

        return () => {
            eventBus.off('command:undo', handleUndo);
            eventBus.off('command:redo', handleRedo);
            eventBus.off('command:delete', handleDelete);
        };
    }, [selectedNodeId, deleteNode, undo, redo]);

    return (
        <div className="app">
            <Toolbar />
            <div className="main">
                <div className="left-panel">
                    <MaterialList />
                </div>
                <div className="canvas-area">
                    <Tabs
                        defaultActiveKey="canvas"
                        items={[
                            {
                                key: 'canvas',
                                label: '画布',
                                children: <Canvas />,
                            },
                            {
                                key: 'preview',
                                label: '预览',
                                children: (
                                    <LivePreview
                                        schema={schema}
                                        selectedNodeId={selectedNodeId}
                                        onNodeSelect={setSelectedNodeId}
                                        onNodeDelete={deleteNode}
                                    />
                                ),
                            },
                        ]}
                    />
                </div>
                <div className="right-panel">
                    <Tabs
                        defaultActiveKey="props"
                        items={[
                            {
                                key: 'props',
                                label: '属性',
                                children: <PropertyPanel />,
                            },
                            {
                                key: 'events',
                                label: '事件',
                                children: <EventPanel />,
                            },
                            {
                                key: 'datasource',
                                label: '数据源',
                                children: <DataSourcePanel />,
                            },
                            {
                                key: 'tree',
                                label: '大纲',
                                children: <Tree />,
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <DndProvider backend={HTML5Backend}>
            <EditorProvider>
                <EditorContent />
            </EditorProvider>
        </DndProvider>
    );
};

export default App;
