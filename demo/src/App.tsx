import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EditorProvider } from '@/store/EditorContext';
import Toolbar from '@/editor/Toolbar/Toolbar';
import MaterialList from '@/editor/LeftPanel/MaterialList';
import Canvas from '@/editor/Canvas/Canvas';
import PropertyPanel from '@/editor/RightPanel/PropertyPanel';
import Tree from '@/editor/OutlineTree/Tree';
import './App.css';

const App: React.FC = () => {
    return (
        <DndProvider backend={HTML5Backend}>
            <EditorProvider>
                <div className="app">
                    <Toolbar />
                    <div className="main">
                        <div className="left-panel">
                            <MaterialList />
                        </div>
                        <div className="canvas-area">
                            <Canvas />
                        </div>
                        <div className="right-panel">
                            <PropertyPanel />
                            <Tree />
                        </div>
                    </div>
                </div>
            </EditorProvider>
        </DndProvider>
    );
};

export default App;
