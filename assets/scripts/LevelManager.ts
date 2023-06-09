import { _decorator, Component, Node } from 'cc';
import { LevelUI } from './LevelUI';
import ViewUIManager from 'framework/vbm/views/ViewUIManager';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager extends Component {
    initialize() {
        ViewUIManager.showView("Background");
        ViewUIManager.showView(LevelUI);
    }
}


