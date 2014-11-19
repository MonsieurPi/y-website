/* global Headroom */
/* global Drop */
/* global smoothScroll */

// namespace
var mouvy = mouvy || {};


document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // smooth scrolling for anchors
    smoothScroll.init({
        speed: 500,
        easing: 'easeOutQuint',
        updateURL: true,
        offset: 40
    });

    // box each titles
    var titleElements = document.querySelectorAll('.title--boxed');
    Array.prototype.forEach.call(titleElements, function(el) {
        mouvy.Boxme.draw(el);
    });

    // make some room by hidding the header
    var mainHead = document.querySelector('.main-head'),
        headroom = new Headroom(mainHead, {
            // vertical offset in px before element is first unpinned
            offset : 60,
            // scroll tolerance in px before state changes
            tolerance : {
                up : 10,
                down : 5
            },
            onUnpin: function() {
                nextEventDrop.close();
            }
        });
    headroom.init();

    // learn more
    // NB: hide the blocks with javascript so that robots index the content
    var learnMoreElements = document.querySelectorAll('.learn-more');
    Array.prototype.forEach.call(learnMoreElements, function(el) {
        el.style.display = 'none';
    });

    var learnMoreTriggers = document.querySelectorAll('.learn-more-trigger'),
        _showModal = function(trigger, afterShowCallback) {
            var targetSelector = trigger.dataset.target,
                targetElement = document.querySelector(targetSelector),
                wrapper = document.createElement('div');

            mouvy.addClassName(wrapper, 'modal-scroll');
            mouvy.addClassName(wrapper, 'container');
            wrapper.innerHTML = targetElement.innerHTML;

            window.picoModal({
                content: wrapper.outerHTML,
                overlayStyles: {}, modalStyles: {}, closeStyles: {},
                overlayClass: 'modal-overlay',
                modalClass: 'modal-content',
                closeClass: 'modal-close'
            })
            .afterShow(function(modal){
                mouvy.addClassName(document.body, 'modal-open');
                setTimeout(function(){
                    mouvy.addClassName(modal.overlayElem(), 'modal-overlay--in');
                    mouvy.addClassName(modal.modalElem(), 'modal-content--in');

                    afterShowCallback && afterShowCallback(modal);
                }, 10);
            })
            .beforeClose(function(modal, e) {
                e.preventDefault();

                mouvy.removeClassName(modal.overlayElem(), 'modal-overlay--in');
                mouvy.removeClassName(modal.modalElem(), 'modal-content--in');

                setTimeout(function() {
                    modal.overlayElem().remove();
                    modal.modalElem().remove();
                }, 1000);

                mouvy.removeClassName(document.body, 'modal-open');
            })
            .afterClose(function() {
                mouvy.removeClassName(document.body, 'modal-open');
            })
            .show();
        };
    mouvy.showModal = _showModal;
    Array.prototype.forEach.call(learnMoreTriggers, function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            _showModal(e.target);
        });
    });

    // next event popover
    var nextEventDrop = new Drop({
            target: document.querySelector('.next-event'),
            content: document.querySelector('.events'),
            position: 'bottom center',
            classes: 'drop-theme-blue',
            openOn: 'click',
            constrainToWindow: true,
            tetherOptions: {
                offset: '-5px 0'
            }
        }),
        nextEventFormBinding = function() {
            var nextEventDropContent = document.querySelector('.events'),
                eventsNotificationForm = document.querySelector('.events .form'),
                eventsNotificationEmailField = eventsNotificationForm.querySelector('input'),
                eventsNotificationFormErrors = eventsNotificationForm.querySelector('.errors-wrapper'),
                nextEventSubmit = eventsNotificationForm.querySelector('[type=submit]'),
                nextEventSubmitInner = nextEventSubmit.querySelector('.progress-inner'),
                resetNextEventFormSubmit = function() {
                    // reset the submit animation
                    mouvy.addClassName(nextEventSubmitInner, 'notransition');
                    mouvy.removeClassName(nextEventSubmitInner, 'state-loading');
                    nextEventSubmitInner.style.width = '0%';
                },
                resetNextEventFormErrors = function() {
                    eventsNotificationFormErrors.innerText = '';
                    mouvy.addClassName(eventsNotificationFormErrors, 'errors-wrapper--empty');
                    // preapre the popover to receive a shaking move in case of an error
                    mouvy.removeClassName(nextEventDropContent, 'shaking');

                    resetNextEventFormSubmit();
                };

            eventsNotificationEmailField.addEventListener('keyup', function() {
                var insertedEmail = eventsNotificationEmailField.value,
                    atPosition = insertedEmail.indexOf('@'),
                    dotPosition = insertedEmail.lastIndexOf('.');

                // check if user has inserted a "@" and a dot
                if (atPosition < 1 || dotPosition < (atPosition+2) ) {
                    // if he hasn't, hide the submit button
                    mouvy.removeClassName(eventsNotificationForm, 'form--active');
                } else {
                    //if he has..
                    //show the submit button
                    mouvy.addClassName(eventsNotificationForm, 'form--active');
                }
            });

            eventsNotificationForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // disable the submit button
                eventsNotificationForm.querySelector('[type=submit]').disabled = true;

                var data = {
                        'email': eventsNotificationForm.querySelector('[name=email]').value
                    },
                    urlEncodedData = mouvy.urlEncodeParams(data);

                // prepare and send the request
                var request = mouvy.prepareRequest(eventsNotificationForm.action, 'post');
                request.onload = function() {
                    var resp = null;
                    if (this.status >= 200 && this.status < 400){
                        // Success!
                        resp = JSON.parse(this.responseText);
                        nextEventDropContent.innerText = resp.detail;
                    } else {
                        // We reached our target server, but it returned an error
                        resp = JSON.parse(this.responseText);

                        eventsNotificationFormErrors.innerText = resp.detail;
                        mouvy.removeClassName(eventsNotificationFormErrors, 'errors-wrapper--empty');

                        mouvy.addClassName(nextEventDropContent, 'shaking');
                    }

                    // re-enable the submit button
                    eventsNotificationForm.querySelector('[type=submit]').disabled = false;

                    // reset the submit animtion
                    resetNextEventFormSubmit();
                };

                // reset error state
                resetNextEventFormErrors();

                // fake loader for the user
                mouvy.removeClassName(nextEventSubmitInner, 'notransition');
                mouvy.addClassName(nextEventSubmitInner, 'state-loading');
                nextEventSubmitInner.style.width = '100%';

                mouvy.sendRequest(request, urlEncodedData);
            });
        };

    // bind the event form once
    nextEventDrop.once('open', function() {
        nextEventFormBinding();
    });
    nextEventDrop.on('open', function() {
        // focus on the email field
        var eventsNotificationEmailField = document.querySelector('.newsletter-email');
        eventsNotificationEmailField.focus();
    });

});
