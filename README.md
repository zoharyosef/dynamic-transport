# dynamic-transport
This is an attempt to show how superior dynamic transports are to predetermined bus routes.

Dynamic transport is a general name for an Uber-style cab that is connected to a network and knows in advance about potential passengers, their location, and their destination. It can calculate the best routes.

Predetermined bus routes are traditional buses with times and stops pre-set every year or so in advance by the government or whoever.

The goal is to set a score combining these 3 metrics:
1. Total passengers arrived at their destination.
2. Average trip time for any passenger on the road (lower is better).
3. Number of vehicles on the road (lower is better - to prevent congestion and support air quality).

## How to run this:
1. git clone
2. npm install
3. npm run dev (or just vite)
