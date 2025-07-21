import React, { useState } from 'react';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

function App() {
  const [isSignUp, setIsSignUp] = useState(false);

  return isSignUp ? (
    <SignUp onSwitch={() => setIsSignUp(false)} />
  ) : (
    <SignIn onSwitch={() => setIsSignUp(true)} />
  );
}

export default App;