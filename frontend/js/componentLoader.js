/**
 * Component Loader
 * Dynamically loads header and footer components into pages
 */

// Load component from file
async function loadComponent(componentName) {
  try {
    const response = await fetch(`../../components/${componentName}.js`);
    const text = await response.text();

    // Create a script element and execute it
    const script = document.createElement('script');
    script.textContent = text;
    document.head.appendChild(script);

    return true;
  } catch (error) {
    console.error(`Error loading component ${componentName}:`, error);
    return false;
  }
}

// Initialize components on page load
async function initializeComponents(activePage = 'home') {
  // Load header component
  await loadComponent('header');
  const headerContainer = document.getElementById('header-container');
  if (headerContainer && typeof createHeader === 'function') {
    headerContainer.innerHTML = createHeader(activePage);
  }

  // Load footer component
  await loadComponent('footer');
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer && typeof createFooter === 'function') {
    footerContainer.innerHTML = createFooter();
  }
}

// Export for use in pages
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeComponents };
}
