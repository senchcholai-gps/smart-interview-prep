// ============================================
// INTERVIEW PREP: Objects & JSON
// ============================================

console.log('🎯 OBJECTS & JSON INTERVIEW PRACTICE\n');

// ====================
// 1. OBJECT BASICS
// ====================
console.log('1. Object Creation Methods:');

// Object literal (most common)
const user = {
    name: 'Alice',
    age: 30,
    email: 'alice@example.com',
    isActive: true,
    skills: ['JavaScript', 'React', 'Node.js']
};

// Constructor function
function Person(name, age) {
    this.name = name;
    this.age = age;
}
const bob = new Person('Bob', 25);

// Class syntax (ES6)
class Employee {
    constructor(name, position) {
        this.name = name;
        this.position = position;
    }

    introduce() {
        return `Hi, I'm ${this.name}, a ${this.position}`;
    }
}
const charlie = new Employee('Charlie', 'Developer');

console.log('Object literal:', user);
console.log('Constructor:', bob);
console.log('Class instance:', charlie.introduce());

// ====================
// 2. OBJECT METHODS & THIS
// ====================
console.log('\n2. Object Methods & "this":');

const calculator = {
    value: 0,

    add(num) {
        this.value += num;
        return this;
    },

    multiply(num) {
        this.value *= num;
        return this;
    },

    getValue() {
        return this.value;
    }
};

console.log('Calculator chain:', calculator.add(5).multiply(2).getValue());

// ====================
// 3. DESTRUCTURING (COMMON INTERVIEW TOPIC)
// ====================
console.log('\n3. Destructuring:');

const { name, age, email } = user;
console.log(`Name: ${name}, Age: ${age}, Email: ${email}`);

// Nested destructuring
const company = {
    name: 'TechCorp',
    address: {
        city: 'San Francisco',
        country: 'USA'
    }
};

const { address: { city, country } } = company;
console.log(`City: ${city}, Country: ${country}`);

// ====================
// 4. SPREAD & REST OPERATORS
// ====================
console.log('\n4. Spread & Rest Operators:');

const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const merged = { ...obj1, ...obj2 };
console.log('Merged objects:', merged);

function sumAll(...numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
}
console.log('Sum 1-5:', sumAll(1, 2, 3, 4, 5));

// ====================
// 5. JSON METHODS
// ====================
console.log('\n5. JSON Methods:');

const product = {
    id: 1,
    name: 'Laptop',
    price: 999.99,
    inStock: true
};

const jsonString = JSON.stringify(product);
console.log('JSON String:', jsonString);

const parsedObject = JSON.parse(jsonString);
console.log('Parsed object:', parsedObject);

// ====================
// 6. OBJECT METHODS
// ====================
console.log('\n6. Object Static Methods:');

const keys = Object.keys(user);
const values = Object.values(user);
const entries = Object.entries(user);

console.log('Keys:', keys);
console.log('Values:', values);
console.log('Entries:', entries);

// ====================
// 7. COMMON INTERVIEW QUESTIONS
// ====================
console.log('\n7. Common Interview Questions:');

// Q1: Shallow vs Deep Copy
console.log('\nQ1: Shallow vs Deep Copy:');
const original = { a: 1, b: { c: 2 } };
const shallowCopy = { ...original };
const deepCopy = JSON.parse(JSON.stringify(original));

shallowCopy.b.c = 99;
console.log('Original after shallow copy:', original.b.c); // Changed!

deepCopy.b.c = 100;
console.log('Original after deep copy:', original.b.c); // Unchanged

// Q2: Check if property exists
console.log('\nQ2: Property Existence:');
console.log(`'name' in user:`, 'name' in user);
console.log(`user.hasOwnProperty('name'):`, user.hasOwnProperty('name'));
console.log(`user.hasOwnProperty('toString'):`, user.hasOwnProperty('toString'));

// ====================
// 8. PRACTICE PROBLEMS
// ====================
console.log('\n8. Practice Problems:');

// Problem 1: Merge objects
console.log('\n1. Merge Multiple Objects:');
const defaults = { theme: 'dark', language: 'en' };
const preferences = { language: 'fr', fontSize: 'large' };
const session = { userId: '123' };

const settings = { ...defaults, ...preferences, ...session };
console.log('Merged settings:', settings);

// Problem 2: Count properties
console.log('\n2. Count Object Properties:');
function countProperties(obj) {
    return Object.keys(obj).length;
}
console.log('User has', countProperties(user), 'properties');

// Problem 3: Filter object
console.log('\n3. Filter Object Properties:');
function filterObject(obj, predicate) {
    return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => predicate(key, value))
    );
}

const filtered = filterObject(user, (key, value) => typeof value === 'string');
console.log('String properties:', filtered);

console.log('\n====================================');
console.log('✅ OBJECTS PRACTICE COMPLETE!');
console.log('Key Concepts:');
console.log('• Object creation patterns');
console.log('• Destructuring & spread operators');
console.log('• JSON methods');
console.log('• Shallow vs deep copy');
console.log('====================================');