const { useCallback, useRef } = require('react');

function useDebounce(callback, delay) {
    const timer = useRef();

    const debouncedCallback = useCallback((...args) => {
        if(timer.current) clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            callback(...args);
        }, delay)
    }, [callback, delay])

    return debouncedCallback;
}

export { useDebounce };