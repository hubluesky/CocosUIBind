import { LabelComponent } from "cc";

export function bindUILabelPrefixHandler(prefix: string) {
    return function (ui: any, label: LabelComponent, data: any, value: any) {
        label.string = `${prefix}${value}`;
    }
}

export function bindUILabelFormatHandler(format: string, ...params: any[]) {
    return function (ui: any, label: LabelComponent, data: any, value: any) {
        label.string = String.format(format, value, ...params);
    }
}