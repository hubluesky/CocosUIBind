import ActionEvent, { Action } from "framework/utility/ActionEvent";

interface OnBindChangedEvent<T> {
    __propertiesChanged__: ActionEvent<[T, PropertyKey, any]>;
    __proxy__: any;
}

export function makeBindDataProxy<T>(instance: T): T & OnBindChangedEvent<T> {
    if (Object.hasProperty<OnBindChangedEvent<T>>(instance, "__proxy__") && instance.__proxy__ != null) return instance.__proxy__;
    type ProxyType = T & OnBindChangedEvent<T>;
    let newInstance: ProxyType = instance as ProxyType;
    newInstance.__propertiesChanged__ = new ActionEvent<[T, PropertyKey, any]>();

    newInstance.__proxy__ = new Proxy(newInstance, {
        set(target: ProxyType, key: PropertyKey, value: any, receiver: any): boolean {
            if(target[key] === value) return true;
            target[key] = value;
            target.__propertiesChanged__.dispatchAction(target, key, value);
            return true;
        }
    });
    return newInstance.__proxy__;
}

/**
 * 绑定对象事件，
 */
export default class BindEvent<T> {
    protected readonly propertiesMap = new Map<PropertyKey, Action<[T, any]>[]>();

    public addPropertyChanged(key: ObjectProperties<T>, onPropertyChanged: Action<[T, any]>): boolean {
        let eventList = this.propertiesMap.get(key);
        if (eventList == null) {
            eventList = [];
            this.propertiesMap.set(key, eventList);
        } else if (eventList.contains(onPropertyChanged)) {
            return false;
        }
        return !!eventList.push(onPropertyChanged);
    }

    public removePropertyChanged(key: ObjectProperties<T>, onPropertyChanged: Action<[T, any]>): boolean {
        let eventList = this.propertiesMap.get(key);
        if (eventList == null) return false;
        return eventList.remove(onPropertyChanged) != null;
    }

    public bindObject(instance: T): T {
        let newInstance = makeBindDataProxy(instance);
        newInstance.__propertiesChanged__.addEvent(this.onPropertyChanged, this);
        return newInstance;
    }

    public unbindObject(instance: T): void {
        if (instance != null && Object.hasProperty<OnBindChangedEvent<T>>(instance, "__propertiesChanged__")) {
            instance.__propertiesChanged__.removeEvent(this.onPropertyChanged, this);
        }
    }

    public onPropertyChanged(data: T, key: PropertyKey, value: any): void {
        let eventList = this.propertiesMap.get(key);
        if (eventList == null) return;
        for (let action of eventList)
            action(data, value);
    }
}