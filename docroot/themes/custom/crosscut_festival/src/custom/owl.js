$(document).ready(function() {
  // Initialize Carousels
  $('#panelists-carousel').owlCarousel({
    loop: true,
    dots: true,
    margin: 5,
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