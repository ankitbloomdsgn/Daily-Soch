// App Version Control
const APP_VERSION = '1.4';
const TOAST_DISMISS_DURATION = 24 * 60 * 60 * 1000;

function checkForUpdates() {
    const lastVersion = localStorage.getItem('appVersion');
    const lastDismissed = localStorage.getItem('toastDismissedAt');
    const now = Date.now();
    
    const shouldShow = (lastVersion && lastVersion !== APP_VERSION) || 
                       (lastDismissed && (now - parseInt(lastDismissed)) > TOAST_DISMISS_DURATION);
    
    if (shouldShow) {
        setTimeout(showUpdateToast, 2000);
    }
    
    if (!lastVersion) {
        localStorage.setItem('appVersion', APP_VERSION);
    }
}

function showUpdateToast() {
    const toast = document.getElementById('updateToast');
    const overlay = document.getElementById('toastOverlay');
    
    if (toast) {
        toast.classList.add('show');
    }
    
    if (overlay) {
        overlay.classList.add('show');
    }
}

function hideUpdateToast() {
    const toast = document.getElementById('updateToast');
    const overlay = document.getElementById('toastOverlay');
    
    if (toast) {
        toast.classList.remove('show');
    }
    
    if (overlay) {
        overlay.classList.remove('show');
    }
}

