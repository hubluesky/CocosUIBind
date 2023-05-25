import SerializeManager from "./SerializeManager";

/** 由于Typescript的bug，要序列化的对象必须继承一个对象才能被正常创建，好像Typescritp 3.9版本就解决此问题 */
export default abstract class Serializable {
    /** 在被序列化成数据之前回调 */
    public onSerialize?(): void;
    /** 在数据被序列化成对象之后回调 */
    public onDeserialize?(): void;
}

/**
 * 序列化对象，该对象不能使用构造函数。
 * @param uniqueName 唯一名字（只在全局存档的时候需要）
 * @param parentType 父类型（可序列化的对象）
 */
export function serializeClass(uniqueName?: string, parentType?: Function): Function {
    return function (target: any) {
        const type = target.prototype.constructor;
        if (!Serializable.isPrototypeOf(type)) throw new Error(`Serializable class must a Serializable. ${target}`);
        SerializeManager.registerSerializeType(uniqueName, target, parentType);
    }
}

/**
 * 序列化属性，不支持property属性，支持数据类型有：boolean,number,bigint,string,Array,Serializable类型。枚举即为number类型。Array不支持多态。
 * @param serializeName 序列化名字，即属性别名
 * @param type 属性类型，实例化可以不用填。
 */
export function serializeField(serializeName?: string, fieldType?: Function) {
    return function (target: Object, propertyName: string) {
        if (!Serializable.isPrototypeOf(target.constructor)) throw new Error(`Serializable field of class must a Serializable. ${target.constructor.name}`);
        SerializeManager.registerField(target, propertyName, serializeName, fieldType);
    }
}