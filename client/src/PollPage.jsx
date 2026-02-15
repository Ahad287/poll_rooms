// src/PollPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { BACKEND_URL } from './config'; 

const socket = io(BACKEND_URL); 

const PollPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/polls/${id}`);
        setPoll(res.data);
      } catch (err) { 
        console.error("Error fetching poll"); 
      }
    };
    fetchPoll();

    socket.emit('join_poll', id);

    socket.on('poll_updated', (updatedPoll) => {
      setPoll(updatedPoll);
    });

    const localVote = localStorage.getItem(`voted_${id}`);
    if (localVote) setHasVoted(true);

    return () => socket.off('poll_updated');
  }, [id]);

  const handleVote = async (optionIndex) => {
    if (hasVoted) return;
    try {
      setHasVoted(true);
      localStorage.setItem(`voted_${id}`, 'true');
      
      // FIXED: Use BACKEND_URL instead of localhost
      await axios.post(`${BACKEND_URL}/api/polls/${id}/vote`, { optionIndex });
      
    } catch (err) {
      alert("Vote failed");
      setHasVoted(false);
      localStorage.removeItem(`voted_${id}`);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!poll) return <div className="card" style={{textAlign:'center'}}>Loading Poll...</div>;

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

  return (
    <div className="card">
      <h1 className="brand-title" style={{fontSize: '1.8rem', textAlign:'left', marginBottom:'1.5rem'}}>
        {poll.question}
      </h1>
      
      <div className="poll-results">
        {poll.options.map((opt, index) => {
          const percent = totalVotes === 0 ? 0 : ((opt.votes / totalVotes) * 100).toFixed(0);
          
          return (
            <div 
              key={index} 
              className={`result-card ${hasVoted ? 'voted' : ''}`}
              onClick={() => !hasVoted && handleVote(index)}
            >
              <div 
                className="progress-bg" 
                style={{ width: `${percent}%` }}
              ></div>

              <div className="result-content">
                <span>{opt.text}</span>
                {hasVoted && <span>{percent}%</span>}
              </div>
              
              {hasVoted && (
                <div style={{fontSize:'0.8rem', color:'#718096', marginTop: '4px', position:'relative', zIndex:2}}>
                  {opt.votes} votes
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{marginTop: '1.5rem', color: '#718096', fontSize: '0.9rem', textAlign:'center'}}>
        Total Votes: <strong>{totalVotes}</strong>
      </div>

      <div className="actions-footer">
        <button className="secondary-btn blue" onClick={copyLink}>
          {copied ? '✅ Copied!' : '🔗 Share Link'}
        </button>
        
        <button className="secondary-btn" onClick={() => navigate('/')}>
          ➕ Create New Poll
        </button>
      </div>

    </div>
  );
};

export default PollPage;