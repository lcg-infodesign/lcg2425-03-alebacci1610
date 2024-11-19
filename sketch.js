let riversData; // Variabile per i dati del CSV
let colors = {}; // Mappa per i colori basati sui continenti
let gridColumns = 3; // Numero di colonne nella griglia
let cellPadding = 50; // Spazio tra gli occhi nella griglia
let eyeAnimation = []; // Stato dell'animazione per ogni occhio
let blinkingEyes = new Set(); // Set per tenere traccia degli occhi che stanno sbattendo
let blinkSpeed = 0.1; // Velocità del battito
let minBlinkingEyes = 10; // Numero minimo di occhi che sbattono
let maxBlinkingEyes = 30; // Numero massimo di occhi che sbattono

function preload() {
  // Carica il file CSV, con header incluso
  riversData = loadTable('data.csv', 'csv', 'header');
}

function setup() {
  // Calcola il numero di colonne basato sulla larghezza della finestra
  // Assumiamo che ogni "occhio" richieda almeno 300px di larghezza
  gridColumns = floor(windowWidth / 300);
  // Assicuriamoci di avere almeno 2 colonne e non più di 6
  gridColumns = constrain(gridColumns, 2, 6);
  
  let rows = ceil(riversData.getRowCount() / gridColumns); // Numero di righe necessarie
  let canvasHeight = rows * 300 + 300; // Altezza proporzionale al numero di righe + spazio per titolo e legenda
  createCanvas(windowWidth, canvasHeight); // Larghezza dinamica, altezza dinamica
  loop(); // Rimuovi noLoop()

  // Assegna colori ai continenti
  colors = {
    'Europe': color(181, 136, 99), // Marrone chiaro
    'North America': color(100, 149, 237), // Blu
    'Asia': color(255, 165, 0), // Arancione
    'South America': color(34, 139, 34), // Verde scuro
    'Africa': color(139, 69, 19), // Marrone scuro
    'Australia': color(64, 224, 208) // verde acqua
  };

  // Inizializza l'array dell'animazione
  for (let i = 0; i < riversData.getRowCount(); i++) {
    eyeAnimation.push(0); // 0 significa occhio aperto, 1 completamente chiuso
  }

  // Inizia subito con alcuni occhi che sbattono
  startInitialBlinks();
}

function draw() {
  background(255); // Sfondo bianco

  // Disegna il titolo
  drawTitle();

  // Aggiungi la legenda
  drawLegend();

  // Aggiorna le animazioni
  blinkingEyes.forEach(i => {
    eyeAnimation[i] += blinkSpeed;
    if (eyeAnimation[i] >= 1) {
      eyeAnimation[i] = 1;
      setTimeout(() => {
        eyeAnimation[i] = 0.9; // Inizia a riaprire l'occhio
        setTimeout(() => {
          blinkingEyes.delete(i);
          // Aggiungi un nuovo occhio quando uno finisce di sbattere
          if (blinkingEyes.size < minBlinkingEyes) {
            startRandomBlink();
          }
        }, 500);
      }, 100);
    }
  });
  
  // Aggiorna gli occhi che si stanno riaprendo
  for (let i = 0; i < eyeAnimation.length; i++) {
    if (eyeAnimation[i] > 0 && !blinkingEyes.has(i)) {
      eyeAnimation[i] = max(0, eyeAnimation[i] - blinkSpeed);
    }
  }
  
  // Disegna gli occhi in una griglia
  let startY = 500; // Aumentato per dare più spazio dopo la legenda
  for (let i = 0; i < riversData.getRowCount(); i++) {
    let river = riversData.rows[i].obj; // Ottieni i dati del fiume
    let col = i % gridColumns; // Colonna attuale
    let row = floor(i / gridColumns); // Riga attuale

    let x = col * (width / gridColumns) + (width / gridColumns) / 2; // Posizione X
    let y = row * 300 + startY; // Posizione Y

    drawRiverEye(x, y, river, eyeAnimation[i]); // Disegna l'occhio con l'animazione
    drawRiverName(x, y + 140, river.river_name); // Modificato da 120 a 140
  }
}

function drawTitle() {
  textAlign(CENTER, CENTER);
  textSize(64);
  textFont("Georgia");
  fill(0);
  text("Rivers in the World", width / 2, 70);
}

