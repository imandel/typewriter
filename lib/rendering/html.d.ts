import { TextDocument, EditorRange, Line } from '@typewriter/document';
import Editor from '../Editor';
import { Delta } from '@typewriter/delta';
export declare const BLOCK_ELEMENTS = "address, article, aside, blockquote, editor, dd, div, dl, dt, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, li, main, nav, noscript, ol, output, p, pre, section, table, tfoot, ul, video";
export interface DeltaFromHTMLOptions {
    possiblePartial?: boolean;
    collapseWhitespace?: boolean;
}
export interface FromDomOptions {
    root?: HTMLElement;
    startNode?: Node;
    endNode?: Node;
    offset?: number;
    possiblePartial?: boolean;
    includeIds?: boolean;
    collapseWhitespace?: boolean;
}
export declare function isBRPlaceholder(editor: Editor, node: Node): boolean;
export declare function docToHTML(editor: Editor, doc: TextDocument): string;
export declare function inlineToHTML(editor: Editor, delta: Delta): string;
export declare function docFromHTML(editor: Editor, html: string, selection?: EditorRange | null): TextDocument;
export declare function deltaFromHTML(editor: Editor, html: string, options?: DeltaFromHTMLOptions): Delta;
export declare function docFromDom(editor: Editor, root: HTMLElement): TextDocument;
export declare function fromNode(editor: Editor, dom: HTMLElement): Line | Line[] | undefined;
export declare function cleanText(delta: Delta): void;
export declare function deltaFromDom(editor: Editor, options?: FromDomOptions): Delta;
