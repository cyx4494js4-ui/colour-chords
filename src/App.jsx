import React, { useState, useEffect, useRef, useMemo, useCallback, useImperativeHandle } from 'react';
import * as Tone from 'tone';

// --- Reusable SVG Icons ---
const MenuIcon = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

const CloseIcon = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const VolumeIcon = ({ className }) => (
  <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.536 14.01A8.473 8.473 0 0014.026 8a8.473 8.473 0 00-2.49-6.01l-.708.707A7.476 7.476 0 0113.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"></path>
    <path d="M10.121 12.596A6.48 6.48 0 0012.025 8a6.48 6.48 0 00-1.904-4.596l-.707.707A5.482 5.482 0 0111.025 8a5.482 5.482 0 01-1.61 3.89l.706.706z"></path>
    <path d="M8.707 11.182A4.486 4.486 0 0010.025 8a4.486 4.486 0 00-1.318-3.182L8 5.525A3.489 3.489 0 019.025 8 3.489 3.489 0 018 10.475l.707.707zM6.717 3.55A.5.5 0 017 4v8a.5.5 0 01-.812.39L3.825 10.5H1.5A.5.5 0 011 10V6a.5.5 0 01.5-.5h2.325l2.363-1.89a.5.5 0 01.529-.06z"></path>
  </svg>
);

const WaveformIcon = ({ className }) => (
  <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12h3l3-9 4 18 3-9h3"></path>
  </svg>
);

const DuplicateIcon = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const TrashIcon = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const ArrowLeftIcon = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const ArrowRightIcon = ({ className }) => (
    <svg className={className} stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);


// --- App Data ---
const colorSpectrum = [
  { name: 'Red', class: 'bg-red-500', hex: '#ef4444', textClass: 'text-red-500', darkTextClass: 'text-red-300', darkClass: 'bg-red-700' },
  { name: 'Orange', class: 'bg-orange-500', hex: '#f97316', textClass: 'text-orange-500', darkTextClass: 'text-orange-300', darkClass: 'bg-orange-700' },
  { name: 'Yellow', class: 'bg-yellow-400', hex: '#facc15', textClass: 'text-yellow-400', darkTextClass: 'text-yellow-200', darkClass: 'bg-yellow-600' },
  { name: 'Lime', class: 'bg-lime-500', hex: '#84cc16', textClass: 'text-lime-500', darkTextClass: 'text-lime-300', darkClass: 'bg-lime-700' },
  { name: 'Green', class: 'bg-green-500', hex: '#22c55e', textClass: 'text-green-500', darkTextClass: 'text-green-300', darkClass: 'bg-green-700' },
  { name: 'Cyan', class: 'bg-cyan-500', hex: '#06b6d4', textClass: 'text-cyan-500', darkTextClass: 'text-cyan-300', darkClass: 'bg-cyan-700' },
  { name: 'Sky', class: 'bg-sky-500', hex: '#0ea5e9', textClass: 'text-sky-500', darkTextClass: 'text-sky-300', darkClass: 'bg-sky-700' },
  { name: 'Blue', class: 'bg-blue-500', hex: '#3b82f6', textClass: 'text-blue-500', darkTextClass: 'text-blue-300', darkClass: 'bg-blue-700' },
  { name: 'Indigo', class: 'bg-indigo-500', hex: '#6366f1', textClass: 'text-indigo-500', darkTextClass: 'text-indigo-300', darkClass: 'bg-indigo-700' },
  { name: 'Purple', class: 'bg-purple-600', hex: '#9333ea', textClass: 'text-purple-600', darkTextClass: 'text-purple-300', darkClass: 'bg-purple-800' },
  { name: 'Pink', class: 'bg-pink-500', hex: '#ec4899', textClass: 'text-pink-500', darkTextClass: 'text-pink-300', darkClass: 'bg-pink-700' },
  { name: 'Rose', class: 'bg-rose-400', hex: '#fb7185', textClass: 'text-rose-400', darkTextClass: 'text-rose-300', darkClass: 'bg-rose-700' },
];

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const chromaticSolfegeMap = { 'do': 0, 'di': 1, 're': 2, 'ri': 3, 'mi': 4, 'fa': 5, 'fi': 6, 'so': 7, 'si': 8, 'la': 9, 'li': 10, 'ti': 11 };
const stepToChromaticSyllable = ['do', 'di', 're', 'ri', 'mi', 'fa', 'fi', 'so', 'si', 'la', 'li', 'ti'];
const diatonicSolfegeSteps = { 'do': 0, 're': 2, 'mi': 4, 'fa': 5, 'so': 7, 'la': 9, 'ti': 11 };

const DEFAULT_ATTACK = 0.01;
const DEFAULT_RELEASE = 0.2;
const FADE_TO_GRAY_COLOR = '#6B7280'; // Tailwind's gray-500

// --- Helper Functions ---
const cleanupSpaces = (text) => text.replace(/ {2,}/g, ' ');

const parseSyllable = (syllableString) => {
    const match = syllableString.match(/(do|di|re|ri|mi|fa|fi|so|si|la|li|ti)([+-]*)(\@(\d\.?\d*))?(\^(\d\.?\d*))?(\>(\d\.?\d*))?/i);
    if (!match) return { baseSyllable: null, octaveOffset: 0, volume: 1, attack: DEFAULT_ATTACK, release: DEFAULT_RELEASE };
    
    const baseSyllable = match[1].toLowerCase();
    const modifiers = match[2] || '';
    const volumeString = match[4];
    const attackString = match[6];
    const releaseString = match[8];
    
    let octaveOffset = 0;
    for (const char of modifiers) {
        if (char === '+') octaveOffset++;
        if (char === '-') octaveOffset--;
    }
    
    const volume = volumeString ? parseFloat(volumeString) : 1;
    const attack = attackString ? parseFloat(attackString) : DEFAULT_ATTACK;
    const release = releaseString ? parseFloat(releaseString) : DEFAULT_RELEASE;

    return { baseSyllable, octaveOffset, volume, attack, release };
};

const parseLineIntoVisualSegments = (line) => {
    const segments = [];
    let i = 0;
    while (i < line.length) {
        if (line[i] === ' ' || line[i] === '-') {
            segments.push(line[i]);
            i++;
            continue;
        }

        let currentBlock = '';
        let j = i;
        let blockCompleted = false;

        while (j < line.length && !blockCompleted) {
            let charProcessed = false;

            const syllableRegex = /^(?:do|di|re|ri|mi|fa|fi|so|si|la|li|ti)(?:[+-]*)(?:\@\d\.?\d*)?(?:\^\d\.?\d*)?(?:\>\d\.?\d*)?/i;
            const remainingLineForSyllable = line.substring(j);
            const syllableMatch = remainingLineForSyllable.match(syllableRegex);

            if (syllableMatch) {
                currentBlock += syllableMatch[0];
                j += syllableMatch[0].length;
                charProcessed = true;
            }

            if (charProcessed) continue;

            if (line[j] === '(' || line[j] === '[') {
                const openBracket = line[j];
                const closeBracket = openBracket === '(' ? ')' : ']';
                let bracketCount = 1;
                let contentEnd = -1;
                for (let k = j + 1; k < line.length; k++) {
                    if (line[k] === openBracket) bracketCount++;
                    if (line[k] === closeBracket) bracketCount--;
                    if (bracketCount === 0) {
                        contentEnd = k;
                        break;
                    }
                }
                if (contentEnd !== -1) {
                    currentBlock += line.substring(j, contentEnd + 1);
                    j = contentEnd + 1;
                    charProcessed = true;
                } else {
                    currentBlock += line.substring(j);
                    j = line.length;
                    charProcessed = true;
                    blockCompleted = true;
                }
            }

            if (charProcessed) continue;

            if (line[j] === ' ' || line[j] === '-') {
                blockCompleted = true;
            } else {
                currentBlock += line[j];
                j++;
            }
        }

        if (currentBlock.length > 0) {
            segments.push(currentBlock);
        }
        i = j;
    }
    return segments;
};

const getGradientStyle = (attack, release, hexColor) => {
    if (attack === 0 && release === 0) {
        return hexColor;
    }
    const attackStop = Math.min(49.9, (attack / 2.0) * 50);
    const releaseStop = Math.max(50.1, 100 - ((release / 2.0) * 50));
    return `linear-gradient(to right, ${FADE_TO_GRAY_COLOR}, ${hexColor} ${attackStop}%, ${hexColor} ${releaseStop}%, ${FADE_TO_GRAY_COLOR})`;
};


