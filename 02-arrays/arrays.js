// ============================================
// INTERVIEW PREP: Array Methods (MUST KNOW!)
// ============================================

console.log('🎯 ARRAY METHODS INTERVIEW PRACTICE\n');

// ====================
// 1. BASIC ARRAY METHODS
// ====================
console.log('1. Basic Array Methods:');

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const fruits = ['apple', 'banana', 'cherry', 'date'];

console.log('Original numbers:', numbers);
console.log('Original fruits:', fruits);

// ====================
// 2. CRITICAL METHODS (ALWAYS ASKED!)
// ====================
console.log('\n2. CRITICAL Methods (Interview MUST KNOW):');

// map() - Transform each element
const squared = numbers.map(n => n * n);
console.log('map() - Squared:', squared);

// filter() - Select elements
const evenNumbers = numbers.filter(n => n % 2 === 0);
console.log('filter() - Even:', evenNumbers);

// reduce() - Accumulate values (HARDEST but most important)
const sum = numbers.reduce((total, num) => total + num, 0);
console.log('reduce() - Sum:', sum);

// ====================
// 3. OTHER ESSENTIAL METHODS
// ====================
console.log('\n3. Other Essential Methods:');

// find() - Find first match
const firstEven = numbers.find(n => n % 2 === 0);
console.log('find() - First even:', firstEven);

// some() - Check if any match
const hasEven = numbers.some(n => n > 5);
console.log('some() - Has >5:', hasEven);

// every() - Check if all match
const allPositive = numbers.every(n => n > 0);
console.log('every() - All positive:', allPositive);

// ====================
// 4. PRACTICAL INTERVIEW PROBLEMS
// ====================
console.log('\n4. Interview Problems:');

// Problem 1: Find maximum value
const max = numbers.reduce((max, num) => num > max ? num : max, numbers[0]);
console.log('Max value:', max);

// Problem 2: Remove duplicates
const duplicates = [1, 2, 2, 3, 4, 4, 5];
const unique = [...new Set(duplicates)];
console.log('Remove duplicates:', unique);

// Problem 3: Flatten array
const nested = [[1, 2], [3, 4], [5]];
const flat = nested.flat();
console.log('Flatten array:', flat);

// ====================
// 5. CHAINING METHODS (Common pattern)
// ====================
console.log('\n5. Method Chaining:');

const result = numbers
    .filter(n => n > 5)        // [6, 7, 8, 9, 10]
    .map(n => n * 2)           // [12, 14, 16, 18, 20]
    .reduce((sum, n) => sum + n, 0); // 80

console.log('Chain (filter>map>reduce):', result);

// ====================
// 6. COMMON INTERVIEW QUESTIONS
// ====================
console.log('\n6. Common Interview Questions:');

// Q1: Implement your own map()
console.log('\nQ1: Implement map():');
function customMap(arr, callback) {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        result.push(callback(arr[i], i, arr));
    }
    return result;
}

const customSquared = customMap([1, 2, 3], n => n * n);
console.log('Custom map:', customSquared);

// Q2: Find missing number in sequence
console.log('\nQ2: Find missing number:');
const sequence = [1, 2, 3, 5, 6, 7, 8, 9, 10];
const expectedSum = (10 * 11) / 2; // n*(n+1)/2
const actualSum = sequence.reduce((a, b) => a + b, 0);
const missing = expectedSum - actualSum;
console.log('Missing number:', missing);

// ====================
// 7. PERFORMANCE CONSIDERATIONS
// ====================
console.log('\n7. Performance Tips:');

const largeArray = Array.from({length: 10000}, (_, i) => i + 1);

console.time('forEach time');
largeArray.forEach(n => n * 2);
console.timeEnd('forEach time');

console.time('map time');
largeArray.map(n => n * 2);
console.timeEnd('map time');

// ====================
// 8. PRACTICE EXERCISES
// ====================
console.log('\n8. Practice Exercises:');

// Exercise 1: Count occurrences
const words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
const count = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
}, {});
console.log('Word counts:', count);

// Exercise 2: Group by property
const people = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 25 },
    { name: 'David', age: 30 }
];

const groupedByAge = people.reduce((groups, person) => {
    const age = person.age;
    if (!groups[age]) groups[age] = [];
    groups[age].push(person);
    return groups;
}, {});
console.log('Grouped by age:', groupedByAge);

console.log('\n====================================');
console.log('✅ ARRAY PRACTICE COMPLETE!');
console.log('Key Takeaways:');
console.log('• map/filter/reduce are INTERVIEW ESSENTIALS');
console.log('• Practice method chaining');
console.log('• Understand time/space complexity');
console.log('====================================');