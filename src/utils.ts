export function diff(x0: number, y0: number, x1: number, y1: number) {
    return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
}

// Binary Search
export function findIdx(minIdx: number, maxIdx: number, targetDate: number, list: any): number {
    if (minIdx <= maxIdx) {
        let midIdx = Math.ceil(minIdx + (maxIdx - minIdx) / 2); // Intにする
        let date = list[midIdx].date;
        if (date > targetDate) {
            return findIdx(minIdx, midIdx - 1, targetDate, list);
        } else if (date < targetDate) {
            return findIdx(midIdx + 1, maxIdx, targetDate, list);
        } else {
            return midIdx;
        }
    } else {
        return minIdx;
    }
}