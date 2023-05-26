import { Action } from "framework/utility/ActionEvent";
import { BindEvent, makeBindDataProxy } from "./BindBaseEvent";

/**
 * 绑定对象事件，
 */
export default class BindObjectEvent<T> extends BindEvent<T>{
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

    protected makeBindProxy(instance: T) {
        return makeBindDataProxy(instance);
    }

    protected onPropertyChanged(data: T, key: PropertyKey, value: any): void {
        let eventList = this.propertiesMap.get(key);
        if (eventList == null) return;
        for (let action of eventList)
            action(data, value);
    }
}