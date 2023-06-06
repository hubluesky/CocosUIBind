import { Component } from "cc";
import BindObjectEvent from "./BindObjectEvent";
import BindUIHandlerManager from "./BindUIHandlerManager";
import BindUIManager, { ArrayElementChanged, BindUIPropertyDesc, PropertyChanged } from "./BindUIManager";

interface BindTarget<T> {
    event: BindObjectEvent<T>;
    dataType: AnyConstructor<T>;
    // TODO remove
    bindTarget?: T;
    propertiesName: ObjectProperties<T>[];
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
            bind.event.unbindObject();
        }
    }

    /** 初始化绑定对象 */
    private initBindObject(): void {
        let bindObject = BindUIManager.getBindUIObjectDesc(this.constructor as AnyConstructor<BindUIComponent>);
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
    private initPropertyValues<T>(bindTarget: BindTarget<T>): void {
        for (let propertyName of bindTarget.propertiesName) {
            bindTarget.event.onEventChanged(bindTarget.bindTarget, propertyName, bindTarget.bindTarget[propertyName]);
        }
    }

    private initPropertiesChanged<DC extends AnyConstructor, DI extends InstanceType<DC>>(propertiesDesc: BindUIPropertyDesc<BindUIComponent, DI>[], dataType: DC): void {
        let bindTarget: BindTarget<DI> = { event: new BindObjectEvent<DI>(), dataType: dataType, propertiesName: [] };
        for (let propertyDesc of propertiesDesc) {
            const uiPropertyValue = this[propertyDesc.uiPropertyName as any];
            const propertyChanged = propertyDesc.isArray ? BindUIHandlerManager.getUIArrayHandler<BindUIComponent, DI>(this, uiPropertyValue, propertyDesc.dataPropertyName, propertyDesc.onPropertyChanged as ArrayElementChanged<BindUIComponent, any>)
                : (propertyDesc.onPropertyChanged as PropertyChanged<BindUIComponent, DI> ?? BindUIHandlerManager.getUIHandler(uiPropertyValue));

            bindTarget.propertiesName.push(propertyDesc.dataPropertyName);
            bindTarget.event.addPropertyChanged(propertyDesc.dataPropertyName, (data, value) => {
                propertyChanged(this, uiPropertyValue, data, value);
            });
        }
        this.bindList.push(bindTarget);
    }

    public addBindObject<T extends Object>(instance: T): void {
        let target = this.bindList?.find(v => v.dataType == instance.constructor);
        if (target == null)
            return console.warn(`BindObject failed! ${this.constructor.name} has not bind target ${instance.constructor.name}`);
        if (target.bindTarget != null)
            target.event.unbindObject();
        target.bindTarget = instance;
        if (this.enabledInHierarchy) {
            target.event.bindObject(instance);
            this.initPropertyValues(target);
        }
    }

    public removeBindObject<T extends Object>(instance: T): void {
        let target = this.bindList?.find(v => v.dataType == instance.constructor);
        if (target == null)
            return console.warn(`BindObject failed! ${this.constructor.name} has not bind target ${instance.constructor.name}`);
        target.event.unbindObject();
        target.bindTarget = null;
    }

    public clearBindObjects(): void {
        if (this.bindList == null) return;
        for (let bind of this.bindList) {
            if (bind.bindTarget == null) continue;
            bind.event.unbindObject();
            bind.bindTarget = null;
        }
    }
}