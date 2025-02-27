/**
 * @package admin
 */

import { createLocalVue, mount } from '@vue/test-utils';
import 'src/app/component/app/sw-app-app-url-changed-modal';
import 'src/app/component/base/sw-button';
import 'src/app/component/base/sw-modal';
import 'src/app/component/utils/sw-loader';

const strategies = [
    {
        description: '',
        name: 'move-shop-permanently',
    },
    {
        description: '',
        name: 'reinstall-apps',
    },
    {
        description: '',
        name: 'uninstall-apps',
    },
];

describe('sw-app-app-url-changed-modal', () => {
    let wrapper = null;
    let stubs;

    async function createWrapper() {
        const localVue = createLocalVue();
        localVue.directive('tooltip', {});

        return mount(await Shopware.Component.build('sw-app-app-url-changed-modal'), {
            localVue,
            stubs,
            propsData: {
                urlDiff: {
                    oldUrl: 'https://old-url',
                    newUrl: 'https://new-url',
                },
            },
            provide: {
                appUrlChangeService: {
                    fetchResolverStrategies: () => Promise.resolve(strategies),
                    resolveUrlChange: jest.fn(() => Promise.resolve()),
                },
                shortcutService: {
                    startEventListener() {},
                    stopEventListener() {},
                },
            },
        });
    }

    beforeAll(async () => {
        stubs = {
            'sw-modal': await Shopware.Component.build('sw-modal'),
            'sw-button': await Shopware.Component.build('sw-button'),
            'sw-loader': await Shopware.Component.build('sw-loader'),
            'sw-icon': true,
            'icons-default-basic-shape-circle-filled': {
                template: '<span class="sw-icon sw-icon--default-basic-shape-circle-filled"></span>',
            },
            'icons-regular-circle': {
                template: '<span class="sw-icon sw-icon--regular-circle"></span>',
            },
            'icons-regular-times-s': {
                template: '<span class="sw-icon sw-icon--regular-times-s"></span>',
            },
        };
    });

    beforeEach(async () => {
        wrapper = await createWrapper();
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
            wrapper = null;
        }
    });

    it('should be a Vue.js component', async () => {
        expect(wrapper.vm).toBeTruthy();
        await (wrapper.vm.$nextTick());
    });

    it('should select the first strategy by default', async () => {
        expect(wrapper.vm.$data.selectedStrategy.name).toMatch(strategies[0].name);
        expect(wrapper.vm.getActiveStyle(strategies[0]))
            .toEqual({
                'sw-app-app-url-changed-modal__content-migration-strategy--active': true,
            });
    });

    it('emmits modal-close if modal is closed', async () => {
        const modal = wrapper.findComponent(stubs['sw-modal']);

        modal.vm.$emit('modal-close');

        expect(wrapper.emitted('modal-close')).toBeTruthy();
    });

    it('selects clicked strategy', async () => {
        const strategyButtons = wrapper.findAll('.sw-app-app-url-changed-modal__content-migration-strategy');

        await strategyButtons.at(1).trigger('click');

        expect(wrapper.vm.selectedStrategy).toBe(strategies[1]);

        await strategyButtons.at(2).trigger('click');

        expect(wrapper.vm.selectedStrategy).toBe(strategies[2]);

        await strategyButtons.at(0).trigger('click');

        expect(wrapper.vm.selectedStrategy).toBe(strategies[0]);
    });

    it('should send the selected strategy', async () => {
        const urlResolveMock = wrapper.vm.appUrlChangeService.resolveUrlChange;

        wrapper.vm.selectedStrategy = strategies[1];

        wrapper.vm.confirm();

        await flushPromises();

        expect(urlResolveMock.mock.calls[0][0].name).toMatch(strategies[1].name);
        expect(wrapper.emitted()['modal-close']).toBeTruthy();
    });
});
