// Formation Planner JavaScript (Updated with Snapping and Fixed Export)

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Formation positions (percentages relative to field)
const formations = {
    '1-2-2-1': [
        { position: 'GK', x: 50, y: 90, rating: 85, name: 'KEEPER' },
        { position: 'LB', x: 25, y: 70, rating: 82, name: 'DEFENDER 1' },
        { position: 'RB', x: 75, y: 70, rating: 83, name: 'DEFENDER 2' },
        { position: 'LM', x: 30, y: 45, rating: 84, name: 'MIDFIELDER 1' },
        { position: 'RM', x: 70, y: 45, rating: 85, name: 'MIDFIELDER 2' },
        { position: 'ST', x: 50, y: 15, rating: 88, name: 'STRIKER' }
    ],
    '1-3-1-1': [
        { position: 'GK', x: 50, y: 90, rating: 85, name: 'KEEPER' },
        { position: 'LB', x: 20, y: 70, rating: 82, name: 'DEFENDER 1' },
        { position: 'CB', x: 50, y: 75, rating: 84, name: 'DEFENDER 2' },
        { position: 'RB', x: 80, y: 70, rating: 83, name: 'DEFENDER 3' },
        { position: 'CM', x: 50, y: 45, rating: 85, name: 'MIDFIELDER' },
        { position: 'ST', x: 50, y: 15, rating: 88, name: 'STRIKER' }
    ],
    '1-1-3-1': [
        { position: 'GK', x: 50, y: 90, rating: 85, name: 'KEEPER' },
        { position: 'CB', x: 50, y: 70, rating: 84, name: 'DEFENDER' },
        { position: 'LM', x: 25, y: 45, rating: 83, name: 'MIDFIELDER 1' },
        { position: 'CM', x: 50, y: 50, rating: 85, name: 'MIDFIELDER 2' },
        { position: 'RM', x: 75, y: 45, rating: 84, name: 'MIDFIELDER 3' },
        { position: 'ST', x: 50, y: 15, rating: 88, name: 'STRIKER' }
    ],
    '1-2-1-2': [
        { position: 'GK', x: 50, y: 90, rating: 85, name: 'KEEPER' },
        { position: 'LB', x: 25, y: 70, rating: 82, name: 'DEFENDER 1' },
        { position: 'RB', x: 75, y: 70, rating: 83, name: 'DEFENDER 2' },
        { position: 'CM', x: 50, y: 45, rating: 85, name: 'MIDFIELDER' },
        { position: 'LW', x: 30, y: 15, rating: 86, name: 'WINGER 1' },
        { position: 'RW', x: 70, y: 15, rating: 87, name: 'WINGER 2' }
    ],
    '1-1-2-2': [
        { position: 'GK', x: 50, y: 90, rating: 85, name: 'KEEPER' },
        { position: 'CB', x: 50, y: 70, rating: 84, name: 'DEFENDER' },
        { position: 'LM', x: 30, y: 50, rating: 83, name: 'MIDFIELDER 1' },
        { position: 'RM', x: 70, y: 50, rating: 84, name: 'MIDFIELDER 2' },
        { position: 'LS', x: 35, y: 15, rating: 87, name: 'STRIKER 1' },
        { position: 'RS', x: 65, y: 15, rating: 88, name: 'STRIKER 2' }
    ]
};

// Sound Effects System
class SoundEffects {
    constructor() {
        this.sounds = {
            drop: this.createSound(800, 200, 'sine'),
            remove: this.createSound(400, 300, 'square'),
            hover: this.createSound(600, 100, 'sine'),
            success: this.createSound(1000, 400, 'sine'),
            error: this.createSound(200, 400, 'sawtooth')
        };
    }
    
    createSound(frequency, duration, type = 'sine') {
        return () => {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioContext();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.type = type;
                oscillator.frequency.value = frequency;
                
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + duration / 1000);
            } catch (e) {
                console.log('Audio not supported');
            }
        };
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
}

// Initialize sound system
const soundFX = new SoundEffects();

// State
let currentFormation = '1-2-2-1';
let players = [];
let draggedElement = null;

