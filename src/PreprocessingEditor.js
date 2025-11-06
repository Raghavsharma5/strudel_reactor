import React from 'react';

function PreprocessingEditor({ value, onChange }) {
    return (
        <div className="preprocessing-editor">
            <label htmlFor="proc" className="form-label">
                📝 Live Code Editor - Edit your Strudel code below:
            </label>
            <textarea 
                className="form-control" 
                rows="15" 
                id="proc"
                value={value}
                onChange={onChange}
                style={{
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '14px',
                    lineHeight: '1.4'
                }}
                placeholder="Enter your Strudel code here... Use tags like <p1_Radio>, <p2_Checkbox>, etc."
            />
            <div className="mt-2">
                <small className="text-muted">
                    🔧 Tags: <code>&lt;p1_Radio&gt;</code> <code>&lt;p2_Checkbox&gt;</code> <code>&lt;volume_Slider&gt;</code> <code>&lt;tempo_Number&gt;</code>
                </small>
            </div>
        </div>
    );
}

export default PreprocessingEditor;