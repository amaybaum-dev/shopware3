<?php declare(strict_types=1);

namespace Shopware\Tests\Unit\Core\Framework\App\Manifest\Xml;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\App\Manifest\Manifest;

/**
 * @internal
 *
 * @covers \Shopware\Core\Framework\App\Manifest\Xml\Cookie\Cookies
 */
class CookiesTest extends TestCase
{
    public function testFromXml(): void
    {
        $manifest = Manifest::createFromXmlFile(__DIR__ . '/../_fixtures/test-manifest.xml');

        static::assertNotNull($manifest->getCookies());
        static::assertCount(2, $manifest->getCookies()->getCookies());
    }
}
