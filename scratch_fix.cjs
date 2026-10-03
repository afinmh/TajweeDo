const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir(srcDir, (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (content.includes('next/image')) {
        content = content.replace(/import Image from ["']next\/image["'];?/, '');
        content = content.replace(/<Image/g, '<img');
        content = content.replace(/<\/Image>/g, '</img>'); // Just in case, though usually self-closing
        changed = true;
    }

    if (content.includes('next/link')) {
        content = content.replace(/import Link(?:, \{[^}]+\})? from ["']next\/link["'];?/, 'import { Link } from "react-router-dom";');
        changed = true;
    }

    if (content.includes('next/navigation')) {
        content = content.replace(/import \{ useRouter \} from ["']next\/navigation["'];?/, 'import { useNavigate } from "react-router-dom";');
        content = content.replace(/import \{ usePathname \} from ["']next\/navigation["'];?/, 'import { useLocation } from "react-router-dom";');
        content = content.replace(/const router = useRouter\(\);/g, 'const navigate = useNavigate();');
        content = content.replace(/router\.push\(/g, 'navigate(');
        content = content.replace(/router\.refresh\(\);?/g, ''); // Vite handles refresh differently or we can just remove
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
});
