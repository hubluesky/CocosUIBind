import { Action } from "common/utility/ActionEvent";
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

    public static RegisterSerializeType(uniqueName: string, classType: Type, parentType?: Type): void {
        let typeData = SerializeManager.GetTypeData(classType);
        typeData.uniqueName = uniqueName;
        typeData.parentType = parentType;
    }

    public static RegisterField(target: Object, propertyName: string, serializeName: string, fieldType: Type): void {
        let classType = target.constructor;
        let typeData = SerializeManager.GetTypeData(classType);
        let propertyReflectList = typeData.propertyDatas;
        if (propertyReflectList.find((x) => x.propertyName == propertyName) != null)
            throw new Error(`Repeat registration property: classType: ${classType} ${propertyName} serializeName: ${serializeName} fieldType:${fieldType}`);
        propertyReflectList.push({ propertyType: fieldType, propertyName: propertyName, serializeName: serializeName });
    }

    public static GetUniqueName(classType: Type): string {
        let typeData = SerializeManager.objectMap.get(classType);
        if (typeData != null) return typeData.uniqueName;
    }

    private static GetTypeData(classType: Type): TypeData {
        let typeData = SerializeManager.objectMap.get(classType);
        if (typeData == null) {
            typeData = { uniqueName: null, parentType: null, propertyDatas: [] };
            SerializeManager.objectMap.set(classType, typeData);
        }
        return typeData;
    }

    public static CheckSerializeType(classType: Type): boolean {
        return SerializeManager.objectMap.has(classType);
    }

    public static CreateInstance<T>(classType: Type): T {
        return classType.apply(Object.create(classType.prototype));
    }

    public static ForeachSerializeType(callback: Action<[string, Type, Type]>): void {
        SerializeManager.objectMap.forEach((value, key) => {
            callback(value.uniqueName, key, value.parentType);
        });
    }

    //-----------------------------------------------------------------------------------------------------------------------
    public static Serialize(jsonObject: {}, target: Serializable, classType: Type = target.constructor): Object {
        let typeData = SerializeManager.objectMap.get(classType);
        if (typeData == null) return target;
        if (target.OnSerialize) target.OnSerialize();
        if (typeData.parentType != null)
            SerializeManager.Serialize(jsonObject, target, typeData.parentType);

        for (let property of typeData.propertyDatas) {
            let propertyObject = target[property.propertyName];
            if (propertyObject == null) continue;
            let keyName = property.serializeName || property.propertyName;
            let isSerialzable: boolean = typeof property.propertyType === `object` || typeof propertyObject === `object`;
            property.propertyType = property.propertyType || propertyObject.constructor;
            if (isSerialzable && !SerializeManager.CheckSerializeType(property.propertyType) && !Array.isArray(propertyObject))
                console.error(`The ${target.constructor.name} filed ${keyName} is a object, but it is not serializable.`);
            isSerialzable = isSerialzable && SerializeManager.CheckSerializeType(property.propertyType);
            if (Array.isArray(propertyObject)) {
                jsonObject[keyName] = Array.from(propertyObject, (element) => (isSerialzable && element != null) ? SerializeManager.Serialize({}, element) : element);
            } else {
                jsonObject[keyName] = isSerialzable ? SerializeManager.Serialize({}, propertyObject) : propertyObject;
            }
        }

        return jsonObject;
    }

    public static Deserialize<T extends Serializable>(jsonObject: Object, target: T, classType: Type = target.constructor): T {
        let typeData = SerializeManager.objectMap.get(classType);
        if (typeData == null) return target;
        if (typeData.parentType != null)
            SerializeManager.Deserialize(jsonObject, target, typeData.parentType);

        for (let property of typeData.propertyDatas) {
            let keyName = property.serializeName || property.propertyName;
            let propertyObject = jsonObject[keyName];
            if (propertyObject == null) continue;

            let isSerialzable: boolean = typeof property.propertyType === `object` || typeof propertyObject === `object`;
            property.propertyType = property.propertyType || propertyObject.constructor;
            isSerialzable = isSerialzable && SerializeManager.CheckSerializeType(property.propertyType);
            if (Array.isArray(propertyObject)) {
                target[property.propertyName] = Array.from(propertyObject, (element) =>
                    (isSerialzable && element != null) ? SerializeManager.Deserialize(element, SerializeManager.CreateInstance(property.propertyType)) : element);
            } else {
                target[property.propertyName] = isSerialzable ? SerializeManager.Deserialize(propertyObject, SerializeManager.CreateInstance(property.propertyType)) : propertyObject;
            }
        }
        if (target.OnDeserialize) target.OnDeserialize();
        return target;
    }
}