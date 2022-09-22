import { SharedString } from 'fluid-framework';
import React from 'react';
import { findIndex } from '../App';
import { NoteValue } from '../common';

const NoteMap: Record<NoteValue, React.ReactNode> = {
    Whole: <svg xmlns="http://www.w3.org/2000/svg" viewBox="584 171 460.17404 308.906071" width="19" height="25.25">
        <path d=" M 736.157 469.328 C 669.319 453.47 621.61 419.231 600.87 379.089 C 591.117 360.931 585.34 341.133 584.04 320.523 C 584.02 320.21 584.022 319.931 584.017 319.634 C 583.625 296.614 589.795 274.872 608.669 250.32 C 625.977 227.68 652.475 208.285 686.737 193.388 C 722.963 177.573 765.902 169.736 812.173 171.166 C 821.584 171.457 830.862 172.118 839.977 173.126 C 849.884 174.138 859.597 175.566 869.075 177.381 C 887.492 180.409 905.026 184.995 921.384 190.933 C 937.469 196.539 952.227 203.268 966.739 211.958 C 979.573 219.644 989.579 227.192 999.4 236.322 C 1004.321 241.084 1008.894 246.043 1013.088 251.179 C 1016.396 255.363 1019.471 259.632 1022.298 263.975 C 1025.437 269.026 1028.208 273.869 1030.793 279.353 C 1039.259 297.31 1043.713 317.693 1044.174 334.941 C 1044.186 369.107 1026.833 399.832 997.813 424.069 C 976.427 442.703 950.811 456.613 917.646 467.012 C 892.937 474.76 867.18 478.943 841.601 479.684 C 833.13 480.113 826.59 479.803 817.976 479.721 C 788.949 478.785 761.439 475.194 736.157 469.328 Z  M 880 426 C 884.439 422.563 887.498 419.393 892.172 413.88 C 900.263 404.336 905.631 394.806 908.988 382.245 C 909.366 381.015 909.707 379.779 910.01 378.537 C 910.744 375.636 911.273 372.716 911.613 369.788 C 912.303 360.234 911.772 348.99 908.918 338.156 C 908.192 335.012 907.499 332.072 906.819 329.267 C 903.9 316.251 901.08 306.289 896.299 292.811 C 896.016 292.052 895.652 290.912 895.36 290.153 C 885.262 263.878 874.815 245.939 860.044 232.581 C 839.908 213.567 810.25 202.935 778.593 212.643 C 765.916 216.531 755.354 223.116 748.352 230.254 C 744.273 234.338 740.296 239.404 737.208 244.338 C 729.377 256.936 725.607 266.484 724.349 279.906 C 724.073 284.64 723.76 290.393 724.349 295.906 C 725.325 302.083 725.918 307.259 727.174 313.216 C 730.677 331.191 735.654 347.597 739.613 359.913 C 739.658 360.053 739.697 360.196 739.739 360.337 C 741.63 366.657 743.907 372.677 746.516 378.375 C 748.66 383.297 751.315 388.92 753.879 393.349 C 755.602 396.459 757.417 399.488 759.291 402.349 C 762.507 407.293 765.564 410.736 769.038 414.677 C 774.534 420.719 780.307 425.605 786.279 429.473 C 795.651 435.191 805.329 438.647 815.045 440.317 C 832.87 443.994 852.773 440.855 863.266 435.878 C 870.222 432.579 873.953 430.682 880 426 Z " fillRule="evenodd" fill="currentColor" />
    </svg>,
    Half: <svg xmlns="http://www.w3.org/2000/svg" version="1.0"
        width="30" height="50">
        <g transform="matrix(-1,0,0,-1,254,262)">
            <path
                d="M 237.68484,218.18353 C 234.289,220.0035 232.47956,223.29808 233.59262,225.77649 C 234.77988,228.42013 238.85963,229.16621 242.6992,227.44186 C 246.53876,225.7175 248.69136,222.17246 247.5041,219.52883 C 246.31683,216.88519 242.23709,216.13911 238.39752,217.86346 C 238.15755,217.97123 237.91124,218.0622 237.68484,218.18353 z M 238.79457,220.42569 C 239.0358,220.30136 239.28005,220.20766 239.53576,220.09282 C 242.80883,218.62288 245.96997,218.55375 246.59187,219.93851 C 247.21377,221.32327 245.06209,223.64013 241.78902,225.11008 C 238.51594,226.58002 235.3548,226.64915 234.73291,225.26439 C 234.15959,223.98781 235.94804,221.89278 238.79457,220.42569 z "
                fill="currentColor"
            />
            <path
                d="M 234.05234,224.51692 L 234.05234,258.10449"
                style={{
                    fill: 'none',
                    fillOpacity: 0.75,
                    fillRule: 'evenodd',
                    stroke: "currentColor",
                    strokeWidth: 1.5,
                    strokeLinecap: 'butt',
                }}
            />
        </g>
    </svg>,
    Quarter: <svg id="svg5" width="14.566" height="45" version="1.0" xmlns="http://www.w3.org/2000/svg">
        <g id="g11065" transform="translate(-440.95 -5.6389)">
            <path id="path11056" d="m451.09 49.39c3.3958-1.82 5.2053-5.1146 4.0922-7.593-1.1873-2.6436-5.267-3.3897-9.1066-1.6654-3.8396 1.7244-5.9922 5.2694-4.8049 7.913 1.1873 2.6436 5.267 3.3897 9.1066 1.6654 0.23997-0.10777 0.48628-0.19874 0.71268-0.32007z" fillRule="evenodd" fill="currentColor" />
            <path id="path11058" d="m454.73 43.056v-33.588" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </g>
    </svg>
};

export const Ribbon: React.FC<{
    activeNoteId: string | null,
    setActiveNote: (n: string | null) => void;
    sharedString: SharedString | undefined;
    activeNoteValue: NoteValue | null;
    setActiveNoteValue: (v: NoteValue | null) => void;
    addNote: () => void;
    deleteNote: () => void;
}> = ({ sharedString, activeNoteId, activeNoteValue, setActiveNoteValue, addNote, deleteNote }) => {
    React.useEffect(() => {
        if (activeNoteId === null || activeNoteValue === null || !sharedString) {
            return;
        }

        const activeNoteIdx = findIndex(sharedString, activeNoteId);

        if (activeNoteIdx === null) {
            return;
        }

        sharedString.annotateRange(activeNoteIdx, activeNoteIdx + 1, { value: activeNoteValue });
    }, [activeNoteValue, sharedString])

    return <>
        <div className="ribbon">
            <div className="notes">
                {Object.values(NoteValue).map(
                    (val) => <button
                        type="button"
                        disabled={!activeNoteValue}
                        key={val}
                        className={activeNoteValue === val ? "active" : ""}
                        onClick={() => setActiveNoteValue(val)}>
                        {NoteMap[val] ?? val}
                    </button>
                )
                }
            </div>
            <div>
                <button onClick={addNote}>Add</button>
                <button onClick={deleteNote}>Delete</button>
            </div>
        </div>
        <div className="spacer" />
    </>;
}

