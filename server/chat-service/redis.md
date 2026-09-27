1. Redis connection 

import { connectRedis } from "./config/redis.js";

await connectRedis();

2. Add Redis Pub/Sub 

Create two additional Redis connections:

Redis
├── Normal client      → online status / temporary data
├── Publisher          → publish chat events
└── Subscriber         → receive chat events

config/redis.js :

redisClient
redisPublisher
redisSubscriber
connectRedis()

The reason for separate publisher/subscriber connections is that a Redis connection in subscription mode is dedicated to receiving Pub/Sub messages.

3. Integrate Pub/Sub into chat.socket.js

current flow probably looks roughly like:

User A
 ↓
Socket.IO
 ↓
Chat Service
 ↓
MongoDB
 ↓
User B

Change it to:

User A
 ↓
Socket.IO
 ↓
Chat Service
 ├── MongoDB → save message
 │
 └── Redis Publisher
          ↓
       Redis
          ↓
   Redis Subscriber
          ↓
      Socket.IO
          ↓
       User B

When a message is sent:

await Message.create(...);

await redisPublisher.publish(
    `chat:${conversationId}`,
    JSON.stringify({
        type: "NEW_MESSAGE",
        message,
    })
);

And your subscriber receives it and emits it through Socket.IO.

4. Add online/offline status

Use normal Redis:

online:user:<userId>

When connected:

await redisClient.set(
    `online:user:${userId}`,
    socket.id
);

When disconnected:

await redisClient.del(
    `online:user:${userId}`
);

Then you can check:

const socketId = await redisClient.get(
    `online:user:${userId}`
);
5. Add typing indicators

Redis is also useful for temporary typing state.

For example:

await redisClient.setEx(
    `typing:${conversationId}:${userId}`,
    3,
    "1"
);

After 3 seconds it automatically disappears.

But this is optional. Don't implement it until your basic chat works.

6. Keep MongoDB for permanent data

Don't move your messages to Redis.

Use:

MongoDB
├── conversations
├── messages
├── participants
└── listing information

Redis:

Redis
├── Pub/Sub events
├── online users
├── typing state
└── temporary chat data
Your implementation order

Do it in this order:

1. Redis connection             ✅ DONE
        ↓
2. Redis Publisher/Subscriber   ← NEXT
        ↓
3. Integrate Pub/Sub into
   chat.socket.js
        ↓
4. Online/offline status
        ↓
5. Typing indicator             ← OPTIONAL
One important point

Don't add Redis Pub/Sub until I see your current chat.socket.js. Your existing Socket.IO room and message logic determines exactly where the publisher and subscriber should go.




                    ┌─────────────┐
                    │   MongoDB   │
                    └──────▲──────┘
                           │
                           │ save
                           │
User A → Socket.IO → Chat Service
                           │
                           │ publish
                           ▼
                    ┌─────────────┐
                    │    Redis    │
                    │   Pub/Sub   │
                    └──────┬──────┘
                           │
                           │ subscribe
                           ▼
                    Chat Service
                           │
                           │ Socket.IO
                           ▼
                        User B