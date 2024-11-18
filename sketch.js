let data;
let continentColors;
let spiralSpacing = 280; // Spazio tra le spirali
let marginY = 190;       // Margine verticale

function preload() {
  data = loadTable('assets/data.csv', 'csv', 'header');
}

function setup() {
  let numSpirals = data.getRowCount();
  let spiralsPerRow = Math.floor(windowWidth / spiralSpacing);
  let totalWidth = spiralsPerRow * spiralSpacing;
  let marginX = (windowWidth - totalWidth) / 2;

  console.log({
    windowWidth,
    spiralSpacing,
    numSpirals,
    spiralsPerRow,
    totalWidth,
    marginX
  });

  let numRows = Math.ceil(numSpirals / spiralsPerRow);
  
  createCanvas(windowWidth, (numRows * spiralSpacing) + marginY);
  background(245);
  
  // Aggiungi un sottofondo leggermente texture
  for(let i = 0; i < width; i += 4) {
    for(let j = 0; j < height; j += 4) {
      stroke(240 + random(-5, 5));
      point(i, j);
    }
  }
  
  // Debug info
  console.log({
    windowWidth,
    spiralsPerRow,
    marginX,
    numRows
  });
  
  continentColors = {
    'Asia': [70, 130, 180],          // Steel Blue
    'Europe': [0, 119, 190],         // Ocean Blue
    'Africa': [32, 178, 170],        // Light Sea Green
    'North America': [0, 105, 148],  // Deep Blue
    'South America': [100, 149, 237],// Cornflower Blue
    'Oceania': [135, 206, 235]       // Sky Blue
  };

  // Trova il discharge massimo
  let maxDischarge = 0;
  for (let i = 0; i < data.getRowCount(); i++) {
    let discharge = Number(data.getRow(i).getNum('discharge'));
    maxDischarge = Math.max(maxDischarge, discharge);
  }

  // Disegna tutte le spirali
  let row = 0;
  let col = 0;
  
  for (let i = 0; i < data.getRowCount(); i++) {
    // Calcola la posizione x e y per ogni spirale
    let x = marginX + (col * spiralSpacing) + (spiralSpacing/2);
    let y = marginY + (row * spiralSpacing);
    
    let dataRow = data.getRow(i);
    
    let length = Number(dataRow.getNum('length'));
    
    drawSpiral(
      x, 
      y,
      Number(dataRow.getNum('discharge')),
      Number(dataRow.getNum('avg_temp')),
      dataRow.getString('continent'),
      dataRow.getString('river_name'),
      maxDischarge,
      length
    );

    // Aggiorna colonna e riga
    col++;
    if (col >= spiralsPerRow) {
      col = 0;
      row++;
    }
  }
}

function drawSpiral(x, y, discharge, avgTemp, continent, riverName, maxDischarge, length) {
  push();
  translate(x, y);

  let size = 35;
  
  // Calcola le rotazioni in base alla lunghezza del fiume
  let minRotations = 2;
  let maxRotations = 5;
  let rotations = map(
    length,
    0, 6650,
    minRotations, maxRotations
  );
  rotations = constrain(rotations, minRotations, maxRotations);

  
  
  if (continent && continentColors[continent]) {
    let [r, g, b] = continentColors[continent];
    stroke(r, g, b, 60);
  }

  // Resto del codice della spirale invariato
  let coldColor = color(0, 105, 148);
  let hotColor = color(178, 34, 34);
  
  let tempNormalized = constrain(map(avgTemp, 0, 35, 0, 1), 0, 1);
  let tempColor = lerpColor(coldColor, hotColor, tempNormalized);

  let minWeight = 0.5;
  let maxWeight = 12;
  let weight = map(discharge, 0, maxDischarge, minWeight, maxWeight);
  weight = constrain(weight, minWeight, maxWeight);

  stroke(tempColor);
  strokeWeight(weight);
  noFill();
  
  // questo serve per disegnare la spirale
  beginShape();
  for (let angle = 0; angle < TWO_PI * rotations; angle += 0.1) {
    let r = (angle * size) / TWO_PI;
    let wave = sin(angle * 3) * 0.5;
    let px = cos(angle) * (r + wave);
    let py = sin(angle) * (r + wave);
    vertex(px, py);
  }
  endShape();

  // Nome del fiume
  noStroke();
  textAlign(CENTER);
  textSize(11);
  textStyle(BOLD);
  fill(40);
  text(riverName || 'Unknown', 0, size + 55);
  
  

  pop();
}

function getTemperatureColor(temp) {
  // Modifichiamo i colori per avere rossi più vivaci
  let cold = color(0, 150, 255);    // blu per temperature fredde
  let mild = color(255, 255, 255);  // bianco per temperature medie
  let hot = color(255, 0, 0);       // rosso puro per temperature calde
  
  // Definiamo i punti di riferimento della temperatura
  let minTemp = -5;
  let midTemp = 15;
  let maxTemp = 30;
  
  if (temp <= midTemp) {
    // Da freddo a medio
    return lerpColor(cold, mild, map(temp, minTemp, midTemp, 0, 1));
  } else {
    // Da medio a caldo
    return lerpColor(mild, hot, map(temp, midTemp, maxTemp, 0, 1));
  }
}
