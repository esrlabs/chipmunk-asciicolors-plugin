// tslint:disable:object-literal-sort-keys
import { Modifier, ARowCommonParser, IRowInfo, EThemeType} from 'chipmunk.client.toolkit';
import { AsciiSelectionModifier } from './modifier';

const REGS = {
    COLORS: /\x1b\[[\d;]{1,}[mG]/,
    COLORS_GLOBAL: /\x1b\[[\d;]{1,}[mG]/g,
};

const ignoreList: { [key: string]: boolean } = {};

export class ASCIIColorsParser extends ARowCommonParser {

    public parse(str: string, themeTypeRef: EThemeType, row: IRowInfo): Modifier | undefined {
        if (typeof row.sourceName === "string") {
            if (ignoreList[row.sourceName] === undefined) {
                ignoreList[row.sourceName] = row.sourceName.search(/\.dlt$/gi) !== -1;
            }
            if (!ignoreList[row.sourceName]) {
                return new AsciiSelectionModifier(str);
            }
        }
        return undefined;
    }
}
