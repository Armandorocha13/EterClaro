const fs = require('fs');
const path = require('path');

const targetDir = 'nextjs_space';
const itemsToMove = fs.readdirSync('.');

itemsToMove.forEach(item => {
  if (item === targetDir || item === '.git' || item === '.abacus.donotdelete' || item === '.project_instructions.md') {
    return;
  }
  
  const oldPath = path.join('.', item);
  const newPath = path.join(targetDir, item);
  
  try {
    if (fs.existsSync(newPath)) {
      console.log(`Pulando ${item} (já existe no destino)`);
    } else {
      fs.renameSync(oldPath, newPath);
      console.log(`Movido: ${item}`);
    }
  } catch (err) {
    console.error(`Erro ao mover ${item}: ${err.message}`);
  }
});
