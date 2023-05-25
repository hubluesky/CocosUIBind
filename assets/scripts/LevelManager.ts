import { _decorator, Component, Node } from 'cc';
import ViewUIManager from 'framework/vbm/Views/ViewUIManager';
import { LevelUI } from './LevelUI';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager extends Component {
    onLoad() {
        ViewUIManager.showView(LevelUI);
    }
}


