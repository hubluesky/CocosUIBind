import { Action } from "framework/utility/ActionEvent";
import { BindArrayEventType, BindEvent, makeBindArrayProxy, OnBindArrayChangedEvent } from "./BindBaseEvent";


export default class BindArrayEvent<T> extends BindEvent<T[]>{
    protected readonly eventList: Action<[T[], BindArrayEventType, PropertyKey, T, T]>[] = [];

    public addArrayChanged(onPropertyChanged: Action<[T[], BindArrayEventType, PropertyKey, T, T]>): boolean {
        if (this.eventList.contains(onPropertyChanged))
            return false;
        return !!this.eventList.push(onPropertyChanged);
    }

    public removeArrayChanged(onPropertyChanged: Action<[T[], BindArrayEventType, PropertyKey, T, T]>): boolean {
        return this.eventList.remove(onPropertyChanged) != null;
    }

    protected makeBindProxy(instance: T[]) {
        return makeBindArrayProxy(instance);
    }

    protected onPropertyChanged(array: T[], eventType: BindArrayEventType, key: PropertyKey, value: T, oldValue: T): void {
        for (const action of this.eventList)
            action(array, eventType, key, value, oldValue);
    }
}