// DOM Elements
const formationSelect = document.getElementById('formationSelect');
const playersOnField = document.getElementById('playersOnField');
const resetBtn = document.getElementById('resetBtn');
const saveFormationBtn = document.getElementById('saveFormationBtn');
const exportBtn = document.getElementById('exportBtn');
const reloadCardsBtn = document.getElementById('reloadCardsBtn');
const availableCards = document.getElementById('availableCards');
const overallRatingEl = document.getElementById('overallRating');
const attackRatingEl = document.getElementById('attackRating');
const defenseRatingEl = document.getElementById('defenseRating');
const midfieldRatingEl = document.getElementById('midfieldRating');
const paceRatingEl = document.getElementById('paceRating');
const chemistryValueEl = document.getElementById('chemistryValue');
const currentFormationEl = document.getElementById('currentFormation');
const playerCountEl = document.getElementById('playerCount');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Formation Planner: Page loaded');
    
    initializeFormation();
    setupEventListeners();
    updateRatings();
    // Auto-load cards on startup
    setTimeout(loadPlayerCards, 500);
});

// Setup Event Listeners
function setupEventListeners() {
    formationSelect.addEventListener('change', (e) => {
        currentFormation = e.target.value;
        currentFormationEl.textContent = currentFormation;
        
        // Reposition existing players to new formation
        repositionPlayersToFormation();
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the formation?')) {
            initializeFormation();
        }
    });
    
    saveFormationBtn.addEventListener('click', saveFormation);
    exportBtn.addEventListener('click', exportFormation);
    reloadCardsBtn.addEventListener('click', loadPlayerCards);

    // Setup drag and drop for field
    playersOnField.addEventListener('dragover', handleDragOver);
    playersOnField.addEventListener('drop', handleDrop);
    playersOnField.addEventListener('dragenter', (e) => {
        e.preventDefault();
        playersOnField.classList.add('drag-over');
    });
    playersOnField.addEventListener('dragleave', (e) => {
        if (e.target === playersOnField) {
            playersOnField.classList.remove('drag-over');
        }
    });
}

// Reposition Players to Formation
function repositionPlayersToFormation() {
    const existingCards = document.querySelectorAll('.player-card-on-field.fifa-card');
    const formationPositions = formations[currentFormation] || [];
    
    console.log(`🔄 Repositioning ${existingCards.length} players to ${currentFormation} formation`);
    
    existingCards.forEach((card, index) => {
        if (index < formationPositions.length) {
            const position = formationPositions[index];
            
            // Animate to new position (using calc to center the cards)
            card.style.transition = 'left 0.5s ease, top 0.5s ease';
            card.style.left = `calc(${position.x}% - 55px)`; // 55px = half of card width
            card.style.top = `calc(${position.y}% - 55px)`;  // 55px = half of card height
            
            // Remove transition after animation
            setTimeout(() => {
                card.style.transition = '';
            }, 500);
        }
    });
    
    // Play success sound
    soundFX.play('success');
    
    // Show feedback
    if (existingCards.length > 0) {
        showFormationChangeFeedback();
    }
}

// Show formation change feedback
function showFormationChangeFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'formation-feedback';
    feedback.textContent = `✅ Players repositioned to ${currentFormation}!`;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #8B5CF6, #A78BFA);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
    }, 2500);
}

// Initialize Formation
function initializeFormation() {
    playersOnField.innerHTML = '';
    players = [];
    
    updateRatings();
    updatePlayerCount();
    
    // Auto-load random players on initialization
    loadRandomPlayers();
}

// Load Random Players
async function loadRandomPlayers() {
    try {
        console.log('🎲 Loading random players...');
        const response = await fetch('/api/random-players?count=6');
        const data = await response.json();
        
        if (data.success && data.cards.length > 0) {
            console.log(`✅ Loaded ${data.cards.length} random players`);
            
            // Place players in current formation positions
            const positions = formations[currentFormation] || [];
            
            data.cards.forEach((card, index) => {
                if (index < positions.length && card.metadata) {
                    const pos = positions[index];
                    createFIFACardOnField(card.imageData, pos.x, pos.y, card.metadata);
                }
            });
            
            console.log('✅ Random players placed on field');
        }
    } catch (error) {
        console.log('ℹ️ Could not load random players (database might be empty):', error.message);
    }
}

// Drag and Drop Handlers
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'copy';
    
    showDropZoneHighlight(e);
    return false;
}

