// ===== Configuration =====
const API_URL = 'http://localhost:5000/api';

// ===== Language Translations =====
const translations = {
    ar: {
        // Header
        logoTitle: '⚽ منشئ بطاقات FIFA',
        logoSubtitle: 'FIFA Ultimate Team Card Creator',
        
        // Hero Section
        heroTitle: 'أنشئ بطاقتك المخصصة الآن!',
        heroSubtitle: 'صمم بطاقة FIFA احترافية للاعبك المفضل في دقائق',
        
        // Form Section
        sectionTitle: 'معلومات اللاعب',
        playerNameLabel: 'اسم اللاعب',
        playerNamePlaceholder: 'مثال: SALAH',
        playerNameHint: 'الاسم بالإنجليزية (حتى 12 حرف)',
        
        positionLabel: 'المركز',
        positionGroupAttack: '🎯 مهاجمين',
        positionGroupMid: '⚡ خط الوسط',
        positionGroupDef: '🛡️ الدفاع',
        positionGroupGK: '🥅 حراسة المرمى',
        
        clubLabel: 'النادي',
        countryLabel: 'الجنسية',
        leagueLabel: 'الدوري',
        cardTypeLabel: 'نوع البطاقة',
        
        statsTitle: 'الإحصائيات',
        overallLabel: 'التقييم العام',
        
        imageUploadLabel: 'صورة اللاعب',
        chooseImage: 'اختر صورة اللاعب',
        removeImage: '❌ إزالة الصورة',
        
        createButton: '🎨 إنشاء البطاقة',
        downloadButton: '📥 تحميل البطاقة',
          // Card Preview
        previewTitle: 'معاينة البطاقة',
        previewPlaceholder: 'املأ النموذج لمعاينة بطاقتك',
        
        // Messages
        creating: 'جاري إنشاء البطاقة...',
        success: '✅ تم إنشاء البطاقة بنجاح!',
        error: '❌ حدث خطأ أثناء إنشاء البطاقة'
    },
    en: {
        // Header
        logoTitle: '⚽ FIFA Card Creator',
        logoSubtitle: 'FIFA Ultimate Team Card Creator',
        
        // Hero Section
        heroTitle: 'Create Your Custom Card Now!',
        heroSubtitle: 'Design a professional FIFA card for your favorite player in minutes',
        
        // Form Section
        sectionTitle: 'Player Information',
        playerNameLabel: 'Player Name',
        playerNamePlaceholder: 'Example: SALAH',
        playerNameHint: 'Name in English (up to 12 characters)',
        
        positionLabel: 'Position',
        positionGroupAttack: '🎯 Attackers',
        positionGroupMid: '⚡ Midfield',
        positionGroupDef: '🛡️ Defense',
        positionGroupGK: '🥅 Goalkeeper',
        
        clubLabel: 'Club',
        countryLabel: 'Nationality',
        leagueLabel: 'League',
        cardTypeLabel: 'Card Type',
        
        statsTitle: 'Statistics',
        overallLabel: 'Overall Rating',
        
        imageUploadLabel: 'Player Image',
        chooseImage: 'Choose Player Image',
        removeImage: '❌ Remove Image',
        
        createButton: '🎨 Create Card',
        downloadButton: '📥 Download Card',
          // Card Preview
        previewTitle: 'Card Preview',
        previewPlaceholder: 'Fill out the form to preview your card',
        
        // Messages
        creating: 'Creating card...',
        success: '✅ Card created successfully!',
        error: '❌ Error creating card'
    }
};

// ===== DOM Elements =====
const form = document.getElementById('playerForm');
const cardPreview = document.getElementById('cardPreview');
const loadingIndicator = document.getElementById('loadingIndicator');
const successMessage = document.getElementById('successMessage');

// Image upload elements
const playerImageInput = document.getElementById('playerImage');
const fileNameDisplay = document.getElementById('fileName');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');

// Store uploaded image
let uploadedImage = null;

// ===== Range Sliders =====
const sliders = {
    overall: document.getElementById('overall'),
    pac: document.getElementById('pac'),
    sho: document.getElementById('sho'),
    pas: document.getElementById('pas'),
    dri: document.getElementById('dri'),
    def: document.getElementById('def'),
    phy: document.getElementById('phy')
};

