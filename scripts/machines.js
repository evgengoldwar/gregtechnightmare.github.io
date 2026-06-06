class MachinesPage {
  constructor() {
    this.grid = document.getElementById('machines-grid');
    this.modal = document.getElementById('machine-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalImages = document.getElementById('modal-images');
    this.modalDescription = document.getElementById('modal-description');
    this.machines = [];
    this.maxExtraImages = 20;

    this.init();
  }

  async init() {
    await this.loadMachines();
    this.renderCards();
    this.setupModal();
  }

  async loadMachines() {
    try {
      const response = await fetch('data/machines.json');
      const rawData = await response.json();

      this.machines = rawData.map(machine => ({
        name: machine.name,
        folder: machine.folder,
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

  renderCards() {
    this.grid.innerHTML = '';

    this.machines.forEach((machine, index) => {
      const card = document.createElement('div');
      card.className = 'machine-card';
      card.style.animationDelay = `${index * 0.1}s`;

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

    const allImages = [machine.image, ...machine.extraImages];

    allImages.forEach((imgSrc, index) => {
      const imgWrapper = document.createElement('div');
      imgWrapper.className = 'modal-image-wrapper';
      imgWrapper.style.display = 'none';
      imgWrapper.style.alignItems = 'center';
      imgWrapper.style.justifyContent = 'center';

      const img = document.createElement('img');
      img.alt = `${machine.name} image ${index + 1}`;
      img.className = 'modal-image';
      img.style.maxWidth = 'calc(100% - 20px)';
      img.style.maxHeight = 'calc(100% - 20px)';
      img.style.width = 'auto';
      img.style.height = 'auto';
      img.style.margin = '10px';
      img.style.objectFit = 'contain';
      img.style.alignSelf = 'center';
      img.style.justifySelf = 'center';

      img.onload = () => {
        imgWrapper.style.display = 'flex';
      };

      img.onerror = () => {
        if (index === 0) {
          img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%231a1a2e%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23555%22 x=%22200%22 y=%22150%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2218%22%3ENo Image%3C/text%3E%3C/svg%3E';
          imgWrapper.style.display = 'flex';
        }
      };

      img.src = imgSrc;
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