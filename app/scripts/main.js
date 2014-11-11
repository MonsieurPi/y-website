document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // box each titles
    var titleElements = document.querySelectorAll('.title--boxed');
    Array.prototype.forEach.call(titleElements, function(el) {
        Boxme.draw(el);
    });

    // make the logo full screen on page loading
    // and scale it to fit the page height (needed for mobiles)
    setTimeout(function() {
        var logoWrapper = document.getElementById('logo-full-screen'),
            logo = logoWrapper.querySelector('img'),
            header = document.querySelector('.main-head');

        var wrapperHeight = window.innerHeight - header.offsetHeight;
        logoWrapper.style.height = (wrapperHeight + header.offsetHeight) + "px";
        logoWrapper.style.paddingTop = (wrapperHeight/2 - logo.height/2 + header.offsetHeight) + "px";

        // reveal the logo
        logoWrapper.style.opacity = 1;
    }, 500);

    // shrink the header on scroll
    window.onscroll = function() {
        var nav = document.querySelector('.nav-table'),
            thinClassName = 'nav-table--thin';

        // when the user has scrolled 60% of the window height
        var s = scrollTop(window, document);
        if (s > window.innerHeight*0.6) {
            if (!hasClassName(nav, thinClassName)) {
                addClassName(nav, thinClassName);
            }
        } else {
            if (hasClassName(nav, thinClassName)) {
                removeClassName(nav, thinClassName);
            }
        }
    };

    // scale the clock
    (function() {
        var clock = document.querySelector('.clock'),
            frame = clock.querySelector('.clock__frame'),
            frameOriginalWidth = frame.dataset.initialWidth,
            frameOriginalHeight = frame.dataset.initialHeight,
            frameOriginalRatio = frameOriginalHeight / frameOriginalWidth;

        clock.style.height = frameOriginalRatio * clock.offsetWidth + "px";
    })();

    // animate the clock
    var clock = document.querySelector('.clock__second-hand'),
        numberOfStepPerSecond = 5.0,
        angleIntervalPerStep = 360.0 / (60 * numberOfStepPerSecond),
        seconds = 0;
    setInterval(function() {
        clock.style.transform = "rotate(" + (seconds++)*angleIntervalPerStep + "deg)";
    }, 1000.0 / numberOfStepPerSecond);

    // learn more
    // NB: hide the blocks with javascript so that robots index the content
    var learnMoreElements = document.querySelectorAll('.learn-more');
    Array.prototype.forEach.call(learnMoreElements, function(el) {
        el.style.display = 'none';
    });

    var learnMoreTriggers = document.querySelectorAll('.learn-more-trigger'),
        learnMoreAction = function(trigger) {
            var targetSelector = trigger.dataset.target,
                targetElement = document.querySelector(targetSelector),
                wrapper = document.createElement("div");

            addClassName(wrapper, 'modal-scroll');
            wrapper.innerHTML = targetElement.innerHTML;
            console.log(wrapper);

            picoModal({
                content: wrapper.outerHTML,
                overlayStyles: {}, modalStyles: {}, closeStyles: {},
                overlayClass: "modal-overlay",
                modalClass: "modal-content",
                closeClass: "modal-close"
            })
            .afterShow(function(modal){
                addClassName(document.body, 'modal-open');
                setTimeout(function(){
                    addClassName(modal.overlayElem(), 'modal-overlay--in');
                    addClassName(modal.modalElem(), 'modal-content--in');
                }, 10);
            })
            .beforeClose(function(modal, e) {
                // e.preventDefault();
                modal.overlayElem().appendChild(modal.modalElem());

                removeClassName(modal.overlayElem(), 'modal-overlay--in');
                addClassName(modal.modalElem(), 'modal-content--in');
            })
            .afterClose(function(modal, e) {
                removeClassName(document.body, 'modal-open');
                modal.overlayElem().style.display = 'none';
            })
            .show();
        };
    Array.prototype.forEach.call(learnMoreTriggers, function(el) {
        el.addEventListener('click', function(e) {
            learnMoreAction(e.target);
        });
    });
});
