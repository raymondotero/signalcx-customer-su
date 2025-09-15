import React, { useState } from 'react';

export function ReactTest() {
  const [testCount, setTestCount] = useState(0);
  
  return (
    <div className="p-4 border border-border rounded-md">
      <h3>React Test Component</h3>
      <p>Count: {testCount}</p>
      <button onClick={() => setTestCount(prev => prev + 1)}>
        Increment
      </button>
    </div>
  );
}