const sliderValues = {
    overall: document.getElementById('overallValue'),
    pac: document.getElementById('pacValue'),
    sho: document.getElementById('shoValue'),
    pas: document.getElementById('pasValue'),
    dri: document.getElementById('driValue'),
    def: document.getElementById('defValue'),
    phy: document.getElementById('phyValue')
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initializeSliders();
    initializeForm();
    initializeImageUpload();
    loadPresets();
    initializeLanguageSwitcher();
});

// ===== Language Switcher =====
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.nav-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            switchLanguage(lang);
            
            // Update active button
            langButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

function switchLanguage(lang) {
    const html = document.documentElement;
    const t = translations[lang];
    
    // Update HTML attributes
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    // Update page title
    document.title = lang === 'ar' ? 'منشئ بطاقات FIFA Ultimate Team' : 'FIFA Ultimate Team Card Creator';
    
    // Update header
    document.querySelector('.logo h1').textContent = t.logoTitle;
    document.querySelector('.logo p').textContent = t.logoSubtitle;
    
    // Update hero section
    document.querySelector('.hero-title').textContent = t.heroTitle;
    document.querySelector('.hero-subtitle').textContent = t.heroSubtitle;
    
    // Update section title
    document.querySelector('.section-title').innerHTML = `<span class="icon">📝</span>${t.sectionTitle}`;
    
    // Update form labels
    const playerNameLabel = document.querySelector('label[for="playerName"]');
    if (playerNameLabel) {
        playerNameLabel.innerHTML = `<span class="label-icon">👤</span>${t.playerNameLabel}`;
    }
    
    const playerNameInput = document.getElementById('playerName');
    if (playerNameInput) {
        playerNameInput.placeholder = t.playerNamePlaceholder;
    }
    
    const playerNameHint = document.querySelector('.form-hint');
    if (playerNameHint) {
        playerNameHint.textContent = t.playerNameHint;
    }
    
    // Update other labels
    const positionLabel = document.querySelector('label[for="position"]');
    if (positionLabel) {
        positionLabel.innerHTML = `<span class="label-icon">🎯</span>${t.positionLabel}`;
    }
    
    const clubLabel = document.querySelector('label[for="club"]');
    if (clubLabel) {
        clubLabel.innerHTML = `<span class="label-icon">🏆</span>${t.clubLabel}`;
    }
    
    const countryLabel = document.querySelector('label[for="country"]');
    if (countryLabel) {
        countryLabel.innerHTML = `<span class="label-icon">🌍</span>${t.countryLabel}`;
    }
    
    const leagueLabel = document.querySelector('label[for="league"]');
    if (leagueLabel) {
        leagueLabel.innerHTML = `<span class="label-icon">🏅</span>${t.leagueLabel}`;
    }
    
    const cardTypeLabel = document.querySelector('label[for="cardType"]');
    if (cardTypeLabel) {
        cardTypeLabel.innerHTML = `<span class="label-icon">🎴</span>${t.cardTypeLabel}`;
    }
    
    const imageLabel = document.querySelector('label[for="playerImage"]');
    if (imageLabel) {
        imageLabel.innerHTML = `<span class="label-icon">📸</span>${t.imageUploadLabel}`;
    }
    
    const fileLabel = document.querySelector('.file-label');
    if (fileLabel) {
        fileLabel.textContent = t.chooseImage;
    }
    
    const removeButton = document.querySelector('.remove-image');
    if (removeButton) {
        removeButton.textContent = t.removeImage;
    }
    
    // Update create button
    const createButton = document.querySelector('.submit-btn');
    if (createButton) {
        createButton.textContent = t.createButton;
    }
      // Update card preview title
    const previewTitle = document.querySelector('.preview-card h3');
    if (previewTitle) {
        previewTitle.innerHTML = `<span class="icon">👁️</span>${t.previewTitle}`;
    }
    
    // Update preview placeholder
    const previewPlaceholder = document.querySelector('.preview-placeholder p');
    if (previewPlaceholder) {
        previewPlaceholder.textContent = t.previewPlaceholder;
    }
}

