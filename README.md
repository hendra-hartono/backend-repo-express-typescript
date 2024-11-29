# Backend (Express - TypeScript)

Follow API Documentation [here](https://documenter.getpostman.com/view/2877358/2sAYBXCrhm)
You can insert data using the endpoints that are provided there.

## Getting Started
To get started, follow these steps:
1. Clone this repository to your local machine.`
3. Run `npm install` to install the required dependencies.
4. Run `npm run seed` to populate first user (doctor role). You can log in with email and password written in this file `src/seeds/userFactory.ts` 
5. Run `npm run dev` to start the web server - it will run on localhost:8000

## Demonstrate
- Authentification and Authorization (RBAC)
- Payload Validation and Sanitization
- Realtime communication using `socket.io` - function `createAppointment`
- Pagination supports
- Simple data catching
