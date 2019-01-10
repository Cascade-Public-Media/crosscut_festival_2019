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
                $('.hero-overlay').addClass('active');
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
/**
 * @file
 * Owl Carousel Setup.
 *
 */
(function($, Drupal) {

  'use strict';

  Drupal.behaviors.sessionsCarousel = {
    attach: function(context, settings) {

      $('.view-name-sessions').once('sessionsCarousel').each(function() {

        $(document).ready(function() {

          $('#session-carousel').owlCarousel({
            stagePadding:500,
            loop: true,
            center: true,
            items: 1,
            nav:true,
            margin: 10,
            responsiveClass: true,
            responsive: {
              0: {
                stagePadding: 70
              },
              450: {
                stagePadding: 110
              },
              576: {
                stagePadding: 100
              },
              768: {
                stagePadding: 110
              },
              900: {
                stagePadding: 170
              },
              1024: {
                stagePadding: 280,
                margin: 40
              },
              1250: {
                items: 2,
                stagePadding: 50,
                margin: 40
              },
              1500: {
                items: 2,
                stagePadding: 100,
                margin: 40
              },
              1700: {
                items:3,
                stagePadding: 20,
                margin:40
              }
            }
          });

        });

        // $('#panelists-carousel').owlCarousel({
        //   loop: true,
        //   dots: true,
        //   margin: 5,
        //   responsive: {
        //     0: {
        //       items: 2
        //     },
        //     576: {
        //       items: 3
        //     },
        //     768: {
        //       items: 4
        //     }
        //   }
        // });



      });

    },

    detach: function (context, settings) {}
  };

})(jQuery, Drupal);