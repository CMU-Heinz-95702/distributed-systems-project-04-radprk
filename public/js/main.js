document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById('user-input');
    const findWisdomButton = document.getElementById('find-wisdom');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('result-section');
    const verseReference = document.getElementById('verse-reference');
    const verseText = document.getElementById('verse-text');
    const verseMeaning = document.getElementById('verse-meaning');
    const verseExplanation = document.getElementById('verse-explanation');
    const modelExplanation = document.getElementById('model-explanation');
    
    // New elements for enhanced features
    const identifiedThemes = document.getElementById('identified-themes');
    const practicalApplication = document.getElementById('practical-application');
   
    findWisdomButton.addEventListener('click', async function() {
        const query = userInput.value.trim();
       
        if (!query) {
            alert('Please share your situation or question first.');
            return;
        }
       
        // Show loader
        loader.style.display = 'block';
        resultSection.style.display = 'none';
       
        try {
            // Call API
            const response = await fetch('/api/find-wisdom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });
           
            if (!response.ok) {
                throw new Error('Failed to get a response');
            }
           
            const result = await response.json();
           
            // Update UI with basic result
            verseReference.textContent = `Chapter ${result.chapter}, Verse ${result.verse}`;
            verseText.textContent = result.text;
            verseMeaning.textContent = result.meaning;
            verseExplanation.textContent = result.explanation;
            
            // Enhanced features - Display themes if available
            if (result.themes && result.themes.length > 0) {
                // Clear previous themes
                identifiedThemes.innerHTML = '';
                
                // Add each theme as a list item
                result.themes.forEach(theme => {
                    const li = document.createElement('li');
                    li.textContent = formatThemeName(theme);
                    identifiedThemes.appendChild(li);
                });
                
                // Generate practical application based on primary theme
                const primaryTheme = result.themes[0];
                practicalApplication.textContent = generatePracticalAdvice(primaryTheme);
                
                // Enhanced model explanation
                modelExplanation.textContent = 
                    `This recommendation was made by analyzing your query and identifying themes related to ${formatThemesList(result.themes)}. The system then matched these themes to relevant verses from the Bhagavad Gita that address your situation.`;
            } else {
                // Default content if no themes are available
                identifiedThemes.innerHTML = '<li>General wisdom</li>';
                practicalApplication.textContent = generatePracticalAdvice();
                modelExplanation.textContent = 'The recommendation process was based on analyzing your input using natural language processing techniques to identify key themes and selecting a relevant verse from the Bhagavad Gita.';
            }
           
            // Show result section
            resultSection.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while finding wisdom. Please try again.');
        } finally {
            // Hide loader
            loader.style.display = 'none';
        }
    });
    
    // Helper function to format theme names (e.g., 'self_realization' → 'Self-Realization')
    function formatThemeName(theme) {
        return theme
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('-');
    }

    // Helper function to format a list of themes
    function formatThemesList(themes) {
        if (!themes || themes.length === 0) return 'general wisdom';
        
        const formattedThemes = themes.map(formatThemeName);
        
        if (formattedThemes.length === 1) return formattedThemes[0];
        if (formattedThemes.length === 2) return `${formattedThemes[0]} and ${formattedThemes[1]}`;
        
        const lastTheme = formattedThemes.pop();
        return `${formattedThemes.join(', ')}, and ${lastTheme}`;
    }
    
    // Generate practical advice based on the identified theme
    function generatePracticalAdvice(theme) {
        switch(theme) {
            case 'anxiety':
                return `Consider starting a mindfulness practice to observe your anxious thoughts without attachment. The Gita reminds us that both pleasure and pain are temporary - try to witness your anxiety from this perspective.`;
            case 'anger':
                return `When feeling angry, pause and breathe deeply before reacting. Notice how anger often arises from attachment to specific outcomes, just as the Gita describes.`;
            case 'attachment':
                return `Practice focusing on your actions rather than their results. Try completing a task today with full attention to the process while letting go of expectations about the outcome.`;
            case 'duty':
                return `Reflect on your unique duties and how you can perform them with excellence. What is your dharma in this situation, and how can you fulfill it regardless of external rewards?`;
            case 'peace':
                return `Establish a daily ritual of quiet contemplation. During challenging moments, return to your breath and remember that true peace comes from within, not from external circumstances.`;
            case 'relationships':
                return `Practice seeing the divine essence in others, especially those who challenge you. Consider how you can serve others with a balanced mind, neither expecting reward nor avoiding responsibility.`;
            case 'knowledge':
                return `Approach your situation with humility as a student. Seek wisdom from trusted sources and reflect deeply on how their insights apply to your unique circumstances.`;
            case 'action':
                return `Focus on taking right action with detachment from results. Break down what needs to be done into small, manageable steps and approach each with full attention.`;
            case 'devotion':
                return `Consider how you might dedicate your actions to something greater than yourself. What would it mean to approach your situation with an attitude of offering or service?`;
            case 'meditation':
                return `Establish or deepen a regular meditation practice, even if just for a few minutes daily. Notice how this creates space between your thoughts and your awareness of them.`;
            case 'self_realization':
                return `Take time to reflect on your true nature beyond temporary roles and circumstances. Journal about the question: "Who am I beyond my changing thoughts and feelings?"`;
            case 'suffering':
                return `Remember that while pain may be inevitable, suffering often comes from our resistance to what is. Practice acceptance of your current situation while taking mindful steps toward improvement.`;
            case 'renunciation':
                return `Consider what you might need to let go of - not necessarily physical possessions, but perhaps certain expectations, old stories about yourself, or attachments to specific outcomes.`;
            default:
                return `Reflect on how this verse might apply to your daily life. Consider setting aside a few minutes each day to contemplate its meaning and how you might embody this wisdom.`;
        }
    }
});