import { Label, Sprite, _decorator } from "cc";
import BindArrayItemComponent from "framework/vbm/BindEvent/BindArrayItemComponent";
import { BuildingPrototype } from "./BuildingDatabase";
import { bindUIField } from "framework/vbm/BindEvent/BindUIManager";

const { ccclass, property } = _decorator;
@ccclass
export default class LevelBuildingItem extends BindArrayItemComponent {
    @property(Sprite)
    readonly iconSprite: Sprite = null;
    @property(Label)
    @bindUIField(BuildingPrototype, "name")
    readonly shownameLabel: Label = null;
}