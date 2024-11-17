const yourField = document.getElementById("your-field");
const enemyField = document.getElementById("enemy-field");
const shipModelsContainer = document.getElementById("ship-models");
const startBtn = document.getElementById("start-game");
const randomGenBtn = document.getElementById("random-generation");
const clearFieldBtn = document.getElementById("clear-field");
const gameWindow = document.getElementById("game-window");


const exitBtn = document.createElement("button");

exitBtn.textContent = "Exit";
exitBtn.style.display = "none";
exitBtn.style.marginBottom = "20px";
exitBtn.addEventListener("click", resetGame);
gameWindow.appendChild(exitBtn);

const letters = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const shipModels = [
    { size: 4, id: 'ship-4a' },
    { size: 3, id: 'ship-3a' }, { size: 3, id: 'ship-3b' },
    { size: 2, id: 'ship-2a' }, { size: 2, id: 'ship-2b' }, { size: 2, id: 'ship-2c' },
    { size: 1, id: 'ship-1a' }, { size: 1, id: 'ship-1b' }, { size: 1, id: 'ship-1c' }, { size: 1, id: 'ship-1d' }
];

// Заповнюємо ігрове поле клітинками
for (let row = 0; row < 11; row++) {
    for (let col = 0; col < 11; col++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        if (row === 0 && col > 0) {
            cell.textContent = letters[col];
            cell.classList.add("letters-numbers");
        } else if (col === 0 && row > 0) {
            cell.textContent = row;
            cell.classList.add("letters-numbers");
        } else if (row === 0 && col === 0) {
            cell.classList.add("no-style-cell");
        } else if (row > 0 && col > 0) {
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.classList.add("playable");
            cell.addEventListener("click", () => {
                cell.classList.toggle("marked");
                console.log(`${row}, ${col}`);
            });
        }

        yourField.appendChild(cell);
    }
}
function createShipModels() {
    // Спочатку очищаємо контейнер від усіх наявних кораблів
    shipModelsContainer.innerHTML = "";

    // Додаємо кожну модель корабля у контейнер
    shipModels.forEach(ship => {
        const shipDiv = document.createElement("div");
        shipDiv.classList.add("ship-model");
        shipDiv.setAttribute("draggable", "true");
        shipDiv.id = ship.id;
        shipDiv.dataset.size = ship.size;
        shipDiv.dataset.orientation = "horizontal";

        // Додаємо потрібну кількість клітинок до кожного корабля
        for (let i = 0; i < ship.size; i++) {
            const shipCell = document.createElement("div");
            shipCell.classList.add("cell", "ship-cell");
            shipDiv.appendChild(shipCell);
        }

        // Додаємо корабель у контейнер
        shipModelsContainer.appendChild(shipDiv);

        // Подія для перетягування корабля
        shipDiv.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("ship-id", shipDiv.id);
            
        });

        // Подія для обертання корабля
        shipDiv.addEventListener("dblclick", () => {
            if (shipDiv.dataset.orientation === "horizontal") {
                shipDiv.dataset.orientation = "vertical";
                shipDiv.classList.add("rotated");
            } else {
                shipDiv.dataset.orientation = "horizontal";
                shipDiv.classList.remove("rotated");
            }
        });
    });
}
createShipModels();


function clearField() {
    // Очищуємо клітинки поля від кораблів
    const occupiedCells = yourField.querySelectorAll(".occupied");
    occupiedCells.forEach(cell => {
        cell.classList.remove("occupied");
        cell.style.backgroundColor = ""; // Повертаємо стандартний колір
    });
     // Очищуємо клітинки поля від ходів
     const shotCells = yourField.querySelectorAll(".shot");
     shotCells.forEach(cell => {
         cell.classList.remove("shot");
         cell.innerHTML = ""; // Видаляємо позначки
         cell.style.color = ""; // Відновлюємо початковий колір
         cell.style.fontSize = "";
         cell.style.textAlign = "";
     });

    // Повертаємо всі кораблі у контейнер вибору
    shipModels.forEach(ship => {
        const shipElement = document.getElementById(ship.id);
        if (shipElement && shipElement.parentNode !== shipModelsContainer) {
            shipModelsContainer.appendChild(shipElement);
        }
    });
}

function startGame() {
    // Видаляємо кнопки
    startBtn.style.display = "none";
    randomGenBtn.style.display = "none";
    clearFieldBtn.style.display = "none";
    
    // Додаємо кнопку "Вихід"
    gameWindow.appendChild(exitBtn);
    exitBtn.style.display = "block";
}

