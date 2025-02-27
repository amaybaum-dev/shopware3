<?php declare(strict_types=1);

namespace Shopware\Tests\Integration\Elasticsearch\Product;

use Doctrine\DBAL\Connection;
use OpenSearch\Client;
use PHPUnit\Framework\TestCase;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Adapter\Storage\AbstractKeyValueStorage;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Feature;
use Shopware\Core\Framework\Test\TestCaseBase\KernelTestBehaviour;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\System\CustomField\CustomFieldTypes;
use Shopware\Elasticsearch\Framework\Command\ElasticsearchIndexingCommand;
use Shopware\Elasticsearch\Framework\ElasticsearchOutdatedIndexDetector;
use Shopware\Elasticsearch\Framework\Indexing\CreateAliasTaskHandler;
use Shopware\Elasticsearch\Framework\Indexing\ElasticsearchIndexer;
use Shopware\Elasticsearch\Test\ElasticsearchTestTestBehaviour;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @internal
 *
 * @group skip-paratest
 *
 * @package system-settings
 */
class CustomFieldUpdaterTest extends TestCase
{
    use ElasticsearchTestTestBehaviour;
    use KernelTestBehaviour;

    private Client $client;

    private ElasticsearchOutdatedIndexDetector $indexDetector;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = $this->getContainer()->get(Client::class);
        $this->indexDetector = $this->getContainer()->get(ElasticsearchOutdatedIndexDetector::class);
    }

    public function testCreateIndices(): void
    {
        if (Feature::isActive('ES_MULTILINGUAL_INDEX')) {
            $this->getContainer()->get(AbstractKeyValueStorage::class)->set(ElasticsearchIndexer::ENABLE_MULTILINGUAL_INDEX_KEY, 1);
        }

        $this->clearElasticsearch();

        $connection = $this->getContainer()->get(Connection::class);

        $connection->executeStatement('DELETE FROM custom_field');

        $command = new ElasticsearchIndexingCommand(
            $this->getContainer()->get(ElasticsearchIndexer::class),
            $this->getContainer()->get('messenger.bus.shopware'),
            $this->getContainer()->get(CreateAliasTaskHandler::class),
            true
        );

        $command->run(new ArrayInput([]), new NullOutput());

        static::assertNotEmpty($this->indexDetector->getAllUsedIndices());
    }

    /**
     * @depends testCreateIndices
     */
    public function testCreateCustomFields(): void
    {
        $customFieldRepository = $this->getContainer()->get('custom_field_set.repository');
        if (Feature::isActive('ES_MULTILINGUAL_INDEX')) {
            $this->getContainer()->get(AbstractKeyValueStorage::class)->set(ElasticsearchIndexer::ENABLE_MULTILINGUAL_INDEX_KEY, 1);
        }

        $customFieldRepository->create([
            [
                'name' => 'swag_example_set',
                'config' => [
                    'label' => [
                        'en-GB' => 'English custom field set label',
                        'de-DE' => 'German custom field set label',
                    ],
                ],
                'relations' => [[
                    'entityName' => 'product',
                ]],
                'customFields' => [
                    [
                        'name' => 'test_newly_created_field',
                        'type' => CustomFieldTypes::INT,
                    ],
                    [
                        'name' => 'test_newly_created_field_text',
                        'type' => CustomFieldTypes::TEXT,
                    ],
                ],
            ],
        ], Context::createDefaultContext());

        $indexName = array_keys($this->indexDetector->getAllUsedIndices())[0];

        $indices = array_values($this->client->indices()->getMapping(['index' => $indexName]))[0];
        $properties = $indices['mappings']['properties']['customFields']['properties'] ?? [];

        if (Feature::isActive('ES_MULTILINGUAL_INDEX')) {
            static::assertArrayHasKey(Defaults::LANGUAGE_SYSTEM, $properties);
            $properties = $properties[Defaults::LANGUAGE_SYSTEM]['properties'];
            static::assertIsArray($properties);
            static::assertArrayHasKey('test_newly_created_field', $properties);
            static::assertSame('long', $properties['test_newly_created_field']['type']);

            static::assertArrayHasKey('test_newly_created_field_text', $properties);
            static::assertSame('text', $properties['test_newly_created_field_text']['type']);
        } else {
            static::assertArrayHasKey('test_newly_created_field', $properties);
            static::assertSame('long', $properties['test_newly_created_field']['type']);

            static::assertArrayHasKey('test_newly_created_field_text', $properties);
            static::assertSame('text', $properties['test_newly_created_field_text']['type']);
        }
    }

    /**
     * @depends testCreateCustomFields
     */
    public function testRelationWillBeSetLaterOn(): void
    {
        $customFieldRepository = $this->getContainer()->get('custom_field_set.repository');

        $id = Uuid::randomHex();

        if (Feature::isActive('ES_MULTILINGUAL_INDEX')) {
            $this->getContainer()->get(AbstractKeyValueStorage::class)->set(ElasticsearchIndexer::ENABLE_MULTILINGUAL_INDEX_KEY, 1);
        }

        $customFieldRepository->create([
            [
                'id' => $id,
                'name' => 'swag_example_set',
                'config' => [
                    'label' => [
                        'en-GB' => 'English custom field set label',
                        'de-DE' => 'German custom field set label',
                    ],
                ],
                'customFields' => [
                    [
                        'name' => 'test_later_created_field',
                        'type' => CustomFieldTypes::INT,
                    ],
                    [
                        'name' => 'test_later_created_field_text',
                        'type' => CustomFieldTypes::TEXT,
                    ],
                ],
            ],
        ], Context::createDefaultContext());

        $customFieldRepository->update([
            [
                'id' => $id,
                'relations' => [[
                    'entityName' => 'product',
                ]],
            ],
        ], Context::createDefaultContext());

        $indexName = array_keys($this->indexDetector->getAllUsedIndices())[0];

        $indices = array_values($this->client->indices()->getMapping(['index' => $indexName]))[0];
        $properties = $indices['mappings']['properties']['customFields']['properties'];

        if (Feature::isActive('ES_MULTILINGUAL_INDEX')) {
            static::assertArrayHasKey(Defaults::LANGUAGE_SYSTEM, $properties);
            $properties = $properties[Defaults::LANGUAGE_SYSTEM]['properties'];
            static::assertIsArray($properties);
            static::assertArrayHasKey('test_later_created_field', $properties);
            static::assertSame('long', $properties['test_later_created_field']['type']);

            static::assertArrayHasKey('test_later_created_field_text', $properties);
            static::assertSame('text', $properties['test_later_created_field_text']['type']);
        } else {
            static::assertArrayHasKey('test_later_created_field', $properties);
            static::assertSame('long', $properties['test_later_created_field']['type']);

            static::assertArrayHasKey('test_later_created_field_text', $properties);
            static::assertSame('text', $properties['test_later_created_field_text']['type']);
        }

        $this->clearElasticsearch();
        $this->getContainer()->get(Connection::class)->executeStatement('DELETE FROM elasticsearch_index_task');
    }

    protected function getDiContainer(): ContainerInterface
    {
        return $this->getContainer();
    }

    protected function runWorker(): void
    {
    }
}
