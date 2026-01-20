
// --- KONSTANTEN ---

const GERMAN_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'Ä', 'Ö', 'Ü', 'ẞ'
];

const GAME_WORDS = [
  'GROẞZÜGIGKEIT',
  'VERGEBUNG',
  'GEBET',
  'RUHE',
  'NÄCHSTENLIEBE',
  'VERURTEILT NICHT'
];

const MAX_LIVES = 6;

// --- STATE ---

let guessedLetters = [];
let scale = 1.0;

// --- LOGIK ---

function getWrongGuesses() {
    return guessedLetters.filter(letter => 
        !GAME_WORDS.some(word => word.includes(letter))
    ).length;
}

function getGameStatus() {
    const wrong = getWrongGuesses();
    if (wrong >= MAX_LIVES) return 'LOST';
    
    // Prüfen, ob alle Buchstaben aller Wörter erraten wurden
    const allLetters = new Set(GAME_WORDS.join('').replace(/\s/g, '').split(''));
    const allGuessed = [...allLetters].every(l => guessedLetters.includes(l));
    
    if (allGuessed) return 'WON';
    return 'PLAYING';
}

function handleGuess(letter) {
    if (guessedLetters.includes(letter)) return;
    guessedLetters.push(letter);
    render();
}

function resetGame() {
    guessedLetters = [];
    render();
}

function updateScale(delta) {
    scale = Math.min(Math.max(0.5, scale + delta), 2.0);
    render();
}

// --- RENDER FUNKTIONEN ---

