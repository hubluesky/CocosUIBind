import { LabelComponent } from "cc";

export function BindUILabelPrefixHandler(prefix: string) {
    return function (ui: any, label: LabelComponent, data: any, value: any) {
        label.string = `${prefix}${value}`;
    }
}

export function BindUILabelFormatHandler(format: string, ...params: any[]) {
    return function (ui: any, label: LabelComponent, data: any, value: any) {
        label.string = String.format(format, value, ...params);
    }
}