let img;
let targetPoints = [];
let particles = [];
let threshold = 50; // Brightness threshold

function preload() {
  img = loadImage('assets/My_Logo.png');
}

function setup() {
  createCanvas(1124, 675);
  imageMode(CENTER);
  img.resize(1024, 0);
  loadTargetPoints();
  initParticles();
}

function draw() {
  background(255);

  for (let p of particles) {
    p.seek();
    p.avoidMouse();
    p.update();
    p.show();
  }
}

function mousePressed() {
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];

    // Check if particle is close to any target point
    for (let t of targetPoints) {
      let d = dist(p.pos.x, p.pos.y, t.x, t.y);

      if (d < 10) { // Only reset particles close to text
        particles[i] = new Particle(random(width), random(height), t.copy());
        break;
      }
    }
  }
}

function loadTargetPoints() {
  img.loadPixels();
  targetPoints = [];

  for (let y = 0; y < img.height; y += 4) {
    for (let x = 0; x < img.width; x += 4) {
      let index = (x + y * img.width) * 4;
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      let brightness = (r + g + b) / 3;

      if (brightness < threshold) {
        let canvasX = map(x, 0, img.width, width / 2 - img.width / 2, width / 2 + img.width / 2);
        let canvasY = map(y, 0, img.height, height / 2 - img.height / 2, height / 2 + img.height / 2);
        targetPoints.push(createVector(canvasX, canvasY));
      }
    }
  }
}

function initParticles() {
  particles = [];
  for (let target of targetPoints) {
    let p = new Particle(random(width), random(height), target.copy());
    particles.push(p);
  }
}

class Particle {
  constructor(x, y, target) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.target = target;
    this.maxSpeed = 20; // Increased speed
    this.maxForce = 1.2; // Increased steering force
  }

  applyForce(force) {
    this.acc.add(force);
  }

  seek() {
    let desired = p5.Vector.sub(this.target, this.pos);
    let d = desired.mag();
    let speed = this.maxSpeed;

    if (d < 80) { // Smooth slowdown only very close
      speed = map(d, 0, 80, 0, this.maxSpeed);
    }

    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  avoidMouse() {
    let mouse = createVector(mouseX, mouseY);
    let dir = p5.Vector.sub(this.pos, mouse);
    let d = dir.mag();
    let radius = 80;

    if (d < radius) {
      dir.setMag(map(d, 0, radius, 8, 0));
      dir.rotate(random(-PI / 2, PI / 2));
      dir.add(p5.Vector.random2D().mult(0.8));
      this.applyForce(dir);
    }
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Bounce off edges
    if (this.pos.x < 0) {
      this.pos.x = 0;
      this.vel.x *= -1;
    } else if (this.pos.x > width) {
      this.pos.x = width;
      this.vel.x *= -1;
    }

    if (this.pos.y < 0) {
      this.pos.y = 0;
      this.vel.y *= -1;
    } else if (this.pos.y > height) {
      this.pos.y = height;
      this.vel.y *= -1;
    }
  }

  show() {
    noStroke(1);
    fill("#000000");
    let size = 2.2;
    rectMode(CENTER);
    rect(this.pos.x, this.pos.y, size, size);
  }
}
