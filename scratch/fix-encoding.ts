import fs from 'fs';

const filePath = 'users_list.json';
const content = fs.readFileSync(filePath);

// Detect UTF-16LE BOM
if (content[0] === 0xFF && content[1] === 0xFE) {
  const text = content.toString('utf16le');
  fs.writeFileSync(filePath, text, 'utf8');
  console.log('Converted users_list.json from UTF-16LE to UTF-8');
} else {
  console.log('users_list.json is not UTF-16LE or has no BOM');
}
