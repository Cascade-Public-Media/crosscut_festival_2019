/**
 * @file
 * Quantcast tag.
 */
(function($, Drupal) {

  'use strict';

  Drupal.behaviors.crosscutFestivalQuantcastTag = {
    attach: function(context, settings) {

      $('html').once('crosscutFestivalQuantcastTag').each(function() {
        var _qevents = _qevents || [];

        (function() {
          var elem = document.createElement('script');
          elem.src = (document.location.protocol === "https:" ? "https://secure" : "http://edge") + ".quantserve.com/quant.js";
          elem.async = true;
          elem.type = "text/javascript";
          var scpt = document.getElementsByTagName('script')[0];
          scpt.parentNode.insertBefore(elem, scpt);
        })();
        _qevents.push({qacct:"p-a2EEpzn47yTDS"});
      });
    },
  };

})(jQuery, Drupal);
