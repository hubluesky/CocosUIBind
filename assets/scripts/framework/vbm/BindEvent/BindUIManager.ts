import { Action } from "framework/utility/ActionEvent";
import BindUIComponent from "./BindUIComponent";

type Type = Function;

/**
 * 绑定UI属性
 * @param classType 绑定数据对象类型
 * @param propertyName 绑定数据对象属性
 * @param onPropertyChanged 自处理属性回调处理
 */
export function BindUIField<T extends AnyConstructor>(classType: T, propertyName: ObjectProperties<InstanceType<T>>, onPropertyChanged?: Action<[BindUIComponent, any, InstanceType<T>, any]>) {
    return function (target: Object, uiPropertyName: PropertyKey) {
        if (!BindUIComponent.isPrototypeOf(target.constructor)) throw new Error(`Bind field in class must a UIComponent. ${target.constructor}`);
        if (classType == null) throw new Error(`Bind ${propertyName?.toString()} field faile, class type is null, Does the classType object and the target object refer to each other?`);
        BindUIManager.AddField<T>(target.constructor, uiPropertyName, false, classType.prototype.constructor, propertyName, onPropertyChanged);
    }
}

export function BindUIArrayField<T extends AnyConstructor>(classType: T, propertyName: ObjectProperties<InstanceType<T>>, onPropertyChanged?: Action<[BindUIComponent, any, InstanceType<T>, any]>) {
    return function (target: Object, uiPropertyName: PropertyKey) {
        if (!BindUIComponent.isPrototypeOf(target.constructor)) throw new Error(`Bind field in class must a UIComponent. ${target.constructor}`);
        if (classType == null) throw new Error(`Bind ${propertyName?.toString()} field faile, class type is null, Does the classType object and the target object refer to each other?`);
        BindUIManager.AddField<T>(target.constructor, uiPropertyName, true, classType.prototype.constructor, propertyName, onPropertyChanged);
    }
}

export interface BindUIProperty {
    uiPropertyName: PropertyKey;
    isArray: boolean;
    dataPropertyName: PropertyKey;
    onPropertyChanged?: Action<[BindUIComponent, any, any, any]>;
}

export class BindUIObject {
    private readonly bindEventMap = new Map<Type, BindUIProperty[]>();

    public GetDataBindList<T extends AnyConstructor>(classType: T): BindUIProperty[] {
        let propertyList = this.bindEventMap.get(classType);
        if (propertyList == null) {
            propertyList = [];
            this.bindEventMap.set(classType, propertyList);
        }
        return propertyList;
    }

    public ForeachBind(callbackfn: (value: BindUIProperty[], key: Type, map: Map<Type, BindUIProperty[]>) => void, thisArg?: any): void {
        this.bindEventMap.forEach(callbackfn, thisArg);
    }
}

export default class BindUIManager {
    private static bindMap = new Map<Type, BindUIObject>();

    public static AddField<T extends AnyConstructor>(uiClassType: Type, uiPropertyName: PropertyKey, isArray: boolean, dataType: T, dataPropertyName: ObjectProperties<InstanceType<T>>, onPropertyChanged?: Action<[BindUIComponent, any, InstanceType<T>, any]>): void {
        let bindUIObject = BindUIManager.bindMap.get(uiClassType);
        if (bindUIObject == null) {
            bindUIObject = new BindUIObject();
            BindUIManager.bindMap.set(uiClassType, bindUIObject);
        }

        let bindEvent = bindUIObject.GetDataBindList(dataType);
        bindEvent.push({ uiPropertyName, isArray, dataPropertyName, onPropertyChanged });
    }

    public static GetBindUIObject(classType: Type): BindUIObject {
        return BindUIManager.bindMap.get(classType);
    }
}