const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');  // Correct import for node-fetch@2
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/check', async (req, res) => {
    const userPrompt = req.body.prompt;
  
    try {
      const response = await fetch('http://localhost:5000/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt })
      });
  
      const result = await response.json();
  
      if (result.label === 'harmless') {
        // Safe prompt - call Hugging Face API
        const hfResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: userPrompt })
        });
  
        // 🛡️ Check status and parse only if response is OK
        if (!hfResponse.ok) {
          throw new Error(`HuggingFace API error: ${hfResponse.statusText}`);
        }
  
        const hfData = await hfResponse.json();
  
        const generatedText = hfData[0]?.generated_text?.split('\n')[0] || "No response generated.";
        res.render('result', { prompt: userPrompt, label: 'Safe', response: generatedText });
  
      } else {
        // Unsafe prompt
        res.render('result', {
          prompt: userPrompt,
          label: 'Unsafe',
          response: "This prompt is unsafe. Please modify it to be safe."
        });
      }
  
    } catch (error) {
      console.error("Error in /check route:", error.message);
      res.status(500).render('result', {
        prompt: userPrompt,
        label: 'Error',
        response: "Internal server error or invalid response from API."
      });
    }
  });

// Function to simulate getting context for a prompt (replace with real logic)
async function getContextFromExternalSource(prompt) {
  // Here, you can implement logic to fetch context from Wikipedia, an API, or a database
  // For now, returning a placeholder text based on the prompt
  
  // Example static context for demonstration:
  if (prompt.toLowerCase().includes('capital of india')) {
    return "India is a country located in South Asia. The capital of India is New Delhi.";
  }
  
  // Return a generic fallback context for other prompts
  return "This is a placeholder context for the question.";
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
