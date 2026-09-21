const game = document.getElementById('game');
const player = document.getElementById('player');
const obstacleCanvas = document.getElementById('obstacleCanvas');
const context = obstacleCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const bestScoreSpan = document.getElementById('bestScoreSpan');
const gameOverPanel = document.getElementById('gameOver');
const restartButton = document.getElementById('restartButton');
const checkpoint = document.getElementById('checkpoint');
const checkpointText = document.getElementById('checkpointText');

const music = document.getElementById('background-music');
const jumpSound = new Audio('assets/jumped.wav');
const sfxHitSound = new Audio('assets/sfx_hit.wav');
const checkpointSound = new Audio('assets/checkpoint.wav');

const groundOffset = 72;
const playerSize = 46;
const gravity = 0.7;
const jumpPower = 15;
const baseObstacleSpeed = 6;
const maxObstacleSpeed = 11;
const speedIncrement = 0.5;
const obstacleSpacing = 504;
const flyingUnlockScore = 200;
const flyingChance = 0.35;
const flyingHeights = [58, 96, 130];
const obstacleUnit = 36;
const obstacleLineWidth = 10;
const bestScoreStorageKey = 'jumping-game-best-score';
const restartKeyDelay = 400;

// Glyph coordinates are in units of l (one grid cell), scaled by obstacleUnit when drawn.
// y grows downwards: a glyph's lowest edge (y = l) rests at its base (the ground for
// runners, a flying height for gliders), and taller glyphs rise above it with
// negative y (WA..WU reach -5*l/4, NA..NU reach -l).
const l = 1;

// Glyphs that run along the ground.
const groundObstacleShapes = [
	// WA, WE, WI, WO, WU (height 2.25l)
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, -l/4], [l, -l/4], [l, -3*l/4], [l/2, -3*l/4], [l/2, -5*l/4], [l, -5*l/4], [3*l/2, -5*l/4], [l, -3*l/4], [3*l/2, -3*l/4], [3*l/2, -l/4], [2*l, -l/4]]],
	[
		[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, -l/4], [l, -l/4], [l, -3*l/4], [l/2, -3*l/4], [l/2, -5*l/4], [l, -5*l/4], [3*l/2, -5*l/4], [3*l/2, -l/4], [2*l, -l/4]],
		[[3*l/2, -3*l/4], [2*l, -3*l/4]]
	],
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, -l/4], [l, -l/4], [l, -3*l/4], [l/2, -3*l/4], [l/2, -5*l/4], [l, -5*l/4], [3*l/2, -5*l/4], [3*l/2, -l/4]]],
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, -l/4], [l, -l/4], [l, -3*l/4], [l/2, -3*l/4], [l/2, -5*l/4], [l, -5*l/4], [3*l/2, -5*l/4], [3*l/2, -l/4], [l, -3*l/4], [2*l, -3*l/4]]],
	[
		[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, -l/4], [l, -l/4], [l, -3*l/4], [l/2, -3*l/4], [l/2, -5*l/4], [l, -5*l/4], [3*l/2, -5*l/4], [3*l/2, -l/4]],
		[[3*l/2, -5*l/4], [2*l, -5*l/4], [2*l, -l/4]]
	],

	// NA, NE, NI, NO, NU (height 2l)
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, 0], [l, 0], [l, -l/2], [l/2, -l/2], [l/2, -l], [l, -l], [3*l/2, -l], [l, -l/2], [3*l/2, -l/2], [3*l/2, 0], [2*l, 0]]],
	[
		[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, 0], [l, 0], [l, -l/2], [l/2, -l/2], [l/2, -l], [l, -l], [3*l/2, -l], [3*l/2, 0], [2*l, 0]],
		[[3*l/2, -l/2], [2*l, -l/2]]
	],
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, 0], [l, 0], [l, -l/2], [l/2, -l/2], [l/2, -l], [l, -l], [3*l/2, -l], [3*l/2, 0]]],
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, 0], [l, 0], [l, -l/2], [l/2, -l/2], [l/2, -l], [l, -l], [3*l/2, -l], [3*l/2, 0], [l, -l/2], [2*l, -l/2]]],
	[
		[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l/2, 0], [l, 0], [l, -l/2], [l/2, -l/2], [l/2, -l], [l, -l], [3*l/2, -l], [3*l/2, 0]],
		[[3*l/2, -l], [2*l, -l], [2*l, 0]]
	]
];

