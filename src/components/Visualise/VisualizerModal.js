import React from 'react';
import AudioVisualizer from './AudioVisualiser';
import './VisualizerModal.css';

function VisualizerModal({ isOpen, onClose, isPlaying }) {
    if (!isOpen) return null;

    return (
        <div className="visualizer-modal-overlay" onClick={onClose}>
            <div className="visualizer-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="visualizer-modal-header">
                    <h2>📊 AUDIO VISUALIZER</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>
                
                <div className="visualizer-modal-body">
                    <AudioVisualizer isPlaying={isPlaying} />
                </div>
                
                <div className="visualizer-modal-footer">
                    <button className="modal-action-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VisualizerModal;