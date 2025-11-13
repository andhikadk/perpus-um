# Library Membership System (Sistem Manajemen Anggota Perpustakaan)

**Kartu Khusus Perpustakaan Universitas Negeri Malang**

Sistem manajemen pendaftaran dan perpanjangan anggota perpustakaan untuk Universitas Negeri Malang.

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Setup & Instalasi](#setup--instalasi)
- [Penggunaan](#penggunaan)
- [Status Pengembangan](#status-pengembangan)
- [Kontribusi](#kontribusi)

## 📖 Tentang Proyek

Sistem ini memungkinkan:

- **Anggota Publik**: Mendaftar sebagai member perpustakaan melalui formulir online
- **Admin/Pustakawan**:
  - Login ke dashboard admin
  - Melihat daftar pendaftaran baru
  - Menyetujui (approve) atau menolak (reject) pendaftaran
  - Mengelola perpanjangan keanggotaan
  - Menerima notifikasi email otomatis

## ✨ Fitur

### Phase 1 - Cleanup & Restructure ✅
- [x] Reorganisasi struktur folder project
- [x] Hapus file Vite yang tidak terpakai
- [x] Update path references untuk asset & script
- [x] Extract inline JavaScript ke file terpisah
- [x] Consolidate validation logic
- [x] Buat constants file dan config
- [x] Setup .gitignore
- [x] Update package.json

### Phase 2 - Backend & Database (In Progress)
- [ ] Setup Node.js + Express backend
- [ ] Konfigurasi MySQL database
- [ ] Buat database schema
- [ ] Implement REST API endpoints
- [ ] Setup file upload handling (Multer)
- [ ] Implement JWT authentication

### Phase 3 - Admin Features
- [ ] Implement approve/reject system
- [ ] Add renewal functionality
- [ ] Status tracking & audit logs

### Phase 4 - Email Notifications
- [ ] Setup Nodemailer
- [ ] Create email templates
- [ ] Trigger emails on registration, approval, rejection

### Phase 5 - Testing & Deployment
- [ ] Frontend testing
- [ ] Backend testing
- [ ] Security hardening
- [ ] Performance optimization

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Markup
- **CSS3 + Tailwind CSS** - Styling
- **Vanilla JavaScript (ES6+)** - Interactivity
- **Chart.js** - Dashboard charts

### Backend (Phase 2)
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL / MariaDB** - Database
- **Nodemailer** - Email service
- **Multer** - File uploads
- **JWT** - Authentication

### Tools
- **Vite** - Build tool
- **Git** - Version control
- **npm** - Package manager

## 📁 Struktur Folder

```
project_balqis/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── css/
│   │   │   ├── styles.css
│   │   │   └── color.css
│   │   ├── js/
│   │   │   ├── config.js         # Centralized configuration
│   │   │   ├── validation.js     # Form validation logic
│   │   │   ├── main.js           # Shared utilities
│   │   │   ├── login.js          # Login page logic
│   │   │   ├── signup.js         # Signup page logic
│   │   │   ├── admin.js          # Admin dashboard logic
│   │   │   └── detail.js         # Member detail page logic
│   │   ├── assets/
│   │   │   └── logo-um.png
│   │   └── pages/
│   │       ├── login.html
│   │       ├── signup.html
│   │       ├── about.html
│   │       ├── requirements.html
│   │       ├── view_table_mahasiswa.html
│   │       └── detail_mahasiswa.html
│   └── components/
│       ├── header.js
│       └── footer.js
├── backend/                      # Coming in Phase 2
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── config/
│   └── server.js
├── database/                     # Coming in Phase 2
│   └── schema.sql
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

## 🚀 Setup & Instalasi

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Git

### Frontend Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd project_balqis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   - Frontend akan tersedia di `http://localhost:5173` (default Vite)

4. **Build untuk production**
   ```bash
   npm run build
   ```

### Backend Setup (Phase 2)

```bash
# Install dependencies
npm install

# Setup .env file
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Setup database
mysql -u root -p < database/schema.sql

# Start development server
npm run server:dev

# Start production server
npm run server
```

## 📖 Penggunaan

### Akses Aplikasi

**Public Pages:**
- Homepage: `/index.html`
- About: `/frontend/public/pages/about.html`
- Requirements: `/frontend/public/pages/requirements.html`
- Registration: `/frontend/public/pages/signup.html`

**Admin Pages:**
- Login: `/frontend/public/pages/login.html`
  - Email: `admin@gmail.com`
  - Password: `admin`
- Dashboard: `/frontend/public/pages/view_table_mahasiswa.html`
- Member Detail: `/frontend/public/pages/detail_mahasiswa.html`

### File Configuration

- **`frontend/public/js/config.js`** - Semua konstanta & config
- **`frontend/public/js/validation.js`** - Validation rules
- **`.env`** - Environment variables (Phase 2)

## 📊 Status Pengembangan

| Phase | Deskripsi | Status | Estimasi |
|-------|-----------|--------|----------|
| 1 | Cleanup & Restructure | ✅ Complete | 2-3 hari |
| 2 | Backend & Database | ⏳ In Progress | 3-4 hari |
| 3 | Admin Features | ⏸️ Pending | 2-3 hari |
| 4 | Email Notifications | ⏸️ Pending | 1-2 hari |
| 5 | Testing & Deployment | ⏸️ Pending | 2-3 hari |

**Total Estimasi**: 10-15 hari kerja

## 🐛 Known Issues & TODO

### Frontend
- [ ] Convert to template engine (EJS) saat Phase 2
- [ ] Add client-side error handling & loading states
- [ ] Implement proper form reset setelah submit
- [ ] Add accessibility improvements (ARIA labels)

### Backend (Phase 2)
- [ ] Setup database connection pooling
- [ ] Implement request validation middleware
- [ ] Add rate limiting
- [ ] Setup CORS properly
- [ ] Add error logging & monitoring

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Phase 1: Project cleanup & restructure complete
- ✅ File organization & consolidation
- ✅ Config & validation utilities
- ⏳ Backend integration (Phase 2)

## 🤝 Kontribusi

1. Create feature branch: `git checkout -b feature/nama-fitur`
2. Commit changes: `git commit -m "Add: deskripsi fitur"`
3. Push ke branch: `git push origin feature/nama-fitur`
4. Open Pull Request

### Code Style
- Use camelCase untuk JavaScript variables
- Use kebab-case untuk HTML IDs & classes
- Add comments untuk complex logic
- Gunakan const/let (hindari var)
- Follow existing naming conventions

## 📄 License

MIT License - Silakan gunakan untuk project pribadi atau komersial

## 👥 Team

- Development Team - Universitas Negeri Malang

## 📧 Support

Untuk bantuan, silakan hubungi:
- Email: library@um.ac.id
- Phone: (0341) 571035
- Address: Jl. Semarang 5 Malang 65145

---

**Last Updated:** November 2024
**Version:** 1.0.0
