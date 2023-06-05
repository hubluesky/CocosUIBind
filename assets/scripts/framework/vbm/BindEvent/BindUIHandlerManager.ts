import { Component, Label, Node, ProgressBar, RichText, Slider, Sprite, SpriteFrame, Toggle } from "cc";
import AssetManager from "framework/asset/AssetManager";
import BindArrayComponent from "./BindArrayComponent";
import BindArrayEvent from "./BindArrayEvent";
import BindUIComponent from "./BindUIComponent";
import { ArrayElementChanged, PropertyChanged } from "./BindUIManager";

export default class BindUIHandlerManager {

    public static getUIHandler<D>(propertyValue: Component): PropertyChanged<BindUIComponent, D> {
        if (propertyValue instanceof Label || propertyValue instanceof RichText) {
            return (ui, label: { string: string; }, data: D, value: D[ObjectProperties<D>]) => label.string = value.toString();
        } else if (propertyValue instanceof Sprite) {
            return (ui, sprite: Sprite, data: D, value: D[ObjectProperties<D>]) => {
                if (typeof value === `string`)
                    AssetManager.loadSpriteFrameRes(value, sprite);
                else if (value instanceof SpriteFrame)
                    sprite.spriteFrame = value;
            };
        } else if (propertyValue instanceof Toggle) {
            return (ui, toggle: Toggle, data: D, value: D[ObjectProperties<D>]) => toggle.isChecked = !!value;
        } else if (propertyValue instanceof ProgressBar) {
            return (ui, progressBar: ProgressBar, data: D, value: D[ObjectProperties<D>]) => progressBar.progress = value as number;
        } else if (propertyValue instanceof Slider) {
            return (ui, slider: Slider, data: D, value: D[ObjectProperties<D>]) => slider.progress = value as number;
        }
    }

    public static getUIArrayHandler<D, P extends ObjectProperties<D>>(ui: BindUIComponent, propertyValue: Component | Node, dataPropertyName: P, onPropertyChanged?: ArrayElementChanged<BindUIComponent, D[P]>): PropertyChanged<BindUIComponent, D> {
        // if (!(Object.hasProperty<BindArrayHandler>(propertyValue, "onPropertyChanged"))) {
        //     console.warn("GetUIArrayHandler failed, The property value type is not a BindArrayHandler", dataPropertyName, propertyValue);
        //     return (ui, v1, data, v2) => { };
        // }

        let bindArrayEvent: BindArrayEvent<ArrayElement<D[P]>>;
        if (onPropertyChanged != null) {
            bindArrayEvent = new BindArrayEvent<ArrayElement<D[P]>>();
            bindArrayEvent.addElementChanged((array, eventType, key, value, oldValue) => {
                onPropertyChanged(ui, propertyValue, array as D[P], eventType, key, value, oldValue);
            });
        } else if (propertyValue instanceof BindArrayComponent) {
            bindArrayEvent = propertyValue.bindArrayEvent;
        } else {
            bindArrayEvent = propertyValue.addComponent(BindArrayComponent).bindArrayEvent;
        }

        return (ui, up, data, value) => {
            if (value != null) {
                if (!Array.isArray(value))
                    return console.warn("GetUIArrayHandler on array changed failed, the property is not a array.", value);
                // if (!isBindObject(value)) {
                //     data[dataPropertyName] = makeBindArrayProxy(value);
                //     // return;
                // }
                data[dataPropertyName] = bindArrayEvent.bindObject(value) as D[P];
            }
            // onPropertyChanged();
        };
    }
}