/**
 * SMK Perkapalan Al-Zaytun - Main JavaScript
 * Handles navigation, form submission, and report management
 */

// ===== GLOBAL STATE =====
let allReports = [];
let currentPage = 'beranda';
let mobileMenuOpen = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Initialize data SDK if available
  if (window.dataSdk) {
    initializeDataSdk();
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Handle scroll effects
  setupScrollEffects();

  // Initialize theme mode
  initializeTheme();
});

// ===== DATA SDK INITIALIZATION =====
async function initializeDataSdk() {
  const handler = {
    onDataChanged(data) {
      // Sort reports by submission date (newest first)
      allReports = data.sort((a, b) => 
        (b.submitted_at || '').localeCompare(a.submitted_at || '')
      );
      renderReports();
    }
  };

  try {
    const res = await window.dataSdk.init(handler);
    if (!res.isOk) {
      console.error('SDK initialization failed:', res.error);
    }
  } catch (error) {
    console.error('Error initializing SDK:', error);
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Form submission
  const form = document.getElementById('laporan-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenuOpen && !e.target.closest('.navbar')) {
      closeMobileMenu();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      closeMobileMenu();
    }
  });
}

// ===== SCROLL EFFECTS =====
function setupScrollEffects() {
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    // Add scrolled class to navbar
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });
  
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe fade-in elements
  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ===== THEME MODE =====
const themeStorageKey = 'laporan-praktikum-theme';

function initializeTheme() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(theme);
  setupThemeToggle();
}

function applyTheme(theme) {
  const body = document.body;
  const toggleButton = document.getElementById('theme-toggle');
  const isDark = theme === 'dark';

  body.classList.toggle('dark', isDark);
  localStorage.setItem(themeStorageKey, theme);

  if (toggleButton) {
    const icon = toggleButton.querySelector('i');
    const text = toggleButton.querySelector('.btn-text');

    if (icon) {
      icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    }
    if (text) {
      text.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
    }

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

function setupThemeToggle() {
  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton) return;

  toggleButton.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

// ===== NAVIGATION =====
function showPage(page) {
  currentPage = page;
  
  // Toggle page visibility
  const pages = document.querySelectorAll('.page');
  pages.forEach(p => p.classList.remove('active'));
  
  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Update active nav link
  updateActiveNav(page);
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Close mobile menu if open
  closeMobileMenu();
}

function scrollToSection(sectionId) {
  showPage('beranda');
  
  // Small delay to ensure page is visible before scrolling
  setTimeout(() => {
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 72;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      
      window.scrollTo({
        top: sectionTop - navbarHeight,
        behavior: 'smooth'
      });
    }
  }, 100);
}

function updateActiveNav(page) {
  // Remove active class from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current page
  const navId = page === 'beranda' ? 'nav-beranda' : 'nav-laporan';
  const activeLink = document.getElementById(navId);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  
  mobileMenuOpen = !mobileMenuOpen;
  menu.classList.toggle('active', mobileMenuOpen);
  
  // Toggle icon
  const icon = menu.closest('.navbar')?.querySelector('.icon-menu');
  if (icon && typeof lucide !== 'undefined') {
    const iconName = mobileMenuOpen ? 'x' : 'menu';
    icon.setAttribute('data-lucide', iconName);
    lucide.createIcons();
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.remove('active');
    mobileMenuOpen = false;
    
    // Reset icon
    const icon = menu.closest('.navbar')?.querySelector('.icon-menu');
    if (icon && typeof lucide !== 'undefined') {
      icon.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    }
  }
}

// ===== FORM HANDLING =====
async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = document.getElementById('submit-btn');
  if (!submitBtn) return;

  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner"></span>
    Mengirim...
  `;

  try {
    const formData = new FormData(form);

    const messageLines = [
      'Laporan Praktikum',
      `Nama: ${formData.get('student_name') || '-'}`,
      `Kelas: ${formData.get('class') || '-'}`,
      `NIS/NISN: ${formData.get('nis') || '-'}`,
      `Email: ${formData.get('email') || '-'}`,
      `Mata Praktikum: ${formData.get('subject') || '-'}`,
      `Tanggal Praktikum: ${formData.get('practice_date') || '-'}`,
      `Judul Praktikum: ${formData.get('practice_title') || '-'}`,
      '---',
      `Tujuan: ${formData.get('objective') || '-'}`,
      `Alat & Bahan: ${formData.get('tools_materials') || '-'}`,
      `Langkah Kerja: ${formData.get('procedure') || '-'}`,
      `Hasil: ${formData.get('result') || '-'}`,
      `Kesimpulan: ${formData.get('conclusion') || '-'}`,
      `Catatan Tambahan: ${formData.get('notes') || '-'}`
    ];

    const whatsappNumber = '6281313027221';
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageLines.join('\n'))}`;

    window.open(waUrl, '_blank');
    showFormMessage('✅ Laporan telah dikirim ke WhatsApp 081313027221. Silakan lanjutkan pengiriman di aplikasi WhatsApp.', true);
    form.reset();
  } catch (error) {
    console.error('Form submission error:', error);
    showFormMessage('❌ Gagal membuka WhatsApp. Silakan coba lagi.', false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
  }
}