// Функція скидання гри до початкового стану
function resetGame() {
    // Видаляємо поле противника і всі клітинки
    enemyField.innerHTML = "";
    enemyField.style.display = "none";
    
    // Очищуємо поле гравця
    clearField();
    createShipModels();

    // Повертаємо кнопки
    startBtn.style.display = "inline-block";
    randomGenBtn.style.display = "inline-block";
    clearFieldBtn.style.display = "inline-block";

    // Ховаємо кнопку "Вихід"
    exitBtn.style.display = "none";

    // Відновлюємо можливість взаємодії з полями
    enemyField.style.pointerEvents = "auto";
    yourField.style.pointerEvents = "auto";

    // Перезапускаємо гру
    isPlayerTurn = true;
}


// Додаємо події для перетягування і розміщення кораблів
yourField.addEventListener("dragover", (e) => e.preventDefault());

yourField.addEventListener("drop", (e) => {
    e.preventDefault();
    const shipId = e.dataTransfer.getData("ship-id");
    const ship = document.getElementById(shipId);

    if (ship && e.target.classList.contains("playable")) {
        const cell = e.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        let validPlacement = true;
        let cellsToOccupy = [];

        for (let i = 0; i < ship.dataset.size; i++) {
            const currentRow = row + (ship.dataset.orientation === 'vertical' ? i : 0);
            const currentCol = col + (ship.dataset.orientation === 'horizontal' ? i : 0);

            const targetCell = document.querySelector(
                `.cell[data-row="${currentRow}"][data-col="${currentCol}"]`
            );

            // Перевірка клітинки і навколишніх клітинок
            if (!targetCell || !targetCell.classList.contains("playable") || targetCell.hasChildNodes() || !checkSurroundingCellsEmpty(yourField, currentRow, currentCol)) {
                validPlacement = false;
                break;
            }
            cellsToOccupy.push(targetCell);
        }

        if (validPlacement) {
            cellsToOccupy.forEach(cell => {
                cell.classList.add("occupied");
                cell.style.backgroundColor = "#b4b4b4";
            });
            ship.remove(); // Видаляємо корабель із контейнера вибору
        }
    }
});


// Додаємо обробник подій для перевертання кораблів на полі
yourField.addEventListener("dblclick", (e) => {
    if (e.target.classList.contains("occupied")) {
        const ship = e.target.querySelector('.ship-model');
        if (ship) {
            // Перевертаємо корабель
            if (ship.dataset.orientation === "horizontal") {
                ship.dataset.orientation = "vertical";
                ship.classList.add("rotated");
            } else {
                ship.dataset.orientation = "horizontal";
                ship.classList.remove("rotated");
            }

            // Перевіряємо нову позицію для корабля
            const row = parseInt(ship.parentElement.dataset.row);
            const col = parseInt(ship.parentElement.dataset.col);

            let validPlacement = true;
            let cellsToOccupy = [];

            for (let i = 0; i < ship.dataset.size; i++) {
                const targetCell = document.querySelector(
                    `.cell[data-row="${row + (ship.dataset.orientation === 'vertical' ? i : 0)}"][data-col="${col + (ship.dataset.orientation === 'horizontal' ? i : 0)}"]`
                );
                if (!targetCell || !targetCell.classList.contains("playable") || targetCell.hasChildNodes()) {
                    validPlacement = false;
                    break;
                }
                cellsToOccupy.push(targetCell);
            }

            // Якщо нова позиція валідна, перемістіть корабель
            if (validPlacement) {
                cellsToOccupy.forEach(cell => {
                    cell.classList.add("occupied");
                    cell.style.backgroundColor = "#b4b4b4"; 
                });
                ship.remove(); // видаляємо старий корабель
                cellsToOccupy[0].appendChild(ship); // додаємо корабель до нової клітинки
            } else {
                // Встановлюємо назад на попереднє місце
                e.target.appendChild(ship);
            }
        }
    }
});

