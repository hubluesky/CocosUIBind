import { Component } from "cc";
import BindObjectEvent from "./BindObjectEvent";
import BindUIHandlerManager from "./BindUIHandlerManager";
import BindUIManager, { BindUIPropertyDesc } from "./BindUIManager";

interface BindTarget<T> {
    event: BindObjectEvent<T>;
    classType: Function;
    bindTarget?: T;
    propertiesName: PropertyKey[];
}

/**
 * 绑定UI组件，是所有UI的基类。
 */
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

    /** 初始化绑定对象 */
    private initBindObject(): void {
        let bindObject = BindUIManager.getBindUIObjectDesc(this.constructor);
        if (bindObject == null) return;
        this.bindList = [];
        bindObject.foreachProperties(this.initPropertiesChanged, this);
    }

    /** 初始化绑定对象的所有属性 */
    private initAllBindObjectProtopertes(): void {
        for (let bindTarget of this.bindList) {
            if (bindTarget.bindTarget == null) continue;
            this.initPropertyValues(bindTarget);
        }
    }

    /** 初始化所有绑定属性值，通知属性修改回调。 */
    private initPropertyValues(bindTarget: BindTarget<any>): void {
        for (let propertyName of bindTarget.propertiesName) {
            bindTarget.event.onPropertyChanged(bindTarget.bindTarget, propertyName, bindTarget.bindTarget[propertyName]);
        }
    }

    private initPropertiesChanged<T>(propertiesDesc: BindUIPropertyDesc[], classType: Function): void {
        let bindTarget: BindTarget<T> = { event: new BindObjectEvent<T>(), classType: classType, propertiesName: [] };
        for (let property of propertiesDesc) {
            const uiPropertyValue = this[property.uiPropertyName];
            const propertyChanged = property.isArray ? BindUIHandlerManager.getUIArrayHandler(uiPropertyValue, property.dataPropertyName, property.onPropertyChanged) : (property.onPropertyChanged ?? BindUIHandlerManager.getUIHandler(uiPropertyValue));

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
            this.initPropertyValues(target);
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