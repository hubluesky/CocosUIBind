import { Label, Sprite, _decorator } from "cc";
import BindArrayItemComponent from "framework/vbm/bindEvent/BindArrayItemComponent";
import { BuildingPrototype } from "./BuildingDatabase";
import { bindUIField } from "framework/vbm/bindEvent/RegisterBindUI";

const { ccclass, property } = _decorator;
@ccclass
export default class LevelBuildingItem extends BindArrayItemComponent {
    @property(Sprite)
    @bindUIField(BuildingPrototype, "iconPath")
    readonly iconSprite: Sprite = null;
    @property(Label)
    @bindUIField(BuildingPrototype, "name")
    readonly shownameLabel: Label = null;
}