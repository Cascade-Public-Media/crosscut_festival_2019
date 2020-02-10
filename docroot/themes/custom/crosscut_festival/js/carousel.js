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
              items: 1,
              margin: 20,
            },
            400: {
              items: 2,
              margin: 20,
            },
            576: {
              items: 3,
              margin: 40,
            },
            768: {
              items: 4,
              margin: 50,
            },
            1200: {
              items: 5,
              margin: 50,
            },

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
          autoplay: false,
          autoplayHoverPause: true,
          autoplayTimeout: transitionSpeed,
          dots: false,
          nav: true,
          center: true,
          items: 1,
          navText: ['<span class="nav-arrow" aria-label="Previous"></span>','<span class="nav-arrow" aria-label="Next"></span>'],
          responsive: {
            0: {
              margin: 30,
              stagePadding: 30,
            },
            576: {
              margin: 50,
              stagePadding: 150,
            },
            992: {
              margin: 64,
              stagePadding: 250,
            },
            1385: {
              margin: 64,
              stagePadding: 350,
              autoWidth: true,
            },
          }
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
                items: 1,
                stagePadding: 250,
                margin: 50,
                center: true,
              },
              1200: {
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