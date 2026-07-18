const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, '../resources/js');
const appJsPath = path.join(jsPath, 'app.js');

const lines = fs.readFileSync(appJsPath, 'utf8').split('\n');

let coreLines = [];
let marketplaceLines = [];
let developerLines = [];
let adminLines = [];

let currentSection = 'core'; // default

// Helper to determine where lines go
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Ignore the outer DOMContentLoaded wrapper since we'll recreate it
    if (i === 1 && line.includes('DOMContentLoaded')) continue;
    if (i === lines.length - 1 && line.trim() === '});') continue;
    if (i === lines.length - 2 && line.trim() === '') continue;

    // Detect section headers
    if (line.includes('// 3. Tab Switching Router')) {
        currentSection = 'skip';
    } else if (line.includes('function renderDeveloperConsole') || 
               line.includes('// 10. App Publishing Flow') || 
               line.includes('// 12. Chart.js Engine') || 
               line.includes('// DEVELOPER APP MANAGEMENT MODAL HANDLERS')) {
        currentSection = 'developer';
    } else if (line.includes('function renderAdminModeration') || 
               line.includes('function renderAdminAppManagement')) {
        currentSection = 'admin';
    } else if (line.includes('function renderHeroBanner') || 
               line.includes('function renderHomeView') || 
               line.includes('function renderDiscoverAppGrid') || 
               line.includes('// 8. Event Handler Support Functions') || 
               line.includes('// 9. Slide-out App Details Drawer Engine')) {
        currentSection = 'marketplace';
    } else if (line.includes('// 4. Role Switcher') || 
               line.includes('// 5. Global Navigation') || 
               line.includes('// 6. Theme Toggle') || 
               line.includes('// 11. Toast System') ||
               line.includes('// USER AUTH MODAL HANDLERS') ||
               line.includes('function renderApiDocs')) {
        currentSection = 'core';
    } else if (line.includes('// 7. UI Render Functions') || line.includes('// 2. Initialize Views')) {
        // Keep in current context or switch to core? UI Render Functions starts with renderHeroBanner shortly after, which is marketplace.
        // Let's just put the header in core.
        currentSection = 'core';
    }

    if (currentSection === 'core') coreLines.push(line);
    else if (currentSection === 'marketplace') marketplaceLines.push(line);
    else if (currentSection === 'developer') developerLines.push(line);
    else if (currentSection === 'admin') adminLines.push(line);
}

const windowExports = `
// Expose shared functions and state to window for other modules
window.iconGradients = typeof iconGradients !== 'undefined' ? iconGradients : {};
window.formatBytes = typeof formatBytes !== 'undefined' ? formatBytes : null;
window.parseFileSize = typeof parseFileSize !== 'undefined' ? parseFileSize : null;
window.appIconUrl = typeof appIconUrl !== 'undefined' ? appIconUrl : null;
window.state = typeof state !== 'undefined' ? state : {};
if (typeof showToast !== 'undefined') window.showToast = showToast;
if (typeof openDrawer !== 'undefined') window.openDrawer = openDrawer;
if (typeof closeDrawer !== 'undefined') window.closeDrawer = closeDrawer;
if (typeof mapMarketplaceApp !== 'undefined') window.mapMarketplaceApp = mapMarketplaceApp;
if (typeof renderAppReviewsAndBugs !== 'undefined') window.renderAppReviewsAndBugs = renderAppReviewsAndBugs;
`;

const wrap = (lines, addExports = false) => {
    return 'document.addEventListener("DOMContentLoaded", () => {\n' + 
           lines.join('\n') + 
           (addExports ? '\n' + windowExports : '') + 
           '\n});';
};

fs.writeFileSync(path.join(jsPath, 'core.js'), wrap(coreLines, true));
fs.writeFileSync(path.join(jsPath, 'marketplace.js'), wrap(marketplaceLines));
fs.writeFileSync(path.join(jsPath, 'developer.js'), wrap(developerLines));
fs.writeFileSync(path.join(jsPath, 'admin.js'), wrap(adminLines));

console.log("Split complete!");
