import Editor from '../Editor';
import { TextDocument, EditorRange } from '@typewriter/document';
export interface VirtualRenderWhat {
    old?: TextDocument;
    doc?: TextDocument;
    selection: EditorRange | null;
}
export declare function virtualRendering(editor: Editor): {
    render: (what?: VirtualRenderWhat) => void;
    init(): void;
    destroy(): void;
};
