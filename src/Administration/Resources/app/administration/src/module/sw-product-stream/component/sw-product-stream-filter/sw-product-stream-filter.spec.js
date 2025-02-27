/*
 * @package inventory
 */

import { shallowMount } from '@vue/test-utils';
import swProductStreamFilter from 'src/module/sw-product-stream/component/sw-product-stream-filter';
import 'src/app/component/rule/sw-condition-base';

Shopware.Component.extend('sw-product-stream-filter', 'sw-condition-base', swProductStreamFilter);

const EntityDefinitionFactory = require('src/core/factory/entity-definition.factory').default;

async function createWrapper(privileges = []) {
    const mockEntitySchema = {
        product: {
            entity: 'product',
            properties: {},
        },
    };

    Shopware.EntityDefinition = EntityDefinitionFactory;
    Object.keys(mockEntitySchema).forEach((entity) => {
        Shopware.EntityDefinition.add(entity, mockEntitySchema[entity]);
    });

    return shallowMount(await Shopware.Component.build('sw-product-stream-filter'), {
        stubs: {
            'sw-condition-type-select': true,
            'sw-text-field': true,
            'sw-context-button': true,
            'sw-context-menu-item': true,
            'sw-field-error': true,
            'sw-product-stream-value': true,
            'sw-product-stream-field-select': true,
        },
        provide: {
            conditionDataProviderService: {
                getPlaceholderData: () => {},
                getComponentByCondition: () => {},
                allowedJsonAccessors: {
                    'json.test': {
                        value: 'json.test',
                        type: 'string',
                    },
                },
            },
            availableTypes: {},
            availableGroups: [],
            childAssociationField: {},
            createCondition: () => {},
            productCustomFields: {
                test: 'customFields.test',
            },
            acl: {
                can: (identifier) => {
                    if (!identifier) { return true; }

                    return privileges.includes(identifier);
                },
            },
            insertNodeIntoTree: () => {},
            removeNodeFromTree: () => {},
        },
        propsData: {
            condition: {},
        },
    });
}

describe('src/module/sw-product-stream/component/sw-product-stream-filter', () => {
    it('should be a Vue.JS component', async () => {
        const wrapper = await createWrapper();

        expect(wrapper.vm).toBeTruthy();
    });

    it('should return correct tooltip settings', async () => {
        const wrapper = await createWrapper();
        const tooltipObject = wrapper.vm.getNoPermissionsTooltip();

        expect(tooltipObject).toEqual({
            appearance: 'dark',
            disabled: true,
            message: 'sw-privileges.tooltip.warning',
            showDelay: 300,
            showOnDisabledElements: true,
        });
    });

    it.each([
        ['true', 'sw-context-button-stub', 'product_stream.viewer'],
        [undefined, 'sw-context-button-stub', 'product_stream.viewer, product_stream.editor'],
        ['true', 'sw-product-stream-value-stub', 'product_stream.viewer'],
        [undefined, 'sw-product-stream-value-stub', 'product_stream.viewer, product_stream.editor'],
        ['true', 'sw-product-stream-field-select-stub', 'product_stream.viewer'],
        [undefined, 'sw-product-stream-field-select-stub', 'product_stream.viewer, product_stream.editor'],
    ])('should have %p as disabled state on \'%s\' when having %s role', async (state, element, role) => {
        const roles = role.split(', ');

        const wrapper = await createWrapper(roles);
        const targetElement = wrapper.find(element);

        expect(targetElement.attributes('disabled')).toBe(state);
    });

    it('should return correct custom fields', async () => {
        const wrapper = await createWrapper();

        await wrapper.setProps({
            condition: {
                field: 'customFields.test',
            },
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.fields).toEqual(['customFields.test']);
    });

    it('should return true if input is custom field', async () => {
        const wrapper = await createWrapper();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.isCustomField('customFields.test')).toBe(true);
    });

    it('should return correct json field', async () => {
        const wrapper = await createWrapper();

        await wrapper.setProps({
            condition: {
                field: 'json.test',
            },
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.fields).toEqual(['json.test']);
    });
});

