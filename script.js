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
    'Environment': '🌍'
};

window.addEventListener('DOMContentLoaded', init);

function init() {
    loadAllSochs();

    // Check if user has completed onboarding
    const savedName = localStorage.getItem('userName');
    const savedCategories = localStorage.getItem('selectedCategories');

    if (savedName && savedCategories) {
        userName = savedName;
        selectedCategories = JSON.parse(savedCategories);
        document.getElementById('hamburgerBtn').style.display = 'flex';
    }

    // Name input listener
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

    // Hamburger menu
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

    // Close menu when clicking outside
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
            quizAnswer: row.c[7]?.v || ''
        }));

        const savedName = localStorage.getItem('userName');
        const savedCategories = localStorage.getItem('selectedCategories');

        if (!savedName) {
            // Show name collection screen
            showNameScreen();
        } else if (!savedCategories) {
            // Show category selection
            userName = savedName;
            showCategoryScreen();
            loadCategoryGrid();
        } else {
            // Show main app
            userName = savedName;
            selectedCategories = JSON.parse(savedCategories);
            filterSochsByCategories();
            showMainApp();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('story').innerHTML = `<p style="color:red;">Error loading data: ${error.message}</p>`;
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
    if (userName) {
        greeting.textContent = `Great, ${userName}! Now pick your interests`;
    }
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

    // Show ALL categories at once
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
    document.getElementById('mainApp').style.display = 'block';

    // Update greeting
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
}

function checkAnswer(selected, element) {
    if (answered) return;
    answered = true;

    const feedback = document.getElementById('feedback');
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(opt => opt.style.pointerEvents = 'none');

    if (selected === currentSoch.quizAnswer) {
        // Correct answer!
        element.classList.add('correct');
        
        // 🎉 CONFETTI CELEBRATION!
        triggerConfetti(element);
        
        feedback.className = 'feedback show correct';
        feedback.textContent = '✅ Bahut badiya! Sahi jawab!';
    } else {
        // Wrong answer
        element.classList.add('wrong');
        feedback.className = 'feedback show wrong';
        feedback.textContent = `❌ Oops! Sahi jawab hai: ${currentSoch.quizAnswer}`;
@@ -347,90 +353,128 @@
    }
}

// 🎉 Confetti Function
function triggerConfetti(element) {
    // Get button position for confetti origin
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    // First burst - from the button
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24', '#f59e0b']
    });
    
    // Second burst - delayed slightly
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x, y },
            colors: ['#10b981', '#34d399', '#6ee7b7']
        });
    }, 150);
    
    // Third burst - from other side
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

// Hamburger Menu Functions
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

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('aboutModal');
    if (modal && e.target === modal) {
        closeAbout();
    }
