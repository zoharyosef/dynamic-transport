import { DynamicTransport, Passenger, WorldLocation } from './model';
import './style.scss'
import { sortBy, remove } from 'lodash-es'


/**
 * return a random integer, from zero to max
 */
function rnd(max: number) {
    return Math.random() * max | 0;
}


//document.querySelector<HTMLDivElement>('#app')!.innerHTML = ``
//setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)

/**
 * Location Emojies
 */
const locsEmojies = ['🏔', '🌋', '🚲', '🛎', '🏝', '🏟', '🏗', '🏛', '🏘', '🏙', '🏚', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '💒', '🏰', '🏯', '⛲', '⛺', '🌃', '🗼', '🌉', '🏪', '🏬', '♨']

const passengersEmojies = ['👵', '👨', '👳', '👳', '🤴', '👸', '👱', '👱', '👨', '👩', '👴', '🧓', '👩', '👨', '👩', '👨', '👩', '👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '👲', '🧔', '👼', '🤶', '👮', '👮', '🕵', '👩', '👨', '👩', '👷', '👷', '💂', '💂', '🕵', '👨', '👩', '👨', '👩', '👨', '👩', '👨', '👩', '👩', '👨', '👩', '👨', '👩', '👨', '👩', '👨', '👨', '👨', '👩', '👩', '👨', '👩', '👨', '👩', '🤵', '👰', '🧕', '👨', '👩', '👨', '👩', '👨', '🤱', '🤰', '🦸', '🦸', '🦹', '🦹', '🧙', '🧙', '🧝', '🧝', '🧜', '🧜', '🧛', '🧛', '🧚', '🧚', '🧟', '🧟', '🙍', '🙍', '🙎', '🙎', '🙅', '🙅', '🤹', '🤹', '👩', '🦽', '👨', '🦽']

/**
 * How many pixels will any vehicle move in every game loop
 */
const speed = 5;

/**
 * Game loop interval in milliseconds
 */
const gameLoopInterval = 50;

/**
 * Using an emoji font for consistent look on all platforms
 */
const fontFamily = 'NotoColorEmoji';

/**
 * Dynamic Transports active in game "Ubers"
 */
const dds: DynamicTransport[] = [];
/**
 * Busses active in game - not implemented yet...
 */
const buses = [];


const passengers: Passenger[] = [];
const passengersCompleted: Passenger[] = [];

const canvas: HTMLCanvasElement = document.querySelector<HTMLCanvasElement>(".mesh");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const ctx = canvas.getContext("2d");
const arrivedCount = document.querySelector(".arrived-count");

/**
 * Add a new dynamic transport
 */
document.querySelector("#addDynamicDriverBtn")!.addEventListener("click", (ev) => {
    let dd = new DynamicTransport()
    dd.location.init(rnd(canvas.width), rnd(canvas.height), '🚕');
    dds.push(dd);
})

//init locations
const locations: WorldLocation[] = []
for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
        let wl = new WorldLocation();
        wl.img = locsEmojies[rnd(locsEmojies.length)];
        wl.x = (canvas.width / 10) * (x + 0.5);
        wl.y = (canvas.height / 10) * (y + 0.5);
        locations.push(wl);
    }
}


//game loop
setInterval(() => {
    try {
        addPassengers();
        advanceDDs();
        //advance cars
        //advance buses
    } catch (e) {
        console.error(e)
    }
}, gameLoopInterval)

//canvas loop
function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw locations
    for (const loc of locations) {
        ctx.font = `30px ${fontFamily}`
        ctx.fillText(loc.img, loc.x, loc.y);
    }

    // draw dds
    for (const dd of dds) {
        ctx.font = `25px ${fontFamily}`
        ctx.fillText(dd.location.img, dd.location.x, dd.location.y);
    }

    // draw passengers
    for (const p of passengers) {
        ctx.font = `20px ${fontFamily}`

        let wl: WorldLocation = null;
        if (p.tripStatus == 'fresh' || p.tripStatus == 'waitingForPickup') {
            wl = p.locSrc
        } else if (p.tripStatus == 'arrived') {
            wl = p.locDest
        } else if (p.tripStatus == 'inTransit' && p.transport != null) {
            wl = p.transport.location;
        }
        if (wl) {
            ctx.fillText(p.img, wl.x, wl.y);
        }
    }

    requestAnimationFrame(drawCanvas);
}

drawCanvas();

function addPassengers() {
    //chance every game cycle
    let res = rnd(20);
    if (res == 7) { // 1/20 chance to spawn passenger every game loop
        let src = locations[rnd(locations.length)];
        let dest = locations[rnd(locations.length)]
        passengers.push({
            locSrc: new WorldLocation().init(src.x + rnd(50) - 25, src.y + rnd(50) - 25, src.img),
            locDest: new WorldLocation().init(dest.x + rnd(50) - 25, dest.y + rnd(50) - 25, dest.img),
            tripStatus: 'fresh',
            img: passengersEmojies[rnd(passengersEmojies.length)],
            transport: null
        });
    }
}

