import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Comments = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      const response = await axios.get(`http://localhost:5000/api/comments/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setComments(response.data);
    };

    fetchComments();
  }, [taskId]);

  const addComment = async () => {
    const response = await axios.post(
      `http://localhost:5000/api/comments/${taskId}`,
      { content },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    setComments([...comments, response.data.comment]);
    setContent('');
  };

  return (
    <div>
      <h3>Commenti</h3>
      <ul>
        {comments.map(comment => (
          <li key={comment._id}>
            <strong>{comment.author.username}:</strong> {comment.content} <em>{new Date(comment.createdAt).toLocaleString()}</em>
          </li>
        ))}
      </ul>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Aggiungi un commento"
        />
        <button onClick={addComment}>Aggiungi Commento</button>
      </div>
    </div>
  );
};

export default Comments;
