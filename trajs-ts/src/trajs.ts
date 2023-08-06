"use strict";

import { Trajectory } from "./Trajectory";

export function Trajs(): Trajectory {
    return new Trajectory();
}

export type Trajs = Trajectory;

// export class Trajs {
//     static get(): Trajectory {
//         return new Trajectory();
//     }
// }