// Show drop zone highlight
function showDropZoneHighlight(e) {
    const rect = playersOnField.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Remove existing highlight
    const existingHighlight = document.querySelector('.drop-zone-highlight');
    if (existingHighlight) {
        existingHighlight.remove();
    }
    
    // Create new highlight
    const highlight = document.createElement('div');
    highlight.className = 'drop-zone-highlight';
    highlight.style.left = `${x}%`;
    highlight.style.top = `${y}%`;
    
    playersOnField.appendChild(highlight);
}

// Remove drop zone highlight
function removeDropZoneHighlight() {
    const highlight = document.querySelector('.drop-zone-highlight');
    if (highlight) {
        highlight.remove();
    }
}

// --- NEW SNAPPING LOGIC HELPERS ---

// Find nearest empty formation slot
function findNearestEmptySlot(dropX, dropY) {
    const formationPositions = formations[currentFormation] || [];
    let nearestSlot = null;
    let shortestDistance = 15; // Snapping radius (percentage)

    formationPositions.forEach(pos => {
        // Calculate distance
        const dx = pos.x - dropX;
        const dy = pos.y - dropY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If closer than limit AND empty
        if (distance < shortestDistance && !isSlotOccupied(pos.x, pos.y)) {
            shortestDistance = distance;
            nearestSlot = pos;
        }
    });

    return nearestSlot;
}

// Check if slot is occupied
function isSlotOccupied(targetX, targetY) {
    const existingCards = document.querySelectorAll('.player-card-on-field.fifa-card');
    const draggingCard = document.querySelector('.player-card-on-field.dragging');

    for (let card of existingCards) {
        if (card === draggingCard) continue;

        // Extract percentage from calc() values
        const leftValue = card.style.left;
        const topValue = card.style.top;
        
        // Parse calc(X% - 55px) to get X
        const cardX = parseFloat(leftValue.match(/(\d+(?:\.\d+)?)%/)?.[1] || 0);
        const cardY = parseFloat(topValue.match(/(\d+(?:\.\d+)?)%/)?.[1] || 0);

        if (Math.abs(cardX - targetX) < 1 && Math.abs(cardY - targetY) < 1) {
            return true;
        }
    }
    return false;
}

// --- UPDATED DROP HANDLER ---

function handleDrop(e) {
    console.log('🎯 Drop event triggered!');
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();
    
    playersOnField.classList.remove('drag-over');
    removeDropZoneHighlight();
    
    // 1. Calculate drop coordinates
    const rect = playersOnField.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    // 2. Snap to slot
    const snappedSlot = findNearestEmptySlot(x, y);
    
    if (snappedSlot) {
        console.log(`🧲 Snapped to slot: ${snappedSlot.position}`);
        x = snappedSlot.x;
        y = snappedSlot.y;
    }
    
    // Check for repositioning
    const isRepositioning = e.dataTransfer.getData('isRepositioning');
    console.log('🔍 Checking for repositioning:', isRepositioning);
    console.log('🔍 Dragged element:', draggedElement);
    
    if (isRepositioning === 'true' && draggedElement && draggedElement.classList.contains('player-card-on-field')) {
        console.log('✅ Repositioning confirmed - moving player');
        soundFX.play('success');
        
        draggedElement.style.transition = 'left 0.3s ease, top 0.3s ease';
        draggedElement.style.left = `calc(${x}% - 55px)`; // Center the card properly
        draggedElement.style.top = `calc(${y}% - 55px)`;
        
        // Update metadata position if snapped
        if(snappedSlot) {
            draggedElement.dataset.position = snappedSlot.position;
            console.log('🎯 Snapped to position:', snappedSlot.position);
        }

        showRepositionFeedback();
        
        setTimeout(() => {
            if (draggedElement) {
                draggedElement.style.transition = '';
            }
        }, 300);
        
        draggedElement.classList.remove('dragging');
        draggedElement = null;
        
        updateRatingsWithFIFACards();
        return false;
    }
    
    // Handle new card from sidebar
    const cardImage = e.dataTransfer.getData('cardImage');
    const metadataStr = e.dataTransfer.getData('metadata');
    
    if (cardImage) {
        let metadata = null;
        if (metadataStr) {
            try {
                metadata = JSON.parse(metadataStr);
                
                // Update position in metadata if snapped
                if (snappedSlot) {
                    metadata.position = snappedSlot.position; 
                }

                if (isPlayerAlreadyOnField(metadata.name)) {
                    soundFX.play('error');
                    alert(`${metadata.name} is already on the field!`);
                    return false;
                }
            } catch (err) {
                console.error('❌ Error parsing metadata:', err);
            }
        }
        
        soundFX.play('drop');
        createFIFACardOnField(cardImage, x, y, metadata);
        
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement = null;
        }
    } 
    
    return false;
}

