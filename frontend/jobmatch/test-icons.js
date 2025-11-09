// Quick test to check which icons are available
const hugeicons = require('@hugeicons/react-native');

console.log('All available icons:', Object.keys(hugeicons).filter(key => key.includes('Icon')).sort().slice(0, 50));

console.log('\n=== Testing specific imports ===');
console.log('User02Icon:', hugeicons.User02Icon);
console.log('LockPasswordIcon:', hugeicons.LockPasswordIcon);
console.log('Mail01Icon:', hugeicons.Mail01Icon);
console.log('SmartPhone01Icon:', hugeicons.SmartPhone01Icon);

console.log('\n=== Searching for User icons ===');
const userIcons = Object.keys(hugeicons).filter(key => key.toLowerCase().includes('user'));
console.log('User icons found:', userIcons);

console.log('\n=== Searching for Lock icons ===');
const lockIcons = Object.keys(hugeicons).filter(key => key.toLowerCase().includes('lock') || key.toLowerCase().includes('password'));
console.log('Lock icons found:', lockIcons);

console.log('\n=== Searching for Mail icons ===');
const mailIcons = Object.keys(hugeicons).filter(key => key.toLowerCase().includes('mail'));
console.log('Mail icons found:', mailIcons);

console.log('\n=== Searching for Phone icons ===');
const phoneIcons = Object.keys(hugeicons).filter(key => key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile'));
console.log('Phone icons found:', phoneIcons);
