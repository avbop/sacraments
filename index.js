/* This file is released to the public domain and is marked with CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). */

window.addEventListener('load', (event) => {
    for (let e of document.querySelectorAll('.option')) {
        const url = e.getAttribute('data-url');
        e.addEventListener('click', (event) => {
            window.location.href = url;
        });
    }
});
