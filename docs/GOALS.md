Goals:

1. Containerization
    - Docker, Kubernetes
    - Ability to run some subset of services in Docker, run the actively developed services locally
        - Allows for hot-reload of code and a tight inner loop for services under development and a stable, production-adjacent version of the rest of the environment
        - How do services know to reach out of Docker and hit locally running services?
            - Service Discovery mechanism could redirect traffic outside
2. Service Discovery
    - Service Clients should first call the Service Discovery Service to get info about where the services live
    - Persist settings in a near-cache so that we can invalidate consumers if we need to
    - Include data like address, any other settings that the Service wants clients to configure
3. Telemetry / Logging / Tracing
    - Standard library
        - Request/Response timing Telemetry
        - Manual insertion of tracepoints
        - Message string + JSON payload
4. Red/Black Testing
    - Assign traffic flow by user up to a threshold
    - Include filters for certain types of users
    - Allow opt-out
5. Blue/Green Deployments
    - How do you do this within Kubernetes and Ingress?
6. Feature Flags
    - Scope Feature Flags per user, per organization (or other container concept)
    - Handle transition of Off by Default -> On by Default -> Always On
7. Queueing
    - Pick a technology
        - RSMQ
        - Kafka
        - Other
8. Caching
    - Replicating DB changes to distributed cache
9. Circuit breakers
    - HTTP Circuit breakers
        - What do we fall back to?
    - GraphQL Circuit breakers
        - What do we fall back to?
    - DB Circuit breakers
        - Fall back to near cache
10. Database migrations
    - Two phases; pre- and post-binaries
        - Pre-binaries
            - Runs before binaries deploy (ergo before VIP swap)
            - Puts the DB in a state where the new binaries will attach to it properly
            - Should not break the existing running version of the application
        - Post-binaries
            - Runs after VIP swap AND upgrade of non-VIP deployment
            - Mostly useful for cleanup, eg. removing unused columns
            - REQUIRES a rollback script, otherwise this represents a point of no return
    - Runnable ad-hoc or as part of a deployment pipeline
        - Deployment pipeline
        - Ad-hoc
            - Run via remote script execution
11. Database object management
    - Partitioning
    - Code generation - don't want to write inline SQL etc.
12. Health checking
    - Application nodes
        - Standard health endpoints; should these reflect status of any dependencies?
    - Databases
    - Caches
    - Queues
13. Worker agents
    - Worker agents per big-S Service
    - Deploy in a separate Kubernetes cluster (do we need to separate?) from the actual service
    - Run preconfigured jobs by ID on demand (or on schedule? How do we avoid having 5 agents run the same job at the same time; want to isolate to one node)
