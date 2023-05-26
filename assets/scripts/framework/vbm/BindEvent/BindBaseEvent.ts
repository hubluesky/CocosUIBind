import ActionEvent from "framework/utility/ActionEvent";
import BindUIComponent from "./BindUIComponent";

interface BaseChangedEvent {
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

export interface PropertyChanged<U = BindUIComponent, UP = any, D = any, DP = any> {
    (ui: U, uiProperty: UP, data: D, dataProperty: DP): void;
}

export interface ArrayElementChanged<U = BindUIComponent, UP = any, D = any, DP = any, I> {
    (ui: U, uiProperty: UP, data: D, dataProperty: DP, index: I): void;
}


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
                // if (typeof key === `string`)
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

export abstract class BindEvent<T> {
    public readonly onBindEvent = new ActionEvent<[T, T]>();
    public readonly onUnbindEvent = new ActionEvent<[T]>();

    private _bindSource: T;
    public get bindSource() { return this._bindSource; }

    public bindObject(instance: T): T {
        this.unbindObject();
        const newInstance = this.makeBindProxy(instance);
        newInstance.__bindChangedEvent__.addEvent(this.onPropertyChanged, this);
        this._bindSource = instance;
        this.onBindEvent.dispatchAction(newInstance, instance);
        return newInstance;
    }

    public unbindObject(): void {
        this._unbindObject(this.bindSource);
        this._bindSource = null;
    }

    private _unbindObject(instance: T): void {
        if (instance && Object.hasProperty<BaseChangedEvent>(instance, "__bindChangedEvent__")) {
            this.onUnbindEvent.dispatchAction(instance);
            instance.__bindChangedEvent__.removeEvent(this.onPropertyChanged, this);
        }
    }

    protected abstract makeBindProxy(instance: T): T & BaseChangedEvent;

    protected abstract onPropertyChanged(...args: any[]): void;
}