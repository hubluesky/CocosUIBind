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
        this.initBindObject();
    }

    onEnable(): void {
        if (this.bindList == null) return;
        for (let bind of this.bindList) {
            if (bind.bindTarget == null) continue;
            bind.event.bindObject(bind.bindTarget);
        }
        this.initAllBindObjectProtopertes();
    }

    start(): void {
        if (this.bindList == null) return;
        this.initAllBindObjectProtopertes();
    }

    onDisable(): void {
        if (this.bindList == null) return;
        for (let bind of this.bindList) {
            if (bind.bindTarget == null) continue;
            bind.event.unbindObject(bind.bindTarget);
        }
    }

    private initBindObject(): void {
        let bindObject = BindUIManager.getBindUIObject(this.constructor);
        if (bindObject == null) return;
        this.bindList = [];
        bindObject.foreachBind(this.initBinds.bind(this));
    }

    private initAllBindObjectProtopertes(): void {
        for (let bindTarget of this.bindList) {
            if (bindTarget.bindTarget == null) continue;
            this.initBindObjectProperties(bindTarget);
        }
    }

    private initBindObjectProperties(bindTarget: BindTarget<any>): void {
        for (let propertyName of bindTarget.propertiesName) {
            bindTarget.event.onPropertyChanged(bindTarget.bindTarget, propertyName, bindTarget.bindTarget[propertyName]);
        }
    }

    private initBinds<T>(propertyList: BindUIProperty[], classType: Function): void {
        let bindTarget: BindTarget<T> = { event: new BindEvent<T>(), classType: classType, propertiesName: [] };
        for (let property of propertyList) {
            let uiPropertyValue = this[property.uiPropertyName];
            let propertyChanged = property.onPropertyChanged || (property.isArray ? BindUIHandlerManager.getUIArrayHandler(uiPropertyValue, property.dataPropertyName) : BindUIHandlerManager.getUIHandler(uiPropertyValue));
            bindTarget.propertiesName.push(property.dataPropertyName);
            bindTarget.event.addPropertyChanged(<any>property.dataPropertyName, (data, value) => {
                propertyChanged(this, uiPropertyValue, data, value);
            });
        }
        this.bindList.push(bindTarget);
    }

    public addBindObject<T extends Object>(instance: T): void {
        let target = this.bindList?.find(v => v.classType == instance.constructor);
        if (target == null)
            return console.warn(`BindObject failed! ${this.constructor.name} has not bind target ${instance.constructor.name}`);
        if (target.bindTarget != null)
            target.event.unbindObject(target.bindTarget);
        target.bindTarget = instance;
        if (this.enabledInHierarchy) {
            target.event.bindObject(instance);
            this.initBindObjectProperties(target);
        }
    }

    public removeUnbindObject<T extends Object>(instance: T): void {
        let target = this.bindList?.find(v => v.classType == instance.constructor);
        if (target == null)
            return console.warn(`BindObject failed! ${this.constructor.name} has not bind target ${instance.constructor.name}`);
        target.event.unbindObject(instance);
        target.bindTarget = null;
    }

    public clearBindObjects(): void {
        if (this.bindList == null) return;
        for (let bind of this.bindList) {
            if (bind.bindTarget == null) continue;
            bind.event.unbindObject(bind.bindTarget);
            bind.bindTarget = null;
        }
    }
}