
const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\ibrah\\.gemini\\antigravity\\scratch\\warvanta';
const excludeDirs = ['node_modules', '.next', '.git', 'tmp', 'dist'];

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!excludeDirs.includes(file)) {
                walk(filePath);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sql', '.css', '.html'].includes(ext)) {
                processFile(filePath);
            }
        }
    });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Comprehensive casing replacements
    content = content.replace(/Warvanta/g, 'Warvanta');
    content = content.replace(/warvanta/g, 'warvanta');
    content = content.replace(/WARVANTA/g, 'WARVANTA');
    
    // Domain specific (just in case)
    content = content.replace(/warvanta\.com/g, 'warvanta.com');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

console.log('Starting comprehensive global rename...');
walk(rootDir);
console.log('Rename complete.');
