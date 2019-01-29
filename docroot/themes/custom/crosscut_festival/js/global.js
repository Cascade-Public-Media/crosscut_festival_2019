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


      if (settings.path.isFront) {

        /**
         * Adjust the window position _after_ the Sched iframe loads if a hash
         * is present. The Sched JS sets its iframe height using the style
         * attribute so that is all the observer pays attention to.
         *
         * @type {MutationObserver}
         */
        var $schedIframe = $("#sched-iframe iframe");
        if ($schedIframe.length > 0) {
          var observer = new MutationObserver(function(mutations, observer) {
            if (window.location.hash) {
              var $hashTop = $(window.location.hash).offset().top;
              var $headerHeight = $('#header').outerHeight();
              $('html, body').scrollTop($hashTop - $headerHeight);
            }
            observer.disconnect();
          });
          observer.observe($schedIframe[0], {
            attributes: true,
            attributeFilter: ['style'],
          });
        }

        // Add active class to menu link for current hash on page load.
        if (window.location.hash) {
          $('a[href^="/' + window.location.hash + '"]').addClass('active');
        }

        // Smooth Scroll
        $('a[href^="/#"]').on('click', function(e) {
          e.preventDefault();

          var $hash = this.hash;
          var $headerHeight = $('#header').outerHeight();

          $('html, body').animate({
            scrollTop: $($hash).offset().top - $headerHeight
          }, 1000, function() {
            // add hash to URL
            if (history.pushState) {
              history.pushState({}, '', $hash);
            }
            else {
              window.location.hash = $hash;
            }
          });

          $('a.cf-nav-link[href^="/#"]').removeClass('active').blur();
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
      }

      $(window).scroll(function() {
          if ($(this).scrollTop() > 50) {
              $('body').addClass("scrolled");
          } else {
              $('body').removeClass("scrolled");
          }
      });

    }
  };

  /**
   * Adjust main content margin for (sticky) header on front page.
   *
   * @type {{attach: Drupal.behaviors.crosscutFestivalMenu.attach}}
   */
  Drupal.behaviors.crosscutFestivalMenu = {
    attach: function(context, settings) {
      $('#header').once('crosscutFestivalMenu').each(function() {
        if (settings.path.isFront) {
          var observer = new MutationObserver(function() {
            var $headerHeight = $('#header').outerHeight();
            $('#content').css('margin-top', $headerHeight);
          });
          observer.observe($(this)[0], {
            attributes: true,
            attributeFilter: ['data-mutate'],
            childList: true,
            subtree: true
          });
          // Trigger an initial mutation.
          $(this).attr('data-mutate', 1);
        }
      });
    }
  };

  /**
   * Handle Announcement banner display/hiding.
   *
   * @type {{attach: Drupal.behaviors.crosscutFestivalAnnouncement.attach}}
   */
  Drupal.behaviors.crosscutFestivalAnnouncement = {
    attach: function(context, settings) {
      $('.announcement-banner').once('crosscutFestivalAnnouncement').each(function() {
        if (!sessionStorage.getItem('announcementClosed')) {
          $(this).removeClass('d-none');
          $(this).children('.close').on('click', function() {
            $(this).parent().remove();
            sessionStorage.setItem('announcementClosed', '1');
          });
        }
      });
    }
  };

  Drupal.behaviors.crosscutNews = {
    attach: function(context, settings) {

      $('#news-container').once('crosscutNews').each(function() {

        var $article = $('#crosscut-article');

          var domain = 'https://crosscut.com';
          // News section: get data from festival news REST export view on crosscut.com
          function renderNews(data) {
            var link = data['view_node'];
            var image_path = domain + data['image'];
            var date = data['created'].slice(0, -8); // remove time from long format date

            var html = '<div class="row no-gutters"><div class="col-sm-6 col-md-3"><div class="img-container"><a href="'  + link + '"><img class="newsImage" alt="Crosscut Festival News Article" src="' + image_path + '"/></a></div></div><div class="col-sm-6 col-md-9 article-teaser"><h4><a href="' + link + '">' + data['title'] + '</a></h4>' + data['excerpt'] + '<span class="byline">by ' + data['author'] + ' / ' + date + '</span></div></div>';
            $article.append(html);
          }

        function renderError() {
          var html = '<p>Head over to <a href="https://crosscut.com/crosscut-festival">crosscut.com</a> to see the latest Crosscut Festival updates.</p>';

          $article.append(html);
        }

        var url = domain + '/json/festival-news?_format=json';

        $.ajax({
          url: url,
          method: 'GET',
          crossDomain: true,
          success: function(response) {
            renderNews(response[0]);
          },
          error: function(xhr, status, error) {
            var errorMessage = xhr.status + ': ' + xhr.statusText;
            renderError();
            console.log('Error Occurred. ' + errorMessage);
          }
        });
      });
    }
  };

})(jQuery, Drupal);
