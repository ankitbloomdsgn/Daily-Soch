const SHEET_ID = '17lLI7iWHeidBK7yyhG8rugXfNj8sxCq-zviBIMzTu2E';
const SHEET_NAME = 'sheet1';

let allSochs = [];
let currentSoch = null;
let currentIndex = 0;
let answered = false;

const categoryEmojis = {
    'Science': '🔬',
    'India': '🇮🇳',
    'Culture': '🎭',
    'Finance': '💰',
    'Tech': '💻',
    'Brands': '🏢',
    'Mindset': '🧠'
};

window.addEventListener('DOMContentLoaded', loadAllSochs);

async function loadAllSochs() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        const rows = json.table.rows.filter(row => row.c[1]?.v);
        allSochs = rows.map((row, index) => ({
            id: row.c[0]?.v || (index + 1),
            title: row.c[1]?.v || '',
            category: row.c[2]?.v || 'General',
            story: row.c[3]?.v || '',
            takeaway: row.c[4]?.v || '',
            quizQuestion: row.c[5]?.v || '',
            quizOptions: row.c[6]?.v || '',
            quizAnswer: row.c[7]?.v || ''
        }));
        
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now - start) / 86400000);
        currentIndex = dayOfYear % allSochs.length;
        
        showSoch(currentIndex);
    } catch (error) {
        document.getElementById('story').innerHTML = `<p style="color:red;">Error loading data: ${error.message}</p>`;
    }
}

function showSoch(index) {
    currentIndex = index;
    currentSoch = allSochs[index];
    answered = false;
    displaySoch();
    updateCounter();
}

function updateCounter() {
    document.getElementById('soch-counter').textContent = `${currentIndex + 1} of ${allSochs.length}`;
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
    if (allSochs.length === 0) return;
    currentIndex = currentIndex < allSochs.length - 1 ? currentIndex + 1 : 0;
    showSoch(currentIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousSoch() {
    if (allSochs.length === 0) return;
    currentIndex = currentIndex > 0 ? currentIndex - 1 : allSochs.length - 1;
    showSoch(currentIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function randomSoch() {
    if (allSochs.length === 0) return;
    showSoch(Math.floor(Math.random() * allSochs.length));
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
