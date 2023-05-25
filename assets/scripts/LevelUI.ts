import { _decorator, Label, ProgressBar } from 'cc';
import BindArrayComponent from 'framework/vbm/BindEvent/BindArrayComponent';
import { bindUIArrayField, bindUIField } from 'framework/vbm/BindEvent/BindUIManager';
import { ViewLayer } from 'framework/vbm/Views/ViewConfig';
import { registerView } from './framework/vbm/Views/RegisterView';
import ViewUIComponent from './framework/vbm/Views/ViewUIComponent';
import LevelData from './LevelData';
import ModelManager from 'framework/vbm/Models/ModelManager';
import { ResourceType } from './ResourceType';
const { ccclass, property } = _decorator;

@ccclass('LevelUI')
@registerView("LevelUI", ViewLayer.NormalLayer)
export class LevelUI extends ViewUIComponent {
    @property(ProgressBar)
    @bindUIArrayField(LevelData, "resourceCapacitys", (levelUI: LevelUI, p2, levelData, p4) => levelUI.onWoodChanged(levelData))
    private readonly woodProgress: ProgressBar;
    @property(Label)
    private readonly woodLabel: Label;
    @property(ProgressBar)
    private readonly oreProgress: ProgressBar;
    @property(Label)
    private readonly oreLabel: Label;
    @property(BindArrayComponent)
    private buildingList: BindArrayComponent;

    public onCreated(): void {
        let levelData = ModelManager.getModel(LevelData);
        this.addBindObject(levelData);

        this.scheduleOnce(()=> {
            levelData.modifyResourceValue(ResourceType.Wood, 34);
        }, 3);
    }

    private onWoodChanged(levelData: LevelData): void {
        this.woodProgress.progress = levelData.getResourceValue(ResourceType.Wood) / levelData.getResourceCapacity(ResourceType.Wood);
        console.log("onWoodChanged");
    }
}