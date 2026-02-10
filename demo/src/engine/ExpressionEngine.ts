/**
 * 表达式求值引擎
 * 支持JSExpression求值，用于动态渲染
 */

export class ExpressionEngine {
    /**
     * 求值JSExpression
     * @param expr 表达式字符串，如 "state.count + 1"
     * @param context 上下文对象，包含state、props等
     * @returns 求值结果
     */
    evaluate(expr: string, context: any): any {
        if (!expr || typeof expr !== 'string') {
            return expr;
        }

        try {
            // 创建安全的求值函数
            const func = new Function('context', `
        with(context) {
          try {
            return ${expr};
          } catch(e) {
            console.warn('Expression evaluation error:', e);
            return undefined;
          }
        }
      `);

            return func(context);
        } catch (error) {
            console.error('Expression evaluation failed:', expr, error);
            return undefined;
        }
    }

    /**
     * 判断是否为JSExpression
     */
    isJSExpression(value: any): boolean {
        return (
            value &&
            typeof value === 'object' &&
            value.type === 'JSExpression' &&
            typeof value.value === 'string'
        );
    }

    /**
     * 解析并求值可能的JSExpression
     */
    parseValue(value: any, context: any): any {
        if (this.isJSExpression(value)) {
            return this.evaluate(value.value, context);
        }
        return value;
    }

    /**
     * 深度解析对象中的所有JSExpression
     */
    parseObject(obj: any, context: any): any {
        if (!obj || typeof obj !== 'object') {
            return this.parseValue(obj, context);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.parseObject(item, context));
        }

        const result: any = {};
        for (const key in obj) {
            result[key] = this.parseObject(obj[key], context);
        }
        return result;
    }
}

// 导出单例
export const expressionEngine = new ExpressionEngine();
