var currentAmount = 0;

const candyPrices = {
    "a": 6,
    "b": 7,
    "c": 8
}

const candyImgs = {
    "a": "candy.png",
    "b": "chocolate-bar.png",
    "c": "lollipop.png"
}

function closeDoor() {
    const outputDoor = document.getElementById(`output-door`);
    const outputWindow = document.getElementById(`output-window`);
    const candyImg = outputWindow.querySelector('img');
    candyImg.style.transform = "scale(1.3)";
    candyImg.style.opacity = 0;
    outputWindow.style.cursor = 'initial';
    outputDoor.style.top = "0px";
    outputDoor.dataset.isOpen = "false";
    setTimeout(() => {
        outputWindow.removeChild(candyImg);
    }, 1000);
}

function isDoorOpen() {
    const outputDoor = document.getElementById(`output-door`);
    return outputDoor.dataset.isOpen === "true";
}

function selectCandy(candyOption) {
    const audio = new Audio('audios/select_candy.mp3');
    audio.play();
    audio.volume = 0.3;
    audio.loop = false;
    audio.currentTime = 0;

    currentAmount -= candyPrices[candyOption];
    updateAmountDisplay('Seu troco: ');
    giveExchange();
    Object.keys(candyPrices).forEach(candyKey => {
        if (currentAmount < candyPrices[candyKey]) {
            setCandyUnavailable(candyKey);
        }
    })

    const outputDoor = document.getElementById(`output-door`);
    const outputWindow = document.getElementById(`output-window`);
    outputWindow.style.cursor = 'pointer';
    outputDoor.style.top = "-67px";
    outputDoor.dataset.isOpen = "true";
    const candyImg = document.createElement('img');
    candyImg.src = "imgs/candies/" + candyImgs[candyOption];
    candyImg.width = "40";
    candyImg.alt = "candy";
    candyImg.style.transition = ".3s";
    outputWindow.appendChild(candyImg);
}

function giveExchange() {
    let cincoReaisNotesQty = 0;
    let doisReaisNotesQty = 0;
    let umRealNotesQty = 0;

    if ((currentAmount / 5) >= 1) {
        cincoReaisNotesQty = parseInt(currentAmount / 5);
        currentAmount %= 5;
    }
    if ((currentAmount / 2) >= 1) {
        doisReaisNotesQty = parseInt(currentAmount / 2);
        currentAmount %= 2;
    }
    umRealNotesQty = parseInt(currentAmount);

    const handleExchange = (noteValue, noteQty) => {
        let initialTime = 0;
        return new Promise(resolve => {
            if (noteQty === 0) {
                resolve();
                return;
            }
            for (let i = 0; i < noteQty; i++) {
                setTimeout(() => {
                    const imgNames = {
                        5: "5_reais.png",
                        2: "2_reais.png",
                        1: "1_real.png"
                    }
                    const exchangeArea = document.getElementById('exchange-area');
                    const noteImg = document.createElement('img');
                    noteImg.src = "imgs/money/" + imgNames[noteValue];
                    noteImg.width = "95";
                    noteImg.style.transition = "1s";
                    noteImg.style.left = "15px";
                    noteImg.style.top = '-60px';
                    noteImg.style.position = 'absolute';
                    exchangeArea.appendChild(noteImg);
                    setTimeout(() => {
                        noteImg.style.top = '-2px';
                        noteImg.style.zIndex = "1000";
                        setTimeout(() => {
                            noteImg.style.opacity = 0;
                            if (i === noteQty - 1) {
                                resolve();
                            }
                        }, 1000);
                    }, 100);
                }, initialTime * i);
                initialTime = 1000;
            }
        })
    }

    handleExchange(5, cincoReaisNotesQty)
        .then(() => handleExchange(2, doisReaisNotesQty))
        .then(() => handleExchange(1, umRealNotesQty))
        .then(() => {
            currentAmount = 0;
            updateAmountDisplay();
        })
}

function dragStart(event) {
    const dataValue = event.target.getAttribute("data-value");
    event.dataTransfer.setData("text/plain", dataValue);
}

function dragOver(event) {
    event.preventDefault();
}

function setTextInDisplay(text) {
    const amountDisplayElement = document.getElementById('amount-display');
    amountDisplayElement.textContent = text;
}

function updateAmountDisplay(prefix = '') {
    const amountDisplayElement = document.getElementById('amount-display');
    if (currentAmount === 0) {
        amountDisplayElement.textContent = "Insira o dinheiro";
    } else {
        amountDisplayElement.textContent = prefix + currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}

function setCandyUnavailable(candyOption) {
    const candyAvailable = document.getElementById(`candy-${candyOption}-availability`);
    candyAvailable.style.backgroundColor = "#808080";
    const candyBtn = document.getElementById(`candy-${candyOption}-btn`);
    candyBtn.disabled = true;
}

function setCandyAvailable(candyOption) {
    setTimeout(() => {
        const candyBtn = document.getElementById(`candy-${candyOption}-btn`);
        if (!candyBtn.disabled) {
            return;
        }
        const audio = new Audio('audios/candy_available.mp3');
        audio.play();
        audio.volume = 0.2;
        audio.loop = false;
        audio.currentTime = 0;
        const candyAvailability = document.getElementById(`candy-${candyOption}-availability`);
        candyAvailability.style.backgroundColor = "#00d600";
        
        candyBtn.disabled = false;
    }, 200);
}

function drop(event) {
    if (isDoorOpen()) {
        setTextInDisplay('Favor, pegue o seu doce');
        setTimeout(() => {
            setTextInDisplay('Insira o dinheiro');
        }, 2000);
        return;
    }
    setTextInDisplay('Verificando...');
    const audio = new Audio('audios/inserting_money.mp3');
    audio.play();
    audio.volume = 0.3;
    audio.loop = false;
    audio.currentTime = 0;

    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");

    const originalElement = document.querySelector(`[data-value="${data}"]`);
    const draggedElement = originalElement.cloneNode(true);
    draggedElement.removeAttribute("data-value");
    draggedElement.style.position = "absolute";
    draggedElement.style.width = "95px";

    setTimeout(() => {
        draggedElement.style.transform = `translateY(-${event.clientY + draggedElement.clientHeight}px)`;
        draggedElement.style.transition = "transform 4s";
        draggedElement.style.pointerEvents = "none";
        draggedElement.style.opacity = "0.5";
        draggedElement.style.zIndex = "1000";
    }, 400);

    setTimeout(() => {
        currentAmount += parseInt(data);
        updateAmountDisplay();

        if (currentAmount >= 6) {
            setCandyAvailable('a');
        }

        if (currentAmount >= 7) {
            setCandyAvailable('b');
        }

        if (currentAmount >= 8) {
            setCandyAvailable('c');
        }
    }, 1000);

    const dropzone = event.target;
    dropzone.appendChild(draggedElement);
}

document.addEventListener("DOMContentLoaded", function () {
    // Your code here will run once the DOM is fully loaded
    console.log("DOM fully loaded and parsed");
});