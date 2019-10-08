package work.inlumina.reactive.performance.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import work.inlumina.reactive.performance.service.BookService;

@RestController
@RequestMapping("/cleanup")
public class CleanupController {
    @Autowired
    private BookService bookService;

    @PostMapping("/")
    public String cleanup() {
        this.bookService.cleanup();
        return "OK";
    }
}
