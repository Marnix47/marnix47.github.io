// script.js
let isEncryptMode = true;

function updateAlphabets() {
    const shift = parseInt(document.getElementById('shift').value);
    const original = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let shifted = '';
    
    // Create shifted alphabet
    for (let i = 0; i < 26; i++) {
        const charCode = original.charCodeAt(i);
        let newCharCode = charCode + shift;
        // Handle wrapping around the alphabet
        if (newCharCode > 'Z'.charCodeAt(0)) {
            newCharCode -= 26;
        } else if (newCharCode < 'A'.charCodeAt(0)) {
            newCharCode += 26;
        }
        shifted += String.fromCharCode(newCharCode);
    }
    
    document.getElementById('shifted-alphabet').textContent = 
        `Shifted Alphabet: ${shifted}`;
}

function processText(text, shift) {
    let result = '';
    
    // Adjust shift for decryption mode
    const actualShift = isEncryptMode ? shift : -shift;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char.match(/[a-zA-Z]/)) {
            const base = char.toUpperCase() === char ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            let newCharCode = char.charCodeAt(0) + actualShift;
            
            // Handle wrapping around the alphabet
            if (newCharCode > base + 25) {
                newCharCode -= 26;
            } else if (newCharCode < base) {
                newCharCode += 26;
            }
            
            result += String.fromCharCode(newCharCode);
        } else {
            result += char;
        }
    }
    
    return result;
}

function updateOutput() {
    const inputText = document.getElementById('input-text').value;
    const shift = parseInt(document.getElementById('shift').value);
    
    const result = processText(inputText, shift);
    document.getElementById('output-text').value = result;
}

function toggleMode() {
    isEncryptMode = !isEncryptMode;
    const button = document.querySelector('.controls button');
    button.textContent = isEncryptMode ? 'Switch to Decrypt Mode' : 'Switch to Encrypt Mode';
    updateOutput();
}

// Add event listeners
document.getElementById('input-text').addEventListener('input', updateOutput);
document.getElementById('shift').addEventListener('change', () => {
    updateOutput();
    updateAlphabets();
});

// Initial setup
updateAlphabets();