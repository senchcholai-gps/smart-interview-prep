// src/utils/syncUtils.ts
export const exportData = () => {
  try {
    const data: {[key: string]: string} = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) data[key] = value;
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-interview-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Data exported successfully!');
  } catch (error) {
    alert('❌ Error exporting data!');
  }
};
export const importData = (file: File) => {
  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    if (!event.target || !event.target.result) {
      alert('Error reading file!');
      return;
    }
    try {
      const data = JSON.parse(event.target.result as string);
      if (window.confirm('This will replace all current data. Continue?')) {
        localStorage.clear();
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, data[key]);
        });
        alert('✅ Data imported successfully! Refresh the page.');
        window.location.reload();
      }
    } catch (error) {
      alert('❌ Invalid file format!');
    }
  };
  reader.readAsText(file);
};
