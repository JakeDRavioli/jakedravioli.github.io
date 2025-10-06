/**
 * Moyai Vine Boom Clicker
 *
 * This script scans the entire document for the '🗿' (Moyai) emoji
 * and makes each instance clickable. It plays the classic Vine Boom sound
 * effect and triggers a zoom/fade animation on click.
 *
 * It now includes a polling mechanism to detect emojis added dynamically
 * after the initial page load.
 *
 * Author: j
 * Version: 1.2.0
 *
 * Instructions:
 * 1. Save this code as a .js file (e.g., 'vineboom.js').
 * 2. Make sure you have the 'vine_boom.mp3' file in a '/memes/' directory
 * relative to your website root.
 * 3. Include the script in your HTML file, preferably at the end of the <body> tag:
 * <script src="path/to/your/vineboom.js"></script>
 */

document.addEventListener('DOMContentLoaded', () => {

  // The path to your sound file.
  const audioSrc = 'https://files.catbox.moe/u1uqus.mp3';

  /**
   * Injects the necessary CSS for the animation directly into the page's <head>.
   * This keeps everything self-contained in one .js file.
   */
  function injectAnimationStyles() {
    // Check if styles are already injected to prevent duplication on re-scans.
    if (document.getElementById('moyai-animation-styles')) return;

    const style = document.createElement('style');
    style.id = 'moyai-animation-styles'; // Add an ID to check for existence.
    style.textContent = `
      @keyframes moyai-zoom-out {
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(5);
          opacity: 0;
        }
      }

      .moyai-animation {
        position: fixed; /* Use fixed positioning relative to the viewport */
        pointer-events: none; /* The animation shouldn't be clickable */
        z-index: 9999; /* Ensure it appears on top of everything */
        animation: moyai-zoom-out 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
  }

  // Run the injection function once the DOM is ready.
  injectAnimationStyles();

  /**
   * Recursively walks through all elements on the page to find and replace '🗿'.
   * This function is designed to be safe to run multiple times on the same page.
   * @param {HTMLElement} element - The element to scan for text nodes.
   */
  function makeMoyaiClickable(element) {
    const childNodes = Array.from(element.childNodes);

    for (const node of childNodes) {
      if (node.nodeType === 1) { // Element node
        // Avoid scanning scripts, styles, and our own clickable spans.
        if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && !node.classList.contains('moyai-clickable')) {
          makeMoyaiClickable(node);
        }
      } else if (node.nodeType === 3 && node.textContent.includes('🗿')) { // Text node
        const parent = node.parentNode;
        const parts = node.textContent.split('🗿');
        const fragment = document.createDocumentFragment();

        parts.forEach((part, index) => {
          fragment.appendChild(document.createTextNode(part));

          if (index < parts.length - 1) {
            const moyaiSpan = document.createElement('span');
            moyaiSpan.textContent = '🗿';
            moyaiSpan.className = 'moyai-clickable';
            moyaiSpan.style.cursor = 'pointer';
            moyaiSpan.style.userSelect = 'none';

            moyaiSpan.addEventListener('click', (event) => {
              // 1. Play the sound.
              const audio = new Audio(audioSrc);
              audio.play().catch(e => console.error("Vine Boom failed to play:", e));

              // 2. Create and position the animation element.
              const rect = moyaiSpan.getBoundingClientRect();
              const animationSpan = document.createElement('span');
              animationSpan.textContent = '🗿';
              animationSpan.className = 'moyai-animation';
              
              const computedStyle = window.getComputedStyle(moyaiSpan);
              animationSpan.style.font = computedStyle.font;
              animationSpan.style.lineHeight = computedStyle.lineHeight;
              animationSpan.style.left = `${rect.left}px`;
              animationSpan.style.top = `${rect.top}px`;
              
              // 3. Add it to the page to trigger the animation.
              document.body.appendChild(animationSpan);

              // 4. Clean up the animation element after it finishes.
              animationSpan.addEventListener('animationend', () => {
                animationSpan.remove();
              });
            });

            fragment.appendChild(moyaiSpan);
          }
        });

        parent.replaceChild(fragment, node);
      }
    }
  }

  // --- MODIFICATION START: POLLING MECHANISM ---

  // 1. Run the initial scan on page load for static content.
  console.log('🗿 Initializing Vine Boom protocol...');
  makeMoyaiClickable(document.body);
  console.log('🗿 Initial scan complete. Static content is now clickable.');

  // 2. Set up the recurring check for dynamic content.
  // We wait 2 seconds before starting the polling.
  setTimeout(() => {
    console.log('🗿 Starting periodic checks for dynamic content.');
    
    // Run the first re-scan immediately after the 2-second delay.
    makeMoyaiClickable(document.body);

    // Then, set an interval to re-scan every 60 seconds.
    setInterval(() => {
      console.log('🗿 Re-scanning page for new Moyai...');
      makeMoyaiClickable(document.body);
    }, 60000); // 60000 milliseconds = 60 seconds

  }, 5000); // 2000 milliseconds = 2 seconds

});
