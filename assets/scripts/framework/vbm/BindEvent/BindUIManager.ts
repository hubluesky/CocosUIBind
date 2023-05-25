import { Action } from "framework/utility/ActionEvent";
import BindUIComponent from "./BindUIComponent";

type Type = Function;

/**
 * 绑定UI属性
 * @param classType 绑定数据对象类型
 * @param propertyName 绑定数据对象属性
 * @param onPropertyChanged 自处理属性回调处理
 */
export function bindUIField<T extends AnyConstructor>(classType: T, propertyName: ObjectProperties<InstanceType<T>>, onPropertyChanged?: Action<[BindUIComponent, any, InstanceType<T>, any]>) {
    return function (target: Object, uiPropertyName: PropertyKey) {
        if (!BindUIComponent.isPrototypeOf(target.constructor)) throw new Error(`Bind field in class must a UIComponent. ${target.constructor}`);
        if (classType == null) throw new Error(`Bind ${propertyName?.toString()} field faile, class type is null, Does the classType object and the target object refer to each other?`);
        BindUIManager.addField<T>(target.constructor, uiPropertyName, false, classType.prototype.constructor, propertyName, onPropertyChanged);
    };
}

export function bindUIArrayField<T extends AnyConstructor>(classType: T, propertyName: ObjectProperties<InstanceType<T>>, onPropertyChanged?: Action<[BindUIComponent, any, InstanceType<T>, any]>) {
    return function (target: Object, uiPropertyName: PropertyKey) {
        if (!BindUIComponent.isPrototypeOf(target.constructor)) throw new Error(`Bind field in class must a UIComponent. ${target.constructor}`);
        if (classType == null) throw new Error(`Bind ${propertyName?.toString()} field faile, class type is null, Does the classType object and the target object refer to each other?`);
        BindUIManager.addField<T>(target.constructor, uiPropertyName, true, classType.prototype.constructor, propertyName, onPropertyChanged);
    };
}

/**
 * UI的绑定属性数据记录。类似：{@link PropertyDescriptor}
 */
export interface BindUIPropertyDesc {
    uiPropertyName: PropertyKey;
    isArray: boolean;
    dataPropertyName: PropertyKey;
    onPropertyChanged?: Action<[BindUIComponent, any, any, any]>;
}

/**
 * 记录UI绑定属性所属的对象。
 */
export class BindUIObjectDesc {
    private readonly bindPropertiesMap = new Map<Type, BindUIPropertyDesc[]>();

    protected getPropertyDescList<T extends AnyConstructor>(classType: T): BindUIPropertyDesc[] {
        let propertyList = this.bindPropertiesMap.get(classType);
        if (propertyList == null) {
            propertyList = [];
            this.bindPropertiesMap.set(classType, propertyList);
        }
        return propertyList;
    }

    public addPropertyDesc<T extends AnyConstructor>(classType: T, desc: BindUIPropertyDesc): void {
        const propertyList = this.getPropertyDescList(classType);
        propertyList.push(desc);
    }

    public foreachProperties(callbackfn: (value: BindUIPropertyDesc[], key: Type, map: Map<Type, BindUIPropertyDesc[]>) => void, thisArg?: any): void {
        this.bindPropertiesMap.forEach(callbackfn, thisArg);
    }
}

/**
 * UI绑定管理器
 * 记录用户绑定UI对象的属性描述。就类似{@link PropertyDescriptor}.
 */
export default class BindUIManager {
    private static bindMap = new Map<Type, BindUIObjectDesc>();

    /**
     * 添加UI属性绑定描述
     * @param uiClassType UI对象类型
     * @param uiPropertyName UI绑定的对象属性名
     * @param isArray 该属性是不是一个数组
     * @param dataType 绑定对象类型
     * @param dataPropertyName 绑定对象属性名称
     * @param onPropertyChanged 属性修改回调函数
     */
    public static addField<T extends AnyConstructor>(uiClassType: Type, uiPropertyName: PropertyKey, isArray: boolean, dataType: T, dataPropertyName: ObjectProperties<InstanceType<T>>, onPropertyChanged?: Action<[BindUIComponent, any, InstanceType<T>, any]>): void {
        let bindUIObject = BindUIManager.bindMap.get(uiClassType);
        if (bindUIObject == null) {
            bindUIObject = new BindUIObjectDesc();
            BindUIManager.bindMap.set(uiClassType, bindUIObject);
        }

        bindUIObject.addPropertyDesc(dataType, { uiPropertyName, isArray, dataPropertyName, onPropertyChanged });
    }

    /**
     * 获得UI绑定对象描述
     * @param classType 绑定的对象类型
     * @returns UI绑定对象描述
     */
    public static getBindUIObjectDesc(classType: Type): BindUIObjectDesc {
        return BindUIManager.bindMap.get(classType);
    }
}