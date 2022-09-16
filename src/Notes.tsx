function getTempCanvas() {
    const canvas = document.createElement("canvas");
    canvas.height = 100;
    canvas.width = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error();
    }
    return ctx;
}

const quarterNoteBall = new Path2D("m451.09 49.39c3.3958-1.82 5.2053-5.1146 4.0922-7.593-1.1873-2.6436-5.267-3.3897-9.1066-1.6654-3.8396 1.7244-5.9922 5.2694-4.8049 7.913 1.1873 2.6436 5.267 3.3897 9.1066 1.6654 0.23997-0.10777 0.48628-0.19874 0.71268-0.32007z");
const quarterNoteStem = new Path2D("m454.73 43.056v-33.588");
let quarterNoteCtx: CanvasRenderingContext2D | null = null;
export function getQuarterNoteCtx() {
    if (quarterNoteCtx) {
        return quarterNoteCtx;
    }

    const ctx = getTempCanvas();

    ctx.translate(-440.95, 5.5311);
    ctx.stroke(quarterNoteStem);
    ctx.fill(quarterNoteBall, "evenodd");

    quarterNoteCtx = ctx;

    return quarterNoteCtx;
}

const halfNoteBall = new Path2D("M 237.68484,218.18353 C 234.289,220.0035 232.47956,223.29808 233.59262,225.77649 C 234.77988,228.42013 238.85963,229.16621 242.6992,227.44186 C 246.53876,225.7175 248.69136,222.17246 247.5041,219.52883 C 246.31683,216.88519 242.23709,216.13911 238.39752,217.86346 C 238.15755,217.97123 237.91124,218.0622 237.68484,218.18353 z M 238.79457,220.42569 C 239.0358,220.30136 239.28005,220.20766 239.53576,220.09282 C 242.80883,218.62288 245.96997,218.55375 246.59187,219.93851 C 247.21377,221.32327 245.06209,223.64013 241.78902,225.11008 C 238.51594,226.58002 235.3548,226.64915 234.73291,225.26439 C 234.15959,223.98781 235.94804,221.89278 238.79457,220.42569 z");
const halfNoteStem = new Path2D("M 234.05234,224.51692 L 234.05234,258.10449");
let halfNoteCtx: CanvasRenderingContext2D | null = null;
export function getHalfNoteCtx() {
    if (halfNoteCtx) {
        return halfNoteCtx;
    }

    const ctx = getTempCanvas();
    ctx.transform(-1, 0, 0, -1, 247.5, 272);
    // ctx.strokeRect(x, y, 14.566, 41.17);
    ctx.stroke(halfNoteStem);
    ctx.fill(halfNoteBall, "evenodd");

    halfNoteCtx = ctx;

    return halfNoteCtx;
}

const wholeNoteBall = new Path2D("m 10.091389,2.0894754 c -5.0907201,0.1822 -9.12500016,2.5826 -9.12500016,5.5 0,3.0359996 4.36800006,5.4999996 9.75000016,5.4999996 5.381999,0 9.749999,-2.464 9.749999,-5.4999996 0,-3.036 -4.368,-5.5 -9.749999,-5.5 -0.21023,0 -0.41806,-0.0074 -0.625,0 z m -1.6250001,1.0625 c 1.3579,-0.139 3.0679801,0.4906 4.4999991,1.7812 2.14502,1.9332 2.87122,4.6438998 1.625,6.0624996 l -0.03125,0.0313 c -1.27086,1.4101 -4.062299,0.9748 -6.2187491,-0.9688 -2.15645,-1.9434998 -2.86461,-4.6835996 -1.59375,-6.0936996 0.42693,-0.4737 1.03181,-0.7422 1.71875,-0.8125 z");
let wholeNoteCtx: CanvasRenderingContext2D | null = null;
export function getWholeNoteCtx() {
    if (wholeNoteCtx) {
        return wholeNoteCtx;
    }

    const ctx = getTempCanvas();

    ctx.translate(0, 7.5 + 35);
    ctx.fill(wholeNoteBall, "evenodd");

    wholeNoteCtx = ctx;

    return wholeNoteCtx;
}

export function quarterNotePath(): { ball: Path2D; stem: Path2D } {
    return { ball: quarterNoteBall, stem: quarterNoteStem }
}

export function halfNotePath() {
    return { ball: halfNoteBall, stem: halfNoteStem }
}

export function wholeNotePath() {
    return wholeNoteBall;
}
