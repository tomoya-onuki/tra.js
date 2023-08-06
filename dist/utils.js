"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findIdx = exports.diff = void 0;
function diff(x0, y0, x1, y1) {
    return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
}
exports.diff = diff;
// Binary Search
function findIdx(minIdx, maxIdx, targetDate, list) {
    if (minIdx <= maxIdx) {
        let midIdx = Math.ceil(minIdx + (maxIdx - minIdx) / 2); // Intにする
        let date = list[midIdx].date;
        if (date > targetDate) {
            return findIdx(minIdx, midIdx - 1, targetDate, list);
        }
        else if (date < targetDate) {
            return findIdx(midIdx + 1, maxIdx, targetDate, list);
        }
        else {
            return midIdx;
        }
    }
    else {
        return minIdx;
    }
}
exports.findIdx = findIdx;
