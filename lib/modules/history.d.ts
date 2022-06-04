import { TextChange, Delta } from '@typewriter/document';
import Editor from '../Editor';
export interface StackEntry {
    redo: TextChange;
    undo: TextChange;
}
export interface UndoStack {
    undo: StackEntry[];
    redo: StackEntry[];
}
export interface Options {
    delay: number;
    maxStack: number;
}
export declare const history: (editor: Editor) => {
    options: Options;
    hasUndo: () => boolean;
    hasRedo: () => boolean;
    undo: () => void;
    redo: () => void;
    cutoffHistory: () => void;
    clearHistory: () => void;
    setStack: (value: UndoStack) => void;
    getStack: () => UndoStack;
    getActive(): {
        undo: boolean;
        redo: boolean;
    };
    commands: {
        undo: () => void;
        redo: () => void;
    };
    shortcuts: {
        'win:Ctrl+Z': string;
        'mac:Cmd+Z': string;
        'win:Ctrl+Y': string;
        'mac:Cmd+Shift+Z': string;
    };
    init(): void;
    destroy(): void;
};
export interface HistoryModule {
    options: Options;
    hasUndo: () => boolean;
    hasRedo: () => boolean;
    undo: () => void;
    redo: () => void;
    cutoffHistory: () => void;
    clearHistory: () => void;
    setStack: (value: UndoStack) => void;
    getStack: () => UndoStack;
    destroy(): void;
}
/**
 * History is a view module for storing user changes and undoing/redoing those changes.
 *
 * Stores history for all user-generated changes. Like-changes will be combined until a selection or a delay timeout
 * cuts off the combining. E.g. if a user types "Hello" the 5 changes will be combined into one history entry. If
 * the user moves the cursor somewhere and then back to the end and types " World" the next 6 changes are combined
 * separately from the first 5 because selection changes add a cutoff history entries.
 *
 * The default options can be overridden by passing alternatives to history. To add a timeout to force a cutoff after
 * so many milliseconds set a delay like this:
 * ```js
 * const modules = {
 *   history: history({ delay: 4000 })
 * };
 * ```
 */
export declare function initHistory(initOptions?: Partial<Options>): (editor: Editor) => {
    options: Options;
    hasUndo: () => boolean;
    hasRedo: () => boolean;
    undo: () => void;
    redo: () => void;
    cutoffHistory: () => void;
    clearHistory: () => void;
    setStack: (value: UndoStack) => void;
    getStack: () => UndoStack;
    getActive(): {
        undo: boolean;
        redo: boolean;
    };
    commands: {
        undo: () => void;
        redo: () => void;
    };
    shortcuts: {
        'win:Ctrl+Z': string;
        'mac:Cmd+Z': string;
        'win:Ctrl+Y': string;
        'mac:Cmd+Shift+Z': string;
    };
    init(): void;
    destroy(): void;
};
export declare function undoStack(): UndoStack;
export declare function transformHistoryStack(stack: UndoStack, delta: TextChange | Delta): void;
