import ActionEvent from "../../utility/ActionEvent";

export interface BaseChangedEvent {
    __bindChangedEvent__: ActionEvent<any[]>;
    __proxy__: any;
}

export interface OnBindChangedEvent<T> extends BaseChangedEvent {
    __bindChangedEvent__: ActionEvent<[T, PropertyKey, any]>;
}

export function isBindObject<T>(instance: T): boolean {
    return Object.hasProperty<BaseChangedEvent>(instance, "__proxy__");
}

type IsArray<T> = T extends Array<any> ? true : false;

export function makeBindDataProxy<T>(instance: T): T & OnBindChangedEvent<T> {
    if (Object.hasProperty<BaseChangedEvent>(instance, "__proxy__") && instance.__proxy__ != null) return instance.__proxy__;
    type ProxyType = T & OnBindChangedEvent<T>;
    let newInstance: ProxyType = instance as ProxyType;
    newInstance.__bindChangedEvent__ = new ActionEvent<[T, PropertyKey, any]>();

    newInstance.__proxy__ = new Proxy(newInstance, {
        set(target: ProxyType, key: PropertyKey, value: any, receiver: any): boolean {
            if (target[key] === value) return true;
            target[key] = value;
            target.__bindChangedEvent__.dispatchAction(target, key, value);
            return true;
        }
    });
    return newInstance.__proxy__;
}

export enum BindArrayEventType {
    Unknow,
    Add,
    Update,
    Resize,
}

export interface OnBindArrayChangedEvent<T> extends BaseChangedEvent {
    __bindChangedEvent__: ActionEvent<[T[], BindArrayEventType, PropertyKey, T, T]>;
}

export function makeBindArrayProxy<T>(instance: T[]): T[] & OnBindArrayChangedEvent<T> {
    if (Object.hasProperty<OnBindArrayChangedEvent<T>>(instance, "__proxy__") && instance.__proxy__ != null) return instance.__proxy__;

    type ProxyType = T[] & OnBindArrayChangedEvent<T>;
    let newInstance: ProxyType = instance as ProxyType;
    newInstance.__bindChangedEvent__ = new ActionEvent<[T[], BindArrayEventType, PropertyKey, T, T]>();

    newInstance.__proxy__ = new Proxy(newInstance, {
        set(target: ProxyType, key: PropertyKey, value: any, receiver: any): boolean {
            let oldValue = target[key];
            if (oldValue === value) return true;
            let eventType: BindArrayEventType = BindArrayEventType.Unknow;
            if (key === "length") {
                eventType = BindArrayEventType.Resize;
            } else {
                // if (typeof key === "string")
                //     key = parseInt(key);
                if (oldValue != null) {
                    eventType = BindArrayEventType.Update;
                } else {
                    eventType = BindArrayEventType.Add;
                }
            }
            target[key] = value;
            target.__bindChangedEvent__.dispatchAction(target, eventType, key, value, oldValue);
            return true;
        }
    });
    return newInstance.__proxy__;
}


/**
 * 注册为一个可以被绑定的对象，当有多个装饰器时，此装饰器必须在靠近Class声明的第一个
 */
export function registerBindObject<T extends AnyConstructor>(constructorFunction: T): T {
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
