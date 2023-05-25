import { Label, Sprite, _decorator } from "cc";
import BindArrayItemComponent from "framework/vbm/BindEvent/BindArrayItemComponent";

const { ccclass, property } = _decorator;
@ccclass
export default class LevelBuildingItem extends BindArrayItemComponent {
    @property(Sprite)
    // @BindUIField(CharacterPrototype, "iconPath", OnIconSprite)
    readonly iconSprite: Sprite = null;
    @property(Label)
    // @BindUIField(CharacterPrototype, "showname")
    readonly shownameLabel: Label = null;
}