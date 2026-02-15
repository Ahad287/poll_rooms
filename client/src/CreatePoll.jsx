import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from './config';


const CreatePoll = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const navigate = useNavigate();

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);

  const handleSubmit = async () => {
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (!question.trim() || validOptions.length < 2) {
      alert("Please provide a question and at least 2 options.");
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/api/polls`, {
        question,
        options: validOptions
      });
      navigate(`/poll/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Error: Backend not running");
    }
  };

  return (
    <div className="card">
      <h1 className="brand-title">Real-Time Poll Rooms</h1>
      <p className="brand-subtitle">Stop scrolling and start polling! ⬇️</p>

      <div className="input-wrapper">
        <label>The Question</label>
        <input
          type="text"
          placeholder="What's on ur mind?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      
      <div className="input-wrapper">
        <label>Answer Options</label>
        {options.map((opt, i) => (
          <div key={i} className="option-row">
            <div className="option-dot">{i + 1}</div>
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
            />
          </div>
        ))}
        
        <button className="action-btn" onClick={addOption}>
          <span style={{fontSize: '1.2rem'}}>+</span> Add another option
        </button>
      </div>

      <button className="primary-btn" onClick={handleSubmit}>
        Launch Poll 🚀
      </button>
    </div>
  );
};

export default CreatePoll;