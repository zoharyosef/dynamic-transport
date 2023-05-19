export interface Point {
    x: number;
    y: number;
    cluster?: number;
}

export function DBSCAN(points: Point[], epsilon: number, minPts: number): number[][] {
    let clusterIdx = 0;

    for (let i = 0; i < points.length; i++) {
        if (points[i].cluster !== undefined) {
            continue;
        }

        const neighbors = getNeighbors(points, i, epsilon);

        if (neighbors.length < minPts) {
            points[i].cluster = -1;
            continue;
        }

        clusterIdx++;
        points[i].cluster = clusterIdx;
        expandCluster(points, i, neighbors, clusterIdx, epsilon, minPts);
    }

    const clusters: number[][] = [];

    for (let i = 1; i <= clusterIdx; i++) {
        const cluster: number[] = [];

        for (let j = 0; j < points.length; j++) {
            if (points[j].cluster === i) {
                cluster.push(j);
            }
        }

        clusters.push(cluster);
    }

    return clusters;
}

function expandCluster(points: Point[], i: number, neighbors: number[], clusterIdx: number, epsilon: number, minPts: number): void {
    for (let j = 0; j < neighbors.length; j++) {
        if (points[neighbors[j]].cluster !== undefined) {
            continue;
        }

        points[neighbors[j]].cluster = clusterIdx;

        const nextNeighbors = getNeighbors(points, neighbors[j], epsilon);

        if (nextNeighbors.length >= minPts) {
            expandCluster(points, neighbors[j], nextNeighbors, clusterIdx, epsilon, minPts);
        }
    }
}

function getNeighbors(points: Point[], i: number, epsilon: number): number[] {
    const neighbors: number[] = [];

    for (let j = 0; j < points.length; j++) {
        if (i !== j) {
            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= epsilon) {
                neighbors.push(j);
            }
        }
    }

    return neighbors;
}
