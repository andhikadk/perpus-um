/**
 * Header Component
 * Reusable header navigation for all public pages
 */

function createHeader(activePage = 'home') {
  const pages = {
    home: 'index.html',
    about: 'about.html',
    requirements: 'requirements.html',
    login: 'login.html'
  };

  const isActive = (page) => activePage === page ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500' : 'hover:bg-gray-100';
  const isLoginBtn = (page) => page === 'login' ? 'bg-gray-900 text-white hover:bg-gray-700' : '';

  return `
    <header class="bg-white backdrop-blur-md shadow-sm sticky top-0 z-20">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3 mb-2 md:mb-0">
          <img src="../assets/logo-um.png" alt="UM Logo" class="h-10">
          <span class="text-lg md:text-xl font-bold tracking-wide">Perpustakaan Universitas Negeri Malang</span>
        </div>
        <nav class="flex gap-2 md:gap-4 items-center mt-2 md:mt-0">
          <a href="${pages.home}" class="px-4 py-2 rounded-lg font-medium ${isActive('home')} ${activePage === 'home' ? isActive('home') : ''} transition">Beranda</a>
          <a href="${pages.about}" class="px-4 py-2 rounded-lg font-medium ${isActive('about')} ${activePage === 'about' ? isActive('about') : ''} transition">Tentang</a>
          <a href="${pages.requirements}" class="px-4 py-2 rounded-lg font-medium ${isActive('requirements')} ${activePage === 'requirements' ? isActive('requirements') : ''} transition">Persyaratan</a>
          <a href="${pages.login}" class="px-4 py-2 rounded-lg font-medium ${isLoginBtn('login')} transition">Login</a>
        </nav>
      </div>
    </header>
  `;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createHeader };
}
