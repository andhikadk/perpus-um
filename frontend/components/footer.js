/**
 * Footer Component
 * Reusable footer for all pages
 */

function createFooter() {
  return `
    <footer class="bg-white/90 backdrop-blur-md mt-12 border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-6 py-10">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 class="text-lg font-bold mb-3">Perpustakaan Universitas Negeri Malang</h3>
            <p class="text-gray-500">Menyediakan sumber daya dan layanan akademis untuk mendukung pendidikan dan penelitian.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-3">Akses Lain</h3>
            <ul class="space-y-2">
              <li><a href="index.html" class="hover:underline">Beranda</a></li>
              <li><a href="about.html" class="hover:underline">Tentang</a></li>
              <li><a href="requirements.html" class="hover:underline">Persyaratan</a></li>
              <li><a href="login.html" class="hover:underline">Login</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-3">Kontak</h3>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-center gap-2"><i class="fas fa-map-marker-alt w-5"></i> Jl. Semarang 5 Malang 65145 Jawa Timur – Indonesia</li>
              <li class="flex items-center gap-2"><i class="fas fa-phone w-5"></i> (0341) 571035</li>
              <li class="flex items-center gap-2"><i class="fas fa-envelope w-5"></i> library@um.ac.id</li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-bold mb-3">Jam Layanan Pendaftaran Kartu Khusus</h3>
            <ul class="space-y-2 text-gray-600">
              <li>Senin - Jumat : 08.00 WIB - 15.00 WIB</li>
              <li>Sabtu : 09.00 WIB - 14:00 WIB</li>
            </ul>
          </div>
        </div>
        <div class="text-center text-gray-400 text-sm pt-6 border-t border-gray-100">&copy; 2025 Perpustakaan Universitas Negeri Malang. All rights reserved.</div>
      </div>
    </footer>
  `;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createFooter };
}