// A, E, I, O, U (height l). They never run on the ground: once the score reaches
// flyingUnlockScore they glide in overhead instead, at heights a standing player
// slides under safely but a jumping player is struck by.
const flyingObstacleShapes = [
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l, 0], [l/2, l/2], [l, l/2], [l, l], [3*l/2, l]]],
	[
		[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l, 0], [l, l], [3*l/2, l]],
		[[l, l/2], [3*l/2, l/2]]
	],
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l, 0], [l, l]]],
	[[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l, 0], [l, l], [l/2, l/2], [3*l/2, l/2]]],
	[
		[[0, l], [l/2, l], [l/2, l/2], [0, l/2], [0, 0], [l/2, 0], [l, 0], [l, l]],
		[[l, 0], [3*l/2, 0], [3*l/2, l]]
	]
];

let obstacleSpeed = baseObstacleSpeed;
let playerBottom = groundOffset;
let playerVelocity = 0;
let isJumping = false;
let isGameOver = false;
let score = 0;
let bestScore = loadBestScore();
let obstacles = [];
let lastObstacleTime = 0;
let animationId = null;
let checkpointTimeoutId = null;
let gameOverAt = 0;

function createObstacle() {
	const flying = score >= flyingUnlockScore && Math.random() < flyingChance;
	const shapes = flying ? flyingObstacleShapes : groundObstacleShapes;
	const shape = shapes[Math.floor(Math.random() * shapes.length)];

	const obstacle = {
		shape,
		bounds: getShapeBounds(shape),
		left: game.clientWidth,
		scored: false
	};

	if (flying) {
		obstacle.flyHeight = flyingHeights[Math.floor(Math.random() * flyingHeights.length)];
	}

	obstacles.push(obstacle);
}

function getShapeBounds(shape) {
	const points = shape.flat();

	return {
		minX: Math.min(...points.map((point) => point[0])),
		maxX: Math.max(...points.map((point) => point[0])),
		minY: Math.min(...points.map((point) => point[1])),
		maxY: Math.max(...points.map((point) => point[1]))
	};
}

function getObstacleBaseY(obstacle) {
	const groundY = game.clientHeight - groundOffset;

	return groundY - (obstacle.flyHeight || 0);
}

