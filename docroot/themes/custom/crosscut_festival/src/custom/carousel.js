/**
 * @file
 * Owl Carousel Setup.
 *
 */
(function($, Drupal) {

  'use strict';

  Drupal.behaviors.panelistsCarousel = {
    attach: function(context, settings) {

      $('.view-id-featured_panelist_organizations').once('panelistsCarousel').each(function() {
        $('#panelists-carousel').owlCarousel({
          loop: true,
          autoplay: true,
          dots: false,
          nav: true,
          navText: ['<span class="nav-arrow" aria-label="Previous"></span>','<span class="nav-arrow" aria-label="Next"></span>'],
          responsive: {
            0: {
              items: 2
            },
            576: {
              items: 3
            },
            768: {
              items: 4
            }
          }
        });
      });
    },

    detach: function (context, settings) {}
  };

  Drupal.behaviors.imageCarousel = {
    attach: function(context, settings) {

      $('.view-id-image_carousel').once('imageCarousel').each(function() {
        var owl = $('#carousel-image-carousel');
        var transitionSpeed = 6000;

        owl.owlCarousel({
          loop: true,
          autoplay: true,
          autoplayHoverPause: true,
          autoplayTimeout: transitionSpeed,
          dots: false,
          nav: true,
          center: true,
          navText: ['<span class="nav-arrow" aria-label="Previous"></span>','<span class="nav-arrow" aria-label="Next"></span>'],
          items: 1
        });

        function a11yClick(e) {
          if (e.type === 'click') {
            return true;
          } else if (e.type === 'keypress') {
            var code = e.charCode || e.keyCode;
            if ( code === 13 ) {
              return true;
            }
          }
        }

        $('.carousel-control--button').on('click keypress', function(e) {
          if (a11yClick(e)) {
            if ($(this).hasClass('playing')) {
              owl.trigger('stop.owl.autoplay');
              $(this).removeClass('playing').addClass('paused');
              $(this).attr('title', 'Play slideshow').find('span.visually-hidden').text('Play slideshow');
            } else {
              owl.trigger('play.owl.autoplay', [transitionSpeed]);
              $(this).removeClass('paused').addClass('playing');
              $(this).attr('title', 'Pause slideshow').find('span.visually-hidden').text('Pause slideshow');
            }
          }
        });
      });

    },

    detach: function (context, settings) {}
  };

  Drupal.behaviors.sessionsCarousel = {
    attach: function(context, settings) {

      $('.view-id-sessions').once('sessionsCarousel').each(function() {

          $('#session-carousel').owlCarousel({
            loop: true,
            nav: true,
            dots: false,
            navText: ['<span class="nav-arrow" aria-label="Previous"></span>','<span class="nav-arrow" aria-label="Next"></span>'],
            responsiveClass: true,
            responsive: {
              0: {
                items: 1,
                stagePadding: 30,
                margin: 30,
                center: true,
              },
              576: {
                items: 1,
                stagePadding: 150,
                margin: 50,
                center: true,
              },
              992: {
                items: 2,
                stagePadding: 100,
                margin: 50,
                center: false,
              },
              1250: {
                items: 3,
                stagePadding: 100,
                margin: 50,
                center: true,
              },
            }
          });
      });
    },

    detach: function (context, settings) {}
  };

})(jQuery, Drupal);