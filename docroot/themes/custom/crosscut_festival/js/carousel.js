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

        owl.owlCarousel({
          loop: true,
          autoplay: true,
          autoplayHoverPause: true,
          autoplayTimeout:3000,
          dots: true,
          nav: true,
          center: true,
          navText: ['<span class="nav-arrow" aria-label="Previous"></span>','<span class="nav-arrow" aria-label="Next"></span>'],
          items: 1
        });

        $('.carousel-control--button').on('click', function() {
          if ($(this).hasClass('playing') ) {
            owl.trigger('stop.owl.autoplay');
            $(this).removeClass('playing').addClass('paused');
            $(this).attr('title', 'Play slideshow').find('span.visually-hidden').text('Play slideshow');
          } else {
            owl.trigger('play.owl.autoplay',[3000]);
            $(this).removeClass('paused').addClass('playing');
            $(this).attr('title', 'Pause slideshow').find('span.visually-hidden').text('Pause slideshow');
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
            stagePadding:500,
            loop: true,
            center: true,
            items: 1,
            nav:true,
            navText: ['<span class="nav-arrow" aria-label="Previous"></span>','<span class="nav-arrow" aria-label="Next"></span>'],
            margin: 10,
            responsiveClass: true,
            responsive: {
              0: {
                stagePadding: 60
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
              // 1700: {
              //   items:3,
              //   stagePadding: 20,
              //   margin:40
              // }
            }
          });
      });
    },

    detach: function (context, settings) {}
  };

})(jQuery, Drupal);