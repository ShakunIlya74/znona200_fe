
export function declinateWord(number: number | undefined, firstForm: string): string {
    if (number === undefined) {
        number = 1; // Default to 1 if number is undefined
    }
    
    const mod10 = number % 10;
    const mod100 = number % 100;
    
    // Determine the word endings based on common Ukrainian patterns
    let forms: [string, string, string];
    
    // Check word ending to determine the correct declination pattern
    if (firstForm.endsWith('ія')) {
        // For words like "презентація", "мінілекція"
        forms = [firstForm, firstForm.slice(0, -1) + 'ї', firstForm.slice(0, -2) + 'ій'];
    } else if (firstForm.endsWith('ар')) {
        // For words like "вебінар"
        forms = [firstForm, firstForm + 'и', firstForm + 'ів'];
    } else if (firstForm.endsWith('т')) {
        // For words like "тест", "конспект"
        forms = [firstForm, firstForm + 'и', firstForm + 'ів'];
    } else if (firstForm.endsWith('ень')) {
        // For words like "учень"
        forms = [firstForm, firstForm.slice(0, -3) + 'ні', firstForm.slice(0, -3) + 'нів'];
    } else {
        // Default pattern
        forms = [firstForm, firstForm + 'и', firstForm + 'ів'];
    }
    
    // Apply grammatical rules
    let word = '';
    if (mod100 >= 11 && mod100 <= 14) {
        word = forms[2];
    } else if (mod10 === 1) {
        word = forms[0];
    } else if (mod10 >= 2 && mod10 <= 4) {
        word = forms[1];
    } else {
        word = forms[2];
    }

    return `${number} ${word}`;
}
