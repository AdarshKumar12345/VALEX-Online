chat-service/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── chat.controller.js
│   │   └── message.controller.js
│   ├── models/
│   │   ├── conversation.model.js
│   │   └── message.model.js
│   ├── routes/
│   │   ├── chat.routes.js
│   │   └── message.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── services/
│   │   ├── chat.service.js
│   │   └── message.service.js
│   ├── sockets/
│   │   └── chat.socket.js
│   ├── utils/
│   │   └── response.js
│   └── server.js
├── .env
├── package.json
├── Dockerfile
└── README.md


| Gateway route                         | Chat Service route                   | Method  | Purpose                  |
| ------------------------------------- | ------------------------------------ | ------- | ------------------------ |
| `/chat/chats`                         | `/api/chats`                         | `POST`  | Create conversation      |
| `/chat/chats`                         | `/api/chats`                         | `GET`   | Get user's conversations |
| `/chat/chats/:conversationId`         | `/api/chats/:conversationId`         | `GET`   | Get one conversation     |
| `/chat/messages`                      | `/api/messages`                      | `POST`  | Send message             |
| `/chat/messages/:conversationId`      | `/api/messages/:conversationId`      | `GET`   | Get messages             |
| `/chat/messages/:conversationId/read` | `/api/messages/:conversationId/read` | `PATCH` | Mark messages read       |


// Create conversation
POST http://localhost:5000/chats

// Get my conversations
GET http://localhost:5000/chats

// Get single conversation
GET http://localhost:5000/chats/:conversationId

// Send message
POST http://localhost:5000/chats/messages

// Get messages
GET http://localhost:5000/chats/messages/:conversationId

// Mark messages as read
PATCH http://localhost:5000/chats/messages/:conversationId/read