// Update Ratings with FIFA Cards
function updateRatingsWithFIFACards() {
    const fifaCards = document.querySelectorAll('.player-card-on-field.fifa-card');
    
    if (fifaCards.length === 0) {
        overallRatingEl.textContent = '--';
        attackRatingEl.textContent = '--';
        defenseRatingEl.textContent = '--';
        midfieldRatingEl.textContent = '--';
        paceRatingEl.textContent = '--';
        chemistryValueEl.textContent = '--';
        
        document.querySelectorAll('.stat-fill')[0].style.width = '0%';
        document.querySelectorAll('.stat-fill')[1].style.width = '0%';
        document.querySelectorAll('.stat-fill')[2].style.width = '0%';
        document.querySelectorAll('.stat-fill')[3].style.width = '0%';
        document.querySelector('.chemistry-fill').style.width = '0%';
        
        return;
    }
    
    let totalRating = 0, totalPace = 0, totalShooting = 0;
    let totalPassing = 0, totalDribbling = 0, totalDefense = 0, totalPhysical = 0;
    let validCards = 0;
    
    fifaCards.forEach(card => {
        const rating = parseInt(card.dataset.rating) || 0;
        const pace = parseInt(card.dataset.pace) || 0;
        const shooting = parseInt(card.dataset.shooting) || 0;
        const passing = parseInt(card.dataset.passing) || 0;
        const dribbling = parseInt(card.dataset.dribbling) || 0;
        const defense = parseInt(card.dataset.defense) || 0;
        const physical = parseInt(card.dataset.physical) || 0;
        
        if (rating > 0) {
            totalRating += rating;
            totalPace += pace;
            totalShooting += shooting;
            totalPassing += passing;
            totalDribbling += dribbling;
            totalDefense += defense;
            totalPhysical += physical;
            validCards++;
        }
    });
    
    if (validCards === 0) {
        overallRatingEl.textContent = '--';
        return;
    }
    
    // Calculate averages
    const overall = Math.round(totalRating / validCards);
    const paceRating = Math.round(totalPace / validCards);
    const attackRating = Math.round((totalPace + totalShooting + totalDribbling) / (validCards * 3));
    const defenseRating = Math.round((totalDefense + totalPhysical) / (validCards * 2));
    const midfieldRating = Math.round((totalPassing + totalDribbling) / (validCards * 2));
    
    // Update text displays with animation
    overallRatingEl.textContent = overall;
    attackRatingEl.textContent = attackRating;
    defenseRatingEl.textContent = defenseRating;
    midfieldRatingEl.textContent = midfieldRating;
    paceRatingEl.textContent = paceRating;
    
    // Add animation class
    [overallRatingEl, attackRatingEl, defenseRatingEl, midfieldRatingEl, paceRatingEl].forEach(el => {
        el.classList.add('updating');
        setTimeout(() => el.classList.remove('updating'), 600);
    });
    
    // Update stat bars
    const statFills = document.querySelectorAll('.stat-fill');
    statFills[0].style.width = `${attackRating}%`;
    statFills[1].style.width = `${defenseRating}%`;
    statFills[2].style.width = `${midfieldRating}%`;
    statFills[3].style.width = `${paceRating}%`;
    
    // Calculate chemistry
    const chemistry = Math.round((validCards / 6) * 100);
    chemistryValueEl.textContent = chemistry;
    document.querySelector('.chemistry-fill').style.width = `${chemistry}%`;
    
    // Update player count
    playerCountEl.textContent = `${validCards}/6`;
}

// Update Ratings (fallback)
function updateRatings() {
    updateRatingsWithFIFACards();
}

// Update Player Count
function updatePlayerCount() {
    const fifaCards = document.querySelectorAll('.player-card-on-field.fifa-card');
    const count = fifaCards.length;
    playerCountEl.textContent = `${count}/6`;
}

