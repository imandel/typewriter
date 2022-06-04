import Editor from '../Editor';
import { EditorRange } from '@typewriter/document';
export interface CopyOptions {
    copyPlainText?: boolean;
    copyHTML?: boolean;
}
export interface CopyData {
    text?: string;
    html?: string;
    selection?: EditorRange | null;
}
export declare function copy(editor: Editor, options?: CopyOptions): {
    commands: {
        getCopy: (selection?: EditorRange) => {
            text: string;
            html: string;
        };
    };
    init(): void;
    destroy(): void;
};
