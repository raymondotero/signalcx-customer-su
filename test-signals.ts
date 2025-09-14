// Test the business value signal generation
import { generateBusinessValueSignal } from '../services/signalCatalog';

// Test generating a business value signal
const testSignal = generateBusinessValueSignal('test-account-1', 'Test Account');
console.log('Generated Business Value Signal:', testSignal);

// Test the different signal types
const categories = ['cost', 'agility', 'data', 'risk', 'culture'];
categories.forEach(category => {
  console.log(`\n--- ${category.toUpperCase()} SIGNALS ---`);
  for (let i = 0; i < 3; i++) {
    const signal = generateBusinessValueSignal(`test-${category}-${i}`, `Test ${category} Account ${i}`);
    console.log(`${signal.signalName}: ${signal.value}${signal.unit} (${signal.severity}) - ${signal.description}`);
  }
});

export {};