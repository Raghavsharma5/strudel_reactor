let originalLog = null;
const logArray = [];
const numericArray = []; // New: store numeric values for D3

export default function console_monkey_patch() {
    // If react multicalls this, do nothing
    if (originalLog) return;

    originalLog = console.log;

    // Overwrite console.log function
    console.log = function (...args) {
        
        if (args.join(" ").substring(0, 8) === "%c[hap] ") {
            // Extract the hap data
            const hapData = args.join(" ").replace("%c[hap] ", "");
            
            // Add to the Array of values
            logArray.push(hapData);

            if (logArray.length > 100) {
                logArray.splice(0, 1);
            }

            // Extract numeric values for D3 visualization
            extractNumericData(hapData);

            // Dispatch a customevent we can listen to in App.js
            const event = new CustomEvent("d3Data", { detail: [...logArray] });
            document.dispatchEvent(event);
        }
        originalLog.apply(console, args);
    };
}

// Function to extract numeric values from hap strings
function extractNumericData(hapString) {
    try {
        // Try to parse as JSON first
        const jsonMatch = hapString.match(/\{[^}]+\}/);
        if (jsonMatch) {
            const obj = JSON.parse(jsonMatch[0]);
            
            // Extract common numeric fields from Strudel haps
            let value = 0;
            
            if (obj.note !== undefined) {
                value = parseFloat(obj.note);
            } else if (obj.freq !== undefined) {
                value = parseFloat(obj.freq);
            } else if (obj.value !== undefined) {
                value = parseFloat(obj.value);
            } else if (obj.velocity !== undefined) {
                value = parseFloat(obj.velocity);
            }
            
            if (!isNaN(value)) {
                numericArray.push(value);
            }
        } else {
            // Try to extract any numbers from the string
            const numbers = hapString.match(/[-+]?[0-9]*\.?[0-9]+/g);
            if (numbers && numbers.length > 0) {
                const value = parseFloat(numbers[0]);
                if (!isNaN(value)) {
                    numericArray.push(value);
                }
            }
        }

        // Keep array size limited
        if (numericArray.length > 100) {
            numericArray.shift();
        }
    } catch (e) {
        // Silently fail if parsing doesn't work
    }
}

export function getD3Data() {
    // Return numeric data if available, otherwise generate from log array
    if (numericArray.length > 0) {
        return [...numericArray];
    }
    
    // Fallback: generate pseudo-random data based on log activity
    return logArray.map((_, i) => Math.sin(i / 10) * 0.5 + 0.5);
}

export function getRawLogData() {
    return [...logArray];
}

export function subscribe(eventName, listener) {
    document.addEventListener(eventName, listener);
}

export function unsubscribe(eventName, listener) {
    document.removeEventListener(eventName, listener);
}