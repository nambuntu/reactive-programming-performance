<?php
/**
 * Performance stress test Symfony
 * @author Nam Nguyen <namnvhue@gmail.com>
 */

namespace App\Controller;


use App\Service\BookService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/cleanup")
 * Class CleanupController
 * @package App\Controller
 */
class CleanupController extends AbstractController
{
    private $bookService;

    public function __construct(BookService $bookService)
    {
        $this->bookService = $bookService;
    }

    /**
     * @Route("/", methods={"POST"})
     * @return Response
     */
    public function delete()
    {
        $this->bookService->deleteAll();
        return new Response("OK");
    }
}