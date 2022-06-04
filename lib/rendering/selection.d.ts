import { EditorRange } from '@typewriter/document';
import Editor from '../Editor';
/**
 * Get the selection range from the current browser selection
 */
export declare function getSelection(editor: Editor): EditorRange | null;
/**
 * Set the current browser selection to the given selection range
 */
export declare function setSelection(editor: Editor, range: EditorRange | null): void;
