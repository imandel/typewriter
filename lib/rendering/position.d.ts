import Editor from '../Editor';
import { HTMLLineElement } from './rendering';
import { EditorRange, Line } from '@typewriter/document';
import { Types } from '../typesetting';
declare type NodeOffsetAndFrozen = [Node | null, number, boolean?];
export interface LineInfo {
    line: Line;
    element: HTMLLineElement;
    rect: DOMRect;
    belowMid: boolean;
}
export declare function getIndexFromPoint(editor: Editor, x: number, y: number): number | null;
export declare function getLineInfoFromPoint(editor: Editor, y: number): LineInfo | undefined;
export declare function getBrowserRange(editor: Editor, range: EditorRange): Range;
export declare function getBoudingBrowserRange(editor: Editor, range: EditorRange): Range;
export declare function getIndexFromNodeAndOffset(editor: Editor, node: Node, offset: number, current?: number | null): number;
export declare function getIndexFromNode(editor: Editor, startNode: Node): number;
export declare function getLineElementAt(editor: Editor, index: number): HTMLLineElement | undefined;
export declare function getNodeLength(editor: Editor, parentNode: Node): number;
export declare function getNodesForRange(editor: Editor, range: EditorRange): [Node | null, number, Node | null, number];
export declare function getNodeAndOffset(editor: Editor, index: number, direction: 0 | 1): NodeOffsetAndFrozen;
export declare function textNodeLength(lines: Types, node: Node): number;
export {};
