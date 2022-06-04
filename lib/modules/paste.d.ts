import { Delta, EditorRange } from '@typewriter/document';
import Editor from '../Editor';
export interface PasteEventInit extends EventInit {
    delta: Delta;
    html?: string;
    text?: string;
}
export declare class PasteEvent extends Event {
    delta: Delta;
    html?: string;
    text?: string;
    constructor(type: string, init: PasteEventInit);
}
export interface PasteOptions {
    text?: string;
    html?: string;
    selection?: EditorRange | null;
}
export interface PasteOptions {
    htmlParser?: (editor: Editor, html: string) => Delta;
}
export declare function paste(editor: Editor, options?: PasteOptions): {
    commands: {
        paste: ({ selection, text, html }: PasteOptions) => void;
    };
    init(): void;
    destroy(): void;
};
