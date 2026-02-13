const fs = require('fs');
const path = require('path');

const base = 'C:\\Proyectos\\AndroidNetrunnerCG\\card-frontend\\src\\assets\\img';
const folders = ['Hardware', 'ICE'];

folders.forEach(f => {
    const oldPath = path.join(base, f);
    const tempPath = oldPath + '_temp';
    const newPath = path.join(base, f.toLowerCase());

    if (fs.existsSync(oldPath)) {
        try {
            fs.renameSync(oldPath, tempPath);
            fs.renameSync(tempPath, newPath);
            console.log(`Successfully renamed ${f} to ${f.toLowerCase()}`);
        } catch (e) {
            console.error(`Error renaming ${f}:`, e);
        }
    } else {
        console.log(`${oldPath} does not exist`);
    }
});
