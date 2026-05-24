const STORAGE_KEY = 'learnshare_materials';
const DOWNLOADS_KEY = 'learnshare_total_downloads';

const CATEGORY_LABELS = {
  math: 'Math',
  science: 'Science',
  programming: 'Programming',
  languages: 'Languages',
  history: 'History',
  art: 'Art & Design',
};

const SAMPLE_MATERIALS = [
  {
    id: '1',
    title: 'Calculus I — Limits & Derivatives',
    author: 'Dr. Sarah Chen',
    category: 'math',
    type: 'PDF',
    description: 'Comprehensive lecture notes covering limits, continuity, and basic differentiation with worked examples.',
    tags: ['calculus', 'derivatives', 'exam-prep'],
    downloads: 342,
    createdAt: '2026-03-15',
  },
  {
    id: '2',
    title: 'JavaScript ES6+ Cheat Sheet',
    author: 'Alex Rivera',
    category: 'programming',
    type: 'Notes',
    description: 'Quick reference for arrow functions, destructuring, promises, async/await, and modern array methods.',
    tags: ['javascript', 'cheat-sheet', 'web-dev'],
    downloads: 891,
    createdAt: '2026-04-02',
  },
  {
    id: '3',
    title: 'Organic Chemistry Lab Safety',
    author: 'Prof. James Okonkwo',
    category: 'science',
    type: 'Slides',
    description: 'Essential safety protocols, equipment handling, and emergency procedures for organic chemistry labs.',
    tags: ['chemistry', 'lab', 'safety'],
    downloads: 156,
    createdAt: '2026-02-20',
  },
  {
    id: '4',
    title: 'Spanish Conversation Phrases',
    author: 'Maria Gutierrez',
    category: 'languages',
    type: 'PDF',
    description: '500+ everyday phrases for travel and conversation, organized by situation with pronunciation tips.',
    tags: ['spanish', 'conversation', 'beginner'],
    downloads: 523,
    createdAt: '2026-01-10',
  },
  {
    id: '5',
    title: 'World War II Timeline Study Guide',
    author: 'History Club UBC',
    category: 'history',
    type: 'DOC',
    description: 'Chronological events from 1939–1945 with key figures, battles, and cause-effect relationships.',
    tags: ['ww2', 'timeline', 'history'],
    downloads: 278,
    createdAt: '2026-03-28',
  },
  {
    id: '6',
    title: 'Color Theory for Digital Artists',
    author: 'Elena Park',
    category: 'art',
    type: 'Video',
    description: 'Learn color wheels, harmonies, contrast ratios, and palette building for UI and illustration.',
    tags: ['design', 'color', 'digital-art'],
    downloads: 445,
    createdAt: '2026-04-18',
  },
  {
    id: '7',
    title: 'Linear Algebra — Matrix Operations',
    author: 'MIT Open Course',
    category: 'math',
    type: 'PDF',
    description: 'Matrix multiplication, determinants, eigenvalues, and applications in computer graphics.',
    tags: ['linear-algebra', 'matrices', 'advanced'],
    downloads: 612,
    createdAt: '2026-02-05',
  },
  {
    id: '8',
    title: 'Python Data Structures Guide',
    author: 'Code Academy Notes',
    category: 'programming',
    type: 'Notes',
    description: 'Lists, dicts, sets, tuples, stacks, queues, and Big-O complexity with Python implementations.',
    tags: ['python', 'data-structures', 'algorithms'],
    downloads: 734,
    createdAt: '2026-05-01',
  },
];

let materials = [];
let activeCategory = 'all';
let searchQuery = '';
let sortBy = 'newest';

function loadMaterials() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      materials = JSON.parse(stored);
      return;
    } catch {
      /* fall through */
    }
  }
  materials = [...SAMPLE_MATERIALS];
  saveMaterials();
}

function saveMaterials() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
}

function getTotalDownloads() {
  const stored = localStorage.getItem(DOWNLOADS_KEY);
  if (stored) return parseInt(stored, 10) || 0;
  return materials.reduce((sum, m) => sum + (m.downloads || 0), 0);
}

