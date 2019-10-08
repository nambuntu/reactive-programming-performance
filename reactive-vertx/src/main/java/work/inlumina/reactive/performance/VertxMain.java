package work.inlumina.reactive.performance;

import io.vertx.core.Vertx;

/**
 * Main class to deploy a server verticle.
 */
public class VertxMain {
    public static void main(String[] args) {
        Vertx.vertx().deployVerticle(new VertxServer());
    }
}
