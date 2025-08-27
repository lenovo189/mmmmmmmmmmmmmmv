import { useState } from 'react';
import { getGeminiResponse } from '@/lib/gemini';


export default function GeminiDemo() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    const text = await getGeminiResponse(prompt);
    setResponse(text);
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
      />
      <button onClick={handleSubmit}>Generate</button>
      <p>{response}</p>
    </div>
  );
}
