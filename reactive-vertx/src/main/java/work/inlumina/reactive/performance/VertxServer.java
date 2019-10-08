package work.inlumina.reactive.performance;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Sample Vertx HTTP server.
 */
public class VertxServer extends AbstractVerticle {
    public static final String COLLECTION_NAME = "book";
    private MongoClient mongoClient;
    private final Logger logger = LoggerFactory.getLogger(VertxServer.class);
    public final Integer HTTP_PORT = 8080;


    @Override
    public void start(Promise<Void> startFuture) throws Exception {
        logger.info("starting verticle");
        super.start();

        HttpServer httpServer = vertx.createHttpServer();
        Router router = Router.router(vertx);
        this.mongoClient = MongoClient.createShared(vertx, new JsonObject().put("db_name", "test"));
        this.routing(router);

        httpServer.requestHandler(router).listen(HTTP_PORT, ar -> {
            logger.info("Handling http request at: {}", HTTP_PORT);
            if (ar.succeeded()) {
                startFuture.complete();
            } else {
                logger.error(ar.cause().getMessage());
                ar.cause().printStackTrace();
                ;
                startFuture.fail(ar.cause());
            }
        });
    }

    private void routing(Router router) {
        router.post("/cleanup/").handler(this::cleanUp);
        router.post("/books/").handler(this::handleNewBook);
        router.get("/books/").handler(this::handleListBooks);
    }

    private void cleanUp(RoutingContext routingContext) {
        this.mongoClient.dropCollection(COLLECTION_NAME, ar -> {
            if (ar.failed()) {
                routingContext.fail(ar.cause());
                return;
            }
            routingContext.response()
                    .end("OK");
        });
    }

    private void handleNewBook(RoutingContext routingContext) {
        HttpServerRequest request = routingContext.request();
        request.bodyHandler(buffer -> {

            this.mongoClient.save(COLLECTION_NAME, buffer.toJsonObject(), ar -> {
                if (ar.failed()) {
                    routingContext.fail(ar.cause());
                    return;
                }
                routingContext.response()
                        .putHeader("content-type", "application/json")
                        .end(buffer.toJsonObject().encodePrettily());
            });
        });
    }

    private void handleListBooks(RoutingContext routingContext) {
        HttpServerRequest request = routingContext.request();
        this.mongoClient.find(COLLECTION_NAME, new JsonObject(), ar -> {
            if (ar.failed()) {
                routingContext.fail(ar.cause());
                return;
            }
            JsonArray arr = new JsonArray();
            ar.result().forEach(a -> arr.add(a));

            routingContext.response()
                    .putHeader("content-type", "application/json")
                    .end(arr.encodePrettily());
        });
    }
}
