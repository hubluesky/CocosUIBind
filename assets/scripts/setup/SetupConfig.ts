import { Prefab } from "cc";
import { ILoadTask, LoadUrlType } from "../../../../Scenes/Loading/LoadingManager";
import { PlatformType } from "../../../Service/IPlatformProxy";
import { IPlatformConfig } from "../../../Service/PlatformService";
import AssetManager from "../Resource/AssetManager";
import IViewController from "../Views/IViewController";
import ViewUIManager from "../Views/ViewUIManager";

export function RegisterSetupConfig(): Function {
    return function (target: typeof SetupConfig) {
        if (!SetupConfig.isPrototypeOf(target))
            throw new Error(`Register setup config can only be used on a SetupConfig class.`);
        SetupConfig.ConfigType = target;
    }
}

export default class SetupConfig {
    public static ConfigType: typeof SetupConfig = SetupConfig;

    public get uiPath(): string { return "Prefabs/UI/"; }
    public get soundPath(): string { return "Sounds/"; }
    public get configPath(): string { return "Configs/"; }
    public get languagePath(): string { return "Languages/"; }
    public get frameRate(): number { return 60; }
    public get storageVersion(): number { return 0; }
    public get gameVersion(): string { return "v001"; }
    public get gameId(): string { return "TestGameId"; }
    public get logDbName(): string { return "tanklog"; }
    public get gameDebugUI(): string { return "GameDebugUI"; }
    public get bannerNativePlatformMask(): number { return 0; }
    public get shortcutPlatformMask(): number { return 0; }

    public Intialize() {
        console.log("SetupConfig Intialize");
    }

    public async OnLoadedCompleted() {
    }

    public Finalize() {
        console.log("SetupConfig Finalize");
    }

    public GetAsyncPreloadAssets(): ILoadTask[] {
        return [];
    }

    public GetSyncPreloadAssets(): ILoadTask[] {
        return [];
    }

    public GetPlatformConfigs() {
        var configs = new Map<PlatformType, IPlatformConfig>();
        configs.set(PlatformType.Empty, {
            gameName: "PrimitiveMan",
            bundleId: "",
            appId: "wx587257bdaa4b74d9",
            appSecret: "cbdd080bc89f7e73992844dddc68c0d6",
            param1: "ws://6alciivh6r.52http.net",
            // param1: "wss://xyx-yn-ng-test.ihago.net",
        });
        return configs;
    }

    public static OnCompletedToCache(task: ILoadTask, asset: any): void {
        AssetManager.Default.SetAsset(task.url, asset, true);
    }

    public CreateUITask<T extends IViewController>(type: { prototype: T } | string): ILoadTask {
        let assetName = typeof type === 'string' ? type : ViewUIManager.GetViewConfig(type).assetName;
        return { url: this.uiPath + assetName, urlType: LoadUrlType.LocalAsset, assetType: Prefab, OnSuccessCompleted: SetupConfig.OnCompletedToCache };
    }

    public CreateAssetTask(assetPath: string): ILoadTask {
        return { url: assetPath, urlType: LoadUrlType.LocalAsset, assetType: Prefab, OnSuccessCompleted: SetupConfig.OnCompletedToCache };
    }
}