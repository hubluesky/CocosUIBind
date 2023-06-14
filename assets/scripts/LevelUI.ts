import { _decorator, Label, ProgressBar } from 'cc';
import BindArrayComponent from 'framework/vbm/BindEvent/BindArrayComponent';
import { bindUIArrayField, bindUIField } from 'framework/vbm/BindEvent/RegisterBindUI';
import ModelManager from 'framework/vbm/Models/ModelManager';
import { registerView } from 'framework/vbm/Views/RegisterView';
import { ViewLayer } from 'framework/vbm/Views/ViewConfig';
import ViewUIComponent from 'framework/vbm/Views/ViewUIComponent';
import LevelData from './LevelData';
import { ResourceType } from './ResourceType';
import DatabaseManager from 'framework/database/DatabaseManager';
import BuildingDatabase from './BuildingDatabase';
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
            prototypeList[0].name = "8858";
        }, 2);
    }

    private onWoodChanged(): void {
        let levelData = ModelManager.getModel(LevelData);
        this.woodProgress.progress = levelData.getResourceValue(ResourceType.Wood) / levelData.getResourceCapacity(ResourceType.Wood);
        this.woodLabel.string = `${levelData.getResourceValue(ResourceType.Wood)}/${levelData.getResourceCapacity(ResourceType.Wood)}`;
    }
}