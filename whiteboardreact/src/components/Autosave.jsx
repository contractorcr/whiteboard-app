import { useContext } from 'react';
import boardcontext from '../store/boardcontext';
import useAutosave from '../hooks/Autosave';

function Autosave({ canvasId }) {
    const { Elements } = useContext(boardcontext);
    useAutosave(canvasId, Elements);
    return null;
}

export default Autosave;