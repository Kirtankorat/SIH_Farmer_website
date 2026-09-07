const fs = require('fs');
const path = require('path');

const files = [
    'dashboard-fpo.html',
    'dashboard-bulk.html',
    'dashboard-cooperative.html',
    'dashboard-entrepreneur.html',
    'dashboard.html'
];

for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove inline css for member-row
    content = content.replace(/^[ \t]*\.member-row.*{.*}\r?\n/gm, '');
    content = content.replace(/^[ \t]*\.mr-name.*{.*}\r?\n/gm, '');
    content = content.replace(/^[ \t]*\.mr-loc.*{.*}\r?\n/gm, '');
    content = content.replace(/^[ \t]*\.mr-stat.*{.*}\r?\n/gm, '');
    
    // Replace member-row inner classes first
    content = content.replace(/class="mr-name"/g, 'class="or-prod"');
    content = content.replace(/class="mr-loc"/g, 'class="or-meta"');
    
    // Replace mr-stat div with span.or-status.status-new
    content = content.replace(/<div class="mr-stat">([\s\S]*?)<\/div>/g, '<span class="or-status status-new">$1</span>');
    
    // Replace member-row itself
    content = content.replace(/class="member-row"/g, 'class="order-row"');
    
    // Replace pickup-card
    content = content.replace(/<div class="pickup-card"><div class="pc-title-w">([\s\S]*?)<\/div><div class="pc-time">([\s\S]*?)<\/div><div class="pc-detail">([\s\S]*?)<\/div><\/div>/g, 
        '<div class="order-row"><div><div class="or-prod">$1</div><div class="or-meta">$3</div></div><span class="or-status status-new">$2</span></div>');
        
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated ' + file);
}
