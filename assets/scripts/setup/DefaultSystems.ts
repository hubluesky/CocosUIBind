import { director } from "cc";
import AdManager from "../../../Service/AdManager";
import { PlatformType } from "../../../Service/IPlatformProxy";
import kl from "../../../Service/kl";
import PlatformService from "../../../Service/PlatformService";
import ShareControl from "../../../Service/ShareAndAd/ShareControl";
import { audioEngine } from "../../Extenstion/audioEngine";
import DatabaseManager from "../Configs/DatabaseManager";
import SaveManager from "../Storage/SaveManager";
import WaitingUI from "../UI/WaitingUI";
import ViewUIManager from "../Views/ViewUIManager";
import FrameworkInit from "./FrameworkInit";
import SetupConfig from "./SetupConfig";
import { RegisterSystemSetup } from "./SystemSetupManager";

export default class DefaultSystems {

    @RegisterSystemSetup(100)
    static InitPlatformService(config: SetupConfig) {
        PlatformService.waitUpdateCompelete = true;
        PlatformService.Initialize();
        PlatformService.keepScreenOn(true);
        return new Promise((resolve) => PlatformService.StartGame(config.gameId, config.GetPlatformConfigs(), config.logDbName, (progress) => { if (progress == 1) resolve() }));
    }

    @RegisterSystemSetup(200)
    static InitShareControl(): void {
        let musicVolume: number = 0;
        let hadPaused: boolean = true;
        AdManager.LockScreenFunc = () => {
            let unsuppertPausePlaform = PlatformService.platformType == PlatformType.Meizu;
            hadPaused = unsuppertPausePlaform || director.isPaused();
            if (!hadPaused) director.pause();

            if (PlatformService.platformType == PlatformType.Vivo) { // 这是Cocos的bug 
                musicVolume = audioEngine.getMusicVolume();
                audioEngine.stopAllEffects();
                audioEngine.setMusicVolume(0);
            }
            audioEngine.pauseAll();
            ViewUIManager.ShowView(WaitingUI);
        }
        AdManager.UnlockScreenFunc = () => {
            if (!hadPaused) director.resume();

            if (PlatformService.platformType == PlatformType.Vivo) {// 这是Cocos的bug
                audioEngine.setMusicVolume(musicVolume);
            }
            audioEngine.resumeAll();
            ViewUIManager.HideView(WaitingUI);
        }
        ShareControl.Initialize(kl.GetDeviceRect(FrameworkInit.instance.bannerPos));
    }

    @RegisterSystemSetup(300)
    static async InitDatabaseManager(config: SetupConfig) {
        return DatabaseManager.Initialized(config.configPath);
    }

    @RegisterSystemSetup(400)
    static async InitGameStorage() {
        return SaveManager.Initialize(SaveManager.StorageVersion);
    }
}