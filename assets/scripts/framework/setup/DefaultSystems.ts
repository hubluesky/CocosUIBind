import DatabaseManager from "framework/database/DatabaseManager";
import SaveManager from "../vbm/Storage/SaveManager";
import SetupConfig from "./SetupConfig";
import { RegisterSystemSetup } from "./SystemSetupManager";

export default class DefaultSystems {

    @RegisterSystemSetup(300)
    static async InitDatabaseManager(config: SetupConfig) {
        return DatabaseManager.Initialized(config.configPath);
    }

    @RegisterSystemSetup(400)
    static async InitGameStorage(config: SetupConfig) {
        return SaveManager.Initialize(SaveManager.StorageVersion, config.gameId);
    }
}