// --- Page Components ---
const AboutPage = ({ isDarkMode }) => (
    <div className={`w-full max-w-4xl mx-auto p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
        <h2 className="text-3xl font-bold mb-4 text-center">About Colour Chords</h2>
        <p className="mb-4">
            Colour Chords is an interactive musical sketchpad designed to bridge the gap between sight and sound. It uses the principles of synesthesia—the union of senses—to represent musical notes and chords as vibrant colors and shapes.
        </p>
        <p className="mb-4">
            The core idea is based on a 12-tone color wheel, where each of the twelve chromatic pitches (C, C#, D, etc.) is assigned a unique color. By using solfege syllables (Do, Re, Mi...), you can compose melodies and harmonies that are instantly visualized on screen.
        </p>
        <h3 className="text-2xl font-bold mt-6 mb-3">How It Works</h3>
        <ul className="list-disc list-inside space-y-2">
            <li><strong>Create Tab:</strong> Use the on-screen keyboard to input solfege syllables. Your composition is visualized as blocks. You can play back the entire piece, save it, or load previous work. Press and hold a block to duplicate, delete, or move it.</li>
            <li><strong>Jam Tab:</strong> A simplified interface for live playing. The keyboard acts as a polyphonic instrument, allowing you to play chords and melodies in real-time without recording.</li>
            <li><strong>Pitch Modification:</strong> In Create mode, use the Shade (-) and Tint (+) buttons to lower or raise the pitch of the next syllable you enter. In Jam mode, three full octaves are available on the keyboard directly.</li>
            <li><strong>Volume & Envelope:</strong> Use the side widgets to control the volume, attack (fade-in), and release (fade-out) of the notes you play.</li>
        </ul>
    </div>
);

const SupportPage = ({ isDarkMode }) => (
    <div className={`w-full max-w-4xl mx-auto p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
        <h2 className="text-3xl font-bold mb-4 text-center">Support & Feedback</h2>
        <p className="mb-4">
            Thank you for using Colour Chords! We are constantly working to improve the experience.
        </p>
        <h3 className="text-2xl font-bold mt-6 mb-3">Frequently Asked Questions</h3>
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold">Why can't I hear any sound?</h4>
                <p>Most modern browsers require user interaction (like a click or tap) before they allow audio to play. The first time you click a keyboard key, a note block, or the 'Play Audio' button, the audio system will activate. If you still can't hear sound, check your device's volume and make sure your browser tab is not muted.</p>
            </div>
            <div>
                <h4 className="font-semibold">What do the parentheses and brackets do in the Create tab?</h4>
                <p>Parentheses `()` group notes into a **chord**, which plays all notes inside it at the same time. Brackets `[]` group notes into a **subdivision** or arpeggio, which plays the notes inside it in rapid sequence within the time of a single beat.</p>
            </div>
             <div>
                <h4 className="font-semibold">How do the envelope controls work?</h4>
                <p>Click the waveform icon on the left edge of the screen to expand the sliders for Attack and Release. Use them to set the fade-in and fade-out times for the *next* note you type. This is saved with the note and represented textually, for example, as `do^0.5{'>'}1.2` for a 0.5s attack and 1.2s release.</p>
            </div>
        </div>
        <h3 className="text-2xl font-bold mt-8 mb-3">Contact & Suggestions</h3>
        <p>
            This application is a prototype. While there is no formal support channel, we welcome feedback and suggestions for future development. If you have ideas for new features, encounter a bug, or just want to share your experience, please communicate through the platform where you are accessing this app.
        </p>
    </div>
);

// --- Header Component ---
const AppHeader = ({ onMenuClick, isDarkMode, currentDoColorIndex, isShrunk }) => {
    const titleString = "Colour Chords";
    let coloredCharIndex = 0;

    return (
        <header className="fixed top-0 left-0 right-0 z-20 h-20 flex items-center px-4 transition-all duration-300 ease-in-out">
            <div
                className={`absolute top-0 left-0 right-0 h-full transition-all duration-300 ease-in-out
                    ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}
                    ${isShrunk ? 'opacity-0' : 'opacity-100'}`}
            />

            <button
                onClick={onMenuClick}
                className={`relative z-10 p-2 rounded-md transition-all duration-300 ease-in-out
                    ${isDarkMode ? 'text-gray-300 hover:bg-gray-700/60' : 'text-gray-600 hover:bg-gray-200/60'}
                    ${isShrunk ? (isDarkMode ? 'bg-gray-800/70 backdrop-blur-sm shadow-lg' : 'bg-white/70 backdrop-blur-sm shadow-lg') : ''}`}
                aria-label="Open menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>

            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <h1
                    className={`text-3xl font-extrabold whitespace-nowrap transition-all duration-300 ease-in-out
                        ${isShrunk ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'}`}
                >
                    {titleString.split('').map((char, index) => {
                        if (char === ' ') return <span key={index} className="px-1">{char}</span>;
                        const colorIndex = (currentDoColorIndex + coloredCharIndex) % colorSpectrum.length;
                        const hex = colorSpectrum[colorIndex].hex;
                        coloredCharIndex++;
                        return <span key={index} style={{ color: hex, transition: 'color 0.5s ease' }}>{char}</span>;
                    })}
                </h1>
            </div>
        </header>
    );
};


// --- Jam Palette ---
const JamPalette = ({ circles, hasPlayed, isDarkMode }) => (
    <div
        className="w-full rounded-2xl relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: FADE_TO_GRAY_COLOR, minHeight: '18rem' }}
    >
        {!hasPlayed && (
            <div className="text-center pointer-events-none select-none">
                <h2 className="text-2xl font-bold text-white/70">Jam Session</h2>
                <p className="text-white/50">Play notes and chords live!</p>
            </div>
        )}
        {circles.map(circle => (
            <div
                key={circle.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                    left: `${circle.x}%`,
                    top: `${circle.y}%`,
                    width: '72px',
                    height: '72px',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: circle.hex,
                    boxShadow: `0 0 28px 8px ${circle.hex}99`,
                    opacity: circle.fading ? 0 : 0.92 * circle.volume,
                    transition: `opacity ${circle.fadeMs / 1000}s ease-out`,
                }}
            />
        ))}
    </div>
);