function resizeCanvas() {
	const width = game.clientWidth;
	const height = game.clientHeight;
	const pixelRatio = window.devicePixelRatio || 1;

	obstacleCanvas.width = width * pixelRatio;
	obstacleCanvas.height = height * pixelRatio;
	obstacleCanvas.style.width = `${width}px`;
	obstacleCanvas.style.height = `${height}px`;
	context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function drawObstacles() {
	context.clearRect(0, 0, game.clientWidth, game.clientHeight);
	context.lineWidth = obstacleLineWidth;
	context.lineCap = 'round';
	context.lineJoin = 'round';
	context.strokeStyle = '#238653';

	obstacles.forEach((obstacle) => {
		const baseY = getObstacleBaseY(obstacle);

		obstacle.shape.forEach((line) => {
			context.beginPath();

			line.forEach(([x, y], index) => {
				const drawX = obstacle.left + x * obstacleUnit;
				const drawY = baseY - (obstacle.bounds.maxY - y) * obstacleUnit;

				if (index === 0) {
					context.moveTo(drawX, drawY);
				} else {
					context.lineTo(drawX, drawY);
				}
			});

			context.stroke();
		});
	});
}

function updatePlayer() {
	playerBottom += playerVelocity;
	playerVelocity -= gravity;

	if (playerBottom <= groundOffset) {
		playerBottom = groundOffset;
		playerVelocity = 0;
		isJumping = false;
	}

	player.style.bottom = `${playerBottom}px`;
}

function updateObstacles() {
	obstacles.forEach((obstacle) => {
		obstacle.left -= obstacleSpeed;
		const obstacleHitBox = getObstacleHitBox(obstacle);

		if (!obstacle.scored && obstacleHitBox.right < player.offsetLeft) {
			obstacle.scored = true;
      score += 10;
      updateBestScore();
      if (score % 100 === 0) {
        showCheckpoint();
        checkpointSound.play()
        increaseSpeed();
      }
      scoreElement.textContent = score;
		}
	});

	obstacles = obstacles.filter((obstacle) => getObstacleHitBox(obstacle).right > 0);
}

function getObstacleHitBox(obstacle) {
	const baseY = getObstacleBaseY(obstacle);
	const padding = obstacleLineWidth / 2;

	return {
		left: obstacle.left + obstacle.bounds.minX * obstacleUnit - padding,
		right: obstacle.left + obstacle.bounds.maxX * obstacleUnit + padding,
		top: baseY - (obstacle.bounds.maxY - obstacle.bounds.minY) * obstacleUnit - padding,
		bottom: baseY + padding
	};
}

function getPlayerHitBox() {
	const bottom = game.clientHeight - playerBottom;

	return {
		left: player.offsetLeft,
		right: player.offsetLeft + playerSize,
		top: bottom - playerSize,
		bottom
	};
}

function boxesOverlap(first, second) {
	return first.left < second.right &&
		first.right > second.left &&
		first.top < second.bottom &&
		first.bottom > second.top;
}

function checkCollisions() {
	const playerHitBox = getPlayerHitBox();

	return obstacles.some((obstacle) => boxesOverlap(playerHitBox, getObstacleHitBox(obstacle)));
}

function endGame() {
	isGameOver = true;
	gameOverAt = performance.now();
	updateBestScore();
	finalScoreElement.textContent = score;
	gameOverPanel.classList.remove('hidden');
	cancelAnimationFrame(animationId);
}

function loadBestScore() {
	try {
		return Number(window.localStorage.getItem(bestScoreStorageKey)) || 0;
	} catch {
		return 0;
	}
}

function updateBestScore() {
	if (score <= bestScore) {
		return;
	}

	bestScore = score;
	bestScoreSpan.textContent = bestScore;

	try {
		window.localStorage.setItem(bestScoreStorageKey, String(bestScore));
	} catch {
	}
}

function increaseSpeed() {
	if (obstacleSpeed >= maxObstacleSpeed) {
		return;
	}

	obstacleSpeed = Math.min(maxObstacleSpeed, obstacleSpeed + speedIncrement);
}

function showCheckpoint() {
  checkpointText.textContent = `Checkpoint ${score}!`;
  checkpoint.classList.remove('show');
  void checkpoint.offsetWidth;
  checkpoint.classList.add('show');

  clearTimeout(checkpointTimeoutId);
  checkpointTimeoutId = setTimeout(() => {
    checkpoint.classList.remove('show');
  }, 1800);
}

function restartFromGameOver() {
	// Ignore jump-key mashing for a moment after death so an accidental press
	// doesn't skip the game-over screen before the score is seen.
	if (performance.now() - gameOverAt < restartKeyDelay) {
		return;
	}

	resetGame();
}

function startMusic() {
	music.play().catch(() => {
		// Browsers block autoplay until the first user gesture; start the music then.
		const startOnInteraction = () => {
			music.play().catch(() => {});
			document.removeEventListener('keydown', startOnInteraction);
			document.removeEventListener('pointerdown', startOnInteraction);
		};

		document.addEventListener('keydown', startOnInteraction);
		document.addEventListener('pointerdown', startOnInteraction);
	});
}

function resetGame() {
	obstacles = [];
	obstacleSpeed = baseObstacleSpeed;
	playerBottom = groundOffset;
	playerVelocity = 0;
	isJumping = false;
	isGameOver = false;
	score = 0;
  lastObstacleTime = 0;
  jumpSound.loop = false;
  sfxHitSound.loop = false;
  checkpointSound.loop = false;
  clearTimeout(checkpointTimeoutId);
  checkpoint.classList.remove('show');
	scoreElement.textContent = score;
	player.style.bottom = `${playerBottom}px`;
	gameOverPanel.classList.add('hidden');
	resizeCanvas();
	drawObstacles();
    game.focus();
    startMusic();

	animationId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
	if (isGameOver) {
		return;
	}

	const spawnInterval = obstacleSpacing / obstacleSpeed * 1000 / 60;

	if (!lastObstacleTime || timestamp - lastObstacleTime > spawnInterval) {
		createObstacle();
		lastObstacleTime = timestamp;
	}

	updatePlayer();
	updateObstacles();
	drawObstacles();

  if (checkCollisions()) {
    sfxHitSound.play();
    endGame();
    const score = loadBestScore();
		bestScoreSpan.textContent = score
    return;
	}

	animationId = requestAnimationFrame(gameLoop);
}

function jump() {
	if (isJumping || isGameOver) {
		return;
	}

	isJumping = true;
    playerVelocity = jumpPower;
    jumpSound.play()
}

document.addEventListener('keydown', (event) => {
	if (event.code === 'Space' || event.code === 'ArrowUp') {
		event.preventDefault();

		if (isGameOver) {
			restartFromGameOver();
			return;
		}

		jump();
	}
});

restartButton.addEventListener('click', resetGame);
window.addEventListener('resize', resizeCanvas);

resetGame();
