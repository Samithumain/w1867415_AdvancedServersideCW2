import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AddBlog = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    country: '',
    dateOfVisit: '',
    userId: user.id
  });

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('title', formData.title);
    form.append('content', formData.content);
    form.append('country', formData.country);
    form.append('visit_date', formData.dateOfVisit);
    form.append('author_id', formData.userId);
    form.append('email', user.email);
    if (imageFile) {
      form.append('image', imageFile);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/blog/add?email=${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${user.token}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error('Failed to add blog post.');
      }

      alert('Blog post added!');
    } catch (err) {
      console.error(err);
      alert('Error adding blog post.');
    }
  };
return (
  <div className="form-container">
    <form onSubmit={handleSubmit} className="form-box">
      <h2 className="form-title">Add Blog Post</h2>

      <div className="form-group">
        <label htmlFor="title" className="form-label">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="content" className="form-label">Content</label>
        <textarea
          name="content"
          id="content"
          onChange={handleChange}
          required
          rows="4"
          className="form-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="country" className="form-label">Country</label>
        <input
          type="text"
          name="country"
          id="country"
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="dateOfVisit" className="form-label">Date of Visit</label>
        <input
          type="date"
          name="dateOfVisit"
          id="dateOfVisit"
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="image" className="form-label">Add Picture</label>
        <input
          type="file"
          name="image"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="form-input-file"
        />
      </div>

      <button type="submit" className="form-button">Add Blog Post</button>
    </form>
  </div>
);

};

export default AddBlog;
// 