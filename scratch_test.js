const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const targetString = "const authCookie = cookieStore.get('sb-auth-token');";
const replacementString = `const allCookies = cookieStore.getAll();
    const authCookie = allCookies.find(
      (c) => c.name.includes("auth-token") || c.name.includes("supabase.auth.token")
    );`;

let count = 0;
walkDir('d:\\Rohit 2.0\\bmtech\\app\\api', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(targetString)) {
      content = content.replace(targetString, replacementString);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
      count++;
    }
  }
});
console.log(`Replaced in ${count} files.`);