// функція рандомного розміщення корабликів
function placeShipsRandomly(field, ships) {
    ships.forEach(ship => {
        let placed = false;
        
        while (!placed) {
            const orientation = Math.random() > 0.5 ? "horizontal" : "vertical";
            const startRow = Math.floor(Math.random() * (11 - (orientation === "vertical" ? ship.size : 1))) + 1;
            const startCol = Math.floor(Math.random() * (11 - (orientation === "horizontal" ? ship.size : 1))) + 1;

            let validPlacement = true;
            let cellsToOccupy = [];

            for (let i = 0; i < ship.size; i++) {
                const currentRow = startRow + (orientation === 'vertical' ? i : 0);
                const currentCol = startCol + (orientation === 'horizontal' ? i : 0);

                const targetCell = field.querySelector(
                    `.cell[data-row="${currentRow}"][data-col="${currentCol}"]`
                );
                
                // Перевірка, чи порожня цільова клітинка та сусідні клітинки
                if (!targetCell || targetCell.classList.contains("occupied") || !checkSurroundingCellsEmpty(field, currentRow, currentCol)) {
                    validPlacement = false;
                    break;
                }
                cellsToOccupy.push(targetCell);
            }

            if (validPlacement) {
                // Розміщуємо корабель на полі
                cellsToOccupy.forEach(cell => {
                    cell.classList.add("occupied");
                    
                });

                // Видаляємо корабель із контейнера вибору
                const shipElement = document.getElementById(ship.id);
                if (shipElement && shipElement.parentNode === shipModelsContainer) {
                    shipModelsContainer.removeChild(shipElement);
                }

                placed = true;
            }
        }
    });
}


// Функція перевірки, чи сусідні клітинки порожні
function checkSurroundingCellsEmpty(field, row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const neighborRow = row + i;
            const neighborCol = col + j;
            
            // Пропускаємо перевірку для клітинок поза межами поля
            if (neighborRow < 1 || neighborRow > 10 || neighborCol < 1 || neighborCol > 10) continue;

            const neighborCell = field.querySelector(`.cell[data-row="${neighborRow}"][data-col="${neighborCol}"]`);
            if (neighborCell && neighborCell.classList.contains("occupied")) {
                return false; // Якщо знайдено зайняту клітинку поруч
            }
        }
    }
    return true; // Усі сусідні клітинки порожні
}





// Додаємо обробник на кнопку "Start game"
startBtn.addEventListener("click", () => {
    // Перевіряємо, чи всі кораблі були розміщені
    if (shipModelsContainer.childElementCount > 0) {
        alert("Place all the ships on the field before the game starts!");
        return;
    }
    
    
    // Створюємо поле противника
    enemyField.style.display = "grid";
    // enemyField.style.gridTemplateColumns = "repeat(11, 40px)";
    enemyField.style.backgroundColor = "#e6e6e6";
    enemyField.style.border = "1px solid black";
    
    // enemyField.style.gridTemplateRows = "repeat(11, 40px)";

    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if (row === 0 && col > 0) {
                cell.textContent = letters[col];
                cell.classList.add("letters-numbers");
            } else if (col === 0 && row > 0) {
                cell.textContent = row;
                cell.classList.add("letters-numbers");
            } else if (row === 0 && col === 0) {
                cell.classList.add("no-style-cell");
            } else if (row > 0 && col > 0) {
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.classList.add("playable");
            }

            enemyField.appendChild(cell);
        }
    }

    placeShipsRandomly(enemyField, shipModels); // Генерація кораблів противника

    startGame(); // Запуск гри
});


// Додаємо обробник на кнопку "RANDOM GENERATION IN YOUR FIELD"
randomGenBtn.addEventListener("click", () => {
    clearField();
    placeShipsRandomly(yourField, shipModels);
});

clearFieldBtn.addEventListener("click", () => {
    clearField();
     createShipModels(); 
});





let isPlayerTurn = true;




// Обробка кліків на ворожому полі
enemyField.addEventListener("click", (e) => {
    if (!isPlayerTurn) return; // Перевірка черги гравця

    const cell = e.target;

    if (cell.classList.contains("playable")) {
        if (cell.classList.contains("shot")) {
            alert("You've already shot here!");
            return;
        }

        // Позначення клітинки як "вистріляної"
        cell.classList.add("shot");

        if (cell.classList.contains("occupied")) {
            
            cell.innerHTML = "X";
            cell.style.color = "red";
            cell.style.fontSize = "32px";
            cell.style.textAlign = "center";

            // Перевірка, чи весь корабель знищений
            const shipCells = getShipCells(cell, enemyField);
            const isDestroyed = shipCells.every(shipCell => shipCell.classList.contains("shot"));

            if (isDestroyed) {
                shipCells.forEach(shipCell => {
                    shipCell.style.backgroundColor = "#b4b4b4"; // Фон клітинок знищеного корабля
                });
                markSurroundingCells(enemyField, shipCells); // Позначення клітинок навколо потопленого корабля
            }

            checkVictoryCondition(enemyField, "Player"); // Перевірка перемоги
        } else {
            // Місце порожнє
            cell.innerHTML = "•";
            cell.style.color = "blue";
            cell.style.fontSize = "24px";
            cell.style.textAlign = "center";

            isPlayerTurn = false;
            enemyMove(); // Хід ворога
        }
    }
});



