import { game, Game, sys } from "cc";
import ActionEvent from "framework/utility/ActionEvent";
import Serializable from "./Serializable";
import SerializeManager from "./SerializeManager";

export type JsonObject = Object;
export default class SaveManager {
    public static StorageVersion = 1;
    public static readonly saveBeforeEvent = new ActionEvent();
    private static saveJsonObject: { version: number; } = null;
    private static saveObject = new Map<string, Serializable>();
    private static _isLoading: boolean = false;
    public static get isLoading() { return SaveManager._isLoading; }
    private static _isLoadFormSave: boolean = false;
    public static get isLoadFormSave() { return SaveManager._isLoadFormSave; }
    public static get isFirstLoaded() { return !SaveManager._isLoadFormSave; }

    private static storageKey: any;

    public static getJsonObject(key: string): JsonObject {
        return SaveManager.saveJsonObject[key];
    }

    public static setSaveObject(key: string, obj: Serializable): void {
        SaveManager.saveObject.set(key, obj);
    }

    public static serializeSaveObjects(): JsonObject {
        for (let entity of Array.from(SaveManager.saveObject)) {
            let key = entity[0];
            let value = entity[1];
            SaveManager.saveJsonObject[key] = SerializeManager.serialize({}, value);
        }
        return SaveManager.saveJsonObject;
    }

    public static deserializeSaveObjects(jsonObject: {}): void {
        let saveObjectMap = SaveManager.saveObject;
        for (let key of Object.keys(jsonObject)) {
            let serializeObject = saveObjectMap.get(key);
            if (serializeObject != null)
                SerializeManager.deserialize(jsonObject[key], serializeObject);
        }
    }

    public static async initialize(version: number, gameId: string): Promise<void> {
        console.time("SaveManager intialize time");
        SaveManager.storageKey = gameId;
        await SaveManager.load(version, gameId);
        let oldVersion = SaveManager.saveJsonObject.version || 0;
        if (oldVersion < version) {
            console.warn(`The storage version ${SaveManager.saveJsonObject.version} < current version ${version}, And clear old storage!`);
            SaveManager.clear(version);
            SaveManager._isLoadFormSave = false;
        }
        game.on(Game.EVENT_HIDE, SaveManager.save);
        console.timeEnd("SaveManager intialize time");
    }

    public static async load(version: number, gameId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            console.time("GameStorage Download");
            const jsonText = sys.localStorage.getItem(SaveManager.storageKey);
            const jsonObject = jsonText != null ? JSON.parse(jsonText) : { version: version };
            // GameStorage.Download((jsonObject) => {
            //     console.timeEnd("GameStorage Download");
            // if (jsonObject == null) {
            //     jsonObject = ;
            //     SaveManager._isLoadFormSave = false;
            // } else if (jsonObject.version == null) {
            //     jsonObject.version = version;
            //     SaveManager._isLoadFormSave = false;
            // } else {
            //     SaveManager._isLoadFormSave = true;
            // }
            SaveManager.saveJsonObject = jsonObject;
            SaveManager.deserializeSaveObjects(SaveManager.saveJsonObject);
            SaveManager._isLoading = true;
            // console.warn("On load storage", SaveManager.saveJsonObject, SaveManager._isLoadFormSave, jsonObject);
            resolve();
            // }, (jsonObject) => {
            //     console.timeEnd("GameStorage Download");
            //     SaveManager._isLoadFormSave = false;
            //     // console.warn("On load storage faild", jsonObject);
            //     reject();
            // });
        });
    }

    public static async save(localOnly: boolean = false): Promise<void> {
        SaveManager.saveBeforeEvent.dispatchAction();
        let jsonObject = SaveManager.serializeSaveObjects();
        sys.localStorage.setItem(SaveManager.storageKey, JSON.stringify(jsonObject));
        // return new Promise((resolve, reject) => {
        //     GameStorage.Upload(!sys.isMobile || localOnly, jsonObject, resolve, reject);
        // });
    }

    public static async clear(version?: number): Promise<void> {
        SaveManager.saveJsonObject = { version: undefined };
        SaveManager.saveObject.clear();
        // return new Promise((resolve, reject) => {
        //     GameStorage.Upload(false, null, resolve, reject);
        // });
    }

    public static getStorageKey(key: string): string {
        // return `${SaveManager.gameId}.${key}`;
        return `${"gameId"}_${key}`;
    }

    public static getStorage(key: string): string {
        return sys.localStorage.getItem(SaveManager.getStorageKey(key));
    }

    public static setStorage(key: string, value: string): void {
        sys.localStorage.setItem(SaveManager.getStorageKey(key), value);
    }

    public static removeStorage(key: string): void {
        sys.localStorage.removeItem(SaveManager.getStorageKey(key));
    }

    public static checkStorage(): boolean {
        let jsonData: string = sys.localStorage.getItem("GameStorage.contentKey");
        return jsonData != null && jsonData != "";
    }
}