import { useEffect, useRef } from 'react';


export default function useAutosave(canvasId, elements, delay = 1000) {
    const latest = useRef(elements);
    const lastSaved = useRef(JSON.stringify(elements));
    latest.current = elements;

    function save(keepalive = false) {
        const token = localStorage.getItem('token');
        const json = JSON.stringify(latest.current);
        if (!token || json === lastSaved.current) return;

        const previous = lastSaved.current;
        lastSaved.current = json;

        fetch(`${API}/${canvasId}`, {
            method: 'PUT',
            keepalive,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ elements: latest.current }),
        })
            .then((res) => {
                if (!res.ok) lastSaved.current = previous;
            })
            .catch(() => {
                lastSaved.current = previous;
            });
    }

    // Save once the user pauses drawing
    useEffect(() => {
        const timer = setTimeout(() => save(), delay);
        return () => clearTimeout(timer);
    }, [elements]);

    // Save pending changes when leaving the page or closing the tab
    useEffect(() => {
        const flush = () => save(true);
        window.addEventListener('beforeunload', flush);
        return () => {
            window.removeEventListener('beforeunload', flush);
            save();
        };
    }, []);
}