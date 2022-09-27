
export enum NoteValue {
    Whole = 'Whole',
    Half = 'Half',
    Quarter = 'Quarter',
    // Eighth = 'Eighth',
    // Sixteenth = 'Sixteenth',
}

export function valueToInteger(val: NoteValue): number {
    switch (val) {
        case NoteValue.Whole:
            return 4;
        case NoteValue.Half:
            return 2;
        case NoteValue.Quarter:
            return 1;
    }
}

export type NotePitch = number;

export interface Note {
    value: NoteValue,
    pitch: NotePitch,
}

export interface Rest {
    value: NoteValue,
}

export type MusicalNote = Note | Rest;

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface MousePosition {
    x: number;
    y: number;
}
