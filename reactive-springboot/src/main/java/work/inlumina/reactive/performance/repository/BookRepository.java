package work.inlumina.reactive.performance.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
import work.inlumina.reactive.performance.entity.Book;

@Repository
public interface BookRepository extends ReactiveMongoRepository<Book, String> {
    public Mono<Book> findOneByNameEquals(String name);
}
