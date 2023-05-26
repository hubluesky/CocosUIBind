import { makeBindDataProxy } from "./BindEvent";

/**
 * 注册为一个可以被绑定的对象，当有多个装饰器时，此装饰器必须在靠近Class声明的第一个
 */
export function bindObject<T extends AnyConstructor>(constructorFunction: T): T {
    const newConstructorFunction: { prototype: T; } = function (...args) {
        return makeBindDataProxy(new constructorFunction(...args));
    };

    newConstructorFunction.prototype = constructorFunction.prototype;
    // Copy static members too
    Object.keys(constructorFunction).forEach((name: string) => {
        newConstructorFunction[name] = constructorFunction[name];
    });

    return newConstructorFunction as T;
}
