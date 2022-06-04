import { AttributeMap } from '@typewriter/document';
import Editor from '../Editor';
export declare type Replacement = [RegExp, (captured: string) => AttributeMap];
export declare type TextReplacement = [RegExp, (captured: string) => string];
export declare type Handler = (editor?: Editor, index?: number, prefix?: string, wholeText?: string) => void;
/**
 * A list of [ RegExp, Function ] tuples to convert text into a formatted line with the attributes returned by the
 * function. The function's argument will be the captured text from the regular expression.
 */
export declare const lineReplacements: Replacement[];
/**
 * A list of [ RegExp, Function ] tuples to convert text into formatted text with the attributes returned by the
 * function. The function's argument will be the captured text from the regular expression.
 */
export declare const markReplacements: Replacement[];
export declare const linkReplacements: Replacement[];
/**
 * A list of [ RegExp, Function ] tuples to convert text into another string of text which is returned by the function.
 * The function's argument will be the captured text from the regular expression.
 */
export declare const textReplacements: TextReplacement[];
/**
 * Allow text representations to format a line
 */
export declare function lineReplace(editor: Editor, index: number, prefix: string): boolean;
export declare function linkReplace(editor: Editor, index: number, prefix: string): boolean;
export declare function markReplace(editor: Editor, index: number, prefix: string, wholeText: string): boolean;
export declare function textReplace(editor: Editor, index: number, prefix: string): boolean;
export declare const defaultHandlers: (typeof lineReplace)[];
export declare function smartEntry(handlers?: Handler[]): (editor: Editor) => {
    destroy(): void;
};
