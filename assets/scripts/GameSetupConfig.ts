import { director } from "cc";
import SetupConfig, { registerSetupConfig } from "framework/setup/SetupConfig";

@registerSetupConfig()
export default class GameSetupConfig extends SetupConfig {
    public async onLoadedCompleted() {
        const levelManager = director.getScene().getChildByName("LevelManager");
        levelManager.active = true;
    }
}