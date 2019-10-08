<?php
/**
 * Performance stress test Symfony
 * @author Nam Nguyen <namnvhue@gmail.com>
 */

namespace App\Controller;

use App\Document\Book;
use App\Service\BookService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/books")
 * Class BookController
 * @package App\Controller
 */
class BookController extends AbstractController
{
    /**
     * @var LoggerInterface
     */
    private $logger;
    /**
     * @var BookService
     */
    private $bookService;

    public function __construct(LoggerInterface $logger, BookService $bookService)
    {
        $this->logger = $logger;
        $this->bookService = $bookService;
    }

    /**
     * @Route("/", methods={"GET"})
     */
    public function find()
    {
        $this->logger->info('Get all books');
        $books = $this->bookService->getAllBooks();
        $json = [];
        /**
         * @var Book $book
         */
        foreach ($books as $book) {
            $json[] = ['name' => $book->getName(), 'price' => $book->getPrice()];
        }
        return new Response(json_encode($json));
    }

    /**
     * @Route("/", methods={"POST"})
     * @return Response
     */
    public function create(Request $request)
    {
        $data = json_decode($request->getContent(), true);

        $this->logger->info('Create new book', $data);
        $book = $this->bookService->createBook($data);
        return new Response(json_encode(['name' => $book->getName(), 'price' => $book->getPrice()]));
    }
}
