// Конфигурация
const CONFIG = {
    dataPaths: {
        multiblocks: 'data/multiblocks.json',
        mechanics: 'data/mechanics.json'
    }
};

// Глобальное состояние
let currentCategory = 'multiblocks';
let currentData = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    initModal();
    createParticles();
    loadData(currentCategory);
});

// Навигация
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;

            // Обновление активной кнопки
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Обновление заголовка
            updateHeader(category);

            // Загрузка данных
            currentCategory = category;
            loadData(category);

            // Очистка поиска
            document.getElementById('search').value = '';
        });
    });
}

// Обновление заголовка секции
function updateHeader(category) {
    const title = document.getElementById('section-title');
    const description = document.getElementById('section-description');

    if (category === 'multiblocks') {
        title.innerHTML = '<span class="title-icon"><i class="fas fa-cubes"></i></span> Мультиблоки';
        description.textContent = 'Сложные многоблочные структуры для автоматизации процессов';
    } else {
        title.innerHTML = '<span class="title-icon"><i class="fas fa-cogs"></i></span> Механики';
        description.textContent = 'Уникальные игровые механики и системы';
    }
}

// Поиск
function initSearch() {
    const searchInput = document.getElementById('search');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            renderCards(currentData, searchTerm);
        }, 300);
    });
}

// Загрузка данных
async function loadData(category) {
    const container = document.getElementById('cards-container');
    container.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Загрузка данных...</p>
        </div>
    `;

    try {
        const response = await fetch(CONFIG.dataPaths[category]);
        if (!response.ok) throw new Error('Ошибка загрузки данных');

        currentData = await response.json();
        renderCards(currentData);
    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--secondary);"></i>
                <p style="color: var(--secondary);">Ошибка загрузки данных</p>
                <button onclick="loadData('${category}')" class="nav-btn" style="margin-top: 1rem;">
                    Повторить
                </button>
            </div>
        `;
    }
}

// Отрисовка карточек
function renderCards(data, searchTerm = '') {
    const container = document.getElementById('cards-container');

    // Фильтрация по поиску
    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        return item.name.toLowerCase().includes(searchTerm) ||
               item.description.toLowerCase().includes(searchTerm) ||
               (item.tier && item.tier.toLowerCase().includes(searchTerm));
    });

    if (filteredData.length === 0) {
        container.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary);"></i>
                <p>Ничего не найдено</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredData.map((item, index) => `
        <div class="card" onclick="openDetails('${item.id}', '${currentCategory}')" style="animation: fadeIn 0.5s ease ${index * 0.1}s both;">
            ${item.image ? `
                <img src="${item.image}" alt="${item.name}" class="card-image" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22><rect fill=%22%231a1a2e%22 width=%22300%22 height=%22200%22/><text fill=%22%2300ffcc%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22>${item.name}</text></svg>'">
            ` : `
                <div style="height: 250px; background: linear-gradient(135deg, #1a1a2e, #242444); display: flex; align-items: center; justify-content: center; font-size: 4rem; color: var(--primary);">
                    <i class="fas fa-cube"></i>
                </div>
            `}
            <div class="card-content">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-description">${item.description || 'Описание отсутствует'}</p>
            </div>
            ${item.tier ? `<span class="card-tier">${item.tier}</span>` : ''}
        </div>
    `).join('');
}

// Модальное окно
function initModal() {
    const modal = document.getElementById('modal');
    const closeBtn = modal.querySelector('.close-btn');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Открытие деталей
function openDetails(itemId, category) {
    const item = currentData.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    const galleryHtml = item.gallery && item.gallery.length > 0
        ? `
            <div class="modal-gallery">
                ${item.gallery.map(img => `
                    <img src="${img}" alt="${item.name}" onerror="this.style.display='none'">
                `).join('')}
            </div>
        `
        : '';

    modalBody.innerHTML = `
        <h2 class="modal-title">${item.name}</h2>
        ${item.tier ? `<p style="color: var(--primary); margin-bottom: 1rem; font-weight: 600;">Уровень: ${item.tier}</p>` : ''}
        <div class="modal-description">
            ${item.detailedDescription || item.description || 'Подробное описание отсутствует'}
        </div>
        ${item.features ? `
            <div class="modal-description">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">Особенности:</h3>
                <ul style="list-style: none; padding-left: 0;">
                    ${item.features.map(feature => `
                        <li style="padding: 0.5rem 0; padding-left: 1.5rem; position: relative;">
                            <i class="fas fa-check" style="color: var(--primary); position: absolute; left: 0; top: 0.7rem;"></i>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}
        ${galleryHtml}
    `;

    modal.classList.add('active');
}

// Создание частиц фона
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;

    for