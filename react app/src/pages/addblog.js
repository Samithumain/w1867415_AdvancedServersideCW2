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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const response = await fetch('http://localhost:5000/api/blog/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}` 

        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          country: formData.country,
          visit_date: formData.dateOfVisit,
          author_id: formData.userId,
          email: user.email 
        })
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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">Add Blog Post</h2>
  
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          onChange={handleChange}
          required
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>
  
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          name="content"
          id="content"
          onChange={handleChange}
          required
          rows="4"
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>
  
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
        <input
          type="text"
          name="country"
          id="country"
          onChange={handleChange}
          required
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>
  
      <div>
        <label htmlFor="dateOfVisit" className="block text-sm font-medium text-gray-700">Date of Visit</label>
        <input
          type="date"
          name="dateOfVisit"
          id="dateOfVisit"
          onChange={handleChange}
          required
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
        />
      </div>
  
  
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add Blog Post
      </button>
    </form>
  );
  
};

export default AddBlog;
