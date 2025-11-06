import './App.css';
import React, { useEffect, useRef, useState } from "react";
import { StrudelMirror } from '@strudel/codemirror';
import { evalScope } from '@strudel/core';
import { drawPianoroll } from '@strudel/draw';
import { initAudioOnFirstClick } from '@strudel/webaudio';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, registerSynthSounds } from '@strudel/webaudio';
import { registerSoundfonts } from '@strudel/soundfonts';
import { stranger_tune } from './tunes';
import console_monkey_patch, { getD3Data } from './console-monkey-patch';
import AudioControls from './AudioControls';
import PreprocessingEditor from './PreprocessingEditor';
import AdvancedControls from './AdvancedControls';

let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

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
    console.log("Volume:", volume, "Tempo:", tempo, "p1Mode:", p1Mode);
    
    // Process p1_Radio using React state instead of DOM
    let processed = proc_text.replaceAll('<p1_Radio>', p1Mode === 'HUSH' ? '//' : '');
    
    // Process p2_Checkbox (Bassline)
    processed = processed.replaceAll('<p2_Checkbox>', p2Checked ? '' : '//');
    
    // Process p3_Checkbox (Drums2)
    processed = processed.replaceAll('<p3_Checkbox>', p3Checked ? '' : '//');
    
    // Process volume_Slider - FIXED: Use non-greedy replacement
    processed = processed.replace(/<volume_Slider>([^<]*)<\/volume_Slider>/g, volume.toString());
    
    // Process tempo_Number - FIXED: Use non-greedy replacement  
    processed = processed.replace(/<tempo_Number>([^<]*)<\/tempo_Number>/g, tempo.toString());
    
    console.log("Processed text:", processed);
    globalEditor.setCode(processed);
    console.log("Text processed and set to editor");
}

export default function StrudelDemo() {
    const hasRun = useRef(false);
    const [preprocessText, setPreprocessText] = useState('');
    const [p1Mode, setP1Mode] = useState('ON'); // 'ON' or 'HUSH'
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
        <div>
            <h2>Strudel Reactor - Live Coding Music Platform</h2>
            <main>
                <div className="container-fluid">
                    <div className="row">
                        <PreprocessingEditor 
                            value={preprocessText}
                            onChange={(e) => setPreprocessText(e.target.value)}
                        />
                        <div className="col-md-4">
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
                                onPreprocess={() => Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode)}
                                onProcessPlay={() => {
                                    if (globalEditor != null) {
                                        Proc(preprocessText, p2Checked, p3Checked, volume, tempo, p1Mode);
                                        globalEditor.evaluate();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-8" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <div id="editor" />
                            <div id="output" />
                        </div>
                        <div className="col-md-4">
                            <h5>Main Controls</h5>
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="flexRadioDefault" 
                                    id="flexRadioDefault1" 
                                    checked={p1Mode === 'ON'}
                                    onChange={() => {
                                        setP1Mode('ON');
                                        ProcAndPlay(preprocessText, p2Checked, p3Checked, volume, tempo, 'ON');
                                    }} 
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault1">
                                    p1: ON (Drums Enabled)
                                </label>
                            </div>
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="flexRadioDefault" 
                                    id="flexRadioDefault2" 
                                    checked={p1Mode === 'HUSH'}
                                    onChange={() => {
                                        setP1Mode('HUSH');
                                        ProcAndPlay(preprocessText, p2Checked, p3Checked, volume, tempo, 'HUSH');
                                    }} 
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault2">
                                    p1: HUSH (Drums Muted)
                                </label>
                            </div>
                            
                            <AdvancedControls 
                                p2Checked={p2Checked}
                                onP2Change={(checked) => {
                                    setP2Checked(checked);
                                    ProcAndPlay(preprocessText, checked, p3Checked, volume, tempo, p1Mode);
                                }}
                                p3Checked={p3Checked}
                                onP3Change={(checked) => {
                                    setP3Checked(checked);
                                    ProcAndPlay(preprocessText, p2Checked, checked, volume, tempo, p1Mode);
                                }}
                                volume={volume}
                                onVolumeChange={(newVolume) => {
                                    setVolume(newVolume);
                                    ProcAndPlay(preprocessText, p2Checked, p3Checked, newVolume, tempo, p1Mode);
                                }}
                                tempo={tempo}
                                onTempoChange={(newTempo) => {
                                    setTempo(newTempo);
                                    ProcAndPlay(preprocessText, p2Checked, p3Checked, volume, newTempo, p1Mode);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <canvas id="roll"></canvas>
            </main>
        </div>
    );
}