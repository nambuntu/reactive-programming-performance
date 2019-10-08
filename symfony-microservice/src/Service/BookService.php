<?php
/**
 * Performance stress test Symfony
 * @author Nam Nguyen <namnvhue@gmail.com>
 */

namespace App\Service;

use App\Document\Book;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry;
use Doctrine\Common\Persistence\ObjectManager;
use Doctrine\Common\Persistence\ObjectRepository;

/**
 * Class BookService
 * @package App\Service
 */
class BookService
{
    const APP_BOOK = "App:Book";
    /**
     * @var ObjectManager|object
     */
    private $dm;

    public function __construct(ManagerRegistry $managerRegistry)
    {
        $this->dm = $managerRegistry->getManager();
    }

    /**
     * @param array $data
     * @return Book
     */
    public function createBook(array $data)
    {
        $book = new Book();
        $book->setName($data['name'])
            ->setPrice($data['price']);

        $this->dm->persist($book);
        $this->dm->flush();

        return $book;
    }

    /**
     * @return ObjectRepository|object[]
     */
    public function getAllBooks()
    {
        $products = $this->dm
            ->getRepository(self::APP_BOOK)
            ->findAll();

        return $products;
    }


    public function deleteAll()
    {
        $collection = $this->dm->getDocumentCollection(self::APP_BOOK);
        $collection->drop();
    }

}
