import { Component, game, instantiate, loader, Node, Prefab, SpriteFrame, sys, warn, _decorator } from "cc";
import LoadingManager, { CustomLoadTask, LoadUrlType } from "../../../../Scenes/Loading/LoadingManager";
import LoadingUI from "../../../../Scenes/Loading/LoadingUI";
import Analys from "../../../Service/Analys";
import PlatformService from "../../../Service/PlatformService";
import RemoteSetting from "../../../Service/RemoteSetting";
import BannerManager from "../Banner/BannerManager";
import ModelManager from "../Models/ModelManager";
import AssetManager from "../Resource/AssetManager";
import SoundsManager from "../Resource/SoundsManager";
import SaveManager from "../Storage/SaveManager";
import { AutoAdIcons } from "../UI/AutoAdIcon";
import ViewControllerFactory from "../Views/ViewControllerFactory";
import ViewUIManager from "../Views/ViewUIManager";
import SetupConfig from "./SetupConfig";
import SystemSetupManager from "./SystemSetupManager";

const { ccclass, property, menu } = _decorator;
@ccclass
@menu("Framework/FrameworkInit")
export default class FrameworkInit extends Component {

    @property(Node)
    private assetsPoolNode: Node = null;
    @property(Node)
    private uiRoot: Node = null;
    @property(Node)
    public bannerPos: Node = null;
    @property(SpriteFrame)
    private videoIcon: SpriteFrame = null;
    @property(SpriteFrame)
    private shareIcon: SpriteFrame = null;
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
        game.setFrameRate(config.frameRate);
        SaveManager.StorageVersion = config.storageVersion;
        RemoteSetting.version = config.gameVersion;
        AutoAdIcons.videoIcon = this.videoIcon;
        AutoAdIcons.shareIcon = this.shareIcon;

        LoadingUI.instance.Show();
        AssetManager.Default.Initialize(AssetManager.CreateRootNode(this.assetsPoolNode));
        ViewUIManager.Initialize(this.uiRoot, ViewControllerFactory.Create, config.uiPath);
        SoundsManager.assetPath = config.soundPath;
        BannerManager.Initialize(this, config.bannerNativePlatformMask);

        config.Intialize();
        SystemSetupManager.Intialize();
        let systemsLoadTask: CustomLoadTask[] = [];
        for (let systems of SystemSetupManager.setupSystemFunctions)
            systemsLoadTask.push(new CustomLoadTask(systems.initFunction.bind(null, config)));

        LoadingManager.Default.RunOrder(this.OnLoadCompleted.bind(this, config), this.OnProgressChange.bind(this),
            ...systemsLoadTask,
            ...config.GetSyncPreloadAssets(),
        );
        LoadingManager.Default.RunBackground(...config.GetAsyncPreloadAssets());
    }

    private OnProgressChange(progress: number): void {
        LoadingUI.instance.OnProgressChanged(progress, this.loadingPromopt);
    }

    private async OnLoadCompleted(config: SetupConfig) {
        ModelManager.InitModels();
        this.InitDebugUI(config);
        PlatformService.OnApplicationVisible.Add((visible, res) => {
            if (!visible) SaveManager.Save();
        })
        await config.OnLoadedCompleted();
        await LoadingUI.instance.Hide(1);
        config.Finalize();
        Analys.LogFinishStartGame();
    }

    private InitDebugUI(config: SetupConfig): void {
        if (!RemoteSetting.Get("debug", sys.platform == sys.DESKTOP_BROWSER)) return;
        loader.loadRes(config.gameDebugUI, Prefab, (error, resource: Prefab) => {
            if (error != null) return warn("Load Game DebugUI failed " + config.gameDebugUI);
            let debugUI = instantiate(resource);
            debugUI.setParent(this.node);
        });
    }
}