import './App.css';
import React, { useEffect, useRef, useState } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './Main_tunes';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';
import AudioControls from './AudioControl';
import PreprocessingEditor from './PreProcess';
import AdvancedControls from './AdvanceControls';

let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

function ProcessedCodeDisplay({ code }) {
    return (
        <div className="processed-code-display">
            <div className="display-header">
                <h3>🔄 PROCESSED CODE</h3>
                <small>What Strudel is actually executing</small>
            </div>
            <pre className="code-output">
                {code || "// Processed code will appear here after clicking 'Process & Play'"}
            </pre>
        </div>
    );
}

export function ProcAndPlay(proc_text, p2Checked, p3Checked, volume, tempo, p1Mode) {
    if (!proc_text) {
        console.log("No text to process yet");
        return;
    }
    
    if (globalEditor != null) {
        Proc(proc_text, p2Checked, p3Checked, volume, tempo, p1Mode);
        
        if (globalEditor.repl.state.started == true) {
            globalEditor.evaluate();
        }
    }
}

export function Proc(proc_text, p2Checked, p3Checked, volume, tempo, p1Mode) {
    if (!proc_text || !globalEditor) {
        console.log("Proc: text or editor not ready");
        return;
    }

    console.log("Processing text...");
    
    let processed = proc_text.replaceAll('<p1_Radio>', p1Mode === 'HUSH' ? '//' : '');
    processed = processed.replaceAll('<p2_Checkbox>', p2Checked ? '' : '//');
    processed = processed.replaceAll('<p3_Checkbox>', p3Checked ? '' : '//');
    processed = processed.replace(/<volume_Slider>([^<]*)<\/volume_Slider>/g, volume.toString());
    processed = processed.replace(/<tempo_Number>([^<]*)<\/tempo_Number>/g, tempo.toString());
    
    globalEditor.setCode(processed);
    console.log("Text processed and set to editor");
    return processed; // Return the processed code
}

// Navigation Component
function Navigation({ currentPage, setCurrentPage }) {
    return (
        <nav className="app-navbar">
            <div className="nav-brand">
                <span className="nav-logo">🎵</span>
                <span className="nav-title">STRUDEL REACTOR</span>
            </div>
            <div className="nav-links">
                <button 
                    className={`nav-link ${currentPage === 'studio' ? 'nav-active' : ''}`}
                    onClick={() => setCurrentPage('studio')}
                >
                    <span className="nav-icon">🎛️</span>
                    STUDIO
                </button>
                <button 
                    className={`nav-link ${currentPage === 'code' ? 'nav-active' : ''}`}
                    onClick={() => setCurrentPage('code')}
                >
                    <span className="nav-icon">💻</span>
                    CODE
                </button>
            </div>
        </nav>
    );
}