// ===== Image Upload Handler =====
function initializeImageUpload() {
    if (playerImageInput) {
        playerImageInput.addEventListener('change', handleImageUpload);
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('يرجى اختيار صورة بصيغة PNG, JPG أو WEBP');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت');
            return;
        }
        
        // Update file name display
        fileNameDisplay.textContent = file.name;
        
        // Read and preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImage = e.target.result;
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    uploadedImage = null;
    playerImageInput.value = '';
    fileNameDisplay.textContent = 'اختر صورة اللاعب';
    imagePreview.classList.add('hidden');
    previewImg.src = '';
}

// ===== Slider Handlers =====
function initializeSliders() {
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        const valueDisplay = sliderValues[key];
        
        if (slider && valueDisplay) {
            // Update display on input
            slider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value;
                updateSliderColor(slider, e.target.value);
            });
            
            // Initialize color
            updateSliderColor(slider, slider.value);
        }
    });
}

function updateSliderColor(slider, value) {
    const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
    const color = getStatColor(value);
    slider.style.background = `linear-gradient(to left, ${color} 0%, ${color} ${percentage}%, #dcdde1 ${percentage}%, #dcdde1 100%)`;
}

function getStatColor(value) {
    if (value >= 80) return '#4cd137';
    if (value >= 70) return '#fbc531';
    if (value >= 60) return '#e67e22';
    return '#e84118';
}

// ===== Form Handler =====
function initializeForm() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createCard();
    });
}

async function createCard() {
    try {
        // Show loading
        cardPreview.style.display = 'none';
        loadingIndicator.style.display = 'block';
        successMessage.style.display = 'none';

        // Get form data
        const formData = new FormData(form);
        const playerData = {
            name: formData.get('name').toUpperCase(),
            position: formData.get('position'),
            club: formData.get('club'),
            country: formData.get('country'),
            overall: parseInt(formData.get('overall')),
            pac: parseInt(formData.get('pac')),
            dri: parseInt(formData.get('dri')),
            sho: parseInt(formData.get('sho')),
            def: parseInt(formData.get('def')),
            pas: parseInt(formData.get('pas')),
            phy: parseInt(formData.get('phy')),
            cardType: formData.get('cardType')
        };
        
        // Add uploaded image if available
        if (uploadedImage) {
            playerData.image = uploadedImage;
        }

        // Validate
        if (!validatePlayerData(playerData)) {
            throw new Error('البيانات غير صحيحة');
        }        // Call API to create card
        const response = await fetch(`${API_URL}/create-card`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerData)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'فشل إنشاء البطاقة');
        }

        // Hide loading
        loadingIndicator.style.display = 'none';

        // Show the generated card image
        if (result.imageData) {
            displayGeneratedCard(result.imageData, result.filename);
        }

        // Show success message
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);

    } catch (error) {
        console.error('Error creating card:', error);
        loadingIndicator.style.display = 'none';
        alert('حدث خطأ أثناء إنشاء البطاقة: ' + error.message);
    }
}

function displayGeneratedCard(imageData, filename) {
    // Store for download
    window.currentCardImage = imageData;
    window.currentCardFilename = filename;

    // Create or update preview image
    if (!cardPreview) {
        const previewSection = document.querySelector('.preview-section');
        const preview = document.createElement('div');
        preview.id = 'cardPreview';
        preview.className = 'generated-card-preview';
        previewSection.appendChild(preview);
    }

    // Show the generated image
    cardPreview.innerHTML = `
        <img src="${imageData}" alt="Generated FIFA Card" class="generated-card-image">
        <div class="download-buttons">
            <button onclick="downloadCard()" class="btn btn-primary">
                <span>📥</span>
                تحميل البطاقة
            </button>
        </div>
    `;
    cardPreview.style.display = 'block';
}