function advanceDDs() {
    for (const dd of dds) {
        if (!dd.passengers || dd.passengers.length == 0) {
            dd.passengers = takePassengersFromHive(dd);
        }
        if (!dd.passengers) {
            //unemployed :(
            return;
        }
        let p = dd.passengers[0];
        if (!p) {
            //unemployed :(
            return;
        }
        let dest: WorldLocation;
        if (p.tripStatus == 'waitingForPickup') {
            dest = p.locSrc;
        } else {
            dest = p.locDest;
        }
        let xFrag = Math.abs(dd.location.x - dest.x);
        let yFrag = Math.abs(dd.location.y - dest.y);
        if (Math.sqrt(Math.pow(xFrag, 2) + Math.pow(yFrag, 2)) < speed) {   //if distance is shorter than speed - we arrived
            if (p.tripStatus == 'waitingForPickup') {
                p.tripStatus = 'inTransit';
            } else {
                p.tripStatus = 'arrived'
                passengersCompleted.push(...dd.passengers.splice(0, 1));
                remove(passengers, pa => pa == p)
                arrivedCount.innerHTML = passengersCompleted.length.toString();
            }
            //arrival()
        } else {
            dd.location.y += (yFrag / (xFrag + yFrag)) * speed * (dd.location.y > dest.y ? -1 : 1);
            dd.location.x += (xFrag / (xFrag + yFrag)) * speed * (dd.location.x > dest.x ? -1 : 1);
        }
    }
}


function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

/**
 * This is the real bussines...
 * here a dynamic transport assignes fresh passengers to itself.
 * it should do so in the most efficient manner...
 */
function takePassengersFromHive(dd: DynamicTransport) {
    //find fresh passengers
    let freshPassengers = passengers.filter(p => p.tripStatus == 'fresh');

    //less than 3 passengers doesnt need a very complicated algo...
    if (freshPassengers.length < 3) {
        if (freshPassengers.length > 0) {
            for (let p of freshPassengers) {
                p.tripStatus = 'waitingForPickup';
                p.transport = dd;
            }
            return freshPassengers;
        }
        return null;

    }


    //try your best algo here, to find the passengers for the optimal route
    //let closestPassengers = findBestPassengersToTake(freshPassengers);
    let sortedPassengers = findBestRoute(freshPassengers)

    //assign 3 passengers at most to this dynamic transport (or add support for bigger vehicles...)
    let assignedPassengers: Passenger[] = sortedPassengers.slice(0, Math.min(3, sortedPassengers.length));


    for (let p of assignedPassengers) {
        p.tripStatus = 'waitingForPickup';
        p.transport = dd;
    }

    return assignedPassengers;
}

function findBestPassengersToTake(ps: Passenger[]): Passenger[] {
    //todo...

    return null;
}

/**
 * chat gpt 3.5 wrote this thing,
 * I just fixed it a little
 */
function findBestRoute(passengers: Passenger[]) {
    // Build a 2D array of distances between all origin and destination points
    const distances = passengers.map((passenger) => {
        return passengers.map((otherPassenger) => {
            //const distance = Math.abs(otherPassenger.origin - passenger.destination);
            return distance(passenger.locDest.x, passenger.locDest.y, otherPassenger.locSrc.x, otherPassenger.locSrc.y);
        });
    });

    // Find the shortest route using the brute-force approach
    const numPassengers = 3;
    let shortestRoute = null;
    let shortestDistance = Infinity;

    function permute(route, used) {
        if (route.length === numPassengers) {
            const currentDistance = route.reduce((totalDistance, passengerIndex, i) => {
                const passenger = passengers[passengerIndex];
                const previousPassenger = passengers[route[i - 1]];
                if (!previousPassenger) {
                    return 0;
                }
                const originToOrigin = distances[passengerIndex][route[0]];
                const destinationToDestination = distances[route[i - 1]][passengerIndex];
                //const originToDestination = Math.abs(passenger.origin - previousPassenger.destination);
                const originToDestination = distance(passenger.locSrc.x, passenger.locSrc.y, previousPassenger.locDest.x, previousPassenger.locDest.y);
                return totalDistance + originToOrigin + destinationToDestination + originToDestination;
            }, 0);

            if (currentDistance < shortestDistance) {
                shortestRoute = route;
                shortestDistance = currentDistance;
            }
        } else {
            for (let i = 0; i < numPassengers; i++) {
                if (!used.includes(i)) {
                    permute([...route, i], [...used, i]);
                }
            }
        }
    }

    permute([], []);

    // Return the shortest route as an array of passenger indices
    return shortestRoute.map((i) => passengers[i]);
}


//helps dubugging - on mouse hover, logs passenger destination
canvas.onmousemove = (e: MouseEvent) => {
    let rect = canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;

    for (const p of passengers) {
        if ((p.tripStatus == 'fresh' || p.tripStatus == 'waitingForPickup')
            && distance(p.locSrc.x, p.locSrc.y, x, y) < 25) {
            console.log(p.img + " goes to " + p.locDest.img);
            break;
        }
    }
};

//old algo test...
function findCloseGroups(points, threshold) {
    const groups = [];
    const visited = new Set();

    for (let i = 0; i < points.length; i++) {
        if (visited.has(i)) {
            continue;
        }

        const group = [i];

        for (let j = i + 1; j < points.length; j++) {
            if (visited.has(j)) {
                continue;
            }

            const dx = points[i].x - points[j].x;
            const dy = points[i].y - points[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= threshold) {
                group.push(j);
                visited.add(j);
            }
        }

        groups.push(group);
    }

    return groups;
}
