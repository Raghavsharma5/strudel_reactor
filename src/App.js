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

let globalEditor = null;

const handleD3Data = (event) => {
    console.log(event.detail);
};

export function ProcAndPlay(proc_text) {
    if (!proc_text) {
        console.log("No text to process yet");
        return;
    }
    
    if (globalEditor != null) {
        Proc(proc_text);  // Always preprocess
        
        // Only restart music if it's already playing
        if (globalEditor.repl.state.started == true) {
            globalEditor.evaluate();
        }
    }
}

export function Proc(proc_text) {
    // Safety checks
    if (!proc_text || !globalEditor) {
        console.log("Proc: text or editor not ready");
        return;
    }

    console.log("Processing text...");
    let proc_text_replaced = proc_text.replaceAll('<p1_Radio>', ProcessText);
    globalEditor.setCode(proc_text_replaced);
    console.log("Text processed and set to editor");
}

export function ProcessText(match, ...args) {
    let replace = "";
    if (document.getElementById('flexRadioDefault2').checked) {
        replace = "//";
        console.log("HUSH mode - returning underscore");
    } else {
        console.log("ON mode - returning empty string");
    }
    return replace;
}

export default function StrudelDemo() {

    const hasRun = useRef(false);
    const [preprocessText, setPreprocessText] = useState('');

    useEffect(() => {
        if (!hasRun.current) {
            document.addEventListener("d3Data", handleD3Data);
            console_monkey_patch();
            hasRun.current = true;
            
            const canvas = document.getElementById('roll');
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
            const drawContext = canvas.getContext('2d');
            const drawTime = [-2, 2]; // time window of drawn haps
            
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
            
            // Set initial text and process it
            setTimeout(() => {
                setPreprocessText(stranger_tune);
                if (globalEditor) {
                    Proc(stranger_tune);
                }
            }, 100);
        }
    }, []);

    return (
        <div>
            <h2>Strudel Demo</h2>
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
                                onPreprocess={() => Proc(preprocessText)}
                                onProcessPlay={() => {
                                    if (globalEditor != null) {
                                        Proc(preprocessText);
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
                            <h5>Controls</h5>
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="flexRadioDefault" 
                                    id="flexRadioDefault1" 
                                    onChange={() => {
                                        console.log("ON selected");
                                        ProcAndPlay(preprocessText);
                                    }} 
                                    defaultChecked 
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault1">
                                    p1: ON
                                </label>
                            </div>
                            <div className="form-check">
                                <input 
                                    className="form-check-input" 
                                    type="radio" 
                                    name="flexRadioDefault" 
                                    id="flexRadioDefault2" 
                                    onChange={() => {
                                        console.log("HUSH selected");
                                        ProcAndPlay(preprocessText);
                                    }} 
                                />
                                <label className="form-check-label" htmlFor="flexRadioDefault2">
                                    p1: HUSH
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <canvas id="roll"></canvas>
            </main>
        </div>
    );
}