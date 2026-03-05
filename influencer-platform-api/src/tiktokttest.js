const fs = require('fs');
const path = require('path');

const filePath = path.resolve('C:\\Users\\bouas\\OneDrive\\Desktop\\reel.mp4');
const fileSize = fs.statSync(filePath).size;
console.log(`File size: ${fileSize} bytes`);
