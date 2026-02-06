/**
 * 数据源管理系统
 */

export interface DataSource {
    id: string;
    name: string;
    type: 'api' | 'static' | 'variable';
    config: DataSourceConfig;
}

export interface DataSourceConfig {
    // API数据源
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    params?: Record<string, any>;

    // 静态数据源
    data?: any;

    // 变量数据源
    defaultValue?: any;
}

export interface DataSourceState {
    loading: boolean;
    data: any;
    error: Error | null;
}

/**
 * 数据源管理器
 */
export class DataSourceManager {
    private sources: Map<string, DataSource> = new Map();
    private states: Map<string, DataSourceState> = new Map();
    private listeners: Map<string, Set<(state: DataSourceState) => void>> = new Map();

    /**
     * 注册数据源
     */
    register(source: DataSource): void {
        this.sources.set(source.id, source);
        this.states.set(source.id, {
            loading: false,
            data: null,
            error: null
        });
        this.listeners.set(source.id, new Set());
    }

    /**
     * 获取数据源
     */
    get(id: string): DataSource | undefined {
        return this.sources.get(id);
    }

    /**
     * 获取数据源状态
     */
    getState(id: string): DataSourceState | undefined {
        return this.states.get(id);
    }

    /**
     * 获取数据源数据
     */
    getData(id: string): any {
        return this.states.get(id)?.data;
    }

    /**
     * 加载数据源
     */
    async load(id: string): Promise<void> {
        const source = this.sources.get(id);
        if (!source) {
            throw new Error(`Data source "${id}" not found`);
        }

        this.updateState(id, { loading: true, error: null });

        try {
            let data: any;

            switch (source.type) {
                case 'api':
                    data = await this.loadApiData(source.config);
                    break;
                case 'static':
                    data = source.config.data;
                    break;
                case 'variable':
                    data = source.config.defaultValue;
                    break;
            }

            this.updateState(id, { loading: false, data, error: null });
        } catch (error) {
            this.updateState(id, {
                loading: false,
                data: null,
                error: error as Error
            });
        }
    }

    /**
     * 加载API数据
     */
    private async loadApiData(config: DataSourceConfig): Promise<any> {
        const { url, method = 'GET', headers = {}, params = {} } = config;

        if (!url) {
            throw new Error('API URL is required');
        }

        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        if (method !== 'GET' && params) {
            options.body = JSON.stringify(params);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * 更新状态
     */
    private updateState(id: string, updates: Partial<DataSourceState>): void {
        const currentState = this.states.get(id);
        if (!currentState) return;

        const newState = { ...currentState, ...updates };
        this.states.set(id, newState);

        // 通知监听者
        const listeners = this.listeners.get(id);
        if (listeners) {
            listeners.forEach(listener => listener(newState));
        }
    }

    /**
     * 订阅数据变化
     */
    subscribe(id: string, listener: (state: DataSourceState) => void): () => void {
        const listeners = this.listeners.get(id);
        if (!listeners) return () => { };

        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    }

    /**
     * 设置数据
     */
    setData(id: string, data: any): void {
        this.updateState(id, { data });
    }

    /**
     * 重新加载
     */
    async reload(id: string): Promise<void> {
        await this.load(id);
    }

    /**
     * 删除数据源
     */
    remove(id: string): void {
        this.sources.delete(id);
        this.states.delete(id);
        this.listeners.delete(id);
    }

    /**
     * 获取所有数据源
     */
    getAll(): DataSource[] {
        return Array.from(this.sources.values());
    }
}

// 导出单例
export const dataSourceManager = new DataSourceManager();
