import { useEffect, useRef } from 'react';

const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const onTick = () => savedCallback.current();

        const timer = setInterval(onTick, delay);

        return () => clearInterval(timer);
    }, [delay]);
};

export default useInterval;