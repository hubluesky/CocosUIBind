import ActionEvent, { Action } from "framework/utility/ActionEvent";

export enum BindArrayEventType {
    Unknow,
    Add,
    Update,
    Resize,
}

interface OnBindArrayChangedEvent<T> {
    __itemsChanged__: ActionEvent<[T[], BindArrayEventType, PropertyKey, T, T]>;
    __proxy__: any;
}

export function makeBindArrayProxy<T>(instance: T[]): T[] & OnBindArrayChangedEvent<T> {
    if (Object.hasProperty<OnBindArrayChangedEvent<T>>(instance, "__proxy__") && instance.__proxy__ != null) return instance.__proxy__;
    type ProxyType = T[] & OnBindArrayChangedEvent<T>;
    let newInstance: ProxyType = instance as ProxyType;
    newInstance.__itemsChanged__ = new ActionEvent<[T[], BindArrayEventType, PropertyKey, T, T]>();

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
            target.__itemsChanged__.dispatchAction(target, eventType, key, value, oldValue);
            return true;
        }
    });
    return newInstance.__proxy__;
}

export default class BindArrayEvent<T> {
    protected readonly eventList: Action<[T[], BindArrayEventType, PropertyKey, T, T]>[] = [];

    public addArrayChanged(onPropertyChanged: Action<[T[], BindArrayEventType, PropertyKey, T, T]>): boolean {
        if (this.eventList.contains(onPropertyChanged))
            return false;
        return !!this.eventList.push(onPropertyChanged);
    }

    public removeArrayChanged(onPropertyChanged: Action<[T[], BindArrayEventType, PropertyKey, T, T]>): boolean {
        return this.eventList.remove(onPropertyChanged) != null;
    }

    public bindObject(instance: T[]): T[] {
        let newInstance = makeBindArrayProxy(instance);
        newInstance.__itemsChanged__.addEvent(this.onPropertyChanged, this);
        return newInstance;
    }

    public unbindObject(instance: T[]): void {
        if (instance && Object.hasProperty<OnBindArrayChangedEvent<T>>(instance, "__itemsChanged__")) {
            instance.__itemsChanged__.removeEvent(this.onPropertyChanged, this);
        }
    }

    protected onPropertyChanged(array: T[], eventType: BindArrayEventType, key: PropertyKey, value: T, oldValue: T): void {
        for (let action of this.eventList)
            action(array, eventType, key, value, oldValue);
    }

    public static isBindObject<T>(instance: T): boolean {
        return Object.hasProperty<OnBindArrayChangedEvent<T>>(instance, "__proxy__");
    }
}