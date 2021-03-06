import { Modifier, EHTMLInjectionType, EType, IHTMLInjection, IModifierRange, Modifiers } from 'chipmunk.client.toolkit';
import { default as AnsiUp } from 'ansi_up';

interface ITag {
    tag: string;
    type: 'open' | 'close';
}

interface ITagPoint {
    offset: number;
    tag: ITag;
}

interface IRange extends IModifierRange {
    injection: string;
}

export class AsciiModifier extends Modifier {

    private _ranges: IRange[] = [];

    constructor(row: string) {
        super();
        this._map(row);
    }

    public getInjections(): IHTMLInjection[] {
        const injections: IHTMLInjection[] = [];
        this._ranges.forEach((range: IRange) => {
            injections.push(...[{
                    offset: range.start,
                    injection: range.injection,
                    type: EHTMLInjectionType.open,
                },
                {
                    offset: range.end,
                    injection: `</span>`,
                    type: EHTMLInjectionType.close,
                },
            ]);
        });
        return injections;
    }

    public type(): EType {
        return EType.breakable;
    }

    public obey(ranges: Array<Required<IModifierRange>>) {
        const rebuild: IRange[] = [];
        ranges.forEach((master: Required<IModifierRange>) => {
            this._ranges.forEach((slave: IRange) => {
                if ((slave.start < master.start && slave.end < master.end) ||
                    (slave.end === master.end && slave.start < master.start)) {
                    slave.end = master.start;
                    rebuild.push(slave);
                } else if (slave.start > master.start && slave.end < master.end) {
                    // Remove range
                } else if ((slave.start > master.start && slave.start < master.end && slave.end > master.end) ||
                           (slave.start === master.start && slave.end > master.end)) {
                    slave.start = master.end;
                    rebuild.push(slave);
                } else if (slave.start < master.start && slave.end > master.end) {
                    const end = slave.end;
                    slave.end = master.start;
                    rebuild.push(slave);
                    rebuild.push({ start: master.end, end: end, injection: slave.injection });
                } else {
                    rebuild.push(slave);
                }
            });
            this._ranges = rebuild;
        });
    }

    public getRanges(): Array<Required<IModifierRange>> {
        return this._ranges;
    }

    public getGroupPriority(): number {
        return 1;
    }

    public finalize(str: string): string {
        return str.replace(/[\u0000-\u001f]?(\u001b\[[\d;]*[HfABCDsuJKmhIp])/gi, '');
    }

    public getName(): string {
        return 'AsciiModifier';
    }

    private _map(row: string) {
        function getTag(str: string): undefined | ITag {
            const ansiup = new AnsiUp();
            ansiup.escape_for_html = false;
            const inj = 'INJECT';
            const html = ansiup.ansi_to_html(str + inj);
            const open: RegExpMatchArray | null = html.match(/\<span.*?\>INJECT/gi);
            if (open !== null) {
                return { tag: open[0].replace(inj, ''), type: 'open' };
            } else if (html === inj) {
                return { tag: '</span>', type: 'close' };
            } else {
                return undefined;
            }
        }
        const points: ITagPoint[] = [];
        row.replace(/[\u0000-\u001f]?(\u001b\[[\d;]*[HfABCDsuJKmhIp])/gi, (match: string, ...args: any[]) => {
            const offset: number = typeof args[args.length - 2] === 'number' ? args[args.length - 2] : args[args.length - 3];
            const tag: ITag | undefined = getTag(match);
            if (tag === undefined) {
                return '';
            }
            points.push({ offset: offset, tag: tag });
            return '';
        });
        points.forEach((current: ITagPoint, index: number) => {
            const next: ITagPoint | undefined = points[index + 1];
            if (current.tag.type === 'close') {
                return;
            }
            if (next === undefined) {
                return this._ranges.push({
                    start: current.offset,
                    end: row.length,
                    injection: current.tag.tag,
                });
            }
            this._ranges.push({
                start: current.offset,
                end: next.offset,
                injection: current.tag.tag,
            });
        });
        // Remove nested ranges because it doesn't make sense,
        // because color is same
        this._ranges = Modifiers.removeIncluded(this._ranges) as IRange[];
        // Remove conflicts
        this._ranges = Modifiers.removeCrossing(this._ranges) as IRange[];
    }

}
