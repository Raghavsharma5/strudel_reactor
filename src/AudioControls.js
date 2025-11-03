import React from 'react';

function AudioControls({ onPlay, onStop, onPreprocess, onProcessPlay }) {
    return (
        <div>
            <h5>Audio Controls</h5>
            <button 
                id="process" 
                className="btn btn-outline-primary"
                onClick={onPreprocess}
            >
                Preprocess
            </button>
            <button 
                id="process_play" 
                className="btn btn-outline-primary"
                onClick={onProcessPlay}
            >
                Proc & Play
            </button>
            <br />
            <button 
                id="play" 
                className="btn btn-outline-primary"
                onClick={onPlay}
            >
                Play
            </button>
            <button 
                id="stop" 
                className="btn btn-outline-primary"
                onClick={onStop}
            >
                Stop
            </button>
        </div>
    );
}

export default AudioControls;