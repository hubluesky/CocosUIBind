import { Component } from "cc";
import BindEvent from "./BindEvent";
import BindUIHandlerManager from "./BindUIHandlerManager";
import BindUIManager, { BindUIProperty } from "./BindUIManager";

interface BindTarget<T> {
    event: BindEvent<T>;
    classType: Function;
    bindTarget?: T;
    propertiesName: PropertyKey[];
}

export default abstract class BindUIComponent extends Component {
    private bindList: BindTarget<any>[];

    onLoad(): void {
        this.InitBindObject();
    }

    onEnable(): void {
        if (this.bindList == null) return;
        for (let bind of this.bindList) {
            if (bind.bindTarget == null) continue;
            bind.event.BindObject(bind.bindTarget);
        }
        this.InitAllBindObjectProtopertes();
    }

    start(): void {
        if (this.bindList == null) return;
        this.InitAllBindObjectProtopertes();
    }

    onDisable(): void {
        if (this.bindList == null) return;
        for (let bind of this.bindList) {
            if (bind.bindTarget == null) continue;
            bind.event.UnbindObject(bind.bindTarget);
        }
    }

    private InitBindObject(): void {
        let bindObject = BindUIManager.GetBindUIObject(this.constructor);
        if (bindObject == null) return;
        this.bindList = [];
        bindObject.ForeachBind(this.InitBinds.bind(this));
    }

    private InitAllBindObjectProtopertes(): void {
        for (let bindTarget of this.bindList) {
            if (bindTarget.bindTarget == null) continue;
            this.InitBindObjectProperties(bindTarget);
        }
    }

    private InitBindObjectProperties(bindTarget: BindTarget<any>): void {
        for (let propertyName of bindTarget.propertiesName) {
            bindTarget.event.OnPropertyChanged(bindTarget.bindTarget, propertyName, bindTarget.bindTarget[propertyName]);
        }
    }

    private InitBinds<T>(propertyList: BindUIProperty[], classType: Function): void {
        let bindTarget: BindTarget<T> = { event: new BindEvent<T>(), classType: classType, propertiesName: [] };
        for (let property of propertyList) {
            let uiPropertyValue = this[property.uiPropertyName];
            let propertyChanged = property.onPropertyChanged || (property.isArray ? BindUIHandlerManager.GetUIArrayHandler(uiPropertyValue, property.dataPropertyName) : BindUIHandlerManager.GetUIHandler(uiPropertyValue));
            bindTarget.propertiesName.push(property.dataPropertyName);
            bindTarget.event.AddPropertyChanged(<any>property.dataPropertyName, (data, value) => {
                propertyChanged(this, uiPropertyValue, data, value);
            });
        }
        this.bindList.push(bindTarget);
    }

    public AddBindObject<T extends Object>(instance: T): void {
        let target = this.bindList?.find(v => v.classType == instance.constructor);
        if (target == null)
            return console.warn(`BindObject failed! ${this.constructor.name} has not bind target ${instance.constructor.name}`);
        if (target.bindTarget != null)
            target.event.UnbindObject(target.bindTarget);
        target.bindTarget = instance;
        if (this.enabledInHierarchy) {
            target.event.BindObject(instance);
            this.InitBindObjectProperties(target);
        }
    }

    public RemoveUnbindObject<T extends Object>(instance: T): void {
        let target = this.bindList?.find(v => v.classType == instance.constructor);
        if (target == null)
            return console.warn(`BindObject failed! ${this.constructor.name} has not bind target ${instance.constructor.name}`);
        target.event.UnbindObject(instance);
        target.bindTarget = null;
    }

    public ClearBindObjects(): void {
        if (this.bindList == null) return;
        for (let bind of this.bindList) {
            if (bind.bindTarget == null) continue;
            bind.event.UnbindObject(bind.bindTarget);
            bind.bindTarget = null;
        }
    }
}