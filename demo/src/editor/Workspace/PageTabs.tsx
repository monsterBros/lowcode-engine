import React, { useState, useEffect } from 'react';
import { Tabs, Dropdown, Menu, Modal, Input } from 'antd';
import { PlusOutlined, MoreOutlined, CopyOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { workspaceManager, Page } from '@/engine/WorkspaceManager';
import styles from './PageTabs.module.css';

/**
 * 页面标签栏组件
 * 用于显示和切换多个页面
 */
const PageTabs: React.FC = () => {
    const [pages, setPages] = useState<Page[]>([]);
    const [currentPageId, setCurrentPageId] = useState<string | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        // 初始化
        updateState();

        // 订阅变化
        const unsubscribe = workspaceManager.subscribe(() => {
            updateState();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const updateState = () => {
        setPages(workspaceManager.getAllPages());
        setCurrentPageId(workspaceManager.getCurrentPageId());
    };

    const handleTabChange = (pageId: string) => {
        workspaceManager.setCurrentPage(pageId);
    };

    const handleAddPage = () => {
        workspaceManager.createPage({
            title: `页面 ${pages.length + 1}`,
            schema: {
                componentName: 'Page',
                id: `root_${Date.now()}`,
                props: {},
                children: []
            }
        });
    };

    const handleDuplicatePage = (pageId: string) => {
        workspaceManager.duplicatePage(pageId);
    };

    const handleRenamePage = (pageId: string) => {
        const page = workspaceManager.getPage(pageId);
        if (page) {
            setRenaming(pageId);
            setNewTitle(page.title);
        }
    };

    const confirmRename = () => {
        if (renaming && newTitle.trim()) {
            workspaceManager.renamePage(renaming, newTitle.trim());
            setRenaming(null);
            setNewTitle('');
        }
    };

    const handleDeletePage = (pageId: string) => {
        Modal.confirm({
            title: '删除页面',
            content: '确定要删除这个页面吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                workspaceManager.deletePage(pageId);
            }
        });
    };

    const getPageMenu = (page: Page) => (
        <Menu>
            <Menu.Item
                key="duplicate"
                icon={<CopyOutlined />}
                onClick={() => handleDuplicatePage(page.id)}
            >
                复制页面
            </Menu.Item>
            <Menu.Item
                key="rename"
                icon={<EditOutlined />}
                onClick={() => handleRenamePage(page.id)}
            >
                重命名
            </Menu.Item>
            {page.closeable && (
                <Menu.Item
                    key="delete"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDeletePage(page.id)}
                >
                    删除页面
                </Menu.Item>
            )}
        </Menu>
    );

    const items = pages.map(page => ({
        key: page.id,
        label: (
            <span className={styles.tabLabel}>
                {page.icon && <span className={styles.tabIcon}>{page.icon}</span>}
                {page.title}
                {page.closeable && (
                    <Dropdown overlay={getPageMenu(page)} trigger={['click']}>
                        <MoreOutlined
                            className={styles.moreBtn}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>
                )}
            </span>
        ),
        closable: false // 使用自定义删除逻辑
    }));

    return (
        <div className={styles.pageTabs}>
            <Tabs
                type="card"
                activeKey={currentPageId || undefined}
                onChange={handleTabChange}
                items={items}
                tabBarExtraContent={{
                    right: (
                        <PlusOutlined
                            className={styles.addBtn}
                            onClick={handleAddPage}
                        />
                    )
                }}
            />

            <Modal
                title="重命名页面"
                open={renaming !== null}
                onOk={confirmRename}
                onCancel={() => setRenaming(null)}
                okText="确定"
                cancelText="取消"
            >
                <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onPressEnter={confirmRename}
                    placeholder="输入页面名称"
                    autoFocus
                />
            </Modal>
        </div>
    );
};

export default PageTabs;
