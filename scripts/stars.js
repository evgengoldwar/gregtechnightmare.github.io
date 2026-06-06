class Starfield {
  constructor() {
    this.svg = document.getElementById('stars-canvas');
    this.namespace = 'http://www.w3.org/2000/svg';
    this.stars = [];
    this.activeStars = 0;
    this.minStars = 80;
    this.maxStars = 200;
    this.spawnRate = 200;
    this.init();
  }

  init() {
    this.createInitialStars();
    this.startSpawning();
  }

  createInitialStars() {
    const initialCount = Math.floor(Math.random() * 40) + 80;
    for (let i = 0; i < initialCount; i++) {
      this.spawnStar();
    }
  }

  spawnStar() {
    if (this.activeStars >= this.maxStars) return;

    const circle = document.createElementNS(this.namespace, 'circle');

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const radius = Math.random() * 2 + 0.5;

    const brightness = Math.random();
    let baseOpacity, lifeTime;

    if (brightness < 0.3) {
      baseOpacity = Math.random() * 0.2 + 0.1;
      lifeTime = Math.random() * 2000 + 1000;
    } else if (brightness < 0.7) {
      baseOpacity = Math.random() * 0.3 + 0.3;
      lifeTime = Math.random() * 4000 + 3000;
    } else {
      baseOpacity = Math.random() * 0.3 + 0.7;
      lifeTime = Math.random() * 6000 + 5000;
    }

    circle.setAttribute('cx', `${x}%`);
    circle.setAttribute('cy', `${y}%`);
    circle.setAttribute('r', radius);
    const colors = [
      '#ffffff',
      '#ffffff',
      '#ffffff',
      '#ffffff',
      '#aaccff',
      '#ffeedd',
      '#ffffcc',
      '#ffcccc',
      '#ccddff'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    circle.setAttribute('fill', color);
    circle.setAttribute('opacity', '0');

    this.svg.appendChild(circle);

    const star = {
      element: circle,
      baseOpacity: baseOpacity,
      currentOpacity: 0,
      lifeTime: lifeTime,
      birthTime: Date.now(),
      fadeInDuration: 500 + Math.random() * 500,
      fadeOutDuration: 800 + Math.random() * 700,
      twinkleOffset: Math.random() * Math.PI * 2,
      state: 'fadingIn'
    };

    this.stars.push(star);
    this.activeStars++;
    return star;
  }

  killStar(star) {
    if (star.state === 'dead' || star.state === 'fadingOut') return;

    star.state = 'fadingOut';
    star.deathTime = Date.now();
    star.fadeOutStartOpacity = star.currentOpacity;
  }

  removeStar(star) {
    if (star.element.parentNode) {
      star.element.parentNode.removeChild(star.element);
    }
    const index = this.stars.indexOf(star);
    if (index > -1) {
      this.stars.splice(index, 1);
    }
    this.activeStars--;
  }

  startSpawning() {
    setInterval(() => {
      if (this.activeStars < this.minStars) {
        const toSpawn = this.minStars - this.activeStars;
        for (let i = 0; i < Math.min(toSpawn, 3); i++) {
          this.spawnStar();
        }
      } else if (this.activeStars < this.maxStars && Math.random() < 0.2) {
        this.spawnStar();
      }
    }, this.spawnRate);

    this.updateLoop();
  }

  updateLoop() {
    const animate = () => {
      const now = Date.now();

      for (let i = this.stars.length - 1; i >= 0; i--) {
        const star = this.stars[i];
        const age = now - star.birthTime;

        switch (star.state) {
          case 'fadingIn':
            const fadeInProgress = age / star.fadeInDuration;
            star.currentOpacity = star.baseOpacity * Math.min(1, fadeInProgress);

            if (fadeInProgress >= 1) {
              star.currentOpacity = star.baseOpacity;
              star.state = 'alive';
            }
            break;

          case 'alive':
            const twinkle = Math.sin(now * 0.003 + star.twinkleOffset) * 0.15;
            star.currentOpacity = star.baseOpacity + twinkle;
            star.currentOpacity = Math.max(0.03, Math.min(1, star.currentOpacity));

            if (age >= star.lifeTime) {
              this.killStar(star);
            }
            break;

          case 'fadingOut':
            const deathAge = now - star.deathTime;
            const fadeOutProgress = deathAge / star.fadeOutDuration;
            star.currentOpacity = star.fadeOutStartOpacity * (1 - Math.min(1, fadeOutProgress));

            if (fadeOutProgress >= 1 || star.currentOpacity <= 0.01) {
              star.currentOpacity = 0;
              star.state = 'dead';
              this.removeStar(star);

              if (this.activeStars < this.maxStars && Math.random() < 0.7) {
                setTimeout(() => this.spawnStar(), Math.random() * 1000);
              }
            }
            break;
        }

        if (star.state !== 'dead' && star.element.parentNode) {
          star.element.setAttribute('opacity', Math.max(0, Math.min(1, star.currentOpacity)));
        }
      }

      if (this.activeStars < this.minStars - 10) {
        this.spawnStar();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Starfield();
});