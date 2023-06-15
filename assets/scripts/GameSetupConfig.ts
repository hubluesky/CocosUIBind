import { director } from "cc";
import AssetManager from "framework/asset/AssetManager";
import NodePool from "framework/asset/NodePool";
import DatabaseManager from "framework/database/DatabaseManager";
import SetupConfig, { registerSetupConfig } from "framework/setup/SetupConfig";
import { registerSystemSetup } from "framework/setup/SystemSetupManager";
import ModelManager from "framework/vbm/models/ModelManager";
import SaveManager from "framework/vbm/storage/SaveManager";
import ViewControllerFactory from "framework/vbm/views/ViewControllerFactory";
import ViewUIManager from "framework/vbm/views/ViewUIManager";

@registerSetupConfig()
export default class GameSetupConfig extends SetupConfig {
    public finalize() {
        const levelManager = director.getScene().getChildByName("LevelManager");
        levelManager.active = true;
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
        ViewUIManager.Initialize(config.canvas, ViewControllerFactory.create, config.uiPath);
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