import Editor from '../Editor';
import { TextDocument } from '@typewriter/document';
export interface RenderWhat {
    old?: TextDocument;
    doc?: TextDocument;
}
export declare function rendering(editor: Editor): {
    render: (what?: RenderWhat) => void;
    destroy(): void;
};