function updateApp() {
    localStorage.setItem('appVersion', APP_VERSION);
    localStorage.removeItem('toastDismissedAt');
    
    const toast = document.getElementById('updateToast');
    if (toast) {
        toast.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚡</div>
                <h3 style="margin: 0 0 8px 0; color: #1f2937;">Updating...</h3>
                <p style="margin: 0; color: #6b7280;">Please wait a moment</p>
            </div>
        `;
    }
    
    setTimeout(() => {
        window.location.reload(true);
    }, 800);
}

function dismissToast() {
    localStorage.setItem('toastDismissedAt', Date.now().toString());
    hideUpdateToast();
}

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('toastOverlay');
    if (overlay) {
        overlay.addEventListener('click', dismissToast);
    }
});

// Streak Counter System
function updateStreak() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisitDate');
    const currentStreak = parseInt(localStorage.getItem('currentStreak') || '0');
    
    if (lastVisit === today) {
        displayStreak(currentStreak);
        return;
    }
    
    const lastVisitDate = lastVisit ? new Date(lastVisit) : null;
    const todayDate = new Date();
    
    let newStreak = currentStreak;
    
    if (lastVisitDate) {
        const daysDiff = Math.floor((todayDate - lastVisitDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            newStreak = currentStreak + 1;
        } else if (daysDiff > 1) {
            newStreak = 1;
        } else {
            newStreak = currentStreak;
        }
    } else {
        newStreak = 1;
    }
    
    localStorage.setItem('lastVisitDate', today);
    localStorage.setItem('currentStreak', newStreak.toString());
    
    displayStreak(newStreak);
    
    if (newStreak === 7 || newStreak === 30 || newStreak === 100 || (newStreak > 1 && newStreak % 10 === 0)) {
        showStreakCelebration(newStreak);
    }
}

function displayStreak(streak) {
    const streakDisplay = document.getElementById('streak-display');
    const streakNumber = document.getElementById('streak-number');
    const streakText = document.getElementById('streak-text');
    
    if (streakDisplay && streakNumber && streakText) {
        streakNumber.textContent = streak;
        streakDisplay.style.display = 'inline-flex';
        
        if (streak === 1) {
            streakText.textContent = 'day streak! Start building!';
        } else if (streak < 7) {
            streakText.textContent = 'day streak! Keep going!';
        } else if (streak < 30) {
            streakText.textContent = 'day streak! Amazing!';
        } else {
            streakText.textContent = 'day streak! Legendary!';
        }
    }
}

function showStreakCelebration(streak) {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#ef4444', '#10b981']
        });
        
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#f59e0b', '#ef4444']
            });
        }, 150);
        
        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#10b981', '#f59e0b']
            });
        }, 300);
    }
    
    setTimeout(() => {
        let message = '';
        if (streak === 7) {
            message = '🎉 Amazing! 7-day streak! You\'re building a habit!';
        } else if (streak === 30) {
            message = '🏆 Incredible! 30-day streak! You\'re a learning machine!';
        } else if (streak === 100) {
            message = '👑 LEGENDARY! 100-day streak! You\'re unstoppable!';
        } else if (streak % 10 === 0) {
            message = `🔥 Awesome! ${streak}-day streak! Keep the fire burning!`;
        }
        
        if (message) {
            alert(message);
        }
    }, 500);
}

const SHEET_ID = '17lLI7iWHeidBK7yyhG8rugXfNj8sxCq-zviBIMzTu2E';
const SHEET_NAME = 'sheet1';

let allSochs = [];
let filteredSochs = [];
let currentSoch = null;
let currentIndex = 0;
let answered = false;
let selectedCategories = [];
let userName = '';
let allCategories = [];

const categoryEmojis = {
    'Science': '🔬',
    'India': '🇮🇳',
    'Culture': '🎭',
    'Finance': '💰',
    'Tech': '💻',
    'Technology': '💻',
    'Brands': '🏢',
    'Mindset': '🧠',
    'Health': '🏥',
    'Psychology': '🧠',
    'History': '📜',
    'Food': '🍜',
    'Travel': '✈️',
    'Books': '📚',
    'Sports': '⚽',
    'Nature': '🌿',
    'Philosophy': '💭',
    'Career': '💼',
    'Productivity': '⚡',
    'Relationships': '💝',
    'Environment': '🌍',
    'Business': '💼',
    'Innovation': '💡',
    'Marketing': '📱'
};

window.addEventListener('DOMContentLoaded', init);

function init() {
    checkForUpdates();
    
    loadAllSochs();
    
    const savedName = localStorage.getItem('userName');
    const savedCategories = localStorage.getItem('selectedCategories');
    
    if (savedName && savedCategories) {
        userName = savedName;
        selectedCategories = JSON.parse(savedCategories);
        document.getElementById('hamburgerBtn').style.display = 'flex';
    }
    
    const nameInput = document.getElementById('userName');
    const continueBtn = document.getElementById('continueBtn');
    
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            continueBtn.disabled = value.length < 2;
        });
        
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !continueBtn.disabled) {
                proceedToCategories();
            }
        });
    }
    
    if (continueBtn) {
        continueBtn.addEventListener('click', proceedToCategories);
    }
    
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sideMenu.classList.add('open');
        });
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            sideMenu.classList.remove('open');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (sideMenu && sideMenu.classList.contains('open')) {
            if (!sideMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                sideMenu.classList.remove('open');
            }
        }
    });
}

async function loadAllSochs() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        allSochs = json.table.rows.filter(row => row.c[1]?.v).map((row, index) => ({
            id: row.c[0]?.v || (index + 1),
            title: row.c[1]?.v || '',
            category: row.c[2]?.v || 'General',
            story: row.c[3]?.v || '',
            takeaway: row.c[4]?.v || '',
            quizQuestion: row.c[5]?.v || '',
            quizOptions: row.c[6]?.v || '',
            quizAnswer: row.c[7]?.v || '',
            bonusTip: row.c[8]?.v || ''
        }));
        
        console.log('Loaded sochs:', allSochs.length);
        
        const savedName = localStorage.getItem('userName');
        const savedCategories = localStorage.getItem('selectedCategories');
        
        if (!savedName) {
            showNameScreen();
        } else if (!savedCategories) {
            userName = savedName;
            showCategoryScreen();
            loadCategoryGrid();
        } else {
            userName = savedName;
            selectedCategories = JSON.parse(savedCategories);
            filterSochsByCategories();
            showMainApp();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        const storyEl = document.getElementById('story');
        if (storyEl) {
            storyEl.innerHTML = `<p style="color:red;">Error loading data: ${error.message}</p>`;
        }
    }
}

function showNameScreen() {
    document.getElementById('nameScreen').classList.add('show');
}

function proceedToCategories() {
    const nameInput = document.getElementById('userName');
    userName = nameInput.value.trim();
    
    if (userName.length < 2) return;
    
    localStorage.setItem('userName', userName);
    document.getElementById('nameScreen').classList.remove('show');
    
    showCategoryScreen();
    loadCategoryGrid();
}

function showCategoryScreen() {
    const greeting = document.getElementById('categoryGreeting');
    
    const isMobile = window.innerWidth < 640;
    
    if (userName) {
        if (isMobile) {
            greeting.textContent = `Great, ${userName}! Pick your interests`;
        } else {
            greeting.textContent = `Great, ${userName}! Now pick your interests`;
        }
    } else {
        greeting.textContent = isMobile ? `Pick your interests` : `Great! Now pick your interests`;
    }
    
    greeting.style.display = 'block';
    greeting.style.visibility = 'visible';
    
    document.getElementById('categoryScreen').classList.add('show');
}

function loadCategoryGrid() {
    allCategories = [...new Set(allSochs.map(s => s.category))].sort();
    
    renderCategories();
    
    const saveBtn = document.getElementById('saveCategoriesBtn');
    if (saveBtn && !saveBtn.hasAttribute('data-listener')) {
        saveBtn.addEventListener('click', saveCategories);
        saveBtn.setAttribute('data-listener', 'true');
    }
}

function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    
    grid.innerHTML = allCategories.map(cat => {
        const emoji = categoryEmojis[cat] || '📚';
        const isSelected = selectedCategories.includes(cat) ? 'selected' : '';
        return `
            <div class="category-option ${isSelected}" data-category="${cat}">
                <div class="emoji">${emoji}</div>
                <div class="name">${cat}</div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', () => toggleCategory(option));
    });
    
    updateSelectedCount();
}