function showFormMessage(text, isSuccess) {
  const msgEl = document.getElementById('form-status');
  if (!msgEl) return;

  msgEl.textContent = text;
  msgEl.className = `form-status ${isSuccess ? 'success' : 'error'}`;
  msgEl.classList.remove('hidden');

  // Auto hide after 6 seconds
  setTimeout(() => {
    msgEl.classList.add('hidden');
  }, 6000);
}

// ===== REPORT RENDERING =====
function renderReports() {
  const list = document.getElementById('report-list');
  const emptyState = document.getElementById('empty-state');
  
  if (!list) return;
  
  // Show/hide empty state
  if (allReports.length === 0) {
    emptyState?.classList.remove('hidden');
    list.innerHTML = '';
    return;
  }
  
  emptyState?.classList.add('hidden');
  
  // Clear and rebuild list
  list.innerHTML = '';
  
  allReports.forEach(report => {
    const card = createReportCard(report);
    list.appendChild(card);
  });
}

function createReportCard(report) {
  const template = document.getElementById('report-tpl');
  if (!template) return null;
  
  // Clone template content
  const card = template.content.cloneNode(true).querySelector('[data-template-id="report-card"]');
  card.dataset.reportId = report.__backendId || Date.now().toString();
  
  // Populate card data
  populateReportCard(card, report);
  
  // Setup event listeners
  setupReportCardEvents(card);
  
  return card;
}

function populateReportCard(card, report) {
  const setText = (selector, text) => {
    const el = card.querySelector(selector);
    if (el) el.textContent = text || '-';
  };
  
  // Header info
  setText('[data-template-id="report-card-title"]', report.practice_title);
  setText('[data-template-id="report-card-meta"]', 
    `${report.student_name} • ${report.class} • ${report.subject} • ${formatDate(report.date)}`
  );
  
  // Detail content
  setText('.rpt-objective', report.objective);
  setText('.rpt-tools', report.tools_materials);
  setText('.rpt-procedure', report.procedure);
  setText('.rpt-result', report.result);
  setText('.rpt-conclusion', report.conclusion);
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function setupReportCardEvents(card) {
  // Toggle detail
  const toggleBtn = card.querySelector('.rpt-toggle');
  const detailEl = card.querySelector('.rpt-detail');
  
  toggleBtn?.addEventListener('click', () => {
    detailEl?.classList.toggle('active');
    toggleBtn.textContent = detailEl?.classList.contains('active') ? 'Sembunyikan' : 'Detail';
  });
  
  // Delete confirmation
  const deleteBtn = card.querySelector('.rpt-delete');
  const confirmEl = card.querySelector('.rpt-confirm');
  const confirmNo = card.querySelector('.rpt-confirm-no');
  const confirmYes = card.querySelector('.rpt-confirm-yes');
  
  deleteBtn?.addEventListener('click', () => {
    confirmEl?.classList.add('active');
  });
  
  confirmNo?.addEventListener('click', () => {
    confirmEl?.classList.remove('active');
  });
  
  confirmYes?.addEventListener('click', async () => {
    const reportId = card.dataset.reportId;
    const report = allReports.find(r => r.__backendId === reportId);
    
    if (!report) return;
    
    // Disable buttons during deletion
    confirmYes.disabled = true;
    confirmYes.textContent = 'Menghapus...';
    
    try {
      if (window.dataSdk) {
        const result = await window.dataSdk.delete(report);
        
        if (result.isOk) {
          // Remove from local array
          allReports = allReports.filter(r => r.__backendId !== reportId);
          renderReports();
          showFormMessage('Laporan berhasil dihapus.', true);
        } else {
          showFormMessage('Gagal menghapus laporan.', false);
        }
      } else {
        // Demo mode
        console.log('Report deleted (demo):', reportId);
        allReports = allReports.filter(r => r.__backendId !== reportId);
        renderReports();
        showFormMessage('Laporan berhasil dihapus (Demo Mode).', true);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showFormMessage('Terjadi kesalahan saat menghapus.', false);
    } finally {
      confirmYes.disabled = false;
      confirmYes.textContent = 'Ya, Hapus';
      confirmEl?.classList.remove('active');
    }
  });
}

// ===== UTILITY FUNCTIONS =====

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
  const smoothScroll = (target) => {
    const startY = window.scrollY;
    const targetY = target.getBoundingClientRect().top + startY;
    const distance = targetY - startY;
    const duration = 500;
    let start = null;
    
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      window.scrollTo(0, startY + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  };
  
  // Override scrollTo if needed
  window.smoothScrollTo = smoothScroll;
}

// ===== EXPORT FOR SDK CALLBACKS =====
window.showPage = showPage;
window.scrollToSection = scrollToSection;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;