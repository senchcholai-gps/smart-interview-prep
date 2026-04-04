// This script will open browser DevTools and clear localStorage
// Run this in your browser console after the app starts
console.clear();
console.log("🧹 Clearing sample profiles...");
// Remove job profiles from localStorage
localStorage.removeItem("jobProfiles");
console.log("✅ Removed jobProfiles from localStorage");
// Optional: Clear all localStorage (uncomment if needed)
// localStorage.clear();
// console.log("✅ Cleared all localStorage");
// Verify it's cleared
console.log("Current jobProfiles:", localStorage.getItem("jobProfiles"));
console.log("🎯 Sample profiles cleared! Refresh the page.");
