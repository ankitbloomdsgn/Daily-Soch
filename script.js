const SHEET_ID = '17lLI7iWHeidBK7yyhG8rugXfNj8sxCq-zviBIMzTu2E';
const SHEET_NAME = 'sheet1';
let allSochs = [];
let filteredSochs = [];
let currentSoch = null;
let currentIndex = 0;
let answered = false;
let selectedCategories = [];

const categoryEmojis = {
    'Science': '🔬', 'India': '🇮🇳', 'Culture': '🎭', 'Finance': '💰',
    'Tech': '💻', 'Technology': '💻', 'Brands': '🏢', 'Mindset': '🧠',
    'Health': '🏥', 'Psychology': '🧠', 'History': '📜', 'Food': '🍜',
    'Travel': '✈️', 'Books': '📚', 'Sports': '⚽', 'Nature': '🌿',
    'Philosophy': '💭', 'Career': '💼', 'Productivity': '⚡',
    'Relationships': '💝', 'Environment': '🌍'
};

window.addEventListener('DOMContentLoaded', init);

function init() {
    loadAllSochs();
    const saved = localStorage.getItem('selectedCategories');
    if (saved) {
        selectedCategories = JSON.parse(saved);
        const btn = document.getElementById('settingsBtn');
        if (btn) btn.style.display = 'flex';
    }
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
        
        const saved = localStorage.getItem('selectedCategories');
        if (!saved) {
            showCategoryScreen();
            loadCategoryGrid();
        } else {
            filterSochsByCategories();
            showDailySoch();
        }
    } catch (error) {
        document.getElementById('story').innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}

function showCategoryScreen() {
    document.getElementById('categoryScreen').classList.add('show');
}

function loadCategoryGrid() {
    const categories = [...new Set(allSochs.map(s => s.category))].sort();
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = categories.map(cat => {
        const emoji = categoryEmojis[cat] || '📚';
        return `<div class="category-option" data-category="${cat}"><div class="emoji">${emoji}</div><div class="name">${cat}</div></div>`;
    }).join('');
    
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', () => toggleCategory(option));
    });
    document.getElementById('saveCategoriesBtn').addEventListener('click', saveCategories);
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
    if (count === 0) {
        countEl.textContent = 'Select at least 3 categories';
        btn.disabled = true;
    } else if (count < 3) {
        countEl.textContent = `Selected ${count} - pick ${3 - count} more`;
        btn.disabled = true;
    } else {
        countEl.textContent = `✓ ${count} categories selected`;
        btn.disabled = false;
    }
}

function saveCategories() {
    if (selectedCategories.length < 3) return;
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    document.getElementById('categoryScreen').classList.remove('show');
    const btn = document.getElementById('settingsBtn');
    if (btn) btn.style.display = 'flex';
    filterSochsByCategories();
    showDailySoch();
}

function filterSochsByCategories() {
    filteredSochs = selectedCategories.length === 0 ? allSochs : allSochs.filter(soch => selectedCategories.includes(soch.category));
}

function showDailySoch() {
    if (filteredSochs.length === 0) {
        document.getElementById('story').innerHTML = '<p style="color:red;">No Sochs found. Try selecting more categories!</p>';
        return;
    }
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    currentIndex = dayOfYear % filteredSochs.length;
    showSoch(currentIndex);
}

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showCategoryScreen();
            loadCategoryGrid();
            setTimeout(() => {
                selectedCategories.forEach(cat => {
                    const option = document.querySelector(`[data-category="${cat}"]`);
                    if (option) option.classList.add('selected');
                });
                updateSelectedCount();
            }, 100);
        });
    }
});

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
    if (currentSoch.quizOptions) {
        currentSoch.quizOptions.split('|').forEach(option => {
            const div = document.createElement('div');
            div.className = 'option';
            const letter = option.trim().charAt(0);
            const text = option.substring(option.indexOf(')') + 1).trim();
            div.innerHTML = `<div class="option-letter">${letter}</div><div class="option-text">${text}</div>`;
            div.onclick = () => checkAnswer(letter, div);
            optionsDiv.appendChild(div);
        });
    }
    document.getElementById('feedback').className = 'feedback';
}

function checkAnswer(selected, element) {
    if (answered) return;
    answered = true;
    const feedback = document.getElementById('feedback');
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(opt => opt.style.pointerEvents = 'none');
    if (selected === currentSoch.quizAnswer) {
        element.classList.add('correct');
        feedback.className = 'feedback show correct';
        feedback.textContent = '✅ Bahut badiya! Sahi jawab!';
    } else {
        element.classList.add('wrong');
        feedback.className = 'feedback show wrong';
        feedback.textContent = `❌ Oops! Sahi jawab hai: ${currentSoch.quizAnswer}`;
        allOptions.forEach(opt => {
            if (opt.querySelector('.option-letter').textContent === currentSoch.quizAnswer) {
                opt.classList.add('correct');
            }
        });
    }
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
        navigator.share({ title: 'Daily Soch', text: text, url: window.location.href }).catch(() => copyToClipboard(text));
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => alert('✅ Copied to clipboard!'));
}
