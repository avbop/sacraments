/* This file is released to the public domain and is marked with CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). */

function emailAddress() {
    // Obfuscate email address.
    const address = 'webmaster@.app'.replace('@', '@canonlaw');
    const e = document.getElementById('emailaddress');
    e.href = 'mailto:' + address;
    e.innerHTML = address;
}

window.addEventListener('load', (event) => {
    emailAddress();
});
