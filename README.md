# dynamic-transport
This is an attempt to show how supperior dynamic transports are from predetermined bus routes.

Dynamic transport is a general name for an Uber style cab, 
which is connected to a network and knows in advance about potential passengers, 
their location and their destination, and can calculate the best routes.

Predetermined bus routes is traditional busses, with times and stops pre-set every year or so in advance, by the goverment or whoever.

The goal is to set a score combining these 3 metrics:
Total passengers arrived to their destination.
Average trip time for any passenger on the road (lower is better).
Number of vehicles on the road (lower is better - to prevent congestion and support air quality).



# How to run this:
git clone
npm install
npm run dev (or just vite)

