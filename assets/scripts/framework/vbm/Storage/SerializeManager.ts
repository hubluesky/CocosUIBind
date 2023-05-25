import { Action } from "framework/utility/ActionEvent";
import Serializable from "./Serializable";

type Type = Function;

interface PropertyData {
    propertyType: any;
    propertyName: string;
    serializeName: string;
}

interface TypeData {
    uniqueName: string;
    parentType: Type;
    propertyDatas: PropertyData[];
}

export default class SerializeManager {
    private static objectMap = new Map<Type, TypeData>();

    public static registerSerializeType(uniqueName: string, classType: Type, parentType?: Type): void {
        let typeData = SerializeManager.getTypeData(classType);
        typeData.uniqueName = uniqueName;
        typeData.parentType = parentType;
    }

    public static registerField(target: Object, propertyName: string, serializeName: string, fieldType: Type): void {
        let classType = target.constructor;
        let typeData = SerializeManager.getTypeData(classType);
        let propertyReflectList = typeData.propertyDatas;
        if (propertyReflectList.find((x) => x.propertyName == propertyName) != null)
            throw new Error(`Repeat registration property: classType: ${classType} ${propertyName} serializeName: ${serializeName} fieldType:${fieldType}`);
        propertyReflectList.push({ propertyType: fieldType, propertyName: propertyName, serializeName: serializeName });
    }

    public static getUniqueName(classType: Type): string {
        let typeData = SerializeManager.objectMap.get(classType);
        if (typeData != null) return typeData.uniqueName;
    }

    private static getTypeData(classType: Type): TypeData {
        let typeData = SerializeManager.objectMap.get(classType);
        if (typeData == null) {
            typeData = { uniqueName: null, parentType: null, propertyDatas: [] };
            SerializeManager.objectMap.set(classType, typeData);
        }
        return typeData;
    }

    public static checkSerializeType(classType: Type): boolean {
        return SerializeManager.objectMap.has(classType);
    }

    public static createInstance<T>(classType: Type): T {
        return classType.apply(Object.create(classType.prototype));
    }

    public static foreachSerializeType(callback: Action<[string, Type, Type]>): void {
        SerializeManager.objectMap.forEach((value, key) => {
            callback(value.uniqueName, key, value.parentType);
        });
    }

    //-----------------------------------------------------------------------------------------------------------------------
    public static serialize(jsonObject: {}, target: Serializable, classType: Type = target.constructor): Object {
        let typeData = SerializeManager.objectMap.get(classType);
        if (typeData == null) return target;
        if (target.onSerialize) target.onSerialize();
        if (typeData.parentType != null)
            SerializeManager.serialize(jsonObject, target, typeData.parentType);

        for (let property of typeData.propertyDatas) {
            let propertyObject = target[property.propertyName];
            if (propertyObject == null) continue;
            let keyName = property.serializeName || property.propertyName;
            let isSerialzable: boolean = typeof property.propertyType === `object` || typeof propertyObject === `object`;
            property.propertyType = property.propertyType || propertyObject.constructor;
            if (isSerialzable && !SerializeManager.checkSerializeType(property.propertyType) && !Array.isArray(propertyObject))
                console.error(`The ${target.constructor.name} filed ${keyName} is a object, but it is not serializable.`);
            isSerialzable = isSerialzable && SerializeManager.checkSerializeType(property.propertyType);
            if (Array.isArray(propertyObject)) {
                jsonObject[keyName] = Array.from(propertyObject, (element) => (isSerialzable && element != null) ? SerializeManager.serialize({}, element) : element);
            } else {
                jsonObject[keyName] = isSerialzable ? SerializeManager.serialize({}, propertyObject) : propertyObject;
            }
        }

        return jsonObject;
    }

    public static deserialize<T extends Serializable>(jsonObject: Object, target: T, classType: Type = target.constructor): T {
        let typeData = SerializeManager.objectMap.get(classType);
        if (typeData == null) return target;
        if (typeData.parentType != null)
            SerializeManager.deserialize(jsonObject, target, typeData.parentType);

        for (let property of typeData.propertyDatas) {
            let keyName = property.serializeName || property.propertyName;
            let propertyObject = jsonObject[keyName];
            if (propertyObject == null) continue;

            let isSerialzable: boolean = typeof property.propertyType === `object` || typeof propertyObject === `object`;
            property.propertyType = property.propertyType || propertyObject.constructor;
            isSerialzable = isSerialzable && SerializeManager.checkSerializeType(property.propertyType);
            if (Array.isArray(propertyObject)) {
                target[property.propertyName] = Array.from(propertyObject, (element) =>
                    (isSerialzable && element != null) ? SerializeManager.deserialize(element, SerializeManager.createInstance(property.propertyType)) : element);
            } else {
                target[property.propertyName] = isSerialzable ? SerializeManager.deserialize(propertyObject, SerializeManager.createInstance(property.propertyType)) : propertyObject;
            }
        }
        if (target.onDeserialize) target.onDeserialize();
        return target;
    }
}