import SaveManager from "../Storage/SaveManager";
import SerializeManager from "../Storage/SerializeManager";

/**
 * 要实现此接口必须是一个全局的数据对象。即对象是从ModelManager.GetModel()函数中取出的。
 */
export interface IModelInitalizer {
    /** 第一次创建的时间回调，其它时候是反序列化的时候回调 */
    OnConstructor?();
    /** 加载存档后，全局序列化的对象的此函数会被回调，不能在此函数里调用其它Model对象 */
    Initialize?(): void;
}

export default class ModelManager {
    private static modelMap = new Map<Function, any>();

    public static GetModel<T>(type: { prototype: T, new() }): T {
        let model = ModelManager.modelMap.get(type);
        if (model == null) {
            if (SerializeManager.CheckSerializeType(type)) {
                let key = SerializeManager.GetUniqueName(type);
                let jsonModel = SaveManager.GetJsonObject(key);
                model = jsonModel == null ? ModelManager.CreateModel(type) : ModelManager.Create(type, jsonModel);
                SaveManager.SetSaveObject(key, model);
            } else {
                model = ModelManager.CreateModel(type);
            }
            ModelManager.modelMap.set(type, model);
        }
        return model;
    }

    public static InitModels(): void {
        SerializeManager.ForeachSerializeType((uniqueName, classType: any) => {
            if (String.isEmptyOrNull(uniqueName)) return;
            let model: IModelInitalizer = ModelManager.GetModel(classType);
            if (model.Initialize)
                model.Initialize();
        });
    }

    public static ReplaceModel<T>(type: { prototype: T, new() }, instance: T): void {
        this.modelMap.set(type, instance);
    }

    public static CreateModel<T>(type: { new(): T }): T {
        let model = new type();
        let init: IModelInitalizer = model;
        if (init.OnConstructor)
            init.OnConstructor();
        return model;
    }

    private static Create<T>(type: { prototype: T, new() }, jsonModel: Object): T {
        let instance = new type();
        return SerializeManager.Deserialize(jsonModel, instance);
    }

    public static CreateInstance<T>(prototype: Object): T {
        let newInstance: T = Object.create(prototype);
        return newInstance.constructor.apply(newInstance);
    }
}