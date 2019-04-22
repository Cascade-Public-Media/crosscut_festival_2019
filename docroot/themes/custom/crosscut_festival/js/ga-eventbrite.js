/**
 * @file
 * Quantcast tag.
 */
(function($, Drupal) {

    'use strict';

    Drupal.behaviors.crosscutFestivalGAEBTag = {
        attach: function(context, settings) {

            $('html').once('crosscutFestivalGAEBTag').each(function() {
                // Allows Google Analytics integration with Eventbrite

                //Uses the first GA tracker registered, which is fine for 99.9% of users.
                //won't work for browsers older than IE8
                if (!document.querySelector) return;
                var gaName = window.GoogleAnalyticsObject || "ga" ;

                // Safely instantiate our GA queue.
                window[gaName]=window[gaName]||function(){(window[gaName].q=window[gaName].q||[]).push(arguments)};window[gaName].l=+new Date;

                window[gaName](function() {
                    // Defer to the back of the queue if no tracker is ready
                    if (!ga.getAll().length) {
                        window[gaName](bindUrls);
                    } else {
                        bindUrls();
                    }
                });

                function bindUrls() {
                    var urls = document.querySelectorAll("a");
                    var eventbrite = /eventbrite\./;
                    var url, i;

                    for (i = 0; i < urls.length; i++) {
                        url = urls[i];
                        if (eventbrite.test(url.hostname) === true) {
                            //only fetches clientID if this page has Eventbrite links
                            var clientId = getClientId();
                            var parameter = "_eboga=" + clientId;

                            url.search = url.search ? url.search + "&" + parameter : "?" + parameter;
                        }
                    }
                }

                function getClientId() {
                    var trackers = window[gaName].getAll();
                    return trackers[0].get("clientId");
                }
            });
        },
    };

})(jQuery, Drupal);