// Save Formation
function saveFormation() {
    const formationData = {
        formation: currentFormation,
        players: players.filter(p => p !== null),
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('fifa_formation', JSON.stringify(formationData));
    soundFX.play('success');
    alert('Formation saved successfully! ✅');
}

// Export Formation as Image - FIXED VERSION
async function exportFormation() {
    soundFX.play('success');
    
    try {
        // Create a temporary export container with fixed positioning
        const exportContainer = await createExportContainer();
        
        // Load html2canvas dynamically if not available
        const loadHtml2Canvas = () => {
            return new Promise((resolve) => {
                if (typeof html2canvas !== 'undefined') {
                    resolve(html2canvas);
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = () => resolve(html2canvas);
                    document.head.appendChild(script);
                }
            });
        };

        const html2canvas = await loadHtml2Canvas();
        
        // Capture the export container with fixed positions
        const canvas = await html2canvas(exportContainer, {
            backgroundColor: '#0A5F38',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: 800,
            height: 600,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
            foreignObjectRendering: true
        });

        // Clean up the temporary container
        exportContainer.remove();
        
        // Download the image
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `FIFA-Formation-${currentFormation}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showDownloadFeedback();
        }, 'image/png');
        
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ Error exporting formation. Please try again.');
    }
}

// Create a temporary container for export with fixed positioning
async function createExportContainer() {
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
        position: fixed;
        top: -10000px;
        left: 0;
        width: 800px;
        height: 600px;
        background: linear-gradient(180deg, 
            #0A5F38 0%, 
            #0D8442 50%, 
            #0A5F38 100%
        );
        border: 4px solid white;
        z-index: 9999;
    `;
    
    // Add field lines
    const fieldLines = document.createElement('div');
    fieldLines.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(to bottom, transparent 49%, rgba(255,255,255,0.3) 50%, transparent 51%),
            linear-gradient(to right, transparent 49%, rgba(255,255,255,0.3) 50%, transparent 51%),
            radial-gradient(circle at 50% 50%, transparent 48%, rgba(255,255,255,0.3) 50%, transparent 52%);
        background-size: 100% 100%, 100% 100%, 100px 100px;
        background-position: center, center, center;
    `;
    exportContainer.appendChild(fieldLines);
    
    // Clone and reposition player cards with absolute pixel positions
    const playerCards = document.querySelectorAll('.player-card-on-field.fifa-card');
    
    for (const card of playerCards) {
        const clone = card.cloneNode(true);
        
        // Remove interactive elements
        clone.draggable = false;
        const removeBtn = clone.querySelector('.remove-player');
        if (removeBtn) removeBtn.remove();
        
        // Calculate absolute position from percentage
        const leftValue = card.style.left;
        const topValue = card.style.top;
        
        // Extract percentage from calc(X% - 55px) format
        const xPercent = parseFloat(leftValue.match(/(\d+(?:\.\d+)?)%/)?.[1] || 50);
        const yPercent = parseFloat(topValue.match(/(\d+(?:\.\d+)?)%/)?.[1] || 50);
        
        // Convert to absolute pixels for 800x600 container
        const absoluteX = (xPercent / 100) * 800 - 55; // 55px = half card width
        const absoluteY = (yPercent / 100) * 600 - 55; // 55px = half card height
        
        // Set absolute positioning
        clone.style.cssText = `
            position: absolute;
            left: ${absoluteX}px;
            top: ${absoluteY}px;
            width: 110px;
            z-index: 10;
            transform: none;
            transition: none;
        `;
        
        // Ensure image is properly sized
        const img = clone.querySelector('img');
        if (img) {
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
        }
        
        exportContainer.appendChild(clone);
    }
    
    // Add formation title
    const title = document.createElement('div');
    title.style.cssText = `
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-family: 'Cairo', sans-serif;
        font-weight: 900;
        font-size: 24px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        z-index: 20;
    `;
    title.textContent = `Formation: ${currentFormation}`;
    exportContainer.appendChild(title);
    
    // Add timestamp
    const timestamp = document.createElement('div');
    timestamp.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 20px;
        color: white;
        font-family: 'Cairo', sans-serif;
        font-size: 14px;
        opacity: 0.8;
        z-index: 20;
    `;
    timestamp.textContent = new Date().toLocaleDateString();
    exportContainer.appendChild(timestamp);
    
    document.body.appendChild(exportContainer);
    
    // Wait for images to load in the cloned container
    const images = exportContainer.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if image fails to load
            }
        });
    }));
    
    return exportContainer;
}

// Show download feedback
function showDownloadFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'download-feedback';
    feedback.textContent = '📥 Formation image downloaded!';
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10B981, #059669);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

