
export enum NoteValue {
    Whole = 'Whole',
    Half = 'Half',
    Quarter = 'Quarter',
    Eighth = 'Eighth',
    Sixteenth = 'Sixteenth',
}

export enum NotePitch {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
    F = 'F',
    G = 'G',
}

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
