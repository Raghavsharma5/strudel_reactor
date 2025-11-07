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
        <div className="advanced-controls">
            <div className="row">
                <div className="col-md-6">
                    {/* Volume Control */}
                    <div className="control-group">
                        <div className="control-label">
                            <label htmlFor="volume_slider" className="form-label">
                                🔊 Master Volume
                            </label>
                            <span className="control-value">{volume}</span>
                        </div>
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
                        <div className="d-flex justify-content-between">
                            <small className="text-muted">0</small>
                            <small className="text-muted">5</small>
                        </div>
                    </div>

                    {/* Tempo Control */}
                    <div className="control-group">
                        <div className="control-label">
                            <label htmlFor="tempo_input" className="form-label">
                                ⚡ Tempo (BPM)
                            </label>
                            <span className="control-value">{tempo}</span>
                        </div>
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
                
                <div className="col-md-6">
                    {/* Instrument Toggles */}
                    <div className="control-group">
                        <h6>🎵 Instrument Toggles</h6>
                        
                        {/* Bassline Toggle */}
                        <div className="form-check form-switch mb-3">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                role="switch"
                                id="p2_checkbox_advanced"
                                checked={p2Checked}
                                onChange={(e) => onP2Change(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="p2_checkbox_advanced">
                                🎸 Bassline {p2Checked ? '✓' : '✗'}
                            </label>
                        </div>

                        {/* Hi-hats Toggle */}
                        <div className="form-check form-switch mb-3">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                role="switch"
                                id="p3_checkbox_advanced"
                                checked={p3Checked}
                                onChange={(e) => onP3Change(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="p3_checkbox_advanced">
                                🥁 Hi-hats {p3Checked ? '✓' : '✗'}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdvancedControls;