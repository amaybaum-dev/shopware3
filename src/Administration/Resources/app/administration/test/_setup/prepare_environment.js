/**
 * @package admin
 */

import { config, enableAutoDestroy } from '@vue/test-utils';
import Vue from 'vue';

// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';

// eslint-disable-next-line import/no-extraneous-dependencies
import aclService from './_mocks_/acl.service.mock';
import feature from './_mocks_/feature.service.mock';
import repositoryFactory from './_mocks_/repositoryFactory.service.mock';
import flushPromises from '../_helper_/flushPromises';
import resetFilters from '../_helper_/restartFilters';

// Setup Vue Test Utils configuration
config.showDeprecationWarnings = true;

// enable autoDestroy for wrapper after each test
enableAutoDestroy(afterEach);

// Make common utils available globally as well
global.Vue = Vue;

// Add all directives
const directiveRegistry = Shopware.Directive.getDirectiveRegistry();
directiveRegistry.forEach((value, key) => {
    global.Vue.directive(key, value);
});

// Add all filters
const filterRegistry = Shopware.Filter.getRegistry();
filterRegistry.forEach((value, key) => {
    global.Vue.filter(key, value);
});

// Add services
Shopware.Service().register('acl', () => aclService);
Shopware.Service().register('feature', () => feature);
Shopware.Feature = Shopware.Service('feature');
Shopware.Service().register('repositoryFactory', () => repositoryFactory);

// Provide all services
Shopware.Service().list().forEach(serviceKey => {
    config.provide[serviceKey] = Shopware.Service(serviceKey);
});

// Set important functions for Shopware Core
Shopware.Application.view = {
    setReactive: (target, propertyName, value) => {
        return Vue.set(target, propertyName, value);
    },
    root: {
        $tc: v => v,
    },
    i18n: {
        tc: v => v,
        te: v => v,
        t: v => v,
    },
};

// Prepare Context
Shopware.State.commit('context/setApiInstallationPath', 'installationPath');
Shopware.State.commit('context/setApiApiPath', '/api');
Shopware.State.commit('context/setApiApiResourcePath', '/api/v3');
Shopware.State.commit('context/setApiAssetsPath', '');
Shopware.State.commit('context/setApiLanguageId', '2fbb5fe2e29a4d70aa5854ce7ce3e20b');
Shopware.State.commit('context/setApiInheritance', false);
Shopware.State.commit('context/setApiSystemLanguageId', '2fbb5fe2e29a4d70aa5854ce7ce3e20b');
Shopware.State.commit('context/setApiLiveVersionId', '0fa91ce3e96a4bc2be4bd9ce752c3425');
Shopware.Context.api.authToken = {
    // eslint-disable-next-line max-len
    access: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImI0MTdkYjQ1MzMwNTY1MGIyY2QxMWVhYTBmZjRjNWJmZTVjZWYxYTI3NzBjY2JmY2M3MGY2Y2FiZDIzYWQyYmZiMzc1NTZhNDFlNGE3M2M5In0.eyJhdWQiOiJhZG1pbmlzdHJhdGlvbiIsImp0aSI6ImI0MTdkYjQ1MzMwNTY1MGIyY2QxMWVhYTBmZjRjNWJmZTVjZWYxYTI3NzBjY2JmY2M3MGY2Y2FiZDIzYWQyYmZiMzc1NTZhNDFlNGE3M2M5IiwiaWF0IjoxNjAyODM5OTgxLCJuYmYiOjE2MDI4Mzk5ODEsImV4cCI6MTYwMjg0MDU4MSwic3ViIjoiNzk5Y2NmNzY3MzZjNDkxYTgzNTA5MzA0Mjc3YzI3MTkiLCJzY29wZXMiOlsid3JpdGUiLCJhZG1pbiJdfQ.Df0EnZyZ-eY1iNCB-0x-0Ir8a8XW_HOdhq9HEcx7AbCEogHIFtU_0UPxTLX9_Wo3r-5C4FmbQrN31ReBWxkbEldMb3EU-UL4FIJA2gYhFWAXV2ZhaEJ5hRQ04n4gra0Os48vzYIEOq87_0lPPQqqVZLi68aHLVSF962VE1SkbofKqS2l2mDh9JJjnyhZavpkmpLhLkoWBBUWJS7G-EHo_-DttxPpA8W0Kgyg8Ch4Z2xqZ1r0zaB6hIS97-m8qLFHtjPhrbLW8NIMURIU3_brkkO2wFXrLKc0Y6MLJac8BVEe8VTEoEo8x8Ft2dCQU5aF2Aht3Y_55m1VjUMXBSb77A',
    expiry: 1602840582,
    // eslint-disable-next-line max-len
    refresh: 'def5020065a671fb38ec810a50bb627db679fd9a046ca0187215d418986fce75d3b55f7e0588c33318f3f7a280edc1e82b764a6b1fb82275e457459e58fff73afaa2aac08acd23322d398a74babbd9e02c11228985a5f140742eaa2c30af55ae350aca32e898ca9a5955c0bf057dee2b39bb5134aa6176668744fe05d6dbc9a0294bf6fa4dd6b4b07ed5d235d89005eeffc0e69ddc072e2023e522a5fd699c3e68b1dcdcc9f60c63f62ff4ed1778abfb0f3b95c4b44ad92d885bf1dca115f086b1a2368e7326f467331b6a0e65049e790c4d3a35fc1d77dfbd91da74c4d7cc449604adecd41bd84596efa4651b75bef0eeba6aef0d33338be22bf4e816584aefce9588a85d1dafbe311e330835d54dc19f43baa7a7ad63ee9573c98444219d80266b52b6e840354596d369e8350f3df18dae21a9dc607dcf70d66ddf78652a0d4083b85a832cc808d61ad15c196e1579cdea3829a8b480572f7afd590cd18fe811b5596554a58c5800756fdb1c051a461e4d7cf7c94c552ccf79d7a1368dfe8e63f4402abbaa6cabbd92437cf3f78c302ea7492dd60f5cfd8f7b4e8aa714',
};
Shopware.State.commit('setAdminLocale', {
    locales: ['en-GB'],
    locale: 'en-GB',
    languageId: '2fbb5fe2e29a4d70aa5854ce7ce3e20b',
});

