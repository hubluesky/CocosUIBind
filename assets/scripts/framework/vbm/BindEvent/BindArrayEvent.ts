import { BindBaseEvent } from "./BindBaseEvent";
import { BindArrayEventType, makeBindArrayProxy } from "./RegisterBindObject";

interface ElementChanged<T> {
    (array: T[], eventType: BindArrayEventType, key: PropertyKey, value: T, oldValue: T): void;
}

export default class BindArrayEvent<T> extends BindBaseEvent<T[]>{
    protected readonly eventList: ElementChanged<T>[] = [];

    public addElementChanged(onPropertyChanged: ElementChanged<T>): boolean {
        if (this.eventList.contains(onPropertyChanged))
            return false;
        return !!this.eventList.push(onPropertyChanged);
    }

    public removeElementChanged(onPropertyChanged: ElementChanged<T>): boolean {
        return this.eventList.remove(onPropertyChanged) != null;
    }

    protected makeBindProxy(instance: T[]) {
        return makeBindArrayProxy(instance, true);
    }

    public onEventChanged(array: T[], eventType: BindArrayEventType, key: PropertyKey, value: T, oldValue: T): void {
        for (const action of this.eventList)
            action(array, eventType, key, value, oldValue);
    }
}