function toggleCategory(element) {
    const category = element.dataset.category;
    
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        selectedCategories = selectedCategories.filter(c => c !== category);
    } else {
        element.classList.add('selected');
        selectedCategories.push(category);
    }
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = selectedCategories.length;
    const countEl = document.getElementById('selectedCount');
    const btn = document.getElementById('saveCategoriesBtn');
    const MIN_CATEGORIES = 3;
    const MAX_CATEGORIES = 7;
    
    if (count === 0) {
        countEl.textContent = `Select ${MIN_CATEGORIES}-${MAX_CATEGORIES} categories`;
        countEl.style.color = '#6b7280';
        btn.disabled = true;
    } else if (count < MIN_CATEGORIES) {
        countEl.textContent = `Selected ${count} - pick ${MIN_CATEGORIES - count} more`;
        countEl.style.color = '#6b7280';
        btn.disabled = true;
    } else if (count > MAX_CATEGORIES) {
        countEl.textContent = `⚠️ Maximum ${MAX_CATEGORIES} categories - please remove ${count - MAX_CATEGORIES}`;
        countEl.style.color = '#e53e3e';
        btn.disabled = true;
    } else {
        countEl.textContent = `✓ ${count} categories selected (${MAX_CATEGORIES - count} more allowed)`;
        countEl.style.color = '#48bb78';
        btn.disabled = false;
    }
}

function saveCategories() {
    const MIN_CATEGORIES = 3;
    const MAX_CATEGORIES = 7;
    
    if (selectedCategories.length < MIN_CATEGORIES || selectedCategories.length > MAX_CATEGORIES) return;
    
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    document.getElementById('categoryScreen').classList.remove('show');
    document.getElementById('hamburgerBtn').style.display = 'flex';
    
    filterSochsByCategories();
    showMainApp();
}

function filterSochsByCategories() {
    if (selectedCategories.length === 0) {
        filteredSochs = allSochs;
    } else {
        filteredSochs = allSochs.filter(soch => 
            selectedCategories.includes(soch.category)
        );
    }
}

function showMainApp() {
    updateStreak();
    
    document.getElementById('mainApp').style.display = 'block';
    
    const greeting = document.getElementById('userGreeting');
    greeting.textContent = `Namaste, ${userName}! 🙏`;
    
    if (filteredSochs.length === 0) {
        document.getElementById('story').innerHTML = `<p style="color:red;">No Sochs found for your selected categories. Try selecting more categories!</p>`;
        return;
    }
    
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    currentIndex = dayOfYear % filteredSochs.length;
    
    showSoch(currentIndex);
}

function showSoch(index) {
    currentIndex = index;
    currentSoch = filteredSochs[index];
    answered = false;
    displaySoch();
    updateCounter();
}

function updateCounter() {
    document.getElementById('soch-counter').textContent = `${currentIndex + 1} of ${filteredSochs.length}`;
}

function displaySoch() {
    if (!currentSoch) return;
    
    const emoji = categoryEmojis[currentSoch.category] || '📚';
    document.getElementById('category').textContent = `${emoji} ${currentSoch.category}`;
    document.getElementById('title').textContent = currentSoch.title;
    
    const paragraphs = currentSoch.story.split('\n\n');
    document.getElementById('story').innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    
    document.getElementById('takeaway').textContent = currentSoch.takeaway;
    document.getElementById('question').textContent = currentSoch.quizQuestion;
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    
    currentSoch.quizOptions.split('|').forEach(option => {
        const div = document.createElement('div');
        div.className = 'option';
        const letter = option.trim().charAt(0);
        const text = option.substring(option.indexOf(')') + 1).trim();
        div.innerHTML = `<div class="option-letter">${letter}</div><div class="option-text">${text}</div>`;
        div.onclick = () => checkAnswer(letter, div);
        optionsDiv.appendChild(div);
    });
    
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('feedback').innerHTML = '';
}

