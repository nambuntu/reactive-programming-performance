package work.inlumina.reactive.performance;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.codec.BodyCodec;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
public class VertxServerTest {

    @BeforeEach
    public void deployVerticle(Vertx vertx, VertxTestContext testContext) {
        vertx.deployVerticle(new VertxServer(), testContext.completing());
    }

    @Test
    public void testServerResponse(Vertx vertx, VertxTestContext vertxTestContext) {
        WebClient webClient = WebClient.create(vertx);
        webClient.post(8080, "localhost", "/items/")
                .as(BodyCodec.jsonObject())
                .sendJsonObject(new JsonObject()
                        .put("name", "Hello world")
                        .put("price", "125.25"), vertxTestContext.succeeding(resp -> {
                    vertxTestContext.verify(() -> {
                        JsonObject json = resp.body();
                        assertThat(resp.statusCode()).isEqualTo(200);
                        assertThat(json.getString("name")).isEqualTo("Hello world");
                        vertxTestContext.completeNow();
                    });
                }));
    }

    @Test
    public void testSimple(Vertx vertx, VertxTestContext vertxTestContext) {
        WebClient webClient = WebClient.create(vertx);
        webClient.get(8080, "localhost", "/test/")
                .as(BodyCodec.string())
                .send(vertxTestContext.succeeding(resp -> {
                    vertxTestContext.verify(() -> {
                        assertThat(resp.statusCode()).isEqualTo(200);
                        assertThat(resp.body()).contains("Hello");
                        vertxTestContext.completeNow();
                    });
                }));

    }

}
