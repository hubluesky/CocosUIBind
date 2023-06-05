import { _decorator, Label, ProgressBar } from 'cc';
import BindArrayComponent from 'framework/vbm/BindEvent/BindArrayComponent';
import { bindUIArrayField, bindUIField } from 'framework/vbm/BindEvent/BindUIManager';
import { ViewLayer } from 'framework/vbm/Views/ViewConfig';
import { registerView } from './framework/vbm/Views/RegisterView';
import ViewUIComponent from './framework/vbm/Views/ViewUIComponent';
import LevelData from './LevelData';
import ModelManager from 'framework/vbm/Models/ModelManager';
import { ResourceType } from './ResourceType';
import { bindUILabelPrefixHandler } from 'framework/vbm/BindEvent/BindUIHandlers';
const { ccclass, property } = _decorator;

@ccclass('LevelUI')
@registerView("LevelUI", ViewLayer.NormalLayer)
export class LevelUI extends ViewUIComponent {
    @property(ProgressBar)
    // @bindUIField(LevelData, "testNumber")
    // @computed(())
    @bindUIArrayField(LevelData, "resourceCapacitys", (ui, up, array, et, k, v, ov) => ui.onWoodChanged(up, array))
    @bindUIArrayField(LevelData, "resourceValues", (ui, up, array, et, k, v, ov) => ui.onWoodChanged(up, array))
    public readonly woodProgress: ProgressBar;
    @property(Label)
    public readonly woodLabel: Label;
    @property(ProgressBar)
    public readonly oreProgress: ProgressBar;
    @property(Label)
    // @bindUIField(LevelData, "testNumber", (ui, up, d, dp) => { })
    public readonly oreLabel: Label;
    @property(BindArrayComponent)
    public buildingList: BindArrayComponent;

    public onCreated(): void {
        let levelData = ModelManager.getModel(LevelData);
        this.addBindObject(levelData);

        levelData.modifyResourceCapacity(ResourceType.Wood, 34);
        this.scheduleOnce(() => {
            levelData.modifyResourceValue(ResourceType.Wood, 30);

            levelData.testNumber = 5;
        }, 1);
    }

    private onWoodChanged(woodProgress: ProgressBar, resourceCapacitys: readonly ResourceType[]): void {
        let levelData = ModelManager.getModel(LevelData);
        woodProgress.progress = levelData.getResourceValue(ResourceType.Wood) / levelData.getResourceCapacity(ResourceType.Wood);
        console.log("onWoodChanged", levelData.getResourceValue(ResourceType.Wood), levelData.getResourceCapacity(ResourceType.Wood));
    }
}