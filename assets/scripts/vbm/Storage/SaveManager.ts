import { game, Game, sys } from "cc";
import Serializable from "./Serializable";
import SerializeManager from "./SerializeManager";
import ActionEvent from "common/utility/ActionEvent";

export type JsonObject = Object;
export default class SaveManager {
    public static StorageVersion = 1;
    public static readonly saveBeforeEvent = new ActionEvent();
    private static saveJsonObject: { version: number } = null;
    private static saveObject = new Map<string, Serializable>();
    private static _isLoading: boolean = false;
    public static get isLoading() { return SaveManager._isLoading; }
    private static _isLoadFormSave: boolean = false;
    public static get isLoadFormSave() { return SaveManager._isLoadFormSave; }
    public static get isFirstLoaded() { return !SaveManager._isLoadFormSave; }

    public static GetJsonObject(key: string): JsonObject {
        return SaveManager.saveJsonObject[key];
    }

    public static SetSaveObject(key: string, obj: Serializable): void {
        SaveManager.saveObject.set(key, obj);
    }

    public static SerializeSaveObjects(): JsonObject {
        for (let entity of Array.from(SaveManager.saveObject)) {
            let key = entity[0];
            let value = entity[1];
            SaveManager.saveJsonObject[key] = SerializeManager.Serialize({}, value);
        }
        return SaveManager.saveJsonObject;
    }

    public static DeserializeSaveObjects(jsonObject: {}): void {
        let saveObjectMap = SaveManager.saveObject;
        for (let key of Object.keys(jsonObject)) {
            let serializeObject = saveObjectMap.get(key);
            if (serializeObject != null)
                SerializeManager.Deserialize(jsonObject[key], serializeObject);
        }
    }

    public static async Initialize(version: number): Promise<void> {
        console.time("SaveManager intialize time");
        await this.Load(version);
        let oldVersion = SaveManager.saveJsonObject.version || 0;
        if (oldVersion < version) {
            console.warn(`The storage version ${SaveManager.saveJsonObject.version} < current version ${version}, And clear old storage!`);
            SaveManager.Clear(version);
            SaveManager._isLoadFormSave = false;
        }
        game.on(Game.EVENT_HIDE, SaveManager.Save);
        console.timeEnd("SaveManager intialize time");
    }

    public static async Load(version: number): Promise<void> {
        return new Promise((resolve, reject) => {
            console.time("GameStorage Download");
            GameStorage.Download((jsonObject) => {
                console.timeEnd("GameStorage Download");
                if (jsonObject == null) {
                    jsonObject = { version: version };
                    SaveManager._isLoadFormSave = false;
                } else if (jsonObject.version == null) {
                    jsonObject.version = version;
                    SaveManager._isLoadFormSave = false;
                } else {
                    SaveManager._isLoadFormSave = true;
                }
                SaveManager.saveJsonObject = jsonObject;
                SaveManager.DeserializeSaveObjects(SaveManager.saveJsonObject);
                SaveManager._isLoading = true;
                // console.warn("On load storage", SaveManager.saveJsonObject, SaveManager._isLoadFormSave, jsonObject);
                resolve();
            }, (jsonObject) => {
                console.timeEnd("GameStorage Download");
                SaveManager._isLoadFormSave = false;
                // console.warn("On load storage faild", jsonObject);
                reject();
            });
        });
    }

    public static async Save(localOnly: boolean = false): Promise<void> {
        SaveManager.saveBeforeEvent.dispatchAction();
        let jsonObject = SaveManager.SerializeSaveObjects();
        return new Promise((resolve, reject) => {
            GameStorage.Upload(!sys.isMobile || localOnly, jsonObject, resolve, reject);
        });
    }

    public static async Clear(version?: number): Promise<void> {
        SaveManager.saveJsonObject = { version: undefined };
        SaveManager.saveObject.clear();
        return new Promise((resolve, reject) => {
            GameStorage.Upload(false, null, resolve, reject);
        });
    }

    private static gameId: string;
    /** GameId为一串字符串组成，用.来分隔每一段。比喻：com.company.gamename.platform */
    public static SetGameId(gameId: string): void {
        SaveManager.gameId = gameId;
    }

    public static GetStorageKey(key: string): string {
        // return `${SaveManager.gameId}.${key}`;
        return `${PlatformService.gameId}_${key}`;
    }

    public static GetStorage(key: string): string {
        return sys.localStorage.getItem(SaveManager.GetStorageKey(key));
    }

    public static SetStorage(key: string, value: string): void {
        sys.localStorage.setItem(SaveManager.GetStorageKey(key), value);
    }

    public static RemoveStorage(key: string): void {
        sys.localStorage.removeItem(SaveManager.GetStorageKey(key));
    }

    public static CheckStorage(): boolean {
        let jsonData: string = sys.localStorage.getItem(GameStorage.contentKey);
        return jsonData != null && jsonData != "";
    }
}