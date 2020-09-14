// tslint:disable

/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />

//./node_modules/.bin/jasmine-ts src/something.spec.ts

import { CommentSelectionModifier } from '../src/modifier';
/**
 * 
 * start: 0,
      end: 98,
      injection: '<span style="color:rgb(187,0,0);background-color:rgb(0,0,0)">'
 */

interface ITestRowOutput {
    start: number;
    end: number;
    injection: string;
}

interface IModifierTestRow {
    input: string;
    output: {
        ranges: ITestRowOutput[],
        injections: number,
    };
}

const ModifierRowsTest: IModifierTestRow[] = [
    {
        input: '[31;5;40m01-23 10:01:20.092  2116  5210 I chatty  : uid=1000(system) Binder:2116_16 expire 4 lines[0m',
        output: {
            ranges: [
                { start: 0, end: 98, injection: '<span style="color:rgb(187,0,0);background-color:rgb(0,0,0)">' },
            ],
            injections: 2,
        }
    },
    {
        input: '[31;5;40m01-23 10:01:20.092[0m  2116  [31;5;40m5210 I chatty  : uid=1000(system) Binder:2116_16 expire 4 lines[0m',
        output: {
            ranges: [
                { start: 0, end: 27, injection: '<span style="color:rgb(187,0,0);background-color:rgb(0,0,0)">' },
                { start: 40, end: 112, injection: '<span style="color:rgb(187,0,0);background-color:rgb(0,0,0)">' },
            ],
            injections: 4,
        }
    },
    {
        input: '[31;5;40m01-23 10:01:20.092  2116  5210 I chatty  : uid=1000(system) Binder:2116_16 expire 4 lines',
        output: {
            ranges: [
                { start: 0, end: 99, injection: '<span style="color:rgb(187,0,0);background-color:rgb(0,0,0)">' },
            ],
            injections: 2,
        }
    },
    {
        input: '[31;5;40m01-23 10:01:20.092  2116  5210 I chatty  : uid=1000(system) Binder:2116_16 expire 4 lines[0m',
        output: {
            ranges: [
                { start: 0, end: 98, injection: '<span style="color:rgb(187,0,0);background-color:rgb(0,0,0)">' },
            ],
            injections: 2,
        }
    },
    {
        input: '[31;5;40m01-23 10:01:20.092  2116  5210 I chatty[0m  : uid=1000(system)[0m Binder:2116_16 expire 4 lines[0m',
        output: {
            ranges: [
                { start: 0, end: 48, injection: '<span style="color:rgb(187,0,0);background-color:rgb(0,0,0)">' },
            ],
            injections: 2,
        }
    },
];

describe('Parser tests', () => {

    it('Modifier', (done: Function)=> {
        ModifierRowsTest.forEach((row: IModifierTestRow) => {
            const modifier: CommentSelectionModifier = new CommentSelectionModifier(row.input);
            expect(modifier.getRanges().length).toBe(row.output.ranges.length);
            modifier.getRanges().forEach((range: any, n: number) => {
                const out = row.output.ranges[n];
                Object.keys(out).forEach((prop: string) => {
                    expect((out as any)[prop]).toBe(range[prop]);
                });
            });
            expect(modifier.getInjections().length).toBe(row.output.injections);
        });
        done();
    });


});
