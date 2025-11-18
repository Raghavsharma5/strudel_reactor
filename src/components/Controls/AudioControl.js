import React from 'react';

function AudioControls({ onPlay, onStop, onPreprocess, onProcessPlay, onSave, onLoad }) {
    return (
        <div className="audio-controls">
            <div className="d-grid gap-2">
                <button 
                    id="process_play" 
                    className="btn btn-outline-primary glow-effect"
                    onClick={onProcessPlay}
                >
                    ⚡ Process & Play
                </button>
                
                <div className="btn-group w-100" role="group">
                    <button 
                        id="play" 
                        className="btn btn-outline-primary"
                        onClick={onPlay}
                    >
                        ▶️ Play
                    </button>
                    <button 
                        id="stop" 
                        className="btn btn-outline-primary"
                        onClick={onStop}
                    >
                        ⏹️ Stop
                    </button>
                </div>
                
                <button 
                    id="process" 
                    className="btn btn-outline-primary"
                    onClick={onPreprocess}
                >
                    🔄 Preprocess Only
                </button>

                
                <div className="btn-group w-100 mt-2" role="group">
                    <button 
                        className="btn btn-outline-primary"
                        onClick={onSave}
                    >
                        💾 Save Settings
                    </button>
                    <label className="btn btn-outline-primary" style={{margin: 0, cursor: 'pointer'}}>
                        📂 Load Settings
                        <input 
                            type="file" 
                            accept=".json"
                            onChange={onLoad}
                            style={{display: 'none'}}
                        />
                    </label>
                </div>
            </div>
            
            <div className="mt-3 p-3" style={{ 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px',
                border: '1px solid var(--border)'
            }}>
                <small className="text-muted">
                    💡 Tip: Save your settings to reuse them later!
                </small>
            </div>
        </div>
    );
}

export default AudioControls;