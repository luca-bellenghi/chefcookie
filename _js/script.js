import 'mdn-polyfills/Object.entries';
import 'mdn-polyfills/Object.values';
import 'mdn-polyfills/Number.isInteger';
import 'mdn-polyfills/Number.isInteger';
import 'mdn-polyfills/Element.prototype.closest';
import 'mdn-polyfills/Node.prototype.remove';
import '@babel/polyfill/noConflict'; // ie11 support
import helper from './_helper';
import {cc_basic_style} from './_constants';


export default class chefcookie {
    constructor(config = {}) {
        this.config = config;
        // add dummy entries for empty groups
        this.config.settings.forEach((group, i) => {
            if (!('scripts' in group) || Object.keys(group.scripts).length === 0) {
                group.scripts = {};
                group.scripts['dummy_group_' + i] = {};
            }
        });

        this.isDestroyed = false;
        this.isOpened = false;
        if (!('chefcookie_loaded' in window)) {
            window.chefcookie_loaded = [];
        }
        this.scrollDepthTriggeredOnce = false;
        this.scrollDepthTriggered = {
            1: false,
            10: false,
            25: false,
            50: false,
            75: false,
            100: false
        };
        this.eventListeners = [];
        this.animationSpeed = 300;
        this.scrollPosition = 0;
    }

    init() {
        if (
            (this.config.exclude_google_pagespeed === undefined || this.config.exclude_google_pagespeed === true) &&
            (navigator.userAgent.indexOf('Speed Insights') > -1 ||
                navigator.userAgent.indexOf('Chrome-Lighthouse') > -1)
        ) {
            return;
        }

        if (this.isExcluded()) {
            this.bindOptOutOptIn();
            this.updateOptOutOptIn();
            return;
        }

        if (this.forceAccept()) {
            this.autoAcceptAllScripts();
            this.setCookieToHideOverlay();
        }

        if (this.isCookieSetToHideOverlay()) {
            this.addEnabledScripts(false);
        } else {
            this.autoAcceptBasicScripts();
            this.open();
            this.trackFirstUserInteraction();
        }

        this.bindOptOutOptIn();
        this.updateOptOutOptIn();
    }

    open() {
        if (this.isOpened === true) {
            return;
        }
        this.isOpened = true;
        this.addStyle();
        this.buildDom();
        this.addHtmlClasses();
        this.animationIn();
        this.bindButtons();
        this.fixMaxHeight();
        this.logTracking('open');
    }

    close() {
        if (this.isOpened === false) {
            return;
        }
        this.isOpened = false;
        document.documentElement.classList.remove('chefcookie--visible');
        document.documentElement.classList.remove('chefcookie--fade');
        document.documentElement.classList.remove('chefcookie--noscroll');
        // reset scroll position
        if (this.config.style.layout !== 'topbar') {
            document.body.style.top = 'auto';
            window.scrollTo(0, this.scrollPosition);
        }
        document.documentElement.classList.remove('chefcookie--blur');
        this.animationOut();
        setTimeout(() => {
            document.querySelector('.chefcookie').remove();
            document.querySelector('.chefcookie-styles').remove();
        }, this.animationSpeed);
    }

    isOpen() {
        return this.isOpened;
    }

