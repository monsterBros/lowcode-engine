/**
 * 事件系统增强 - 添加验证功能
 */

export interface EventValidation {
    /**
     * 验证事件名称
     */
    validateEventName: (eventName: string) => {
        valid: boolean;
        error?: string;
    };

    /**
     * 验证事件处理器
     */
    validateHandler: (handler: string) => {
        valid: boolean;
        error?: string;
    };
}

/**
 * 事件验证器
 */
export class EventValidator implements EventValidation {
    /**
     * 验证事件名称 - 必须以'on'开头
     */
    validateEventName(eventName: string): { valid: boolean; error?: string } {
        // 事件名称必须以'on'开头
        if (!eventName.startsWith('on')) {
            return {
                valid: false,
                error: '事件名称必须以"on"开头，如：onClick, onChange'
            };
        }

        // 事件名称必须是驼峰命名
        const camelCaseRegex = /^on[A-Z][a-zA-Z]*$/;
        if (!camelCaseRegex.test(eventName)) {
            return {
                valid: false,
                error: '事件名称必须使用驼峰命名，如：onClick, onMouseEnter'
            };
        }

        return { valid: true };
    }

    /**
     * 验证事件处理器代码
     */
    validateHandler(handler: string): { valid: boolean; error?: string } {
        if (!handler || !handler.trim()) {
            return {
                valid: false,
                error: '事件处理器代码不能为空'
            };
        }

        try {
            // 尝试创建函数来验证语法
            new Function(handler);
            return { valid: true };
        } catch (e) {
            return {
                valid: false,
                error: `语法错误: ${(e as Error).message}`
            };
        }
    }

    /**
     * 验证事件参数
     */
    validateEventParams(eventName: string, params: string[]): { valid: boolean; error?: string } {
        const standardParams: Record<string, string[]> = {
            onClick: ['event'],
            onChange: ['event'],
            onInput: ['event'],
            onSubmit: ['event'],
            onFocus: ['event'],
            onBlur: ['event'],
            onMouseEnter: ['event'],
            onMouseLeave: ['event'],
            onKeyDown: ['event'],
            onKeyUp: ['event'],
        };

        const expectedParams = standardParams[eventName];
        if (!expectedParams) {
            // 未知事件，不做参数验证
            return { valid: true };
        }

        if (params.length !== expectedParams.length) {
            return {
                valid: false,
                error: `${eventName} 期望 ${expectedParams.length} 个参数: ${expectedParams.join(', ')}`
            };
        }

        return { valid: true };
    }
}

/**
 * 事件名称常量 - 带验证的标准事件
 */
export const VALIDATED_EVENTS = {
    // 鼠标事件
    CLICK: 'onClick',
    DOUBLE_CLICK: 'onDoubleClick',
    MOUSE_DOWN: 'onMouseDown',
    MOUSE_UP: 'onMouseUp',
    MOUSE_ENTER: 'onMouseEnter',
    MOUSE_LEAVE: 'onMouseLeave',
    MOUSE_MOVE: 'onMouseMove',

    // 键盘事件
    KEY_DOWN: 'onKeyDown',
    KEY_UP: 'onKeyUp',
    KEY_PRESS: 'onKeyPress',

    // 表单事件
    CHANGE: 'onChange',
    INPUT: 'onInput',
    SUBMIT: 'onSubmit',
    FOCUS: 'onFocus',
    BLUR: 'onBlur',

    // 触摸事件
    TOUCH_START: 'onTouchStart',
    TOUCH_END: 'onTouchEnd',
    TOUCH_MOVE: 'onTouchMove',

    // 拖拽事件
    DRAG: 'onDrag',
    DRAG_START: 'onDragStart',
    DRAG_END: 'onDragEnd',
    DROP: 'onDrop',
} as const;

/**
 * 获取事件建议列表
 */
export function getEventSuggestions(prefix: string = ''): string[] {
    const events = Object.values(VALIDATED_EVENTS);

    if (!prefix) return events;

    const lowerPrefix = prefix.toLowerCase();
    return events.filter(event =>
        event.toLowerCase().includes(lowerPrefix)
    );
}

// 导出单例
export const eventValidator = new EventValidator();
