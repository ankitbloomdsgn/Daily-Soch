const SHEET_ID = '17lLI7iWHeidBK7yyhG8rugXfNj8sxCq-zviBIMzTu2E';
const SHEET_NAME = 'sheet1';

let allSochs = [];
let filteredSochs = [];
let currentSoch = null;
let currentIndex = 0;
let answered = false;
let selectedCategories = [];

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
    console.log('App initializing...');
    loadAllSochs();
    
    const saved = localStorage.getItem('selectedCategories');
    if (saved) {
        selectedCategories = JSON.parse(saved);
        document.getElementById('sett
