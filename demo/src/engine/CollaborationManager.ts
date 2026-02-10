/**
 * 协作管理器
 * 处理多用户协作场景
 */

import { eventBus } from './EventBus';

export interface User {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
    online?: boolean;
}

export interface Operation {
    id: string;
    userId: string;
    timestamp: number;
    type: 'add' | 'update' | 'delete' | 'move';
    targetId: string;
    data: any;
}

export class CollaborationManager {
    private users: Map<string, User> = new Map();
    private currentUserId: string | null = null;
    private operations: Operation[] = [];
    private maxOperations: number = 100;
    private listeners: Function[] = [];

    /**
     * 设置当前用户
     */
    setCurrentUser(user: User) {
        this.currentUserId = user.id;
        this.users.set(user.id, { ...user, online: true });

        this.notifyListeners();
        eventBus.emit('collaboration:user-joined', user);

        console.log(`👤 User ${user.name} joined`);
    }

    /**
     * 获取当前用户
     */
    getCurrentUser(): User | null {
        if (!this.currentUserId) {
            return null;
        }
        return this.users.get(this.currentUserId) || null;
    }

    /**
     * 添加用户
     */
    addUser(user: User) {
        this.users.set(user.id, { ...user, online: true });
        this.notifyListeners();
        eventBus.emit('collaboration:user-joined', user);
    }

    /**
     * 移除用户
     */
    removeUser(userId: string) {
        const user = this.users.get(userId);

        if (user) {
            user.online = false;
            this.notifyListeners();
            eventBus.emit('collaboration:user-left', user);
        }
    }

    /**
     * 获取所有在线用户
     */
    getOnlineUsers(): User[] {
        return Array.from(this.users.values()).filter(u => u.online);
    }

    /**
     * 记录操作
     */
    recordOperation(operation: Omit<Operation, 'id' | 'userId' | 'timestamp'>) {
        if (!this.currentUserId) {
            console.warn('No current user set');
            return null;
        }

        const op: Operation = {
            id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: this.currentUserId,
            timestamp: Date.now(),
            ...operation
        };

        this.operations.push(op);

        // 清理旧操作
        if (this.operations.length > this.maxOperations) {
            this.operations = this.operations.slice(-this.maxOperations);
        }

        eventBus.emit('collaboration:operation', op);

        return op;
    }

    /**
     * 获取操作历史
     */
    getOperations(limit?: number): Operation[] {
        const ops = [...this.operations].reverse();
        return limit ? ops.slice(0, limit) : ops;
    }

    /**
     * 检测冲突
     */
    detectConflict(targetId: string, excludeUserId?: string): Operation[] {
        const recentTime = Date.now() - 5000; // 最近5秒的操作

        return this.operations.filter(op =>
            op.targetId === targetId &&
            op.timestamp > recentTime &&
            op.userId !== excludeUserId
        );
    }

    /**
     * 广播消息（模拟）
     */
    broadcast(message: string, data?: any) {
        eventBus.emit('collaboration:broadcast', {
            from: this.currentUserId,
            message,
            data,
            timestamp: Date.now()
        });

        console.log(`📢 Broadcast: ${message}`);
    }

    /**
     * 订阅变化
     */
    subscribe(callback: Function) {
        this.listeners.push(callback);
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * 通知监听器
     */
    private notifyListeners() {
        this.listeners.forEach(cb => cb());
    }

    /**
     * 清空
     */
    clear() {
        this.users.clear();
        this.operations = [];
        this.currentUserId = null;
        this.notifyListeners();
    }

    /**
     * 导出协作数据
     */
    export() {
        return {
            users: Array.from(this.users.values()),
            operations: this.operations,
            currentUserId: this.currentUserId
        };
    }
}

// 导出单例
export const collaborationManager = new CollaborationManager();