function downloadCard() {
    if (!window.currentCardImage || !window.currentCardFilename) {
        alert('لا توجد بطاقة للتحميل');
        return;
    }

    // Create download link with proper download attribute
    const link = document.createElement('a');
    link.href = window.currentCardImage;
    link.download = window.currentCardFilename || `fifa_card_${Date.now()}.png`;
    link.style.display = 'none';
    
    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up after a short delay
    setTimeout(() => {
        document.body.removeChild(link);
        console.log('✅ Card downloaded to Downloads folder');
    }, 100);
    
    // Show success message
    showNotification('تم تحميل البطاقة بنجاح! ✅', 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#00b894' : '#0984e3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function validatePlayerData(data) {
    // Name validation
    if (!data.name || data.name.length > 12) {
        alert('الاسم يجب أن يكون أقل من 12 حرف');
        return false;
    }

    // Stats validation
    const stats = ['overall', 'pac', 'dri', 'sho', 'def', 'pas', 'phy'];
    for (const stat of stats) {
        if (data[stat] < 0 || data[stat] > 99) {
            alert(`قيمة ${stat} يجب أن تكون بين 0 و 99`);
            return false;
        }
    }

    return true;
}

async function simulateCardCreation(playerData) {
    // Try to call the real API
    try {
        const response = await fetch(`${API_URL}/create-card`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerData)
        });

        if (!response.ok) {
            throw new Error('API call failed');
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        // Store filename for download
        window.lastCreatedCard = data.filename;
        
        return data;
    } catch (error) {
        console.warn('API not available, simulating...', error);
        // Fallback to simulation if API not available
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Creating card with data:', playerData);
                resolve();
            }, 2000);
        });
    }
}

function displayCardPreview(data) {
    const cardTypeColors = {
        'RARE_GOLD': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        'IF_GOLD': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'TOTY': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'TOTS': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'MOTM': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'ICON': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'HERO': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'UCL_RARE': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'UCL_COMMON': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };

    const gradient = cardTypeColors[data.cardType] || cardTypeColors['RARE_GOLD'];

    cardPreview.innerHTML = `
        <div class="fifa-card" style="background: ${gradient};">
            <div class="card-header">
                <div class="rating">${data.overall}</div>
                <div class="position">${data.position}</div>
            </div>
            <div class="player-name">${data.name}</div>
            <div class="stats">
                <div class="stat-row">
                    <div class="stat"><span>⚡</span> ${data.pac}</div>
                    <div class="stat"><span>🎯</span> ${data.sho}</div>
                </div>
                <div class="stat-row">
                    <div class="stat"><span>🎁</span> ${data.pas}</div>
                    <div class="stat"><span>🏃</span> ${data.dri}</div>
                </div>
                <div class="stat-row">
                    <div class="stat"><span>🛡️</span> ${data.def}</div>
                    <div class="stat"><span>💪</span> ${data.phy}</div>
                </div>
            </div>
            <div class="card-footer">
                <span class="country-flag">${getCountryFlag(data.country)}</span>
                <span class="club-badge">⚽</span>
            </div>
        </div>
    `;

    cardPreview.style.display = 'flex';

    // Add FIFA card styles
    addFifaCardStyles();
}

function addFifaCardStyles() {
    if (document.getElementById('fifaCardStyles')) return;

    const style = document.createElement('style');
    style.id = 'fifaCardStyles';
    style.textContent = `
        .fifa-card {
            width: 300px;
            height: 450px;
            border-radius: 16px;
            padding: 2rem;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            animation: cardAppear 0.5s ease;
        }

        @keyframes cardAppear {
            from {
                opacity: 0;
                transform: scale(0.8) rotateY(90deg);
            }
            to {
                opacity: 1;
                transform: scale(1) rotateY(0);
            }
        }

        .fifa-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            z-index: 0;
        }

        .fifa-card > * {
            position: relative;
            z-index: 1;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .rating {
            font-size: 3rem;
            font-weight: 900;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }

        .position {
            font-size: 1.5rem;
            font-weight: 700;
            background: rgba(0,0,0,0.3);
            padding: 0.5rem 1rem;
            border-radius: 8px;
        }

        .player-name {
            font-size: 1.75rem;
            font-weight: 900;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            margin: 1rem 0;
        }

        .stats {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .stat-row {
            display: flex;
            justify-content: space-around;
        }

        .stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            background: rgba(0,0,0,0.3);
            padding: 0.75rem;
            border-radius: 8px;
            min-width: 70px;
        }

        .stat span {
            font-size: 1.5rem;
        }

        .card-footer {
            display: flex;
            justify-content: space-around;
            align-items: center;
            font-size: 2rem;
        }
    `;
    document.head.appendChild(style);
}

