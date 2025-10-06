document.addEventListener('DOMContentLoaded', function() {
  // Get the modal elements
  const viewer = document.getElementById("image-viewer");
  const viewerImage = document.getElementById("viewer-image");
  const viewerCaption = document.getElementById("viewer-caption");
  const closeBtn = document.getElementById("close-viewer");

  document.body.addEventListener('click', function(event) {
    if (event.target && event.target.tagName === 'IMG' && event.target.closest('.blog-article')) {
      const clickedImage = event.target;

      // --- NEW: SPOILER IMAGE CHECK ---
      // If the clicked image has the spoiler class, we just reveal it and stop.
      if (clickedImage.classList.contains('spoiler-image')) {
        clickedImage.classList.remove('spoiler-image');
        return; // Prevents the image viewer from opening on the first click.
      }
      // --- END SPOILER CHECK ---
      
      viewerImage.src = clickedImage.src;
      viewerCaption.innerHTML = clickedImage.alt;
      
      // Instead of changing display, add the .active class
      viewer.classList.add('active'); 
    }
  });

  // Function to close the viewer
  function closeViewer() {
    // Instead of changing display, remove the .active class
    viewer.classList.remove('active'); 
  }

  // Close the viewer when the 'x' is clicked
  closeBtn.onclick = closeViewer;

  // Also close the viewer when clicking on the dark background
  viewer.onclick = function(event) {
    if (event.target === viewer) {
      closeViewer();
    }
  };
});