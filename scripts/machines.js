class MachinesPage {
  constructor() {
    this.grid = document.getElementById('machines-grid');
    this.modal = document.getElementById('machine-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalImages = document.getElementById('modal-images');
    this.modalDescription = document.getElementById('modal-description');
    this.machines = [];
    this.filteredMachines = [];
    this.currentTier = 'all';
    this.maxExtraImages = 20;

    this.init();
  }

  async init() {
    await this.loadMachines();
    this.filteredMachines = [...this.machines];
    this.renderCards();
    this.setupModal();
    this.setupFilters();
    this.setupImageZoom();
  }

  async loadMachines() {
    try {
      const response = await fetch('data/machines.json');
      const rawData = await response.json();

      this.machines = rawData.map(machine => ({
        name: machine.name,
        folder: machine.folder,
        tier: machine.tier,
        image: `assets/machines/${machine.folder}/Main.png`,
        extraImages: this.generateExtraImagePaths(machine.folder),
        description: machine.description || ''
      }));
    } catch (error) {
      console.error('Error loading machines:', error);
      this.grid.innerHTML = '<p class="error-message">Failed to load machines data</p>';
    }
  }

  generateExtraImagePaths(folder) {
    const paths = [];
    for (let i = 1; i <= this.maxExtraImages; i++) {
      paths.push(`assets/machines/${folder}/Extra_${i}.png`);
    }
    return paths;
  }

  filterMachines(tier) {
    this.currentTier = tier;
    if (tier === 'all') {
      this.filteredMachines = [...this.machines];
    } else {
      this.filteredMachines = this.machines.filter(m => m.tier === tier);
    }
    this.renderCards();
  }

  setupFilters() {
    const filterButtons = document.querySelectorAll('.tier-btn');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterMachines(btn.dataset.tier);
      });
    });
  }

  setupImageZoom() {
    this.zoomOverlay = document.createElement('div');
    this.zoomOverlay.className = 'zoom-overlay';
    this.zoomOverlay.innerHTML = `
      <button class="zoom-close">&times;</button>
      <img class="zoom-image" src="" alt="Zoomed image">
    `;
    document.body.appendChild(this.zoomOverlay);

    this.zoomImage = this.zoomOverlay.querySelector('.zoom-image');
    this.zoomClose = this.zoomOverlay.querySelector('.zoom-close');

    this.zoomClose.addEventListener('click', () => {
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

    if (this.filteredMachines.length === 0) {
      this.grid.innerHTML = '<p class="no-machines">No machines found for this tier</p>';
      return;
    }

    this.filteredMachines.forEach((machine, index) => {
      const card = document.createElement('div');
      card.className = 'machine-card';
      card.style.animationDelay = `${index * 0.05}s`;

      card.innerHTML = `
        <div class="card-image-container">
          <img src="${machine.image}" alt="${machine.name}" class="card-image"
               onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%231a1a2e%22 width=%22300%22 height=%22200%22/%3E%3Ctext fill=%22%23555%22 x=%22150%22 y=%22100%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="card-divider"></div>
        <div class="card-name-container">
          <span class="card-name">${machine.name}</span>
        </div>
      `;

      card.addEventListener('click', () => this.openModal(machine));
      this.grid.appendChild(card);
    });
  }

  openModal(machine) {
    this.modalTitle.textContent = machine.name;
    this.modalImages.innerHTML = '';

    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'modal-image-wrapper';
    const mainImg = document.createElement('img');
    mainImg.alt = machine.name;
    mainImg.className = 'modal-image';
    mainImg.onerror = () => {
      mainImg.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%231a1a2e%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23555%22 x=%22200%22 y=%22150%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2218%22%3ENo Image%3C/text%3E%3C/svg%3E';
    };
    mainImg.src = machine.image;
    mainImg.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openZoom(machine.image);
    });
    mainWrapper.appendChild(mainImg);
    this.modalImages.appendChild(mainWrapper);

    machine.extraImages.forEach((imgSrc) => {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'modal-image-wrapper';
      imgWrapper.style.display = 'none';

      const img = document.createElement('img');
      img.alt = `${machine.name} extra`;
      img.className = 'modal-image';

      img.onload = () => {
        imgWrapper.style.display = 'flex';
      };

      img.onerror = () => {
        imgWrapper.remove();
      };

      img.src = imgSrc;
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openZoom(imgSrc);
      });
      imgWrapper.appendChild(img);
      this.modalImages.appendChild(imgWrapper);
    });

    if (machine.description) {
      this.modalDescription.textContent = machine.description;
      this.modalDescription.style.display = 'block';
    } else {
      this.modalDescription.style.display = 'none';
    }

    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  openZoom(src) {
    this.zoomImage.src = src;
    this.zoomOverlay.classList.add('active');
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  setupModal() {
    const closeBtn = this.modal.querySelector('.modal-close');
    const overlay = this.modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', () => this.closeModal());
    overlay.addEventListener('click', () => this.closeModal());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MachinesPage();
});