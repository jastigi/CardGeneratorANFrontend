const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(function (childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

const source = 'C:\\Proyectos\\AndroidNetrunnerCG\\public\\img';
const destination = 'C:\\Proyectos\\AndroidNetrunnerCG\\card-frontend\\src\\assets\\img';

try {
    copyRecursiveSync(source, destination);
    console.log('Successfully copied assets from ' + source + ' to ' + destination);
} catch (err) {
    console.error('Error copying assets:', err);
}
