import { _decorator, Label, ProgressBar } from 'cc';
import DatabaseManager from 'framework/database/DatabaseManager';
import BindArrayComponent from 'framework/vbm/bindEvent/BindArrayComponent';
import BindUIComponent from 'framework/vbm/bindEvent/BindUIComponent';
import { bindUIArrayField, bindUIField } from 'framework/vbm/bindEvent/RegisterBindUI';
import ModelManager from 'framework/vbm/models/ModelManager';
import { registerView } from 'framework/vbm/views/RegisterView';
import { ViewLayer } from 'framework/vbm/views/ViewConfig';
import BuildingDatabase from './BuildingDatabase';
import LevelData from './LevelData';
import { ResourceType } from './ResourceType';
import { GameData } from './GameData';
import AssetManager from 'framework/asset/AssetManager';
import { SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelUI')
@registerView("LevelUI", ViewLayer.NormalLayer)
export class LevelUI extends BindUIComponent {
    @property(ProgressBar)
    @bindUIArrayField(LevelData, "resourceCapacitys", (ui, up, array, et, k, v, ov) => ui.onWoodChanged())
    @bindUIArrayField(LevelData, "resourceValues", (ui, up, array, et, k, v, ov) => ui.onWoodChanged())
    public readonly woodProgress: ProgressBar;
    @property(Label)
    public readonly woodLabel: Label;
    @property(ProgressBar)
    public readonly oreProgress: ProgressBar;
    @property(Label)
    @bindUIField(LevelData, "testString")
    public readonly oreLabel: Label;
    @property(BindArrayComponent)
    public buildingList: BindArrayComponent;

    public onCreated(): void {
        const levelData = ModelManager.getModel(LevelData);
        this.addBindObject(levelData);

        const gameData = ModelManager.getModel(GameData);
        console.log("gamedata", gameData);

        levelData.modifyResourceCapacity(ResourceType.Wood, 34);
        for (let i = 0; i < 10; i++) {
            this.scheduleOnce(() => {
                levelData.modifyResourceValue(ResourceType.Wood, 1);
                levelData.testNumber++;
            }, i + 1);
        }

        const buildingDatabase = DatabaseManager.get(BuildingDatabase);
        const prototypeList = this.buildingList.bindArrayEvent.bindObject(Array.from(buildingDatabase.prototypeList));

        this.scheduleOnce(() => {
            levelData.testString = "StringXYZ";
            prototypeList[0].name = "8858";
        }, 2);
    }

    private onWoodChanged(): void {
        let levelData = ModelManager.getModel(LevelData);
        this.woodProgress.progress = levelData.getResourceValue(ResourceType.Wood) / levelData.getResourceCapacity(ResourceType.Wood);
        this.woodLabel.string = `Wood:${levelData.getResourceValue(ResourceType.Wood)}/${levelData.getResourceCapacity(ResourceType.Wood)}`;
    }
}