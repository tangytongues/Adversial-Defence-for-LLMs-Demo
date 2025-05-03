const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

(async () => {
  const apiKey = 'YOUR_API_KEY'; // Replace with your actual Gemini key

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta3/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Tell me a fun fact about space." }] }]
    })
  });

  // Check the status code
  console.log("Response Status Code:", response.status);

  const rawText = await response.text();
  console.log("🔍 Raw Gemini Response:", rawText);

  try {
    const data = JSON.parse(rawText);
    console.log("✅ Parsed Gemini Response:", data);
  } catch (err) {
    console.error("❌ JSON Parse Error:", err.message);
  }
})();
