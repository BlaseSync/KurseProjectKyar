// --- START OF FILE js/dataLoader.js ---
async function loadJSON(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Could not load JSON from ${filePath}:`, error);
        return null;
    }
}
// --- END OF FILE js/dataLoader.js ---