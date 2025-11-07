import './styling/App.css';
import React, { useEffect, useRef, useState } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './utils/Main_tunes';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';
import AudioControls from './components/Controls/AudioControl';
import PreprocessingEditor from './components/PreProcessing/PreProcess';
import AdvancedControls from './components/Controls/AdvanceControls';
import AudioVisualizer from './components/Visualise/AudioVisualiser';

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

export function Proc(proc_text, p2Checked, p3Checked, volume, tempo, p1Mode, p4Checked, p5Checked, p6Checked, reverbVol, melodyVol, percussionVol) {
    if (!proc_text || !globalEditor) {
        console.log("Proc: text or editor not ready");
        return;
    }

    console.log("Processing text...");
    
    let processed = proc_text.replaceAll('<p1_Radio>', p1Mode === 'HUSH' ? '//' : '');
    processed = processed.replaceAll('<p2_Checkbox>', p2Checked ? '' : '//');
    processed = processed.replaceAll('<p3_Checkbox>', p3Checked ? '' : '//');
    processed = processed.replaceAll('<p4_Checkbox>', p4Checked ? '' : '//');
    processed = processed.replaceAll('<p5_Checkbox>', p5Checked ? '' : '//');
    processed = processed.replaceAll('<p6_Checkbox>', p6Checked ? '' : '//');
    processed = processed.replace(/<volume_Slider>([^<]*)<\/volume_Slider>/g, volume.toString());
    processed = processed.replace(/<tempo_Number>([^<]*)<\/tempo_Number>/g, tempo.toString());
    processed = processed.replace(/<reverb_Volume>([^<]*)<\/reverb_Volume>/g, reverbVol.toString());
    processed = processed.replace(/<melody_Volume>([^<]*)<\/melody_Volume>/g, melodyVol.toString());
    processed = processed.replace(/<percussion_Volume>([^<]*)<\/percussion_Volume>/g, percussionVol.toString());
    
    globalEditor.setCode(processed);
    globalEditor.evaluate();
    console.log("Text processed and set to editor");
    return processed;
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
    p4Checked, setP4Checked,
    p5Checked, setP5Checked,
    p6Checked, setP6Checked,
    volume, setVolume,
    reverbVol, setReverbVol,
    melodyVol, setMelodyVol,
    percussionVol, setPercussionVol,
    tempo, setTempo,
    setProcessedCode
}) {

    const handleProcessAndPlay = () => {
        if (globalEditor != null) {
            const processed = Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode, p4Checked, p5Checked, p6Checked, reverbVol, melodyVol, percussionVol);
            setProcessedCode(processed);
        }
    };

    const handlePreprocess = () => {
        const processed = Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode, p4Checked, p5Checked, p6Checked, reverbVol, melodyVol, percussionVol);
        setProcessedCode(processed);
    };

    const updateAndPlay = (newP1, newP2, newP3, newP4, newP5, newP6, newVol, newTempo, newReverbVol, newMelodyVol, newPercussionVol) => {
        const processed = Proc(preprocessText, newP2, newP3, newVol, newTempo, newP1, newP4, newP5, newP6, newReverbVol, newMelodyVol, newPercussionVol);
        setProcessedCode(processed);
    };

    const [processedCode, setProcessedCodeLocal] = useState('');

    return (
        <div className="studio-page">
            <div className="studio-header">
                <h1 style={{ color: 'red' }}>🎛️ MUSIC STUDIO</h1>
                <p style = {{color: 'white' }}>Real-time music control and mixing</p>
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
                                                updateAndPlay('ON', p2Checked, p3Checked, p4Checked, p5Checked, p6Checked, volume, tempo, reverbVol, melodyVol, percussionVol);
                                            }}
                                        >
                                            🔊 ON
                                        </button>
                                        <button 
                                            className={`toggle-btn ${p1Mode === 'HUSH' ? 'toggle-active' : ''}`}
                                            onClick={() => {
                                                setP1Mode('HUSH');
                                                updateAndPlay('HUSH', p2Checked, p3Checked, p4Checked, p5Checked, p6Checked, volume, tempo, reverbVol, melodyVol, percussionVol);
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
                                                updateAndPlay(p1Mode, e.target.checked, p3Checked, p4Checked, p5Checked, p6Checked, volume, tempo, reverbVol, melodyVol, percussionVol);
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
                                                updateAndPlay(p1Mode, p2Checked, e.target.checked, p4Checked, p5Checked, p6Checked, volume, tempo, reverbVol, melodyVol, percussionVol);
                                            }}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Reverb Channel */}
                            <div className="mixer-channel">
                                <div className="channel-header">
                                    <div className="channel-info">
                                        <span className="channel-icon">🌊</span>
                                        <span className="channel-name">REVERB</span>
                                    </div>
                                    <div className={`channel-status ${p4Checked ? 'status-active' : 'status-muted'}`}>
                                        {p4Checked ? 'ACTIVE' : 'MUTED'}
                                    </div>
                                </div>
                                <div className="channel-controls">
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            checked={p4Checked}
                                            onChange={(e) => {
                                                setP4Checked(e.target.checked);
                                                updateAndPlay(p1Mode, p2Checked, p3Checked, e.target.checked, p5Checked, p6Checked, volume, tempo, reverbVol, melodyVol, percussionVol);
                                            }}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <div className="volume-control">
                                        <input 
                                            type="range" 
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={reverbVol}
                                            onChange={(e) => {
                                                setReverbVol(parseFloat(e.target.value));
                                                updateAndPlay(p1Mode, p2Checked, p3Checked, p4Checked, p5Checked, p6Checked, volume, tempo, parseFloat(e.target.value), melodyVol, percussionVol);
                                            }}
                                            className="volume-slider-small"
                                        />
                                        <span className="volume-value">{reverbVol.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Melody Channel */}
                            <div className="mixer-channel">
                                <div className="channel-header">
                                    <div className="channel-info">
                                        <span className="channel-icon">🎼</span>
                                        <span className="channel-name">MELODY</span>
                                    </div>
                                    <div className={`channel-status ${p5Checked ? 'status-active' : 'status-muted'}`}>
                                        {p5Checked ? 'ACTIVE' : 'MUTED'}
                                    </div>
                                </div>
                                <div className="channel-controls">
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            checked={p5Checked}
                                            onChange={(e) => {
                                                setP5Checked(e.target.checked);
                                                updateAndPlay(p1Mode, p2Checked, p3Checked, p4Checked, e.target.checked, p6Checked, volume, tempo, reverbVol, melodyVol, percussionVol);
                                            }}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <div className="volume-control">
                                        <input 
                                            type="range" 
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={melodyVol}
                                            onChange={(e) => {
                                                setMelodyVol(parseFloat(e.target.value));
                                                updateAndPlay(p1Mode, p2Checked, p3Checked, p4Checked, p5Checked, p6Checked, volume, tempo, reverbVol, parseFloat(e.target.value), percussionVol);
                                            }}
                                            className="volume-slider-small"
                                        />
                                        <span className="volume-value">{melodyVol.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Percussion Channel */}
                            <div className="mixer-channel">
                                <div className="channel-header">
                                    <div className="channel-info">
                                        <span className="channel-icon">🥊</span>
                                        <span className="channel-name">PERCUSSION</span>
                                    </div>
                                    <div className={`channel-status ${p6Checked ? 'status-active' : 'status-muted'}`}>
                                        {p6Checked ? 'ACTIVE' : 'MUTED'}
                                    </div>
                                </div>
                                <div className="channel-controls">
                                    <label className="switch">
                                        <input 
                                            type="checkbox"
                                            checked={p6Checked}
                                            onChange={(e) => {
                                                setP6Checked(e.target.checked);
                                                updateAndPlay(p1Mode, p2Checked, p3Checked, p4Checked, p5Checked, e.target.checked, volume, tempo, reverbVol, melodyVol, percussionVol);
                                            }}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                    <div className="volume-control">
                                        <input 
                                            type="range" 
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={percussionVol}
                                            onChange={(e) => {
                                                setPercussionVol(parseFloat(e.target.value));
                                                updateAndPlay(p1Mode, p2Checked, p3Checked, p4Checked, p5Checked, p6Checked, volume, tempo, reverbVol, melodyVol, parseFloat(e.target.value));
                                            }}
                                            className="volume-slider-small"
                                        />
                                        <span className="volume-value">{percussionVol.toFixed(1)}</span>
                                    </div>
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
                                updateAndPlay(p1Mode, checked, p3Checked, p4Checked, p5Checked, p6Checked, volume, tempo, reverbVol, melodyVol, percussionVol);
                            }}
                            p3Checked={p3Checked}
                            onP3Change={(checked) => {
                                setP3Checked(checked);
                                updateAndPlay(p1Mode, p2Checked, checked, p4Checked, p5Checked, p6Checked, volume, tempo, reverbVol, melodyVol, percussionVol);
                            }}
                            volume={volume}
                            onVolumeChange={(newVolume) => {
                                setVolume(newVolume);
                                updateAndPlay(p1Mode, p2Checked, p3Checked, p4Checked, p5Checked, p6Checked, newVolume, tempo, reverbVol, melodyVol, percussionVol);
                            }}
                            tempo={tempo}
                            onTempoChange={(newTempo) => {
                                setTempo(newTempo);
                                updateAndPlay(p1Mode, p2Checked, p3Checked, p4Checked, p5Checked, p6Checked, volume, newTempo, reverbVol, melodyVol, percussionVol);
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
    p4Checked, setP4Checked,
    p5Checked, setP5Checked,
    p6Checked, setP6Checked,
    volume, setVolume,
    reverbVol, setReverbVol,
    melodyVol, setMelodyVol,
    percussionVol, setPercussionVol,
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
                                        Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode, p4Checked, p5Checked, p6Checked, reverbVol, melodyVol, percussionVol);
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
                            <label>🌊 Reverb</label>
                            <label className="switch small">
                                <input 
                                    type="checkbox"
                                    checked={p4Checked}
                                    onChange={(e) => setP4Checked(e.target.checked)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="control-group">
                            <label>🎼 Melody</label>
                            <label className="switch small">
                                <input 
                                    type="checkbox"
                                    checked={p5Checked}
                                    onChange={(e) => setP5Checked(e.target.checked)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="control-group">
                            <label>🥊 Percussion</label>
                            <label className="switch small">
                                <input 
                                    type="checkbox"
                                    checked={p6Checked}
                                    onChange={(e) => setP6Checked(e.target.checked)}
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
                                    Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode, p4Checked, p5Checked, p6Checked, reverbVol, melodyVol, percussionVol);
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
    const [p4Checked, setP4Checked] = useState(true);
    const [p5Checked, setP5Checked] = useState(true);
    const [p6Checked, setP6Checked] = useState(true);
    const [volume, setVolume] = useState(2);
    const [reverbVol, setReverbVol] = useState(0.3);
    const [melodyVol, setMelodyVol] = useState(1);
    const [percussionVol, setPercussionVol] = useState(0.5);
    const [tempo, setTempo] = useState(140);
    const [processedCode, setProcessedCode] = useState('');

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
                    let processed = stranger_tune.replaceAll('<p1_Radio>', '');
                    processed = processed.replaceAll('<p2_Checkbox>', '');
                    processed = processed.replaceAll('<p3_Checkbox>', '');
                    processed = processed.replaceAll('<p4_Checkbox>', '');
                    processed = processed.replaceAll('<p5_Checkbox>', '');
                    processed = processed.replaceAll('<p6_Checkbox>', '');
                    processed = processed.replace(/<volume_Slider>([^<]*)<\/volume_Slider>/g, '2');
                    processed = processed.replace(/<tempo_Number>([^<]*)<\/tempo_Number>/g, '140');
                    processed = processed.replace(/<reverb_Volume>([^<]*)<\/reverb_Volume>/g, '0.3');
                    processed = processed.replace(/<melody_Volume>([^<]*)<\/melody_Volume>/g, '1');
                    processed = processed.replace(/<percussion_Volume>([^<]*)<\/percussion_Volume>/g, '0.5');
                    globalEditor.setCode(processed);
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
                        p4Checked={p4Checked}
                        setP4Checked={setP4Checked}
                        p5Checked={p5Checked}
                        setP5Checked={setP5Checked}
                        p6Checked={p6Checked}
                        setP6Checked={setP6Checked}
                        volume={volume}
                        setVolume={setVolume}
                        reverbVol={reverbVol}
                        setReverbVol={setReverbVol}
                        melodyVol={melodyVol}
                        setMelodyVol={setMelodyVol}
                        percussionVol={percussionVol}
                        setPercussionVol={setPercussionVol}
                        tempo={tempo}
                        setTempo={setTempo}
                        setProcessedCode={setProcessedCode}
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
                        p4Checked={p4Checked}
                        setP4Checked={setP4Checked}
                        p5Checked={p5Checked}
                        setP5Checked={setP5Checked}
                        p6Checked={p6Checked}
                        setP6Checked={setP6Checked}
                        volume={volume}
                        setVolume={setVolume}
                        reverbVol={reverbVol}
                        setReverbVol={setReverbVol}
                        melodyVol={melodyVol}
                        setMelodyVol={setMelodyVol}
                        percussionVol={percussionVol}
                        setPercussionVol={setPercussionVol}
                        tempo={tempo}
                        setTempo={setTempo}
                    />
                )}
            </main>
            
            <canvas id="roll"></canvas>
        </div>
    );
}