    animationIn() {
        document.querySelector('.chefcookie__inner').style.overflowY = 'hidden';
        if (this.config.style.layout === 'topbar') {
            document.querySelector('.chefcookie').style.marginTop =
                -1 * document.querySelector('.chefcookie').offsetHeight + 'px';
        }
        if (this.config.style.layout === 'bottombar') {
            document.querySelector('.chefcookie').style.marginBottom =
                -1 * document.querySelector('.chefcookie').offsetHeight + 'px';
        }
        if (this.config.style.layout === 'overlay') {
            document.querySelector('.chefcookie__box').style.transform = 'scale(0.7)';
        }
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.querySelector('.chefcookie').style.transition =
                    'opacity ' +
                    this.animationSpeed / 1000 +
                    's ease-in-out, margin ' +
                    this.animationSpeed / 1000 +
                    's ease-in-out';
                document.querySelector('.chefcookie__box').style.transition =
                    'transform ' + this.animationSpeed / 1000 + 's ease-in-out';
                document.querySelector('.chefcookie').classList.remove('chefcookie--hidden');
                if (this.config.style.layout === 'topbar') {
                    document.querySelector('.chefcookie').style.marginTop = 0 + 'px';
                }
                if (this.config.style.layout === 'bottombar') {
                    document.querySelector('.chefcookie').style.marginBottom = 0 + 'px';
                }
                if (this.config.style.layout === 'overlay') {
                    document.querySelector('.chefcookie__box').style.transform = 'none';
                }
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        document.querySelector('.chefcookie__inner').style.overflowY = 'auto';
                    }, this.animationSpeed + 30);
                });
            }, 30);
        });
    }

    animationOut() {
        document.querySelector('.chefcookie__inner').style.overflowY = 'hidden';
        document.querySelector('.chefcookie').classList.add('chefcookie--hidden');
        if (this.config.style.layout === 'topbar') {
            document.querySelector('.chefcookie').style.marginTop =
                -1 * document.querySelector('.chefcookie').offsetHeight + 'px';
        }
        if (this.config.style.layout === 'bottombar') {
            document.querySelector('.chefcookie').style.marginBottom =
                -1 * document.querySelector('.chefcookie').offsetHeight + 'px';
        }
        if (this.config.style.layout === 'overlay') {
            document.querySelector('.chefcookie__box').style.transform = 'scale(0.7)';
        }
    }

    destroy() {
        this.close();
        this.config = {};
        this.isDestroyed = true;
        this.isOpened = false;
        /* intentionally don't reset loaded scripts */
        /*
        if ('chefcookie_loaded' in window) {
            delete window.chefcookie_loaded;
        }
        */
        this.unregisterAllEventListeners();
        this.eventListeners = [];
    }

    forceAccept() {
        return helper.getParam('accept') === '1';
    }

    bindOptOutOptIn() {
        // bind opt out
        this.registerEventListener(document, 'click', e => {
            if (
                e.target.hasAttribute('data-cc-disable') ||
                (e.target.tagName !== 'A' && e.target.closest('[data-cc-disable]'))
            ) {
                let el = e.target.closest('[data-cc-disable]');
                if (!this.isAccepted(el.getAttribute('data-cc-disable'))) {
                    this.accept(el.getAttribute('data-cc-disable'), true);
                } else {
                    this.decline(el.getAttribute('data-cc-disable'), true);
                }
                this.updateOptOutOptIn();
                e.preventDefault();
            }
        });

        // bind opt in
        this.registerEventListener(document, 'click', e => {
            if (
                e.target.hasAttribute('data-cc-enable') ||
                (e.target.tagName !== 'A' && e.target.closest('[data-cc-enable]'))
            ) {
                let el = e.target.closest('[data-cc-enable]');
                if (!this.isAccepted(el.getAttribute('data-cc-enable'))) {
                    this.accept(el.getAttribute('data-cc-enable'), true);
                }
                this.updateOptOutOptIn();
                e.preventDefault();
            }
        });

        // bind open
        this.registerEventListener(document, 'click', e => {
            if (
                e.target.hasAttribute('data-cc-open') ||
                (e.target.tagName !== 'A' && e.target.closest('[data-cc-open]'))
            ) {
                this.open();
                e.preventDefault();
            }
        });
    }

    updateOptOutOptIn() {
        // legacy: support old attribute names
        if (document.querySelector('[data-disable]') !== null) {
            [].forEach.call(document.querySelectorAll('[data-disable]'), el => {
                if (!el.hasAttribute('data-cc-disable')) {
                    el.setAttribute('data-cc-disable', el.getAttribute('data-disable'));
                }
            });
        }
        if (document.querySelector('[data-message]') !== null) {
            [].forEach.call(document.querySelectorAll('[data-message]'), el => {
                if (!el.hasAttribute('data-cc-message')) {
                    el.setAttribute('data-cc-message', el.getAttribute('data-message'));
                }
            });
        }

        // store original message
        if (document.querySelector('[data-cc-disable]') !== null) {
            [].forEach.call(document.querySelectorAll('[data-cc-disable]'), el => {
                if (!el.hasAttribute('data-cc-message-original')) {
                    el.setAttribute('data-cc-message-original', el.textContent);
                }
            });
        }

        // update opt out
        if (document.querySelector('[data-cc-disable]') !== null) {
            [].forEach.call(document.querySelectorAll('[data-cc-disable]'), el => {
                if (this.isAccepted(el.getAttribute('data-cc-disable'))) {
                    el.textContent = el.getAttribute('data-cc-message-original');
                    el.classList.remove('disabled');
                } else {
                    el.textContent = el.getAttribute('data-cc-message');
                    el.classList.add('disabled');
                }
            });
        }

        // update opt in
        if (document.querySelector('[data-cc-enable]') !== null) {
            [].forEach.call(document.querySelectorAll('[data-cc-enable]'), el => {
                if (this.isAccepted(el.getAttribute('data-cc-enable'))) {
                    el.remove();
                }
            });
        }
    }

    isExcluded() {
        if (this.config.exclude === undefined) {
            return false;
        }
        let excluded = false;
        this.config.exclude.forEach(exclude__value => {
            if (typeof exclude__value === 'function' && exclude__value() === true) {
                excluded = true;
            }
            if (
                typeof exclude__value === 'string' &&
                ((exclude__value.indexOf('http') === 0 &&
                    exclude__value ===
                        window.location.protocol + '//' + window.location.host + window.location.pathname) ||
                    (exclude__value.indexOf('http') !== 0 && exclude__value === window.location.pathname) ||
                    (exclude__value.indexOf('http') !== 0 && exclude__value + '/' === window.location.pathname))
            ) {
                excluded = true;
            }
        });
        return excluded;
    }

    addStyle() {
        debugger;
        document.head.insertAdjacentHTML(
            'beforeend',
            `
        <style class="chefcookie-styles">
            ${cc_basic_style(this)}
            ${this.config.style.cc_custom_css_style || ''}
        </style>
        `
        );
    }

    addHtmlClasses() {
        document.documentElement.classList.add('chefcookie--visible');
        if (this.config.style.noscroll == true) {
            // preserve scroll position
            if (this.config.style.layout !== 'topbar') {
                this.scrollPosition = window.pageYOffset;
                document.body.style.top = -this.scrollPosition + 'px';
            }
            document.documentElement.classList.add('chefcookie--noscroll');
        }
        if (this.config.style.fade == true) {
            document.documentElement.classList.add('chefcookie--fade');
        }
        if (this.config.style.blur == true) {
            document.documentElement.classList.add('chefcookie--blur');
        }
    }

    buildDom() {
        document.body.insertAdjacentHTML(
            'afterbegin',
            `
            <div class="chefcookie chefcookie--${this.config.style.layout} chefcookie--columns-${
                'columns' in this.config.style ? this.config.style.columns : 'auto'
            }${
                'scripts_selection' in this.config && this.config.scripts_selection !== false
                    ? ` chefcookie--has-scripts`
                    : ``
            } chefcookie--hidden">
                <div class="chefcookie__inner">
                    <div class="chefcookie__box">
                        <div class="chefcookie__message">${this.translate(this.config.message)}</div>
                        <div class="chefcookie__settings-container">
                            <ul class="chefcookie__groups chefcookie__groups--count-${this.config.settings.length}">
                                ${this.config.settings
                                    .map(
                                        (group, i) => `
                                    <li class="chefcookie__group${
                                        group.cannot_be_modified ? ` chefcookie__group--disabled` : ``
                                    }">                                    
                                        <label class="chefcookie__group-label" for="chefcookie_group_${i}">
                                            <input${
                                                group.cannot_be_modified ? ` disabled="disabled"` : ``
                                            } class="chefcookie__group-checkbox" data-status="${this.isCheckboxActiveForGroup(
                                            i
                                        )}" id="chefcookie_group_${i}" type="checkbox" name="chefcookie_group[]" value="${i}"${
                                            this.isCheckboxActiveForGroup(i) === 2 ? ` checked="checked"` : ``
                                        } />
                                            <span class="chefcookie__group-title">${this.translate(group.title)}</span>
                                            <span class="chefcookie__group-checkbox-icon"></span>
                                            ${
                                                'description' in group && group.description != ''
                                                    ? `                                                                             
                                            <span class="chefcookie__group-description">${this.translate(
                                                group.description
                                            )}</span>
                                            `
                                                    : ``
                                            }
                                            ${
                                                'scripts_selection' in this.config &&
                                                this.config.scripts_selection === 'collapse' &&
                                                'scripts' in group &&
                                                Object.keys(group.scripts).length > 0 &&
                                                Object.keys(group.scripts)[0].indexOf('dummy_') === -1
                                                    ? `
                                                        <a href="#" class="chefcookie__group-collapse">${
                                                            this.getLabel('group_open') != ''
                                                                ? this.getLabel('group_open')
                                                                : this.getLabel('settings_open')
                                                        }</a>
                                                    `
                                                    : ``
                                            }
                                        </label>
                                        ${
                                            'scripts_selection' in this.config &&
                                            this.config.scripts_selection !== false &&
                                            'scripts' in group &&
                                            Object.keys(group.scripts).length > 0 &&
                                            Object.keys(group.scripts)[0].indexOf('dummy_') === -1
                                                ? `
                                                <ul class="chefcookie__scripts chefcookie__scripts--count-${
                                                    Object.keys(group.scripts).length
                                                }${
                                                      this.config.scripts_selection !== 'collapse'
                                                          ? ` chefcookie__scripts--visible`
                                                          : ``
                                                  }">
                                                    ${Object.keys(group.scripts)
                                                        .map(
                                                            j => `
                                                        <li class="chefcookie__script${
                                                            group.cannot_be_modified
                                                                ? ` chefcookie__script--disabled`
                                                                : ``
                                                        }">
                                                            <label class="chefcookie__script-label" for="chefcookie_script_${i}_${j}">
                                                                <input${
                                                                    group.cannot_be_modified
                                                                        ? ` disabled="disabled"`
                                                                        : ``
                                                                } class="chefcookie__script-checkbox" id="chefcookie_script_${i}_${j}" type="checkbox" name="chefcookie_script[]" value="${i}|${j}"${
                                                                this.isCheckboxActiveForProvider(i, j)
                                                                    ? ` checked="checked"`
                                                                    : ``
                                                            } />
                                                                <span class="chefcookie__script-title">${
                                                                    typeof group.scripts[j] === 'object' &&
                                                                    group.scripts[j] !== null &&
                                                                    'title' in group.scripts[j] &&
                                                                    group.scripts[j].title != ''
                                                                        ? this.translate(group.scripts[j].title)
                                                                        : j
                                                                }</span>
                                                                <span class="chefcookie__script-checkbox-icon"></span>
                                                            </label>
                                                            ${
                                                                typeof group.scripts[j] === 'object' &&
                                                                group.scripts[j] !== null &&
                                                                'description' in group.scripts[j] &&
                                                                group.scripts[j].description != ''
                                                                    ? '<div class="chefcookie__script-description">' +
                                                                      '<a href="#" class="chefcookie__script-description-collapse">' +
                                                                      this.getLabel('details_open') +
                                                                      '</a>' +
                                                                      '<div class="chefcookie__script-description-content">' +
                                                                      this.translate(group.scripts[j].description) +
                                                                      '</div>' +
                                                                      '</div>'
                                                                    : ''
                                                            }
                                                        </li>
                                                    `
                                                        )
                                                        .join('')}
                                                </ul>
                                            `
                                                : ``
                                        }
                                    </li>
                                `
                                    )
                                    .join('')}
                            </ul>
                        </div>
                        <div class="chefcookie__buttons chefcookie__buttons--count-${
                            'show_decline_button' in this.config && this.config.show_decline_button === true ? '3' : '2'
                        }">
                            <a href="#chefcookie__settings" class="chefcookie__button chefcookie__button--settings">${this.getLabel(
                                'settings_open'
                            )}</a>
                            <a href="#chefcookie__accept" class="chefcookie__button chefcookie__button--accept">${this.getLabel(
                                this.config.accept_all_if_settings_closed === undefined ||
                                    this.config.accept_all_if_settings_closed === false
                                    ? 'accept'
                                    : 'accept_all'
                            )}</a>
                            ${
                                'show_decline_button' in this.config && this.config.show_decline_button === true
                                    ? `
                                <a href="#chefcookie__decline" class="chefcookie__button chefcookie__button--decline">${this.getLabel(
                                    'decline'
                                )}</a>
                            `
                                    : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `
        );
    }

    getLabel(label) {
        if (this.config.labels[label] === undefined) {
            return '';
        }
        return this.translate(this.config.labels[label]);
    }

    bindButtons() {
        if (document.querySelector('a[href="#chefcookie__decline"]') !== null) {
            [].forEach.call(document.querySelectorAll('a[href="#chefcookie__decline"]'), el => {
                this.registerEventListener(el, 'click', e => {
                    this.logTracking('decline');
                    this.uncheckAllOptIns();
                    this.saveInCookie();
                    this.close();
                    this.setCookieToHideOverlay();
                    this.updateOptOutOptIn();
                    e.preventDefault();
                });
            });
        }
        if (document.querySelector('a[href="#chefcookie__accept"]') !== null) {
            [].forEach.call(document.querySelectorAll('a[href="#chefcookie__accept"]'), el => {
                this.registerEventListener(el, 'click', e => {
                    if (
                        !('accept_all_if_settings_closed' in this.config) ||
                        this.config.accept_all_if_settings_closed === true
                    ) {
                        if (!this.settingsVisible()) {
                            this.checkAllOptIns();
                        }
                    }
                    this.saveInCookie();
                    this.addEnabledScripts(true);
                    this.close();
                    this.setCookieToHideOverlay();
                    this.updateOptOutOptIn();
                    e.preventDefault();
                });
            });
        }
        if (document.querySelector('a[href="#chefcookie__settings"]') !== null) {
            [].forEach.call(document.querySelectorAll('a[href="#chefcookie__settings"]'), el => {
                this.registerEventListener(el, 'click', e => {
                    if (!this.settingsVisible()) {
                        this.showSettings();
                        this.switchSettingsLabelsOpen();
                    } else {
                        this.hideSettings();
                        this.switchSettingsLabelsClose();
                    }
                    e.preventDefault();
                });
            });
        }
        if (document.querySelector('.chefcookie__script-checkbox') !== null) {
            [].forEach.call(document.querySelectorAll('.chefcookie__script-checkbox'), el => {
                this.registerEventListener(el, 'change', e => {
                    let group_checkbox = el.closest('.chefcookie__group').querySelector('.chefcookie__group-checkbox'),
                        c1 = el
                            .closest('.chefcookie__group')
                            .querySelectorAll('.chefcookie__script-checkbox:checked').length,
                        c2 = el.closest('.chefcookie__group').querySelectorAll('.chefcookie__script-checkbox').length;
                    if (c1 === c2) {
                        group_checkbox.checked = true;
                        group_checkbox.setAttribute('data-status', 2);
                    } else {
                        group_checkbox.checked = false;
                        group_checkbox.setAttribute('data-status', c1 > 0 ? 1 : 0);
                    }
                    e.preventDefault();
                });
            });
        }
        if (document.querySelector('.chefcookie__group-checkbox') !== null) {
            [].forEach.call(document.querySelectorAll('.chefcookie__group-checkbox'), el => {
                this.registerEventListener(el, 'change', e => {
                    el.setAttribute('data-status', el.checked ? 2 : 0);
                    if (el.closest('.chefcookie__group').querySelector('.chefcookie__script-checkbox') !== null) {
                        [].forEach.call(
                            el.closest('.chefcookie__group').querySelectorAll('.chefcookie__script-checkbox'),
                            el2 => {
                                el2.checked = el.checked;
                            }
                        );
                    }
                    e.preventDefault();
                });
            });
        }
        if (document.querySelector('.chefcookie__group-collapse') !== null) {
            [].forEach.call(document.querySelectorAll('.chefcookie__group-collapse'), el => {
                this.registerEventListener(el, 'click', e => {
                    let group = el.closest('.chefcookie__group');
                    if (!this.scriptsVisible(group)) {
                        this.showScripts(group);
                        this.switchScriptsLabelsOpen(group);
                    } else {
                        this.hideScripts(group);
                        this.switchScriptsLabelsClose(group);
                    }
                    e.preventDefault();
                });
            });
        }
        if (document.querySelector('.chefcookie__script-description-collapse') !== null) {
            [].forEach.call(document.querySelectorAll('.chefcookie__script-description-collapse'), el => {
                this.registerEventListener(el, 'click', e => {
                    let desc = el.closest('.chefcookie__script-description');
                    if (!this.scriptDescriptionVisible(desc)) {
                        this.showScriptDescription(desc);
                        this.switchScriptDescriptionLabelsOpen(desc);
                    } else {
                        this.hideScriptDescription(desc);
                        this.switchScriptDescriptionLabelsClose(desc);
                    }
                    e.preventDefault();
                });
            });
        }
    }

    switchSettingsLabelsOpen() {
        document.querySelector('.chefcookie__button--settings').textContent = this.getLabel('settings_close');
        if (this.config.accept_all_if_settings_closed === true) {
            document.querySelector('.chefcookie__button--accept').textContent = this.getLabel('accept');
        }
    }

    switchSettingsLabelsClose() {
        document.querySelector('.chefcookie__button--settings').textContent = this.getLabel('settings_open');
        if (this.config.accept_all_if_settings_closed === true) {
            document.querySelector('.chefcookie__button--accept').textContent = this.getLabel('accept_all');
        }
    }

    switchScriptsLabelsOpen(group) {
        group.querySelector('.chefcookie__group-collapse').textContent =
            this.getLabel('group_close') != '' ? this.getLabel('group_close') : this.getLabel('settings_close');
    }

    switchScriptsLabelsClose(group) {
        group.querySelector('.chefcookie__group-collapse').textContent =
            this.getLabel('group_open') != '' ? this.getLabel('group_open') : this.getLabel('settings_open');
    }

    switchScriptDescriptionLabelsOpen(desc) {
        desc.querySelector('.chefcookie__script-description-collapse').textContent = this.getLabel('details_close');
    }

    switchScriptDescriptionLabelsClose(desc) {
        desc.querySelector('.chefcookie__script-description-collapse').textContent = this.getLabel('details_open');
    }

    checkAllOptIns() {
        [].forEach.call(document.querySelectorAll('.chefcookie__group-checkbox, .chefcookie__script-checkbox'), el => {
            el.checked = true;
        });
    }

    uncheckAllOptIns() {
        [].forEach.call(
            document.querySelectorAll(
                '.chefcookie__group-checkbox:not([disabled]), .chefcookie__script-checkbox:not([disabled])'
            ),
            el => {
                el.checked = false;
            }
        );
    }

    isCheckboxActiveForGroup(group_index) {
        let group;
        if (this.config.settings[group_index] !== undefined) {
            group = this.config.settings[group_index];
        } else {
            return 0;
        }
        if ('scripts' in this.config.settings[group_index]) {
            let group_accepted = true,
                group_partly_accepted = false;
            Object.keys(group.scripts).forEach(provider => {
                if (!this.isAccepted(provider)) {
                    group_accepted = false;
                }
                if (this.isAccepted(provider)) {
                    group_partly_accepted = true;
                }
            });
            if (group_accepted === true) {
                return 2;
            }
            // if this already was opened (and potentially declined)
            if (this.isCookieSetToHideOverlay()) {
                return group_partly_accepted === true ? 1 : 0;
            }
        }
        // otherwise use default
        return group.checked_by_default || group.active ? 2 : 0;
    }

    isCheckboxActiveForProvider(group_index, provider) {
        if (this.isAccepted(provider)) {
            return true;
        }
        // if this already was opened (and potentially declined)
        if (this.isCookieSetToHideOverlay()) {
            return false;
        }
        // otherwise use default
        if (this.config.settings[group_index] !== undefined) {
            let group = this.config.settings[group_index];
            return group.checked_by_default || group.active;
        }
        return false;
    }

    setCookieToHideOverlay() {
        helper.cookieSet('cc_hide_prompt', '1', this.getCookieExpiration());
    }

    isCookieSetToHideOverlay() {
        return helper.cookieExists('cc_hide_prompt');
    }

    saveInCookie() {
        let providers = [];
        [].forEach.call(document.querySelectorAll('.chefcookie__group-checkbox'), el => {
            if (el.closest('.chefcookie__group').querySelector('.chefcookie__script-checkbox') === null) {
                if (el.checked === true) {
                    if (this.config.settings[el.value].scripts !== undefined) {
                        Object.entries(this.config.settings[el.value].scripts).forEach(
                            ([scripts__key, scripts__value]) => {
                                providers.push(scripts__key);
                            }
                        );
                    }
                }
            } else {
                [].forEach.call(
                    el.closest('.chefcookie__group').querySelectorAll('.chefcookie__script-checkbox'),
                    el2 => {
                        if (el2.checked === true) {
                            if (
                                this.config.settings[el2.value.split('|')[0]].scripts[el2.value.split('|')[1]] !==
                                undefined
                            ) {
                                providers.push(el2.value.split('|')[1]);
                            }
                        }
                    }
                );
            }
        });

        if (providers.length === 0) {
            providers.push('null');
        }
        helper.cookieSet('cc_accepted_providers', providers.join(','), this.getCookieExpiration());
    }

    addToCookie(provider) {
        let providers;
        if (!helper.cookieExists('cc_accepted_providers') || helper.cookieGet('cc_accepted_providers') === 'null') {
            providers = [];
        } else {
            providers = helper.cookieGet('cc_accepted_providers').split(',');
        }
        if (providers.indexOf(provider) === -1) {
            providers.push(provider);
            helper.cookieSet('cc_accepted_providers', providers.join(','), this.getCookieExpiration());
        }
    }

    deleteFromCookie(provider) {
        if (!helper.cookieExists('cc_accepted_providers')) {
            return;
        }
        let providers = helper.cookieGet('cc_accepted_providers').split(',');
        let index = providers.indexOf(provider);
        if (index !== -1) {
            providers.splice(index, 1);
        }
        if (providers.length > 0) {
            helper.cookieSet('cc_accepted_providers', providers.join(','), this.getCookieExpiration());
        } else {
            helper.cookieSet('cc_accepted_providers', 'null', this.getCookieExpiration());
        }
    }

    getCookieExpiration() {
        let expiration = 30;
        if ('expiration' in this.config && Number.isInteger(this.config.expiration)) {
            expiration = this.config.expiration;
        }
        return expiration;
    }

    addEnabledScripts(isInit = false) {
        if (!helper.cookieExists('cc_accepted_providers')) {
            return;
        }
        let settings = helper.cookieGet('cc_accepted_providers');
        if (settings == 'null') {
            return;
        }
        let accept_all = true;
        this.config.settings.forEach(settings__value => {
            if (settings__value.scripts !== undefined) {
                Object.entries(settings__value.scripts).forEach(([scripts__key, scripts__value]) => {
                    if (settings.split(',').indexOf(scripts__key) === -1) {
                        accept_all = false;
                        return;
                    }
                    this.load(scripts__key, scripts__value, isInit);
                });
            }
        });
        if (isInit === true) {
            this.logTracking(accept_all ? 'accept_all' : 'accept_partially', settings);
        }
    }

    addScript(provider, isInit = false) {
        if (!helper.cookieExists('cc_accepted_providers')) {
            return;
        }
        let settings = helper.cookieGet('cc_accepted_providers');
        if (settings == 'null') {
            return;
        }
        settings = settings.split(',');
        this.config.settings.forEach(settings__value => {
            if (settings__value.scripts !== undefined) {
                Object.entries(settings__value.scripts).forEach(([scripts__key, scripts__value]) => {
                    if (scripts__key !== provider) {
                        return;
                    }
                    if (settings.indexOf(scripts__key) === -1) {
                        return;
                    }
                    this.load(scripts__key, scripts__value, isInit);
                });
            }
        });
    }

    autoAcceptBasicScripts() {
        this.config.settings.forEach(settings__value => {
            if (settings__value.scripts !== undefined && settings__value.initial_tracking === true) {
                Object.entries(settings__value.scripts).forEach(([scripts__key, scripts__value]) => {
                    this.accept(scripts__key, false);
                });
            }
        });
    }

    autoAcceptAllScripts() {
        let providers = [];
        this.config.settings.forEach(settings__value => {
            if (settings__value.scripts !== undefined) {
                Object.entries(settings__value.scripts).forEach(([scripts__key, scripts__value]) => {
                    this.accept(scripts__key, false);
                });
            }
        });
    }

    load(provider, id, isInit = false) {
        if (this.isLoaded(provider)) {
            return;
        }

        if (typeof id === 'object' && id !== null) {
            if ('exclude' in id && typeof id.exclude === 'function') {
                if (id.exclude() === true) {
                    return;
                }
            }
        }

        if (typeof id === 'string' || id instanceof String) {
            this.loadAuto(provider, id);
        } else if (typeof id === 'object' && id !== null && 'id' in id && !('accept' in id)) {
            this.loadAuto(provider, id.id);
        } else if (typeof id === 'object' && id !== null && 'accept' in id && typeof id.accept === 'function') {
            new Promise(resolve => {
                id.accept(this, resolve, isInit);
            }).then(() => {
                this.setLoaded(provider);
            });
        } else {
            this.setLoaded(provider);
        }

        this.logDebug('added script ' + provider);
    }

    loadAuto(provider, id) {
        if (provider === 'analytics' || provider === 'google') {
            let script = document.createElement('script');
            script.onload = () => {
                this.setLoaded(provider);
            };
            script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
            document.head.appendChild(script);
            script = document.createElement('script');
            script.innerHTML =
                "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '" +
                id +
                "', { 'anonymize_ip': true, cookie_flags: 'SameSite=None;Secure' });";
            document.head.appendChild(script);
        }

        if (provider === 'tagmanager') {
            let script = document.createElement('script');
            let html = '';
            html +=
                "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','" +
                id +
                "');";
            // this is not part of the default tagmanager code, because events are tracked via "dataLayer" or directly inside tag manager
            // we make this also available here
            html += 'function gtag(){dataLayer.push(arguments);}';
            script.innerHTML = html;
            document.head.appendChild(script);
            this.setLoaded(provider);
        }

        if (provider === 'facebook') {
            let script = document.createElement('script');
            script.innerHTML =
                "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '" +
                id +
                "');fbq('track', 'PageView');fbq('track', 'ViewContent');";
            document.head.appendChild(script);
            this.setLoaded(provider);
        }

        if (provider === 'twitter') {
            let script = document.createElement('script');
            script.onload = () => {
                this.setLoaded(provider);
            };
            script.src = '//platform.twitter.com/oct.js';
            document.head.appendChild(script);
        }

        if (provider === 'taboola') {
            let script = document.createElement('script');
            script.innerHTML =
                "window._tfa = window._tfa || [];window._tfa.push({notify: 'event', name: 'page_view'});!function (t, f, a, x) { if (!document.getElementById(x)) { t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f); } }(document.createElement('script'), document.getElementsByTagName('script')[0], '//cdn.taboola.com/libtrc/unip/" +
                id +
                "/tfa.js', 'tb_tfa_script');";
            document.head.appendChild(script);
            this.setLoaded(provider);
        }

        if (provider === 'match2one') {
            let script = document.createElement('script');
            script.onload = () => {
                this.setLoaded(provider);
            };
            script.src = 'https://secure.adnxs.com/seg?add=' + id + '&t=1';
            document.head.appendChild(script);
            script = document.createElement('script');
            script.innerHTML = 'window.m2o = true;';
            document.head.appendChild(script);
        }

        if (provider === 'linkedin') {
            let script = document.createElement('script');
            script.innerHTML = `
                _linkedin_partner_id = "${id}";
                window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
                window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            `;
            document.body.appendChild(script);
            script = document.createElement('script');
            script.innerHTML = `
                (function(){var s = document.getElementsByTagName("script")[0];
                var b = document.createElement("script");
                b.type = "text/javascript";b.async = true;
                b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
                s.parentNode.insertBefore(b, s);})();
            `;
            document.body.appendChild(script);
            script = document.createElement('noscript');
            script.innerHTML = `
                <img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${id}&fmt=gif" />
            `;
            document.body.appendChild(script);
            this.setLoaded(provider);
        }

        if (provider === 'smartlook') {
            let script = document.createElement('script');
            script.innerHTML =
                "window.smartlook||(function(d) {var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';c.charset='utf-8';c.src='https://rec.smartlook.com/recorder.js';h.appendChild(c);})(document);smartlook('init', '" +
                id +
                "');";
            document.head.appendChild(script);
            this.setLoaded(provider);
        }

        if (provider === 'crazyegg') {
            let script = document.createElement('script');
            script.onload = () => {
                this.setLoaded(provider);
            };
            script.src = '//script.crazyegg.com/pages/scripts/' + id + '.js';
            document.head.appendChild(script);
        }

        if (provider === 'google_maps') {
            let script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=' + id + '&callback=initMapCC';
            script.defer = true;
            script.async = true;
            window.initMapCC = () => {
                this.setLoaded(provider);
            };
            document.head.appendChild(script);
        }

        if (provider === 'etracker') {
            let script = document.createElement('script');
            script.onload = () => {
                this.setLoaded(provider);
            };
            script.id = '_etLoader';
            script.type = 'text/javascript';
            script.charset = 'UTF-8';
            script.setAttribute('data-block-cookies', 'true');
            script.setAttribute('data-respect-dnt', 'true');
            script.setAttribute('data-secure-code', id);
            script.src = '//static.etracker.com/code/e.js';
            document.head.appendChild(script);
        }

        if (provider === 'matomo') {
            let script = document.createElement('script');
            script.innerHTML = `
                var _paq = window._paq = window._paq || [];
                /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
                _paq.push(['trackPageView']);
                _paq.push(['enableLinkTracking']);
                (function() {
                    var u="//${id.split('#')[0]}/";
                    _paq.push(['setTrackerUrl', u+'matomo.php']);
                    _paq.push(['setSiteId', '${id.split('#')[1]}']);
                    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
                })();
            `;
            document.head.appendChild(script);
            this.setLoaded(provider);
        }
    }

    isAccepted(provider) {
        if (!helper.cookieExists('cc_accepted_providers')) {
            return false;
        }
        return helper.cookieGet('cc_accepted_providers').split(',').indexOf(provider) > -1;
    }

    isLoaded(provider) {
        return 'chefcookie_loaded' in window && window.chefcookie_loaded.indexOf(provider) > -1;
    }

    setLoaded(provider) {
        window.chefcookie_loaded.push(provider);
    }

    settingsVisible() {
        return document
            .querySelector('.chefcookie__settings-container')
            .classList.contains('chefcookie__settings-container--visible');
    }

    showSettings() {
        this.logTracking('settings_open');
        let el = document.querySelector('.chefcookie__settings-container');
        el.classList.add('chefcookie__settings-container--visible');
        el.style.height = el.scrollHeight + 'px';
        setTimeout(() => {
            if (el.classList.contains('chefcookie__settings-container--visible')) {
                el.style.height = 'auto';
            }
        }, this.animationSpeed);
        this.fixMaxHeight();
    }

    hideSettings() {
        this.logTracking('settings_close');
        let el = document.querySelector('.chefcookie__settings-container');
        el.classList.remove('chefcookie__settings-container--visible');
        el.style.height = el.scrollHeight + 'px';
        setTimeout(() => {
            el.style.height = 0;
        }, 30);
    }

    scriptsVisible(group) {
        return group.querySelector('.chefcookie__scripts').classList.contains('chefcookie__scripts--visible');
    }

    showScripts(group) {
        let el = group.querySelector('.chefcookie__scripts');
        el.style.height = el.scrollHeight + 'px';
        el.classList.add('chefcookie__scripts--visible');
        setTimeout(() => {
            if (el.classList.contains('chefcookie__scripts--visible')) {
                el.style.height = 'auto';
            }
        }, this.animationSpeed);
        this.fixMaxHeight();
    }

    hideScripts(group) {
        let el = group.querySelector('.chefcookie__scripts');
        el.style.height = el.scrollHeight + 'px';
        el.classList.remove('chefcookie__scripts--visible');
        setTimeout(() => {
            el.style.height = 0;
        }, 30);
    }

    scriptDescriptionVisible(desc) {
        return desc
            .querySelector('.chefcookie__script-description-content')
            .classList.contains('chefcookie__script-description-content--visible');
    }

    showScriptDescription(desc) {
        let el = desc.querySelector('.chefcookie__script-description-content');
        el.style.height = el.scrollHeight + 'px';
        el.classList.add('chefcookie__script-description-content--visible');
        setTimeout(() => {
            if (el.classList.contains('chefcookie__script-description-content--visible')) {
                el.style.height = 'auto';
            }
        }, this.animationSpeed);
        this.fixMaxHeight();
    }

    hideScriptDescription(desc) {
        let el = desc.querySelector('.chefcookie__script-description-content');
        el.style.height = el.scrollHeight + 'px';
        el.classList.remove('chefcookie__script-description-content--visible');
        setTimeout(() => {
            el.style.height = 0;
        }, 30);
    }

    fixMaxHeight() {
        document.querySelector('.chefcookie__inner').style.maxHeight = window.innerHeight + 'px';
    }

    eventAnalytics(category, action) {
        if (typeof gtag != 'function') {
            return;
        }
        if (action === undefined) {
            gtag('event', category);
            this.logDebug('analytics ' + category);
        } else {
            gtag('event', action, { event_category: category });
            this.logDebug('analytics ' + category + ' ' + action);
        }
    }

    eventGoogle(category, action) {
        this.eventAnalytics(category, action);
    }

    eventFacebook(action) {
        if (typeof fbq != 'function') {
            return;
        }
        fbq('trackCustom', action);
        this.logDebug('facebook ' + action);
    }

    eventTwitter(action) {
        if (
            typeof twttr == 'undefined' ||
            typeof twttr.conversion == 'undefined' ||
            typeof twttr.conversion.trackPid != 'function'
        ) {
            return;
        }
        twttr.conversion.trackPid(action);
        this.logDebug('twitter ' + action);
    }

    eventTaboola(event) {
        if (typeof _tfa != 'object') {
            return;
        }
        _tfa.push({ notify: 'event', name: event });
        this.logDebug('taboola ' + event);
    }

    eventMatch2one(id) {
        if (typeof m2o == 'undefined') {
            return;
        }
        let script = document.createElement('script');
        script.src = 'https://secure.adnxs.com/px?' + id + '&t=1';
        document.head.appendChild(script);
        this.logDebug('match2one ' + id);
    }

    eventLinkedin(id, conversion_id) {
        document.body.insertAdjacentHTML(
            'beforeend',
            '<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=' +
                id +
                '&conversionId=' +
                conversion_id +
                '&fmt=gif" />'
        );
        this.logDebug('linkedin ' + id + ' ' + conversion_id);
    }

    eventEtracker(category, action) {
        if (typeof _etracker == 'undefined') {
            return;
        }
        if (action === undefined) {
            _etracker.sendEvent(new et_UserDefinedEvent(null, null, category, null));
            this.logDebug('etracker ' + category);
        } else {
            _etracker.sendEvent(new et_UserDefinedEvent(null, category, action, null));
            this.logDebug('etracker ' + category + ' ' + action);
        }
    }

    trackDuration() {
        var _this = this,
            timer = 30;
        while (timer / 60 <= 8) {
            (function (timer) {
                window.setTimeout(function () {
                    if (this.isDestroyed === true) {
                        return;
                    }
                    _this.eventAnalytics('duration_time', timer + 's');
                    _this.eventEtracker('duration_time', timer + 's');
                }, timer * 1000);
            })(timer);
            timer += 30;
        }
    }

    trackDurationCustom(timer, callback) {
        setTimeout(callback, timer * 1000);
    }

    trackScrollDepth() {
        this.eventAnalytics('scroll_depth', '0%');
        this.eventEtracker('scroll_depth', '0%');
        this.registerEventListener(window, 'scroll', () => {
            let scroll = this.scrollPos();
            for (var scrollDepthTriggered__key in this.scrollDepthTriggered) {
                if (
                    this.scrollDepthTriggered[scrollDepthTriggered__key] === false &&
                    scroll >= scrollDepthTriggered__key
                ) {
                    this.scrollDepthTriggered[scrollDepthTriggered__key] = true;
                    this.eventAnalytics('scroll_depth', scrollDepthTriggered__key + '%');
                    this.eventEtracker('scroll_depth', scrollDepthTriggered__key + '%');
                }
            }
        });
    }

    registerEventListener(obj, type, fn) {
        obj.addEventListener(type, fn);
        this.eventListeners.push({ obj: obj, type: type, fn: fn });
    }

    unregisterAllEventListeners() {
        this.eventListeners.forEach(eventListeners__value => {
            eventListeners__value.obj.removeEventListener(eventListeners__value.type, eventListeners__value.fn);
        });
    }

    trackScrollDepthCustom(percent, callback) {
        this.registerEventListener(window, 'scroll', () => {
            let scroll = this.scrollPos();
            if (this.scrollDepthTriggeredOnce === false && scroll >= percent) {
                this.scrollDepthTriggeredOnce = true;
                callback();
            }
        });
    }

    scrollPos() {
        let scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
            documentHeight = Math.max(
                document.body.offsetHeight,
                document.body.scrollHeight,
                document.documentElement.clientHeight,
                document.documentElement.offsetHeight,
                document.documentElement.scrollHeight
            ),
            windowHeight = window.innerHeight,
            scroll = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
        return scroll;
    }

    waitFor(provider, callback = null) {
        return new Promise((resolve, reject) => {
            let timeout = setInterval(() => {
                if (this.isLoaded(provider)) {
                    window.clearInterval(timeout);
                    if (callback !== null && typeof callback === 'function') {
                        callback();
                    }
                    resolve();
                }
            }, 1000);
        });
    }

    loadJs(urls, callback = null) {
        if (typeof urls === 'string' || urls instanceof String) {
            urls = [urls];
        }
        let promises = [];
        urls.forEach(urls__value => {
            promises.push(
                new Promise((resolve, reject) => {
                    let script = document.createElement('script');
                    script.src = urls__value;
                    script.onload = () => {
                        resolve();
                    };
                    document.head.appendChild(script);
                })
            );
        });
        if (callback !== null && typeof callback === 'function') {
            Promise.all(promises).then(() => {
                callback();
            });
        } else {
            return Promise.all(promises);
        }
    }

    translate(obj) {
        if (typeof obj === 'string' || obj instanceof String) {
            return obj;
        }
        let lng = this.lng();
        if (!(lng in obj)) {
            return Object.values(obj)[0];
        }
        return obj[lng];
    }

    lng() {
        let lng = 'en';
        if (document.documentElement.hasAttribute('lang')) {
            lng = document.documentElement.getAttribute('lang').substring(0, 2).toLowerCase();
        }
        return lng;
    }

    url() {
        return window.location.protocol + '//' + window.location.host + window.location.pathname;
    }

    urlFull() {
        return window.location.href;
    }

    urlBase() {
        return window.location.protocol + '//' + window.location.host;
    }

    trim(str, charlist) {
        let whitespace = [
            ' ',
            '\n',
            '\r',
            '\t',
            '\f',
            '\x0b',
            '\xa0',
            '\u2000',
            '\u2001',
            '\u2002',
            '\u2003',
            '\u2004',
            '\u2005',
            '\u2006',
            '\u2007',
            '\u2008',
            '\u2009',
            '\u200a',
            '\u200b',
            '\u2028',
            '\u2029',
            '\u3000'
        ].join('');
        let l = 0;
        let i = 0;
        str += '';
        if (charlist) {
            whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1');
        }
        l = str.length;
        for (i = 0; i < l; i++) {
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(i);
                break;
            }
        }
        l = str.length;
        for (i = l - 1; i >= 0; i--) {
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(0, i + 1);
                break;
            }
        }
        return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
    }

    accept(provider, isInit = false) {
        this.addToCookie(provider);
        if (!this.isExcluded()) {
            this.addScript(provider, isInit);
        }
    }

    decline(provider) {
        this.deleteFromCookie(provider);
    }

    logDebug(msg) {
        if (!('debug_log' in this.config) || this.config.debug_log !== true) {
            return;
        }
        console.log(msg);
    }

    logTrackingActive() {
        return !(
            !('consent_tracking' in this.config) ||
            this.config.consent_tracking === false ||
            this.config.consent_tracking === undefined ||
            this.config.consent_tracking === null ||
            this.config.consent_tracking == ''
        );
    }

    logTracking(action, providers = null) {
        if (!this.logTrackingActive()) {
            return;
        }
        let xhr = new XMLHttpRequest(),
            data = null,
            url =
                (this.config.consent_tracking.indexOf('//') === -1 ? this.trim(this.urlBase(), '/') : '') +
                '/' +
                this.trim(this.config.consent_tracking, '/');
        data = {
            action: action,
            date:
                new Date().getFullYear() +
                '-' +
                ('0' + (new Date().getMonth() + 1)).slice(-2) +
                '-' +
                ('0' + new Date().getDate()).slice(-2) +
                ' ' +
                ('0' + new Date().getHours()).slice(-2) +
                ':' +
                ('0' + new Date().getMinutes()).slice(-2) +
                ':' +
                ('0' + new Date().getSeconds()).slice(-2),
            url: this.urlFull(),
            providers: providers,
            viewport: window.innerWidth + 'x' + window.innerHeight
        };
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify(data));
    }

    trackFirstUserInteraction() {
        if (!this.logTrackingActive()) {
            return;
        }
        ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(eventName => {
            document.addEventListener(
                eventName,
                () => {
                    if (this.first_user_interaction === true) {
                        return;
                    }
                    this.first_user_interaction = true;
                    this.logTracking('first_user_interaction');
                },
                true
            );
        });
    }

    hexToRgb(hex) {
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null;
    }

    hexToRgbaStr(hex, opacity) {
        let rgb = this.hexToRgb(hex);
        if (rgb === null) {
            return '';
        }
        return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';
    }
}

window.chefcookie = chefcookie;
