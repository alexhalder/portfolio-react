// Protection hook intentionally disabled — no-op to allow normal browser behavior
import { useEffect } from 'react';

const useProtection = () => {
    useEffect(() => {
        // No protection enabled. This file kept as a stub for future use.
        return () => {};
    }, []);
};

export default useProtection;
