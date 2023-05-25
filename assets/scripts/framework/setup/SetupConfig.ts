import { Prefab } from "cc";
import AssetManager from "framework/asset/AssetManager";
import { ILoadTask, LoadUrlType } from "../Loading/LoadingManager";
import IViewController from "../vbm/Views/IViewController";
import ViewUIManager from "../vbm/Views/ViewUIManager";

/**
 * 注册系统启动配置项，用来替换框架默认的启动项。
 */
export function registerSetupConfig(): Function {
    return function (target: typeof SetupConfig) {
        if (!SetupConfig.isPrototypeOf(target))
            throw new Error(`Register setup config can only be used on a SetupConfig class.`);
        SetupConfig.ConfigType = target;
    }
}

export default class SetupConfig {
    public static ConfigType: typeof SetupConfig = SetupConfig;

    public get uiPath(): string { return "prefabs/"; }
    public get soundPath(): string { return "Sounds/"; }
    public get configPath(): string { return "Configs/"; }
    public get languagePath(): string { return "Languages/"; }
    public get frameRate(): number { return 60; }
    public get storageVersion(): number { return 0; }
    public get gameVersion(): string { return "v001"; }
    public get gameId(): string { return "TestGameId"; }
    public get logDbName(): string { return "Testlog"; }

    public initialize() {
        console.log("SetupConfig Intialize");
    }

    public finalize() {
        console.log("SetupConfig Finalize");
    }

    public async onLoadedCompleted() {
    }

    public getAsyncPreloadAssets(): ILoadTask[] {
        return [];
    }

    public getSyncPreloadAssets(): ILoadTask[] {
        return [];
    }

    public static onCompletedToCache(task: ILoadTask, asset: any): void {
        AssetManager.setAsset(task.url, asset, true);
    }

    public createUITask<T extends IViewController>(type: { prototype: T } | string): ILoadTask {
        let assetName = typeof type === 'string' ? type : ViewUIManager.getViewConfig(type).assetName;
        return { url: this.uiPath + assetName, urlType: LoadUrlType.LocalAsset, assetType: Prefab, onSuccessCompleted: SetupConfig.onCompletedToCache };
    }

    public createAssetTask(assetPath: string): ILoadTask {
        return { url: assetPath, urlType: LoadUrlType.LocalAsset, assetType: Prefab, onSuccessCompleted: SetupConfig.onCompletedToCache };
    }
}