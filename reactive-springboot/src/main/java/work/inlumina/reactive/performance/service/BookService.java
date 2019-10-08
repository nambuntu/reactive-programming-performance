package work.inlumina.reactive.performance.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import work.inlumina.reactive.performance.entity.Book;
import work.inlumina.reactive.performance.repository.BookRepository;

@Service
public class BookService {
    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private MongoOperations mongoOps;

    public Mono<Book> addBook(Book book) {
        return this.bookRepository.save(book);
    }

    public Flux<Book> getAllBooks() {
        return this.bookRepository.findAll();
    }

    public void cleanup() {
        mongoOps.dropCollection("book");
    }
}
