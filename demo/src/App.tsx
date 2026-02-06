import React from 'react';
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
import './App.css';

const EditorContent: React.FC = () => {
    const { schema, selectedNodeId, setSelectedNodeId, deleteNode } = useEditor();

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