function getCountryFlag(countryCode) {
    const flags = {
        'eg': '🇪🇬', 'sa': '🇸🇦', 'ma': '🇲🇦', 'dz': '🇩🇿', 'tn': '🇹🇳',
        'ae': '🇦🇪', 'qa': '🇶🇦', 'ar': '🇦🇷', 'br': '🇧🇷', 'pt': '🇵🇹',
        'es': '🇪🇸', 'fr': '🇫🇷', 'gb': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'de': '🇩🇪', 'it': '🇮🇹', 'nl': '🇳🇱'
    };
    return flags[countryCode] || '🌍';
}

// ===== Preset Functions =====
function loadPresets() {
    window.fillSalah = () => {
        setFormValues({
            name: 'SALAH',
            position: 'RW',
            club: '10',
            country: 'eg',
            overall: 90,
            pac: 93,
            dri: 90,
            sho: 87,
            def: 45,
            pas: 81,
            phy: 75,
            cardType: 'TOTY'
        });
    };

    window.fillRonaldo = () => {
        setFormValues({
            name: 'RONALDO',
            position: 'ST',
            club: '112883',
            country: 'pt',
            overall: 99,
            pac: 91,
            dri: 89,
            sho: 95,
            def: 35,
            pas: 82,
            phy: 78,
            cardType: 'ICON'
        });
    };

    window.fillMessi = () => {
        setFormValues({
            name: 'MESSI',
            position: 'RW',
            club: '241',
            country: 'ar',
            overall: 94,
            pac: 92,
            dri: 95,
            sho: 88,
            def: 24,
            pas: 86,
            phy: 62,
            cardType: 'TOTY'
        });
    };

    window.resetForm = () => {
        form.reset();
        Object.keys(sliders).forEach(key => {
            const slider = sliders[key];
            const valueDisplay = sliderValues[key];
            if (slider && valueDisplay) {
                valueDisplay.textContent = slider.value;
                updateSliderColor(slider, slider.value);
            }
        });
        cardPreview.innerHTML = `
            <div class="preview-placeholder">
                <div class="placeholder-icon">⚽</div>
                <p>املأ النموذج لمعاينة بطاقتك</p>
            </div>
        `;
        successMessage.style.display = 'none';
    };
}

function setFormValues(values) {
    // Set text inputs
    document.getElementById('playerName').value = values.name;
    
    // Set selects
    document.getElementById('position').value = values.position;
    document.getElementById('club').value = values.club;
    document.getElementById('country').value = values.country;
    document.getElementById('cardType').value = values.cardType;
    
    // Set sliders
    Object.keys(sliders).forEach(key => {
        if (values[key] !== undefined) {
            const slider = sliders[key];
            const valueDisplay = sliderValues[key];
            slider.value = values[key];
            valueDisplay.textContent = values[key];
            updateSliderColor(slider, values[key]);
        }
    });
}

// ===== Helper Functions =====
window.downloadCard = () => {
    alert('سيتم تحميل البطاقة من: finished-fut-cards/');
    // In a real implementation, this would trigger a download
};

window.openGuide = () => {
    window.open('START_HERE.md', '_blank');
};

window.openExamples = () => {
    alert('تشغيل ملف الأمثلة: python examples.py');
};

window.openGitHub = () => {
    window.open('https://github.com', '_blank');
};

// ===== Language Toggle =====
const langButtons = document.querySelectorAll('.nav-btn');
langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        toggleLanguage(lang);
        
        // Update active state
        langButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

function toggleLanguage(lang) {
    if (lang === 'en') {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
        // Update text content for English
        updateUIText('en');
    } else {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        // Update text content for Arabic
        updateUIText('ar');
    }
}

function updateUIText(lang) {
    // This is a simplified version - in production, use i18n library
    if (lang === 'en') {
        document.querySelector('.logo h1').textContent = '⚽ FIFA Card Creator';
        document.querySelector('.logo p').textContent = 'Create Your Ultimate Team Card';
    } else {
        document.querySelector('.logo h1').textContent = '⚽ منشئ بطاقات FIFA';
        document.querySelector('.logo p').textContent = 'FIFA Ultimate Team Card Creator';
    }
}

// ===== Console Welcome Message =====
console.log('%c⚽ FIFA Card Creator', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cWelcome to FIFA Ultimate Team Card Creator!', 'font-size: 14px; color: #764ba2;');
console.log('%cمرحباً بك في منشئ بطاقات FIFA Ultimate Team!', 'font-size: 14px; color: #764ba2;');
