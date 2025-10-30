// PWA Install Functionality
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show the install banner
  const banner = document.getElementById('installBanner');
  if (banner) {
    banner.classList.add('show');
  }
});

function installApp() {
  const banner = document.getElementById('installBanner');
  if (banner) {
    banner.classList.remove('show');
  }
  
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
}

function dismissBanner() {
  const banner = document.getElementById('installBanner');
  if (banner) {
    banner.classList.remove('show');
  }
}

// Check if app is already installed
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  const banner = document.getElementById('installBanner');
  if (banner) {
    banner.classList.remove('show');
  }
});

// Your existing code continues below...
// ========================================
// CONFIGURATION
// ========================================

const SHEET_ID = '17lLI7iWHeidBK7yyhG8rugXfNj8sxCq-zviBIMzTu2E';
const SHEET_NAME = 'sheet1';

// ========================================
// GLOBAL VARIABLES
// ========================================

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

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener('DOMContentLoaded', loadAllSochs);

// ========================================
// LOAD DATA FROM GOOGLE SHEETS
// ========================================

async function loadAllSochs() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        const rows = json.table.rows.filter(row => row.c[1]?.v);
        
        if (rows.length === 0) {
            alert('No Sochs found in your sheet!');
            return;
        }
        
        // Store all Sochs
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
        
        // Show today's Soch by default
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        currentIndex = dayOfYear % allSochs.length;
        showSoch(currentIndex);
        
        console.log(`✅ Loaded ${allSochs.length} Sochs successfully!`);
        console.log(`📊 Today's Soch: ${currentIndex + 1} of ${allSochs.length}`);
        
    } catch (error) {
        console.error('❌ Error loading Sochs:', error);
        alert('Error loading Sochs: ' + error.message);
    }
}

// ========================================
// DISPLAY SOCH
// ========================================

function showSoch(index) {
    currentIndex = index;
    currentSoch = allSochs[index];
    answered = false;
    
    displaySoch();
    updateCounter();
    
    console.log(`📖 Showing Soch ${currentIndex + 1}: "${currentSoch.title}"`);
}

function updateCounter() {
    const counter = document.getElementById('soch-counter');
    if (counter) {
        counter.textContent = `${currentIndex + 1} of ${allSochs.length}`;
    }
}

function displaySoch() {
    if (!currentSoch) return;
    
    // Category badge
    const badge = document.getElementById('category');
    const emoji = categoryEmojis[currentSoch.category] || '📚';
    badge.textContent = `${emoji} ${currentSoch.category}`;
    
    // Title
    document.getElementById('title').textContent = currentSoch.title;
    
    // Story
    const storyDiv = document.getElementById('story');
    const paragraphs = currentSoch.story.split('\n\n');
    storyDiv.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    
    // Takeaway
    document.getElementById('takeaway').textContent = currentSoch.takeaway;
    
    // Quiz question
    document.getElementById('question').textContent = currentSoch.quizQuestion;
    
    // Quiz options
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    
    const options = currentSoch.quizOptions.split('|');
    
    options.forEach(option => {
        const div = document.createElement('div');
        div.className = 'option';
        
        const letter = option.trim().charAt(0);
        const text = option.substring(option.indexOf(')') + 1).trim();
        
        div.innerHTML = `
            <div class="option-letter">${letter}</div>
            <div class="option-text">${text}</div>
        `;
        
        div.onclick = () => checkAnswer(letter, div);
        optionsDiv.appendChild(div);
    });
    
    // Reset feedback
    const feedback = document.getElementById('feedback');
    feedback.className = 'feedback';
    feedback.textContent = '';
}

// ========================================
// QUIZ FUNCTIONALITY
// ========================================

function checkAnswer(selected, element) {
    if (answered) return;
    answered = true;
    
    const feedback = document.getElementById('feedback');
    const allOptions = document.querySelectorAll('.option');
    
    // Disable all options
    allOptions.forEach(opt => opt.style.pointerEvents = 'none');
    
    const isCorrect = selected === currentSoch.quizAnswer;
    
    if (isCorrect) {
        element.classList.add('correct');
        feedback.className = 'feedback show correct';
        feedback.textContent = '✅ Bahut badiya! Sahi jawab!';
    } else {
        element.classList.add('wrong');
        feedback.className = 'feedback show wrong';
        feedback.textContent = `❌ Oops! Sahi jawab hai: ${currentSoch.quizAnswer}`;
        
        // Highlight correct answer
        allOptions.forEach(opt => {
            const letter = opt.querySelector('.option-letter').textContent;
            if (letter === currentSoch.quizAnswer) {
                opt.classList.add('correct');
            }
        });
    }
}

// ========================================
// NAVIGATION FUNCTIONS
// ========================================

function nextSoch() {
    if (allSochs.length === 0) return;
    
    if (currentIndex < allSochs.length - 1) {
        showSoch(currentIndex + 1);
    } else {
        showSoch(0); // Loop back to first
    }
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function previousSoch() {
    if (allSochs.length === 0) return;
    
    if (currentIndex > 0) {
        showSoch(currentIndex - 1);
    } else {
        showSoch(allSochs.length - 1); // Loop to last
    }
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function randomSoch() {
    if (allSochs.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * allSochs.length);
    showSoch(randomIndex);
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// SHARE FUNCTIONALITY
// ========================================

function share() {
    const text = `📱 Daily Soch • आज का विचार\n\n"${currentSoch.title}"\n\n💡 ${currentSoch.takeaway}\n\nRead more: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Daily Soch',
            text: text
        }).catch(() => {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Copied to clipboard! Ab WhatsApp par share karo!');
    }).catch(() => {
        alert('Could not copy. Please try again.');
    });
}
/* PWA Install Banner */
.install-banner {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
  display: none;
  z-index: 1000;
  max-width: 90%;
  animation: slideUp 0.3s ease;
}

.install-banner.show {
  display: block;
}

.install-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.install-btn {
  background: white;
  color: #10b981;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9em;
}

.install-btn:hover {
  transform: scale(1.05);
}

.close-btn {
  background: transparent;
  color: white;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  padding: 4px 8px;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}