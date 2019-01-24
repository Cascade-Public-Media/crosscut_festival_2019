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

  Drupal.behaviors.crosscutNews = {
    attach: function(context, settings) {

      $('#news-container').once('crosscutNews').each(function() {

        var $article = $('#crosscut-article');

        var domain = 'https://crosscut.com';
        // News section: get data from festival news REST export view on crosscut.com
        function renderNews(data) {
          var image_path = domain + data['image'];
          var date = data['created'].slice(0, -8); // remove time from long format date

          var html = '<div class="col-sm-6 col-md-3"><div class="img-container"><img class="newsImage" alt="Crosscut Festival News Article" src="' + image_path + '"/></div></div><div class="col-sm-6 col-md-9 article-teaser"><h4>' + data['title'] + '</h4><p>' + data['excerpt'] + '</p><span class="byline">by ' + data['author'] + ' / ' + date + '</span></div>';
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