function setTotalDownloads(n) {
  localStorage.setItem(DOWNLOADS_KEY, String(n));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function updateStats() {
  document.getElementById('statMaterials').textContent = materials.length;
  document.getElementById('statDownloads').textContent = getTotalDownloads().toLocaleString();
}

function getFilteredMaterials() {
  let list = [...materials];

  if (activeCategory !== 'all') {
    list = list.filter((m) => m.category === activeCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (sortBy) {
    case 'popular':
      list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      break;
    case 'title':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
    default:
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
}

function renderMaterials() {
  const grid = document.getElementById('materialsGrid');
  const empty = document.getElementById('emptyState');
  const filtered = getFilteredMaterials();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  grid.innerHTML = filtered
    .map(
      (m, i) => `
    <article class="material-card" data-id="${m.id}" style="animation-delay: ${i * 0.05}s">
      <div class="card-header">
        <span class="category-badge category-${m.category}">${CATEGORY_LABELS[m.category] || m.category}</span>
        <span class="file-type">${m.type}</span>
      </div>
      <h3>${escapeHtml(m.title)}</h3>
      <p class="author">by ${escapeHtml(m.author)}</p>
      <p class="desc">${escapeHtml(m.description)}</p>
      <div class="tags">
        ${(m.tags || [])
          .slice(0, 4)
          .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
          .join('')}
      </div>
      <div class="card-footer">
        <span class="downloads">⬇ ${(m.downloads || 0).toLocaleString()} downloads</span>
        <button class="btn btn-primary download-btn" data-id="${m.id}">Download</button>
      </div>
    </article>
  `
    )
    .join('');

  grid.querySelectorAll('.material-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.download-btn')) return;
      openDetail(card.dataset.id);
    });
  });

  grid.querySelectorAll('.download-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDownload(btn.dataset.id);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function handleDownload(id) {
  const material = materials.find((m) => m.id === id);
  if (!material) return;

  material.downloads = (material.downloads || 0) + 1;
  saveMaterials();

  const total = getTotalDownloads() + 1;
  setTotalDownloads(total);

  updateStats();
  renderMaterials();
  showToast(`Downloaded "${material.title}" — thanks for learning!`);
}

function openDetail(id) {
  const m = materials.find((x) => x.id === id);
  if (!m) return;

  const content = document.getElementById('detailContent');
  content.innerHTML = `
    <div class="detail-header">
      <span class="category-badge category-${m.category}">${CATEGORY_LABELS[m.category]}</span>
      <h2>${escapeHtml(m.title)}</h2>
      <p class="detail-meta">by ${escapeHtml(m.author)} · ${m.type} · ${m.createdAt}</p>
    </div>
    <p class="detail-desc">${escapeHtml(m.description)}</p>
    <div class="detail-tags">
      ${(m.tags || []).map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}
    </div>
    <div class="detail-actions">
      <button class="btn btn-primary" id="detailDownloadBtn">Download (${(m.downloads || 0).toLocaleString()})</button>
      <button class="btn btn-ghost" id="detailCloseBtn">Close</button>
    </div>
  `;

  document.getElementById('detailOverlay').classList.remove('hidden');
  document.getElementById('detailDownloadBtn').addEventListener('click', () => {
    handleDownload(id);
    document.getElementById('detailOverlay').classList.add('hidden');
  });
  document.getElementById('detailCloseBtn').addEventListener('click', () => {
    document.getElementById('detailOverlay').classList.add('hidden');
  });
}

function openUploadModal() {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('materialTitle').focus();
}

function closeUploadModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.getElementById('uploadForm').reset();
}

function initFilters() {
  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category;
      renderMaterials();
    });
  });

  document.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      activeCategory = cat;
      document.querySelectorAll('.filter-chip').forEach((c) => {
        c.classList.toggle('active', c.dataset.category === cat);
      });
      document.getElementById('materials').scrollIntoView({ behavior: 'smooth' });
      renderMaterials();
    });
  });
}

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  let debounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      searchQuery = searchInput.value;
      renderMaterials();
    }, 200);
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderMaterials();
  });
}

function initModals() {
  document.getElementById('uploadBtn').addEventListener('click', openUploadModal);
  document.getElementById('heroUploadBtn').addEventListener('click', openUploadModal);
  document.getElementById('modalClose').addEventListener('click', closeUploadModal);
  document.getElementById('detailClose').addEventListener('click', () => {
    document.getElementById('detailOverlay').classList.add('hidden');
  });

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeUploadModal();
  });
  document.getElementById('detailOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('detailOverlay').classList.add('hidden');
    }
  });

  document.getElementById('uploadForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const tagsRaw = document.getElementById('materialTags').value;
    const tags = tagsRaw
      ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const newMaterial = {
      id: generateId(),
      title: document.getElementById('materialTitle').value.trim(),
      author: document.getElementById('materialAuthor').value.trim(),
      category: document.getElementById('materialCategory').value,
      type: document.getElementById('materialType').value,
      description: document.getElementById('materialDesc').value.trim(),
      tags,
      downloads: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    materials.unshift(newMaterial);
    saveMaterials();
    updateStats();
    renderMaterials();
    closeUploadModal();
    showToast('Material published successfully!');
  });
}

function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const header = document.querySelector('.header');
  toggle.addEventListener('click', () => header.classList.toggle('nav-open'));
}

function init() {
  loadMaterials();
  updateStats();
  renderMaterials();
  initFilters();
  initSearch();
  initModals();
  initMobileMenu();
}

document.addEventListener('DOMContentLoaded', init);
