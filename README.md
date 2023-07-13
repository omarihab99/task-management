# Task Management System

The task management system API is a web-based application built using the Nest framework that enables managers to create tasks for trainee employees. The system allows managers to assign a task to one or multiple trainees, set a deadline, and provide instructions or additional details for the task.

The system also allows coaches in the company to give feedback on the trainee's tasks. The coaches can view the assigned tasks and provide comments or suggestions to help the trainee improve their work. The feedback provided by the coaches is visible to the trainee and the manager, ensuring transparency and accountability.

In addition, the system provides the ability for trainees to review each other's tasks. Trainees can view the tasks assigned to their colleagues and provide feedback or comments. This feature promotes collaboration and teamwork among trainees, enabling them to learn from each other's work and improve their performance.

The API is designed to be user-friendly and intuitive, with a clean and simple interface that makes it easy for users to navigate and perform their tasks. The system is secure and reliable, with robust data encryption to ensure the safety and integrity of user data.

**Overall**, the task management system API provides an efficient and effective way for managers to assign tasks to trainees, coaches to provide feedback, and trainees to collaborate and learn from each other's work.

**database schema information can be found in the** [Data Shapes](./docs/dataShapes.md)

**API routes information can be found in the** [Routes](./docs/routes.md)

## Libraries Used
- Runtime: Node.js
- Framework: Nest.js, Express.js
- Language: TypeScript
- Database: PostgreSQL
- Testing: Jest

## Installation Instructions
- clone this repo
- `cd task-management`
- `npm install`
- `npm start`

**Sample request to try out.** `http://localhost:3000`

## Ports
The API runs on port `3000`
The Socket connection runs on port `3000`
The Database connection runs on port `5432`

## Setup for .env file
``` bash
PORT=3000
ENV=development
FRONT_URL=<https://example.com>
#postgres=
  PG_DATABASE_TEST=<temporary database for test case>
  PG_DATABASE=<database name>
  PG_USERNAME=<database username>
  PG_PASSWORD=<database password>
  PG_HOST=<database localhost>
  PG_PORT=5432
#JWT=
  SECRET=<json web token secret key>
#bcrypt=
  PAPER=<additional password>
  SALT=<salt rounds>
#nodemailer=
  MAIL_USER=<email>
  MAIL_PASSWORD=<password>
  MAIL_PORT=<provider port>
  MAIL_HOST=<provider host>
```