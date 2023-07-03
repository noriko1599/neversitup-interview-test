# Neversitup Interview Test

## Overview

This project uses a robust and scalable microservices architecture to deliver a powerful e-commerce application. The system is primarily built using NestJS, a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

The key technologies and services used in the project are:

- **EventstoreDB**: EventstoreDB is a robust data store for event-sourced systems. It allows us to manage the state of our application by saving each state change as an event in a log. This approach offers high performance and consistency for our application data.

- **PostgreSQL**: PostgreSQL is our primary relational database management system. We use it to store all transactional data that is not suitable for an event-based system, such as user accounts and order details.

- **PgAdmin4**: PgAdmin4 is a comprehensive PostgreSQL database management GUI. It offers a visual interface to our PostgreSQL database, simplifying database management and query operations.

- **NestJS**: NestJS serves as the backbone of our application. We use it to build a high-performance API Gateway, manage our microservices, and handle all server-side logic. In addition, we've implemented a custom EventstoreDB transport layer and client within our NestJS application to facilitate communication between the microservices and the EventstoreDB.

## Getting Started

To run this project, you will need Docker and Docker Compose installed on your machine. Clone this repository and navigate to the root directory, then run the following command:

```sh
docker-compose up
```

```sh
npm i
npm run dev:all
```

## Architechture Diagram
- **Overview**: ![Architecture Diagram](https://github.com/noriko1599/neversitup-interview-test/blob/main/Architecture.png)

- **Handle Transaction Accross Services**: ![Handle Transaction Accross Services](https://github.com/noriko1599/neversitup-interview-test/blob/main/Handle_Transaction_Accross_Services.png)

## ER-Diagram
- **User**: ![User](https://github.com/noriko1599/neversitup-interview-test/blob/main/User.png)

- **Product**: ![Product](https://github.com/noriko1599/neversitup-interview-test/blob/main/Product.png)

- **Order**: ![Order](https://github.com/noriko1599/neversitup-interview-test/blob/main/Order.png)