// Music Studio Page - All controls and mixer
function MusicStudioPage({ 
    preprocessText, 
    p1Mode, setP1Mode, 
    p2Checked, setP2Checked, 
    p3Checked, setP3Checked, 
    volume, setVolume, 
    tempo, setTempo 
}) {
    const [processedCode, setProcessedCode] = useState('');

    const handleProcessAndPlay = () => {
        if (globalEditor != null) {
            const processed = Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode);
            setProcessedCode(processed); // Update the processed code display
            globalEditor.evaluate();
        }
    };

    const handlePreprocess = () => {
        const processed = Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode);
        setProcessedCode(processed); // Update the processed code display
    };

    return (
        <div className="studio-page">
            <div className="studio-header">
                <h1>🎛️ MUSIC STUDIO</h1>
                <p>Real-time music control and mixing</p>
            </div>

            <div className="studio-layout">
                {/* Left Column - Mixer */}
                <div className="mixer-column">
                    <div className="mixer-card">
                        <div className="card-header">
                            <h2>🎚️ MASTER MIXER</h2>
                            <div className="bpm-display">{tempo} BPM</div>
                        </div>
                        
                        <div className="mixer-channels">
                            {/* Drum Channel */}
                            <div className="mixer-channel">
                                <div className="channel-header">
                                    <div className="channel-info">
                                        <span className="channel-icon">🥁</span>
                                        <span className="channel-name">DRUM KIT</span>
                                    </div>
                                    <div className={`channel-status ${p1Mode === 'ON' ? 'status-active' : 'status-muted'}`}>
                                        {p1Mode === 'ON' ? 'ACTIVE' : 'MUTED'}
                                    </div>
                                </div>
                                <div className="channel-controls">
                                    <div className="toggle-group">
                                        <button 
                                            className={`toggle-btn ${p1Mode === 'ON' ? 'toggle-active' : ''}`}
                                            onClick={() => {
                                                setP1Mode('ON');
                                                const processed = Proc(preprocessText, p2Checked, p3Checked, volume, tempo, 'ON');
                                                setProcessedCode(processed);
                                            }}
                                        >
                                            🔊 ON
                                        </button>
                                        <button 
                                            className={`toggle-btn ${p1Mode === 'HUSH' ? 'toggle-active' : ''}`}
                                            onClick={() => {
                                                setP1Mode('HUSH');
                                                const processed = Proc(preprocessText, p2Checked, p3Checked, volume, tempo, 'HUSH');
                                                setProcessedCode(processed);
                                            }}
                                        >
                                            🔇 MUTE
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Bass Channel */}
                            <div className="mixer-channel">
                                <div className="channel-header">
                                    <div className="channel-info">
                                        <span className="channel-icon">🎸</span>
                                        <span className="channel-name">BASS LINE</span>
                                    </div>
                                    <div className={`channel-status ${p2Checked ? 'status-active' : 'status-muted'}`}>
                                        {p2Checked ? 'ACTIVE' : 'MUTED'}
                                    </div>
                                </div>
                                <div className="channel-controls">
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            checked={p2Checked}
                                            onChange={(e) => {
                                                setP2Checked(e.target.checked);
                                                const processed = Proc(preprocessText, e.target.checked, p3Checked, volume, tempo, p1Mode);
                                                setProcessedCode(processed);
                                            }}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Hi-hat Channel */}
                            <div className="mixer-channel">
                                <div className="channel-header">
                                    <div className="channel-info">
                                        <span className="channel-icon">🔊</span>
                                        <span className="channel-name">HI-HATS</span>
                                    </div>
                                    <div className={`channel-status ${p3Checked ? 'status-active' : 'status-muted'}`}>
                                        {p3Checked ? 'ACTIVE' : 'MUTED'}
                                    </div>
                                </div>
                                <div className="channel-controls">
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            checked={p3Checked}
                                            onChange={(e) => {
                                                setP3Checked(e.target.checked);
                                                const processed = Proc(preprocessText, p2Checked, e.target.checked, volume, tempo, p1Mode);
                                                setProcessedCode(processed);
                                            }}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Global Settings */}
                    <div className="settings-card">
                        <div className="card-header">
                            <h2>⚙️ GLOBAL SETTINGS</h2>
                        </div>
                        <AdvancedControls 
                            p2Checked={p2Checked}
                            onP2Change={(checked) => {
                                setP2Checked(checked);
                                const processed = Proc(preprocessText, checked, p3Checked, volume, tempo, p1Mode);
                                setProcessedCode(processed);
                            }}
                            p3Checked={p3Checked}
                            onP3Change={(checked) => {
                                setP3Checked(checked);
                                const processed = Proc(preprocessText, p2Checked, checked, volume, tempo, p1Mode);
                                setProcessedCode(processed);
                            }}
                            volume={volume}
                            onVolumeChange={(newVolume) => {
                                setVolume(newVolume);
                                const processed = Proc(preprocessText, p2Checked, p3Checked, newVolume, tempo, p1Mode);
                                setProcessedCode(processed);
                            }}
                            tempo={tempo}
                            onTempoChange={(newTempo) => {
                                setTempo(newTempo);
                                const processed = Proc(preprocessText, p2Checked, p3Checked, volume, newTempo, p1Mode);
                                setProcessedCode(processed);
                            }}
                        />
                    </div>
                </div>

                {/* Right Column - Transport & Output */}
                <div className="control-column">
                    {/* Transport Controls */}
                    <div className="transport-card">
                        <div className="card-header">
                            <h2>🎛️ TRANSPORT</h2>
                        </div>
                        <AudioControls 
                            onPlay={() => {
                                if (globalEditor) {
                                    globalEditor.evaluate();
                                }
                            }}
                            onStop={() => {
                                if (globalEditor) {
                                    globalEditor.stop();
                                }
                            }}
                            onPreprocess={handlePreprocess}
                            onProcessPlay={handleProcessAndPlay}
                        />
                    </div>

                    {/* Live Output */}
                    <div className="output-card">
                        <div className="card-header">
                            <h2>📊 LIVE OUTPUT</h2>
                        </div>
                        <div id="editor" className="output-display" />
                    </div>

                    {/* Processed Code Display */}
                    <div className="output-card">
                        <div className="card-header">
                            <h2>🔧 PROCESSED CODE</h2>
                        </div>
                        <ProcessedCodeDisplay code={processedCode} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Code Editor Page - Just the code editor