function render() {
    const root = document.getElementById('root');
    const status = getGameStatus();
    const wrongGuesses = getWrongGuesses();
    const livesLeft = Math.max(0, MAX_LIVES - wrongGuesses);

    // SVG Parts für Hangman
    const svgParts = [
        `<circle cx="210" cy="105" r="30" stroke="#f1f5f9" stroke-width="6" fill="none" />`, // Head
        `<line x1="210" y1="135" x2="210" y2="225" stroke="#f1f5f9" stroke-width="6" />`,   // Body
        `<line x1="210" y1="165" x2="165" y2="195" stroke="#f1f5f9" stroke-width="6" />`,   // L Arm
        `<line x1="210" y1="165" x2="255" y2="195" stroke="#f1f5f9" stroke-width="6" />`,   // R Arm
        `<line x1="210" y1="225" x2="165" y2="285" stroke="#f1f5f9" stroke-width="6" />`,   // L Leg
        `<line x1="210" y1="225" x2="255" y2="285" stroke="#f1f5f9" stroke-width="6" />`    // R Leg
    ];
    const activeSvgParts = svgParts.slice(0, wrongGuesses).join('');

    // Wörter rendern
    const wordsHtml = GAME_WORDS.map(word => {
        const lettersHtml = word.split('').map(letter => {
            if (letter === ' ') return `<div class="w-4 md:w-8 h-16 md:h-32"></div>`;
            
            const isGuessed = guessedLetters.includes(letter);
            const isLost = status === 'LOST';
            const show = isGuessed || isLost;
            
            let textColorClass = 'text-indigo-200 drop-shadow-md';
            if (status === 'WON') textColorClass = 'text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]';
            else if (isLost && !isGuessed) textColorClass = 'text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]';

            return `
              <div class="flex flex-col items-center justify-end w-8 md:w-14 h-16 md:h-32 border-b-4 border-white/30">
                <span class="text-2xl md:text-6xl font-black mono transition-all duration-500 mb-2 ${show ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4'} ${textColorClass}">
                  ${letter}
                </span>
              </div>
            `;
        }).join('');
        
        return `<div class="w-full flex justify-center flex-wrap gap-x-2 gap-y-4 md:gap-x-4 px-2 md:px-6 items-center">${lettersHtml}</div>`;
    }).join('');

    // Keyboard rendern
    const keyboardHtml = GERMAN_ALPHABET.map(letter => {
        const isGuessed = guessedLetters.includes(letter);
        const disabled = isGuessed || status !== 'PLAYING';
        
        let classes = "h-14 md:h-20 w-full flex items-center justify-center rounded-2xl font-black text-xl md:text-3xl transition-all duration-300 relative overflow-hidden group ";
        if (isGuessed) {
            classes += "bg-black/20 text-slate-500/50 cursor-not-allowed border border-transparent";
        } else {
            classes += "bg-white/5 text-indigo-100 border border-white/10 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 shadow-lg cursor-pointer";
        }
        if (disabled && !isGuessed) classes += " opacity-30 cursor-not-allowed";

        const shimmer = (!isGuessed && !disabled) 
            ? `<div class="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 pointer-events-none" style="animation-name: shimmer"></div>` 
            : '';

        return `
            <button 
                onclick="window.handleGuess('${letter}')" 
                ${disabled ? 'disabled' : ''} 
                class="${classes}">
                ${shimmer}
                <span class="relative z-10">${letter}</span>
            </button>
        `;
    }).join('');

    // HTML zusammenbauen
    root.innerHTML = `
        <div class="min-h-screen w-full flex flex-col items-center justify-start py-8 px-4 md:px-8 overflow-x-hidden relative">
          <main class="w-full max-w-[2200px] grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start transition-transform duration-300" style="transform: scale(${scale}); transform-origin: top center;">
            
            <!-- Sidebar -->
            <div class="lg:col-span-3 lg:sticky lg:top-8 flex flex-col items-center space-y-6 md:space-y-12">
               <!-- Drawing -->
               <div class="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[4rem] shadow-2xl flex flex-col items-center ring-1 ring-white/5">
                  <div class="flex justify-center items-center py-8">
                    <svg height="360" width="300" class="drop-shadow-2xl">
                        <line x1="15" y1="345" x2="285" y2="345" stroke="#f1f5f9" stroke-width="6"></line>
                        <line x1="75" y1="345" x2="75" y2="30" stroke="#f1f5f9" stroke-width="6"></line>
                        <line x1="75" y1="30" x2="210" y2="30" stroke="#f1f5f9" stroke-width="6"></line>
                        <line x1="210" y1="30" x2="210" y2="75" stroke="#f1f5f9" stroke-width="3"></line>
                        ${activeSvgParts}
                    </svg>
                  </div>
               </div>

               <!-- Lives -->
               <div class="w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl flex items-center justify-center ring-1 ring-white/5">
                    <div class="flex flex-col items-center gap-4">
                      <span class="text-6xl animate-pulse mb-2 drop-shadow-lg">❤️</span>
                      <span class="text-3xl md:text-5xl font-black tracking-widest uppercase text-white whitespace-nowrap drop-shadow-md">
                        ${livesLeft} / ${MAX_LIVES}
                      </span>
                    </div>
               </div>
               
               <button onclick="window.resetGame()" class="text-[10px] md:text-xs text-indigo-200 hover:text-white uppercase tracking-widest transition-colors font-bold py-2 px-4 rounded-full hover:bg-white/5">
                    Spiel zurücksetzen
               </button>
            </div>

            <!-- Game Area -->
            <div class="lg:col-span-9 space-y-12 md:space-y-16 flex flex-col items-center w-full">
                <!-- Words Container -->
                <div class="w-full max-w-full space-y-10 md:space-y-16 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-16 rounded-[4rem] shadow-2xl flex flex-col items-center mx-auto overflow-hidden ring-1 ring-white/5">
                    ${wordsHtml}
                </div>
                
                <!-- Keyboard -->
                <div class="w-full">
                    <div class="grid grid-cols-7 sm:grid-cols-10 gap-3 p-6 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl max-w-5xl mx-auto border border-white/10 ring-1 ring-white/5">
                        ${keyboardHtml}
                    </div>
                </div>
            </div>

          </main>
          
          <!-- Controls -->
          <div class="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            <button onclick="window.updateScale(0.1)" class="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center text-xl font-bold border border-white/20 transition-all shadow-lg active:scale-90">+</button>
            <button onclick="window.updateScale(-0.1)" class="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center text-xl font-bold border border-white/20 transition-all shadow-lg active:scale-90">-</button>
            <div class="text-[11px] text-indigo-200 text-center font-black bg-black/40 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">${Math.round(scale * 100)}%</div>
          </div>
        </div>
    `;
}

// --- INIT & EVENTS ---

// Globale Handler verfügbar machen
window.handleGuess = handleGuess;
window.resetGame = resetGame;
window.updateScale = updateScale;

// Keydown Listener
window.addEventListener('keydown', (e) => {
    let key = e.key.toUpperCase();
    if (e.key === 'ß' || key === 'SS') key = 'ẞ';
    const validChars = /^[A-ZÄÖÜẞ]$/;
    if (validChars.test(key)) {
        const status = getGameStatus();
        if (status === 'PLAYING') {
            handleGuess(key);
        }
    }
});

// Start rendering
render();
