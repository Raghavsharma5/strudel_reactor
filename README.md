# Strudel React

**Strudel React** is a browser-based music composition and visualization tool built with React and [Strudel](https://strudel.live/) (a live-coding music framework). It allows users to create, modify, and play musical patterns interactively with real-time control over parameters such as BPM, instrument effects, and mute/hush certain elements of the composition.

This project combines a **REPL editor, visualizations, dynamic controls, and preset management**, giving a TidalCycles/Strudel-like live coding experience directly in the browser.

---

## Features

- **Live Coding Editor (REPL)**: Write Strudel-compatible code and see the effects immediately.
- **Preset Management**:
  - Save, load as json files.
  - Overwrite existing presets by name.
  - stored locally in `localStorage`.
- **Dynamic Controls**: Adjust sliders, numeric inputs (BPM), or other controls such as (drum kits, melody, base etc.) derived from the code to modify music parameters in real-time.
- **BPM Adjustment**: Set the tempo with a numeric input, automatically applied to all code.
- **Hush (Mute) Controls**: Tag code elements with `<pN>` and mute/unmute them on the fly with a Bootstrap switch.
- **Graph/Visualization**: View the moving graph other visual representations of your composition.
- **Safe Playback**:
  - Prevents playback if the code is empty.
  - Requires code to be preprocessed before evaluation.

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/strudel-react.git
cd strudel-react
```
2. Install Dependencies
```bash
npm install
```

3. Start development server
```bash
npm start
```

4. Open your browser and navigate to:
```bash
http://localhost:3000 (or different port if needed)
```

## Usage

```A usage guide is available on the website for easy access.```  
Below is another list of navigation basics for convinience:

1. **Writing Music:**  
Type Strudel-compatible code in the Preprocess panel.  
Use <pN> tags to mark elements you might want to mute/hush later.

2. **Hush Controls:**  
Toggle switches to mute/unmute elements.  
Changes are applied live to the processed code.

3. **Controls & Sliders:**  
Adjust dynamic parameters derived from the code using the sliders or numeric inputs, for some elements you can change the volume per element and also mute.  
Changes update the music immediately.

4. **Presets:**  
Save your work as a json.
You can also load exisiting json files. 
Built-in presets are included from tunes.json.

6. **Playback:**  
Use the Play, Stop, or Proc & Play buttons.  
Music cannot play unless code is present and processed.

### Website Demonstration Link
Here is the link to the website demonstration:
https://youtu.be/2gW9Vc8VNP8