// Show reposition feedback
function showRepositionFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'reposition-feedback';
    feedback.textContent = '✅ Player repositioned!';
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10B981, #059669);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
        animation: slideInRight 0.3s ease;
    `;
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// ...existing code for card loading, drag handling, etc...

// Load Player Cards from Card Creator
async function loadPlayerCards() {
    const container = availableCards;
    
    container.classList.add('loading');
    container.innerHTML = '<div class="loading-spinner">Loading your FIFA cards...</div>';
    
    try {
        const response = await fetch(`${API_URL}/get-cards`);
        const data = await response.json();
        
        if (data.success && data.cards.length > 0) {
            container.classList.remove('loading');
            container.innerHTML = '';
            
            data.cards.forEach((card, index) => {
                const cardElement = document.createElement('div');
                cardElement.className = 'fifa-card-mini';
                cardElement.draggable = true;
                cardElement.dataset.cardIndex = index;
                cardElement.dataset.cardImage = card.imageData;
                
                if (card.metadata) {
                    cardElement.dataset.metadata = JSON.stringify(card.metadata);
                }
                
                cardElement.innerHTML = `<img src="${card.imageData}" alt="FIFA Card" />`;
                
                // Add drag events
                cardElement.addEventListener('dragstart', handleCardDragStart);
                cardElement.addEventListener('dragend', handleCardDragEnd);
                
                container.appendChild(cardElement);
            });
            
            updateSidebarCardStates();
            
        } else {
            container.classList.remove('loading');
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎴</div>
                    <p class="empty-title">No FIFA Cards Yet</p>
                    <p class="empty-text">Create your first card using the Card Creator!</p>
                    <a href="/" class="btn-create-card">➕ Create Card</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading cards:', error);
        container.classList.remove('loading');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p class="error-title">Connection Error</p>
                <p class="error-text">Make sure the server is running.</p>
                <button onclick="loadPlayerCards()" class="btn-retry">🔄 Retry</button>
            </div>
        `;
    }
}

// Handle FIFA Card Drag Start
function handleCardDragStart(e) {
    console.log('🎮 Drag started!');
    const cardElement = e.target.closest('.fifa-card-mini');
    
    if (cardElement.dataset.metadata) {
        try {
            const metadata = JSON.parse(cardElement.dataset.metadata);
            if (isPlayerAlreadyOnField(metadata.name)) {
                e.preventDefault();
                console.log('⚠️ Cannot drag - player already on field:', metadata.name);
                
                cardElement.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    cardElement.style.animation = '';
                }, 500);
                
                return false;
            }
        } catch (err) {
            console.error('Error checking duplicate:', err);
        }
    }
    
    draggedElement = cardElement;
    cardElement.classList.add('dragging');
    
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('cardImage', cardElement.dataset.cardImage);
    
    if (cardElement.dataset.metadata) {
        e.dataTransfer.setData('metadata', cardElement.dataset.metadata);
    }
}

// Handle FIFA Card Drag End
function handleCardDragEnd(e) {
    const cardElement = e.target.closest('.fifa-card-mini');
    if (cardElement) {
        cardElement.classList.remove('dragging');
    }
    draggedElement = null;
}

