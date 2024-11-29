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
exitBtn.style.margin = "20px 0";
exitBtn.addEventListener("click", resetGame);
exitBtn.style.order = 5;
gameWindow.appendChild(exitBtn);

const letters = ["", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const shipModels = [
    { size: 4, id: 'ship-4a' },
    { size: 3, id: 'ship-3a' }, { size: 3, id: 'ship-3b' },
    { size: 2, id: 'ship-2a' }, { size: 2, id: 'ship-2b' }, { size: 2, id: 'ship-2c' },
    { size: 1, id: 'ship-1a' }, { size: 1, id: 'ship-1b' }, { size: 1, id: 'ship-1c' }, { size: 1, id: 'ship-1d' }
];

// генерація поля 
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
    // очищення поля
    shipModelsContainer.innerHTML = "";

    // додаємо кожну модельку кораблика
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

        shipModelsContainer.appendChild(shipDiv);

        // ПЕРЕТЯГУВАННЯ КОРАБЛЯ НА ПОЛЕ
        shipDiv.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("ship-id", shipDiv.id);
            
        });

        // ОБЕРТАННЯ КОРАБЛІВ
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
    const occupiedCells = yourField.querySelectorAll(".occupied");
    occupiedCells.forEach(cell => {
        cell.classList.remove("occupied");
        cell.style.backgroundColor = "";
    });
     // очищення клітинок від ходів
     const shotCells = yourField.querySelectorAll(".shot");
     shotCells.forEach(cell => {
         cell.classList.remove("shot");
         cell.innerHTML = "";
         cell.style.color = ""; 
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
    startBtn.style.display = "none";
    randomGenBtn.style.display = "none";
    clearFieldBtn.style.display = "none";

    gameWindow.appendChild(exitBtn);
    exitBtn.style.display = "block";
}

// скидання гри 
function resetGame() {
    const destroyedShipsContainer = document.getElementById("destroyed-enemy-ships");
    if (destroyedShipsContainer) {
        destroyedShipsContainer.remove();
    }

    enemyField.innerHTML = "";
    enemyField.style.display = "none";
    
    clearField();
    createShipModels();
    

    startBtn.style.display = "inline-block";
    randomGenBtn.style.display = "inline-block";
    clearFieldBtn.style.display = "inline-block";

    exitBtn.style.display = "none";

    enemyField.style.pointerEvents = "auto";
    yourField.style.pointerEvents = "auto";

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

// рандомне розміщення кораблів
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


// перевірка чи сусідні клітинки пусті
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


// обробник кнопки старт
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


// кнопка рандомної генерації власного поля
randomGenBtn.addEventListener("click", () => {
    clearField();
    placeShipsRandomly(yourField, shipModels);
});

clearFieldBtn.addEventListener("click", () => {
    clearField();
     createShipModels(); 
});


let isPlayerTurn = true;

// oбробка пострілів на ворожому полі
enemyField.addEventListener("click", (e) => {
    if (!isPlayerTurn) return;

    const cell = e.target;

    if (cell.classList.contains("playable")) {
        if (cell.classList.contains("shot")) {
            alert("You've already shot here!");
            return;
        }

        cell.classList.add("shot");

        if (cell.classList.contains("occupied")) {
            
            cell.innerHTML = "X";
            cell.style.color = "red";
            
            cell.style.textAlign = "center";

            // перевірка чи корабель повністю знищений
            const shipCells = getShipCells(cell, enemyField);
            const isDestroyed = shipCells.every(shipCell => shipCell.classList.contains("shot"));

            if (isDestroyed) {
                shipCells.forEach(shipCell => {
                    shipCell.style.backgroundColor = "#b4b4b4";
                });
                markSurroundingCells(enemyField, shipCells); // простріл навколо знищеного корабля
            }

            checkVictoryCondition(enemyField, "Player"); // перевірка перемоги
        } else {
            // * коли промазав
            cell.innerHTML = "•";
            cell.style.color = "blue";
            cell.style.fontSize = "24px";
            cell.style.textAlign = "center";

            isPlayerTurn = false;
            setTimeout(enemyMove, 1000);
        }
    }
});



let lastHitCell = null; // Остання клітинка, в яку влучив комп'ютер // для памяті
let attackDirection = null; // Поточний напрямок атаки // для пам'яті
let potentialTargets = []; // Сусідні клітинки для атаки // для пам'яті

function enemyMove() {
    const emptyCells = Array.from(yourField.querySelectorAll(".playable:not(.shot)"));

    if (emptyCells.length === 0) {
        alert("Game over!");
        return;
    }

    let targetCell;

    // Продовжуємо атаку в напрямку
    if (attackDirection && lastHitCell) {
        targetCell = getNextCellInDirection(lastHitCell, attackDirection);

        if (!targetCell || targetCell.classList.contains("shot")) {
            // Перевіряємо, чи є протилежний напрямок доступним
            const reversedDirection = reverseDirection(attackDirection);
            const reversedCell = getNextCellInDirection(lastHitCell, reversedDirection);

            if (reversedCell && !reversedCell.classList.contains("shot")) {
                attackDirection = reversedDirection;
                targetCell = reversedCell;
            } else {
                attackDirection = null; // Якщо обидва напрямки недоступні, скидаємо напрямок
            }
        }
    }

    // Якщо немає напрямку, використовуємо потенційні цілі
    if (!targetCell && potentialTargets.length > 0) {
        targetCell = potentialTargets.shift();
    }

    // Якщо немає жодної цілі, генеруємо потенційні цілі або стріляємо випадково
    if (!targetCell) {
        if (lastHitCell) {
            generatePotentialTargets(lastHitCell);
            targetCell = potentialTargets.length > 0 ? potentialTargets.shift() : getRandomCell(emptyCells);
        } else {
            targetCell = getRandomCell(emptyCells);
        }
    }

    if (!targetCell) return;

    targetCell.classList.add("shot");

    if (targetCell.classList.contains("occupied")) {
        targetCell.innerHTML = "X";
        targetCell.style.color = "red";
        targetCell.style.textAlign = "center";

        lastHitCell = targetCell;

        const shipCells = getShipCells(targetCell, yourField);
        const isDestroyed = shipCells.every(shipCell => shipCell.classList.contains("shot"));

        if (isDestroyed) {
            lastHitCell = null; // Скидаємо останнє влучання
            attackDirection = null; // Скидаємо напрямок
            potentialTargets = []; // Очищуємо потенційні цілі
            markSurroundingCells(yourField, shipCells); // Позначаємо клітинки навколо корабля
        } else {
            // Якщо напрямок ще не визначено, встановлюємо його
            if (!attackDirection) {
                attackDirection = determineDirection(lastHitCell);
            }
        }

        checkVictoryCondition(yourField, "Computer");
        setTimeout(enemyMove, 1000);
    } else {
        targetCell.innerHTML = "•";
        targetCell.style.color = "blue";
        targetCell.style.fontSize = "24px";
        targetCell.style.textAlign = "center";

        isPlayerTurn = true; // Передаємо хід гравцю
    }
}

function generatePotentialTargets(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    const directions = [
        { row: -1, col: 0 }, // вверх
        { row: 1, col: 0 },  // вниз
        { row: 0, col: -1 }, // вліво
        { row: 0, col: 1 }   // вправо
    ];

    potentialTargets = directions
        .map(dir => yourField.querySelector(`.cell[data-row="${row + dir.row}"][data-col="${col + dir.col}"]`))
        .filter(neighbor => neighbor && !neighbor.classList.contains("shot"));
}

function determineDirection(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    const directions = [
        { row: -1, col: 0 }, // вверх
        { row: 1, col: 0 },  // вниз
        { row: 0, col: -1 }, // вліво
        { row: 0, col: 1 }   // вправо
    ];

    // Перевіряємо, чи є влучання в напрямках від поточної клітинки
    for (const dir of directions) {
        const nextCell = getNextCellInDirection(cell, dir);
        if (nextCell && nextCell.classList.contains("shot") && nextCell.classList.contains("occupied")) {
            return dir; // Повертаємо напрямок, де було влучання
        }
    }

    return null; // Якщо напрямок не визначено
}
function getNextCellInDirection(cell, direction) {
    if (!cell || !direction) return null;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    const nextRow = row + direction.row;
    const nextCol = col + direction.col;

    // Перевіряємо, чи знаходиться клітинка в межах поля
    if (nextRow < 1 || nextRow > 10 || nextCol < 1 || nextCol > 10) return null;

    // Повертаємо наступну клітинку
    return yourField.querySelector(`.cell[data-row="${nextRow}"][data-col="${nextCol}"]`);
}
function reverseDirection(direction) {
    return { row: -direction.row, col: -direction.col };
}


function getRandomCell(cells) {
    return cells[Math.floor(Math.random() * cells.length)];
}


// отримання всіх клітинок корабля
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

function updateDestroyedShips(shipCells) {
    let shipsContainer = document.getElementById("enemy-ships-container");

    // Якщо контейнера ще немає, створюємо його
    if (!shipsContainer) {
        const destroyedShipsContainer = document.createElement("div");
        destroyedShipsContainer.id = "destroyed-enemy-ships";
        destroyedShipsContainer.style.marginTop = "0px";
        
        

        const title = document.createElement("h3");
        title.textContent = "Destroyed enemy ships:";
        title.style.marginBottom = "10px";

        shipsContainer = document.createElement("div");
        shipsContainer.id = "enemy-ships-container";
        shipsContainer.style.display = "flex";
        shipsContainer.style.flexDirection = "column";
        shipsContainer.style.gap = "10px";

        destroyedShipsContainer.appendChild(title);
        destroyedShipsContainer.appendChild(shipsContainer);

        gameWindow.appendChild(destroyedShipsContainer);
    }

    // Додаємо знищений корабель до контейнера
    const shipElement = document.createElement("div");
    shipElement.classList.add("destroyed-ship");
    shipElement.style.display = "flex";
    shipElement.style.gap = "0px";

    // Перебираємо клітинки знищеного корабля
    shipCells.forEach(cell => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("destroy-cell");
        cellElement.style.backgroundColor = "#B4B4B4";
        cellElement.style.border = "1px solid black";
        cellElement.innerText = "X";
        shipElement.appendChild(cellElement);
    });

    shipsContainer.appendChild(shipElement);
}


// простріл навколо повністю знищеного корабля
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
    if (field === enemyField) {
        updateDestroyedShips(shipCells);
    }
}


function checkVictoryCondition(field, player) {
    // Перевіряємо, чи залишилися клітинки з кораблями, які не знищені
    const remainingShips = field.querySelectorAll(".occupied:not(.shot)");

    if (remainingShips.length === 0) {

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
