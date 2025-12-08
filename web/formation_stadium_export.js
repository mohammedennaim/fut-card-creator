// Updated Export Function with Custom Stadium Field
// This replaces the createExportContainer function in formation.js

// Create a temporary container for export with your custom stadium field
async function createExportContainer() {
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
        position: fixed;
        top: -10000px;
        left: 0;
        width: 1200px;
        height: 800px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 20px;
        z-index: 9999;
        font-family: 'Cairo', sans-serif;
        overflow: hidden;
    `;
    
    // Add header with formation info
    const header = document.createElement('div');
    header.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 80px;
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 3px solid #4a5568;
        z-index: 30;
    `;
    
    header.innerHTML = `
        <div style="text-align: center;">
            <h1 style="color: white; font-size: 32px; font-weight: 900; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                Formation: ${currentFormation}
            </h1>
            <p style="color: #cbd5e0; font-size: 16px; margin: 5px 0 0 0; opacity: 0.9;">
                ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
    `;
    
    // Add main field container
    const fieldContainer = document.createElement('div');
    fieldContainer.style.cssText = `
        position: absolute;
        top: 90px;
        left: 50px;
        width: 1100px;
        height: 650px;
        background: linear-gradient(135deg, #1a2332 0%, #243447 100%);
        border: 3px solid #4a5568;
        border-radius: 15px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Create custom stadium field using your SVG data
    const stadiumField = document.createElement('div');
    stadiumField.style.cssText = `
        width: 900px;
        height: 600px;
        background: #1a472a;
        border-radius: 10px;
        position: relative;
        overflow: hidden;
    `;
    
    // Add the SVG field background from your assets/field-bg.svg with improved colors
    stadiumField.innerHTML = `
        <svg style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;" viewBox="0 0 904 650" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M903 649.439H1L120.311 1H783.788L903 649.439Z" fill="#1a472a" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M69.8843 275.038H834.169" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M550.992 275.425C553.194 321.703 508.921 360.763 452.019 360.763C395.117 360.763 350.853 321.703 353.062 275.425C355.172 231.123 399.452 196.564 452.035 196.564C504.618 196.564 548.89 231.115 550.992 275.425Z" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M541.288 71.4008C543.078 109.009 503.086 140.632 451.897 140.632C400.708 140.632 360.732 109.017 362.53 71.4008C364.259 35.2446 404.251 6.93591 451.92 6.93591C499.582 6.93591 539.574 35.2446 541.288 71.4008Z" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M269.125 96.4996H640.093L630.663 1.1532H278.312L269.125 96.4996Z" fill="#1a472a" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M371.922 54.7625H532.542L530.219 1.13715H374.245L371.922 54.7625Z" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M343.464 530.333C346.061 474.554 395.78 431.261 454.624 431.261C513.469 431.261 563.279 474.554 565.998 530.333C568.855 588.91 519.151 638.6 454.853 638.6C390.554 638.6 340.737 588.91 343.471 530.333H343.464Z" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M675.597 492.572H227.26L211.911 649.198H690.84L675.597 492.572Z" fill="#1a472a" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M556.362 556.642H352.353L348.43 649.238H560.453L556.362 556.642Z" stroke="#2d5a3a" stroke-width="2" stroke-miterlimit="10"/>
        </svg>
    `;
    
    fieldContainer.appendChild(stadiumField);
    exportContainer.appendChild(header);
    exportContainer.appendChild(fieldContainer);
    
    // Clone and reposition player cards with professional name labels
    const playerCards = document.querySelectorAll('.player-card-on-field.fifa-card');
    console.log(`📋 Found ${playerCards.length} player cards to export`);
    
    for (const card of playerCards) {
        const metadata = card.dataset.metadata ? JSON.parse(card.dataset.metadata) : null;
        
        // Calculate position relative to the stadium field (900x600)
        const leftValue = card.style.left;
        const topValue = card.style.top;
        
        const xPercent = parseFloat(leftValue.match(/(\d+(?:\.\d+)?)%/)?.[1] || 50);
        const yPercent = parseFloat(topValue.match(/(\d+(?:\.\d+)?)%/)?.[1] || 50);
        
        // Convert to absolute pixels for stadium field (900x600)
        const absoluteX = (xPercent / 100) * 900 - 65; // 65px = half card width
        const absoluteY = (yPercent / 100) * 600 - 65; // 65px = half card height
        
        console.log(`📍 Card position: ${xPercent}%, ${yPercent}% -> ${absoluteX}px, ${absoluteY}px`);
        
        // Create professional card container
        const cardContainer = document.createElement('div');
        cardContainer.style.cssText = `
            position: absolute;
            left: ${absoluteX}px;
            top: ${absoluteY}px;
            width: 130px;
            height: 160px;
            z-index: 25;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;
        
        // Create card image with shadow
        const cardImg = card.querySelector('img');
        if (cardImg) {
            const imgClone = cardImg.cloneNode(true);
            imgClone.style.cssText = `
                width: 110px;
                height: auto;
                border-radius: 10px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.8);
                border: 3px solid #2d3748;
                filter: brightness(1.1) contrast(1.1);
            `;
            cardContainer.appendChild(imgClone);
        }
        
        // Create professional player name label (like Image 1)
        const nameLabel = document.createElement('div');
        nameLabel.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 700;
            margin-top: 12px;
            text-align: center;
            min-width: 100px;
            border: 2px solid #4a5568;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.9);
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        `;
        
        if (metadata && metadata.name) {
            nameLabel.innerHTML = `
                <div style="color: #ffffff; font-size: 13px; font-weight: 700; margin-bottom: 2px;">
                    ${metadata.name.toUpperCase()}
                </div>
                <div style="color: #cbd5e0; font-size: 10px; font-weight: 500;">
                    ${metadata.position || 'SUB'} • OVR ${metadata.overall || '0'}
                </div>
            `;
        } else {
            nameLabel.innerHTML = `
                <div style="color: #ffffff; font-size: 13px; font-weight: 700;">
                    PLAYER
                </div>
                <div style="color: #cbd5e0; font-size: 10px;">
                    SUB • OVR 0
                </div>
            `;
        }
        
        cardContainer.appendChild(nameLabel);
        stadiumField.appendChild(cardContainer);
        
        console.log('✅ Professional card with name label added');
    }
    
    // Add footer with team statistics
    const footer = document.createElement('div');
    footer.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50px;
        right: 50px;
        height: 50px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 30px;
        border: 2px solid #4a5568;
        box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    `;
    
    const playerCount = document.querySelectorAll('.player-card-on-field.fifa-card').length;
    const overallRating = document.getElementById('overallRating')?.textContent || '--';
    
    footer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 30px;">
            <div style="color: white; font-size: 16px; font-weight: 700;">
                <span style="color: #81c784;">Players:</span> ${playerCount}/6
            </div>
            <div style="color: white; font-size: 16px; font-weight: 700;">
                <span style="color: #81c784;">Overall:</span> ${overallRating}
            </div>
        </div>
        <div style="color: #a0aec0; font-size: 14px; font-weight: 600;">
            FIFA Formation Planner
        </div>
    `;
    
    exportContainer.appendChild(footer);
    document.body.appendChild(exportContainer);
    
    // Wait for images to load
    const images = exportContainer.querySelectorAll('img');
    console.log(`🖼️ Waiting for ${images.length} images to load...`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
                console.log('✅ Image already loaded:', img.src);
                resolve();
            } else {
                img.onload = () => {
                    console.log('✅ Image loaded:', img.src);
                    resolve();
                };
                img.onerror = () => {
                    console.log('❌ Image failed to load:', img.src);
                    resolve();
                };
                
                // Force reload if needed
                const src = img.src;
                img.src = '';
                img.src = src;
            }
        });
    }));
    
    console.log('✅ All images processed, ready for export');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return exportContainer;
}

// Also update the canvas capture size
// Update the export function canvas capture settings
const canvas = await html2canvasLib(exportContainer, {
    backgroundColor: '#1a1a2e',
    scale: 2,
    useCORS: true,
    allowTaint: true,
    width: 1200,
    height: 800,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    foreignObjectRendering: false,
    logging: true,
    removeContainer: false,
    async: true,
    onclone: function(clonedDoc) {
        console.log('🔄 HTML2Canvas cloned document');
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.style) {
                el.style.opacity = '1';
                el.style.visibility = 'visible';
            }
        });
    }
});
