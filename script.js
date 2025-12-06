// متغيرات اللعبة
let money = 50;
let level = 1;
let exp = 0;
let expToNextLevel = 100;
let selectedSeed = null;
let cells = [];
let plantedSeeds = [];
let inventory = [];
let thiefStolenMoney = 0;
let thiefActive = false;

// تحديث عرض المال والمستوى
function updateMoneyDisplay() {
    document.getElementById("money").textContent = money;
    document.getElementById("growAllMoney").textContent = `${calculateTotalMoney()} درهم`;
}

function calculateTotalMoney() {
    return plantedSeeds.reduce((total, seed) => {
        if (seed.stage === "ready") {
            return total + (parseInt(seed.price) * 3);
        }
        return total;
    }, 0);
}

function updateLevelDisplay() {
    document.getElementById("level").textContent = level;
    document.getElementById("exp-text").textContent = `${exp}/${expToNextLevel}`;
    const expProgress = (exp / expToNextLevel) * 100;
    document.getElementById("exp-progress").style.width = `${expProgress}%`;
}

// إضافة خبرة وصعود المستوى
function addExp(amount) {
    exp += amount;
    if (exp >= expToNextLevel) {
        exp -= expToNextLevel;
        level++;
        expToNextLevel = Math.floor(expToNextLevel * 1.5);
        money += 50;
        updateMoneyDisplay();
    }
    updateLevelDisplay();
}

// تحديث حقيبة التخزين
function updateInventory() {
    const inventorySlots = document.getElementById("inventorySlots");
    inventorySlots.innerHTML = "";
    inventory.forEach(seed => {
        const slot = document.createElement("div");
        slot.className = "inventory-slot";
        slot.innerHTML = `<img src="${seed.img}" alt="${seed.type}">`;
        inventorySlots.appendChild(slot);
    });
}

// إنشاء خلايا المزرعة
function createFarmCells() {
    const farmLand = document.getElementById("farmLand");
    farmLand.innerHTML = "";
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.index = i;
        cell.addEventListener("click", function() {
            if (selectedSeed && money >= selectedSeed.price && !this.classList.contains("planted")) {
                money -= selectedSeed.price;
                this.classList.add("planted");
                this.innerHTML = `<img src="${selectedSeed.img}" alt="${selectedSeed.type}">`;
                this.dataset.type = selectedSeed.type;
                this.dataset.stage = "seed";
                this.dataset.price = selectedSeed.price;

                plantedSeeds.push({
                    type: selectedSeed.type,
                    price: selectedSeed.price,
                    stage: "seed"
                });

                updateMoneyDisplay();
                document.getElementById('buySeed').disabled = true;
                document.querySelectorAll('.seed-option').forEach(s => s.classList.remove('selected'));
                selectedSeed = null;
            }
        });
        farmLand.appendChild(cell);
        cells.push(cell);
    }
}

// ظهور اللص
function spawnThief() {
    if (thiefActive) return;
    thiefStolenMoney = Math.floor(Math.random() * 10) + 5;
    money -= thiefStolenMoney;
    updateMoneyDisplay();

    const thief = document.getElementById("thief");
    thief.style.display = "block";
    thief.style.left = `${Math.floor(Math.random() * 80) + 10}%`;
    thief.style.top = `${Math.floor(Math.random() * 60) + 10}%`;

    thiefActive = true;
    setTimeout(() => {
        if (thiefActive) {
            thief.style.display = "none";
            thiefActive = false;
        }
    }, 10000);
}

// النقر على اللص
document.getElementById("thief").addEventListener("click", function() {
    if (thiefActive) {
        money += thiefStolenMoney + 1;
        updateMoneyDisplay();
        this.style.display = "none";
        thiefActive = false;
    }
});

// شراء البذور
document.querySelectorAll('.seed-option').forEach(seed => {
    seed.addEventListener('click', function() {
        document.querySelectorAll('.seed-option').forEach(s => s.classList.remove('selected'));
        this.classList.add('selected');
        selectedSeed = {
            type: this.dataset.seedType,
            price: parseInt(this.dataset.seedPrice),
            img: this.querySelector('img').src
        };
        document.getElementById('buySeed').disabled = money < selectedSeed.price;
    });
});

// زر شراء البذرة
document.getElementById("buySeed").addEventListener("click", function() {
    if (selectedSeed) {
        inventory.push(selectedSeed);
        updateInventory();
        document.getElementById('buySeed').disabled = true;
        document.querySelectorAll('.seed-option').forEach(s => s.classList.remove('selected'));
        selectedSeed = null;
    }
});

// سقي النباتات
document.getElementById("waterPlants").addEventListener("click", function() {
    cells.forEach((cell, index) => {
        if (cell.classList.contains("planted")) {
            if (cell.dataset.stage === "seed") {
                cell.dataset.stage = "growing";
                plantedSeeds[index].stage = "growing";
            } else if (cell.dataset.stage === "growing") {
                cell.dataset.stage = "ready";
                plantedSeeds[index].stage = "ready";
                cell.classList.add("ready");
            }
        }
    });

    // احتمال ظهور اللص
    if (Math.random() < 0.2) {
        spawnThief();
    }
});

// حصاد النباتات
document.getElementById("harvestPlants").addEventListener("click", function() {
    let harvestedCount = 0;
    cells.forEach((cell, index) => {
        if (cell.classList.contains("planted") && cell.dataset.stage === "ready") {
            harvestedCount++;
            const profit = parseInt(cell.dataset.price) * 3;
            money += profit;

            cell.classList.remove("planted", "ready");
            cell.innerHTML = "";
            plantedSeeds.splice(index, 1);
        }
    });

    if (harvestedCount > 0) {
        addExp(harvestedCount * 10);
    }

    updateMoneyDisplay();
});

// بدء اللعبة
window.addEventListener('load', function() {
    createFarmCells();
    updateMoneyDisplay();
    updateLevelDisplay();
    updateInventory();
});
