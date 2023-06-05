import ActionEvent from "framework/utility/ActionEvent";
import { BaseChangedEvent } from "./RegisterBindObject";

export abstract class BindBaseEvent<T> {
    public readonly onBindEvent = new ActionEvent<[T, T]>();
    public readonly onUnbindEvent = new ActionEvent<[T]>();

    private _bindSource: T;
    public get bindSource() { return this._bindSource; }

    public bindObject(instance: Readonly<T>): T {
        this.unbindObject();
        const newInstance = this.makeBindProxy(instance);
        newInstance.__bindChangedEvent__.addEvent(this.onEventChanged, this);
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
            instance.__bindChangedEvent__.removeEvent(this.onEventChanged, this);
        }
    }

    protected abstract makeBindProxy(instance: T): T & BaseChangedEvent;

    public abstract onEventChanged(...args: any[]): void;
}