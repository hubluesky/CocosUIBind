import { BindBaseEvent } from "./BindBaseEvent";
import { makeBindDataProxy } from "./RegisterBindObject";

interface PropertyChanged<T, P extends ObjectProperties<T>> {
    (data: T, value: T[P]): void;
}

/**
 * 绑定对象事件，
 */
export default class BindObjectEvent<T> extends BindBaseEvent<T>{
    protected readonly propertiesMap = new Map<PropertyKey, PropertyChanged<T, any>[]>();

    public addPropertyChanged<P extends ObjectProperties<T>>(property: P, onPropertyChanged: PropertyChanged<T, P>): boolean {
        let eventList = this.propertiesMap.get(property);
        if (eventList == null) {
            eventList = [];
            this.propertiesMap.set(property, eventList);
        } else if (eventList.contains(onPropertyChanged)) {
            return false;
        }
        return !!eventList.push(onPropertyChanged);
    }

    public removePropertyChanged<P extends ObjectProperties<T>>(property: P, onPropertyChanged: PropertyChanged<T, P>): boolean {
        let eventList = this.propertiesMap.get(property);
        if (eventList == null) return false;
        return eventList.remove(onPropertyChanged) != null;
    }

    protected makeBindProxy(instance: T) {
        return makeBindDataProxy(instance);
    }

    public onEventChanged<P extends ObjectProperties<T>>(data: T, property: P, value: T[P]): void {
        let eventList = this.propertiesMap.get(property);
        if (eventList == null) return;
        for (let action of eventList)
            action(data, value);
    }
}