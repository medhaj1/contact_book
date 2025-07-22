import React, { useState } from 'react';
import SignIn from '../components/signin/SignIn';
import SignUp from '../components/signup/SignUp';

const App = () => {
  const [showSignUp, setShowSignUp] = useState(false);

  const toggleForm = () => setShowSignUp(prev => !prev);

  return (
    <div>
      {showSignUp ? (
        <SignUp toggleForm={toggleForm} />
      ) : (
        <SignIn toggleForm={toggleForm} />
      )}
    </div>
  );
};

export default App;


