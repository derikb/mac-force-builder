/* eslint-disable no-unused-vars */
import ForcePage from './components/ForcePage.js';
import ForceList from './components/ForceList.js';
import ForcePlay from './components/ForcePlay.js';
import ForcePrint from './components/ForcePrint.js';
import { getForce } from './services/ForceService.js';

const query = new URLSearchParams(window.location.search);
const forceId = query.get('force_id');
if (forceId) {
    const force = getForce(forceId);
    const isPrint = window.location.pathname.match(/print/);
    const isPlay = window.location.pathname.match(/play/);
    if (isPrint) {
        const el = new ForcePrint({ force });
        document.querySelector('main').prepend(el);
    } else if (isPlay) {
        const el = new ForcePlay({ force });
        document.querySelector('.container').prepend(el);
    }
}

document.querySelector('header a.btn-help')?.addEventListener('click', (ev) => {
    ev.preventDefault();

    const t = document.getElementById('help-general');
    t.showModal();
});
