import { director } from "cc";
import AssetManager from "framework/asset/AssetManager";
import NodePool from "framework/asset/NodePool";
import DatabaseManager from "framework/database/DatabaseManager";
import { ILoadTask } from "framework/loading/LoadingManager";
import SetupConfig, { registerSetupConfig } from "framework/setup/SetupConfig";
import { registerSystemSetup } from "framework/setup/SystemSetupManager";
import ModelManager from "framework/vbm/models/ModelManager";
import SaveManager from "framework/vbm/storage/SaveManager";
import ViewControllerFactory from "framework/vbm/views/ViewControllerFactory";
import ViewUIManager from "framework/vbm/views/ViewUIManager";

@registerSetupConfig
export default class GameSetupConfig extends SetupConfig {

    public getAsyncPreloadAssets(): ILoadTask[] {
        return [
            this.createUITask("LevelUI")
        ];
    }

    @registerSystemSetup(100)
    static InitAssetManager() {
        AssetManager.initialize();
    }

    @registerSystemSetup(200)
    static InitNodePool() {
        NodePool.initilaize();
    }

    @registerSystemSetup(300)
    static InitViewUIManager(config: SetupConfig) {
        // director.addPersistRootNode(config.canvas.node);
        ViewUIManager.initialize(config.canvas, ViewControllerFactory.create, "prefabs/");
    }

    @registerSystemSetup(400)
    static async InitDatabaseManager(config: SetupConfig) {
        return DatabaseManager.initialize(config.configPath);
    }

    @registerSystemSetup(500)
    static async InitGameStorage(config: SetupConfig) {
        return SaveManager.initialize(SaveManager.StorageVersion, config.gameId);
    }

    @registerSystemSetup(900)
    static InitModelManager(config: SetupConfig) {
        ModelManager.initialize();
    }
}