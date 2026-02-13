const fs = require('fs');
const path = require('path');

const base = 'C:\\Proyectos\\AndroidNetrunnerCG\\card-frontend\\src\\assets\\img';
const folders = ['Hardware', 'ICE'];

folders.forEach(f => {
    const oldPath = path.join(base, f);
    const newPath = oldPath.toLowerCase();
    if (fs.existsSync(oldPath)) {
        try {
            fs.renameSync(oldPath, newPath);
            console.log(`Renamed ${oldPath} to ${newPath}`);
        } catch (e) {
            console.error(`Error renaming ${f}:`, e);
        }
    } else {
        console.log(`${oldPath} does not exist`);
    }
});
