import { registerBindObject } from "framework/vbm/bindEvent/RegisterBindObject";
import { serializeClass, serializeField } from "framework/vbm/storage/Serializable";

@serializeClass("gd")
@registerBindObject
export class GameData {
    @serializeField("a")
    userIconUrl: string = "https://www.baidu.com/img/flexible/logo/pc/peak-result.png";
    @serializeField("b")
    userName: string = "hugo";
    @serializeField("c")
    level: number = 666;

    tempData: number = 3;

    public modifyLevel(level: number): void {
        this.level = level;
    }
}