import { useEffect, useState } from "react";
import "./App.css";

const BOARD_SIZE = 25;
const CELL_SIZE = 20;

// --------------------------------
// Snake Starting Position
// --------------------------------

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

// --------------------------------
// Game Themes
// --------------------------------

const THEMES = [
  {
    board: "#9bbc0f",
    snake: "#306230",
    snakeHead: "#0f380f",
    border: "#0f380f",
    text: "#0f380f",
  },
  {
    board: "#87ceeb",
    snake: "#1565c0",
    snakeHead: "#0d47a1",
    border: "#0d47a1",
    text: "#062f5c",
  },
  {
    board: "#f6d365",
    snake: "#8e44ad",
    snakeHead: "#5b2c6f",
    border: "#5b2c6f",
    text: "#3b1a47",
  },
  {
    board: "#ffb6c1",
    snake: "#c0392b",
    snakeHead: "#7b241c",
    border: "#7b241c",
    text: "#641e16",
  },
  {
    board: "#98fb98",
    snake: "#196f3d",
    snakeHead: "#0b5345",
    border: "#0b5345",
    text: "#06402f",
  },
];

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);

  const [direction, setDirection] = useState("RIGHT");

  const [laddu, setLaddu] = useState({
    x: 18,
    y: 10,
  });

  // --------------------------------
  // Bonus Food
  // --------------------------------

  const [bonusFood, setBonusFood] = useState(null);

  const [score, setScore] = useState(0);

  const [highScore, setHighScore] = useState(0);

  const [gameStarted, setGameStarted] = useState(false);

  const [paused, setPaused] = useState(false);

  const [gameOver, setGameOver] = useState(false);

  // --------------------------------
  // Theme
  // --------------------------------

  const themeIndex = Math.floor(score / 500) % THEMES.length;

  const currentTheme = THEMES[themeIndex];

  // --------------------------------
  // Change Direction
  // --------------------------------

  const changeDirection = (newDirection) => {
    if (newDirection === "UP" && direction !== "DOWN") {
      setDirection("UP");
    }

    if (newDirection === "DOWN" && direction !== "UP") {
      setDirection("DOWN");
    }

    if (newDirection === "LEFT" && direction !== "RIGHT") {
      setDirection("LEFT");
    }

    if (newDirection === "RIGHT" && direction !== "LEFT") {
      setDirection("RIGHT");
    }
  };

  // --------------------------------
  // Keyboard Controls
  // --------------------------------

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      if (key === "arrowup" || key === "w") {
        changeDirection("UP");
      }

      if (key === "arrowdown" || key === "s") {
        changeDirection("DOWN");
      }

      if (key === "arrowleft" || key === "a") {
        changeDirection("LEFT");
      }

      if (key === "arrowright" || key === "d") {
        changeDirection("RIGHT");
      }

      // --------------------------------
      // Space = Pause
      // --------------------------------

      if (key === " ") {
        if (gameStarted && !gameOver) {
          setPaused((previous) => !previous);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [direction, gameStarted, gameOver]);

  // --------------------------------
  // Bonus Food Generator
  // --------------------------------

  useEffect(() => {
    if (!gameStarted || paused || gameOver) {
      return;
    }

    const bonusTimer = setInterval(() => {
      const randomChance = Math.random();

      // 20% chance to create bonus food
      if (randomChance < 0.2 && !bonusFood) {
        let newBonusFood;

        do {
          newBonusFood = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE),
          };
        } while (
          snake.some(
            (segment) =>
              segment.x === newBonusFood.x && segment.y === newBonusFood.y,
          ) ||
          (newBonusFood.x === laddu.x && newBonusFood.y === laddu.y)
        );

        setBonusFood(newBonusFood);
      }
    }, 5000);

    return () => clearInterval(bonusTimer);
  }, [gameStarted, paused, gameOver, bonusFood, snake, laddu]);

  // --------------------------------
  // Bonus Food Timer
  // --------------------------------

  useEffect(() => {
    if (!bonusFood) {
      return;
    }

    // Bonus food stays for 5 seconds
    const bonusTimeout = setTimeout(() => {
      setBonusFood(null);
    }, 5000);

    return () => clearTimeout(bonusTimeout);
  }, [bonusFood]);

  // --------------------------------
  // Snake Game Loop
  // --------------------------------

  useEffect(() => {
    if (!gameStarted || paused || gameOver) {
      return;
    }

    // --------------------------------
    // Snake Speed
    // --------------------------------
    // Starting speed = 200ms
    //
    // Snake becomes faster as
    // its length increases.
    //
    // Minimum speed = 70ms
    // --------------------------------

    const speed = Math.max(70, 200 - (snake.length - 3) * 10);

    const gameLoop = setInterval(() => {
      setSnake((currentSnake) => {
        const head = currentSnake[0];

        let newHead;

        // --------------------------------
        // Movement
        // --------------------------------

        if (direction === "RIGHT") {
          newHead = {
            x: head.x + 1,
            y: head.y,
          };
        } else if (direction === "LEFT") {
          newHead = {
            x: head.x - 1,
            y: head.y,
          };
        } else if (direction === "UP") {
          newHead = {
            x: head.x,
            y: head.y - 1,
          };
        } else {
          newHead = {
            x: head.x,
            y: head.y + 1,
          };
        }

        // --------------------------------
        // Wall Collision
        // --------------------------------

        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE
        ) {
          setGameOver(true);

          return currentSnake;
        }

        // --------------------------------
        // Self Collision
        // --------------------------------

        const hitSnake = currentSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y,
        );

        if (hitSnake) {
          setGameOver(true);

          return currentSnake;
        }

        // --------------------------------
        // Normal Laddu Collision
        // --------------------------------

        const ateLaddu = newHead.x === laddu.x && newHead.y === laddu.y;

        // --------------------------------
        // Bonus Food Collision
        // --------------------------------

        const ateBonusFood =
          bonusFood && newHead.x === bonusFood.x && newHead.y === bonusFood.y;

        // --------------------------------
        // Bonus Food
        // --------------------------------

        if (ateBonusFood) {
          // Bonus food = 50 points
          const newScore = score + 50;

          setScore(newScore);

          setHighScore((currentHighScore) =>
            Math.max(currentHighScore, newScore),
          );

          // Remove bonus food
          setBonusFood(null);

          // Grow snake
          return [newHead, ...currentSnake];
        }

        // --------------------------------
        // Normal Laddu
        // --------------------------------

        if (ateLaddu) {
          // Normal food = 10 points
          const newScore = score + 10;

          setScore(newScore);

          setHighScore((currentHighScore) =>
            Math.max(currentHighScore, newScore),
          );

          // --------------------------------
          // Generate New Laddu
          // --------------------------------

          let newLaddu;

          do {
            newLaddu = {
              x: Math.floor(Math.random() * BOARD_SIZE),
              y: Math.floor(Math.random() * BOARD_SIZE),
            };
          } while (
            currentSnake.some(
              (segment) => segment.x === newLaddu.x && segment.y === newLaddu.y,
            )
          );

          setLaddu(newLaddu);

          // Grow snake
          return [newHead, ...currentSnake];
        }

        // --------------------------------
        // Normal Movement
        // --------------------------------

        return [newHead, ...currentSnake.slice(0, -1)];
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [
    direction,
    laddu,
    bonusFood,
    gameStarted,
    paused,
    gameOver,
    score,
    snake.length,
  ]);

  // --------------------------------
  // Start Game
  // --------------------------------

  const startGame = () => {
    setGameStarted(true);
    setPaused(false);
  };

  // --------------------------------
  // Pause Game
  // --------------------------------

  const pauseGame = () => {
    setPaused((previous) => !previous);
  };

  // --------------------------------
  // Restart Game
  // --------------------------------

  const restartGame = () => {
    setSnake(INITIAL_SNAKE);

    setDirection("RIGHT");

    setLaddu({
      x: 18,
      y: 10,
    });

    setBonusFood(null);

    setScore(0);

    setGameOver(false);

    setGameStarted(true);

    setPaused(false);
  };

  return (
    <div
      className="game-container"
      style={{
        "--board-color": currentTheme.board,
        "--snake-color": currentTheme.snake,
        "--snake-head-color": currentTheme.snakeHead,
        "--border-color": currentTheme.border,
        "--text-color": currentTheme.text,
      }}
    >
      {/* --------------------------------
          Title
      -------------------------------- */}

      <h1>🐍 SNAKE GAME</h1>

      {/* --------------------------------
          Score
      -------------------------------- */}

      <div className="score-container">
        <div>
          SCORE
          <span>{score}</span>
        </div>

        <div>
          HIGH SCORE
          <span>{highScore}</span>
        </div>

        <div>
          LEVEL
          <span>{Math.floor(score / 500) + 1}</span>
        </div>
      </div>

      {/* --------------------------------
          Game Board
      -------------------------------- */}

      <div className="game-board">
        {/* Snake */}

        {snake.map((segment, index) => (
          <div
            key={index}
            className={`snake-segment ${index === 0 ? "snake-head" : ""}`}
            style={{
              left: `${segment.x * CELL_SIZE}px`,
              top: `${segment.y * CELL_SIZE}px`,
            }}
          >
            {index === 0 && "●"}
          </div>
        ))}

        {/* Normal Laddu */}

        <div
          className="laddu"
          style={{
            left: `${laddu.x * CELL_SIZE}px`,
            top: `${laddu.y * CELL_SIZE}px`,
          }}
        >
          🟠
        </div>

        {/* Bonus Food */}

        {bonusFood && (
          <div
            className="bonus-food"
            style={{
              left: `${bonusFood.x * CELL_SIZE}px`,
              top: `${bonusFood.y * CELL_SIZE}px`,
            }}
          >
            ⭐
          </div>
        )}

        {/* Start Message */}

        {!gameStarted && (
          <div className="overlay">
            <h2>READY?</h2>
            <p>Eat the Laddu 🍬</p>
          </div>
        )}

        {/* Pause Message */}

        {paused && !gameOver && (
          <div className="overlay">
            <h2>PAUSED</h2>
            <p>Press Resume to continue</p>
          </div>
        )}

        {/* Game Over */}

        {gameOver && (
          <div className="overlay">
            <h2>GAME OVER</h2>
            <p>Score: {score}</p>
          </div>
        )}
      </div>

      {/* --------------------------------
          Game Controls
      -------------------------------- */}

      <div className="game-controls">
        {!gameStarted && <button onClick={startGame}>▶ START</button>}

        {gameStarted && !gameOver && (
          <button onClick={pauseGame}>{paused ? "▶ RESUME" : "⏸ PAUSE"}</button>
        )}

        <button onClick={restartGame}>🔄 RESTART</button>
      </div>

      {/* --------------------------------
          Direction Controls
      -------------------------------- */}

      <div className="direction-controls">
        <button
          className="direction-btn up"
          onClick={() => changeDirection("UP")}
        >
          ↑
        </button>

        <div className="middle-controls">
          <button
            className="direction-btn"
            onClick={() => changeDirection("LEFT")}
          >
            ←
          </button>

          <button
            className="direction-btn"
            onClick={() => changeDirection("DOWN")}
          >
            ↓
          </button>

          <button
            className="direction-btn"
            onClick={() => changeDirection("RIGHT")}
          >
            →
          </button>
        </div>
      </div>

      {/* --------------------------------
          Instructions
      -------------------------------- */}
      <div className="instructions">
        <p>⬆️ ⬇️ ⬅️ ➡️</p>
        <p>Use Arrow Keys or W A S D</p>
        <p>SPACE = Pause</p>
      </div>

      <div className="instructions">
        <p>🟠 Normal Food = 10 Points</p>

        <p>⭐ Bonus Food = 50 Points</p>

        <p>🎨 Theme Changes Every 500 Points</p>

        <p>Keyboard: Arrow Keys / W A S D</p>

        <p>SPACE = Pause</p>
      </div>
    </div>
  );
}

export default App;