function drawRiverEye(x, y, river, closeAmount) {
  let avgTemp = float(river.avg_temp); // Temperatura media
  let area = float(river.area); // Area del bacino
  let tributaries = int(river.tributaries); // Numero di affluenti
  let continent = river.continent; // Continente

  let irisRadius = map(area, 0, 5000000, 30, 100); // Dimensione dell'iride mappata all'area
  let pupilRadius = map(avgTemp, -10, 40, 5, irisRadius / 2); // Pupilla mappata alla temperatura
  let irisColor = colors[continent] || color(200); // Colore dell'iride (default grigio)

  // Disegna il bordo dell'occhio (ovale nero)
  fill(0);
  ellipse(x, y, irisRadius * 3, irisRadius * 2);

  // Disegna l'interno dell'occhio con chiusura simulata
  fill(255);
  let eyeHeight = lerp(irisRadius * 1.8, 0, closeAmount); // Altezza dell'occhio ridotta con l'animazione
  ellipse(x, y, irisRadius * 2.8, eyeHeight);

  // Quando l'occhio è chiuso, sia l'iride che la pupilla spariscono con la chiusura
  if (closeAmount < 1) {
    // Disegna l'iride ridotto
    fill(irisColor);
    noStroke();
    let irisVisible = lerp(irisRadius * 2, 0, closeAmount); // Riduzione progressiva dell'iride
    ellipse(x, y, irisVisible, irisVisible);

    // Disegna la pupilla ridotta
    fill(0);
    let pupilVisible = lerp(pupilRadius * 2, 0, closeAmount); // Riduzione progressiva della pupilla
    ellipse(x, y, pupilVisible, pupilVisible);

    // Disegna le ciglia
    drawEyelashes(x, y, tributaries, irisRadius * 3, irisRadius * 2);
  }
}

function drawEyelashes(centerX, centerY, numEyelashes, eyeWidth, eyeHeight) {
  let startAngle = radians(160); // Angolo iniziale per le ciglia (sopra l'occhio)
  let endAngle = radians(20); // Angolo finale per le ciglia (sopra l'occhio)
  let eyelashLength = 18; // Lunghezza delle ciglia
  let eyelashWidth = 0.7; // Larghezza delle ciglia

  stroke(0); // Nero per le ciglia
  strokeWeight(eyelashWidth); // Spessore delle ciglia
  for (let i = 0; i < numEyelashes; i++) {
    let t = map(i, 0, numEyelashes - 1, startAngle, endAngle); // Angoli distribuiti tra start e end
    let startX = centerX + cos(t) * (eyeWidth / 2); // Punto di partenza sul bordo dell'occhio
    let startY = centerY - sin(t) * (eyeHeight / 2);
    let endX = startX + cos(t) * eyelashLength; // Estendi nella stessa direzione
    let endY = startY - sin(t) * eyelashLength;
    line(startX, startY, endX, endY); // Disegna la ciglia
  }
}

function drawRiverName(x, y, name) {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(name, x, y); // Scrive il nome del fiume sotto il bordo inferiore dell'occhio
}

// Aggiungi questa nuova funzione
function startRandomBlink() {
  if (blinkingEyes.size >= maxBlinkingEyes) return;
  
  let availableEyes = [];
  for (let i = 0; i < riversData.getRowCount(); i++) {
    if (!blinkingEyes.has(i) && eyeAnimation[i] === 0) {
      availableEyes.push(i);
    }
  }
  
  if (availableEyes.length > 0) {
    let randomEye = random(availableEyes);
    blinkingEyes.add(randomEye);
  }
}

// Aggiungi questa funzione per gestire il ridimensionamento della finestra
function windowResized() {
  // Ricalcola il numero di colonne
  gridColumns = floor(windowWidth / 300);
  gridColumns = constrain(gridColumns, 2, 6);
  
  let rows = ceil(riversData.getRowCount() / gridColumns);
  let canvasHeight = rows * 300 + 300;
  
  resizeCanvas(windowWidth, canvasHeight);
  redraw(); // Ridisegna il canvas con la nuova disposizione
}

// Aggiungi questa nuova funzione
function startInitialBlinks() {
  // Inizia con il numero minimo di occhi che sbattono
  while (blinkingEyes.size < minBlinkingEyes) {
    let randomEye = floor(random(riversData.getRowCount()));
    if (!blinkingEyes.has(randomEye)) {
      blinkingEyes.add(randomEye);
    }
  }
}

function drawLegend() {
  // Parametri della legenda
  let legendX = width - 300; // Posizione X (300px dal bordo destro)
  let legendY = 50; // Posizione Y iniziale
  let rowHeight = 30; // Altezza di ogni riga
  let circleSize = 20; // Dimensione dei cerchi colorati
  let textOffset = 30; // Spazio tra l'elemento grafico e il testo
  
  textAlign(LEFT, CENTER);
  textSize(14);
  
  // Disegna i continenti
  let currentY = legendY;
  for (let continent in colors) {
    // Elemento grafico
    fill(colors[continent]);
    noStroke();
    circle(legendX, currentY, circleSize);
    
    // Testo
    fill(0);
    text(continent, legendX + textOffset, currentY);
    
    currentY += rowHeight;
  }
  
  // Temperatura (pupilla)
  fill(0);
  circle(legendX, currentY, 15);
  text("Pupilla: temperatura media", legendX + textOffset, currentY);
  currentY += rowHeight;
  
  // Affluenti (ciglia)
  stroke(0);
  strokeWeight(0.7);
  for (let i = 0; i < 3; i++) {
    let angle = map(i, 0, 2, radians(160), radians(20));
    let lineLength = 18;
    let startLineX = legendX + cos(angle) * 10;
    let startLineY = currentY - sin(angle) * 10;
    let endLineX = startLineX + cos(angle) * lineLength;
    let endLineY = startLineY - sin(angle) * lineLength;
    line(startLineX, startLineY, endLineX, endLineY);
  }
  text("Ciglia: numero di affluenti", legendX + textOffset, currentY);
}

