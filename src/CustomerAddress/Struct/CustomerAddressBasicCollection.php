<?php declare(strict_types=1);
/**
 * Shopware 5
 * Copyright (c) shopware AG
 *
 * According to our dual licensing model, this program can be used either
 * under the terms of the GNU Affero General Public License, version 3,
 * or under a proprietary license.
 *
 * The texts of the GNU Affero General Public License with an additional
 * permission and of our proprietary license can be found at and
 * in the LICENSE file you have received along with this program.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * "Shopware" is a registered trademark of shopware AG.
 * The licensing of the program under the AGPLv3 does not imply a
 * trademark license. Therefore any rights, title and interest in
 * our trademarks remain entirely with us.
 */

namespace Shopware\CustomerAddress\Struct;

use Shopware\AreaCountry\Struct\AreaCountryBasicCollection;
use Shopware\AreaCountryState\Struct\AreaCountryStateBasicCollection;
use Shopware\Framework\Struct\Collection;

class CustomerAddressBasicCollection extends Collection
{
    /**
     * @var CustomerAddressBasicStruct[]
     */
    protected $elements = [];

    public function add(CustomerAddressBasicStruct $customerAddress): void
    {
        $key = $this->getKey($customerAddress);
        $this->elements[$key] = $customerAddress;
    }

    public function remove(string $uuid): void
    {
        parent::doRemoveByKey($uuid);
    }

    public function removeElement(CustomerAddressBasicStruct $customerAddress): void
    {
        parent::doRemoveByKey($this->getKey($customerAddress));
    }

    public function exists(CustomerAddressBasicStruct $customerAddress): bool
    {
        return parent::has($this->getKey($customerAddress));
    }

    public function getList(array $uuids): CustomerAddressBasicCollection
    {
        return new self(array_intersect_key($this->elements, array_flip($uuids)));
    }

    public function get(string $uuid): ? CustomerAddressBasicStruct
    {
        if ($this->has($uuid)) {
            return $this->elements[$uuid];
        }

        return null;
    }

    public function getUuids(): array
    {
        return $this->fmap(function (CustomerAddressBasicStruct $customerAddress) {
            return $customerAddress->getUuid();
        });
    }

    public function getCustomerUuids(): array
    {
        return $this->fmap(function (CustomerAddressBasicStruct $customerAddress) {
            return $customerAddress->getCustomerUuid();
        });
    }

    public function filterByCustomerUuid(string $uuid): CustomerAddressBasicCollection
    {
        return $this->filter(function (CustomerAddressBasicStruct $customerAddress) use ($uuid) {
            return $customerAddress->getCustomerUuid() === $uuid;
        });
    }

    public function getAreaCountryUuids(): array
    {
        return $this->fmap(function (CustomerAddressBasicStruct $customerAddress) {
            return $customerAddress->getAreaCountryUuid();
        });
    }

    public function filterByAreaCountryUuid(string $uuid): CustomerAddressBasicCollection
    {
        return $this->filter(function (CustomerAddressBasicStruct $customerAddress) use ($uuid) {
            return $customerAddress->getAreaCountryUuid() === $uuid;
        });
    }

    public function getAreaCountryStateUuids(): array
    {
        return $this->fmap(function (CustomerAddressBasicStruct $customerAddress) {
            return $customerAddress->getAreaCountryStateUuid();
        });
    }

    public function filterByAreaCountryStateUuid(string $uuid): CustomerAddressBasicCollection
    {
        return $this->filter(function (CustomerAddressBasicStruct $customerAddress) use ($uuid) {
            return $customerAddress->getAreaCountryStateUuid() === $uuid;
        });
    }

    public function getAreaCountries(): AreaCountryBasicCollection
    {
        return new AreaCountryBasicCollection(
            $this->fmap(function (CustomerAddressBasicStruct $customerAddress) {
                return $customerAddress->getAreaCountry();
            })
        );
    }

    public function getAreaCountryStates(): AreaCountryStateBasicCollection
    {
        return new AreaCountryStateBasicCollection(
            $this->fmap(function (CustomerAddressBasicStruct $customerAddress) {
                return $customerAddress->getAreaCountryState();
            })
        );
    }

    protected function getKey(CustomerAddressBasicStruct $element): string
    {
        return $element->getUuid();
    }
}
