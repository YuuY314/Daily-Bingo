const mainPhrases = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25"
];

const specialPhrases = [  
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "1000"
];

const app = document.querySelector("#app");
const nameInput = document.querySelector("#name-input");
const enterBtn = document.querySelector("#enter-btn");

const todayKey = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

function shufflePhrases(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function selectPhrasesWithChance(main, special, total = 25, specialChance = 20) {
    const shuffledMain = shufflePhrases(main);
    const shuffledSpecial = shufflePhrases(special);

    const selected = [];

    for(let i = 0; i < total; i++){
        if(Math.random() * 100 < specialChance && shuffledSpecial.length > 0){
            selected.push({ text: shuffledSpecial.pop(), isSpecial: true });
        } else {
            selected.push({ text: shuffledMain.pop(), isSpecial: false });
        }
    }

    return shufflePhrases(selected);
}

function buildCard(name, phrases = null, tilesMarked = null) {
    const card = document.createElement("section");

    const indicator = document.createElement("div");
    const phrase = document.createElement("h2");

    const bingoGrid = document.createElement("div");

    const selectedPhrases = phrases || selectPhrasesWithChance(mainPhrases, specialPhrases, 25, 20);

    for(let i = 0; i < 5; i++){
        for(let j = 0; j < 5; j++){
            const tile = document.createElement("div");
            tile.className = "tile";

            const phraseIndex = i * 5 + j;
            const phraseObj = selectedPhrases[phraseIndex];

            tile.textContent = phraseObj.text;

            if(phraseObj.isSpecial){
                tile.classList.add("special-phrase");
            }

            if(tilesMarked && tilesMarked[phraseIndex]){
                tile.classList.add("marked");
            }

            bingoGrid.appendChild(tile);
        }
    }

    const controls = document.createElement("div");
    const deleteBtn = document.createElement("button");
    const clearBtn = document.createElement("button");
    const downloadBtn = document.createElement("button");

    card.className = "card";
    indicator.className = "indicator";
    bingoGrid.className = "bingo-grid";
    controls.className = "controls";
    deleteBtn.className = "delete-btn";
    clearBtn.className = "clear-btn";
    downloadBtn.className = "download-btn";

    phrase.textContent = `Aqui está sua cartilha, ${name}`;
    deleteBtn.textContent = "Apagar";
    clearBtn.textContent = "Limpar";
    downloadBtn.textContent = "Baixar";

    indicator.appendChild(phrase);

    controls.appendChild(deleteBtn);
    controls.appendChild(clearBtn);
    controls.appendChild(downloadBtn);

    card.appendChild(indicator);
    card.appendChild(bingoGrid);
    card.appendChild(controls);

    app.appendChild(card);

    if (!phrases) {
        let savedCards = JSON.parse(localStorage.getItem(todayKey)) || [];
        savedCards.push({ name, phrases: selectedPhrases });
        localStorage.setItem(todayKey, JSON.stringify(savedCards));
    }
}

const savedCards = JSON.parse(localStorage.getItem(todayKey)) || [];
savedCards.forEach(card => {
    buildCard(card.name, card.phrases, card.tilesMarked);
});

enterBtn.addEventListener("click", () => {
    let name = nameInput.value.trim();

    if(name === ""){
        alert("Digite um nome");
        return;
    }

    nameInput.value = "";
    buildCard(name);
});

nameInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === "Return"){
        enterBtn.click();
    }
});

document.addEventListener("click", (e) => {
    if(e.target.classList.contains("tile")){
        e.target.classList.toggle("marked");

        const card = e.target.closest("section");
        const name = card.querySelector("h2").textContent.split(",")[1].trim();

        let savedCards = JSON.parse(localStorage.getItem(todayKey)) || [];
        const cardIndex = savedCards.findIndex(c => c.name === name);

        if(cardIndex !== -1){
            const tiles = Array.from(card.querySelectorAll(".tile")).map(t => t.classList.contains("marked"));
            savedCards[cardIndex].tilesMarked = tiles;
            localStorage.setItem(todayKey, JSON.stringify(savedCards));
        }
    }

    if(e.target.classList.contains("delete-btn")){
        const card = e.target.closest("section");
        const name = card.querySelector("h2").textContent.split(",")[1].trim();

        let savedCards = JSON.parse(localStorage.getItem(todayKey)) || [];
        savedCards = savedCards.filter(c => c.name !== name);
        localStorage.setItem(todayKey, JSON.stringify(savedCards));

        card.remove();
    }

    if(e.target.classList.contains("clear-btn")){
        const card = e.target.closest("section");
        const tiles = card.querySelectorAll(".tile");
        tiles.forEach(tile => tile.classList.remove("marked"));

        const name = card.querySelector("h2").textContent.split(",")[1].trim();
        let savedCards = JSON.parse(localStorage.getItem(todayKey)) || [];
        const cardIndex = savedCards.findIndex(c => c.name === name);

        if(cardIndex !== -1){
            const tilesMarked = Array.from(tiles).map(() => false);
            savedCards[cardIndex].tilesMarked = tilesMarked;
            localStorage.setItem(todayKey, JSON.stringify(savedCards));
        }
    }

    if(e.target.classList.contains("download-btn")){
        const card = e.target.closest("section");
        const name = card.querySelector("h2");
        html2canvas(card, { scale: 2, useCORS: true }).then(canvas => {
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = name.textContent.split(",")[1].trim() + "-" + todayKey;
            link.click();
        });
    }
});
