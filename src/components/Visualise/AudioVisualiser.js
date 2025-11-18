import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function AudioVisualizer({ isPlaying }) {
    const waveformRef = useRef(null);
    const meterRef = useRef(null);
    const spectrumRef = useRef(null);
    const [stats, setStats] = useState({
        avgLevel: 0,
        peakLevel: 0,
        bassLevel: 0,
        midLevel: 0,
        trebleLevel: 0
    });
    const animationRef = useRef(null);

    useEffect(() => {
        // Stop animation and reset when not playing
        if (!isPlaying) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            
            // Reset all stats to zero
            setStats({
                avgLevel: 0,
                peakLevel: 0,
                bassLevel: 0,
                midLevel: 0,
                trebleLevel: 0
            });
            
            // Draw empty visualizations
            const emptyData = new Array(128).fill(0);
            drawWaveform(emptyData);
            drawMeter(emptyData, 0, 0);
            drawSpectrum(emptyData);
            
            return;
        }

        // Start animation when playing
        let time = 0;

        const animate = () => {
            time += 0.08;
            
            // Generate realistic music data
            const data = generateMusicData(time);
            
            // Calculate real-time stats
            const avgLevel = d3.mean(data) || 0;
            const peakLevel = d3.max(data) || 0;
            
            const third = Math.floor(data.length / 3);
            const bassLevel = d3.mean(data.slice(0, third)) || 0;
            const midLevel = d3.mean(data.slice(third, third * 2)) || 0;
            const trebleLevel = d3.mean(data.slice(third * 2)) || 0;
            
            setStats({
                avgLevel,
                peakLevel,
                bassLevel,
                midLevel,
                trebleLevel
            });
            
            // Draw all visualizations
            drawWaveform(data);
            drawMeter(data, avgLevel, peakLevel);
            drawSpectrum(data);
            
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying]);

    const generateMusicData = (time) => {
        const data = [];
        const length = 128;
        
        // Simulate musical timing in 4/4 time
        const beatTime = time % 2;
        const beat = Math.floor(beatTime * 4);
        
        for (let i = 0; i < length; i++) {
            const freq = i / length;
            
            // Bass drum on beats 1 and 3
            const kickPattern = (beat === 0 || beat === 2) ? 1.8 : 0.6;
            const kickDecay = Math.max(0, 1 - (beatTime % 0.5) * 4);
            const bassComponent = Math.exp(-freq * 5) * 
                                 (Math.sin(time * 2 + i * 0.05) * 0.4 + 0.3) * 
                                 kickPattern * kickDecay;
            
            // Snare on beats 2 and 4
            const snarePattern = (beat === 1 || beat === 3) ? 1.5 : 0.5;
            const snareDecay = Math.max(0, 1 - ((beatTime - 0.25) % 0.5) * 6);
            const midComponent = Math.exp(-Math.abs(freq - 0.4) * 3) * 
                                (Math.sin(time * 3 + freq * 10) * 0.3 + 0.2) * 
                                snarePattern * snareDecay;
            
            // Hi-hat on eighth notes
            const hihatOn = (beatTime % 0.25) < 0.1;
            const hihatComponent = freq * freq * 
                                  (hihatOn ? 0.7 : 0.2) * 
                                  Math.sin(time * 8 + i * 1.2) * 0.3;
            
            // Melodic component
            const melodyWave = Math.sin(time * 0.8 + freq * 6) * 0.25;
            
            // Add some randomness for texture
            const noise = (Math.random() - 0.5) * 0.12;
            
            const value = Math.max(0, Math.min(1, 
                bassComponent + midComponent + hihatComponent + melodyWave + noise + 0.15
            ));
            
            data.push(value);
        }
        
        return data;
    };

    const drawWaveform = (data) => {
        const svg = d3.select(waveformRef.current);
        svg.selectAll("*").remove();

        const width = 700;
        const height = 200;
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };

        svg.attr("width", width).attr("height", height);

        const displayData = data.slice(0, 60);

        const xScale = d3.scaleLinear()
            .domain([0, displayData.length - 1])
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([height - margin.bottom, margin.top]);

        // Draw axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).ticks(10))
            .style("color", "#00d4ff")
            .style("font-size", "12px");

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${(d * 100).toFixed(0)}%`))
            .style("color", "#00d4ff")
            .style("font-size", "12px");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .attr("text-anchor", "middle")
            .attr("fill", "#8888cc")
            .attr("font-size", "13px")
            .text("Frequency Bin");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .attr("fill", "#8888cc")
            .attr("font-size", "13px")
            .text("Amplitude");

        const hasData = displayData.some(d => d > 0.01);
        
        if (hasData) {
            // Create gradient
            const gradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "wave-grad")
                .attr("x1", "0%")
                .attr("x2", "100%");

            gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#00d4ff");

            gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "#00ff88");

            const line = d3.line()
                .x((d, i) => xScale(i))
                .y(d => yScale(d))
                .curve(d3.curveBasis);

            const area = d3.area()
                .x((d, i) => xScale(i))
                .y0(height - margin.bottom)
                .y1(d => yScale(d))
                .curve(d3.curveBasis);

            // Draw area fill
            svg.append("path")
                .datum(displayData)
                .attr("fill", "url(#wave-grad)")
                .attr("opacity", 0.2)
                .attr("d", area);

            // Draw glow effect
            svg.append("path")
                .datum(displayData)
                .attr("fill", "none")
                .attr("stroke", "url(#wave-grad)")
                .attr("stroke-width", 4)
                .attr("opacity", 0.3)
                .attr("filter", "blur(3px)")
                .attr("d", line);

            // Draw main line
            svg.append("path")
                .datum(displayData)
                .attr("fill", "none")
                .attr("stroke", "url(#wave-grad)")
                .attr("stroke-width", 2.5)
                .attr("d", line);
        }
    };

    const drawMeter = (data, avgLevel, maxLevel) => {
        const svg = d3.select(meterRef.current);
        svg.selectAll("*").remove();

        const width = 700;
        const height = 150;

        svg.attr("width", width).attr("height", height);

        const barWidth = 15;
        const barSpacing = 3;
        const numBars = 40;
        const startX = 50;
        
        // Draw VU meter bars
        for (let i = 0; i < numBars; i++) {
            const threshold = i / numBars;
            const isLit = avgLevel >= threshold;
            
            let color;
            if (i < numBars * 0.7) {
                color = "#00ff88";
            } else if (i < numBars * 0.85) {
                color = "#ffaa00";
            } else {
                color = "#ff4444";
            }
            
            const barHeight = 80;
            const x = startX + i * (barWidth + barSpacing);
            const y = height - barHeight - 40;
            
            svg.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", barWidth)
                .attr("height", barHeight)
                .attr("fill", isLit ? color : "rgba(255, 255, 255, 0.05)")
                .attr("opacity", isLit ? 0.9 : 1)
                .attr("rx", 3);
        }

        // Draw level text
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("fill", "#00d4ff")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text(`AVG: ${(avgLevel * 100).toFixed(1)}% | PEAK: ${(maxLevel * 100).toFixed(1)}%`);

        // Draw frequency breakdown
        const bassLevel = d3.mean(data.slice(0, data.length / 3)) || 0;
        const midLevel = d3.mean(data.slice(data.length / 3, 2 * data.length / 3)) || 0;
        const trebleLevel = d3.mean(data.slice(2 * data.length / 3)) || 0;

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "#8888cc")
            .attr("font-size", "12px")
            .text(`🔊 BASS: ${(bassLevel * 100).toFixed(0)}% | MID: ${(midLevel * 100).toFixed(0)}% | TREBLE: ${(trebleLevel * 100).toFixed(0)}%`);
    };

    const drawSpectrum = (data) => {
        const svg = d3.select(spectrumRef.current);
        svg.selectAll("*").remove();

        const width = 700;
        const height = 180;
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };

        svg.attr("width", width).attr("height", height);

        const xScale = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([margin.left, width - margin.right]);

        const barWidth = Math.max(1, (width - margin.left - margin.right) / data.length - 1);

        const hasData = data.some(d => d > 0.01);

        if (hasData) {
            // Draw spectrum bars
            data.forEach((d, i) => {
                const barHeight = (height - margin.bottom - margin.top) * d;
                const x = xScale(i);
                const y = height - margin.bottom - barHeight;

                // Color based on frequency range
                let color;
                if (i < data.length * 0.3) {
                    color = "#ff4444"; // Bass - red
                } else if (i < data.length * 0.7) {
                    color = "#ffaa00"; // Mid - orange
                } else {
                    color = "#00ff88"; // Treble - green
                }

                svg.append("rect")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("width", barWidth)
                    .attr("height", Math.max(1, barHeight))
                    .attr("fill", color)
                    .attr("opacity", 0.8);
            });
        }

        // Draw x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).ticks(10))
            .style("color", "#00d4ff")
            .style("font-size", "11px");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .attr("text-anchor", "middle")
            .attr("fill", "#8888cc")
            .attr("font-size", "12px")
            .text("Frequency Range");
    };

    return (
        <div className="visualizer-content-enhanced">
            <div className="visualizer-status">
                <div className={`status-indicator ${isPlaying ? 'status-active' : 'status-inactive'}`}>
                    {isPlaying ? '🎵 ACTIVE' : '💤 INACTIVE'}
                </div>
            </div>

            <div className="visualizer-grid">
                <div className="visualizer-section-large">
                    <h3>🌊 FREQUENCY SPECTRUM</h3>
                    <svg ref={waveformRef} className="waveform-svg-large"></svg>
                </div>

                <div className="visualizer-section-large">
                    <h3>📊 VU METER</h3>
                    <svg ref={meterRef} className="meter-svg-large"></svg>
                </div>

                <div className="visualizer-section-large">
                    <h3>📈 SPECTRUM ANALYZER</h3>
                    <svg ref={spectrumRef} className="spectrum-svg-large"></svg>
                </div>

                <div className="stats-panel">
                    <h3>📉 REAL-TIME STATS</h3>
                    <div className="stat-row">
                        <span className="stat-label">Average Level:</span>
                        <span className="stat-value">{(stats.avgLevel * 100).toFixed(1)}%</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">Peak Level:</span>
                        <span className="stat-value peak">{(stats.peakLevel * 100).toFixed(1)}%</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">🔴 Bass:</span>
                        <span className="stat-value">{(stats.bassLevel * 100).toFixed(0)}%</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">🟡 Mid:</span>
                        <span className="stat-value">{(stats.midLevel * 100).toFixed(0)}%</span>
                    </div>
                    <div className="stat-row">
                        <span className="stat-label">🟢 Treble:</span>
                        <span className="stat-value">{(stats.trebleLevel * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AudioVisualizer;