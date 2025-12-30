import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { BUILDER_EMAIL, BUILDER_PASSWORD } from '../constants';
import { UserPlus, LogIn, AlertCircle, Download, X, Smartphone, Monitor, Share } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  users: User[];
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, users }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [generalError, setGeneralError] = useState('');
  
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric characters
    if (/^\d*$/.test(value)) {
      setPhone(value);
      if (phoneError) setPhoneError('');
      if (generalError) setGeneralError('');
    }
  };

  const validatePhone = (phoneNumber: string) => {
    if (phoneNumber.length !== 10) {
      return "Phone number must be exactly 10 digits (e.g., 050xxxxxxx)";
    }
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Builder Login
    if (isLogin && email) {
      if (email === BUILDER_EMAIL && password === BUILDER_PASSWORD) {
        onLogin({
          id: 'builder-1',
          fullName: 'System Builder',
          phoneNumber: '0000000000',
          role: UserRole.BUILDER
        });
      } else {
        setGeneralError("Invalid Admin credentials.");
      }
      return;
    }

    // Student Login/Signup Validation
    if (!fullName || !phone) {
      setGeneralError("Please enter Name and Phone Number");
      return;
    }

    const pError = validatePhone(phone);
    if (pError) {
      setPhoneError(pError);
      return;
    }

    if (isLogin) {
      // STRICT LOGIN: Check if user exists
      const existingUser = users.find(u => 
        u.phoneNumber === phone && 
        u.fullName.trim().toLowerCase() === fullName.trim().toLowerCase()
      );

      if (existingUser) {
        onLogin(existingUser);
      } else {
        setGeneralError("Account not found. Please check your name and number or create an account.");
      }
    } else {
      // STRICT REGISTRATION: Check for duplicates
      const phoneExists = users.some(u => u.phoneNumber === phone);
      
      if (phoneExists) {
        setGeneralError("An account with this phone number already exists.");
        return;
      }

      // Check for Name+Phone duplicate specifically (though phone check covers it)
      const exactMatch = users.some(u => 
        u.phoneNumber === phone && 
        u.fullName.trim().toLowerCase() === fullName.trim().toLowerCase()
      );
      
      if (exactMatch) {
         setGeneralError("This account already exists. Please log in.");
         return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        fullName: fullName.trim(),
        phoneNumber: phone,
        role: UserRole.STUDENT
      };

      onRegister(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      {/* Install App Banner */}
      <button 
        onClick={() => setShowInstallHelp(true)}
        className="w-full mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg shadow-md flex items-center justify-between hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-[1.02]"
      >
        <div className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span className="font-semibold text-sm">Install App on Phone / PC</span>
        </div>
        <span className="bg-white/20 text-xs px-2 py-1 rounded">View How</span>
      </button>

      {/* Install Help Modal */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowInstallHelp(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2 text-indigo-600" />
              How to Install
            </h3>

            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="font-bold text-green-800 flex items-center mb-2">
                  <Smartphone className="w-4 h-4 mr-2" /> Android
                </h4>
                <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
                  <li>Open in <strong>Chrome</strong>.</li>
                  <li>Tap the <strong>3 dots</strong> (Menu) at the top right.</li>
                  <li>Tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-bold text-gray-800 flex items-center mb-2">
                  <Smartphone className="w-4 h-4 mr-2" /> iPhone (iOS)
                </h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  <li>Open in <strong>Safari</strong>.</li>
                  <li>Tap the <strong>Share</strong> icon <Share className="w-3 h-3 inline" /> at the bottom.</li>
                  <li>Scroll down & tap <strong>Add to Home Screen</strong>.</li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-blue-800 flex items-center mb-2">
                  <Monitor className="w-4 h-4 mr-2" /> Windows / PC
                </h4>
                <p className="text-sm text-blue-700">
                  Look for the <Download className="w-3 h-3 inline" /> <strong>Install icon</strong> on the right side of the address bar in Chrome or Edge.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallHelp(false)}
              className="mt-6 w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="md:flex">
          <div className="w-full p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                {isLogin 
                  ? 'Sign in to access your study materials.' 
                  : 'Register to request custom study units.'}
              </p>
            </div>

            {generalError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {!isLogin && (
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Full Name</label>
                   <input
                     type="text"
                     required
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                     placeholder="John Doe"
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                   />
                 </div>
              )}

              {!isLogin && (
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Phone Number (UAE)</label>
                   <input
                     type="tel"
                     inputMode="numeric"
                     required
                     className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                       phoneError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                     }`}
                     placeholder="0501234567"
                     value={phone}
                     onChange={handlePhoneChange}
                     maxLength={15}
                   />
                   {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                 </div>
              )}
              
              {/* Login Form Fields */}
              {isLogin && (
                 <>
                   <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-sm text-gray-500">Student Login</span>
                      </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Full Name</label>
                     <input
                       type="text"
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                       placeholder="John Doe"
                       value={fullName}
                       onChange={(e) => setFullName(e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Phone Number (UAE)</label>
                     <input
                       type="tel"
                       inputMode="numeric"
                       className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                          phoneError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                       placeholder="0501234567"
                       value={phone}
                       onChange={handlePhoneChange}
                       maxLength={15}
                     />
                     {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                   </div>

                   <div className="relative mt-6">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-2 bg-white text-sm text-gray-500">Builder Admin Login</span>
                      </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Admin Email</label>
                     <input
                       type="email"
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                       placeholder="admin@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">Password</label>
                     <input
                       type="password"
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                       placeholder="*****"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                     />
                   </div>
                 </>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
              >
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                    setIsLogin(!isLogin);
                    setPhoneError('');
                    setGeneralError('');
                    // Clear form
                    setFullName('');
                    setPhone('');
                    setEmail('');
                    setPassword('');
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};