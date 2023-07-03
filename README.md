# Project Title

## Overview

This project uses a robust and scalable microservices architecture to deliver a powerful e-commerce application. The system is primarily built using NestJS, a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

The key technologies and services used in the project are:

- **EventstoreDB Cluster**: EventstoreDB is a robust data store for event-sourced systems. It allows us to manage the state of our application by saving each state change as an event in a log. This approach offers high performance and consistency for our application data.

- **PostgreSQL**: PostgreSQL is our primary relational database management system. We use it to store all transactional data that is not suitable for an event-based system, such as user accounts and order details.

- **PgAdmin4**: PgAdmin4 is a comprehensive PostgreSQL database management GUI. It offers a visual interface to our PostgreSQL database, simplifying database management and query operations.

- **NestJS**: NestJS serves as the backbone of our application. We use it to build a high-performance API Gateway, manage our microservices, and handle all server-side logic. In addition, we've implemented a custom EventstoreDB transport layer and client within our NestJS application to facilitate communication between the microservices and the EventstoreDB.

- **Elasticsearch**: Elasticsearch is our primary search engine. It allows us to offer advanced search capabilities to our users, such as full-text search and filterable search results.

- **Strapi4 PostgreSQL**: Strapi is a headless CMS that we use as our time-to-market query engine. It also provides us with a data dashboard that offers sortable, searchable, and filterable tables. This simplifies data analysis and helps us make data-driven decisions.

## Getting Started

To run this project, you will need Docker and Docker Compose installed on your machine. Clone this repository and navigate to the root directory, then run the following command:

```sh
docker-compose up
```

```sh
npm i
npm run dev:all
```

## Architechture
[Architechture](https://viewer.diagrams.net/?tags=%7B%7D&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Neversitup%20Architechture%20Diagram.drawio#R%3Cmxfile%3E%3Cdiagram%20name%3D%22Architecture%22%20id%3D%22YxMUlhdweC9Xx35YY2-j%22%3E3Vpbc5s4FP41ntk%2B1APCXPxoO9lmd9PGU6fT9mlHBgUri5FHCF%2F661cCcRHCl8a3JC8J5yAJ%2BM73HR1J7lij%2BfoThYvZZxKgqAOMYN2xbjoAmJbb5%2F%2BEZ5N7XNvJHSHFgWxUOSb4F5JOQ3pTHKBEacgIiRheqE6fxDHymeKDlJKV2uyJROpTFzBEmmPiw0j3fscBm%2BVezzYq%2Fx3C4ax4smnIO3NYNJaOZAYDsqq5rNuONaKEsPxqvh6hSIBX4JL3%2B3PL3fLFKIrZIR0eHr99Id%2F%2F%2Bfpv8vx5GqcTgJ%2BfPlr5KEsYpfKD5cuyTYEACjgg0iSUzUhIYhjdVt4hJWkcIPEYg1tVm3tCFtxpcuczYmwjowtTRrhrxuaRvJs%2FUzxo67dJV0JS6qMdH1RwBNIQsR3tQBkBTl1E5ojRDe9HUQQZXqrvASWHwrJdBTO%2FkEj%2FBuqmhvoowuJTm9hzzizEZTqPBj4jlGO1RJRhzs97OEXRmCSYYRLzJlPCGJnXGgwiHIobTAShjjZJWYRjNCoVY5QhEH3RencQdNBkh54kulS62Zf2qtKNJV2zmmQc40wo26%2BC22iN2Q%2FRvWtL66ccTFzfrOvGpjBi%2Fv0%2F6sbPagRhVt0ya6ME8SQ6AgfqqHekjrKuA0rhptZgQXDMktrIY%2BGomAaMBtWA3WBLPmLFnfLVjhBtT%2BPT3ePjuJVTmThVHkApR5%2BHAtEWnc5xEOSUQwn%2BBafZeCKqEg0%2BuD3s2De7xCpnQdm5mnvqDNiula3KNrpG33YVyIuZ4%2FcCrUXS9NRRC7sYgTw9JYhpqeAE4XRfR3Z4odLbs4q5M6tcITs4ryE7WKB3geygzzbvJzu4e7IDsAv1SMjBSZKD08gN4FK5AWixHIz%2F4o5PkKGV4KITcbiGU8qvQnH1xxeUsO7fkw8tt%2B5gLCIHjEHKyyD%2B%2BnHA%2F35LeJiBcYco%2BqCRZDXDDE0WMNPgii%2BsVLK0V3gnqOBMc38JZ3qXrOHKjHSlrNw1gJqYTcfcl5qFNUYUcwSElE%2Bde3sH5l7vyNx7VNz0WmlMSZD6Qt0TRJeYf%2BIuFb0SQVhWQxBGiyCcFkHYZxPElcuUrtFUhOdeWRDOWxCEownigQbZFPCG5WAdKoee27XPJQjrqoIwOy%2Bq2z9yIZlWfUNA6mj7ngA3zigi70ARHVvRHxdrXUXh1%2FGolQBvrsjOibxVe4IxVq9REstp9qV1dllZN2arM1bWvWuo9XCdXGa%2FS1%2FpuOo%2BSLGhVQ6R61f2OkNY9NXrOxLWlpjVhAXsvoL%2FkboqRm4uYPuXkpmnhfN2mZ0vGMM0aak0srsJIxTdDPVyQ9XfnuLjBGWG46llhtdSZRgtVUbZ8PQHNgfsFhZnNf4mwhwuau3HapoDez8tHdD%2FL8zgfsgPaaQ%2FyTObaZ%2FopMZRAS7X7%2FWjmrJku8i6xtQp%2B54Qvj7A4H1RGDQANt0zIszN6pw%2Bz9HVrx2s2%2F8B%3C%2Fdiagram%3E%3Cdiagram%20id%3D%22fFqApkGDF11oa6coEzn5%22%20name%3D%22ER%22%3EddHBEoIgEADQr%2BGOMmadzerSyUNnRjZhBl0GabS%2BPh0wY6wTy9uFZRbCinY8W27kFQVoklIxEnYkaZqw%2FDAtszy95NnOQ2OVCEUrVOoFAWnQhxLQR4UOUTtlYqyx66B2kXFrcYjL7qjjroY3sIGq5nqrNyWc9LrP6OoXUI1cOic0ZFq%2BFAfoJRc4fBErCSssovNROxag5%2BEtc%2FHnTn%2Byn4dZ6NyPA1Ow3j1toh9i5Rs%3D%3C%2Fdiagram%3E%3C%2Fmxfile%3E)
