
import React, { useState, useEffect } from 'react';
import { getWritingChallenge, validateSentence, generateIllustration, generateCoverIllustration } from '../services/geminiService';
import { WritingChallenge, LoadingState, BookPage } from '../types';
import { Loader2, RefreshCw, Star, ArrowRight, ArrowLeft, Skull, Download, Mountain, Sparkles, Pencil, Gift, Rocket, PartyPopper } from 'lucide-react';

const CHARACTERS = [
  { id: 'dolphin', name: 'Dolphin', icon: '🐬', bg: 'bg-cyan-500', themeBg: 'bg-cyan-50', wallColor: 'border-cyan-700' },
  { id: 'elephant', name: 'Elephant', icon: '🐘', bg: 'bg-slate-400', themeBg: 'bg-slate-100', wallColor: 'border-slate-600' },
  { id: 'lion', name: 'Lion', icon: '🦁', bg: 'bg-amber-500', themeBg: 'bg-amber-50', wallColor: 'border-amber-700' },
  { id: 'giraffe', name: 'Giraffe', icon: '🦒', bg: 'bg-yellow-400', themeBg: 'bg-yellow-50', wallColor: 'border-yellow-600' },
  { id: 'tiger', name: 'Tiger', icon: '🐯', bg: 'bg-orange-500', themeBg: 'bg-orange-50', wallColor: 'border-orange-700' },
  { id: 'shark', name: 'Shark', icon: '🦈', bg: 'bg-blue-600', themeBg: 'bg-blue-50', wallColor: 'border-blue-800' },
];

const MAX_LEVELS = 6;
type GamePhase = 'ENTER_NAME' | 'WELCOME' | 'SELECT_CHAR' | 'SELECT_TITLE' | 'SELECT_COVER' | 'WRITING' | 'SELECT_IMAGE' | 'BOOK_VIEW';

