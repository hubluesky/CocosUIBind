

export type Action<T extends any[] = []> = {
    (...args: T): void;
}

export type Func<R = void, T extends any[] = []> = {
    (...args: T): R;
}

interface ActionData<T extends any[] = []> {
    event: Action<T>;
    target?: any;
    once?: boolean;
}

/**
 * 这是一个事件派发器，提供了Action的泛型推导功能。
 * @example 
 * let event = new ActionEvent<[number, string]>();
 * let action1:Action<[number, string]>;
 * // 添加事件
 * event.addEvent(action1);
 * // 删除事件
 * event.removeEvent(action1);
 * // 派发事件
 * event.dispatchAction(1, "t");
 * @author hubluesky
 * @see Action
 * @see Func
 * @todo If have any questions, just call me.
 */
export default class ActionEvent<T extends any[] = []> {
    protected completeArgs: any[];
    protected eventList: ActionData<T>[] = [];
    public get isEmpty() { return this.eventList.length == 0; }
    public get length() { return this.eventList.length; }

    public addEvent(event: Action<T>, target?: any): void {
        this.eventList.push({ event, target });
        if (this.completeArgs != null)
            event.call(target, ...this.completeArgs);
    }

    public addEventOnce(event: Action<T>, target?: any): void {
        if (this.completeArgs != null)
            event.call(target, ...this.completeArgs);
        else
            this.eventList.push({ event, target, once: true });
    }

    public contains(event: Action<T>, target?: any): boolean {
        return this.eventList.find(x => x.event == event && x.target == target) != null;
    }

    public removeEvent(event: Action<T>, target?: any): void {
        let index = this.eventList.findIndex(x => x.event == event && x.target == target);
        if (index != -1) this.eventList.splice(index, 1);
    }

    public clearEvents(): void {
        this.eventList.length = 0;
    }

    public dispatchAction(...args: T): void {
        for (let i = this.eventList.length - 1; i >= 0; i--) {
            let action = this.eventList[i];
            action.event.call(action.target, ...args);
            if (action.once) this.eventList.splice(i, 1);
        }
    }

    public dispatchActionAndComplete(...args: T): void {
        this.completeArgs = args;
        this.dispatchAction(...args);
    }
}