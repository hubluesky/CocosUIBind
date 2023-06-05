import BindUIComponent from "./BindUIComponent";
import { BindArrayEventType } from "./RegisterBindObject";

export interface PropertyChanged<U, D, UP = U[ObjectProperties<U>], DP = D[ObjectProperties<D>]> {
    (ui: U, uiProperty: UP, data: D, dataProperty: DP): void;
}

export interface ArrayElementChanged<U, D, UP = U[ObjectProperties<U>], E = ArrayElement<D>> {
    (ui: U, uiProperty: UP, array: D, eventType: BindArrayEventType, key: PropertyKey, value: E, oldValue: E): void;
}

/**
 * 绑定UI属性
 * @param classType 绑定数据对象类型
 * @param propertyName 绑定数据对象属性
 * @param onPropertyChanged 自处理属性回调处理
 */
export function bindUIField<U extends BindUIComponent, UP extends ObjectProperties<U>, T extends AnyConstructor<Object>, I extends InstanceType<T>, P extends ObjectProperties<I>>
    (classType: T, propertyName: P, onPropertyChanged?: PropertyChanged<U, I, U[UP], I[P]>) {
    return function (target: U, uiPropertyName: UP) {
        if (!BindUIComponent.isPrototypeOf(target.constructor)) throw new Error(`Bind field in class must a UIComponent. ${target.constructor}`);
        if (classType == null) throw new Error(`Bind ${propertyName?.toString()} field faile, class type is null, Does the classType object and the target object refer to each other?`);
        BindUIManager.addField(target.constructor as AnyConstructor<U>, uiPropertyName, false, classType.prototype.constructor, propertyName, onPropertyChanged);
    };
}

export function bindUIArrayField<U extends BindUIComponent, UP extends ObjectProperties<U>, T extends AnyConstructor, I extends InstanceType<T>, P extends ObjectProperties<I>>
    (classType: T, propertyName: P, onPropertyChanged?: ArrayElementChanged<U, I[P], U[UP]>) {
    return function (target: U, uiPropertyName: UP) {
        if (!BindUIComponent.isPrototypeOf(target.constructor)) throw new Error(`Bind field in class must a UIComponent. ${target.constructor}`);
        if (classType == null) throw new Error(`Bind ${propertyName?.toString()} field faile, class type is null, Does the classType object and the target object refer to each other?`);
        BindUIManager.addField(target.constructor as AnyConstructor<U>, uiPropertyName, true, classType.prototype.constructor, propertyName, onPropertyChanged);
    };
}

/**
 * UI的绑定属性数据记录。类似：{@link PropertyDescriptor}
 */
export interface BindUIPropertyDesc<U extends BindUIComponent, D> {
    uiPropertyName: U[ObjectProperties<U>];
    isArray: boolean;
    dataPropertyName: D[ObjectProperties<D>];
    onPropertyChanged?: PropertyChanged<U, D> | ArrayElementChanged<U, D[ObjectProperties<D>]>;
}

/**
 * 记录UI绑定属性所属的对象。
 */
export class BindUIObjectDesc<DC extends AnyConstructor = AnyConstructor> {
    private readonly bindPropertiesMap = new Map<DC, BindUIPropertyDesc<any, any>[]>();

    protected getPropertyDescList<UI extends BindUIComponent>(dataType: DC): BindUIPropertyDesc<UI, InstanceType<DC>>[] {
        let propertyList = this.bindPropertiesMap.get(dataType);
        if (propertyList == null) {
            propertyList = [];
            this.bindPropertiesMap.set(dataType, propertyList);
        }
        return propertyList;
    }

    public addPropertyDesc<UI extends BindUIComponent>(dataType: DC, desc: BindUIPropertyDesc<UI, InstanceType<DC>>): void {
        const propertyList = this.getPropertyDescList<UI>(dataType);
        propertyList.push(desc);
    }

    public foreachProperties<UI extends BindUIComponent>(callbackfn: (value: BindUIPropertyDesc<UI, InstanceType<DC>>[], dataType: DC) => void, thisArg?: any): void {
        this.bindPropertiesMap.forEach(callbackfn, thisArg);
    }
}

/**
 * UI绑定管理器
 * 记录用户绑定UI对象的属性描述。就类似{@link PropertyDescriptor}.
 */
export default class BindUIManager {
    private static bindMap = new Map<AnyConstructor, BindUIObjectDesc>();

    /**
     * 添加UI属性绑定描述
     * @param uiType UI对象类型
     * @param uiPropertyName UI绑定的对象属性名
     * @param isArray 该属性是不是一个数组
     * @param dataType 绑定对象类型
     * @param dataPropertyName 绑定对象属性名称
     * @param onPropertyChanged 属性修改回调函数
     */
    public static addField<UC extends AnyConstructor, UI extends InstanceType<UC>, UP extends ObjectProperties<UI>, DC extends AnyConstructor, DI extends InstanceType<DC>, DP extends ObjectProperties<DI>>
        (uiType: UC, uiPropertyName: UP, isArray: boolean, dataType: DC, dataPropertyName: DP, onPropertyChanged?: PropertyChanged<UI, DI> | ArrayElementChanged<UI, DP>): void {
        let bindUIObject = BindUIManager.bindMap.get(uiType);
        if (bindUIObject == null) {
            bindUIObject = new BindUIObjectDesc();
            BindUIManager.bindMap.set(uiType, bindUIObject);
        }

        bindUIObject.addPropertyDesc(dataType, { uiPropertyName, isArray, dataPropertyName, onPropertyChanged });
    }

    /**
     * 获得UI绑定对象描述
     * @param uiType 绑定的对象类型
     * @returns UI绑定对象描述
     */
    public static getBindUIObjectDesc<UC extends AnyConstructor<BindUIComponent>>(uiType: UC): BindUIObjectDesc {
        return BindUIManager.bindMap.get(uiType);
    }
}