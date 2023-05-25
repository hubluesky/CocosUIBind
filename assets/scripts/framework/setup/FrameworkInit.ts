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
        this.initialize(this.setupConfig);
    }

    onDestroy() {
        if (SaveManager.checkStorage()) SaveManager.save();
    }

    protected async initialize(config: SetupConfig) {
        game.frameRate = config.frameRate;
        SaveManager.StorageVersion = config.storageVersion;

        LoadingUI.Default.show();
        AssetManager.initialize();
        NodePool.initilaize(this.nodePoolRoot);
        ViewUIManager.Initialize(this.uiRoot, ViewControllerFactory.create, config.uiPath);

        config.initialize();
        SystemSetupManager.initialize();

        LoadingManager.Default.runOrder(this.onLoadCompleted.bind(this, config), this.onProgressChange.bind(this),
            ...SystemSetupManager.getSystemSetupTasks(config),
            ...config.getSyncPreloadAssets(),
        );
        LoadingManager.Default.runBackground(...config.getAsyncPreloadAssets());
    }

    private onProgressChange(progress: number): void {
        LoadingUI.Default.onProgressChanged(progress, this.loadingPromopt);
    }

    private async onLoadCompleted(config: SetupConfig) {
        ModelManager.initialize();
        // PlatformService.OnApplicationVisible.Add((visible, res) => {
        //     if (!visible) SaveManager.Save();
        // });
        await config.onLoadedCompleted();
        await LoadingUI.Default.hide(1);
        config.finalize();
    }
}