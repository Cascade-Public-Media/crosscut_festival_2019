/**
 * @file
 * Global utilities.
 *
 */
(function($, Drupal) {

    'use strict';

    Drupal.behaviors.bootstrap_barrio_subtheme = {
        attach: function(context, settings) {

          // Navigation
          // Determine if event is enter or tab keypress
          function a11yClick(e) {
            if (e.type === 'click') {
              return true;
            } else if (e.type === 'keypress') {
              var code = e.charCode || e.keyCode;
              if ( code === 32 || code === 13 ) {
                return true;
              }
            }
          }

          var $dropdownMenu = $('.nav-dropdown');
          var $toggleButton = $('#toggle');
          $toggleButton.on('click keypress', function(e) {
            if (a11yClick(e)) {
              if ($dropdownMenu.hasClass('active')) {
                $dropdownMenu.removeClass('active');
                $(this).attr('aria-expanded', 'false').removeClass('active');
              }
              else {
                $dropdownMenu.addClass('active');
                $(this).attr('aria-expanded', 'true').addClass('active');
              }
            }
          });


          // Close menu if anywhere else in document is clicked
          $(document).on('click', function(e) {
            e.stopPropagation();
            if (e.target.id !== 'toggle') {
              if ($dropdownMenu.hasClass('active')) {
                $dropdownMenu.removeClass('active');
                $toggleButton.attr('aria-expanded', 'false').removeClass('active');
              }
            }
          });


          // Smooth Scroll
          $('a[href^="#"]').on('click', function(e) {
            e.preventDefault();

            var hash = this.hash;

            $('html, body').animate({
              scrollTop: $(hash).offset().top
            }, 1000, function() {
              // add hash to URL
              window.location.hash = hash;
            });

            $('a.cf-nav-link[href^="#"]').removeClass('active');
            $(this).addClass('active');
          });

          // Video
          var video = $('#heroVideo');
          $(video).on('ended', function() {
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