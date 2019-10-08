package work.inlumina.reactive.performance;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.reactive.server.FluxExchangeResult;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;
import work.inlumina.reactive.performance.entity.Book;
import work.inlumina.reactive.performance.service.BookService;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ReactivePerformanceApplicationTests {

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private BookService bookService;

    @Test
    public void testSaveBook() {
        Book book = new Book();
        book.setName("Avenger: Endgame");
        book.setPrice(new BigDecimal(1234.56));

        WebTestClient.BodyContentSpec spec = this.webTestClient
                .post()
                .uri("/books/")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8)
                .body(Mono.just(book), Book.class)
                .exchange()
                .expectStatus().isOk()
                .expectHeader().contentType(MediaType.APPLICATION_JSON_UTF8)
                .expectBody()
                .jsonPath("$.id").isNotEmpty()
                .jsonPath("$.name").isNotEmpty()
                .jsonPath("$.createdDate").isNotEmpty();
    }

    @Test
    public void testGetBooks() {
        FluxExchangeResult<Book> result = this.webTestClient
                .get()
                .uri("/books/")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .exchange()
                .expectStatus().isOk()
                .returnResult(Book.class);

        result.consumeWith(bookStream -> {
            Book firstBook = bookStream.getResponseBody().blockFirst();
            System.out.println(firstBook.toString());
            assertThat(firstBook.getName()).isNotBlank();
        });
    }

}
