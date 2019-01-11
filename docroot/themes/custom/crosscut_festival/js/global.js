/**
 * @file
 * Global utilities.
 *
 */
(function($, Drupal) {

    'use strict';

    Drupal.behaviors.bootstrap_barrio_subtheme = {
        attach: function(context, settings) {

            var video = $('#heroVideo');
            $(video).on('ended', function() {
                console.log('ended');
                $('.hero-overlay.video').removeClass('active');
                $('.hero-overlay-image').animate({
                  opacity: 1
                }, 600);
            });

            $(window).scroll(function() {
                if ($(this).scrollTop() > 50) {
                    $('body').addClass("scrolled");
                } else {
                    $('body').removeClass("scrolled");
                }
            });

        }
    };

})(jQuery, Drupal);