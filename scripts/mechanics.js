class MechanicsPage {
  constructor() {
    this.grid = document.getElementById('mechanics-grid');
    this.modal = document.getElementById('mechanic-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalImages = document.getElementById('modal-images');
    this.modalDescription = document.getElementById('modal-description');
    this.mechanics = [];
    this.maxExtraImages = 20;

    this.init();
  }

  async init() {
    await this.loadMechanics();
    this.renderCards();
    this.setupModal();
    this.setupImageZoom();
  }

  async loadMechanics() {
    try {
      const response = await fetch('data/mechanics.json');
      const rawData = await response.json();

      this.mechanics = rawData.map(mechanic => ({
        name: mechanic.name,
        folder: mechanic.folder,
        title: mechanic.title || '',
        titleColor: mechanic.titleColor || '#4aff88',
        image: `assets/mechanics/${mechanic.folder}/Main.png`,
        extraImages: this.generateExtraImagePaths(mechanic.folder),
        description: mechanic.description || ''
      }));
    } catch (error) {
      console.error('Error loading mechanics:', error);
      this.grid.innerHTML = '<p class="error-message">Failed to load mechanics data</p>';
    }
  }

  generateExtraImagePaths(folder) {
    const paths = [];
    for (let i = 1; i <= this.maxExtraImages; i++) {
      paths.push(`assets/mechanics/${folder}/Extra_${i}.png`);
    }
    return paths;
  }

  setupImageZoom() {
    if (document.querySelector('.zoom-overlay')) {
      this.zoomOverlay = document.querySelector('.zoom-overlay');
      this.zoomImage = this.zoomOverlay.querySelector('.zoom-image');
      return;
    }

    this.zoomOverlay = document.createElement('div');
    this.zoomOverlay.className = 'zoom-overlay';
    this.zoomOverlay.innerHTML = `
      <button class="zoom-close">&times;</button>
      <img class="zoom-image" src="" alt="Zoomed image">
    `;
    document.body.appendChild(this.zoomOverlay);

    this.zoomImage = this.zoomOverlay.querySelector('.zoom-image');
    const zoomClose = this.zoomOverlay.querySelector('.zoom-close');

    zoomClose.addEventListener('click', () => {
      this.zoomOverlay.classList.remove('active');
    });

    this.zoomOverlay.addEventListener('click', (e) => {
      if (e.target === this.zoomOverlay) {
        this.zoomOverlay.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.zoomOverlay.classList.contains('active')) {
        this.zoomOverlay.classList.remove('active');
      }
    });
  }

  renderCards() {
    this.grid.innerHTML = '';

    if (this.mechanics.length === 0) {
      this.grid.innerHTML = '<p class="no-mechanics">No mechanics found</p>';
      return;
    }

    this.mechanics.forEach((mechanic, index) => {
      const card = document.createElement('div');
      card.className = 'mechanic-card';
      card.style.animationDelay = `${index * 0.1}s`;

      const tierBadge = mechanic.title
        ? `<span class="mechanic-tier" style="
             background: ${this.hexToRgba(mechanic.titleColor, 0.15)};
             border-color: ${this.hexToRgba(mechanic.titleColor, 0.3)};
             color: ${mechanic.titleColor};
             box-shadow: 0 0 10px ${this.hexToRgba(mechanic.titleColor, 0.2)};
           ">${mechanic.title}</span>`
        : '';

      card.innerHTML = `
        <div class="mechanic-image-container">
          <img src="${mechanic.image}" alt="${mechanic.name}" class="mechanic-image"
               onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:14px;\\'>No Image</div>'">
        </div>
        <div class="mechanic-info">
          <div class="mechanic-header">
            <h3 class="mechanic-name">${mechanic.name}</h3>
            ${tierBadge}
          </div>
          <p class="mechanic-description">${mechanic.description || 'No description available'}</p>
        </div>
      `;

      card.addEventListener('mouseenter', () => {
        card.style.borderColor = `${this.hexToRgba(mechanic.titleColor, 0.6)}`;
        card.style.boxShadow = `0 8px 25px ${this.hexToRgba(mechanic.titleColor, 0.15)}`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        card.style.boxShadow = 'none';
      });

      card.addEventListener('click', () => this.openModal(mechanic));
      this.grid.appendChild(card);
    });
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  openModal(mechanic) {
    this.modalTitle.textContent = mechanic.name;
    this.modalImages.innerHTML = '';

    const modalContent = this.modal.querySelector('.modal-content');
    modalContent.style.borderColor = this.hexToRgba(mechanic.titleColor, 0.4);
    modalContent.style.boxShadow = `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px ${this.hexToRgba(mechanic.titleColor, 0.1)}`;

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'modal-image-wrapper';
    const mainImg = document.createElement('img');
    mainImg.alt = mechanic.name;
    mainImg.className = 'modal-image';
    mainImg.src = mechanic.image;
    mainImg.onerror = () => {
      mainImg.style.display = 'none';
      mainWrapper.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:16px;">No Image Available</div>';
    };
    mainImg.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openZoom(mechanic.image);
    });
    mainWrapper.appendChild(mainImg);
    this.modalImages.appendChild(mainWrapper);

    mechanic.extraImages.forEach((imgSrc, index) => {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'modal-image-wrapper';
      imgWrapper.style.display = 'none';

      const img = document.createElement('img');
      img.alt = `${mechanic.name} extra ${index + 1}`;
      img.className = 'modal-image';
      img.src = imgSrc;

      img.onload = () => {
        imgWrapper.style.display = 'flex';
      };

      img.onerror = () => {
        imgWrapper.remove();
      };

      img.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openZoom(imgSrc);
      });
      imgWrapper.appendChild(img);
      this.modalImages.appendChild(imgWrapper);
    });

    if (mechanic.description) {
      this.modalDescription.textContent = mechanic.description;
      this.modalDescription.style.display = 'block';
    } else {
      this.modalDescription.style.display = 'none';
    }

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  openZoom(src) {
    if (this.zoomImage) {
      this.zoomImage.src = src;
      this.zoomOverlay.classList.add('active');
    }
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    const modalContent = this.modal.querySelector('.modal-content');
    modalContent.style.borderColor = 'rgba(74, 255, 136, 0.4)';
    modalContent.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 255, 136, 0.1)';
  }

  setupModal() {
    const closeBtn = this.modal.querySelector('.modal-close');
    const overlay = this.modal.querySelector('.modal-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeModal());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MechanicsPage();
});