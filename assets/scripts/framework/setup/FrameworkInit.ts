import { Component, Node, _decorator, game } from "cc";
import AssetManager from "framework/asset/AssetManager";
import NodePool from "framework/asset/NodePool";
import LoadingManager from "../Loading/LoadingManager";
import LoadingUI from "../Loading/LoadingUI";
import ModelManager from "../vbm/Models/ModelManager";
import SaveManager from "../vbm/Storage/SaveManager";
import ViewControllerFactory from "../vbm/Views/ViewControllerFactory";
import ViewUIManager from "../vbm/Views/ViewUIManager";
import SetupConfig from "./SetupConfig";
import SystemSetupManager from "./SystemSetupManager";

const { ccclass, property, menu } = _decorator;
@ccclass
@menu("Framework/FrameworkInit")
export default class FrameworkInit extends Component {
    @property(Node)
    private nodePoolRoot: Node = null;
    @property(Node)
    private uiRoot: Node = null;
    @property
    private loadingPromopt: string = "正在努力加载";

    public static instance: FrameworkInit;
    private _setupConfig: SetupConfig;
    public get setupConfig() { return this._setupConfig; }

    onLoad(): void {
        FrameworkInit.instance = this;
        this._setupConfig = new SetupConfig.ConfigType();
        this.Intialize(this.setupConfig);
    }

    onDestroy() {
        if (SaveManager.CheckStorage()) SaveManager.Save();
    }

    protected async Intialize(config: SetupConfig) {
        game.frameRate = config.frameRate;
        SaveManager.StorageVersion = config.storageVersion;

        LoadingUI.Default.Show();
        AssetManager.Default.Initialize();
        NodePool.initilaize(this.nodePoolRoot);
        ViewUIManager.Initialize(this.uiRoot, ViewControllerFactory.Create, config.uiPath);

        config.Intialize();
        SystemSetupManager.Intialize();

        LoadingManager.Default.RunOrder(this.OnLoadCompleted.bind(this, config), this.OnProgressChange.bind(this),
            ...SystemSetupManager.getSystemSetupTasks(config),
            ...config.GetSyncPreloadAssets(),
        );
        LoadingManager.Default.RunBackground(...config.GetAsyncPreloadAssets());
    }

    private OnProgressChange(progress: number): void {
        LoadingUI.Default.OnProgressChanged(progress, this.loadingPromopt);
    }

    private async OnLoadCompleted(config: SetupConfig) {
        ModelManager.InitModels();
        // PlatformService.OnApplicationVisible.Add((visible, res) => {
        //     if (!visible) SaveManager.Save();
        // });
        await config.OnLoadedCompleted();
        await LoadingUI.Default.Hide(1);
        config.Finalize();
    }
}