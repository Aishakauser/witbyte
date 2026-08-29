export const CS_MODULES = [
{id:'cs-01',num:'01',title:'SDLC & Engineering Mindset',hours:10,phase:0,topics:['Agile','Scrum','Kanban','DevOps','Tech debt'],
content:`
## 🎯 Goal
Understand the full software development lifecycle — not just the code-writing part. Know when to use Waterfall vs Agile vs Kanban, how to estimate work, and why "technical debt" isn't just a buzzword.


## 🌍 How Amazon Does This
Amazon's process choices are unusually legible because they were written down and copied widely.

**Two-pizza teams.** Teams small enough to feed with two pizzas, each owning a service end to end — build it, deploy it, carry the pager. The point was not team size for its own sake; it was to cut the *communication* cost that makes large teams slow, and to put the people who wrote the code on the receiving end of its failures.

**Working backwards.** A new product starts by writing the press release and FAQ *first*, before any code. If you cannot describe the finished thing compellingly in a page, the idea is not ready. It is a requirements process disguised as a writing exercise, and it kills weak ideas before they consume a quarter.

**Narrative memos over slide decks.** Meetings open with everyone silently reading a six-page written document. Prose forces you to expose reasoning that bullet points let you hide — which is the same reason a design doc catches problems a diagram does not.

None of this is Agile or Waterfall as taught. It is worth seeing precisely because it does not fit the frameworks above: process is a tool you shape to the work, not a ceremony you adopt whole.

## 🧠 The SDLC — Why Process Matters

Every piece of software goes through a lifecycle. The question is whether you manage it intentionally or let it happen chaotically.

\`\`\`mermaid
flowchart LR
    R[Requirements] --> D[Design]
    D --> I[Implementation]
    I --> T[Testing]
    T --> De[Deployment]
    De --> M[Maintenance]
    M -.->|feedback| R
\`\`\`

### Waterfall vs Agile — The Core Split

**Waterfall** completes each phase fully before moving to the next. It works when requirements are fixed and well-understood — think embedded firmware for a medical device where changes after deployment are extremely costly.

**Agile** iterates in short cycles (sprints), delivering working software incrementally. It works when requirements evolve — think most web/mobile applications.

| Aspect | Waterfall | Agile |
|--------|-----------|-------|
| Change tolerance | Low — expensive to backtrack | High — built for change |
| Feedback loop | End of project | Every 1–4 weeks |
| Documentation | Heavy upfront | Living, minimal |
| Risk | Discovered late | Discovered early |
| Best for | Regulated, fixed-scope | Evolving products |

### Scrum — The Most Common Agile Framework

\`\`\`mermaid
flowchart TD
    PB[Product Backlog] -->|Sprint Planning| SB[Sprint Backlog]
    SB --> S[Sprint<br/>1–4 weeks]
    S -->|Daily Standup| S
    S --> R[Sprint Review]
    R --> Ret[Sprint Retrospective]
    Ret -.->|refined backlog| PB
    R -->|Potentially shippable<br/>increment| SHIP[🚀]
\`\`\`

**Key roles:** Product Owner (what to build), Scrum Master (process guardian), Developers (how to build it). The 2020 Scrum Guide renamed "Development Team" to simply **Developers**, to stop the team-inside-a-team framing — there is one Scrum Team, and these are accountabilities within it, not job titles.

**Events:** Sprint Planning, Daily Scrum (15 min), Sprint Review (demo), Retrospective (process improvement).

The familiar three standup questions — what I did, what I'll do, blockers — were **removed from the 2020 Scrum Guide**. They are still a fine starting structure, but they were dropped because they reliably decay into a status report to the Scrum Master. The actual purpose is for the Developers to re-plan their own next day against the Sprint Goal.

### Kanban — Flow Over Sprints

Kanban doesn't use sprints. Work flows continuously through columns: **To Do → In Progress → Review → Done**. The critical rule is **WIP limits** — limiting work-in-progress per column to prevent bottlenecks.

\`\`\`mermaid
flowchart LR
    subgraph "To Do"
        A[Feature A]
        B[Feature B]
    end
    subgraph "In Progress (WIP: 2)"
        C[Feature C]
        D[Feature D]
    end
    subgraph "Review (WIP: 1)"
        E[Feature E]
    end
    subgraph "Done"
        F[Feature F]
        G[Feature G]
    end
\`\`\`

**When to use Kanban over Scrum:** Support/ops teams with unpredictable work, teams that deploy continuously, or when sprint boundaries feel artificial.

## 🧠 Technical Debt

Technical debt is the gap between what you shipped and what you should have shipped. It's a deliberate or accidental shortcut that you'll pay interest on later.

**Types of tech debt:**
- **Deliberate/prudent:** "We know this won't scale past 1000 users, but we need to ship by Friday." You accept the debt consciously.
- **Deliberate/reckless:** "We don't have time for tests." You're choosing speed over quality without a plan to fix it.
- **Accidental:** "We didn't know about that edge case." Discovered after the fact.

⚠️ **Gotcha:** Tech debt isn't inherently bad — it's a tool. The problem is *untracked* debt. If nobody knows the shortcuts exist, nobody plans to fix them, and the codebase rots.

## 🧠 Estimation

Engineers consistently underestimate. Two practical approaches:

**Story points** — relative sizing (1, 2, 3, 5, 8, 13). A task that's a "5" is roughly 2.5x harder than a "2". Don't convert to hours — that defeats the purpose.

**T-shirt sizing** for roadmap-level estimates — S (hours), M (days), L (weeks), XL (months).

## ⌨️ Do This — Map a Real Project

Pick any project you've built or want to build. Write a one-page plan covering:
1. Which methodology fits and why
2. Break it into 3 sprints (if Agile) or phases (if Waterfall)
3. Identify 2 places you'd intentionally take on tech debt
4. Estimate effort using story points

## ⚠️ Gotcha

**"We'll fix it later" is how tech debt becomes permanent.** Deliberate tech debt is a valid tool, but only if you track it. Create a ticket for every shortcut, label it as tech debt, and schedule time to pay it down. Untracked debt compounds silently until the codebase is too fragile to change safely.

**Story points are not hours in disguise.** The moment someone asks "how many hours is a 5-point story?", the system breaks. Points measure relative complexity, not duration. A 5-point story might take 2 hours for a senior developer and 8 hours for a junior. That is fine — velocity accounts for the difference over time.

## 🛠️ Mini-Project

1. Set up a GitHub Projects board with Kanban columns (To Do, In Progress, Review, Done)
2. Create 10 issues for a hypothetical app — include a mix of features, bugs, and infrastructure tasks
3. Estimate each issue using story points (1, 2, 3, 5, 8)
4. Set WIP limits on each column (e.g., In Progress: 3, Review: 2)
5. Practice moving cards through the workflow, adding labels for priority and type
6. After completing all cards, write a one-paragraph retrospective: what went smoothly, what created bottlenecks

## ✅ You've mastered this when…

- You can explain when to use Waterfall vs Agile vs Kanban and defend your choice
- You understand Scrum ceremonies and roles
- You can estimate using story points without converting to hours
- You can identify and categorize technical debt in a real codebase
- You've set up and used a Kanban board with WIP limits
`},

{id:'cs-02',num:'02',title:'System Architecture Fundamentals',hours:12,phase:0,topics:['Monolith','Microservices','Serverless','Event-driven','MVC'],
content:`
## 🎯 Goal
Read and draw architecture diagrams. Understand the trade-offs between monolithic, microservice, and serverless architectures. Know when event-driven is the right call.


## 🌍 How Amazon Does This
Amazon ran a single monolith in 2001. Getting out of it produced the most-cited architectural decision in the industry.

**The API mandate.** Teams must expose their data and functionality only through service interfaces, with no back doors — no direct database reads, no shared-memory shortcuts. Every interface must be designed as if it were externally facing. The consequence was severe and deliberate: if the only way to reach another team's data is their API, then teams can deploy independently, and nobody can quietly couple to someone else's schema.

That last clause did something else too. Building every internal service as if strangers would use it is what made AWS possible — the infrastructure was already externalisable because it had been built to that standard internally.

**What it cost.** The monolith was fast to develop in and hard to scale. Thousands of services are the reverse: independently deployable, but a single product page now fans out to a hundred-plus service calls, and you inherit distributed-systems problems that a monolith simply does not have — partial failure, network latency, and debugging a request across dozens of hops.

The mandate is worth studying as a *trade*, not a recipe. Amazon paid that complexity because independent deployment at their headcount was worth more. At ten engineers, it usually is not.

## 🧠 Architecture Patterns

### Monolith — Start Here

A monolith is a single deployable unit. One codebase, one database, one deployment pipeline.

\`\`\`mermaid
flowchart TD
    Client[Browser/Mobile] --> LB[Load Balancer]
    LB --> App[Monolith Application<br/>Auth + API + Business Logic + UI]
    App --> DB[(Database)]
\`\`\`

**Pros:** Simple to develop, deploy, debug, and test. One codebase to search. One deployment to manage. No network calls between services.

**Cons:** Scaling is all-or-nothing. A bug in one module can crash everything. Team conflicts as codebase grows. Tech stack locked.

⚠️ **Gotcha:** "Monolith" doesn't mean "bad." Most successful products start as monoliths. Premature microservices is a far more common mistake than staying monolithic too long.

### Microservices — When You Outgrow the Monolith

Each service owns one business capability, has its own database, and communicates over the network.

\`\`\`mermaid
flowchart TD
    Client --> GW[API Gateway]
    GW --> Auth[Auth Service]
    GW --> Users[User Service]
    GW --> Orders[Order Service]
    GW --> Notify[Notification Service]
    Auth --> DB1[(Auth DB)]
    Users --> DB2[(User DB)]
    Orders --> DB3[(Order DB)]
    Notify --> MQ[Message Queue]
\`\`\`

**The trade-off is sharp:** you solve scaling and team independence problems by creating distributed systems problems — network failures, data consistency, deployment coordination, observability complexity.

| Concern | Monolith | Microservices |
|---------|----------|---------------|
| Deployment | One unit | Many independent units |
| Scaling | Whole app | Per-service |
| Data consistency | ACID transactions | Eventual consistency (Saga pattern) |
| Debugging | Stack trace | Distributed tracing |
| Team autonomy | Low | High |

### Serverless — Functions as a Service

No servers to manage. You write functions, the cloud runs them on demand.

\`\`\`mermaid
flowchart LR
    Event[HTTP / Queue / Schedule] --> FN[Lambda/Cloud Function]
    FN --> DB[(Database)]
    FN --> S3[Object Storage]
    FN --> API[External API]
\`\`\`

**Best for:** Event-driven workloads, APIs with spiky traffic, scheduled jobs, glue code between services. **Worst for:** Long-running processes, latency-sensitive apps (cold starts), workloads with steady high traffic (cost).

### Event-Driven Architecture

Instead of services calling each other directly, they emit events. Other services react.

\`\`\`mermaid
flowchart LR
    OS[Order Service] -->|OrderPlaced event| MB[Message Broker<br/>Kafka / RabbitMQ]
    MB --> IS[Inventory Service]
    MB --> NS[Notification Service]
    MB --> AS[Analytics Service]
\`\`\`

**Key benefit:** Loose coupling. The Order Service doesn't know or care who reacts to its events. You can add new consumers without changing the producer.

**Key risk:** Event ordering, duplicate delivery, eventual consistency, harder to trace the flow of a request.

## 🧠 The MVC Pattern

Model-View-Controller is the most common pattern for organizing code within a service:

\`\`\`mermaid
flowchart LR
    User -->|interacts| V[View<br/>UI layer]
    V -->|user action| C[Controller<br/>handles logic]
    C -->|reads/writes| M[Model<br/>data + rules]
    M -->|state change| V
\`\`\`

- **Model:** Data structures, business rules, database access
- **View:** What the user sees (HTML, React components, API responses)
- **Controller:** Receives input, coordinates model and view

## ⌨️ Do This — Draw Architecture Diagrams

Pick 3 apps you use daily (e.g., Uber, Slack, Instagram). For each:
1. Sketch the high-level architecture (client, services, databases, queues)
2. Identify which pattern fits (monolith? microservices? event-driven?)
3. Identify the hardest scaling challenge
4. Describe what would change if the app needed to handle 100x more users

Use Mermaid or Excalidraw — the tool matters less than the thinking.

## ⚠️ Gotcha

**Premature microservices cause more failures than monoliths.** Teams split into microservices before they understand their domain boundaries, creating tightly coupled services that must be deployed together — a "distributed monolith" with all the drawbacks of both patterns and benefits of neither.

**Event-driven does not mean "fire and forget."** Events can be lost, duplicated, or delivered out of order. In production, you need idempotent consumers (safe to process the same event twice), dead-letter queues (for events that fail processing), and monitoring for consumer lag. Without these, event-driven architecture creates invisible data loss.

## 🛠️ Mini-Project

Design the architecture for a note-taking app that supports real-time collaboration:
1. List the functional requirements (user auth, note CRUD, real-time collaboration, search, sharing)
2. Draw the full system diagram showing all components and data flow using Mermaid
3. Justify your choice of monolith vs microservices with specific trade-offs
4. Identify which parts would benefit from event-driven architecture and why
5. Design the database schema for users, notes, and sharing permissions

## ✅ You've mastered this when…

- You can draw a clear architecture diagram for any system
- You can articulate trade-offs between monolith, microservices, serverless
- You understand event-driven decoupling and its failure modes
- You know what MVC means and can identify it in real codebases
`},

{id:'cs-03',num:'03',title:'Databases & Data Modeling',hours:14,phase:0,topics:['SQL','Normalization','Indexing','ACID','NoSQL','PostgreSQL'],
content:`
## 🎯 Goal
Design a database schema, write non-trivial SQL, understand indexing and transactions, and know when to reach for NoSQL.


## 🌍 How Amazon Does This
A single Amazon order touches several stores, chosen deliberately — the "which database?" question in this module, answered per workload rather than once.

**The order itself is relational and must be ACID.** Payment captured, inventory decremented, order created: either all of it happens or none of it does. Charging a customer for an item you cannot ship is not a consistency edge case, it is a refund and a complaint.

**The cart is a different problem.** It must be always-writable and enormous, and it tolerates being briefly stale — a design that fits a key-value store far better than a relational one. Dynamo, the system Amazon built for shopping-cart-shaped workloads, is the direct ancestor of DynamoDB, and its original paper is the reason "eventually consistent" entered everyday vocabulary.

**Denormalisation earns its place here.** A product page shows a review count. Computing it with \`COUNT(*)\` over a review table on every page view is unaffordable at that traffic, so the count is stored on the product and updated as reviews arrive. That is a deliberate violation of the normalisation rules above, made for a measured reason — which is the only good reason to break them.

## 🧠 Relational Databases — Still the Default

A relational database stores data in tables with rows and columns. Tables relate to each other through foreign keys.

\`\`\`mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER_ITEM }|--|| PRODUCT : references
    USER {
        int id PK
        string name
        string email
        timestamp created_at
    }
    ORDER {
        int id PK
        int user_id FK
        decimal total
        string status
        timestamp created_at
    }
    PRODUCT {
        int id PK
        string name
        decimal price
        int stock
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
    }
\`\`\`

### Normalization — Eliminating Data Redundancy

**1NF:** Every cell holds a single value (no arrays, no repeated groups).

**2NF:** 1NF + every non-key column depends on the *entire* primary key (not just part of it).

**3NF:** 2NF + no non-key column depends on another non-key column (no transitive dependencies).

\`\`\`mermaid
flowchart LR
    UN[Unnormalized<br/>All in one table] --> NF1[1NF<br/>Atomic values]
    NF1 --> NF2[2NF<br/>Full key dependency]
    NF2 --> NF3[3NF<br/>No transitive deps]
    NF3 -.->|sometimes| DN[Denormalized<br/>For read performance]
\`\`\`

⚠️ **Gotcha:** In production, you'll often denormalize deliberately for read performance. The point of knowing normalization is to denormalize *intentionally*, not accidentally.

### SQL — The Queries That Matter

\`\`\`sql
-- JOIN: combine related tables.
-- Note COALESCE: a LEFT JOIN gives NULL (not 0) for users with no orders,
-- and the HAVING filters on that same expression so zero-order users are
-- kept rather than silently dropped -- which is the whole point of LEFT JOIN.
SELECT u.name,
       COUNT(o.id) as order_count,
       COALESCE(SUM(o.total), 0) as lifetime_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING COALESCE(SUM(o.total), 0) > 100
ORDER BY lifetime_value DESC;

-- Subquery: orders with above-average totals
SELECT * FROM orders
WHERE total > (SELECT AVG(total) FROM orders);

-- Window function: rank users by TOTAL spending.
-- Ranking over o.total would rank individual orders, so a user with three
-- small orders never places -- aggregate first, then rank the aggregate.
SELECT u.name,
       SUM(o.total) as lifetime_value,
       RANK() OVER (ORDER BY SUM(o.total) DESC) as spending_rank
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
\`\`\`

### Indexing — Why Your Query is Slow

An index is a sorted data structure (usually a B-tree) that lets the database find rows without scanning the entire table.

\`\`\`mermaid
flowchart TD
    Q["SELECT * FROM users WHERE email = 'x'"] --> D{Index on email?}
    D -->|No| FS["Full table scan O(n) — checks every row"]
    D -->|Yes| IS["Index lookup O(log n) — B-tree descent"]
\`\`\`

**Rules of thumb:**
- Index columns you WHERE, JOIN, or ORDER BY on frequently
- Composite indexes: column order matters — \`(a, b)\` helps queries on \`a\` or \`a AND b\`, but NOT \`b\` alone
- Every index slows down writes (INSERT/UPDATE/DELETE) because the index must be updated too
- Use \`EXPLAIN ANALYZE\` to see the query plan

### ACID Transactions

| Property | Meaning | Example |
|----------|---------|---------|
| **Atomicity** | All or nothing | Transfer $100: debit AND credit both succeed, or neither does |
| **Consistency** | Rules are always satisfied | Balance can't go negative if the schema forbids it |
| **Isolation** | Concurrent transactions don't interfere | Two transfers to the same account don't lose money |
| **Durability** | Committed data survives crashes | Power loss after commit — data is still there |

## 🧠 NoSQL — When Relations Aren't the Best Fit

| Type | Examples | Best for |
|------|----------|----------|
| Document | MongoDB, Firestore | Flexible schemas, nested data, rapid iteration |
| Key-Value | Redis, DynamoDB | Caching, sessions, simple lookups at extreme speed |
| Graph | Neo4j | Relationships ARE the data (social networks, fraud detection) |
| Column-family | Cassandra | Write-heavy, time-series, massive scale |

**The decision framework:**
- Default to PostgreSQL. It handles 90% of use cases.
- Use Redis for caching/sessions alongside your primary DB.
- Reach for MongoDB when your schema genuinely varies per document.
- Reach for a graph DB when your queries are about traversing relationships.

## ⌨️ Do This

1. Install PostgreSQL locally (or use Supabase/Neon for a free cloud instance)
2. Create the users/orders/products schema above
3. Write the SQL queries shown — run them, modify them, break them
4. Use \`EXPLAIN ANALYZE\` on a query before and after adding an index

## ⚠️ Gotcha

**Over-normalizing is as bad as not normalizing.** In production, a query that JOINs 6 tables to display a single page is a performance problem. The point of knowing normalization is to denormalize *intentionally* when measurements justify it — not to achieve the highest normal form possible.

**Indexing everything is not free.** Every index speeds up reads but slows down writes (INSERT/UPDATE/DELETE) because the index must be updated too. An unused index wastes disk space and write performance. Use \`pg_stat_user_indexes\` to find indexes that are never scanned, and drop them.

## 🛠️ Mini-Project

Design and build the database for a blog platform:
1. Design the schema: Users, Posts, Comments, Tags (many-to-many with posts via a join table)
2. Normalize to 3NF, then deliberately denormalize one thing for read performance (e.g., store comment count on the posts table)
3. Write 5 non-trivial queries: a multi-table JOIN, a GROUP BY with HAVING, a subquery, a window function, and a CTE (Common Table Expression)
4. Add indexes on columns used in WHERE and JOIN clauses, and prove they help with \`EXPLAIN ANALYZE\` before-and-after comparisons
5. Write a transaction that transfers "credits" between two users and demonstrate atomicity (both succeed or both fail)

## ✅ You've mastered this when…

- You can design a normalized schema and justify denormalization decisions
- You write JOINs, subqueries, and window functions confidently
- You understand how indexes work and can create them strategically
- You can explain ACID with a real example (bank transfer)
- You know when PostgreSQL is enough and when to reach for NoSQL
`},

{id:'cs-04',num:'04',title:'API Design & Integration',hours:10,phase:0,topics:['REST','GraphQL','gRPC','WebSockets','OpenAPI'],
content:`
## 🎯 Goal
Design APIs that developers actually want to use. Understand REST (properly), GraphQL, gRPC, and WebSockets — and when each is the right tool.


## 🌍 How Amazon Does This
Amazon runs both kinds of API in this module, and the split is instructive.

**External APIs are conservative.** The public Product Advertising API is REST-ish over HTTP with versioned endpoints, cursor pagination and strict rate limits. It is deliberately boring, because thousands of third parties depend on it and you cannot ask them all to migrate.

**Internal APIs are not.** Service-to-service traffic favours binary protocols and generated clients, where the schema is the contract and the wire format is compact — the trade every large system makes once call volume is internal and both ends deploy together.

**Pagination is where scale shows.** Offset pagination (\`LIMIT 20 OFFSET 10000\`) makes the database count past ten thousand rows it will discard, and it produces duplicates and gaps when the underlying data changes between pages. Cursor pagination — "everything after this opaque token" — is stable under writes and stays cheap however deep you go. On a catalogue of hundreds of millions of items, that is not a refinement; offset pagination simply does not work.

## 🧠 What Is an API?

An API (Application Programming Interface) is a contract between two pieces of software. "Send me this, and I'll give you that back."

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    C->>API: Request (method + path + body)
    API->>API: Validate, process, query DB
    API-->>C: Response (status + body)
\`\`\`

## 🧠 REST — The Default

REST (Representational State Transfer) maps CRUD operations to HTTP methods on *resources* (nouns, not verbs).

| Operation | HTTP Method | URL | Body |
|-----------|-------------|-----|------|
| List all | GET | /api/notes | — |
| Get one | GET | /api/notes/42 | — |
| Create | POST | /api/notes | { title, body } |
| Update | PUT | /api/notes/42 | { title, body } |
| Partial update | PATCH | /api/notes/42 | { title } |
| Delete | DELETE | /api/notes/42 | — |

**REST done right:**
- URLs are nouns: \`/users/5/orders\` not \`/getUserOrders?id=5\`
- Status codes mean something: 201 Created, 404 Not Found, 422 Unprocessable
- Pagination: \`?page=2&limit=20\` or cursor-based \`?cursor=abc123\`
- Versioning: \`/api/v1/notes\` or \`Accept: application/vnd.api.v1+json\`

⚠️ **Gotcha — Idempotency:** GET, PUT, DELETE should be idempotent (calling them twice has the same effect as calling once). POST is not idempotent — creating twice creates two resources. This matters for retries.

### Rate Limiting

Protects your API from abuse and cascading failures:

\`\`\`
HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1625097600
\`\`\`

Common strategies: fixed window (100 req/min), sliding window, token bucket.

## 🧠 GraphQL — When REST Overfetches

GraphQL lets the client specify exactly which fields it needs:

\`\`\`graphql
query {
  user(id: 5) {
    name
    email
    orders(last: 3) {
      total
      items { productName, quantity }
    }
  }
}
\`\`\`

\`\`\`mermaid
flowchart LR
    subgraph REST
        R1[GET /user/5] --> R2[GET /user/5/orders]
        R2 --> R3[GET /orders/1/items]
        R2 --> R4[GET /orders/2/items]
    end
    subgraph GraphQL
        G1[Single query] --> G2[Exact data needed]
    end
\`\`\`

**Use GraphQL when:** Clients need different shapes of data (mobile vs web), you're tired of creating /v2 /v3 endpoints, or you have deeply nested data.

**Avoid GraphQL when:** Simple CRUD, server-to-server communication, or when caching matters (REST + CDN is simpler).

## 🧠 gRPC — Microservice-to-Microservice

Uses Protocol Buffers (binary, not JSON), HTTP/2, and supports streaming. Faster than REST, but not human-readable.

\`\`\`mermaid
flowchart LR
    S1[Service A] -->|gRPC / Protobuf / HTTP2| S2[Service B]
    C[Browser] -->|REST / JSON / HTTP1.1| GW[API Gateway]
    GW -->|gRPC| S1
\`\`\`

**Use gRPC for:** Internal microservice communication where latency matters. **Use REST for:** Public-facing APIs, browser clients.

## 🧠 WebSockets — Persistent Two-Way Communication

HTTP is request-response. WebSockets open a persistent connection for real-time bidirectional communication.

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: HTTP Upgrade request
    S-->>C: 101 Switching Protocols
    C->>S: message
    S->>C: message
    S->>C: message (server-initiated!)
    C->>S: message
\`\`\`

**Use for:** Chat, live dashboards, collaborative editing, gaming, notifications. **Don't use for:** Normal CRUD — the overhead isn't worth it.

## ⌨️ Do This

Build a REST API with Express.js (or FastAPI in Python):
1. Notes CRUD with proper status codes
2. Add pagination (\`?page=1&limit=10\`)
3. Add rate limiting (use \`express-rate-limit\`)
4. Document with OpenAPI/Swagger

## ⚠️ Gotcha

**REST URLs should be nouns, not verbs.** \`POST /createUser\` is an RPC-style endpoint disguised as REST. The correct REST design is \`POST /users\` — the HTTP method (POST) already says "create." Mixing verbs into URLs is the most common REST anti-pattern.

**Treating every API as REST is a mistake.** REST is the default for public-facing APIs, but internal microservice-to-microservice communication benefits from gRPC (faster, typed, streaming). Real-time features need WebSockets. Batch data queries may suit GraphQL. Pick the protocol that fits the communication pattern, not the one you know best.

## 🛠️ Mini-Project

Build a complete API with these requirements:
1. CRUD for two related resources (e.g., users and notes) with proper RESTful routes and status codes
2. Authentication using API key or JWT — protect all write endpoints
3. Rate limiting (100 requests per minute per IP), input validation with Zod or Joi, and structured error responses
4. Auto-generated OpenAPI docs using swagger-jsdoc or similar
5. A Postman collection or test suite that exercises every endpoint including error cases

## ✅ You've mastered this when…

- You design REST APIs with proper nouns, methods, status codes, and pagination
- You can explain when GraphQL beats REST and vice versa
- You know what gRPC is for and why you wouldn't use it for browser clients
- You understand WebSockets and when persistent connections are warranted
- You've built and documented a real API with rate limiting
`},

{id:'cs-05',num:'05',title:'Networking for Engineers',hours:12,phase:0,topics:['TCP/IP','HTTP/2','DNS','CORS','TLS','CDN'],
content:`
## 🎯 Goal
Understand what happens between "the client sends a request" and "the server receives it." Debug CORS errors, TLS failures, and DNS issues instead of guessing.


## 🌍 How Amazon Does This
Loading a single Amazon product page exercises nearly everything in this module, in order.

**DNS** resolves \`amazon.com\` — try \`dig amazon.com\` and note *several* A records with a short TTL. That is load distribution and fast failover, and the low TTL is what lets them move traffic in minutes.

**TLS 1.3** completes the handshake in one round trip instead of two, having dropped static RSA key exchange so that every session gets forward secrecy. On a mobile connection with 100ms of latency, removing one round trip is visible to a human.

**CDN** serves the images from a nearby edge, not from Virginia. Physics sets a floor here: light does not cross the Atlantic faster than about 30ms, so the only way to beat it is to not cross it.

**HTTP/2 multiplexing** carries the 60-plus images for that page over one connection. Under HTTP/1.1 the browser would open six connections and queue the rest — head-of-line blocking, which is what multiplexing was built to remove.

## 🧠 The TCP/IP Stack

Every network request passes through layers:

\`\`\`mermaid
flowchart TD
    subgraph "Your Code"
        APP[Application Layer<br/>HTTP, WebSocket, gRPC]
    end
    subgraph "OS / Runtime"
        TLS[TLS/SSL<br/>Encryption]
        TCP[Transport Layer<br/>TCP or UDP]
    end
    subgraph "Network"
        IP[Internet Layer<br/>IP addressing, routing]
        PHY[Link Layer<br/>Ethernet, WiFi, 5G]
    end
    APP --> TLS --> TCP --> IP --> PHY
\`\`\`

**TCP vs UDP:**
| | TCP | UDP |
|---|-----|-----|
| Reliability | Guaranteed delivery, ordered | Best effort, may lose/reorder |
| Connection | Handshake first (SYN, SYN-ACK, ACK) | No connection, just send |
| Speed | Slower (overhead) | Faster |
| Use case | HTTP, APIs, file transfer | Video streaming, gaming, DNS lookups |

## 🧠 DNS — How Names Become Addresses

\`\`\`mermaid
sequenceDiagram
    participant B as Browser
    participant LC as Local Cache
    participant R as Recursive Resolver
    participant Root as Root Server
    participant TLD as .com TLD
    participant Auth as witbyte.dev Auth
    B->>LC: witbyte.dev?
    LC-->>B: Not cached
    B->>R: witbyte.dev?
    R->>Root: .dev?
    Root-->>R: Ask .dev TLD at x.x.x.x
    R->>TLD: witbyte.dev?
    TLD-->>R: Ask auth server at y.y.y.y
    R->>Auth: witbyte.dev?
    Auth-->>R: 93.184.216.34 (TTL: 3600s)
    R-->>B: 93.184.216.34
\`\`\`

**DNS records you'll encounter:**
- **A:** Domain → IPv4 address
- **AAAA:** Domain → IPv6 address
- **CNAME:** Domain → another domain (alias)
- **MX:** Mail server for the domain
- **TXT:** Arbitrary text (used for verification, SPF, DKIM)

## 🧠 CORS — Why Your Fetch Fails

Get the direction right, because it is almost always taught backwards. The **Same-Origin Policy** is what blocks cross-origin reads — that is the default, and it is the security mechanism. **CORS is the mechanism for relaxing it**: a server uses CORS headers to opt *in* to being read by another origin. CORS does not add a restriction; it grants an exception.

The practical consequence: a CORS error never means "the browser protected you from a malicious server." It means "this server has not opted in to being read by your origin."

**CORS does not stop CSRF.** A cross-origin \`POST\` is still *sent*, with cookies, and your server still processes it — the browser only withholds the *response* from the calling JavaScript. Defending against CSRF needs its own machinery: \`SameSite\` cookies, and anti-CSRF tokens.

**Not every request preflights.** Simple requests go straight out with no \`OPTIONS\`:

\`\`\`mermaid
sequenceDiagram
    participant B as Browser at app.com
    participant API as API at api.other.com
    Note over B: Simple request — GET, no custom headers
    B->>API: GET /data
    API-->>B: Access-Control-Allow-Origin, then the body
    Note over B: Complex — custom header or PUT/DELETE
    B->>API: OPTIONS /data — preflight
    API-->>B: Allow-Origin, Allow-Methods, Allow-Headers
    B->>API: PUT /data — the real request
    API-->>B: Response body
\`\`\`

A request preflights when it leaves the "simple" set: methods beyond GET/HEAD/POST, a \`Content-Type\` other than form/plain-text/multipart, or any custom header such as \`Authorization\`. This is why adding one header to a working \`fetch\` can suddenly produce a CORS error that was not there before.

⚠️ **Gotcha:** CORS is enforced by the *browser*, not the server. Server-to-server calls (Postman, curl, your backend) are unaffected. If your API works in Postman but fails in the browser, it's CORS.

**Fix:** Set the right headers on your API server:
\`\`\`
Access-Control-Allow-Origin: https://your-frontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
\`\`\`

Note the origin needs a **scheme** — \`https://your-frontend.com\`, not \`your-frontend.com\`. A bare hostname matches nothing and fails silently.

**The credentials rule catches almost everyone.** If the request sends cookies or an \`Authorization\` header, the client must set \`credentials: "include"\` *and* the server must return \`Access-Control-Allow-Credentials: true\`. In that mode the wildcard is **forbidden**: \`Access-Control-Allow-Origin: *\` is rejected outright, and you must echo back one specific origin. This is the single most common real CORS failure — a config that works fine until you add authentication, then breaks with an error that never mentions credentials.

## 🧠 TLS/SSL — Encryption in Transit

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: ClientHello (supported ciphers, TLS version)
    S-->>C: ServerHello (chosen cipher) + Certificate
    Note over C: Verify certificate chain
    C->>S: Key exchange (asymmetric)
    Note over C,S: Both derive session key (symmetric)
    C->>S: Encrypted application data 🔒
    S-->>C: Encrypted response 🔒
\`\`\`

**What the certificate proves:** The server is who it claims to be. The certificate is signed by a Certificate Authority (CA) that the browser trusts.

## 🧠 CDNs — Caching at the Edge

A CDN (Content Delivery Network) caches your static assets on servers distributed globally, serving users from the closest location.

\`\`\`mermaid
flowchart TD
    U1[User in Tokyo] --> E1[Edge Tokyo]
    U2[User in London] --> E2[Edge London]
    U3[User in NYC] --> E3[Edge NYC]
    E1 & E2 & E3 --> O[Origin Server<br/>San Francisco]
\`\`\`

**What to CDN:** Static assets (JS, CSS, images), API responses that don't change often. **What NOT to CDN:** User-specific data, real-time data, authenticated responses.

## 🧠 HTTP/2 and HTTP/3

**HTTP/1.1 problem:** One request per TCP connection at a time. Browsers open 6 parallel connections as a workaround.

**HTTP/2 fixes:** Multiplexing (many requests on one connection) and header compression.

HTTP/2 *also* shipped **server push**, and you will still see it listed as a benefit — but it is dead. Chrome removed support in version 106 (2022) and other browsers and CDNs followed: it was hard to use correctly and usually pushed resources the client already had cached. The modern replacement is a **\`103 Early Hints\`** response, which tells the browser what to start fetching while the server is still assembling the real response — advisory rather than forced.

**HTTP/3 goes further:** Uses QUIC (built on UDP), eliminating head-of-line blocking at the transport layer.

## ⌨️ Do This

1. Open browser DevTools → Network tab. Visit a site. Identify: DNS lookup time, TLS handshake time, TTFB, content download
2. Run \`dig witbyte.dev\` (or any domain) to see DNS resolution — identify the A record and TTL
3. Deliberately trigger a CORS error: create a frontend on localhost:3000 that fetches from localhost:5000. Fix it by adding the right headers
4. Use \`curl -v https://example.com\` to observe the TLS handshake and response headers in the terminal

## ⚠️ Gotcha

**CORS errors are not server errors — they are browser security.** Your API works perfectly in Postman and curl but fails from the browser. This confuses developers endlessly. The browser blocks the response, not the server. The fix is always on the server side: add the correct \`Access-Control-Allow-Origin\` header. Never "fix" CORS by disabling browser security or using a proxy in production.

**DNS TTL can bite you during migrations.** When you change a DNS record, the old IP is cached worldwide for the duration of the TTL. If your TTL is 86400 (24 hours), some users will hit the old server for up to a day after you switch. Before a migration, lower the TTL to 300 seconds (5 min) well in advance, then make the switch.

## 🛠️ Mini-Project

Build a network debug checklist tool:
1. Create a webpage with an input field where you enter a URL
2. Use \`fetch\` to request the URL and display the response status, headers, and timing (use the Performance API or \`performance.now()\`)
3. Check and display CORS-related headers (\`Access-Control-Allow-Origin\`, \`Access-Control-Allow-Methods\`)
4. Display the HTTP version and caching headers (\`Cache-Control\`, \`ETag\`, \`Expires\`)
5. Add a summary section that flags potential issues (missing CORS headers, no caching, HTTP instead of HTTPS)

## ✅ You've mastered this when…

- You can trace a request through the TCP/IP stack
- You debug CORS errors without Googling
- You understand DNS resolution and can use \`dig\` / \`nslookup\`
- You can explain the TLS handshake at a high level
- You know when and what to put behind a CDN
`},

{id:'cs-06',num:'06',title:'Authentication & Authorization',hours:12,phase:1,topics:['OAuth 2.0','JWT','SSO','RBAC','OIDC'],
content:`
## 🎯 Goal
Implement secure authentication and authorization. Understand OAuth 2.0 flows, JWTs (and their pitfalls), and role-based access control.


## 🌍 How Amazon Does This
Amazon runs three distinct identity systems, and knowing why is worth more than memorising the flows.

**"Login with Amazon"** is the OAuth flow on this page. A third-party site sends you to Amazon, you authenticate *there*, and the site receives a code it exchanges server-side for tokens. The site never sees your password — which is the entire point, and why a compromised third party cannot leak your Amazon credentials.

**Prime Video on a TV** uses the device-code flow, because typing a password with a remote control is miserable. The TV shows a short code, you enter it on your phone, and the TV polls until authorisation completes. Same framework, different constraint.

**AWS IAM is a separate system entirely, on purpose.** Your shopping account and your IAM user are unrelated. That separation is blast radius: a compromised retail login must not reach production infrastructure. IAM is also the cleanest illustration of the authn/authz split — a policy grants a *principal* an *action* on a *resource*, which is pure authorization; proving you are that principal happened earlier and separately.

**Step-up authentication** is visible in ordinary use: browsing while signed in needs nothing, but changing your delivery address asks for the password again. The session is still valid; that particular *action* demands stronger proof.

## 🧠 AuthN vs AuthZ

**Authentication (AuthN):** "Who are you?" — Proving identity (login).
**Authorization (AuthZ):** "What can you do?" — Checking permissions.

\`\`\`mermaid
flowchart LR
    U[User] -->|credentials| AuthN[Authentication<br/>Who are you?]
    AuthN -->|identity token| AuthZ[Authorization<br/>What can you access?]
    AuthZ -->|allowed/denied| R[Resource]
\`\`\`

## 🧠 Sessions vs Tokens

**Session-based:** Server stores session state. Client gets a session ID cookie.

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Session Store
    C->>S: POST /login (email, password)
    S->>DB: Create session {userId, expiry}
    S-->>C: Set-Cookie: sessionId=abc123
    C->>S: GET /dashboard (Cookie: sessionId=abc123)
    S->>DB: Lookup session abc123
    DB-->>S: {userId: 5, valid: true}
    S-->>C: 200 OK + dashboard data
\`\`\`

**Token-based (JWT):** Server is stateless. Token carries the identity.

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: POST /login (email, password)
    S->>S: Generate JWT (sign with secret)
    S-->>C: { token: "eyJhbG..." }
    C->>S: GET /dashboard<br/>Authorization: Bearer eyJhbG...
    S->>S: Verify JWT signature + expiry
    S-->>C: 200 OK + dashboard data
\`\`\`

⚠️ **Gotcha — JWTs are not magic:**
- You can't revoke a JWT before expiry (no server-side state to delete)
- Solution: Short expiry (15 min) + refresh tokens
- Never store JWTs in localStorage (XSS vulnerable). Use httpOnly cookies.
- JWTs are signed, not encrypted — anyone can read the payload. Don't put secrets in them.

## 🧠 OAuth 2.0 — Delegated Authorization

OAuth lets users grant third-party apps access to their data without sharing their password.

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant App as Your App
    participant Auth as Google/GitHub
    participant API as Resource Server
    U->>App: "Login with Google"
    App->>Auth: Redirect to /authorize with state and code_challenge
    U->>Auth: Grants permission
    Auth-->>U: 302 redirect to callback with code and state
    U->>App: Browser follows redirect, delivering the code
    App->>App: Verify state matches what was sent
    App->>Auth: Exchange code for token, with code_verifier
    Auth-->>App: Access token + refresh token
    App->>API: GET /user with Bearer token
    API-->>App: User data
\`\`\`

**The code comes back through the browser, not server-to-server.** That single fact is why the next two parameters exist, and it is worth reading the diagram again to see it: the authorization server can only *redirect the user*, so the code travels through a URL bar you do not control.

- **\`state\`** — an unguessable value you send on the way out and verify on the way back. Without it, an attacker can feed a victim's browser *their own* authorization code and silently link the victim's session to the attacker's account. This is CSRF against the login flow itself, and omitting \`state\` is one of the most common OAuth implementation bugs.
- **PKCE** (\`code_challenge\` / \`code_verifier\`) — proves the client redeeming the code is the same one that started the flow, so an intercepted code is useless on its own.

**OAuth flows:**
- **Authorization Code + PKCE:** the default for essentially everything. PKCE began as a mobile/public-client fix, but **OAuth 2.1 recommends it for all clients including confidential server-side apps** — treat it as standard, not as the mobile variant.
- **Client Credentials:** machine-to-machine (no user involved).
- **Device Code:** input-constrained devices — TVs, CLIs — where the user authorizes on a second device.
- **Implicit:** removed in OAuth 2.1. Don't use it.

**OpenID Connect (OIDC)** adds identity on top of OAuth — it gives you an ID token with the user's profile.

## 🧠 RBAC vs ABAC

**Role-Based Access Control (RBAC):** Users have roles; roles have permissions.

\`\`\`mermaid
flowchart LR
    U[User: Ayesha] --> R[Role: Editor]
    R --> P1[Permission: read:articles]
    R --> P2[Permission: write:articles]
    R --> P3[Permission: publish:articles]
\`\`\`

**Attribute-Based Access Control (ABAC):** Decisions based on attributes — user department, resource owner, time of day, IP address.

RBAC covers 90% of needs. Reach for ABAC when you need rules like "managers can approve expenses under $10K only during business hours."

## ⌨️ Do This

1. Implement JWT authentication in an Express.js app
2. Create login/register endpoints with password hashing (bcrypt)
3. Add a protected route that requires a valid token
4. Implement role-based middleware (\`requireRole('admin')\`)

## ⚠️ Gotcha

**JWTs are not a session replacement without careful design.** A JWT cannot be revoked before it expires — there is no server-side state to delete. If a user's account is compromised, you cannot invalidate their token. The solution is short-lived access tokens (15 minutes) paired with refresh tokens stored in an httpOnly cookie. On each refresh, check if the user should still have access.

**Storing JWTs in localStorage is an XSS vulnerability.** Any JavaScript running on your page (including injected scripts from an XSS attack) can read localStorage. Use httpOnly cookies instead — they are not accessible to JavaScript. This is not optional for production systems handling real user data.

## 🛠️ Mini-Project

Build a complete auth system:
1. Registration with email verification (send a verification link with a signed token)
2. Login with JWT — short-lived access tokens (15 min) stored in httpOnly cookies plus refresh tokens with rotation
3. "Login with GitHub" via OAuth 2.0 Authorization Code flow with PKCE
4. RBAC with at least 3 roles (admin, editor, viewer) and middleware that checks permissions
5. Protected API routes that verify both authentication (valid token) and authorization (correct role for the action)

## ✅ You've mastered this when…

- You can implement JWT auth with refresh tokens
- You understand OAuth 2.0 Authorization Code flow
- You know why JWTs shouldn't go in localStorage
- You can design RBAC for a real application
- You've implemented a "Login with GitHub/Google" flow
`},

{id:'cs-07',num:'07',title:'Security Engineering',hours:12,phase:1,topics:['OWASP','XSS','CSRF','Injection','Encryption'],
content:`
## 🎯 Goal
Understand the OWASP Top 10 vulnerabilities, how they're exploited, and how to defend against them. Think like an attacker to build like a defender.


## 🌍 How Amazon Does This
The 2019 Capital One breach is the most useful single case study for this module, because one attack chained several of the categories above.

A misconfigured web application firewall on an EC2 instance could be induced to make requests on the attacker's behalf — **server-side request forgery**. That was used to reach the EC2 instance metadata service, which handed out temporary credentials for the instance's IAM role. That role had far broader S3 permissions than the application needed, so the credentials read customer data from buckets the web tier had no business touching. Roughly 100 million people were affected.

Trace which failures had to line up: a misconfiguration (A02), an over-permissive role violating least privilege (A01), and no alerting on anomalous S3 access (A09). Any one of them fixed alone would have contained it.

This is why defence in depth is not a slogan. The SSRF was the way in; the IAM role is what made it a breach rather than an incident. It is also why IMDSv2 — which requires a session token that SSRF cannot easily obtain — became the default: the platform absorbed the lesson.

## 🧠 OWASP Top 10 (2025)

The list is revised every few years from real breach data, so **always cite the year** — an unlabelled "OWASP Top 10" is not a useful reference. This is the 2025 edition, released November 2025 and the first revision since 2021.

\`\`\`mermaid
flowchart TD
    A01[A01: Broken Access Control] --> A02[A02: Security Misconfiguration]
    A02 --> A03["A03: Software Supply Chain Failures — NEW"]
    A03 --> A04[A04: Cryptographic Failures]
    A04 --> A05[A05: Injection]
    A05 --> A06[A06: Vulnerable and Outdated Components]
    A06 --> A07[A07: Authentication Failures]
    A07 --> A08[A08: Data Integrity Failures]
    A08 --> A09[A09: Security Logging and Alerting Failures]
    A09 --> A10["A10: Mishandling of Exceptional Conditions — NEW"]
\`\`\`

**What moved, and what it tells you.** Broken Access Control stays at #1. Security Misconfiguration climbed from #5 to #2. **Injection fell from #3 to #5** — not because injection stopped mattering, but because parameterized queries and ORMs became the default, which is a genuine industry-wide win worth noticing.

The two new entries are the interesting part:

- **A03 Software Supply Chain Failures** enters straight at #3, broadening the old "Vulnerable and Outdated Components" beyond your dependency list to the whole chain that produces your build — registries, CI, and build tooling included. Compromising a build pipeline reaches everyone downstream at once.
- **A10 Mishandling of Exceptional Conditions** covers improper error handling, logic that fails *open* rather than closed, and misbehaviour under abnormal conditions. A surprising share of real breaches are not clever exploits but a catch block that swallowed an error and continued as if authorized.

### SQL Injection — The Classic

**Vulnerable code:**
\`\`\`javascript
// NEVER DO THIS
const query = "SELECT * FROM users WHERE email = '" + email + "'";
\`\`\`

**Attack:** Input \`' OR '1'='1\` turns the query into:
\`\`\`sql
SELECT * FROM users WHERE email = '' OR '1'='1'
-- Returns ALL users
\`\`\`

**Fix:** Parameterized queries:
\`\`\`javascript
const query = "SELECT * FROM users WHERE email = $1";
db.query(query, [email]);
\`\`\`

### XSS — Cross-Site Scripting

Attacker injects JavaScript that runs in other users' browsers.

\`\`\`mermaid
sequenceDiagram
    participant A as Attacker
    participant S as Server
    participant V as Victim
    A->>S: Posts comment: &lt;script&gt;steal(cookies)&lt;/script&gt;
    V->>S: Views comments page
    S-->>V: HTML with attacker's script embedded
    Note over V: Script runs in victim's browser!
    V->>A: Cookies/session sent to attacker's server
\`\`\`

**Fix:** Escape/encode all user input before rendering in HTML. Use frameworks that auto-escape (React does this by default). Set \`Content-Security-Policy\` headers.

### CSRF — Cross-Site Request Forgery

Attacker tricks a logged-in user's browser into making requests on their behalf.

**Fix:** CSRF tokens (a random value in the form that must match the server's expectation), SameSite cookie attribute.

## 🧠 Encryption

**At rest:** Encrypt stored data (database encryption, disk encryption). **AES-256-GCM** is the standard — name the mode, not just the cipher. AES alone says nothing about integrity: AES-256-**CBC** encrypts but does not authenticate, so an attacker can tamper with ciphertext undetected. GCM is an AEAD mode, giving you confidentiality and integrity together. "We use AES-256" is not, by itself, a statement that your data is safe from modification.

**In transit:** TLS (we covered this in Networking).

**Hashing vs encryption:** Hashing is one-way (passwords). Encryption is two-way (data you need to read back). Never encrypt passwords — hash them with bcrypt or Argon2.

## 🧠 Secrets Management

Never hardcode secrets in source code. Use:
- Environment variables (minimum)
- Secret managers (AWS Secrets Manager, HashiCorp Vault, Doppler)
- \`.env\` files locally (add to \`.gitignore\`!)

## ⌨️ Do This

1. Try SQL injection on a deliberately vulnerable app (use OWASP WebGoat or Juice Shop)
2. Set up Content-Security-Policy headers on your app
3. Implement CSRF protection in a form
4. Audit a project's dependencies for known vulnerabilities (\`npm audit\`)

## 🛠️ Mini-Project

Security audit your own API from Module 04:
- Test for SQL injection, XSS, missing auth checks
- Add input validation (use Zod or Joi)
- Set security headers (Helmet.js)
- Implement rate limiting against brute force
- Run \`npm audit\` and fix vulnerabilities

## ⚠️ Gotcha

**Security through obscurity is not security.** Hiding your API endpoints, using custom encryption, or keeping your source code private are not security measures — they're delay tactics. Assume attackers know your architecture. Real security comes from well-tested cryptographic primitives, proper access controls, and defense in depth.

**Rate limiting alone doesn't prevent brute force.** A naive rate limit of "100 requests per minute" is trivially bypassed with distributed attacks. Combine rate limiting with exponential backoff, account lockout (with careful UX), CAPTCHA on suspicious patterns, and anomaly detection. Also rate-limit by account, not just by IP — a botnet has thousands of IPs.


## ✅ You've mastered this when…

- You can explain and demonstrate SQL injection, XSS, and CSRF
- You sanitize/validate all input and encode all output
- You use parameterized queries without thinking
- You never store secrets in code or commit them to git
- You can run a basic security audit on a web application
`},

{id:'cs-08',num:'08',title:'Testing Strategy',hours:10,phase:1,topics:['Unit tests','TDD','Mocking','E2E','Load testing'],
content:`
## 🎯 Goal
Write tests that catch bugs without slowing you down. Understand the testing pyramid, TDD, mocking, and when to use each type of test.


## 🌍 How Amazon Does This
Amazon's testing priorities follow the blast radius, which is the right way to decide where to spend.

**One-click checkout must never break.** It is the revenue path, so it gets end-to-end tests against real browsers and real payment sandboxes, and those run before every deploy. E2E tests are slow and flaky and expensive — and entirely worth it *here*, because a checkout outage costs more per minute than the whole test suite costs per year.

**The tax calculator gets unit tests instead.** It is pure logic with many edge cases: jurisdictions, exemptions, digital versus physical goods. Thousands of cases run in milliseconds with no browser involved. Writing those as E2E tests would be slower, flakier, and worse at pinpointing the failure.

That is the pyramid as a *cost* argument rather than a shape to copy: put fast cheap tests where logic is dense, and reserve slow expensive ones for the few paths whose failure you cannot absorb.

## 🧠 The Testing Pyramid

\`\`\`mermaid
flowchart TD
    subgraph "Slow, expensive, few"
        E2E[E2E Tests<br/>Selenium, Playwright, Cypress]
    end
    subgraph "Medium"
        INT[Integration Tests<br/>API tests, DB tests]
    end
    subgraph "Fast, cheap, many"
        UNIT[Unit Tests<br/>Jest, pytest, JUnit]
    end
    E2E --> INT --> UNIT
\`\`\`

| Level | Tests what | Speed | Quantity |
|-------|-----------|-------|----------|
| Unit | Single function/class in isolation | ms | Hundreds |
| Integration | Components working together (API + DB) | seconds | Dozens |
| E2E | Full user flow through the real UI | minutes | Few critical paths |

⚠️ **Gotcha — Code coverage traps:** 100% coverage doesn't mean your code works. Coverage measures which lines execute, not whether the assertions are meaningful. 80% meaningful coverage beats 100% shallow coverage.

## 🧠 TDD — Test-Driven Development

\`\`\`mermaid
flowchart LR
    R[🔴 Red<br/>Write a failing test] --> G[🟢 Green<br/>Write minimal code to pass]
    G --> RF[🔵 Refactor<br/>Clean up, keep tests green]
    RF --> R
\`\`\`

**The discipline:** Write the test BEFORE the implementation. This forces you to think about the interface (what the function should accept and return) before the internals.

### Unit Test Example

\`\`\`javascript
// cart.js
function calculateTotal(items, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return Math.round(subtotal * (1 + taxRate) * 100) / 100;
}

// cart.test.js
describe('calculateTotal', () => {
  test('calculates subtotal with tax', () => {
    const items = [{ price: 10, qty: 2 }, { price: 5, qty: 1 }];
    expect(calculateTotal(items, 0.08)).toBe(27.00);
  });

  test('returns 0 for empty cart', () => {
    expect(calculateTotal([], 0.08)).toBe(0);
  });

  test('handles single item', () => {
    expect(calculateTotal([{ price: 100, qty: 1 }], 0.1)).toBe(110.00);
  });
});
\`\`\`

## 🧠 Mocking & Stubbing

When your code depends on external systems (database, API, email service), you mock those dependencies in tests.

\`\`\`javascript
// Mock the database
jest.mock('./db');
const db = require('./db');

test('getUser returns user from database', async () => {
  db.query.mockResolvedValue({ id: 1, name: 'Ada' });
  const user = await getUser(1);
  expect(user.name).toBe('Ada');
  expect(db.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
});
\`\`\`

**Mock** = fake implementation you control. **Stub** = returns predetermined data. **Spy** = records how it was called.

## ⌨️ Do This

1. Add Jest to a Node.js project: \`npm install --save-dev jest\`
2. Write unit tests for 3 pure functions
3. Write an integration test for an API endpoint (use supertest)
4. Try TDD: write the test first, then make it pass

## ⚠️ Gotcha

**100% code coverage does not mean your code works.** Coverage measures which lines execute, not whether the assertions are meaningful. A test that calls every function but never checks the return value achieves 100% coverage while catching zero bugs. Focus on *meaningful* coverage: test edge cases, error paths, and boundary conditions. 80% meaningful coverage beats 100% shallow coverage.

**Over-mocking makes tests useless.** If you mock the database, the HTTP client, the file system, and the logger, your test only verifies that your mocks behave the way you set them up — it tells you nothing about whether the real system works. Mock external dependencies you do not control (third-party APIs, payment processors), but use real implementations for your own database and services in integration tests.

## 🛠️ Mini-Project

Add a comprehensive test suite to your API from earlier modules:
1. Write unit tests for all business logic functions (validation, calculations, transformations) — test both happy paths and edge cases
2. Write integration tests for every API endpoint using supertest — cover success, validation errors, auth failures, and not-found responses
3. Mock the database in unit tests but use a real test database (Docker + test container) for integration tests
4. Set up a \`test\` script in package.json and configure coverage reporting with \`--coverage\`
5. Aim for 80%+ meaningful coverage — verify that the coverage comes from tests with real assertions, not just execution

## ✅ You've mastered this when…

- You write unit, integration, and E2E tests and know which to use when
- You can practice TDD (red → green → refactor)
- You mock external dependencies without over-mocking
- You understand why high coverage doesn't guarantee quality
- Your test suite runs in CI and blocks broken code from merging
`},

{id:'cs-09',num:'09',title:'DevOps & CI/CD',hours:14,phase:1,topics:['Docker','Kubernetes','CI/CD','Terraform','GitOps'],
content:`
## 🎯 Goal
Containerize applications, build CI/CD pipelines, and understand infrastructure as code. Deploy with confidence, not prayer.


## 🌍 How Amazon Does This
Amazon has publicly described deploying to production roughly every 11 seconds across the company. That number is not a bragging right; it is a *consequence* of the pipeline design in this module, and it inverts the usual intuition about risk.

**Small and frequent is safer than large and rare.** A deploy containing one change has an obvious culprit when it breaks. A quarterly release containing six hundred changes does not. Frequency is a debugging strategy.

**One box first.** A new version goes to a single instance while the rest of the fleet stays on the old one. Its error rate and latency are compared against its neighbours — same traffic, same conditions, a built-in control group. Only if it stays healthy does the deploy widen.

**Automatic rollback.** Alarms are wired to the deploy, not just to a dashboard. If the canary's metrics degrade, the pipeline reverts without waiting for a human to notice. Mean time to recovery matters more than mean time between failures, and a rollback nobody has to authorise at 3am is the difference.

None of this works without the earlier pieces: you cannot deploy every 11 seconds unless tests are trustworthy and rollback is boring.

## 🧠 Containers — Consistent Environments

\`\`\`mermaid
flowchart LR
    subgraph "Your Machine"
        A1[App + Node 18 + deps]
    end
    subgraph "Docker Container"
        A2[App + Node 18 + deps<br/>Identical everywhere]
    end
    subgraph "Production Server"
        A3[Same container<br/>Same behavior]
    end
    A1 -->|docker build| A2
    A2 -->|docker push/pull| A3
\`\`\`

**Container vs VM:**
| | Container | VM |
|---|-----------|-----|
| Isolation | Process-level | Hardware-level |
| Startup | Seconds | Minutes |
| Size | MBs | GBs |
| Overhead | Minimal | Full OS per VM |

### Dockerfile Example

\`\`\`dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

**Key commands:**
\`\`\`bash
docker build -t myapp:1.0 .          # Build image
docker run -p 3000:3000 myapp:1.0    # Run container
docker compose up                     # Multi-container setup
\`\`\`

## 🧠 CI/CD — Automated Quality Gates

\`\`\`mermaid
flowchart LR
    Push[Git Push] --> CI[CI Pipeline]
    CI --> Lint[Lint]
    CI --> Test[Tests]
    CI --> Build[Build]
    CI --> Sec[Security Scan]
    Lint & Test & Build & Sec --> Gate{All pass?}
    Gate -->|Yes| CD[CD Pipeline]
    Gate -->|No| Fail[❌ Block merge]
    CD --> Stage[Deploy to Staging]
    Stage --> Smoke[Smoke Tests]
    Smoke --> Prod[Deploy to Production]
\`\`\`

### GitHub Actions Example

\`\`\`yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm test
      - run: npm run lint
\`\`\`

## 🧠 Deployment Strategies

\`\`\`mermaid
flowchart TD
    subgraph "Blue-Green"
        BG1["Blue (current)"] --> LB1[Load Balancer]
        BG2["Green (new)"] --> LB1
    end
    subgraph "Canary"
        C1[Old version: 95%] --> LB2[Load Balancer]
        C2[New version: 5%] --> LB2
    end
    subgraph "Rolling"
        R1[Update 1 instance at a time]
    end
\`\`\`

## 🧠 Infrastructure as Code (IaC)

Define infrastructure in code files, version-control them, apply changes through a pipeline.

\`\`\`hcl
# Look the AMI up instead of hardcoding it. AMI ids are region-specific and
# change with every distro release -- a pasted id is the most common reason
# a working Terraform config fails in another region or ships an EOL image.
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  tags = { Name = "web-server" }
}
\`\`\`

**Terraform** = multi-cloud IaC. **Pulumi** = IaC in real programming languages. **CloudFormation** = AWS-only.

## ⌨️ Do This

1. Dockerize the API from earlier modules
2. Write a \`docker-compose.yml\` with app + PostgreSQL
3. Create a GitHub Actions workflow that runs tests on every push
4. Add a build step that creates a Docker image

## 🛠️ Mini-Project

Full CI/CD pipeline:
- Dockerize your app with a multi-stage build
- \`docker-compose.yml\` for local dev (app + DB + Redis)
- GitHub Actions: lint → test → build Docker image → push to registry
- Deploy to a free tier (Railway, Render, or Fly.io)
- Add a staging environment with manual promotion to production

## ⚠️ Gotcha

**"It works in Docker locally" means nothing.** Your local Docker environment shares the host kernel, has generous resources, and runs one container. Production Kubernetes has resource limits, network policies, multi-tenant noise, and pod scheduling across nodes. Always test with realistic resource constraints: \`resources.limits\` in your pod spec.

**CI/CD speed vs safety is a false dichotomy.** Teams skip tests in CI "because the pipeline is too slow." The answer is parallelization and test categorization (unit tests on every commit, integration tests on PR merge, E2E nightly), not skipping. A 20-minute pipeline that catches bugs is cheaper than a 2-minute pipeline that lets them into production.


## ✅ You've mastered this when…

- You can write a Dockerfile and docker-compose.yml from scratch
- Your GitHub Actions pipeline catches bugs before merge
- You understand blue-green, canary, and rolling deployment strategies
- You know what Terraform does and why "infrastructure as code" matters
- You've deployed a containerized app to a real cloud provider
`},

{id:'cs-10',num:'10',title:'Observability & Monitoring',hours:10,phase:1,topics:['Logging','Metrics','Tracing','OpenTelemetry','SLOs'],
content:`
## 🎯 Goal
Instrument your application so when something breaks at 3 AM, you know what happened, where, and why — before the user tells you.


## 🌍 How Amazon Does This
Amazon's most-quoted observability finding is that **100ms of added latency cost about 1% of sales**. That single measurement reframes the whole discipline: latency is not an engineering aesthetic, it has a price, and once you can price it you can justify the work.

**Instrument the funnel, not the server.** CPU utilisation on a checkout host is nearly useless on its own. What matters is add-to-cart success rate, checkout completion, and the p99 latency of each step. Those are the golden signals for *this* system, and they are business events that happen to be technical.

**p50 hides the problem; p99 is the customer.** With a hundred-plus service calls behind one product page, a request is only as fast as its slowest dependency. If every service has a 1% slow tail, almost every page hits at least one of them. Averages actively mislead here — this is why tail latency gets the attention.

**Traces, because the median request touches dozens of services.** When a page is slow, "which service?" is unanswerable from logs alone. Distributed tracing exists because the call graph outgrew what a human can hold in their head.

## 🧠 The Three Pillars

\`\`\`mermaid
flowchart LR
    subgraph Observability
        L[Logs<br/>What happened]
        M[Metrics<br/>How much/how fast]
        T[Traces<br/>Where it flowed]
    end
    L --> A[Answers:<br/>Error messages, audit trail]
    M --> B[Answers:<br/>Request rate, error rate, latency]
    T --> C[Answers:<br/>Which service is slow?<br/>Where did the request fail?]
\`\`\`

### Structured Logging

Don't: \`console.log("Error processing order")\`

Do:
\`\`\`json
{
  "level": "error",
  "message": "Order processing failed",
  "orderId": "ord_12345",
  "userId": "usr_789",
  "error": "Insufficient stock for product SKU-456",
  "duration_ms": 234,
  "timestamp": "2026-08-23T10:30:00Z"
}
\`\`\`

Structured logs are searchable, filterable, and machine-parseable.

### Metrics — The Four Golden Signals

| Signal | What it measures | Example |
|--------|-----------------|---------|
| Latency | How long requests take | p50: 45ms, p99: 230ms |
| Traffic | How many requests | 1,200 req/min |
| Errors | Failure rate | 0.5% 5xx responses |
| Saturation | How full your system is | CPU at 78%, memory at 62% |

### Distributed Tracing

When a request crosses multiple services, a trace ties the whole journey together:

\`\`\`mermaid
flowchart LR
    GW[API Gateway<br/>12ms] --> Auth[Auth Service<br/>8ms]
    GW --> US[User Service<br/>45ms]
    US --> DB[(Database<br/>38ms)]
    US --> Cache[Redis Cache<br/>2ms]
\`\`\`

Each span has: trace ID, span ID, parent span ID, service name, duration, status. OpenTelemetry is the standard for instrumenting all three pillars.

## 🧠 SLOs, SLAs, SLIs

- **SLI** (Service Level Indicator): The metric — "99.2% of requests completed in < 200ms"
- **SLO** (Service Level Objective): The target — "We aim for 99.5% of requests under 200ms"
- **SLA** (Service Level Agreement): The contract — "If we drop below 99%, we owe credits"

**Error budget:** If your SLO is 99.5%, you have a 0.5% error budget. As long as you're within budget, ship fast. When budget is low, freeze deploys and fix reliability.

## ⌨️ Do This

1. Replace all \`console.log\` in your API with structured logging (use Winston or Pino)
2. Add request duration tracking middleware
3. Create a health check endpoint (\`GET /health\`)
4. Set up basic metrics (request count, error count, latency histogram)

## 🛠️ Mini-Project

Instrument your API with the three pillars:
- Structured JSON logging with request IDs
- Prometheus-compatible metrics endpoint
- Health check that verifies DB connectivity
- A Grafana dashboard (use Docker) showing the four golden signals
- Define one SLO and set up an alert for when it's violated

## ⚠️ Gotcha

**Logging everything is as bad as logging nothing.** Unstructured, high-volume logs create noise that obscures real issues. Log at the right level (ERROR for failures requiring action, WARN for degraded-but-functioning, INFO for business events, DEBUG for development only). Use structured logging (JSON with consistent fields) so logs are machine-parseable.

**SLOs without error budgets are just aspirations.** An SLO of "99.9% availability" means you're allowed ~8.7 hours of downtime per year. That's your error budget. When you've burned most of it, you should slow down feature releases and focus on reliability. Without this feedback loop, SLOs are just numbers on a dashboard that nobody acts on.


## ✅ You've mastered this when…

- Your logs are structured JSON with correlation IDs
- You track the four golden signals (latency, traffic, errors, saturation)
- You understand distributed tracing and can read a trace waterfall
- You can define SLOs and explain error budgets
- You've built a dashboard that tells you system health at a glance
`},

{id:'cs-11',num:'11',title:'Performance & Scalability',hours:12,phase:2,topics:['Caching','Redis','Sharding','Load balancing','Profiling'],
content:`
## 🎯 Goal
Make systems fast and keep them fast under load. Understand caching strategies, load balancing, database scaling, and how to find bottlenecks using profiling tools. In production systems, performance is not a feature — it is a constraint that shapes every design decision.


## 🌍 How Amazon Does This
An Amazon product page is a cache hierarchy end to end, and each layer exists because the one behind it is too expensive to hit.

**CDN edge** serves images and static assets from a nearby city. **In-memory cache** holds sessions and hot product data. **A database-level cache** absorbs repeated reads. Only what survives all three reaches the primary store — and by then the traffic is a small fraction of what arrived.

**The N+1 problem lives here.** Rendering a product page with 20 seller offers naively means one query for offers plus 20 more for seller details. At page-view scale that is the difference between a working site and an outage, and it is invisible in development where you have three sellers and no latency.

**Invalidation is the hard half.** A price change must reach the edge quickly, but blowing the whole cache on every write destroys the hit rate you built it for. The genuinely difficult questions in caching are always about *when to stop trusting* what you stored — the "two hard things" joke exists because this is where the bodies are.

## 🧠 Caching — The Biggest Performance Win

Caching stores a copy of expensive-to-compute or expensive-to-fetch data closer to where it is needed.

Be careful with the numbers here, because the usual framing oversells it. A Redis lookup is ~1ms. A **warm, indexed** single-row query against Postgres on the same network is roughly **0.1–1ms** — comparable, sometimes faster. Databases are not inherently slow; they are slow when the query is unindexed, returns many rows, joins badly, or spills to disk. A query that genuinely takes 50ms is telling you something about *that query*.

This matters because "the database is slow, add a cache" is how you end up with a cache in front of a query that needed an index — now you have the original latency on every miss, plus invalidation bugs, plus stale reads. Measure the query first. Cache what is expensive to *compute* or fetch across a network you don't control (an external API at ~200ms is a much better candidate), not what is merely stored in a database.

\`\`\`mermaid
flowchart LR
    C[Client] --> App[Application]
    App --> Cache{Cache hit?}
    Cache -->|Hit| R1[Return cached data<br/>~1ms]
    Cache -->|Miss| DB[(Database<br/>~50ms)]
    DB --> W[Write to cache]
    W --> R2[Return data]
\`\`\`

**Caching layers (from fastest to slowest):**
1. **Browser cache** — static assets (Cache-Control headers)
2. **CDN cache** — geographically distributed
3. **Application cache** — Redis/Memcached
4. **Database query cache** — DB-level result caching

### Cache Invalidation Strategies

| Strategy | How it works | Consistency | Write speed | Best for |
|----------|-------------|-------------|-------------|----------|
| **TTL** | Cache expires after N seconds | Stale within window | Fast | Rarely-changing data |
| **Write-through** | Update cache + DB together | Strong | Slower | Read-heavy, consistency-critical |
| **Write-behind** | Update cache now, DB async | Eventual | Fastest | High-write throughput |
| **Cache-aside** | App manages cache manually | App-controlled | Medium | Most common pattern |

### Redis in Practice

\`\`\`javascript
const Redis = require('ioredis');
const redis = new Redis();

// Cache-aside pattern
async function getUser(userId) {
  // 1. Check cache
  const cached = await redis.get(\\\`user:\${userId}\\\`);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss — fetch from DB
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

  // 3. Store in cache with TTL (1 hour)
  await redis.set(\\\`user:\${userId}\\\`, JSON.stringify(user), 'EX', 3600);

  return user;
}

// Invalidate on update
async function updateUser(userId, data) {
  await db.query('UPDATE users SET name = $1 WHERE id = $2', [data.name, userId]);
  await redis.del(\\\`user:\${userId}\\\`); // Invalidate cache
}
\`\`\`

## 🧠 Load Balancing

A load balancer distributes incoming traffic across multiple server instances so no single server becomes a bottleneck.

\`\`\`mermaid
flowchart TD
    C1[Client] & C2[Client] & C3[Client] --> LB[Load Balancer]
    LB --> S1[Server 1]
    LB --> S2[Server 2]
    LB --> S3[Server 3]
\`\`\`

| Algorithm | How it works | Best for |
|-----------|-------------|----------|
| **Round-robin** | Rotate through servers | Equal-capacity servers |
| **Least connections** | Send to least busy | Varying request complexity |
| **IP hash** | Same client goes to same server | Sticky sessions |
| **Weighted** | More traffic to stronger servers | Mixed-capacity fleet |

**Health checks** are critical: the load balancer pings each server (e.g., \`GET /health\` every 10s). Unhealthy servers are removed from rotation automatically.

## 🧠 Database Scaling

**Vertical scaling:** Bigger machine (more RAM, faster CPU). Simple but has a ceiling.

**Horizontal scaling — Read replicas:** Write to primary, read from replicas. Replication lag means replicas may be slightly behind.

\`\`\`mermaid
flowchart TD
    App --> Primary[(Primary DB<br/>Writes)]
    Primary -->|replication| R1[(Replica 1<br/>Reads)]
    Primary -->|replication| R2[(Replica 2<br/>Reads)]
    App --> R1
    App --> R2
\`\`\`

### Sharding — Splitting Data Horizontally

Sharding distributes rows across multiple databases by a shard key. Choose the shard key carefully — it determines data distribution and which queries can be answered by a single shard.

\`\`\`mermaid
flowchart TD
    App[Application] --> Router[Shard Router]
    Router -->|user_id 1-1M| S1[(Shard 1)]
    Router -->|user_id 1M-2M| S2[(Shard 2)]
    Router -->|user_id 2M-3M| S3[(Shard 3)]
\`\`\`

**Shard key pitfalls:** If you shard by user ID and one user generates 90% of the data (a "hot shard"), your scaling breaks down. In production, teams use consistent hashing to distribute more evenly and simplify resharding.

## 🧠 Profiling — Finding the Bottleneck

Never optimize without measuring first. Profiling identifies *where* time is spent.

\`\`\`mermaid
flowchart LR
    R[Request 450ms total] --> A[Route handler<br/>5ms]
    A --> B[Auth check<br/>10ms]
    B --> C[DB query 1<br/>15ms]
    C --> D[DB query 2 x50<br/>380ms N+1!]
    D --> E[Serialize<br/>40ms]
\`\`\`

**The N+1 query problem** is the most common backend performance issue:

\`\`\`javascript
// BAD — N+1: 1 query for posts + N queries for authors
const posts = await db.query('SELECT * FROM posts LIMIT 50');
for (const post of posts) {
  post.author = await db.query('SELECT * FROM users WHERE id = $1', [post.user_id]);
  // This fires 50 separate queries!
}

// GOOD — 2 queries total using a JOIN
const posts = await db.query(\\\`
  SELECT p.*, u.name as author_name
  FROM posts p
  JOIN users u ON p.user_id = u.id
  LIMIT 50
\\\`);
\`\`\`

**Profiling tools by layer:**
- **Application:** Node.js \`--inspect\` + Chrome DevTools (CPU and memory), Python \`cProfile\`
- **Database:** \`EXPLAIN ANALYZE\` for query plans, \`pg_stat_statements\` for slow-query logs
- **Network:** Browser DevTools waterfall, \`curl -w\` for timing breakdown
- **System:** \`htop\` (CPU/memory), \`iostat\` (disk I/O), \`netstat\` (connections)

## 🧠 Connection Pooling

Opening a database connection takes ~20-50ms (TCP handshake + auth). A connection pool maintains reusable connections.

\`\`\`javascript
const { Pool } = require('pg');
const pool = new Pool({
  max: 20,           // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connections are borrowed and returned automatically
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
\`\`\`

In production systems, exhausting your connection pool is a common failure mode — set \`max\` based on your database connection limit divided by the number of app instances.

## ⌨️ Do This

1. Add Redis caching to your API — cache an expensive query with the cache-aside pattern and a 5-minute TTL
2. Introduce a deliberate N+1 query, measure it with \`EXPLAIN ANALYZE\`, then fix it with a JOIN
3. Profile your app with Node.js \`--inspect\` — find the slowest function and optimize it
4. Load test with \`k6\` or \`autocannon\` — record baseline p50 and p99 latencies, then optimize and re-measure
5. Add connection pooling and compare response times with and without it

## ⚠️ Gotcha

**Caching can create consistency nightmares.** A common bug: you cache user data, the user updates their profile, but the cache still holds the old version for 30 minutes. Multiply this across dozens of cached entities and you get a system where users see stale data unpredictably. Always have a clear invalidation strategy, and log cache hit/miss ratios so you know when caching is actually helping.

**Premature optimization hides the real bottleneck.** Developers add Redis before profiling and discover no improvement — because the bottleneck was an N+1 query doing 500 database roundtrips, not individual query speed. Always profile first: measure where time is spent, then optimize that specific path. The fix for an N+1 problem is a JOIN, not a cache.

**Sharding is a one-way door.** Once you shard, cross-shard queries (JOINs across shards) become either impossible or extremely expensive. Before sharding, exhaust simpler options: read replicas, better indexes, caching, query optimization. In production, most teams do not need sharding until well past 1TB of data.

## 🛠️ Mini-Project

Performance optimization challenge:
1. Start with a deliberately slow API: include N+1 queries, no caching, no pagination, unindexed columns, and no connection pooling
2. Measure baseline performance with k6 load testing — record p50, p95, and p99 latencies under 100 concurrent users
3. Fix N+1 queries with JOINs and measure the improvement
4. Add database indexes on frequently-queried columns and verify with \`EXPLAIN ANALYZE\`
5. Add Redis caching (cache-aside with TTL) for the most expensive endpoint
6. Add connection pooling and pagination
7. Run the same k6 test again — target 10x improvement in p99 latency and document every change with its measured impact

## ✅ You've mastered this when…

- You implement caching with a clear invalidation strategy and can explain the trade-offs of TTL vs write-through
- You can identify and fix N+1 queries without being told they exist
- You can explain read replicas vs sharding and when each is appropriate
- You know load balancing algorithms and can pick the right one for a given scenario
- You have profiled a real application, found the bottleneck, and measured the improvement with load testing data
- You understand connection pooling and why exhausting it causes cascading failures
`},

{id:'cs-12',num:'12',title:'Production Issues & Debugging',hours:10,phase:2,topics:['Debugging','Postmortems','Feature flags','Canary','Rollback'],
content:`
## 🎯 Goal
When production breaks — and it will — diagnose the problem, fix it, and make sure it doesn't happen the same way again. Build a systematic debugging methodology so you stay calm under pressure instead of guessing randomly.


## 🌍 How Amazon Does This
The **AWS S3 outage of 28 February 2017** is worth reading in the original, and it is a better teacher than any invented scenario.

An engineer running a documented playbook to remove a small number of billing-subsystem servers mistyped a parameter. The command removed a much larger set — including servers running the S3 index subsystem, which had not been fully restarted in years. Restarting it took hours, and S3 in us-east-1 was degraded for most of a working day.

Three details are worth more than the story:

**The blast radius was invisible until it happened.** Nobody knew that subsystem's cold-start time, because nobody had ever cold-started it at that scale. Untested recovery paths are not recovery paths.

**The status dashboard depended on S3.** It could not show the outage, because it was part of it. Monitoring that shares a failure domain with the thing it monitors will fail exactly when you need it.

**The remediation was blameless and structural.** Not "be more careful" — the tool was changed to refuse removals below a minimum capacity threshold, and to remove capacity more slowly. The postmortem asks what the *system* allowed, not who typed it.

Read the real writeup and compare it to the template above: it is a document written under genuine pressure by people whose incentives all pointed toward saying less.

## 🧠 Common Production Failures

\`\`\`mermaid
flowchart TD
    F[Production Failure] --> ML[Memory Leak<br/>Gradual degradation]
    F --> DL[Deadlock<br/>System freezes]
    F --> CF[Cascading Failure<br/>One service kills others]
    F --> NP[N+1 Queries<br/>DB overwhelmed]
    F --> RT[Resource Exhaustion<br/>Disk/connections full]
\`\`\`

### Memory Leaks

Symptoms: Memory usage grows over time, eventually OOM kill. Common causes: unclosed connections, growing caches without eviction, event listeners never removed, global variable accumulation.

\`\`\`javascript
// Common memory leak: event listeners never removed
class UserTracker {
  constructor() {
    this.users = new Map();
  }

  track(socket) {
    // BAD — listener is never cleaned up when user disconnects
    socket.on('data', (msg) => {
      this.users.set(socket.id, msg); // Map grows forever
    });
  }

  // GOOD — clean up on disconnect
  trackProperly(socket) {
    const handler = (msg) => this.users.set(socket.id, msg);
    socket.on('data', handler);
    socket.on('close', () => {
      this.users.delete(socket.id);
      socket.removeListener('data', handler);
    });
  }
}
\`\`\`

### Cascading Failures

One service slows down then callers pile up waiting then their callers pile up then everything fails. In production, this is the most dangerous failure mode because it turns a single-service problem into a system-wide outage.

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant A as Service A
    participant B as Service B (slow)
    C->>A: Request
    A->>B: Call (timeout: 30s)
    Note over A: Thread blocked waiting...
    Note over A: 100 more requests arrive
    Note over A: Thread pool exhausted!
    C->>A: Request
    A-->>C: 503 Service Unavailable
\`\`\`

**Fix — Circuit Breaker pattern:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: failures > threshold
    Open --> HalfOpen: timeout expires
    HalfOpen --> Closed: probe succeeds
    HalfOpen --> Open: probe fails
\`\`\`

When a downstream service fails repeatedly, stop calling it (circuit opens). Periodically try again (half-open). If it works, resume (close).

\`\`\`javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,       // If function takes longer, trigger a failure
  errorThresholdPercentage: 50,  // Open circuit if 50% of requests fail
  resetTimeout: 10000  // Try again after 10 seconds
};

const breaker = new CircuitBreaker(callExternalService, options);

breaker.fallback(() => ({ status: 'degraded', data: cachedData }));
breaker.on('open', () => console.log('Circuit opened — using fallback'));
breaker.on('halfOpen', () => console.log('Circuit half-open — probing'));

const result = await breaker.fire(requestParams);
\`\`\`

## 🧠 Systematic Debugging Methodology

When production breaks at 3 AM, follow a method instead of guessing:

\`\`\`mermaid
flowchart TD
    A[Alert fires] --> B[Check dashboards<br/>What changed?]
    B --> C{Recent deploy?}
    C -->|Yes| D[Rollback first<br/>Investigate later]
    C -->|No| E[Check logs for errors]
    E --> F[Narrow scope:<br/>Which service? Which endpoint?]
    F --> G[Reproduce locally<br/>or read traces]
    G --> H[Fix + write test]
    H --> I[Deploy fix + write postmortem]
\`\`\`

**Key principle: Rollback first, debug second.** If a recent deploy correlates with the outage, roll it back immediately. You can debug the root cause after users stop being affected. Every minute spent debugging before rolling back is a minute of user impact.

**Debugging checklist for any production issue:**
1. What changed? (deploy, config change, traffic spike, dependency outage)
2. What do the metrics show? (error rate, latency, saturation)
3. What do the logs say? (filter by time window + error level)
4. Which component is affected? (trace the request path)
5. Can you reproduce it? (locally or in staging)

## 🧠 Feature Flags

Deploy code to production without exposing it to all users:

\`\`\`javascript
if (featureFlags.isEnabled('new-checkout', { userId })) {
  return newCheckoutFlow(cart);
} else {
  return oldCheckoutFlow(cart);
}
\`\`\`

**Use for:** Gradual rollouts (1% then 10% then 50% then 100%), A/B testing, kill switches, beta features for specific users.

### Rollout Strategies

| Strategy | How it works | Risk level | Best for |
|----------|-------------|------------|----------|
| **Big bang** | 0% to 100% at once | High | Small, low-risk changes |
| **Canary** | 1-5% of traffic first | Low | Risky changes, new features |
| **Ring-based** | Internal then beta then GA | Medium | Major features |
| **Per-user** | Specific user IDs or segments | Lowest | Beta testing |

## 🧠 Rollback Strategies

\`\`\`mermaid
flowchart LR
    subgraph "Instant rollback"
        A[Revert deploy to<br/>previous version]
    end
    subgraph "Feature flag"
        B[Disable flag<br/>code stays deployed]
    end
    subgraph "Database rollback"
        C[Run down migration<br/>may lose data!]
    end
    A --> |Safest| R[Recovery]
    B --> |Fastest| R
    C --> |Riskiest| R
\`\`\`

In production systems, your CI/CD pipeline should make rollback a one-click operation. If rolling back requires more than 5 minutes, your deployment process needs work.

## 🧠 Postmortems — Blameless Learning

After every significant incident:
1. **Timeline:** What happened, minute by minute
2. **Impact:** Users affected, duration, revenue impact
3. **Root cause:** The actual underlying issue (not "human error")
4. **Contributing factors:** What made it worse or harder to detect
5. **Action items:** Specific, assigned fixes to prevent recurrence

**Example postmortem excerpt:**

\`\`\`
Title: API latency spike — 2026-08-15
Duration: 47 minutes (14:23 - 15:10 UTC)
Impact: p99 latency increased from 200ms to 8s. ~12% of requests timed out.

Timeline:
- 14:20 — Deploy v2.4.1 (new search endpoint)
- 14:23 — Alerts fire: p99 latency > 2s
- 14:30 — On-call investigates: search endpoint doing full table scan
- 14:35 — Decision: rollback v2.4.1
- 14:40 — Rollback deployed
- 15:10 — Latency back to normal

Root cause: New search query lacked a WHERE clause index.
Missing index caused full table scan on 50M row table.

Action items:
- [P0] Add index on search columns (owner: backend team)
- [P1] Add query plan review to PR checklist
- [P1] Add latency alert threshold at p99 > 500ms
\`\`\`

## ⌨️ Do This

1. Implement a circuit breaker in your app using Opossum — configure timeout, error threshold, and a fallback response
2. Add feature flags with a simple in-memory implementation that supports per-user targeting and percentage rollout
3. Practice debugging: deliberately introduce a memory leak (e.g., an ever-growing Map), find it with Node.js \`--inspect\` and Chrome DevTools heap snapshot
4. Write a postmortem template for your team with sections for timeline, impact, root cause, and action items
5. Add a one-command rollback to your CI/CD pipeline (e.g., \`npm run rollback\` redeploys the previous version)

## ⚠️ Gotcha

**"Human error" is never a root cause.** Humans make mistakes — the system should catch them. If a developer deployed a bad config and it caused an outage, the root cause is not "the developer made a mistake." The root cause is "the deployment pipeline has no config validation step" or "there is no canary deployment to catch bad configs before full rollout." Fix the system, not the human.

**Feature flags create technical debt if you never clean them up.** Every feature flag adds a code path that must be tested. In production, teams accumulate dozens of flags, some for features fully rolled out months ago. Establish a rule: once a flag reaches 100% and has been stable for two weeks, remove it. Track flag age in your codebase and alert on flags older than 30 days.

**Rollbacks with database migrations are dangerous.** Rolling back application code is straightforward, but if the deploy included a database migration (adding a column, changing a type), rolling back the code without rolling back the schema can break things. Practice "expand-contract" migrations: add the new column first, deploy code that writes to both old and new, then remove the old column in a later deploy.

## 🛠️ Mini-Project

Production resilience drill:
1. Add circuit breakers around at least two external service calls with appropriate timeout and threshold settings
2. Implement feature flags with gradual rollout capability — support percentage-based rollout and per-user targeting
3. Create a runbook document: "API is returning 500 errors" with step-by-step diagnostic instructions (check metrics, filter logs, identify affected endpoint, check recent deploys)
4. Simulate a production incident — introduce a deliberate failure, follow your runbook, time how long it takes to diagnose
5. Write a blameless postmortem for the simulated incident with timeline, root cause, and at least 3 action items
6. Add automated rollback to your CI/CD pipeline: if the health check fails after deploy, automatically redeploy the previous version

## ✅ You've mastered this when…

- You can diagnose memory leaks, N+1 queries, and cascading failures using profiling tools
- You implement circuit breakers with fallback responses for external dependencies
- You use feature flags for safe gradual rollouts and know when to clean them up
- You follow a systematic debugging methodology instead of guessing
- You write blameless postmortems with actionable items that fix the system, not blame the person
- You have rollback strategies tested and ready, and know the risks of rolling back with database migrations
`},

{id:'cs-13',num:'13',title:'Cloud & Infrastructure',hours:12,phase:2,topics:['AWS','GCP','Serverless','VPC','IAM','Terraform'],
content:`
## 🎯 Goal
Navigate AWS/GCP/Azure service catalogs without drowning. Understand compute, storage, networking, and IAM at a level where you can architect and deploy real systems. Know when to use VMs, containers, or serverless, and manage infrastructure as code with Terraform.


## 🌍 How Amazon Does This
AWS is the same infrastructure Amazon Retail runs on, which is why its primitives look the way they do — they were shaped by an internal customer with unusual requirements.

**Regions and availability zones are a physics decision.** AZs are separate facilities close enough for synchronous replication (single-digit milliseconds) but far enough apart not to share a power grid or flood plain. Regions are far enough to survive a regional disaster and far enough that synchronous replication is off the table. That is the whole geography, and every multi-region design starts from it.

**IAM roles rather than keys.** An EC2 instance assumes a role and receives temporary rotating credentials, rather than holding a long-lived key on disk. Long-lived credentials leak — into git history, logs, screenshots — and a credential that expires in an hour is a much smaller prize. (This is also the mechanism the Capital One SSRF abused in \`cs-07\`, which is why IMDSv2 exists.)

**Managed services trade cost for undifferentiated work.** RDS is more expensive per instance-hour than self-managed Postgres, and cheaper once you count the engineer who would otherwise handle backups, failover and patching at 3am. The right comparison is total cost, including salaries.

## 🧠 Cloud Service Map

The major cloud providers offer dozens of services, but they map to the same fundamental categories:

\`\`\`mermaid
flowchart TD
    subgraph Compute
        EC2[VMs<br/>EC2 / GCE]
        CT[Containers<br/>ECS, EKS / GKE]
        FN[Functions<br/>Lambda / Cloud Functions]
    end
    subgraph Storage
        OBJ[Object Store<br/>S3 / GCS]
        BLK[Block Store<br/>EBS / Persistent Disk]
        FS[File Store<br/>EFS / Filestore]
    end
    subgraph Database
        RDS[Managed SQL<br/>RDS / Cloud SQL]
        DDB[NoSQL<br/>DynamoDB / Firestore]
        ELC[Cache<br/>ElastiCache / Memorystore]
    end
    subgraph Networking
        VPC[VPC / Virtual Network]
        LB[Load Balancer<br/>ALB / Cloud LB]
        CDN[CDN<br/>CloudFront / Cloud CDN]
        DNS[DNS<br/>Route53 / Cloud DNS]
    end
\`\`\`

### Choosing a Compute Model

| Model | Startup time | Scaling | Cost model | Best for |
|-------|-------------|---------|------------|----------|
| **VMs (EC2/GCE)** | Minutes | Manual or auto-scaling groups | Per-hour | Legacy apps, full OS control |
| **Containers (ECS/GKE)** | Seconds | Kubernetes autoscaler | Per-second | Microservices, consistent environments |
| **Serverless (Lambda)** | Cold: 200ms-2s | Automatic, per-request | Per-invocation | Event processing, APIs with spiky traffic |

In production, most teams use a mix: containers for the main application, serverless for background jobs and webhooks, VMs for specialized workloads.

## 🧠 VPC — Your Private Network

A VPC (Virtual Private Cloud) is an isolated network where your resources live. You control:
- **Subnets:** Public (internet-facing) vs private (internal only)
- **Security groups:** Firewall rules (which ports, which IPs)
- **NAT gateway:** Lets private resources access the internet without being reachable from it

\`\`\`mermaid
flowchart TD
    Internet --> IGW[Internet Gateway]
    IGW --> PUB[Public Subnet<br/>Load Balancer, Bastion]
    PUB --> PRIV[Private Subnet<br/>App Servers, Databases]
    PRIV --> NAT[NAT Gateway]
    NAT --> Internet
\`\`\`

### Security Groups vs Network ACLs

| | Security Groups | Network ACLs |
|---|----------------|--------------|
| Level | Instance-level (ENI) | Subnet-level |
| Rules | Allow only (implicit deny) | Allow and deny |
| State | Stateful (return traffic auto-allowed) | Stateless (must allow both directions) |
| Use | Primary firewall — use for everything | Secondary layer for subnet-wide rules |

\`\`\`
# Example: Security group for a web server
Inbound rules:
  - Port 443 (HTTPS) from 0.0.0.0/0    (public access)
  - Port 22 (SSH) from 10.0.0.0/16      (VPC only)

Outbound rules:
  - Port 5432 to sg-database             (DB security group)
  - Port 443 to 0.0.0.0/0               (external APIs)
\`\`\`

## 🧠 IAM — Principle of Least Privilege

Every service, user, and role should have the minimum permissions needed. IAM policies define who can do what on which resources.

**The mental model:** Subject (who) + Action (what) + Resource (which) + Condition (when) = Allow or Deny.

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject"
    ],
    "Resource": "arn:aws:s3:::my-app-uploads/*",
    "Condition": {
      "StringEquals": {
        "aws:RequestedRegion": "us-east-1"
      }
    }
  }]
}
\`\`\`

**IAM anti-patterns to avoid:**
- \`"Action": "*"\` on \`"Resource": "*"\` — gives full access to everything
- Sharing IAM credentials between services — each service gets its own role
- Long-lived access keys — use IAM roles with temporary credentials instead

## 🧠 Infrastructure as Code with Terraform

Terraform lets you define infrastructure in declarative config files, version-control them, and apply changes through a predictable workflow.

\`\`\`mermaid
flowchart LR
    W[Write .tf files] --> P[terraform plan<br/>Preview changes]
    P --> A[terraform apply<br/>Create resources]
    A --> S[State file<br/>Tracks what exists]
    S -.->|next change| W
\`\`\`

\`\`\`hcl
# main.tf — Deploy a web app with a load balancer
resource "aws_lb" "web" {
  name               = "web-alb"
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  security_groups    = [aws_security_group.alb.id]
}

resource "aws_ecs_service" "app" {
  name            = "web-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 3

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 3000
  }
}
\`\`\`

**Key Terraform concepts:**
- **State file:** Tracks which real resources correspond to your config. Store remotely (S3 + DynamoDB locking) for team use.
- **Modules:** Reusable building blocks — e.g., a "VPC module" that creates subnets, route tables, and gateways.
- **Plan before apply:** Always run \`terraform plan\` to preview changes. Never apply blindly.

## 🧠 Cost Optimization

Cloud bills spiral when nobody watches. In production, teams regularly discover they are paying 3-5x more than necessary.

- **Reserved instances / savings plans** for steady workloads (40-70% savings)
- **Auto-scaling:** Scale down during low traffic, scale up for peaks
- **Right-sizing:** Most instances are overprovisioned — monitor CPU/memory and downsize
- **Spot/preemptible instances** for batch jobs (up to 90% savings, but can be reclaimed)
- **Billing alerts:** Set up before you get surprised — a misconfigured auto-scaler can cost thousands overnight

| Strategy | Savings | Risk | Commitment |
|----------|---------|------|------------|
| **On-demand** | Baseline | None | None |
| **Reserved / Savings Plans** | 40-70% | Lock-in | 1-3 years |
| **Spot / Preemptible** | Up to 90% | Interruption | None |
| **Right-sizing** | 20-50% | Under-provisioning | Ongoing monitoring |

## ⌨️ Do This

1. Deploy your Dockerized app to a free cloud tier (AWS Free Tier, GCP Free Tier, or Railway)
2. Set up a VPC with public and private subnets — put a load balancer in public, your app in private
3. Create IAM roles with least-privilege policies for your application — no wildcard permissions
4. Write a Terraform config that provisions your app's infrastructure, and run \`terraform plan\` to preview
5. Set up a billing alert at $10/month and review your cost breakdown after one week

## ⚠️ Gotcha

**"Serverless" does not mean "no servers."** It means you do not manage the servers — the cloud provider does. You still pay for compute time, you still have cold start latency (200ms-2s for AWS Lambda), and you still need to handle concurrency limits, timeouts, and memory constraints. Serverless is great for bursty workloads; it is expensive for steady-state high-throughput. In production, a Lambda function that runs constantly is usually cheaper rewritten as a container.

**IAM is the most critical security layer in cloud, and the most neglected.** Over-permissive IAM policies (e.g., \`*\` permissions on \`*\` resources) are the root cause of most cloud security breaches. Follow least privilege ruthlessly: each service gets only the specific permissions it needs, on only the specific resources it accesses. Audit IAM policies quarterly.

**Terraform state is a single point of failure.** If you lose the state file, Terraform does not know what resources exist — you cannot manage or destroy them. Never store state locally for team projects. Use a remote backend with state file versioning enabled so you can recover from corruption. For S3, use **native S3 locking** (\`use_lockfile = true\`), added in Terraform 1.10 — the older S3-plus-DynamoDB pattern still works but the DynamoDB lock table was deprecated in 1.11, and you no longer need a second service just to hold a lock.

## 🛠️ Mini-Project

Deploy a production-like setup:
1. Create a VPC with two public subnets and two private subnets across two availability zones
2. Set up an Application Load Balancer in the public subnets routing to your app in private subnets
3. Deploy a PostgreSQL database in the private subnet with a security group that only allows connections from the app
4. Create IAM roles for each component — the app role can read S3 and connect to the database, nothing else
5. Define all infrastructure in Terraform with a remote state backend
6. Estimate the monthly cost using the AWS/GCP pricing calculator and document the breakdown
7. Add auto-scaling rules: scale up when CPU exceeds 70%, scale down when below 30%

## ✅ You've mastered this when…

- You can navigate the AWS/GCP service catalog and pick the right compute, storage, and networking service for a workload
- You understand VPCs, subnets, security groups, and can design a network with public and private tiers
- You apply least-privilege IAM policies and can audit existing policies for over-permissions
- You can estimate cloud costs, identify waste, and explain the trade-offs of reserved vs spot instances
- You have written Terraform that provisions real infrastructure and used \`terraform plan\` before applying
- You understand remote state management and why the state file must be versioned and locked
`},

{id:'cs-14',num:'14',title:'System Design',hours:14,phase:2,topics:['Capacity planning','Trade-offs','Distributed systems','CAP theorem'],
content:`
## 🎯 Goal
Design scalable systems from scratch. Handle system design challenges by thinking systematically: requirements then components then data flow then bottlenecks. Develop the judgment to articulate trade-offs rather than defaulting to buzzword architectures.


## 🌍 How Amazon Does This
"Customers who bought this also bought" is a good system-design interview question because the constraints are real and pull in different directions.

**Read-heavy by orders of magnitude.** The recommendation is read on every product view and recomputed comparatively rarely. That asymmetry is the design: precompute offline, store the result, serve it from a cache. This is not a query you run at request time.

**Consistency requirements differ inside one page.** The recommendation strip can be hours stale and nobody is harmed. The **inventory count cannot be** — overselling the last unit means cancelling a confirmed order. Same page, same request, opposite ends of the consistency trade-off. This is exactly the PACELC point above: even without a partition, you are choosing latency versus consistency per operation.

**Estimate before designing.** Hundreds of millions of catalogue items, a much larger number of daily views, a recommendation list of maybe 20 ids per item. Do that arithmetic first: it tells you whether this fits in memory, and therefore which designs are worth discussing at all. Interviewers care far more about that reasoning than about the box diagram.

## 🧠 The System Design Framework

Every system design follows the same flow. Resist the urge to jump to components — start with requirements.

\`\`\`mermaid
flowchart LR
    R[Requirements<br/>Functional + Non-functional] --> HLD[High-Level Design<br/>Components + data flow]
    HLD --> DD[Deep Dive<br/>Database, caching, scaling]
    DD --> BN[Bottlenecks<br/>What breaks at scale?]
    BN --> TO[Trade-offs<br/>Consistency vs availability<br/>Cost vs performance]
\`\`\`

### Functional vs Non-Functional Requirements

| Type | Examples | Why it matters |
|------|----------|----------------|
| **Functional** | Users can send messages, create posts, upload images | What the system *does* |
| **Non-functional** | 99.9% uptime, p99 latency under 200ms, handle 10K req/s | How the system *performs* |
| **Constraints** | Budget, team size, compliance, existing tech stack | What limits your choices |

Always ask: "What are we optimizing for?" A system optimized for read throughput looks very different from one optimized for write consistency.

### Back-of-Envelope Estimation

Before designing, estimate the scale. These numbers shape every decision:

- **Users:** 10M monthly active users, 1M daily active
- **Requests:** ~400 req/sec average, ~1200 req/sec peak (3x rule)
- **Storage:** If each user generates 1KB/day → 10TB/year
- **Bandwidth:** 400 req/s x 10KB avg response = 4 MB/s

**Useful constants for estimation:**
- 1 day = ~86,400 seconds (~100K for quick math)
- 1 month = ~2.5M seconds
- 1 server handles ~1K-10K concurrent connections (depends on workload)
- SSD random read: ~0.1ms; HDD: ~10ms; network round-trip: ~1-100ms

### CAP Theorem

CAP is the most misquoted result in distributed systems. It is **not** "pick two of three" — that framing invites you to imagine choosing a CA system, which does not exist in anything that talks over a network.

Partition tolerance is not a feature you select. Networks partition. The only real question is what your system does **when** one happens:

\`\`\`mermaid
flowchart TD
    P["Network partition occurs<br/>Not optional — this will happen"] --> Q{"Serve a request you<br/>can't fully coordinate?"}
    Q -->|"Refuse — stay correct"| CP["CP: reject or block<br/>Consistent, but unavailable"]
    Q -->|"Answer — stay up"| AP["AP: serve possibly stale data<br/>Available, but inconsistent"]
\`\`\`

**Real databases are tunable, not fixed points on a triangle.** Labelling a product "CP" or "AP" is usually wrong. DynamoDB is eventually consistent by default but gives you strong reads per-request with \`ConsistentRead\`. Cassandra's behaviour is set by the consistency level on each query — \`ONE\` is firmly AP, \`QUORUM\` trades availability for consistency, and you choose per statement. The trade-off lives at the level of an individual operation, not the product.

**PACELC is the more useful formulation.** It extends CAP with the case that actually dominates your uptime: *if there is a **P**artition, choose **A**vailability or **C**onsistency; **E**lse — when the network is healthy — choose **L**atency or **C**onsistency.* That second half is where most real design effort goes, because partitions are rare and the latency-vs-consistency trade is on every single request.

## 🧠 Consistency Patterns

Different parts of your system can make different consistency trade-offs:

\`\`\`mermaid
flowchart LR
    subgraph "Strong Consistency"
        A[Bank transfers<br/>Inventory counts<br/>User auth]
    end
    subgraph "Eventual Consistency"
        B[Like counts<br/>News feeds<br/>Analytics]
    end
    subgraph "Causal Consistency"
        C[Chat messages<br/>Comment threads<br/>Social posts]
    end
\`\`\`

| Pattern | Guarantee | Latency | Use when |
|---------|-----------|---------|----------|
| **Strong** | Read always returns latest write | Higher (coordination) | Financial transactions, auth |
| **Eventual** | Read will *eventually* return latest | Lowest | Counters, feeds, analytics |
| **Causal** | Respects cause-and-effect ordering | Medium | Chat, comments, timelines |

In production, most systems use a mix. Your checkout page needs strong consistency for inventory. Your social feed can tolerate eventual consistency for like counts.

## 🧠 Common Building Blocks

Most systems are assembled from a small set of proven components:

\`\`\`mermaid
flowchart TD
    LB[Load Balancer] --> APP[Application Servers]
    APP --> CACHE[(Cache<br/>Redis)]
    APP --> DB[(Database<br/>PostgreSQL)]
    APP --> MQ[Message Queue<br/>Kafka/SQS]
    MQ --> WORKER[Workers<br/>Background jobs]
    APP --> OBJ[Object Storage<br/>S3]
    APP --> SEARCH[Search Index<br/>Elasticsearch]
    CDN[CDN] --> OBJ
\`\`\`

**When to introduce each component:**
- **Cache:** When read latency matters and data does not change every request
- **Message queue:** When you need to decouple producers from consumers (async processing)
- **Search index:** When your queries go beyond what SQL can handle efficiently (full-text search, fuzzy matching)
- **Object storage:** For files, images, videos — anything too large for a database
- **CDN:** For static assets and content served to global users

## 🧠 Design Exercise: URL Shortener

**Requirements:** Create short URLs, redirect to original, track click counts, handle 100M URLs, 10K redirects/sec.

\`\`\`mermaid
flowchart TD
    C[Client] --> LB[Load Balancer]
    LB --> API[API Service]
    API --> Cache[Redis Cache<br/>Hot URLs]
    Cache -->|miss| DB[(PostgreSQL<br/>URL mappings)]
    API --> Counter[Analytics Service]
    Counter --> TS[(Time-series DB<br/>Click data)]
\`\`\`

**Key decisions:**
- **ID generation:** Base62 encoding of auto-increment ID or hash? (hash risks collisions)
- **Caching:** Cache the top 20% of URLs (Pareto principle) — covers 80% of redirects
- **Database:** Shard by short URL hash for horizontal scaling
- **Analytics:** Async (message queue) so redirects are not slowed by analytics writes

## 🧠 Design Exercise: Chat System

**Requirements:** Real-time messaging, channels, message history, online status, 500K concurrent users.

\`\`\`mermaid
flowchart TD
    C1[Client] & C2[Client] -->|WebSocket| GW[WebSocket Gateway]
    GW --> CS[Chat Service]
    CS --> MQ[Message Queue<br/>Fan-out to channels]
    CS --> DB[(Message Store<br/>Partitioned by channel)]
    CS --> PS[Presence Service]
    PS --> Redis[(Redis<br/>Online status)]
    MQ --> GW
\`\`\`

**Key decisions:**
- **WebSockets** for real-time delivery — HTTP polling wastes bandwidth at this scale
- **Message ordering:** Per-channel ordering via partition key; global ordering is unnecessary and expensive
- **Fan-out:** When a message is sent to a 1000-member channel, the message queue handles delivery to each connected client
- **Storage:** Partition messages by channel ID and time range for efficient retrieval
- **Presence:** Redis with TTL-based heartbeats — if no heartbeat in 30s, mark offline

## ⌨️ Do This

Practice designing 4 systems (spend 45 minutes each):
1. **Chat system** (like Slack) — real-time messaging, channels, message history, presence
2. **Notification service** — email, push, SMS; templating, rate limiting, user preferences
3. **Rate limiter** — compare fixed window, sliding window, and token bucket algorithms
4. **File storage service** (like Dropbox) — upload, download, share, versioning, deduplication

For each: list requirements then draw the diagram then design the database schema then identify the scaling strategy then articulate trade-offs.

## 🛠️ Mini-Project

Pick one of the designs above and build a working prototype:
1. Write down functional and non-functional requirements with specific numbers (e.g., "support 1000 concurrent users, p99 latency under 500ms")
2. Draw the architecture diagram showing all components and data flow
3. Design and implement the database schema with appropriate indexes
4. Build the key API endpoints for the core user flow
5. Add caching for the hot path and measure the improvement
6. Document every architecture decision and the trade-off you considered (e.g., "chose PostgreSQL over DynamoDB because we need JOIN queries for the analytics dashboard; trade-off is manual sharding if we exceed 1TB")

## ⚠️ Gotcha

**CAP theorem is often misunderstood.** It is not "pick two of three." In reality, network partitions are inevitable — you do not choose to have them. CAP says: when a partition happens, you must choose between consistency (every read sees the latest write) and availability (every request gets a response). Most systems choose "AP with eventual consistency" (DynamoDB, Cassandra) or "CP with unavailability during partitions" (traditional RDBMS with synchronous replication).

**Premature scaling is the graveyard of startups.** Building a system that handles 10 million users when you have 100 is wasted engineering. Design so that components can be replaced when you need to scale, but do not build the scaled version until the metrics demand it. Monolith first, microservices when you have earned the complexity.

**Design without numbers is just storytelling.** Saying "we will use a cache" is meaningless without knowing *how many* requests per second you expect, *what percentage* are cache-eligible, and *how much* memory the cached data requires. Back-of-envelope math is what separates a design that works from one that sounds good in a meeting.

## ✅ You've mastered this when…

- You follow requirements then design then deep dive then bottlenecks systematically
- You do back-of-envelope estimation before designing and use the numbers to justify decisions
- You understand CAP theorem and can explain which consistency model fits a given feature
- You can design a URL shortener, chat system, or notification service from scratch with a clear diagram
- You articulate trade-offs with specifics (not just "use microservices" but "chose microservices because the team needs independent deploy cycles; trade-off is distributed tracing complexity")
- You know when to introduce caches, queues, and search indexes — and when they add unnecessary complexity
`},

{id:'cs-15',num:'15',title:'Capstone — Ship a Production System',hours:16,phase:2,topics:['Integration','Full stack','Production deploy'],
content:`
## 🎯 Goal
Wire everything together. Build, deploy, secure, monitor, and operate a complete multi-component system that uses concepts from every prior module. This is not just a coding exercise — it is practice for what professional software engineering actually looks like: making decisions under constraints, shipping to real users, and keeping the system running.


## 🌍 How Amazon Does This
Scope this capstone as **one slice of a system like Amazon's, built properly** — not a clone. "Build Amazon" produces a shallow imitation of many features; "build the seller-facing order management slice" produces something with real depth.

That slice has everything this track covered, and it is small enough to actually finish:

- A schema where orders are relational and ACID, because money is involved (\`cs-03\`)
- An API a seller's own tooling could call, with cursor pagination (\`cs-04\`)
- Authentication, plus authorization that stops seller A reading seller B's orders (\`cs-06\`, \`cs-07\`)
- Tests weighted toward the paths whose failure costs the most (\`cs-08\`)
- A pipeline that deploys on merge and can roll back (\`cs-09\`)
- Dashboards showing order-processing latency and failure rate, not just CPU (\`cs-10\`)

Then break it deliberately and write the postmortem — the real test is whether your monitoring told you what happened before your users did.

## 🧠 The Capstone Architecture

\`\`\`mermaid
flowchart TD
    User[User] --> CDN[CDN<br/>Static assets]
    User --> LB[Load Balancer]
    LB --> API[API Service<br/>Auth, CRUD, validation]
    API --> Cache[(Redis<br/>Sessions, caching)]
    API --> DB[(PostgreSQL<br/>Primary data)]
    API --> Queue[Message Queue]
    Queue --> Worker[Background Worker<br/>Emails, analytics]
    API --> Logs[Structured Logging]
    API --> Metrics[Metrics + Traces]
    Logs & Metrics --> Dashboard[Grafana Dashboard]
\`\`\`

## 🧠 Development Workflow

A production system is not just code — it is the process around the code. Set up the workflow before writing the first feature.

\`\`\`mermaid
flowchart LR
    F[Feature branch] --> PR[Pull Request]
    PR --> CI[CI: lint + test + build]
    CI --> CR[Code Review]
    CR --> M[Merge to main]
    M --> CD[CD: deploy to staging]
    CD --> SM[Smoke tests]
    SM --> PROD[Deploy to production]
    PROD --> MON[Monitor for 30 min]
\`\`\`

**Project structure for the capstone:**

\`\`\`
project/
  src/
    routes/          # API route handlers
    middleware/       # Auth, validation, rate limiting
    services/        # Business logic
    models/          # Database models
    workers/         # Background job processors
    utils/           # Shared helpers
  tests/
    unit/            # Pure function tests
    integration/     # API + DB tests
    fixtures/        # Test data
  migrations/        # Database migrations (timestamped)
  docker-compose.yml # Local dev environment
  Dockerfile         # Production container
  .github/workflows/ # CI/CD pipeline
  openapi.yaml       # API documentation
\`\`\`

## 🧠 Database Schema Design

For a task management system, start with a normalized schema and denormalize only where measurements justify it:

\`\`\`mermaid
erDiagram
    USERS ||--o{ PROJECT_MEMBERS : joins
    PROJECTS ||--o{ PROJECT_MEMBERS : has
    PROJECTS ||--o{ TASKS : contains
    TASKS ||--o{ COMMENTS : has
    USERS ||--o{ TASKS : "assigned to"
    USERS ||--o{ COMMENTS : writes
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string role
        timestamp created_at
    }
    PROJECTS {
        uuid id PK
        string name
        uuid owner_id FK
        timestamp created_at
    }
    TASKS {
        uuid id PK
        uuid project_id FK
        uuid assignee_id FK
        string title
        text description
        string status
        string priority
        date due_date
        timestamp created_at
    }
    COMMENTS {
        uuid id PK
        uuid task_id FK
        uuid author_id FK
        text body
        timestamp created_at
    }
\`\`\`

**Key indexes:** task status (for filtered lists), assignee (for "my tasks"), project_id + created_at (for task lists sorted by date).

## 🧠 The Request Lifecycle

Understanding the full lifecycle helps you debug issues at any layer:

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant LB as Load Balancer
    participant API as API Server
    participant MW as Middleware Stack
    participant DB as PostgreSQL
    participant R as Redis

    C->>LB: POST /api/tasks
    LB->>API: Forward (health-checked)
    API->>MW: Rate limit check
    MW->>MW: Auth (verify JWT)
    MW->>MW: Validate input (Zod)
    MW->>MW: RBAC (check permissions)
    API->>DB: INSERT INTO tasks
    API->>R: Invalidate task list cache
    API->>API: Enqueue notification job
    API-->>C: 201 Created
\`\`\`

Each middleware layer is a concept from a previous module: rate limiting (Module 04), auth (Module 06), validation (Module 07), database (Module 03), caching (Module 11).

## 🛠️ Build This

A **task management API** (like a mini-Linear or Jira) with:

**Functional requirements:**
- User registration and login (JWT + refresh tokens)
- Projects with CRUD
- Tasks with status, assignee, priority, due date
- Comments on tasks
- Email notifications for task assignments

**Non-functional requirements:**
- Dockerized with docker-compose for local dev
- CI/CD pipeline (GitHub Actions) — lint, test, build, deploy
- Structured logging with request correlation IDs
- Metrics dashboard (request rate, error rate, latency)
- Rate limiting on API endpoints
- Input validation and security headers
- Feature flags for gradual rollout
- Automated database migrations
- API documentation (OpenAPI/Swagger)

**Architecture checklist:**
- [ ] RESTful API with proper status codes and error handling
- [ ] PostgreSQL with normalized schema + strategic indexes
- [ ] Redis for session/token storage and caching
- [ ] JWT auth with refresh token rotation
- [ ] RBAC (admin, project owner, member, viewer)
- [ ] Background job processing (email via queue)
- [ ] Docker + docker-compose
- [ ] GitHub Actions CI/CD
- [ ] Structured JSON logging
- [ ] Health check endpoint
- [ ] Rate limiting
- [ ] Security headers (Helmet.js)
- [ ] Input validation (Zod/Joi)
- [ ] OpenAPI documentation
- [ ] Deployed to a cloud provider

## 🧠 Incident Response Practice

Shipping is half the work. Operating the system is the other half. Before you consider the capstone complete, practice responding to failures.

**Simulated incident checklist:**
1. Deploy a bug intentionally (e.g., a slow query, a broken endpoint)
2. Watch your monitoring dashboard — does it alert you?
3. Follow your runbook to diagnose the issue
4. Roll back or fix forward
5. Write a postmortem

**Runbook template for your capstone:**

\`\`\`
Runbook: API Returning 500 Errors
=================================
1. Check error rate on Grafana dashboard
2. Filter logs: level=error, last 15 minutes
3. Identify the failing endpoint and error message
4. Check: was there a recent deploy? If yes -> rollback
5. Check: is the database reachable? Run health check
6. Check: is Redis reachable? Test connection
7. Check: are background workers processing? Check queue depth
8. If none of the above -> escalate and gather more traces
\`\`\`

## ⌨️ Do This

1. Choose a project scope: the task management API described above, a URL shortener with analytics, a real-time chat app, or a simple e-commerce API
2. Set up the full stack: database (PostgreSQL), backend (Node.js or Python), reverse proxy (nginx), containerized with Docker and docker-compose
3. Build the core features with tests: aim for at least 80% coverage on business logic and integration tests for every endpoint
4. Write the CI/CD pipeline: lint then test then build then deploy to staging, with a manual promotion step to production
5. Add observability from day one: structured JSON logging with request IDs, health check endpoint, basic metrics (request count, latency histogram, error rate)
6. Deploy to production, break something intentionally, follow your runbook, and write a postmortem

## ⚠️ Gotcha

**"Done" in production means monitored, documented, and recoverable — not just deployed.** A system without health checks, runbooks, and rollback procedures is not production-ready. The first outage will expose every shortcut you took. Write the runbook before you need it.

**Your first production incident will be humbling.** Theory does not prepare you for debugging a system at 2 AM when the monitoring dashboard shows everything green but users are complaining. Build debugging muscle: practice reading logs under time pressure, tracing requests across services, and narrowing down root causes systematically.

**Scope creep will kill your capstone.** The goal is a working, deployed, monitored system — not a feature-complete product. Ship the minimum viable architecture first (auth, one CRUD resource, CI/CD, logging, health check), then add features incrementally. A deployed system with 3 endpoints and full observability is worth more than a local system with 20 endpoints and no monitoring.

## ✅ You've mastered the CS track when…

- Your system is deployed and accessible on the internet with HTTPS
- You can explain every architectural decision and the trade-off you considered
- Your CI/CD pipeline catches bugs before they reach production
- Your monitoring dashboard shows the four golden signals (latency, traffic, errors, saturation)
- You can run a load test and identify the bottleneck
- You have written a postmortem for a simulated incident with actionable follow-ups
- Someone else could onboard to your codebase using the docs and runbooks you wrote
`}
];
