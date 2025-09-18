/**
 * Utility function to smoothly scroll to a specific section and add highlight effect
 */
export function scrollToSection(sectionSelector: string, fallbackSelector?: string) {
  setTimeout(() => {
    const targetSection = document.querySelector(sectionSelector) || 
                         (fallbackSelector ? document.querySelector(fallbackSelector) : null);
    
    if (targetSection) {
      // Add immediate selection feedback
      targetSection.classList.add('selection-feedback');
      setTimeout(() => {
        targetSection.classList.remove('selection-feedback');
      }, 600);
      
      targetSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // Add highlight effect after scroll
      setTimeout(() => {
        targetSection.classList.add('scroll-highlight');
        setTimeout(() => {
          targetSection.classList.remove('scroll-highlight');
        }, 2000);
      }, 500);
    }
  }, 100);
}

/**
 * Scroll to the Next Best Actions section when an account is selected
 */
export function scrollToNBASection() {
  scrollToSection(
    '[data-section="nba-display"]',
    '[data-section="selected-account"]'
  );
}