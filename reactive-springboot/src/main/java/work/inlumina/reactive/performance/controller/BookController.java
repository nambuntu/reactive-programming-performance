package work.inlumina.reactive.performance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import work.inlumina.reactive.performance.entity.Book;
import work.inlumina.reactive.performance.service.BookService;

import javax.validation.Valid;

@RestController
@RequestMapping("/books")
public class BookController {
    @Autowired
    private BookService bookService;

    @PostMapping("/")
    public Mono<Book> addBook(@Valid @RequestBody Book book) {
        return this.bookService.addBook(book);
    }

    @GetMapping(value = "/", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Book> getAllBooks() {
        return this.bookService.getAllBooks();
    }
}