// --- Main App Component ---
const App = () => {
  // Core State
  const [solfegeInput, setSolfegeInput] = useState('');
  const [shadeTintLevel, setShadeTintLevel] = useState(0);
  const [volume, setVolume] = useState(1);
  const [attack, setAttack] = useState(DEFAULT_ATTACK);
  const [release, setRelease] = useState(DEFAULT_RELEASE);
  const [currentDoColorIndex, setCurrentDoColorIndex] = useState(0);
  
  const [bpm, setBpm] = useState(120);
  const [jamCircles, setJamCircles] = useState([]);
  const [jamHasPlayed, setJamHasPlayed] = useState(false);

  // UI/App State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpacesAsRests, setPlaySpacesAsRests] = useState(false);
  const [playNotesOnKeyClick, setPlayNotesOnKeyClick] = useState(true);
  const [maintainAbsolutePitch, setMaintainAbsolutePitch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderShrunk, setIsHeaderShrunk] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Refs
  const polySynthRef = useRef(null);
  const historyRef = useRef(['']);
  const historyIndexRef = useRef(0);
  const skipHistoryRef = useRef(false);
  const prevSolfegeRef = useRef('');
  const prevDoIndexRef = useRef(currentDoColorIndex);
  const playNotesOnKeyClickRef = useRef(playNotesOnKeyClick);
  const fileInputRef = useRef(null);
  const displayRef = useRef(null);
  const isPlayingSequenceRef = useRef(false);
  const activeTabRef = useRef(activeTab);
  const currentDoColorIndexRef = useRef(currentDoColorIndex);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { currentDoColorIndexRef.current = currentDoColorIndex; }, [currentDoColorIndex]);
  
  // Initialize Tone.js
  useEffect(() => {
    polySynthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
    }).toDestination();
    return () => {
      if (polySynthRef.current) {
        polySynthRef.current.dispose();
      }
    };
  }, []);

  const startAudio = useCallback(async () => {
    if (isAudioReady) return true;
    if (Tone.context.state === 'running') {
      setIsAudioReady(true);
      return true;
    }
    try {
      await Tone.start();
      setIsAudioReady(true);
      console.log("Audio context started successfully.");
      return true;
    } catch (e) {
      console.error("Could not start audio context:", e);
      return false;
    }
  }, [isAudioReady]);

  const stopAllAudio = useCallback(() => {
    isPlayingSequenceRef.current = false;
    if (polySynthRef.current) {
      polySynthRef.current.releaseAll();
    }
    if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
        Tone.Transport.cancel();
    }
    setIsPlaying(false);
    if (displayRef.current) {
        displayRef.current.clearGlow();
    }
  }, []);

  // Sync play on click setting
  useEffect(() => {
    playNotesOnKeyClickRef.current = playNotesOnKeyClick;
  }, [playNotesOnKeyClick]);

  // Handle header shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
        setIsHeaderShrunk(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Core Logic ---

  const getNoteData = useCallback((syllableString) => {
    const { baseSyllable, octaveOffset, volume: noteVol, attack: noteAttack, release: noteRelease } = parseSyllable(syllableString);
    if (!baseSyllable) return null;

    const stepFromDo = chromaticSolfegeMap[baseSyllable];
    if (stepFromDo === undefined) return null;

    const doBaseMidi = 60;
    const doColorOffset = currentDoColorIndex;
    const targetMidi = doBaseMidi + doColorOffset + stepFromDo + (octaveOffset * 12);

    return { 
      note: Tone.Midi(targetMidi).toNote(), 
      volume: noteVol, 
      attack: noteAttack, 
      release: noteRelease 
    };
  }, [currentDoColorIndex]);

  // Transpose input if 'maintain absolute pitch' is on
  useEffect(() => {
    const oldDoIndex = prevDoIndexRef.current;
    const newDoIndex = currentDoColorIndex;

    if (maintainAbsolutePitch && oldDoIndex !== newDoIndex && solfegeInput) {
        const syllableRegex = /(?:do|di|re|ri|mi|fa|fi|so|si|la|li|ti)(?:[+-]*)(?:\@\d\.?\d*)?(?:\^\d\.?\d*)?(?:\>\d\.?\d*)?/ig;
        
        const transposedInput = solfegeInput.replace(syllableRegex, (match) => {
            const { baseSyllable, octaveOffset, volume, attack, release } = parseSyllable(match);
            if (!baseSyllable) return match;
            const base = baseSyllable.toLowerCase();
            const step = chromaticSolfegeMap[base];
            if (step === undefined) return match;

            const absoluteStep = oldDoIndex + step + (octaveOffset * 12);
            const newRelativeStep = absoluteStep - newDoIndex;
            
            const newStep = (newRelativeStep % 12 + 12) % 12;
            const newOctave = Math.floor(newRelativeStep / 12);

            const newSyllable = stepToChromaticSyllable[newStep];
            let newModifiers = '';
            if (newOctave > 0) newModifiers = '+'.repeat(newOctave);
            else if (newOctave < 0) newModifiers = '-'.repeat(Math.abs(newOctave));
            
            const volumeString = volume !== 1 ? `@${volume.toFixed(2)}` : '';
            const attackString = attack !== DEFAULT_ATTACK ? `^${attack.toFixed(2)}` : '';
            const releaseString = release !== DEFAULT_RELEASE ? `>${release.toFixed(2)}` : '';
            return newSyllable + newModifiers + volumeString + attackString + releaseString;
        });
        setSolfegeInput(cleanupSpaces(transposedInput));
    }

    prevDoIndexRef.current = currentDoColorIndex;
  }, [currentDoColorIndex, maintainAbsolutePitch, solfegeInput]);

  // History tracking
  useEffect(() => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      prevSolfegeRef.current = solfegeInput;
      return;
    }
    if (solfegeInput !== prevSolfegeRef.current) {
      prevSolfegeRef.current = solfegeInput;
      historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), solfegeInput];
      historyIndexRef.current = historyRef.current.length - 1;
    }
  }, [solfegeInput]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      skipHistoryRef.current = true;
      historyIndexRef.current--;
      setSolfegeInput(historyRef.current[historyIndexRef.current]);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      skipHistoryRef.current = true;
      historyIndexRef.current++;
      setSolfegeInput(historyRef.current[historyIndexRef.current]);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  // --- Event Handlers ---

  const handleNavClick = (tabName) => {
    stopAllAudio();
    setActiveTab(tabName);
    setIsMenuOpen(false);
  };

  // For 'Jam' mode - receives final syllable string like 'do-' or 're+'
  const handleNoteOn = useCallback(async (syllable) => {
    if (!polySynthRef.current) return;
    await startAudio();

    const noteData = getNoteData(syllable);
    if (noteData) {
        polySynthRef.current.set({ envelope: { attack, release } });
        polySynthRef.current.triggerAttack(noteData.note, undefined, noteData.volume * volume);
    }

    if (activeTabRef.current === 'jam') {
        const { baseSyllable } = parseSyllable(syllable);
        const step = chromaticSolfegeMap[baseSyllable];
        if (step !== undefined) {
            const colorIndex = (currentDoColorIndexRef.current + step + 12) % 12;
            const hex = colorSpectrum[colorIndex].hex;
            const id = Date.now() + Math.random();
            const x = 8 + Math.random() * 84;
            const y = 8 + Math.random() * 84;
            const fadeMs = Math.max(800, release * 2000 + 600);
            setJamHasPlayed(true);
            setJamCircles(prev => [...prev, { id, x, y, hex, volume, fading: false, fadeMs }]);
            setTimeout(() => {
                setJamCircles(prev => prev.map(c => c.id === id ? { ...c, fading: true } : c));
                setTimeout(() => setJamCircles(prev => prev.filter(c => c.id !== id)), fadeMs);
            }, 30);
        }
    }
  }, [getNoteData, attack, release, volume, startAudio]);

  const handleNoteOff = useCallback((syllable) => {
    if (!polySynthRef.current) return;

    const noteData = getNoteData(syllable);
    if (noteData) {
        polySynthRef.current.triggerRelease(noteData.note);
    }
  }, [getNoteData]);
  
  // For 'Create' mode text input
  const handleKeyboardInput = (value) => {
    setSolfegeInput(prevInput => {
      setShadeTintLevel(0);
      if (value === 'newline') return prevInput + '\n';
      if (value === 'space') {
          if (prevInput.endsWith(' ') || prevInput.endsWith('\n') || prevInput.length === 0) return prevInput;
          return prevInput + ' ';
      }
      
      if (value === 'delete') {
        if (prevInput.length === 0) return '';
        const lastChar = prevInput.slice(-1);

        if (lastChar === ')' || lastChar === ']') {
          const openChar = lastChar === ')' ? '(' : '[';
          let count = 0;
          for (let i = prevInput.length - 1; i >= 0; i--) {
            if (prevInput[i] === lastChar) count++;
            else if (prevInput[i] === openChar) count--;
            if (count === 0) return prevInput.substring(0, i);
          }
          return prevInput.slice(0, -1);
        }

        if ([' ', '\n', '(', '[', '-'].includes(lastChar)) {
            return prevInput.slice(0, -1);
        }

        const lastTokenRegex = /(?:do|di|re|ri|mi|fa|fi|so|si|la|li|ti)(?:[+-]*)(?:\@\d\.?\d*)?(?:\^\d\.?\d*)?(?:\>\d\.?\d*)?$/i;
        const match = prevInput.match(lastTokenRegex);
        if (match) {
            return prevInput.substring(0, match.index);
        }
        return prevInput.slice(0, -1);

      } else {
        let modifierString = '';
        if (shadeTintLevel < 0) modifierString = '-'.repeat(Math.abs(shadeTintLevel));
        else if (shadeTintLevel > 0) modifierString = '+'.repeat(shadeTintLevel);
        const volumeString = volume !== 1 ? `@${volume.toFixed(2)}` : '';
        const attackString = attack !== DEFAULT_ATTACK ? `^${attack.toFixed(2)}` : '';
        const releaseString = release !== DEFAULT_RELEASE ? `>${release.toFixed(2)}` : '';
        return prevInput + value + modifierString + volumeString + attackString + releaseString;
      }
    });
  };

  // For 'Create' mode key click sound - uses shadeTintLevel
  const handleKeyClickSound = useCallback(async (syllable) => {
    if (!playNotesOnKeyClickRef.current) return;
    
    await startAudio();
    
    let modifierString = '';
    if (shadeTintLevel < 0) modifierString = '-'.repeat(Math.abs(shadeTintLevel));
    else if (shadeTintLevel > 0) modifierString = '+'.repeat(shadeTintLevel);
    
    const noteData = getNoteData(syllable + modifierString + `^${attack}>${release}`);
    
    if (noteData && polySynthRef.current) {
        stopAllAudio(); 
        polySynthRef.current.set({ envelope: { attack: noteData.attack, release: noteData.release }});
        polySynthRef.current.triggerAttackRelease(noteData.note, "8n", undefined, noteData.volume * volume);
    }
  }, [getNoteData, shadeTintLevel, volume, startAudio, attack, release, stopAllAudio]);
  
  const handlePlayAudio = async () => {
    if (isPlayingSequenceRef.current) {
        stopAllAudio();
        return;
    }

    await startAudio();
    setIsPlaying(true);
    isPlayingSequenceRef.current = true;

    const allSegments = structuredSolfegeData.flatMap((line, lineIndex) => 
        line.map((segment, segmentIdx) => ({ segment, lineIndex, segmentIdx }))
    );

    for (const { segment, lineIndex, segmentIdx } of allSegments) {
        if (!isPlayingSequenceRef.current) {
            break; 
        }

        if (segment.trim().length > 0 && segment !== '-') {
            await displayRef.current.playSegment(segment, lineIndex, segmentIdx);
        } else if (playSpacesAsRests && segment === ' ') {
            await new Promise(res => setTimeout(res, 300));
        }
    }
    
    if (isPlayingSequenceRef.current) {
        isPlayingSequenceRef.current = false;
        setIsPlaying(false);
    }
  };

  const handleExport = () => {
    if (solfegeInput) {
        setShowExportModal(true);
    }
  };

  const handleConfirmExport = (fileName) => {
    const finalFileName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    const blob = new Blob([solfegeInput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            setSolfegeInput(cleanupSpaces(text));
        };
        reader.readAsText(file);
    }
    event.target.value = null;
  };

  const structuredSolfegeData = useMemo(() => {
    return solfegeInput.split('\n').map(line => parseLineIntoVisualSegments(line));
  }, [solfegeInput]);

  const handleReorderSegments = useCallback((lineIndex, oldSegmentContent, newSegmentContent) => {
    setSolfegeInput(prevInput => {
      const lines = prevInput.split('\n');
      if (lineIndex >= lines.length) return prevInput;

      const segmentsInTargetLine = parseLineIntoVisualSegments(lines[lineIndex]);
      const oldIndex = segmentsInTargetLine.indexOf(oldSegmentContent);
      const newIndex = segmentsInTargetLine.indexOf(newSegmentContent);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prevInput;
      }

      const reorderedSegments = [...segmentsInTargetLine];
      const [movedSegment] = reorderedSegments.splice(oldIndex, 1);
      reorderedSegments.splice(newIndex, 0, movedSegment);
      lines[lineIndex] = cleanupSpaces(reorderedSegments.join(''));
      return lines.join('\n');
    });
  }, []);

  const handleDeleteSegment = useCallback((lineIndex, segmentIdx) => {
    setSolfegeInput(prevInput => {
      const lines = prevInput.split('\n');
      const segments = parseLineIntoVisualSegments(lines[lineIndex]);
      segments.splice(segmentIdx, 1);
      lines[lineIndex] = cleanupSpaces(segments.join('')).trim();
      return lines.join('\n');
    });
  }, []);

  const handleDuplicateSegment = useCallback((lineIndex, segmentIdx) => {
    setSolfegeInput(prevInput => {
      const lines = prevInput.split('\n');
      const segments = parseLineIntoVisualSegments(lines[lineIndex]);
      const segmentToDuplicate = segments[segmentIdx];
      segments.splice(segmentIdx + 1, 0, ' ', segmentToDuplicate);
      lines[lineIndex] = cleanupSpaces(segments.join(''));
      return lines.join('\n');
    });
  }, []);

  const handleMoveSegment = useCallback((lineIndex, segmentIdx, direction) => {
    setSolfegeInput(prevInput => {
        const lines = prevInput.split('\n');
        const segments = parseLineIntoVisualSegments(lines[lineIndex]);
        
        let swapIdx = -1;
        if (direction === -1) { // Move Left
            for (let i = segmentIdx - 1; i >= 0; i--) {
                if (segments[i].trim() !== '' && segments[i] !== '-') {
                    swapIdx = i;
                    break;
                }
            }
        } else { // Move Right
            for (let i = segmentIdx + 1; i < segments.length; i++) {
                if (segments[i].trim() !== '' && segments[i] !== '-') {
                    swapIdx = i;
                    break;
                }
            }
        }

        if (swapIdx !== -1) {
            [segments[segmentIdx], segments[swapIdx]] = [segments[swapIdx], segments[segmentIdx]];
        }
        
        lines[lineIndex] = cleanupSpaces(segments.join(''));
        return lines.join('\n');
    });
  }, []);

  const { isParenModeActive, isBracketModeActive } = useMemo(() => {
    const openParenCount = (solfegeInput.match(/\(/g) || []).length;
    const closeParenCount = (solfegeInput.match(/\)/g) || []).length;
    const openBracketCount = (solfegeInput.match(/\[/g) || []).length;
    const closeBracketCount = (solfegeInput.match(/\]/g) || []).length;
    return {
        isParenModeActive: openParenCount > closeParenCount,
        isBracketModeActive: openBracketCount > closeBracketCount
    };
  }, [solfegeInput]);
  
  const hasPlayableContent = useMemo(() => {
    return solfegeInput.trim().length > 0;
  }, [solfegeInput]);

  const handleModeButtonClick = (mode) => {
    if (mode === 'parentheses') {
        setSolfegeInput(prev => prev + (isParenModeActive ? ')' : '('));
    } else if (mode === 'brackets') {
        if (!isParenModeActive) {
            setSolfegeInput(prev => prev + (isBracketModeActive ? ']' : '['));
        }
    }
  };

  return (
    <div 
        className={`relative min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}
    >
        <AppHeader 
            onMenuClick={() => setIsMenuOpen(true)}
            isDarkMode={isDarkMode}
            currentDoColorIndex={currentDoColorIndex}
            isShrunk={isHeaderShrunk}
        />
        
        <NavMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)}
            onNavClick={handleNavClick}
            activeTab={activeTab} 
            isDarkMode={isDarkMode} 
        />

        <main className="flex flex-col items-center justify-center p-4 font-inter w-full min-h-screen transition-all duration-300 ease-in-out pt-28">
            {activeTab === 'about' && <AboutPage isDarkMode={isDarkMode} />}
            {activeTab === 'support' && <SupportPage isDarkMode={isDarkMode} />}
            
            {(activeTab === 'create' || activeTab === 'jam') && (
              <>
                <div className="relative w-full mb-8">
                  <div className="w-full max-w-xl mx-auto">
                    {activeTab === 'create' ? (
                      <SolfegeWordDisplay
                          ref={displayRef}
                          solfegeData={structuredSolfegeData}
                          currentDoColorIndex={currentDoColorIndex}
                          getNoteData={getNoteData}
                          onReorderSegments={handleReorderSegments}
                          onDeleteSegment={handleDeleteSegment}
                          onDuplicateSegment={handleDuplicateSegment}
                          onMoveSegment={handleMoveSegment}
                          isDarkMode={isDarkMode}
                          polySynth={polySynthRef.current}
                          startAudio={startAudio}
                          stopAllAudio={stopAllAudio}
                          bpm={bpm}
                      />
                    ) : (
                      <JamPalette circles={jamCircles} hasPlayed={jamHasPlayed} isDarkMode={isDarkMode} />
                    )}
                  </div>
                  <EnvelopeWidget
                      attack={attack}
                      setAttack={setAttack}
                      release={release}
                      setRelease={setRelease}
                      isDarkMode={isDarkMode}
                  />
                  <VolumeWidget 
                      volume={volume}
                      setVolume={setVolume}
                      isDarkMode={isDarkMode}
                  />
                </div>

                <SolfegeKeyboard
                    mode={activeTab}
                    onInput={handleKeyboardInput}
                    onModeClick={handleModeButtonClick}
                    onNoteOn={handleNoteOn}
                    onNoteOff={handleNoteOff}
                    isParenModeActive={isParenModeActive}
                    isBracketModeActive={isBracketModeActive}
                    shadeTintLevel={shadeTintLevel}
                    onShade={() => setShadeTintLevel(prev => Math.max(-5, prev - 1))}
                    onTint={() => setShadeTintLevel(prev => Math.min(5, prev + 1))}
                    currentDoColorIndex={currentDoColorIndex}
                    solfegeSteps={diatonicSolfegeSteps}
                    handleKeyClickSound={handleKeyClickSound}
                    isDarkMode={isDarkMode}
                    volume={volume}
                    attack={attack}
                    release={release}
                    getNoteData={getNoteData}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                />
                
                {activeTab === 'create' && (
                  <>
                    <textarea
                        value={solfegeInput}
                        onChange={(e) => setSolfegeInput(e.target.value)}
                        className="absolute -left-[9999px]"
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".txt,text/plain"
                        className="hidden"
                    />
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button onClick={handleLoad} className={`px-4 py-2 rounded-lg shadow-md font-bold text-white transition duration-200 ease-in-out transform hover:scale-105 ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'}`}>Load</button>
                        <button onClick={handlePlayAudio} disabled={!hasPlayableContent && !isPlaying} className={`px-8 py-4 rounded-lg shadow-md font-bold text-white transition duration-200 ease-in-out transform hover:scale-105 ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} ${!hasPlayableContent && !isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}>{isPlaying ? 'Stop' : 'Play Audio'}</button>
                        <button onClick={handleExport} disabled={!hasPlayableContent} className={`px-4 py-2 rounded-lg shadow-md font-bold text-white transition duration-200 ease-in-out transform hover:scale-105 ${isDarkMode ? 'bg-sky-600 hover:bg-sky-700' : 'bg-sky-500 hover:bg-sky-600'} ${!hasPlayableContent ? 'opacity-50 cursor-not-allowed' : ''}`}>Export</button>
                    </div>
                    <div className={`flex items-center justify-center gap-3 mt-4 px-5 py-2 rounded-xl shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>BPM</span>
                        <input type="range" min="40" max="240" step="1" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="w-32 accent-green-500" />
                        <span className={`text-sm font-bold w-8 text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{bpm}</span>
                    </div>
                  </>
                )}

                <div className={`w-full max-w-md p-4 rounded-xl shadow-lg mt-8 flex flex-col items-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Choose Key</h2>
                    <div className="grid grid-cols-6 gap-2 w-full">
                        {colorSpectrum.map((color, index) => (
                            <button key={color.name} onClick={() => setCurrentDoColorIndex(index)} className={`relative w-full h-10 rounded-lg border-2 flex items-center justify-center text-white font-bold text-lg ${color.class} transition duration-200 ease-in-out transform hover:scale-110 ${currentDoColorIndex === index ? 'border-blue-500 ring-4 ring-blue-300' : (isDarkMode ? 'border-gray-600' : 'border-gray-300')}`} title={`${noteNames[index]} - ${color.name}`} style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.7)' }}>{noteNames[index]}</button>
                        ))}
                    </div>
                </div>

                <button onClick={() => setShowSettingsMenu(true)} className={`px-6 py-3 rounded-lg shadow-md font-bold text-white transition duration-200 ease-in-out transform hover:scale-105 mt-4 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'}`}>Settings</button>

                <p className={`mt-8 text-center max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {activeTab === 'create' 
                    ? "Use Shade (-) and Tint (+) to alter pitch. Use `Chord` for chords and `Subdivide` for arpeggios/subdivisions."
                    : "The keyboard now shows three octaves. Play notes and chords live!"
                  }
                </p>

                {showSettingsMenu && (
                    <SettingsMenu
                        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
                        playSpacesAsRests={playSpacesAsRests} setPlaySpacesAsRests={setPlaySpacesAsRests}
                        playNotesOnKeyClick={playNotesOnKeyClick} setPlayNotesOnKeyClick={setPlayNotesOnKeyClick}
                        maintainAbsolutePitch={maintainAbsolutePitch} setMaintainAbsolutePitch={setMaintainAbsolutePitch}
                        onClose={() => setShowSettingsMenu(false)}
                    />
                )}
                <ExportModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    onExport={handleConfirmExport}
                    isDarkMode={isDarkMode}
                />
              </>
            )}
        </main>
    </div>
  );
};

// --- Navigation Menu Component ---
const NavMenu = ({ isOpen, onClose, onNavClick, activeTab, isDarkMode }) => {
    return (
        <>
            <div 
                className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'bg-black/50' : 'bg-black/0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} shadow-2xl`}>
                <div className="flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <button onClick={onClose} className={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} aria-label="Close menu">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <nav className="p-4">
                    <ul>
                        <li className="mb-2">
                            <button onClick={() => onNavClick('create')} className={`w-full text-left px-4 py-2 rounded-md text-lg font-medium transition-colors ${activeTab === 'create' ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}>
                                Create
                            </button>
                        </li>
                        <li className="mb-2">
                            <button onClick={() => onNavClick('jam')} className={`w-full text-left px-4 py-2 rounded-md text-lg font-medium transition-colors ${activeTab === 'jam' ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}>
                                Jam
                            </button>
                        </li>
                        <li className="mb-2">
                            <button onClick={() => onNavClick('about')} className={`w-full text-left px-4 py-2 rounded-md text-lg font-medium transition-colors ${activeTab === 'about' ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}>
                                About
                            </button>
                        </li>
                        <li>
                            <button onClick={() => onNavClick('support')} className={`w-full text-left px-4 py-2 rounded-md text-lg font-medium transition-colors ${activeTab === 'support' ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}>
                                Support
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
};

// --- Other Components ---
const SolfegeKeyboard = ({ mode = 'create', onInput, onModeClick, isParenModeActive, isBracketModeActive, shadeTintLevel, onShade, onTint, currentDoColorIndex, solfegeSteps, handleKeyClickSound, isDarkMode, volume, attack, release, getNoteData, onNoteOn, onNoteOff, onUndo, onRedo }) => {
  const solfegeSyllables = ['do', 're', 'mi', 'fa', 'so', 'la', 'ti'];

  const getSolfegeKeyVisuals = useCallback((syllable) => {
    const { baseSyllable, octaveOffset } = parseSyllable(syllable);
    if (!baseSyllable) return { hex: '#9ca3af', brightness: 1 };
    
    const step = solfegeSteps[baseSyllable];
    if (step === undefined) return { hex: '#9ca3af', brightness: 1 };

    const totalColors = colorSpectrum.length;
    const colorIndex = (currentDoColorIndex + step + totalColors) % totalColors;
    const colorEntry = colorSpectrum[colorIndex];
    
    const visualLevel = octaveOffset;
    const brightness = 1 + (visualLevel * 0.30);

    return {
        hex: colorEntry.hex,
        brightness: brightness
    };
  }, [currentDoColorIndex, solfegeSteps]);

  if (mode === 'jam') {
    const lowerOctaveSyllables = solfegeSyllables.map(s => s + '-');
    const middleOctaveSyllables = solfegeSyllables;
    const upperOctaveSyllables = solfegeSyllables.map(s => s + '+');

    const JamKey = ({ syllable }) => {
      const { hex, brightness } = getSolfegeKeyVisuals(syllable);
      const gradientStyle = getGradientStyle(attack, release, hex);
      return (
        <button
          onMouseDown={() => onNoteOn(syllable)}
          onMouseUp={() => onNoteOff(syllable)}
          onMouseLeave={() => onNoteOff(syllable)}
          onTouchStart={(e) => { e.preventDefault(); onNoteOn(syllable); }}
          onTouchEnd={(e) => { e.preventDefault(); onNoteOff(syllable); }}
          className={`p-3 h-16 relative text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 overflow-hidden select-none`}
        >
          <div className="absolute inset-0" style={{ backgroundColor: FADE_TO_GRAY_COLOR }} />
          <div className="absolute inset-0" style={{ background: gradientStyle, opacity: volume, filter: `brightness(${brightness})` }} />
          <span className="relative z-10" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>{syllable.replace(/[+-]/g, '').toUpperCase()}</span>
        </button>
      );
    };

    return (
      <div className={`w-full max-w-lg p-4 rounded-xl shadow-lg mt-8 flex flex-col items-center gap-2 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Lower Octave (top row) */}
        <div className="grid grid-cols-7 gap-2 w-full">
          {lowerOctaveSyllables.map(syllable => <JamKey key={syllable} syllable={syllable} />)}
        </div>
        {/* Middle Octave */}
        <div className="grid grid-cols-7 gap-2 w-full">
          {middleOctaveSyllables.map(syllable => <JamKey key={syllable} syllable={syllable} />)}
        </div>
        {/* Upper Octave (bottom row) */}
        <div className="grid grid-cols-7 gap-2 w-full">
          {upperOctaveSyllables.map(syllable => <JamKey key={syllable} syllable={syllable} />)}
        </div>
      </div>
    );
  }

  // --- RETURN FOR CREATE MODE ---
  return (
    <div className={`w-full max-w-md p-4 rounded-xl shadow-lg mt-8 flex flex-col items-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="grid grid-cols-4 gap-2 mb-4 w-full">
        {solfegeSyllables.map(syllable => {
          const { hex, brightness } = getSolfegeKeyVisuals(syllable + (shadeTintLevel > 0 ? '+'.repeat(shadeTintLevel) : '-'.repeat(Math.abs(shadeTintLevel))));
          return (
            <button
              key={syllable}
              onClick={() => { onInput(syllable); handleKeyClickSound(syllable); }}
              className={`p-3 relative text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105`}
              style={{ backgroundColor: hex, filter: `brightness(${brightness})`, transition: 'background-color 0.4s ease, filter 0.4s ease' }}
            >
              <span style={{textShadow: '1px 1px 2px rgba(0,0,0,0.7)'}}>{syllable.toUpperCase()}</span>
            </button>
          );
        })}
        <div className="grid grid-cols-2 gap-1">
            <button onClick={onShade} className={`p-3 font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 ${shadeTintLevel < 0 ? 'bg-purple-600 text-white ring-purple-600' : (isDarkMode ? 'bg-gray-600 text-gray-100 ring-gray-600' : 'bg-gray-300 text-gray-800 ring-gray-300')}`}>
                {shadeTintLevel < 0 ? shadeTintLevel : '-'}
            </button>
            <button onClick={onTint} className={`p-3 font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 ${shadeTintLevel > 0 ? 'bg-yellow-400 text-black ring-yellow-400' : (isDarkMode ? 'bg-gray-600 text-gray-100 ring-gray-600' : 'bg-gray-300 text-gray-800 ring-gray-300')}`}>
                {shadeTintLevel > 0 ? `+${shadeTintLevel}`: '+'}
            </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full mb-2">
        <button onClick={() => onInput('delete')} className={`p-3 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 ${isDarkMode ? 'bg-red-600 hover:bg-red-500' : 'bg-red-400 hover:bg-red-500'}`}>Delete</button>
        <button onClick={() => onInput('space')} className={`p-3 font-bold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 ${isDarkMode ? 'bg-gray-600 text-gray-100 ring-gray-600' : 'bg-gray-300 text-gray-800 ring-gray-300'}`}>Space</button>
        <button onClick={() => onInput('newline')} className={`p-3 font-bold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 ${isDarkMode ? 'bg-gray-600 text-gray-100 ring-gray-600' : 'bg-gray-300 text-gray-800 ring-gray-300'}`}>Newline</button>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full">
        <button onClick={() => onModeClick('parentheses')} className={`p-3 font-bold rounded-lg shadow-md focus:outline-none focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 ${isParenModeActive ? (isDarkMode ? 'bg-blue-800 text-white ring-2 ring-blue-400' : 'bg-blue-600 text-white ring-2 ring-blue-400') : (isDarkMode ? 'bg-gray-600 text-gray-100 hover:bg-gray-500' : 'bg-gray-300 text-gray-800 hover:bg-gray-400')}`}>Chord</button>
        <button onClick={() => onModeClick('brackets')} className={`p-3 font-bold rounded-lg shadow-md focus:outline-none focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105 ${(isBracketModeActive && !isParenModeActive) ? (isDarkMode ? 'bg-blue-800 text-white ring-2 ring-blue-400' : 'bg-blue-600 text-white ring-2 ring-blue-400') : (isParenModeActive ? (isDarkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed') : (isDarkMode ? 'bg-gray-600 text-gray-100 hover:bg-gray-500' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'))}`}>Subdivide</button>
      </div>
    </div>
  );
};

const VolumeWidget = ({ volume, setVolume, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const collapsedClasses = 'absolute top-1/2 -translate-y-1/2 right-0';
    const expandedClasses = 'absolute top-1/2 -translate-y-1/2 right-4';

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className={`${collapsedClasses} z-30 w-8 h-14 rounded-l-lg shadow-lg flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-gray-700/80 hover:bg-gray-600/90' : 'bg-white/80 hover:bg-gray-200/90'} backdrop-blur-sm`}
                aria-label="Open volume control"
            >
                <VolumeIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />
            </button>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-30" onClick={() => setIsExpanded(false)} />
            
            <div
                onClick={e => e.stopPropagation()}
                className={`${expandedClasses} z-40 flex flex-col items-center p-2 rounded-xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}
            >
                <label className={`mb-2 text-xs font-bold tracking-widest [writing-mode:vertical-rl] transform rotate-180 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>VOLUME</label>
                <div className="h-48 w-6 flex items-center justify-center">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-40 h-1.5 appearance-none cursor-pointer -rotate-90 rounded-lg bg-gray-300 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <span className={`mt-2 font-mono text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{Math.round(volume * 100)}</span>
            </div>
        </>
    );
};

const EnvelopeWidget = ({ attack, setAttack, release, setRelease, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const collapsedClasses = 'absolute top-1/2 -translate-y-1/2 left-0';
    const expandedClasses = 'absolute top-1/2 -translate-y-1/2 left-4';

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className={`${collapsedClasses} z-30 w-8 h-14 rounded-r-lg shadow-lg flex items-center justify-center transition-all duration-300 ${isDarkMode ? 'bg-gray-700/80 hover:bg-gray-600/90' : 'bg-white/80 hover:bg-gray-200/90'} backdrop-blur-sm`}
                aria-label="Open envelope control"
            >
                <WaveformIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`} />
            </button>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-30" onClick={() => setIsExpanded(false)} />
            <div
                onClick={e => e.stopPropagation()}
                className={`${expandedClasses} z-40 flex items-center p-3 rounded-xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm'}`}
            >
                <div className="flex flex-col items-center mr-3">
                    <label className={`mb-2 text-xs font-bold tracking-widest ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ATTACK</label>
                    <div className="h-32 w-6 flex items-center justify-center">
                        <input
                            type="range" min="0" max="2" step="0.01" value={attack}
                            onChange={(e) => setAttack(parseFloat(e.target.value))}
                            className="w-28 h-1.5 appearance-none cursor-pointer -rotate-90 rounded-lg bg-gray-300 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <span className={`mt-2 font-mono text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{attack.toFixed(2)}s</span>
                </div>
                <div className="flex flex-col items-center">
                    <label className={`mb-2 text-xs font-bold tracking-widest ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>RELEASE</label>
                    <div className="h-32 w-6 flex items-center justify-center">
                        <input
                            type="range" min="0" max="2" step="0.01" value={release}
                            onChange={(e) => setRelease(parseFloat(e.target.value))}
                            className="w-28 h-1.5 appearance-none cursor-pointer -rotate-90 rounded-lg bg-gray-300 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <span className={`mt-2 font-mono text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>{release.toFixed(2)}s</span>
                </div>
            </div>
        </>
    );
};


const parseConcatenatedSyllables = (concatenatedString) => {
    if (!concatenatedString) return [];
    const regex = /(?:do|di|re|ri|mi|fa|fi|so|si|la|li|ti)(?:[+-]*)(?:\@\d\.?\d*)?(?:\^\d\.?\d*)?(?:\>\d\.?\d*)?/ig;
    return concatenatedString.match(regex) || [];
};

const ContextMenu = ({ x, y, onDuplicate, onDelete, onMoveLeft, onMoveRight, onClose, isDarkMode }) => {
    return (
        <div className="fixed inset-0 z-50" onClick={onClose}>
            <div
                className={`absolute flex flex-col rounded-md shadow-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
                style={{ top: y, left: x }}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onDuplicate} className={`flex items-center w-full px-3 py-2 text-sm rounded-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-800 hover:bg-gray-100'}`}>
                    <DuplicateIcon className="w-4 h-4 mr-2" /> Duplicate
                </button>
                <div className="flex border-t my-1" style={{borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}} />
                <button onClick={onMoveLeft} className={`flex items-center w-full px-3 py-2 text-sm rounded-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-800 hover:bg-gray-100'}`}>
                    <ArrowLeftIcon className="w-4 h-4 mr-2" /> Move Left
                </button>
                <button onClick={onMoveRight} className={`flex items-center w-full px-3 py-2 text-sm rounded-sm ${isDarkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-800 hover:bg-gray-100'}`}>
                    <ArrowRightIcon className="w-4 h-4 mr-2" /> Move Right
                </button>
                <div className="flex border-t my-1" style={{borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}} />
                <button onClick={onDelete} className={`flex items-center w-full px-3 py-2 text-sm rounded-sm ${isDarkMode ? 'text-red-400 hover:bg-red-500 hover:text-white' : 'text-red-600 hover:bg-red-500 hover:text-white'}`}>
                    <TrashIcon className="w-4 h-4 mr-2" /> Delete
                </button>
            </div>
        </div>
    );
};

const SolfegeWordDisplay = React.forwardRef(({ solfegeData, currentDoColorIndex, getNoteData, onReorderSegments, onDeleteSegment, onDuplicateSegment, onMoveSegment, isDarkMode, polySynth, startAudio, stopAllAudio, bpm }, ref) => {
  const [glowingSegmentId, setGlowingSegmentId] = useState(null);
  const [isDraggingSegmentId, setIsDraggingSegmentId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, lineIndex: 0, segmentIdx: 0 });
  
  const pressTimerRef = useRef(null);
  const isPressedRef = useRef(false);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => containerRef.current && setContainerWidth(containerRef.current.clientWidth);
    const timeoutId = setTimeout(updateWidth, 100);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const handlePressStart = (e, lineIndex, segmentIdx) => {
    if (e.type === 'touchstart') e.preventDefault();
    isPressedRef.current = true;
    pressTimerRef.current = setTimeout(() => {
        if (isPressedRef.current) {
            const touch = e.touches ? e.touches[0] : e;
            setContextMenu({ visible: true, x: touch.clientX, y: touch.clientY, lineIndex, segmentIdx });
            stopAllAudio();
        }
    }, 500);
  };

  const handlePressEnd = () => {
    isPressedRef.current = false;
    clearTimeout(pressTimerRef.current);
  };

  const handleCloseContextMenu = () => setContextMenu({ ...contextMenu, visible: false });
  const handleDelete = () => { onDeleteSegment(contextMenu.lineIndex, contextMenu.segmentIdx); handleCloseContextMenu(); };
  const handleDuplicate = () => { onDuplicateSegment(contextMenu.lineIndex, contextMenu.segmentIdx); handleCloseContextMenu(); };
  const handleMoveLeft = () => { onMoveSegment(contextMenu.lineIndex, contextMenu.segmentIdx, -1); handleCloseContextMenu(); };
  const handleMoveRight = () => { onMoveSegment(contextMenu.lineIndex, contextMenu.segmentIdx, 1); handleCloseContextMenu(); };

  const getVisualsForSyllable = useCallback((syllableString) => {
      const { baseSyllable, volume, attack, release } = parseSyllable(syllableString);
      if (!baseSyllable) return { hex: '#9ca3af', brightness: 1, volume: 1, attack: DEFAULT_ATTACK, release: DEFAULT_RELEASE, baseSyllable: '' };

      const step = chromaticSolfegeMap[baseSyllable];
      if (step === undefined) return { hex: '#9ca3af', brightness: 1, volume, attack, release, baseSyllable };

      const noteData = getNoteData(syllableString);
      if (!noteData || !noteData.note) return { hex: '#9ca3af', brightness: 1, volume, attack, release, baseSyllable };
      
      const octave = parseInt(noteData.note.replace(/[^0-9]/g, ''), 10);
      const visualLevel = octave - 4;
      
      const brightness = 1 + (visualLevel * 0.30);
      const colorIndex = (currentDoColorIndex + step) % colorSpectrum.length;
      const hex = colorSpectrum[colorIndex].hex;

      return { hex, brightness, volume, attack, release, baseSyllable };
  }, [getNoteData, currentDoColorIndex]);

  const parseWordSegment = useCallback((segmentString) => {
    const result = [];
    let i = 0;
    while (i < segmentString.length) {
        if (segmentString[i] === '(') {
            let parenCount = 1;
            let chordContentEnd = -1;
            for (let j = i + 1; j < segmentString.length; j++) {
                if (segmentString[j] === '(') parenCount++;
                if (segmentString[j] === ')') parenCount--;
                if (parenCount === 0) { chordContentEnd = j; break; }
            }
            if (parenCount !== 0) chordContentEnd = segmentString.length;

            const innerChordString = segmentString.substring(i + 1, chordContentEnd);
            const chordSyllables = parseConcatenatedSyllables(innerChordString);
            const sortedChordSyllables = [...chordSyllables].sort((a, b) => {
                const noteA = getNoteData(a);
                const noteB = getNoteData(b);
                if (!noteA || !noteB) return 0;
                return Tone.Midi(noteA.note).toMidi() - Tone.Midi(noteB.note).toMidi();
            });
            result.push(sortedChordSyllables);
            i = chordContentEnd + 1;
        } else if (segmentString[i] === '[') {
            let bracketCount = 1;
            let arpeggioContentEnd = -1;
            for (let j = i + 1; j < segmentString.length; j++) {
                if (segmentString[j] === '[') bracketCount++;
                if (segmentString[j] === ']') bracketCount--;
                if (bracketCount === 0) { arpeggioContentEnd = j; break; }
            }
            if (bracketCount !== 0) arpeggioContentEnd = segmentString.length;

            const innerArpeggioString = segmentString.substring(i + 1, arpeggioContentEnd);
            const arpeggioItems = parseWordSegment(innerArpeggioString);
            result.push({ type: 'arpeggio', items: arpeggioItems });
            i = arpeggioContentEnd + 1;
        } else {
            const remaining = segmentString.substring(i);
            const syllableRegex = /^(?:do|di|re|ri|mi|fa|fi|so|si|la|li|ti)(?:[+-]*)(?:\@\d\.?\d*)?(?:\^\d\.?\d*)?(?:\>\d\.?\d*)?/i;
            const match = remaining.match(syllableRegex);
            if (match) {
                result.push(match[0]);
                i += match[0].length;
            } else {
                result.push(segmentString[i]);
                i++;
            }
        }
    }
    return result;
  }, [getNoteData]);
  
  const playSegment = useCallback(async (segmentToPlay, lineIndex, segmentIdx) => {
    return new Promise(async (resolve) => {
        const audioStarted = await startAudio();
        if (!audioStarted || !polySynth || !segmentToPlay.trim() || segmentToPlay === '-') {
            resolve();
            return;
        }
        
        if (polySynth) polySynth.releaseAll();
        if (Tone.Transport.state === 'started') {
            Tone.Transport.stop();
            Tone.Transport.cancel();
        }
        setGlowingSegmentId(`${lineIndex}-${segmentIdx}`);

        const baseClickNoteDuration = (60 / bpm) * 0.6;
        const parsedItems = parseWordSegment(segmentToPlay);
        const audioEvents = parsedItems.map(item => {
            if (typeof item === 'object' && item.type === 'arpeggio') {
                const playableItems = item.items.map(subItem => Array.isArray(subItem) ? subItem.map(getNoteData).filter(Boolean) : getNoteData(subItem)).filter(val => val && (!Array.isArray(val) || val.length > 0));
                if (playableItems.length > 0) return { type: 'arpeggio', value: playableItems };
            } else if (Array.isArray(item)) {
                const notes = item.map(getNoteData).filter(Boolean);
                if (notes.length > 0) return { type: 'chord', value: notes };
            } else {
                const note = getNoteData(item);
                if (note) return { type: 'note', value: note };
            }
            return null;
        }).filter(Boolean);

        if (audioEvents.length === 0) {
            setGlowingSegmentId(null);
            resolve();
            return;
        }
        
        let currentTime = 0;
        let maxPlaybackTime = 0;

        audioEvents.forEach(event => {
            const time = currentTime;
            if (event.type === 'note') {
                const noteData = event.value;
                Tone.Transport.scheduleOnce((t) => polySynth.set({ envelope: { attack: noteData.attack, release: noteData.release } }).triggerAttackRelease(noteData.note, baseClickNoteDuration, t, noteData.volume), time);
                maxPlaybackTime = Math.max(maxPlaybackTime, time + baseClickNoteDuration + noteData.release);
                currentTime += baseClickNoteDuration;
            } else if (event.type === 'chord') {
                const firstNoteData = event.value[0];
                Tone.Transport.scheduleOnce((t) => polySynth.set({ envelope: { attack: firstNoteData.attack, release: firstNoteData.release } }).triggerAttackRelease(event.value.map(n => n.note), baseClickNoteDuration, t, firstNoteData.volume), time);
                let chordRelease = 0;
                event.value.forEach(noteData => { chordRelease = Math.max(chordRelease, noteData.release); });
                maxPlaybackTime = Math.max(maxPlaybackTime, time + baseClickNoteDuration + chordRelease);
                currentTime += baseClickNoteDuration;
            } else if (event.type === 'arpeggio') {
                const subItems = event.value;
                if (subItems.length > 0) {
                    const subItemDuration = baseClickNoteDuration / subItems.length;
                    subItems.forEach((subItem, index) => {
                        const subTime = time + (index * subItemDuration);
                        if (Array.isArray(subItem)) {
                            const firstNoteData = subItem[0];
                            Tone.Transport.scheduleOnce((t) => polySynth.set({ envelope: { attack: firstNoteData.attack, release: firstNoteData.release } }).triggerAttackRelease(subItem.map(n => n.note), subItemDuration, t, firstNoteData.volume), subTime);
                            let arpChordRelease = 0;
                            subItem.forEach(noteData => { arpChordRelease = Math.max(arpChordRelease, noteData.release); });
                            maxPlaybackTime = Math.max(maxPlaybackTime, subTime + subItemDuration + arpChordRelease);
                        } else {
                            const noteData = subItem;
                            Tone.Transport.scheduleOnce((t) => polySynth.set({ envelope: { attack: noteData.attack, release: noteData.release } }).triggerAttackRelease(noteData.note, subItemDuration, t, noteData.volume), subTime);
                            maxPlaybackTime = Math.max(maxPlaybackTime, subTime + subItemDuration + noteData.release);
                        }
                    });
                }
                currentTime += baseClickNoteDuration;
            }
        });

        Tone.Transport.scheduleOnce(() => {
            setGlowingSegmentId(null);
            resolve();
        }, maxPlaybackTime + 0.1);
        
        Tone.Transport.start();
    });
  }, [parseWordSegment, getNoteData, polySynth, startAudio, stopAllAudio, bpm]);

  useImperativeHandle(ref, () => ({
    playSegment,
    clearGlow: () => setGlowingSegmentId(null)
  }));
  
  const handleDragStart = useCallback((e, lineIndex, segmentIdx, segmentContent) => {
    handlePressEnd();
    const dragImg = e.target.cloneNode(true);
    dragImg.style.position = "absolute"; 
    dragImg.style.top = "-1000px";
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, e.target.offsetWidth / 2, e.target.offsetHeight / 2);
    setTimeout(() => document.body.removeChild(dragImg), 0);
    
    dragItem.current = { lineIndex, segmentIdx, originalSegmentContent: segmentContent };
    e.dataTransfer.effectAllowed = 'move';
    setIsDraggingSegmentId(`${lineIndex}-${segmentIdx}`);
  }, []);

  const handleDragEnter = useCallback((e, lineIndex, segmentIdx, segmentContent) => {
    dragOverItem.current = { lineIndex, segmentIdx, segmentContent };
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, lineIndex, segmentIdx, segmentContent) => {
    e.preventDefault();
    const dragged = dragItem.current;
    const droppedOn = dragOverItem.current;
    if (dragged && droppedOn && dragged.lineIndex === droppedOn.lineIndex && dragged.originalSegmentContent !== droppedOn.segmentContent) {
      onReorderSegments(dragged.lineIndex, dragged.originalSegmentContent, droppedOn.segmentContent);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDraggingSegmentId(null);
  }, [onReorderSegments]);

  const handleDragEnd = useCallback(() => {
    setIsDraggingSegmentId(null);
    dragItem.current = null;
    dragOverItem.current = null;
  }, []);

  const BASE_BLOCK_WIDTH_REM = 3, BASE_BLOCK_HEIGHT_REM = 6, BASE_WORD_GAP_REM = 1, BASE_BLACK_BAR_PADDING_REM = 2, BASE_BLACK_BAR_HEIGHT_REM = 3, RECTANGLE_RADIUS_REM = 0.75;
  
  const globalScaleFactor = useMemo(() => {
    if (!containerWidth) return 1;
    let maxLineContentRem = 0;
    solfegeData.forEach(lineSegments => {
      let currentLineRem = 0;
      lineSegments.forEach(segment => {
        if (segment.trim() === '' || segment === '-' || segment === '\n') {
          currentLineRem += BASE_WORD_GAP_REM;
        } else {
          const parsedItems = parseWordSegment(segment);
          const renderableItems = parsedItems.filter(item => {
            if (typeof item === 'object' && item.type === 'arpeggio') {
                const checkPlayable = (items) => items.some(subItem => {
                    if (Array.isArray(subItem)) return subItem.some(s => getNoteData(s));
                    if (typeof subItem === 'object' && subItem.type === 'arpeggio') return checkPlayable(subItem.items);
                    return !!getNoteData(subItem);
                });
                return checkPlayable(item.items);
            }
            if (Array.isArray(item)) return item.some(s => getNoteData(s));
            return !!getNoteData(item);
          });
          if (renderableItems.length > 0) {
            currentLineRem += renderableItems.length * BASE_BLOCK_WIDTH_REM + BASE_BLACK_BAR_PADDING_REM;
          }
        }
      });
      maxLineContentRem = Math.max(maxLineContentRem, currentLineRem);
    });
    const idealContentWidthPx = maxLineContentRem * 16;
    const availableDisplayWidthPx = containerWidth - 20;
    return (idealContentWidthPx <= availableDisplayWidthPx) ? 1 : Math.max(0.1, availableDisplayWidthPx / idealContentWidthPx);
  }, [solfegeData, containerWidth, parseWordSegment, getNoteData]);

  const hasContentToDisplay = solfegeData.flat().some(s => s.trim());

  const NoteBlock = ({ visuals, style }) => (
    <div className="relative w-full h-full" style={style}>
        <div 
            className="absolute inset-0"
            style={{ backgroundColor: FADE_TO_GRAY_COLOR }}
        ></div>
        <div 
            className="absolute inset-0" 
            style={{ 
                background: getGradientStyle(visuals.attack, visuals.release, visuals.hex),
                opacity: visuals.volume, 
                filter: `brightness(${visuals.brightness})` 
            }}
        ></div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      {contextMenu.visible && (
        <ContextMenu
            x={contextMenu.x} y={contextMenu.y}
            onDuplicate={handleDuplicate} onDelete={handleDelete}
            onMoveLeft={handleMoveLeft} onMoveRight={handleMoveRight}
            onClose={handleCloseContextMenu} isDarkMode={isDarkMode}
        />
      )}
      {hasContentToDisplay ? (
        solfegeData.map((lineSegments, lineIndex) => (
          <div key={lineIndex} className="flex flex-wrap justify-center items-start mb-6 w-full">
            {lineSegments.map((segment, segmentIdx) => {
              const segmentId = `${lineIndex}-${segmentIdx}`;
              if (segment.trim() === '' || segment === '-' || segment === '\n') {
                return <div key={segmentId} style={{ width: `${BASE_WORD_GAP_REM * 16 * globalScaleFactor}px` }} className="h-6" onDragOver={e => e.preventDefault()} onDragEnter={e => handleDragEnter(e, lineIndex, segmentIdx, segment)} onDrop={e => handleDrop(e, lineIndex, segmentIdx, segment)} />;
              }

              const parsedItems = parseWordSegment(segment);
              const renderableItems = parsedItems.filter(item => {
                if (typeof item === 'object' && item.type === 'arpeggio') {
                    const checkPlayable = (items) => items.some(subItem => {
                        if (Array.isArray(subItem)) return subItem.some(s => getNoteData(s));
                        if (typeof subItem === 'object' && subItem.type === 'arpeggio') return checkPlayable(subItem.items);
                        return !!getNoteData(subItem);
                    });
                    return checkPlayable(item.items);
                }
                if (Array.isArray(item)) return item.some(s => getNoteData(s));
                return !!getNoteData(item);
              });
              if (renderableItems.length === 0) return null;

              const isGlowing = glowingSegmentId === segmentId || isDraggingSegmentId === segmentId;
              const dynamicBlockWidth = Math.max(1, BASE_BLOCK_WIDTH_REM * 16 * globalScaleFactor);
              const dynamicBlockHeight = Math.max(1, BASE_BLOCK_HEIGHT_REM * 16 * globalScaleFactor);
              const dynamicBlackBarWidth = Math.max(1, (renderableItems.length * BASE_BLOCK_WIDTH_REM + BASE_BLACK_BAR_PADDING_REM) * 16 * globalScaleFactor);
              const dynamicBlackBarHeight = Math.max(1, BASE_BLACK_BAR_HEIGHT_REM * 16 * globalScaleFactor);
              const dynamicWordGap = Math.max(1, BASE_WORD_GAP_REM * 16 * globalScaleFactor);
              const fixedRadiusPx = RECTANGLE_RADIUS_REM * 16 * globalScaleFactor;

              return (
                <div 
                    key={segmentId} 
                    className={`relative flex flex-col items-center transition-all duration-200 cursor-pointer`} 
                    style={{ marginRight: `${dynamicWordGap}px`, borderRadius: `${fixedRadiusPx}px`, border: isGlowing ? `3px solid rgba(252, 211, 77, 0.9)` : `3px solid transparent`, transform: isGlowing ? 'scale(1.05)' : 'scale(1)' }} 
                    onClick={() => playSegment(segment, lineIndex, segmentIdx)} 
                    onMouseDown={(e) => handlePressStart(e, lineIndex, segmentIdx)}
                    onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
                    onTouchStart={(e) => handlePressStart(e, lineIndex, segmentIdx)}
                    onTouchEnd={handlePressEnd} onTouchMove={handlePressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable 
                    onDragStart={e => handleDragStart(e, lineIndex, segmentIdx, segment)} 
                    onDragEnter={e => handleDragEnter(e, lineIndex, segmentIdx, segment)} 
                    onDragOver={e => e.preventDefault()} 
                    onDrop={e => handleDrop(e, lineIndex, segmentIdx, segment)} 
                    onDragEnd={handleDragEnd}
                >
                  <div className={`relative flex justify-center items-start shadow-xl overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} style={{ minHeight: `${dynamicBlockHeight + dynamicBlackBarHeight}px`, paddingTop: `${dynamicBlackBarHeight}px`, borderRadius: `${fixedRadiusPx}px` }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 shadow-lg bg-gray-500" style={{ width: `${dynamicBlackBarWidth}px`, height: `${dynamicBlackBarHeight}px` }} />
                    <div className="flex justify-center items-end relative z-0">
                      {renderableItems.map((item, blockIndex) => {
                        const borderRadiusStyles = { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: blockIndex === 0 ? `${fixedRadiusPx}px` : 0, borderBottomRightRadius: blockIndex === renderableItems.length - 1 ? `${fixedRadiusPx}px` : 0 };
                        if (renderableItems.length === 1) borderRadiusStyles.borderBottomRightRadius = `${fixedRadiusPx}px`;

                        if (Array.isArray(item)) { // Chord
                          const singleStackedBlockHeight = dynamicBlockHeight / item.length;
                          return (
                            <div key={blockIndex} className="flex flex-col justify-end items-center relative overflow-hidden" style={{ width: `${dynamicBlockWidth}px`, height: `${dynamicBlockHeight}px`, ...borderRadiusStyles }}>
                              {item.map((chordSyllable, chordIndex) => (
                                <NoteBlock key={chordIndex} visuals={getVisualsForSyllable(chordSyllable)} style={{ height: `${singleStackedBlockHeight}px` }} />
                              ))}
                            </div>
                          );
                        } else if (typeof item === 'object' && item.type === 'arpeggio') { // Arpeggio
                            const arpeggioItems = item.items;
                            const singleArpBlockWidthPx = dynamicBlockWidth / Math.max(1, arpeggioItems.length);
                            return (
                                <div key={blockIndex} className="flex justify-center items-end overflow-hidden" style={{ width: `${dynamicBlockWidth}px`, height: `${dynamicBlockHeight}px`, ...borderRadiusStyles }}>
                                    {arpeggioItems.map((arpItem, arpIndex) => {
                                        if (Array.isArray(arpItem)) { // Chord in Arpeggio
                                            const singleStackedBlockHeight = dynamicBlockHeight / Math.max(1, arpItem.length);
                                            return (
                                                <div key={arpIndex} className="flex flex-col justify-end items-center relative overflow-hidden" style={{ width: `${singleArpBlockWidthPx}px`, height: `${dynamicBlockHeight}px` }}>
                                                    {arpItem.map((chordSyllable, chordIndex) => (
                                                        <NoteBlock key={chordIndex} visuals={getVisualsForSyllable(chordSyllable)} style={{ height: `${singleStackedBlockHeight}px` }} />
                                                    ))}
                                                </div>
                                            );
                                        } else if (typeof arpItem === 'string') { // Note in Arpeggio
                                            return <NoteBlock key={arpIndex} visuals={getVisualsForSyllable(arpItem)} style={{ width: `${singleArpBlockWidthPx}px`, height: `${dynamicBlockHeight}px` }} />;
                                        }
                                        return null;
                                    })}
                                </div>
                            );
                        } else { // Single Note
                          return <NoteBlock key={blockIndex} visuals={getVisualsForSyllable(item)} style={{ width: `${dynamicBlockWidth}px`, height: `${dynamicBlockHeight}px`, ...borderRadiusStyles }} />;
                        }
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <div className={`flex justify-center items-center p-4 rounded-xl shadow-xl min-h-[100px] w-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>Click a key to start...</p>
        </div>
      )}
    </div>
  );
});

const SettingsMenu = ({ isDarkMode, setIsDarkMode, playSpacesAsRests, setPlaySpacesAsRests, playNotesOnKeyClick, setPlayNotesOnKeyClick, maintainAbsolutePitch, setMaintainAbsolutePitch, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Settings</h2>
      <div className="flex items-center justify-between mb-4">
        <label htmlFor="darkModeToggle" className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dark Mode</label>
        <input type="checkbox" id="darkModeToggle" checked={isDarkMode} onChange={(e) => setIsDarkMode(e.target.checked)} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <label htmlFor="playSpacesAsRests" className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Play spaces as rests</label>
        <input type="checkbox" id="playSpacesAsRests" checked={playSpacesAsRests} onChange={(e) => setPlaySpacesAsRests(e.target.checked)} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
      </div>
      <div className="flex items-center justify-between mb-4">
        <label htmlFor="playNotesOnKeyClick" className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Play notes on key click</label>
        <input type="checkbox" id="playNotesOnKeyClick" checked={playNotesOnKeyClick} onChange={(e) => setPlayNotesOnKeyClick(e.target.checked)} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
      </div>
      <div className="flex items-center justify-between mb-6">
        <label htmlFor="maintainAbsolutePitch" className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Maintain absolute pitch</label>
        <input type="checkbox" id="maintainAbsolutePitch" checked={maintainAbsolutePitch} onChange={(e) => setMaintainAbsolutePitch(e.target.checked)} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
      </div>
      <button onClick={onClose} className={`w-full px-4 py-2 rounded-lg shadow-md font-bold text-white transition duration-200 ease-in-out transform hover:scale-105 ${isDarkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'}`}>Close</button>
    </div>
  </div>
);

const ExportModal = ({ isOpen, onClose, onExport, isDarkMode }) => {
  const [fileName, setFileName] = useState('composition');

  if (!isOpen) return null;

  const handleExportClick = () => {
    onExport(fileName || 'composition');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleExportClick();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-sm p-6 rounded-xl shadow-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
        <h2 className="text-xl font-bold mb-4 text-center">Export Composition</h2>
        <label htmlFor="fileNameInput" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          File name
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="fileNameInput"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex-grow px-3 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-black'} border`}
            autoFocus
          />
          <span className={`px-3 py-2 rounded-r-md ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>.txt</span>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-bold transition duration-200 ease-in-out ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleExportClick}
            className="px-4 py-2 rounded-lg font-bold text-white transition duration-200 ease-in-out bg-blue-600 hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;