let lastHitCell = null; // Остання клітинка, в яку влучив комп'ютер
let attackDirection = null; // Поточний напрямок атаки
let potentialTargets = []; // Сусідні клітинки для атаки

function enemyMove() {
    const emptyCells = Array.from(yourField.querySelectorAll(".playable:not(.shot)"));

    if (emptyCells.length === 0) {
        alert("Game over!");
        return;
    }

    let targetCell;

    if (potentialTargets.length > 0) {
        // Вибираємо клітинку з черги потенційних цілей
        targetCell = potentialTargets.shift();
    } else if (lastHitCell) {
        // Генеруємо нові потенційні цілі після останнього влучання
        generatePotentialTargets(lastHitCell);
        targetCell = potentialTargets.length > 0 ? potentialTargets.shift() : getRandomCell(emptyCells);
    } else {
        // Випадковий хід, якщо немає влучань
        targetCell = getRandomCell(emptyCells);
    }

    if (!targetCell) return;

    targetCell.classList.add("shot");

    if (targetCell.classList.contains("occupied")) {
        targetCell.innerHTML = "X";
        targetCell.style.color = "red";
        targetCell.style.fontSize = "32px";
        targetCell.style.textAlign = "center";

        lastHitCell = targetCell; // Зберігаємо останнє влучання
        attackDirection = determineDirection(lastHitCell); // Оновлюємо напрямок атаки

        const shipCells = getShipCells(targetCell, yourField);
        const isDestroyed = shipCells.every(shipCell => shipCell.classList.contains("shot"));

        if (isDestroyed) {
            lastHitCell = null; // Скидаємо останнє влучання
            attackDirection = null; // Скидаємо напрямок атаки
            markSurroundingCells(yourField, shipCells); // Позначення навколо потопленого корабля
        } else {
            // Генеруємо нові потенційні цілі
            generatePotentialTargets(lastHitCell);
        }

        checkVictoryCondition(yourField, "Computer"); // Перевірка перемоги
        setTimeout(enemyMove, 500); // Продовжуємо хід комп'ютера після влучання
    } else {
        targetCell.innerHTML = "•";
        targetCell.style.color = "blue";
        targetCell.style.fontSize = "24px";
        targetCell.style.textAlign = "center";

        // Повертаємо хід гравцю
        isPlayerTurn = true;
    }
}

function generatePotentialTargets(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const directions = [
        { row: -1, col: 0 }, // Верх
        { row: 1, col: 0 },  // Низ
        { row: 0, col: -1 }, // Ліво
        { row: 0, col: 1 }   // Право
    ];

    potentialTargets = directions
        .map(dir => yourField.querySelector(`.cell[data-row="${row + dir.row}"][data-col="${col + dir.col}"]`))
        .filter(neighbor => neighbor && !neighbor.classList.contains("shot"));
}

function determineDirection(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    const adjacentHits = [
        { dir: { row: -1, col: 0 }, cell: yourField.querySelector(`.cell[data-row="${row - 1}"][data-col="${col}"]`) }, // Верх
        { dir: { row: 1, col: 0 }, cell: yourField.querySelector(`.cell[data-row="${row + 1}"][data-col="${col}"]`) }, // Низ
        { dir: { row: 0, col: -1 }, cell: yourField.querySelector(`.cell[data-row="${row}"][data-col="${col - 1}"]`) }, // Ліво
        { dir: { row: 0, col: 1 }, cell: yourField.querySelector(`.cell[data-row="${row}"][data-col="${col + 1}"]`) }  // Право
    ];

    const hitDirections = adjacentHits.filter(item => item.cell && item.cell.classList.contains("shot"));
    return hitDirections.length === 1 ? hitDirections[0].dir : null;
}

