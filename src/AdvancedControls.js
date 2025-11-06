import React from 'react';

function AdvancedControls({ 
    p2Checked, 
    onP2Change, 
    p3Checked, 
    onP3Change,
    volume,
    onVolumeChange,
    tempo,
    onTempoChange
}) {
    return (
        <div className="advanced-controls mt-4">
            <h5>Advanced Controls</h5>
            
            {/* Checkbox for p2 - Bassline */}
            <div className="form-check mb-3">
                <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="p2_checkbox"
                    checked={p2Checked}
                    onChange={(e) => onP2Change(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="p2_checkbox">
                    p2: Enable Bassline
                </label>
            </div>

            {/* Checkbox for p3 - Drums2 */}
            <div className="form-check mb-3">
                <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="p3_checkbox"
                    checked={p3Checked}
                    onChange={(e) => onP3Change(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="p3_checkbox">
                    p3: Enable Drums2 (Hi-hats)
                </label>
            </div>

            {/* Range Slider for Volume */}
            <div className="mb-3">
                <label htmlFor="volume_slider" className="form-label">
                    Volume: {volume}
                </label>
                <input 
                    type="range" 
                    className="form-range" 
                    id="volume_slider"
                    min="0"
                    max="5"
                    step="0.5"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                />
            </div>

            {/* Number Input for Tempo */}
            <div className="mb-3">
                <label htmlFor="tempo_input" className="form-label">
                    Tempo (BPM)
                </label>
                <input 
                    type="number" 
                    className="form-control" 
                    id="tempo_input"
                    min="60"
                    max="200"
                    value={tempo}
                    onChange={(e) => onTempoChange(parseInt(e.target.value) || 140)}
                />
            </div>
        </div>
    );
}

export default AdvancedControls;