function checkAnswer(selected, element) {
    if (answered) return;
    answered = true;
    
    const feedback = document.getElementById('feedback');
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(opt => opt.style.pointerEvents = 'none');
    
    if (selected === currentSoch.quizAnswer) {
        element.classList.add('correct');
        triggerConfetti(element);
        
        feedback.className = 'feedback show correct';
        
        let feedbackHTML = '<div class="feedback-message">✅ Bahut badiya! Sahi jawab!</div>';
        
        if (currentSoch.bonusTip && currentSoch.bonusTip.trim()) {
            feedbackHTML += `
                <div class="bonus-tip">
                    <div class="bonus-tip-header">🎁 Bonus Insight!</div>
                    <div class="bonus-tip-text">${currentSoch.bonusTip}</div>
                </div>
            `;
        }
        
        feedback.innerHTML = feedbackHTML;
    } else {
        element.classList.add('wrong');
        
        allOptions.forEach(opt => {
            if (opt.querySelector('.option-letter').textContent === currentSoch.quizAnswer) {
                opt.classList.add('correct');
            }
        });
        
        feedback.className = 'feedback show wrong';
        
        let feedbackHTML = `<div class="feedback-message">❌ Oops! Sahi jawab hai: ${currentSoch.quizAnswer}</div>`;
        
        if (currentSoch.bonusTip && currentSoch.bonusTip.trim()) {
            feedbackHTML += `
                <div class="bonus-tip">
                    <div class="bonus-tip-header">💡 Did You Know?</div>
                    <div class="bonus-tip-text">${currentSoch.bonusTip}</div>
                    <div class="bonus-tip-encouragement">💪 Keep learning! Every mistake makes you smarter!</div>
                </div>
            `;
        }
        
        feedback.innerHTML = feedbackHTML;
    }
}

function triggerConfetti(element) {
    if (typeof confetti === 'undefined') {
        console.warn('Confetti library not loaded');
        return;
    }
    
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24', '#f59e0b']
    });
    
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x, y },
            colors: ['#10b981', '#34d399', '#6ee7b7']
        });
    }, 150);
    
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x, y },
            colors: ['#fbbf24', '#f59e0b', '#fb923c']
        });
    }, 300);
}

function nextSoch() {
    if (filteredSochs.length === 0) return;
    currentIndex = currentIndex < filteredSochs.length - 1 ? currentIndex + 1 : 0;
    showSoch(currentIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousSoch() {
    if (filteredSochs.length === 0) return;
    currentIndex = currentIndex > 0 ? currentIndex - 1 : filteredSochs.length - 1;
    showSoch(currentIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function randomSoch() {
    if (filteredSochs.length === 0) return;
    showSoch(Math.floor(Math.random() * filteredSochs.length));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function share() {
    const text = `📱 Daily Soch • आज का विचार\n\n"${currentSoch.title}"\n\n💡 ${currentSoch.takeaway}\n\nCheck it out: ${window.location.href}`;
    if (navigator.share) {
        navigator.share({ title: 'Daily Soch', text: text, url: window.location.href })
            .catch(() => copyToClipboard(text));
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Copied to clipboard!');
    });
}

function openCategorySelection() {
    document.getElementById('sideMenu').classList.remove('open');
    showCategoryScreen();
    renderCategories();
}

function editName() {
    document.getElementById('sideMenu').classList.remove('open');
    
    const newName = prompt('What should we call you?', userName);
    if (newName && newName.trim().length >= 2) {
        userName = newName.trim();
        localStorage.setItem('userName', userName);
        document.getElementById('userGreeting').textContent = `Namaste, ${userName}! 🙏`;
        alert('✅ Name updated successfully!');
    }
}

function showAbout() {
    document.getElementById('sideMenu').classList.remove('open');
    document.getElementById('aboutModal').classList.add('show');
}

function closeAbout() {
    document.getElementById('aboutModal').classList.remove('show');
}

function shareApp() {
    document.getElementById('sideMenu').classList.remove('open');
    
    const shareText = `📱 Daily Soch - Your daily dose of wisdom!\n\nNo fluff. No BS. Just 1-minute case studies.\n\nCheck it out: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Daily Soch',
            text: shareText,
            url: window.location.href
        }).catch(() => copyToClipboard(window.location.href));
    } else {
        copyToClipboard(window.location.href);
        alert('✅ Link copied! Share it on WhatsApp!');
    }
}

document.addEventListener('click', (e) => {
    const modal = document.getElementById('aboutModal');
    if (modal && e.target === modal) {
        closeAbout();
    }
});