function getRandomCell(cells) {
    return cells[Math.floor(Math.random() * cells.length)];
}


// Функція для отримання всіх клітинок корабля
function getShipCells(startCell, field) {
    const shipCells = [];
    const visited = new Set();

    function dfs(cell) {
        if (!cell || visited.has(cell) || !cell.classList.contains("occupied")) return;
        visited.add(cell);
        shipCells.push(cell);

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Рекурсивно перевіряємо сусідні клітинки
        dfs(field.querySelector(`.cell[data-row="${row - 1}"][data-col="${col}"]`)); // Верх
        dfs(field.querySelector(`.cell[data-row="${row + 1}"][data-col="${col}"]`)); // Низ
        dfs(field.querySelector(`.cell[data-row="${row}"][data-col="${col - 1}"]`)); // Ліво
        dfs(field.querySelector(`.cell[data-row="${row}"][data-col="${col + 1}"]`)); // Право
    }

    dfs(startCell);
    return shipCells;
}


// Функція для позначення навколишніх клітинок навколо знищеного корабля
function markSurroundingCells(field, shipCells) {
    shipCells.forEach(shipCell => {
        const row = parseInt(shipCell.dataset.row);
        const col = parseInt(shipCell.dataset.col);

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const neighborRow = row + i;
                const neighborCol = col + j;

                // Пропускаємо клітинки поза межами поля
                if (neighborRow < 1 || neighborRow > 10 || neighborCol < 1 || neighborCol > 10) continue;

                const neighborCell = field.querySelector(`.cell[data-row="${neighborRow}"][data-col="${neighborCol}"]`);
                if (neighborCell && !neighborCell.classList.contains("shot") && !neighborCell.classList.contains("occupied")) {
                    neighborCell.classList.add("shot");
                    neighborCell.innerHTML = "•";
                    neighborCell.style.color = "blue";
                    neighborCell.style.fontSize = "24px";
                    neighborCell.style.textAlign = "center";
                }
            }
        }
    });
}


function checkVictoryCondition(field, player) {
    // Перевіряємо, чи залишилися клітинки з кораблями, які не знищені
    const remainingShips = field.querySelectorAll(".occupied:not(.shot)");

    if (remainingShips.length === 0) {
        // Показуємо вікно з переможцем
        showVictoryModal(player);

        if (player === "Computer") {
            revealAllShips(enemyField); // Відкриваємо всі кораблі на полі ворога
        }

        // Вимикаємо можливість подальшої гри
        isPlayerTurn = false;
        enemyField.style.pointerEvents = "none";
        yourField.style.pointerEvents = "none";
    }
}
function showVictoryModal(player) {
    
    const modal = document.createElement("div");
    gameWindow.style.position = "relative";
    modal.getElementsByClassName("modal");
    modal.id = "victory-modal";
    modal.style.position = "absolute";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "white";
    modal.style.padding = "20px";
    modal.style.borderRadius = "10px";
    modal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    modal.style.zIndex = "1000";
    modal.style.textAlign = "center";

    const message = document.createElement("p");
    message.textContent = `${player} Wins! 🎉`;
    message.style.fontSize = "24px";
    message.style.marginBottom = "20px";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.padding = "10px 20px";
    closeButton.style.fontSize = "16px";
    closeButton.style.cursor = "pointer";
    closeButton.style.border = "none";
    closeButton.style.backgroundColor = "#007BFF";
    closeButton.style.color = "white";
    closeButton.style.borderRadius = "5px";


     // блюр фону
     const blurDiv = document.createElement("div");
     blurDiv.style.position = "absolute";
     blurDiv.style.width = "100%";
     blurDiv.style.height = "100%";
     blurDiv.style.top = "0";
     blurDiv.style.left = "0";
     blurDiv.style.zIndex = "1";
     blurDiv.style.backdropFilter = "blur(3px)";
 
     document.body.appendChild(blurDiv);

    closeButton.addEventListener("click", () => {
        modal.remove();
        blurDiv.remove();
        document.body.style.filter = "";
    });

    modal.appendChild(message);
    modal.appendChild(closeButton);

    gameWindow.appendChild(modal);
}



function revealAllShips(field) {
    const allOccupiedCells = field.querySelectorAll(".occupied");
    allOccupiedCells.forEach(cell => {
        cell.classList.add("revealed");
        cell.style.backgroundColor = "#b4b4b4";
    });
}