// Add global mocks
config.mocks = {
    $tc: v => v,
    $t: v => v,
    $te: () => true,
    $sanitize: key => key,
    $device: {
        onResize: jest.fn(),
        removeResizeListener: jest.fn(),
        getSystemKey: jest.fn(() => 'CTRL'),
        getViewportWidth: jest.fn(() => 1920),
    },
    $router: {
        replace: jest.fn(),
        push: jest.fn(),
        go: jest.fn(),
        resolve: jest.fn(() => {
            return {
                resolved: {
                    matched: [],
                },
            };
        }),
    },
    $route: {
        params: {},
    },
    $store: Shopware.State._store,
};

global.allowedErrors = [
    {
        method: 'warn',
        msg: 'No extension found for origin ""',
    },
];

global.flushPromises = flushPromises;
global.resetFilters = resetFilters;

let consoleHasErrorOrWarning = false;
let errorArgs = null;
let warnArgs = null;
const { error, warn } = console;

global.console.error = (...args) => {
    let silenceError = false;
    // eslint-disable-next-line array-callback-return
    global.allowedErrors.some(allowedError => {
        if (allowedError.method !== 'error') {
            return;
        }

        if (typeof allowedError.msg === 'string') {
            if (typeof args[0] === 'string') {
                const shouldBeSilenced = args[0].includes(allowedError.msg);

                if (shouldBeSilenced) {
                    silenceError = true;
                }
            }

            return;
        }

        const shouldBeSilenced = allowedError.msg.test(args[0]);

        if (shouldBeSilenced) {
            silenceError = true;
        }
    });

    if (!silenceError) {
        consoleHasErrorOrWarning = true;
        errorArgs = args;
        error(...args);
    }
};

global.console.warn = (...args) => {
    let silenceWarn = false;

    // eslint-disable-next-line array-callback-return
    global.allowedErrors.some(allowedError => {
        if (allowedError.method !== 'warn') {
            return;
        }

        if (typeof allowedError.msg === 'string') {
            const shouldBeSilenced = args[0].includes(allowedError.msg);

            if (shouldBeSilenced) {
                silenceWarn = true;
            }

            return;
        }

        const shouldBeSilenced = allowedError.msg.test(args[0]);

        if (shouldBeSilenced) {
            silenceWarn = true;
        }
    });

    if (!silenceWarn) {
        consoleHasErrorOrWarning = true;
        warnArgs = args;
        warn(...args);
    }
};

// eslint-disable-next-line jest/require-top-level-describe
beforeEach(() => {
    consoleHasErrorOrWarning = false;
    errorArgs = null;
    warnArgs = null;
});

// eslint-disable-next-line jest/require-top-level-describe
afterEach(() => {
    if (consoleHasErrorOrWarning) {
        // reset variable for next test
        consoleHasErrorOrWarning = false;

        if (errorArgs) {
            throw new Error(...errorArgs);
        }

        if (warnArgs) {
            throw new Error(...warnArgs);
        }

        throw new Error('A console.error or console.warn occurred without any arguments.');
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// This is here to always get the Vue 2 version of templates
window._features_ = {
    VUE3: false,
};
