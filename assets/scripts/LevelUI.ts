import { _decorator, Label, ProgressBar } from 'cc';
import BindArrayComponent from 'framework/vbm/BindEvent/BindArrayComponent';
import { bindUIArrayField, bindUIField } from 'framework/vbm/BindEvent/BindUIManager';
import { ViewLayer } from 'framework/vbm/Views/ViewConfig';
import { registerView } from './framework/vbm/Views/RegisterView';
import ViewUIComponent from './framework/vbm/Views/ViewUIComponent';
import LevelData from './LevelData';
import ModelManager from 'framework/vbm/Models/ModelManager';
import { ResourceType } from './ResourceType';
import DatabaseManager from 'framework/database/DatabaseManager';
import BuildingDatabase, { BuildingPrototype } from './BuildingDatabase';
import AssetManager from 'framework/asset/AssetManager';
import SaveManager from 'framework/vbm/Storage/SaveManager';
import { LevelManager } from './LevelManager';
import { bindUILabelPrefixHandler } from 'framework/vbm/BindEvent/BindUIHandlers';
const { ccclass, property } = _decorator;

@ccclass('LevelUI')
@registerView("LevelUI", ViewLayer.NormalLayer)
export class LevelUI extends ViewUIComponent {
    @property(ProgressBar)
    @bindUIArrayField(LevelData, "resourceCapacitys", (ui, up, array, et, k, v, ov) => ui.onWoodChanged())
    @bindUIArrayField(LevelData, "resourceValues", (ui, up, array, et, k, v, ov) => ui.onWoodChanged())
    public readonly woodProgress: ProgressBar;
    @property(Label)
    public readonly woodLabel: Label;
    @property(ProgressBar)
    public readonly oreProgress: ProgressBar;
    @property(Label)
    @bindUIField(LevelData, "testNumber", (ui, up, d, dp) => { })
    public readonly oreLabel: Label;
    @property(BindArrayComponent)
    public buildingList: BindArrayComponent;

    public onCreated(): void {
        let levelData = ModelManager.getModel(LevelData);
        this.addBindObject(levelData);
        // this.addBindObject(LevelManager);

        // levelData.modifyResourceCapacity(ResourceType.Wood, 34);
        // for (let i = 0; i < 10; i++) {
        //     this.scheduleOnce(() => {
        //         levelData.modifyResourceValue(ResourceType.Wood, 1);
        //         levelData.testNumber++;
        //     }, i + 1);
        // }

        const buildingDatabase = DatabaseManager.get(BuildingDatabase);
        const prototypeList = this.buildingList.bindArrayEvent.bindObject(Array.from(buildingDatabase.prototypeList));

        this.scheduleOnce(() => {
            // prototypeList[0] = new BuildingPrototype(999, "fddfd");
            prototypeList[0].name = "8858";
        }, 2);
    }

    private onWoodChanged(): void {
        let levelData = ModelManager.getModel(LevelData);
        this.woodProgress.progress = levelData.getResourceValue(ResourceType.Wood) / levelData.getResourceCapacity(ResourceType.Wood);
        this.woodLabel.string = `${levelData.getResourceValue(ResourceType.Wood)}/${levelData.getResourceCapacity(ResourceType.Wood)}`;
    }
}