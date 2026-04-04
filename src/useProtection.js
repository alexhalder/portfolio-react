import { useEffect } from 'react';

const useProtection = () => {
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable keyboard shortcuts for developer tools
        const handleKeyDown = (e) => {
            // Disable F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            
            // Disable Ctrl+Shift+I (Chrome, Firefox, Edge)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                return false;
            }
            
            // Disable Ctrl+Shift+J (Chrome)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }
            
            // Disable Ctrl+Shift+C (Chrome, Firefox, Edge)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }
            
            // Disable Ctrl+U (View source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
        };

        // Clear console on page load and continuously
        const clearConsole = () => {
            if (window.console && window.console.clear) {
                window.console.clear();
            }
        };

        // Disable text selection
        const handleSelectStart = (e) => {
            e.preventDefault();
            return false;
        };

        // Disable drag and drop
        const handleDragStart = (e) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('selectstart', handleSelectStart);
        document.addEventListener('dragstart', handleDragStart);

        const consoleInterval = setInterval(clearConsole, 1000);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('selectstart', handleSelectStart);
            document.removeEventListener('dragstart', handleDragStart);
            clearInterval(consoleInterval);
        };
    }, []);
};

export default useProtection;
