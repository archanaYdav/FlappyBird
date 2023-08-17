let birdImg;
let board;
let context;
let titleImg;
let playBtn;
let gameOvertitle;
let topPipeImg;
let bottomPipeImg;

// Board set up
let boardWidth = 360;  //the original img width is 360 and height is 640 px
let boardHeight = 640;

// title
let titleWidth = 2.2*89;
let titleHeight = 2.2*29;

// playbtn
let playBtnWidth = 2*52;
let playBtnHeight = 2*29;


// GameoverImg set up
let gameOvertitleWidth = 2 * 96;
let gameOvertitleHeight = 2 * 21;


// sound set up
let birdFlySound = new Audio("images/wing_sound.mp3");
let gameOverSound = new Audio("images/hit_sound.mp3");
let fallSound = new Audio("images/fallingdown.mp3");
let scoreSound = new Audio("images/score.mp3")


// Bird
let birdWidth = 34;  //the original bird width is 408 nd height is 288 so the ratio is widht/height = 17/12  *2/2
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 6;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

// for pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;


// game physics
let velocityX = -4;  //pipes are moving in the left so the x coordinate needs to be decreased
let velocityBirdY = 0;  // this is the velocity of jumping upwards for a bird
let gravityBird = 0.3;


// some initializations
let gameOver = false;
let score = 0;


// setting up the first title and playbtn page
window.onload = function () {

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    titleImg = new Image();
    titleImg.src = "images/title.png";
    titleImg.onload = function () {
        context.drawImage(titleImg, board.width / 4, board.height / 3, titleWidth, titleHeight);
    }

    playBtn = new Image();
    playBtn.src = "images/play_button.png";
    playBtn.onload = function () {
        context.drawImage(playBtn, board.width / 2.7, board.height / 1.5, playBtnWidth, playBtnHeight);
    }

    // Add event listener for clicking the canvas
    board.addEventListener("click", handleCanvasClick);

}


// THIS function is basically to add the event listener on the image thats drawn in the canvas
function handleCanvasClick(event) {
    const clickX = event.clientX - board.getBoundingClientRect().left;
    const clickY = event.clientY - board.getBoundingClientRect().top;

    const playBtnLeft = board.width / 2 - playBtnWidth / 2;
    const playBtnRight = playBtnLeft + playBtnWidth;
    const playBtnTop = board.height / 1.5;
    const playBtnBottom = playBtnTop + playBtnHeight;

    if (clickX >= playBtnLeft && clickX <= playBtnRight && clickY >= playBtnTop && clickY <= playBtnBottom) {
        startGame();
    }
}

// this is the main funtion where game starts 
function startGame() {

    board.removeEventListener("click", handleCanvasClick);
    context.clearRect(0, 0, board.width, board.height);

    // flappy bird draw
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    // flappy bird img 
    birdImg = new Image();
    birdImg.src = "images/flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    // top and bottom pipes
    topPipeImg = new Image();
    topPipeImg.src = "images/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "images/bottompipe.png";

    // frames are being updated and with that we are pushing the pipes 
    requestAnimationFrame(update);
    setInterval(placePipes, 1600);
    document.addEventListener("keydown", moverBird);
    document.addEventListener("click", moverBird);

}


// this will update the frame every second 
function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        gameOvertitle = new Image();
        gameOvertitle.src = "images/gameOver.png";
        gameOvertitle.onload = function () {
            context.drawImage(gameOvertitle, board.width / 4, board.height / 3, gameOvertitleWidth, gameOvertitleHeight);
        }
        return;  //you cannt put this below the code this is the only place where you can put this
    }

    // clear the frame every time
    context.clearRect(0, 0, board.width, board.height);

    // draw bird for every frame again and again
    velocityBirdY += gravityBird;
    bird.y = Math.max(bird.y + velocityBirdY, -10);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height || (bird.y < 0)) {
        gameOver = true;
        fallSound.play();
    }

    // console.log(pipeArray.length);
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because at the same time its crossing to pipes top and bottom pipes and thats the reason why we cant make it to 1
            scoreSound.play();
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            gameOverSound.play();
        }

    }

    // score updation
    context.fillStyle = "white";
    context.font = "35px sans-serif";
    context.fillText(score, board.width / 2, board.height / 8);

    // clear pipes 
    if (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();  // for removing the starting pipe when it crosses the frame
    }

}


// this is for pushing and placing the pipes
function placePipes() {

    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * pipeHeight / 2;
    let openingSpace = pipeHeight / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: pipeHeight + randomPipeY + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }

    pipeArray.push(bottomPipe);
}


// for movement of bird when the key presses
function moverBird(e) {

    // console.log(e);
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.pointerId == "1") {
        // jumping bird
        velocityBirdY = -5.5;
        birdFlySound.play();
        if (gameOver) {
            bird.y = birdY;
            score = 0;
            pipeArray = [];
            velocityX = -4;
            gameOver = false;
        }
    }
}

// for collision detection
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
