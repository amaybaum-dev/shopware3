<?php declare(strict_types=1);

namespace Shopware\Tests\Integration\Core\Framework\App\Manifest\Xml\CustomFieldTypes;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\App\Manifest\Manifest;
use Shopware\Core\Framework\App\Manifest\Xml\CustomField\CustomFieldSet;
use Shopware\Core\Framework\App\Manifest\Xml\CustomField\CustomFieldTypes\BoolField;
use Shopware\Core\Framework\Test\TestCaseBase\IntegrationTestBehaviour;
use Shopware\Tests\Integration\Core\Framework\App\CustomFieldTypeTestBehaviour;

/**
 * @internal
 */
class BoolFieldTest extends TestCase
{
    use CustomFieldTypeTestBehaviour;
    use IntegrationTestBehaviour;

    public function testCreateFromXml(): void
    {
        $manifest = Manifest::createFromXmlFile(__DIR__ . '/_fixtures/bool-field.xml');

        static::assertNotNull($manifest->getCustomFields());
        static::assertCount(1, $manifest->getCustomFields()->getCustomFieldSets());

        /** @var CustomFieldSet $customFieldSet */
        $customFieldSet = $manifest->getCustomFields()->getCustomFieldSets()[0];

        static::assertCount(1, $customFieldSet->getFields());

        $boolField = $customFieldSet->getFields()[0];
        static::assertInstanceOf(BoolField::class, $boolField);
        static::assertEquals('test_bool_field', $boolField->getName());
        static::assertEquals([
            'en-GB' => 'Test bool field',
        ], $boolField->getLabel());
        static::assertEquals([], $boolField->getHelpText());
        static::assertEquals(1, $boolField->getPosition());
        static::assertFalse($boolField->getRequired());
    }

    public function testToEntityArray(): void
    {
        $boolField = $this->importCustomField(__DIR__ . '/_fixtures/bool-field.xml');

        static::assertEquals('test_bool_field', $boolField->getName());
        static::assertEquals('bool', $boolField->getType());
        static::assertTrue($boolField->isActive());
        static::assertEquals([
            'type' => 'checkbox',
            'label' => [
                'en-GB' => 'Test bool field',
            ],
            'helpText' => [],
            'componentName' => 'sw-field',
            'customFieldType' => 'checkbox',
            'customFieldPosition' => 1,
        ], $boolField->getConfig());
    }
}
