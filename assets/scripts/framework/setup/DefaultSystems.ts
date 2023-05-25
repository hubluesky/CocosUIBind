import DatabaseManager from "framework/database/DatabaseManager";
import SaveManager from "../vbm/Storage/SaveManager";
import SetupConfig from "./SetupConfig";
import { registerSystemSetup } from "./SystemSetupManager";

export default class DefaultSystems {

    @registerSystemSetup(300)
    static async InitDatabaseManager(config: SetupConfig) {
        return DatabaseManager.initialize(config.configPath);
    }

    @registerSystemSetup(400)
    static async InitGameStorage(config: SetupConfig) {
        return SaveManager.initialize(SaveManager.StorageVersion, config.gameId);
    }
}