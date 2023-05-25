import SaveManager from "../Storage/SaveManager";
import SerializeManager from "../Storage/SerializeManager";

/**
 * 要实现此接口必须是一个全局的数据对象。即对象是从ModelManager.GetModel()函数中取出的。
 */
export interface IModelInitalizer {
    /** 第一次创建的时间回调，其它时候是反序列化的时候回调 */
    onConstructor?();
    /** 加载存档后，全局序列化的对象的此函数会被回调，不能在此函数里调用其它Model对象 */
    initialize?(): void;
}

export default class ModelManager {
    private static modelMap = new Map<Function, any>();

    public static initialize(): void {
        SerializeManager.foreachSerializeType((uniqueName, classType: any) => {
            if (String.isEmptyOrNull(uniqueName)) return;
            let model: IModelInitalizer = ModelManager.getModel(classType);
            if (model.initialize)
                model.initialize();
        });
    }

    public static getModel<T>(type: { prototype: T, new(); }): T {
        let model = ModelManager.modelMap.get(type);
        if (model == null) {
            if (SerializeManager.checkSerializeType(type)) {
                let key = SerializeManager.getUniqueName(type);
                let jsonModel = SaveManager.getJsonObject(key);
                model = jsonModel == null ? ModelManager.createModel(type) : ModelManager.create(type, jsonModel);
                SaveManager.setSaveObject(key, model);
            } else {
                model = ModelManager.createModel(type);
            }
            ModelManager.modelMap.set(type, model);
        }
        return model;
    }

    public static replaceModel<T>(type: { prototype: T, new(); }, instance: T): void {
        this.modelMap.set(type, instance);
    }

    public static createModel<T>(type: { new(): T; }): T {
        let model = new type();
        let init: IModelInitalizer = model;
        if (init.onConstructor)
            init.onConstructor();
        return model;
    }

    private static create<T>(type: { prototype: T, new(); }, jsonModel: Object): T {
        let instance = new type();
        return SerializeManager.deserialize(jsonModel, instance);
    }

    public static createInstance<T>(prototype: Object): T {
        let newInstance: T = Object.create(prototype);
        return newInstance.constructor.apply(newInstance);
    }
}