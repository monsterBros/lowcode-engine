/**
 * 历史记录管理 - 支持撤销/重做
 * 参考 lowcode-engine 的 History 管理
 */

import { ComponentSchema } from '@/types';

export class History {
    private past: ComponentSchema[] = [];
    private future: ComponentSchema[] = [];
    private present: ComponentSchema;
    private maxSize: number;

    constructor(initialState: ComponentSchema, maxSize: number = 50) {
        this.present = JSON.parse(JSON.stringify(initialState));
        this.maxSize = maxSize;
    }

    /**
     * 记录新状态
     */
    push(newState: ComponentSchema): void {
        // 深拷贝当前状态到历史
        this.past.push(JSON.parse(JSON.stringify(this.present)));

        // 限制历史记录大小
        if (this.past.length > this.maxSize) {
            this.past.shift();
        }

        // 更新当前状态
        this.present = JSON.parse(JSON.stringify(newState));

        // 清空future（新操作后不能重做之前撤销的内容）
        this.future = [];
    }

    /**
     * 撤销
     */
    undo(): ComponentSchema | null {
        if (this.past.length === 0) {
            return null;
        }

        // 将当前状态推入future
        this.future.unshift(JSON.parse(JSON.stringify(this.present)));

        // 从past取出上一个状态
        this.present = this.past.pop()!;

        return JSON.parse(JSON.stringify(this.present));
    }

    /**
     * 重做
     */
    redo(): ComponentSchema | null {
        if (this.future.length === 0) {
            return null;
        }

        // 将当前状态推入past
        this.past.push(JSON.parse(JSON.stringify(this.present)));

        // 从future取出下一个状态
        this.present = this.future.shift()!;

        return JSON.parse(JSON.stringify(this.present));
    }

    /**
     * 是否可以撤销
     */
    canUndo(): boolean {
        return this.past.length > 0;
    }

    /**
     * 是否可以重做
     */
    canRedo(): boolean {
        return this.future.length > 0;
    }

    /**
     * 获取当前状态
     */
    getCurrent(): ComponentSchema {
        return JSON.parse(JSON.stringify(this.present));
    }

    /**
     * 重置历史
     */
    reset(newState: ComponentSchema): void {
        this.past = [];
        this.future = [];
        this.present = JSON.parse(JSON.stringify(newState));
    }

    /**
     * 获取历史记录统计
     */
    getStats() {
        return {
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            pastCount: this.past.length,
            futureCount: this.future.length,
        };
    }
}
