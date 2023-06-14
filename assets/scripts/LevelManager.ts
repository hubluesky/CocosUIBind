import { _decorator, Component, Node } from 'cc';
import { LevelUI } from './LevelUI';
import ViewUIManager from 'framework/vbm/Views/ViewUIManager';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager extends Component {
    onLoad() {
        ViewUIManager.showView(LevelUI);
    }
}


