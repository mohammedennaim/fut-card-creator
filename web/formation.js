// Formation Planner JavaScript (Updated with Snapping and Fixed Export)

// API Configuration
const API_URL = 'http://localhost:5000/api';

// Formation positions (percentages relative to field) - Cards FULLY inside field
const formations = {
    '1-2-2-1': [
        { position: 'GK', x: 50, y: 72, rating: 85, name: 'KEEPER' },
        { position: 'LB', x: 25, y: 55, rating: 82, name: 'DEFENDER 1' },
        { position: 'RB', x: 75, y: 55, rating: 83, name: 'DEFENDER 2' },
        { position: 'LM', x: 28, y: 38, rating: 84, name: 'MIDFIELDER 1' },
        { position: 'RM', x: 72, y: 38, rating: 85, name: 'MIDFIELDER 2' },
        { position: 'ST', x: 50, y: 20, rating: 88, name: 'STRIKER' }
    ],
    '1-3-1-1': [
        { position: 'GK', x: 50, y: 72, rating: 85, name: 'KEEPER' },
        { position: 'LB', x: 22, y: 55, rating: 82, name: 'DEFENDER 1' },
        { position: 'CB', x: 50, y: 58, rating: 84, name: 'DEFENDER 2' },
        { position: 'RB', x: 78, y: 55, rating: 83, name: 'DEFENDER 3' },
        { position: 'CM', x: 50, y: 38, rating: 85, name: 'MIDFIELDER' },
        { position: 'ST', x: 50, y: 20, rating: 88, name: 'STRIKER' }
    ],
    '1-1-3-1': [
        { position: 'GK', x: 50, y: 72, rating: 85, name: 'KEEPER' },
        { position: 'CB', x: 50, y: 55, rating: 84, name: 'DEFENDER' },
        { position: 'LM', x: 25, y: 38, rating: 83, name: 'MIDFIELDER 1' },
        { position: 'CM', x: 50, y: 42, rating: 85, name: 'MIDFIELDER 2' },
        { position: 'RM', x: 75, y: 38, rating: 84, name: 'MIDFIELDER 3' },
        { position: 'ST', x: 50, y: 20, rating: 88, name: 'STRIKER' }
    ],
    '1-2-1-2': [
        { position: 'GK', x: 50, y: 72, rating: 85, name: 'KEEPER' },
        { position: 'LB', x: 25, y: 55, rating: 82, name: 'DEFENDER 1' },
        { position: 'RB', x: 75, y: 55, rating: 83, name: 'DEFENDER 2' },
        { position: 'CM', x: 50, y: 38, rating: 85, name: 'MIDFIELDER' },
        { position: 'LW', x: 32, y: 20, rating: 86, name: 'WINGER 1' },
        { position: 'RW', x: 68, y: 20, rating: 87, name: 'WINGER 2' }
    ],
    '1-1-2-2': [
        { position: 'GK', x: 50, y: 72, rating: 85, name: 'KEEPER' },
        { position: 'CB', x: 50, y: 55, rating: 84, name: 'DEFENDER' },
        { position: 'LM', x: 30, y: 42, rating: 83, name: 'MIDFIELDER 1' },
        { position: 'RM', x: 70, y: 42, rating: 84, name: 'MIDFIELDER 2' },
        { position: 'LS', x: 35, y: 20, rating: 87, name: 'STRIKER 1' },
        { position: 'RS', x: 65, y: 20, rating: 88, name: 'STRIKER 2' }
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
            card.style.left = `calc(${position.x}% - 65px)`; // 65px = half of card width (130px)
            card.style.top = `calc(${position.y}% - 65px)`;  // 65px = half of card height

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

        // Parse calc(X% - 65px) to get X
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
        draggedElement.style.left = `calc(${x}% - 65px)`; // Center the card properly (130px / 2)
        draggedElement.style.top = `calc(${y}% - 65px)`;

        // Update metadata position if snapped
        if (snappedSlot) {
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

// Export Formation as Image - ENHANCED VERSION
async function exportFormation() {
    console.log('🚀 Starting formation export...');
    soundFX.play('success');

    // Show loading overlay
    const loadingOverlay = showLoadingOverlay('🎨 Generating formation image...');

    try {
        // Check if there are any cards on the field
        const cardsOnField = document.querySelectorAll('.player-card-on-field.fifa-card');
        console.log(`📊 Found ${cardsOnField.length} cards on field`);

        if (cardsOnField.length === 0) {
            loadingOverlay.remove();
            alert('⚠️ No players on field to export! Add some players first.');
            return;
        }

        // Create a temporary export container with fixed positioning
        console.log('📦 Creating export container...');
        const exportContainer = await createExportContainer();

        // Append to body
        document.body.appendChild(exportContainer);

        // Make it visible temporarily for capture
        exportContainer.style.opacity = '1';

        // Wait a bit for rendering
        await new Promise(resolve => setTimeout(resolve, 200));

        // Load html2canvas dynamically if not available
        const loadHtml2Canvas = () => {
            return new Promise((resolve) => {
                if (typeof window.html2canvas !== 'undefined') {
                    resolve(window.html2canvas);
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = () => resolve(window.html2canvas);
                    document.head.appendChild(script);
                }
            });
        }; const html2canvasLib = await loadHtml2Canvas();        // Capture the export container with optimized settings
        console.log('📸 Starting html2canvas capture...');
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
            foreignObjectRendering: true,
            logging: false,
            removeContainer: false,
            async: true,
            imageTimeout: 30000,
            onclone: function (clonedDoc) {
                console.log('🔄 HTML2Canvas cloned document');
                // Ensure all elements in clone are visible and properly styled
                const allElements = clonedDoc.querySelectorAll('*');
                allElements.forEach(el => {
                    if (el.style) {
                        el.style.opacity = '1';
                        el.style.visibility = 'visible';
                        // Fix any potential font issues
                        if (el.style.fontFamily) {
                            el.style.fontFamily = "'Cairo', 'Arial', sans-serif";
                        }
                    }
                });

                // Ensure SVG elements are properly styled
                const svgElements = clonedDoc.querySelectorAll('svg, svg *');
                svgElements.forEach(el => {
                    if (el.style) {
                        el.style.display = 'block';
                        el.style.visibility = 'visible';
                    }
                });
            }
        });
        console.log('✅ Canvas captured successfully');

        // Clean up the temporary container
        exportContainer.remove();

        // Check if canvas is empty (fallback to direct field capture)
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const isEmpty = imageData.data.every((value, index) => index % 4 === 3 ? true : value === 0);
        if (isEmpty) {
            console.log('⚠️ Canvas appears empty, trying direct field capture...');
            loadingOverlay.remove();
            return exportFormationDirect();
        }
        // Remove loading overlay and show image preview
        loadingOverlay.remove();
        showImagePreview(canvas);

    } catch (error) {
        loadingOverlay.remove();
        console.error('Export error:', error);
        alert('❌ Error exporting formation. Please try again.');
    }
}

// Create a temporary container for export with fixed positioning
async function createExportContainer() {
    const exportContainer = document.createElement('div');
    exportContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 1200px;
        height: 800px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        border-radius: 20px;
        z-index: 99999;
        font-family: 'Cairo', sans-serif;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
    `;
    // Add enhanced header with formation info
    const header = document.createElement('div');
    header.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 90px;
        background: linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        border-bottom: 4px solid rgba(255,255,255,0.1);
        z-index: 30;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;

    header.innerHTML = `
        <div style="text-align: center;">
            <h1 style="color: #ffffff; font-size: 36px; font-weight: 900; margin: 0; text-shadow: 3px 3px 6px rgba(0,0,0,0.8); letter-spacing: 1px;">
                ⚽ FORMATION: ${currentFormation}
            </h1>
            <p style="color: #e2e8f0; font-size: 16px; margin: 8px 0 0 0; opacity: 0.9; font-weight: 600; letter-spacing: 0.5px;">
                🗓️ ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
    `;
    // Add main field container with enhanced styling
    const fieldContainer = document.createElement('div');
    fieldContainer.style.cssText = `
        position: absolute;
        top: 100px;
        left: 50px;
        width: 1100px;
        height: 640px;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        border: 4px solid rgba(255,255,255,0.1);
        border-radius: 20px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 4px 20px rgba(0,0,0,0.3), 0 8px 25px rgba(0,0,0,0.4);
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
    // Load and use your custom stadium field SVG from assets/field-bg.svg
    stadiumField.innerHTML = `
        <svg style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;" viewBox="0 0 904 650" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M903 649.439H1L120.311 1H783.788L903 649.439Z" fill="#1a472a" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M69.8843 275.038H834.169" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M550.992 275.425C553.194 321.703 508.921 360.763 452.019 360.763C395.117 360.763 350.853 321.703 353.062 275.425C355.172 231.123 399.452 196.564 452.035 196.564C504.618 196.564 548.90 231.115 550.992 275.425Z" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M541.288 71.4008C543.078 109.009 503.086 140.632 451.897 140.632C400.708 140.632 360.732 109.017 362.53 71.4008C364.259 35.2446 404.251 6.93591 451.92 6.93591C499.582 6.93591 539.574 35.2446 541.288 71.4008Z" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M269.125 96.4996H640.093L630.663 1.1532H278.312L269.125 96.4996Z" fill="#1a472a" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M371.922 54.7625H532.542L530.219 1.13715H374.245L371.922 54.7625Z" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M343.464 530.333C346.061 474.554 395.78 431.261 454.624 431.261C513.469 431.261 563.279 474.554 565.998 530.333C568.855 588.91 519.151 638.6 454.853 638.6C390.554 638.6 340.737 588.91 343.471 530.333H343.464Z" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M675.597 492.572H227.26L211.911 649.198H690.84L675.597 492.572Z" fill="#1a472a" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
            <path d="M556.362 556.642H352.353L348.43 649.238H560.453L556.362 556.642Z" stroke="#4CAF50" stroke-width="2" stroke-miterlimit="10"/>
        </svg>
    `;

    fieldContainer.appendChild(stadiumField);
    exportContainer.appendChild(header);
    exportContainer.appendChild(fieldContainer);

    // Clone and reposition player cards - NO labels, cards inside field
    const playerCards = document.querySelectorAll('.player-card-on-field.fifa-card');
    console.log(`📋 Found ${playerCards.length} player cards to export`);

    for (const card of playerCards) {
        // Calculate position relative to the stadium field (900x600)
        const leftValue = card.style.left;
        const topValue = card.style.top;

        const xPercent = parseFloat(leftValue.match(/(\d+(?:\.\d+)?)%/)?.[1] || 50);
        const yPercent = parseFloat(topValue.match(/(\d+(?:\.\d+)?)%/)?.[1] || 50);

        // Convert to absolute pixels - adjusted to keep cards INSIDE field
        // Field is 900x600, card is 100px wide
        const cardWidth = 100;
        const cardHeight = 140;

        // Calculate position with proper margins to stay inside field
        let absoluteX = (xPercent / 100) * 900 - (cardWidth / 2);
        let absoluteY = (yPercent / 100) * 600 - (cardHeight / 2);

        // Clamp positions to keep cards inside the field
        absoluteX = Math.max(10, Math.min(absoluteX, 900 - cardWidth - 10));
        absoluteY = Math.max(10, Math.min(absoluteY, 600 - cardHeight - 10));

        console.log(`📍 Card position: ${xPercent}%, ${yPercent}% -> ${absoluteX}px, ${absoluteY}px`);

        // Create card container - just the card, no label
        const cardContainer = document.createElement('div');
        cardContainer.style.cssText = `
            position: absolute;
            left: ${absoluteX}px;
            top: ${absoluteY}px;
            z-index: 25;
        `;

        // Create card image
        const cardImg = card.querySelector('img');
        if (cardImg) {
            const imgClone = cardImg.cloneNode(true);
            imgClone.style.cssText = `
                width: ${cardWidth}px;
                height: auto;
                border-radius: 8px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.6);
                filter: brightness(1.1) contrast(1.05);
            `;
            cardContainer.appendChild(imgClone);
        }

        stadiumField.appendChild(cardContainer);
        console.log('✅ Card added to export (no label)');
    }
    // Add enhanced footer with team statistics
    const footer = document.createElement('div');
    footer.style.cssText = `
        position: absolute;
        bottom: 15px;
        left: 50px;
        right: 50px;
        height: 60px;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(30, 30, 30, 0.95));
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 35px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 6px 25px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.1);
        backdrop-filter: blur(15px);
    `;

    const playerCount = document.querySelectorAll('.player-card-on-field.fifa-card').length;
    const overallRating = document.getElementById('overallRating')?.textContent || '--';

    footer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 40px;">
            <div style="color: white; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">
                <span style="color: #22c55e; text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);">⚽ Players:</span> ${playerCount}/6
            </div>
            <div style="color: white; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">
                <span style="color: #3b82f6; text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);">📊 Overall:</span> ${overallRating}
            </div>
        </div>
        <div style="color: #94a3b8; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
            🏟️ FIFA Formation Planner
        </div>
    `;

    exportContainer.appendChild(footer);
    document.body.appendChild(exportContainer);
    // Wait for images to load in the cloned container
    const images = exportContainer.querySelectorAll('img');
    console.log(`🖼️ Waiting for ${images.length} images to load...`);

    // Enhanced image loading with crossOrigin support
    await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
                console.log('✅ Image already loaded:', img.src);
                resolve();
            } else {
                // Set crossOrigin to handle CORS issues
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    console.log('✅ Image loaded:', img.src);
                    resolve();
                };
                img.onerror = () => {
                    console.log('❌ Image failed to load, trying without CORS:', img.src);
                    // Try without crossOrigin as fallback
                    img.crossOrigin = null;
                    img.onload = () => {
                        console.log('✅ Image loaded (fallback):', img.src);
                        resolve();
                    };
                    img.onerror = () => {
                        console.log('❌ Image completely failed to load:', img.src);
                        resolve(); // Continue even if image fails to load
                    };

                    // Force reload
                    const src = img.src;
                    img.src = '';
                    img.src = src;
                };

                // Force reload if not loaded
                const src = img.src;
                img.src = '';
                img.src = src;
            }
        });
    }));

    console.log('✅ All images processed, ready for export');

    // Additional delay to ensure everything is rendered properly
    await new Promise(resolve => setTimeout(resolve, 1500));

    return exportContainer;
}

// Show loading overlay during export
function showLoadingOverlay(message) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 60px;
        height: 60px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #10B981;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    `;

    const text = document.createElement('div');
    text.textContent = message;
    text.style.cssText = `
        color: white;
        font-family: 'Cairo', sans-serif;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
    `;

    overlay.appendChild(spinner);
    overlay.appendChild(text);
    document.body.appendChild(overlay);

    // Add CSS animation keyframes
    if (!document.querySelector('#loading-animations')) {
        const style = document.createElement('style');
        style.id = 'loading-animations';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    return overlay;
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

// Show Image Preview Modal
function showImagePreview(canvas) {
    // Convert canvas to image URL
    const imageUrl = canvas.toDataURL('image/png');

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'image-preview-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 100000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;

    // Create preview container
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = `
        max-width: 90%;
        max-height: 80%;
        background: white;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
        background: linear-gradient(135deg, #1E3A8A, #3B82F6);
        color: white;
        padding: 20px;
        text-align: center;
        font-family: 'Cairo', sans-serif;
        font-weight: 700;
        font-size: 18px;
    `;
    header.innerHTML = `
        <div>🏟️ FIFA Formation Preview</div>
        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">Formation: ${currentFormation}</div>
    `;

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f8fafc;
    `;

    // Create preview image
    const previewImage = document.createElement('img');
    previewImage.src = imageUrl;
    previewImage.style.cssText = `
        max-width: 100%;
        max-height: 500px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
        padding: 20px;
        display: flex;
        gap: 15px;
        justify-content: center;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
    `;

    // Create download button
    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '📥 Download Image';
    downloadBtn.style.cssText = `
        background: linear-gradient(135deg, #10B981, #059669);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Cairo', sans-serif;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    `;

    downloadBtn.onmouseover = () => {
        downloadBtn.style.transform = 'translateY(-2px)';
        downloadBtn.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
    };

    downloadBtn.onmouseout = () => {
        downloadBtn.style.transform = 'translateY(0)';
        downloadBtn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
    };
    downloadBtn.onclick = () => {
        try {
            // Enhanced download with error handling
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob from canvas');
                    alert('❌ Failed to create image. Please try again.');
                    return;
                }

                try {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `FIFA-Formation-${currentFormation}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    showDownloadFeedback();
                    console.log('✅ Image downloaded successfully');
                } catch (downloadError) {
                    console.error('Download error:', downloadError);
                    alert('❌ Failed to download image. Please try again.');
                }
            }, 'image/png', 1.0);
        } catch (error) {
            console.error('Canvas to blob error:', error);
            alert('❌ Failed to process image. Please try again.');
        }

        modal.remove();
    };

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✖️ Close';
    closeBtn.style.cssText = `
        background: linear-gradient(135deg, #6B7280, #4B5563);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Cairo', sans-serif;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    closeBtn.onmouseover = () => {
        closeBtn.style.transform = 'translateY(-2px)';
    };

    closeBtn.onmouseout = () => {
        closeBtn.style.transform = 'translateY(0)';
    };

    closeBtn.onclick = () => {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    };

    // Create share button (optional)
    const shareBtn = document.createElement('button');
    shareBtn.innerHTML = '📤 Share';
    shareBtn.style.cssText = `
        background: linear-gradient(135deg, #3B82F6, #1D4ED8);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Cairo', sans-serif;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;

    shareBtn.onmouseover = () => {
        shareBtn.style.transform = 'translateY(-2px)';
    };

    shareBtn.onmouseout = () => {
        shareBtn.style.transform = 'translateY(0)';
    };

    shareBtn.onclick = () => {
        // Copy image to clipboard if supported
        if (navigator.clipboard && canvas.toBlob) {
            canvas.toBlob((blob) => {
                navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]).then(() => {
                    alert('🎯 Formation image copied to clipboard!');
                }).catch(() => {
                    alert('📋 Share feature not supported in this browser. Use download instead.');
                });
            }, 'image/png');
        } else {
            alert('📋 Share feature not supported in this browser. Use download instead.');
        }
    };

    // Assemble the modal
    imageContainer.appendChild(previewImage);
    buttonsContainer.appendChild(downloadBtn);
    buttonsContainer.appendChild(shareBtn);
    buttonsContainer.appendChild(closeBtn);
    previewContainer.appendChild(header);
    previewContainer.appendChild(imageContainer);
    previewContainer.appendChild(buttonsContainer);
    modal.appendChild(previewContainer);

    // Add close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    };

    // Add keyboard support
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
            document.removeEventListener('keydown', escHandler);
        }
    });

    // Add to DOM with fade in animation
    document.body.appendChild(modal);

    console.log('🖼️ Image preview modal displayed');
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
    cardElement.style.left = `calc(${x}% - 65px)`; // 65px = half of card width (130px)
    cardElement.style.top = `calc(${y}% - 65px)`;  // 65px = half of card height (approx)
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

// Fallback export method - capture field directly
async function exportFormationDirect() {
    console.log('🎯 Using direct field capture method...');

    // Show loading overlay
    const loadingOverlay = showLoadingOverlay('🎨 Generating formation image...');

    try {
        const loadHtml2Canvas = () => {
            return new Promise((resolve) => {
                if (typeof window.html2canvas !== 'undefined') {
                    resolve(window.html2canvas);
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                    script.onload = () => resolve(window.html2canvas);
                    document.head.appendChild(script);
                }
            });
        };

        const html2canvasLib = await loadHtml2Canvas();

        // Create professional export container (same as main export)
        const exportContainer = await createExportContainer();

        // Append to body and make visible for capture
        document.body.appendChild(exportContainer);
        exportContainer.style.opacity = '1';

        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log('📸 Capturing export container...'); const canvas = await html2canvasLib(exportContainer, {
            backgroundColor: '#1a1a2e',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: 1200,
            height: 800,
            logging: false,
            foreignObjectRendering: true,
            removeContainer: false,
            imageTimeout: 30000,
            onclone: function (clonedDoc) {
                console.log('🔄 Direct capture - HTML2Canvas cloned document');
                // Ensure all elements are visible and properly styled
                const allElements = clonedDoc.querySelectorAll('*');
                allElements.forEach(el => {
                    if (el.style) {
                        el.style.opacity = '1';
                        el.style.visibility = 'visible';
                        if (el.style.fontFamily) {
                            el.style.fontFamily = "'Cairo', 'Arial', sans-serif";
                        }
                    }
                });

                // Ensure SVG elements are properly styled
                const svgElements = clonedDoc.querySelectorAll('svg, svg *');
                svgElements.forEach(el => {
                    if (el.style) {
                        el.style.display = 'block';
                        el.style.visibility = 'visible';
                    }
                });
            }
        });

        // Clean up
        exportContainer.remove();

        console.log('✅ Direct canvas captured successfully');

        // Remove loading overlay and show image preview
        loadingOverlay.remove();
        showImagePreview(canvas);
    } catch (error) {
        loadingOverlay.remove();
        console.error('Direct export error:', error);
        alert('❌ Error exporting formation. Please try again.');
    }
}

// Debug function to test export components
function debugExport() {
    const cards = document.querySelectorAll('.player-card-on-field.fifa-card');
    console.log('🔍 Debug Export Info:');
    console.log(`- Found ${cards.length} cards on field`);

    cards.forEach((card, index) => {
        const img = card.querySelector('img');
        console.log(`Card ${index + 1}:`);
        console.log(`  - Position: ${card.style.left}, ${card.style.top}`);
        console.log(`  - Image src: ${img ? img.src : 'No image'}`);
        console.log(`  - Image loaded: ${img ? img.complete : 'No image'}`);
        console.log(`  - Card visible: ${card.offsetWidth > 0 && card.offsetHeight > 0}`);
    });
}

// Add debug button (temporary)
if (document.getElementById('exportBtn')) {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Debug Export';
    debugBtn.style.cssText = 'margin-left: 10px; padding: 8px; background: #orange; color: white; border: none; border-radius: 4px;';
    debugBtn.onclick = debugExport;
    document.getElementById('exportBtn').parentNode.appendChild(debugBtn);
}
