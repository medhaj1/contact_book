import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';  // import toast

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    const { name, contact, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const signUpResponse = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, contact },
        },
      });
      const { data: { user }, error: signUpError } = signUpResponse;

      console.log('Full signup response:', signUpResponse);
      console.log('User after signup:', user);

      if (signUpError || !user) {
        toast.error(`Signup failed: ${signUpError?.message || 'No user returned. Please check your email and password.'}`);
        return;
      }

      // Insert into user_profile
      const { error: profileError } = await supabase.from('user_profile').insert([
        {
          u_id: user?.id,
          name,
          email,
          phone: contact,
          image: null,
        }
      ]);

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        toast.error(`Database error: ${profileError.message}`);
      } else {
        toast.success('Sign-up successful! Please check your email to confirm your account.');
        navigate('/signin');
      }
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(`Signup error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-white flex items-center justify-center relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
      >
        <button
          type="button"
          className="top-4 left-4 flex scale-100 hover:scale-110 transition transition-transform items-center"
          onClick={() => navigate('/')}
        >
          <ArrowLeftIcon className="w-5 h-5 text-slate-400 hover:text-slate-600" />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-900">
          Create Account
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact Number"
          value={formData.contact}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
        />
        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full p-3 mb-4 border rounded-xl shadow focus:shadow-md hover:shadow-md scale-100 focus:scale-105 transition-all duration-200"
        />

        <button
          type="submit"
          className="w-full text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-400 text-white py-3 rounded-xl shadow scale-100 hover:scale-105 hover:shadow-lg hover:from-blue-800 hover:to-blue-500 transition-all duration-200"
        >
          Sign Up
        </button>

        <p className="mt-4 text-sm text-center">
          Already have an account?
          <Link to="/signin" className="text-blue-600 font-semibold ml-1 hover:underline hover:text-blue-800">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUp;