// Create FIFA Card on Field
function createFIFACardOnField(imageData, x, y, metadata = null) {
    const cardElement = document.createElement('div');
    cardElement.className = 'player-card-on-field fifa-card';
    cardElement.draggable = true;
    cardElement.dataset.playerId = `fifa_${Date.now()}`;
    
    if (metadata) {
        cardElement.dataset.metadata = JSON.stringify(metadata);
        cardElement.dataset.name = metadata.name || 'Unknown';
        cardElement.dataset.rating = metadata.overall || 0;
        cardElement.dataset.pace = metadata.pac || 0;
        cardElement.dataset.shooting = metadata.sho || 0;
        cardElement.dataset.passing = metadata.pas || 0;
        cardElement.dataset.dribbling = metadata.dri || 0;
        cardElement.dataset.defense = metadata.def || 0;
        cardElement.dataset.physical = metadata.phy || 0;
        cardElement.dataset.position = metadata.position || 'SUB';
    }
    
    let playerInfoHTML = '';
    if (metadata) {
        playerInfoHTML = `
            <div class="player-info-overlay">
                <div class="player-name">${metadata.name}</div>
                <div class="player-stats">
                    <span class="stat-badge">${metadata.position}</span>
                    <span class="stat-badge">OVR ${metadata.overall}</span>
                </div>
            </div>
        `;
    }
    
    cardElement.innerHTML = `
        <img src="${imageData}" alt="FIFA Player Card" />
        ${playerInfoHTML}
        <button class="remove-player" onclick="removeFIFACard(this)">×</button>
    `;
    
    // Position the card (convert percentage to pixel position accounting for card size)
    cardElement.style.left = `calc(${x}% - 55px)`; // 55px = half of card width (110px)
    cardElement.style.top = `calc(${y}% - 55px)`;  // 55px = half of card height (approx)
    cardElement.style.transform = 'none';
    
    // Add hover sound
    cardElement.addEventListener('mouseenter', () => {
        soundFX.play('hover');
    });
    
    // Add drag events for repositioning
    cardElement.addEventListener('dragstart', (e) => {
        console.log('🔄 Repositioning drag started for:', metadata?.name || 'Unknown player');
        draggedElement = cardElement;
        cardElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        
        e.dataTransfer.setData('isRepositioning', 'true');
        e.dataTransfer.setData('cardId', cardElement.dataset.playerId);
        
        if (metadata) {
            e.dataTransfer.setData('metadata', JSON.stringify(metadata));
        }
        
        console.log('✅ Drag data set successfully');
    });
    
    cardElement.addEventListener('dragend', () => {
        console.log('🏁 Repositioning drag ended');
        cardElement.classList.remove('dragging');
        draggedElement = null;
    });
    
    cardElement.addEventListener('mousedown', () => {
        console.log('👆 Mouse down on card:', metadata?.name || 'Unknown');
    });
    
    playersOnField.appendChild(cardElement);
    
    console.log('🎯 Card created and drag events attached:', {
        draggable: cardElement.draggable,
        className: cardElement.className,
        playerId: cardElement.dataset.playerId,
        playerName: metadata?.name || 'Unknown'
    });
    
    updateRatingsWithFIFACards();
    updatePlayerCount();
    updateSidebarCardStates();
}

// Remove FIFA Card
function removeFIFACard(button) {
    const card = button.closest('.player-card-on-field');
    if (card) {
        soundFX.play('remove');
        
        card.style.transition = 'opacity 0.2s, transform 0.2s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            card.remove();
            updateRatingsWithFIFACards();
            updatePlayerCount();
            updateSidebarCardStates();
        }, 200);
    }
}

// Check if player already exists on field
function isPlayerAlreadyOnField(playerName) {
    const cardsOnField = document.querySelectorAll('.player-card-on-field.fifa-card');
    
    for (const card of cardsOnField) {
        const metadataStr = card.dataset.metadata;
        if (metadataStr) {
            try {
                const metadata = JSON.parse(metadataStr);
                if (metadata.name === playerName) {
                    return true;
                }
            } catch (e) {
                console.error('Error parsing card metadata:', e);
            }
        }
    }
    
    return false;
}

// Update sidebar cards to show which are already on field
function updateSidebarCardStates() {
    const sidebarCards = document.querySelectorAll('.fifa-card-mini');
    
    sidebarCards.forEach(card => {
        const metadataStr = card.dataset.metadata;
        if (metadataStr) {
            try {
                const metadata = JSON.parse(metadataStr);
                const isOnField = isPlayerAlreadyOnField(metadata.name);
                
                if (isOnField) {
                    card.classList.add('on-field');
                    card.style.opacity = '0.5';
                    card.style.filter = 'grayscale(70%)';
                    card.style.cursor = 'not-allowed';
                    
                    if (!card.querySelector('.on-field-badge')) {
                        const badge = document.createElement('div');
                        badge.className = 'on-field-badge';
                        badge.innerHTML = '✓ On Field';
                        card.appendChild(badge);
                    }
                } else {
                    card.classList.remove('on-field');
                    card.style.opacity = '1';
                    card.style.filter = 'none';
                    card.style.cursor = 'grab';
                    
                    const badge = card.querySelector('.on-field-badge');
                    if (badge) {
                        badge.remove();
                    }
                }
            } catch (e) {
                console.error('Error updating sidebar card state:', e);
            }
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveFormation();
    }
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (confirm('Reset formation?')) {
            initializeFormation();
        }
    }
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        loadPlayerCards();
    }
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportFormation();
    }
});