const WritingGame: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('ENTER_NAME');
  const [studentName, setStudentName] = useState('');
  const [selectedChar, setSelectedChar] = useState<typeof CHARACTERS[0] | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [generatedCovers, setGeneratedCovers] = useState<string[]>([]);
  const [selectedCover, setSelectedCover] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [challenge, setChallenge] = useState<WritingChallenge | null>(null);
  const [userSentence, setUserSentence] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [viewPageIdx, setViewPageIdx] = useState(0);
  const [isFalling, setIsFalling] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [status, setStatus] = useState<LoadingState>('idle');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (phase === 'SELECT_COVER' && generatedCovers.length === 0 && (status as string) !== 'loading') {
      loadCovers();
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'WRITING' && !challenge && (status as string) !== 'loading') {
      loadLevelChallenge(currentLevel);
    }
  }, [phase, currentLevel, challenge]);

  const loadCovers = async () => {
    setStatus('loading');
    try {
      const charName = selectedChar?.name || 'Animal';
      const [c1, c2] = await Promise.all([
        generateCoverIllustration(customTitle, charName),
        generateCoverIllustration(customTitle, charName)
      ]);
      setGeneratedCovers([c1, c2]);
      setStatus('idle');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const loadLevelChallenge = async (level: number) => {
    setStatus('loading');
    setFeedback(null);
    setUserSentence('');
    setGeneratedImages([]);
    try {
      const charName = selectedChar?.name || 'Animal';
      const storyTitle = customTitle || 'My Adventure';
      const newChallenge = await getWritingChallenge(level, charName, storyTitle);
      setChallenge(newChallenge);
      setStatus('idle');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const handleSentenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenge || !userSentence.trim() || status === 'loading') return;

    setStatus('loading');
    try {
      const result = await validateSentence(challenge, userSentence);
      if (result.isCorrect) {
        setFeedback({ text: "Super! Now pick a picture.", type: 'success' });
        const charType = selectedChar?.name || 'character';
        const [img1, img2] = await Promise.all([
          generateIllustration(userSentence, 'colorful cartoon', charType),
          generateIllustration(userSentence, 'bright watercolor', charType)
        ]);
        setGeneratedImages([img1, img2]);
        setPhase('SELECT_IMAGE');
        setStatus('idle');
      } else {
        setFeedback({ text: result.feedback, type: 'error' });
        setIsFalling(true);
        setIsShaking(true);
        setStatus('idle');
        setTimeout(() => {
          setIsFalling(false);
          setIsShaking(false);
        }, 800);
      }
    } catch (e) {
      setStatus('error');
    }
  };

  const handleImageSelect = (imgUrl: string) => {
    const newPage: BookPage = { text: userSentence, imageUrl: imgUrl };
    setPages([...pages, newPage]);
    setChallenge(null); 

    if (currentLevel < MAX_LEVELS) {
      setCurrentLevel(prev => prev + 1);
      setPhase('WRITING');
    } else {
      setPhase('BOOK_VIEW');
      setViewPageIdx(0);
    }
  };

  const handleDownloadBook = () => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${customTitle}</title>
      <style>
        body { font-family: 'Comic Sans MS', cursive, sans-serif; text-align: center; background: #fffcf0; padding: 40px; color: #333; }
        .page { margin-bottom: 80px; background: white; max-width: 800px; margin: 0 auto 50px auto; padding: 40px; border-radius: 30px; border: 10px solid #eee; }
        img { max-width: 100%; border-radius: 20px; }
        h1 { font-size: 4em; color: #4f46e5; }
        p { font-size: 2em; line-height: 1.4; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="page">
        <h1>${customTitle}</h1>
        <p>By ${studentName}</p>
        <img src="${selectedCover}" />
      </div>
      ${pages.map((p, i) => `
        <div class="page">
          <img src="${p.imageUrl}" />
          <p>${p.text}</p>
          <div style="color: #ccc;">- Page ${i + 1} -</div>
        </div>
      `).join('')}
    </body>
    </html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${customTitle.replace(/\s+/g, '_')}.html`;
    link.click();
  };

  const handleReset = () => {
    setPhase('ENTER_NAME');
    setCurrentLevel(1);
    setPages([]);
    setCustomTitle('');
    setGeneratedCovers([]);
    setChallenge(null);
    setStudentName('');
    setStatus('idle');
  };

  const containerBg = selectedChar ? selectedChar.themeBg : 'bg-slate-50';
  const wallColor = selectedChar ? selectedChar.wallColor : 'border-slate-300';

  if (phase === 'ENTER_NAME') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-[3rem] shadow-2xl relative">
        <h2 className="text-8xl font-black text-indigo-900 mb-12 text-center drop-shadow-xl animate-bounce">Story Climber!</h2>
        <div className="bg-white/95 p-16 rounded-[4rem] shadow-2xl w-full max-w-2xl text-center border-[12px] border-indigo-200 backdrop-blur-md">
            <label className="block text-indigo-800 font-black text-5xl mb-10 tracking-tight">What is your name?</label>
            <input 
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your Name..."
                className="w-full text-center text-5xl font-bold p-8 rounded-[2.5rem] border-4 border-indigo-100 focus:border-indigo-500 outline-none mb-12 shadow-inner"
            />
            <button 
                disabled={!studentName.trim()}
                onClick={() => setPhase('WELCOME')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-5xl py-8 rounded-[2.5rem] shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
                Continue
            </button>
        </div>
      </div>
    );
  }

  if (phase === 'WELCOME') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-yellow-200 via-orange-100 to-red-100 rounded-[3rem] shadow-2xl">
        <div className="flex gap-4 mb-10">
            <PartyPopper size={140} className="text-orange-500 animate-pulse" />
        </div>
        <h2 className="text-8xl font-black text-orange-900 mb-6 text-center tracking-tight">Hi, {studentName}!</h2>
        <p className="text-4xl text-orange-800 mb-16 font-bold text-center opacity-80">Are you ready to climb and write?</p>
        <button 
            onClick={() => setPhase('SELECT_CHAR')}
            className="group flex items-center gap-6 bg-orange-600 hover:bg-orange-700 text-white font-black text-6xl px-20 py-10 rounded-[4rem] shadow-2xl transition-all active:scale-95"
        >
            Haydi Başlayalım! <ArrowRight size={72} className="group-hover:translate-x-4 transition-transform" />
        </button>
      </div>
    );
  }

  if (phase === 'SELECT_CHAR') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 bg-indigo-50 rounded-[3rem] shadow-2xl">
        <h2 className="text-6xl font-black text-indigo-900 mb-16 text-center">Pick your Friend!</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 w-full max-w-5xl">
            {CHARACTERS.map((char) => (
                <button
                    key={char.id}
                    onClick={() => { setSelectedChar(char); setPhase('SELECT_TITLE'); }}
                    className={`${char.bg} hover:scale-110 active:scale-95 transition-all p-12 rounded-[3.5rem] flex flex-col items-center gap-6 shadow-2xl border-b-[16px] border-black/20 group`}
                >
                    <span className="text-9xl drop-shadow-2xl group-hover:rotate-6 transition-transform">{char.icon}</span>
                    <span className="font-black text-white text-3xl uppercase tracking-widest">{char.name}</span>
                </button>
            ))}
        </div>
      </div>
    );
  }

  if (phase === 'SELECT_TITLE') {
    return (
      <div className={`min-h-full flex flex-col items-center justify-center p-8 ${containerBg} rounded-[3rem] shadow-2xl transition-colors`}>
        <div className="text-[15rem] mb-12 drop-shadow-2xl">{selectedChar?.icon}</div>
        <h2 className="text-7xl font-black text-slate-800 mb-12 text-center">Give your story a name!</h2>
        <div className="bg-white p-16 rounded-[4.5rem] shadow-2xl w-full max-w-3xl border-[12px] border-indigo-50">
            <input 
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="The Story Of..."
                className="w-full text-5xl font-bold p-10 rounded-[3rem] border-4 border-slate-50 focus:border-indigo-500 outline-none mb-12 text-center shadow-inner"
            />
            <button
                onClick={() => setPhase('SELECT_COVER')}
                disabled={!customTitle.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-6xl py-10 rounded-[3rem] shadow-2xl active:scale-95 disabled:opacity-50"
            >
                Next Step
            </button>
        </div>
      </div>
    );
  }

  if (phase === 'SELECT_COVER') {
    return (
      <div className={`min-h-full flex flex-col items-center justify-center p-8 ${containerBg} rounded-[3rem] shadow-2xl transition-colors`}>
        <h2 className="text-6xl font-black text-slate-800 mb-16">Pick your Cover!</h2>
        {(status as string) === 'loading' ? (
          <div className="flex flex-col items-center gap-8">
            <Loader2 className="w-32 h-32 text-indigo-600 animate-spin" />
            <p className="text-4xl font-black text-indigo-900 animate-pulse">Creating Artwork...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-6xl">
            {generatedCovers.map((cover, i) => (
              <button 
                key={i} 
                onClick={() => { setSelectedCover(cover); setPhase('WRITING'); }}
                className="bg-white p-6 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:scale-105 transition-transform border-[16px] border-transparent hover:border-indigo-500 overflow-hidden"
              >
                <img src={cover} className="w-full rounded-[3rem] shadow-inner" alt="Cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'BOOK_VIEW') {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 bg-slate-900 rounded-[3rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
        <div className="flex flex-col items-center mb-12 z-20">
            <Gift className="text-yellow-400 w-32 h-32 mb-8 animate-bounce" />
            <h2 className="text-7xl font-black text-white tracking-tight text-center">Amazing! Your book is ready.</h2>
        </div>

        <div className="max-w-6xl w-full h-[750px] bg-[#fdfbf7] rounded-[4rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)] flex relative overflow-hidden border-r-[20px] border-slate-200 animate-[bookReveal_1s_ease-out]">
            <style>{`
                @keyframes bookReveal { from { transform: scale(0.6) translateY(100px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
            `}</style>
            <div className="w-16 bg-slate-300 border-r border-slate-400 h-full z-10 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]"></div>
            <div className="flex-1 p-24 flex flex-col items-center justify-center text-center z-20 overflow-y-auto">
                {viewPageIdx === 0 ? (
                    <div className="animate-fade-in flex flex-col items-center">
                        <h1 className="text-8xl font-serif font-bold mb-12 text-slate-900">{customTitle}</h1>
                        <img src={selectedCover} className="w-[500px] h-[500px] object-cover rounded-[3rem] shadow-2xl border-[12px] border-slate-900 mb-12" />
                        <p className="text-5xl font-serif italic text-slate-600">By <span className="font-bold text-slate-900 underline underline-offset-8 decoration-indigo-300">{studentName}</span></p>
                    </div>
                ) : viewPageIdx <= pages.length ? (
                    <div className="animate-fade-in w-full flex flex-col items-center">
                        <img src={pages[viewPageIdx - 1].imageUrl} className="w-[550px] h-[550px] object-cover rounded-[4rem] shadow-2xl mb-12 border-[10px] border-white" />
                        <p className="text-6xl font-serif leading-relaxed text-slate-800 max-w-3xl italic font-medium">"{pages[viewPageIdx - 1].text}"</p>
                        <span className="mt-20 block text-slate-300 font-mono tracking-[0.3em] uppercase">- Page {viewPageIdx} -</span>
                    </div>
                ) : (
                    <div className="animate-fade-in flex flex-col items-center">
                        <h2 className="text-[12rem] font-serif font-bold mb-12 text-slate-900">THE END</h2>
                        <div className="flex justify-center gap-10 text-yellow-500 mb-16">
                            <Star fill="currentColor" size={100} className="animate-pulse" />
                            <Star fill="currentColor" size={100} className="animate-pulse [animation-delay:0.1s]" />
                            <Star fill="currentColor" size={100} className="animate-pulse [animation-delay:0.2s]" />
                        </div>
                        <p className="text-5xl font-serif text-slate-500">You did it, {studentName}!</p>
                    </div>
                )}
            </div>
            <div className="absolute bottom-16 right-16 flex gap-12 z-30">
                <button disabled={viewPageIdx === 0} onClick={() => setViewPageIdx(p => p - 1)} className="p-10 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-20 shadow-2xl active:scale-90 transition-all">
                    <ArrowLeft size={64} />
                </button>
                <button disabled={viewPageIdx > pages.length} onClick={() => setViewPageIdx(p => p + 1)} className="p-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl active:scale-90 transition-all">
                    <ArrowRight size={64} />
                </button>
            </div>
        </div>
        
        <div className="mt-20 flex gap-12 z-20">
            <button onClick={handleDownloadBook} className="bg-emerald-600 hover:bg-emerald-700 text-white px-16 py-8 rounded-full font-black text-4xl flex items-center gap-6 shadow-2xl transition-transform hover:-translate-y-2">
                <Download size={48}/> SAVE BOOK
            </button>
            <button onClick={handleReset} className="bg-white hover:bg-slate-100 text-slate-900 px-16 py-8 rounded-full font-black text-4xl flex items-center gap-6 shadow-2xl transition-transform hover:-translate-y-2 border-4">
                <RefreshCw size={48}/> NEW STORY
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-[calc(100vh-140px)] w-full max-w-7xl mx-auto rounded-[5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border-[16px] transition-all duration-300 
      ${isShaking ? 'border-red-600 bg-red-600 animate-[shake_0.5s_infinite]' : 'border-white bg-white'}`}>
      
      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-25px); } 75% { transform: translateX(25px); } }
        .cliff-texture { background: #4b3621; background-image: url('https://www.transparenttextures.com/patterns/rocky-wall.png'); }
        .ledge-3d { position: absolute; width: 130px; height: 26px; background: #2a1b0c; border-radius: 14px; box-shadow: 0 10px 0 #000; }
      `}</style>

      <div className={`relative w-full md:w-1/3 h-full bg-gradient-to-b from-sky-300 via-sky-100 to-green-50 border-r-8 ${wallColor} overflow-hidden shadow-inner`}>
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-80 cliff-texture shadow-[inset_0_0_100px_rgba(0,0,0,0.6)] flex flex-col items-center">
            {Array.from({length: MAX_LEVELS}).map((_, i) => (
                <div key={i} className="ledge-3d" style={{ 
                    bottom: `${(i + 1) * (100 / (MAX_LEVELS + 1))}%`, 
                    left: (i + 1) % 2 === 0 ? '-55px' : 'auto', 
                    right: (i + 1) % 2 !== 0 ? '-55px' : 'auto' 
                }}></div>
            ))}

            <div 
              className={`absolute left-1/2 -translate-x-1/2 z-40 transition-all duration-1000 ease-in-out text-[11rem] drop-shadow-2xl 
              ${isFalling ? 'animate-bounce text-red-500 scale-75' : 'hover:scale-110'}`} 
              style={{ bottom: isFalling ? `${(currentLevel * (100 / (MAX_LEVELS + 1))) - 15}%` : `${currentLevel * (100 / (MAX_LEVELS + 1))}%` }}
            >
                {selectedChar?.icon}
            </div>
        </div>

        <div className="absolute top-12 left-12 bg-white/95 backdrop-blur-md p-8 rounded-[3rem] border-4 border-white shadow-2xl flex items-center gap-8">
            <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl">
                <Mountain size={56} />
            </div>
            <div>
                <p className="text-lg font-black text-indigo-400 uppercase tracking-widest">Height</p>
                <p className="text-6xl font-black text-indigo-900 leading-none">{currentLevel} / {MAX_LEVELS}</p>
            </div>
        </div>
      </div>

      <div className={`flex-1 flex flex-col p-16 overflow-y-auto relative ${isShaking ? 'bg-red-50' : containerBg} transition-colors duration-500`}>
        
        {phase === 'SELECT_IMAGE' ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-16 animate-fade-in">
                <div className="text-center">
                    <h3 className="text-6xl font-black text-slate-800 mb-8 tracking-tight">Great Sentence!</h3>
                    <p className="text-3xl font-bold bg-white/80 px-12 py-8 rounded-[3rem] shadow-xl italic text-indigo-900 border-4 border-white">
                        "{userSentence}"
                    </p>
                </div>
                <h4 className="text-5xl font-black text-slate-700 tracking-tight">Pick a picture for your book:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 w-full max-w-6xl">
                    {generatedImages.map((img, i) => (
                        <button key={i} onClick={() => handleImageSelect(img)} className="bg-white p-6 rounded-[4.5rem] shadow-2xl hover:scale-105 transition-all border-[16px] border-transparent hover:border-emerald-500 group relative">
                            <img src={img} className="w-full rounded-[3rem] shadow-inner" alt="Option" />
                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-white text-emerald-600 font-black px-16 py-8 rounded-full shadow-2xl text-4xl">This one!</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        ) : phase === 'WRITING' ? (
            <div className="flex-1 flex items-center justify-center">
                {(status as LoadingState) === 'loading' ? (
                    <div className="text-center bg-white p-24 rounded-[6rem] shadow-2xl border-8 border-indigo-50">
                        <Loader2 className="w-48 h-48 text-indigo-600 animate-spin mx-auto mb-16" />
                        <h3 className="text-5xl font-black text-slate-800">Thinking...</h3>
                    </div>
                ) : challenge && (
                    <div className={`w-full max-w-4xl bg-white rounded-[5.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden relative border-b-[24px] border-slate-100`}>
                        <div className={`p-12 text-white font-black text-5xl flex items-center justify-between ${isShaking ? 'bg-red-600' : 'bg-indigo-600'} transition-colors duration-300 shadow-lg`}>
                            <span>{challenge.topic}</span>
                            <Pencil size={56} />
                        </div>
                        <div className="p-16 space-y-16">
                            <div className="space-y-8">
                                <h4 className="text-indigo-900 font-black text-4xl flex items-center gap-6">
                                    <Sparkles className="text-yellow-500" size={56} />
                                    Your Task:
                                </h4>
                                <p className="text-5xl text-slate-700 leading-relaxed font-bold bg-indigo-50 p-12 rounded-[4rem] border-8 border-indigo-100 shadow-inner">
                                    {challenge.stepDescription}
                                </p>
                            </div>
                            <form onSubmit={handleSentenceSubmit} className="space-y-12">
                                <textarea 
                                    rows={3}
                                    value={userSentence}
                                    onChange={(e) => setUserSentence(e.target.value)}
                                    placeholder="Write your FULL SENTENCE here..."
                                    className={`w-full text-5xl font-bold p-16 border-[10px] rounded-[4.5rem] outline-none transition-all shadow-2xl resize-none ${isShaking ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-50 focus:border-indigo-400 focus:bg-white'}`}
                                    autoFocus
                                />
                                {feedback && (
                                    <div className={`p-12 rounded-[4rem] font-black text-4xl text-center flex items-center justify-center gap-8 ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {feedback.type === 'error' && <Skull size={64} />}
                                        {feedback.text}
                                    </div>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={!userSentence.trim() || status === 'loading' || isFalling} 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-6xl font-black py-12 rounded-[4.5rem] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.5)] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-8"
                                >
                                    Check & Climb! <ArrowRight size={72} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        ) : null}
      </div>
    </div>
  );
};

export default WritingGame;