function CodeEditorPage({ 
    preprocessText, 
    setPreprocessText, 
    p1Mode, setP1Mode, 
    p2Checked, setP2Checked, 
    p3Checked, setP3Checked, 
    volume, setVolume, 
    tempo, setTempo 
}) {
    return (
        <div className="code-page">
            <div className="code-header">
                <h1>💻 CODE EDITOR</h1>
                <p>Edit and experiment with Strudel code</p>
            </div>

            <div className="code-layout">
                <div className="editor-card">
                    <div className="card-header">
                        <h2>🎹 LIVE CODE EDITOR</h2>
                        <div className="editor-actions">
                            <button 
                                className="action-btn primary"
                                onClick={() => {
                                    if (globalEditor != null) {
                                        Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode);
                                        globalEditor.evaluate();
                                    }
                                }}
                            >
                                ⚡ RUN CODE
                            </button>
                        </div>
                    </div>
                    <PreprocessingEditor 
                        value={preprocessText}
                        onChange={(e) => setPreprocessText(e.target.value)}
                    />
                </div>

                <div className="quick-controls-card">
                    <div className="card-header">
                        <h2>⚡ QUICK CONTROLS</h2>
                    </div>
                    
                    <div className="quick-controls">
                        <div className="control-group">
                            <label>🥁 Drums</label>
                            <div className="toggle-group small">
                                <button 
                                    className={`toggle-btn small ${p1Mode === 'ON' ? 'toggle-active' : ''}`}
                                    onClick={() => setP1Mode('ON')}
                                >
                                    ON
                                </button>
                                <button 
                                    className={`toggle-btn small ${p1Mode === 'HUSH' ? 'toggle-active' : ''}`}
                                    onClick={() => setP1Mode('HUSH')}
                                >
                                    MUTE
                                </button>
                            </div>
                        </div>

                        <div className="control-group">
                            <label>🎸 Bass</label>
                            <label className="switch small">
                                <input 
                                    type="checkbox"
                                    checked={p2Checked}
                                    onChange={(e) => setP2Checked(e.target.checked)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="control-group">
                            <label>🔊 Hi-Hats</label>
                            <label className="switch small">
                                <input 
                                    type="checkbox"
                                    checked={p3Checked}
                                    onChange={(e) => setP3Checked(e.target.checked)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="control-group">
                            <label>🔊 Volume: {volume}</label>
                            <input 
                                type="range" 
                                min="0"
                                max="5"
                                step="0.5"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="volume-slider"
                            />
                        </div>

                        <div className="control-group">
                            <label>⚡ Tempo: {tempo}</label>
                            <input 
                                type="number" 
                                value={tempo}
                                onChange={(e) => setTempo(parseInt(e.target.value) || 140)}
                                className="tempo-input"
                            />
                        </div>

                        <button 
                            className="action-btn secondary full-width"
                            onClick={() => {
                                if (globalEditor != null) {
                                    Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode);
                                    globalEditor.evaluate();
                                }
                            }}
                        >
                            🎵 APPLY & PLAY
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StrudelDemo() {
    const hasRun = useRef(false);
    const [currentPage, setCurrentPage] = useState('studio');
    const [preprocessText, setPreprocessText] = useState('');
    const [p1Mode, setP1Mode] = useState('ON');
    const [p2Checked, setP2Checked] = useState(true);
    const [p3Checked, setP3Checked] = useState(true);
    const [volume, setVolume] = useState(2);
    const [tempo, setTempo] = useState(140);

    useEffect(() => {
        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;
            
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2];
            
            globalEditor = new StrudelMirror({
                defaultOutput: webaudioOutput,
                getTime: () => getAudioContext().currentTime,
                transpiler,
                root: document.getElementById('editor'),
                drawTime,
                onDraw: (haps, time) => drawPianoroll({ haps, time, ctx: drawContext, drawTime, fold: 0 }),
                prebake: async () => {
                    initAudioOnFirstClick();
                    const loadModules = evalScope(
                        import('@strudel/core'),
                        import('@strudel/draw'),
                        import('@strudel/mini'),
                        import('@strudel/tonal'),
                        import('@strudel/webaudio'),
                    );
                    await Promise.all([loadModules, registerSynthSounds(), registerSoundfonts()]);
                },
            });
            
            setTimeout(() => {
                setPreprocessText(stranger_tune);
                if (globalEditor) {
                    Proc(stranger_tune, true, true, 2, 140, 'ON');
                }
            }, 100);
        }
    }, []);

    return (
        <div className="strudel-app">
            <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            <main className="app-main">
                {currentPage === 'studio' && (
                    <MusicStudioPage 
                        preprocessText={preprocessText}
                        p1Mode={p1Mode}
                        setP1Mode={setP1Mode}
                        p2Checked={p2Checked}
                        setP2Checked={setP2Checked}
                        p3Checked={p3Checked}
                        setP3Checked={setP3Checked}
                        volume={volume}
                        setVolume={setVolume}
                        tempo={tempo}
                        setTempo={setTempo}
                    />
                )}
                
                {currentPage === 'code' && (
                    <CodeEditorPage 
                        preprocessText={preprocessText}
                        setPreprocessText={setPreprocessText}
                        p1Mode={p1Mode}
                        setP1Mode={setP1Mode}
                        p2Checked={p2Checked}
                        setP2Checked={setP2Checked}
                        p3Checked={p3Checked}
                        setP3Checked={setP3Checked}
                        volume={volume}
                        setVolume={setVolume}
                        tempo={tempo}
                        setTempo={setTempo}
                    />
                )}
            </main>
            
            <canvas id="roll"></canvas>
        </div>
    );
}