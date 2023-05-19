// export function setupCounter(element: HTMLButtonElement) {
//   let counter = 0
//   const setCounter = (count: number) => {
//     counter = count
//     element.innerHTML = `count is ${counter}`
//   }
//   element.addEventListener('click', () => setCounter(counter + 1))
//   setCounter(0)
// }


export class DynamicTransport {
   location: WorldLocation = new WorldLocation()
   passengers: Passenger[] = []
   passengersCount: number = 0;
   constructor() {

   }
}

export class Passenger {
   tripStatus: 'fresh' | 'waitingForPickup' | 'inTransit' | 'arrived' = 'fresh';
   locSrc: WorldLocation
   locDest: WorldLocation
   img: string;
   transport: DynamicTransport
}

export class WorldLocation {
   x: number;
   y: number;
   img: string;

   init(x, y, img) {
      this.x = x;
      this.y = y;
      this.img = img;
      return this;
   }
} 