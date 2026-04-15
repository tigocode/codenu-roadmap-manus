'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 flex flex-col">
        {label && (
          <label 
            htmlFor={id} 
            className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative group">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            className={`
              block w-full border rounded-xl text-sm font-medium transition-all shadow-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
              ${leftIcon ? 'pl-11' : 'pl-4'}
              ${rightIcon ? 'pr-11' : 'pr-4'}
              py-2.5
              ${error 
                ? 'border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-200 placeholder-red-300' 
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-600'
              }
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <span className="text-xs font-semibold text-red-500 dark:text-red-400 ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
