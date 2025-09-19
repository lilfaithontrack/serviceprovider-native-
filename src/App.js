import {AuthContext} from 'aws-amplify'; 
import React from 'react';
import AppNavigator from './navigation/AppNavigator';
export default function App() {
  return (
    <AuthContext.Provider>
      <AppNavigator />
    </AuthContext.Provider>
  );
}
