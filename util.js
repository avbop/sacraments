/* This file is released to the public domain and is marked with CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). */

function addFormListeners() {
    const inputs = document.getElementsByTagName('input');
    for (let i of inputs) {
        i.addEventListener('input', (event) => {
            updateForm();
        });
    }
    const selects = document.getElementsByTagName('select');
    for (let i of selects) {
        i.addEventListener('input', (event) => {
            updateForm();
        });
    }
}

// Hide element via CSS class.
function hide(e) {
    let elem = null;
    if (typeof(e) == 'string') {
        elem = document.getElementById(e);
    } else {
        elem = e;
    }
    elem.classList.add('hide');
}

// Show element via CSS class.
function show(e) {
    let elem = null;
    if (typeof(e) == 'string') {
        elem = document.getElementById(e);
    } else {
        elem = e;
    }
    elem.classList.remove('hide');
}

function calculateAge(bday, sacday) {
    // To calculate the canonical age, we don't actually want elapsed time.
    // Rather, we need to manually parse year, month, day.
    const bornYear = bday.getFullYear();
    const bornMonth = bday.getMonth();
    const bornDay = bday.getDate();
    const sacYear = sacday.getFullYear();
    const sacMonth = sacday.getMonth();
    const sacDay = sacday.getDate();
    let age = sacYear - bornYear - 1;
    if ((sacMonth > bornMonth) || (sacMonth == bornMonth && sacDay > bornDay)) {
        age += 1;
    }
    if (age >= 0) {
        return age;
    } else {
        return NaN;
    }
}

function minister(p) {
    switch (p) {
        case 'name':
            let name = '';
            const grade = document.getElementById('minister.grade').value;
            if (grade == 'bishop') {
                name += 'Most Rev.';
            } else if (grade == 'presbyter') {
                name += 'Rev.';
            } else if (grade == 'deacon') {
                name += 'Deacon';
            }
            name += ' ';
            const shortname = document.getElementById('minister.name').value;
            if (shortname == '') {
                name += '[minister]';
            } else {
                name += shortname;
            }
            return name;
        default:
            return document.getElementById('minister.' + p).value;
    }
}

function showHideRitesAndOrders(baptism, reception, confirmation, communion, grade) {
    // Show/hide sections that require specific rites or grades of holy orders.
    // data-orders is a space-separated list of deacon, presbyter, bishop. Any of these can match (OR).
    // data-rites is a space-separated list of baptism, reception, confirmation, communion. Any of these can match (OR).
    // If both are present, both must match (AND).
    for (let e of document.querySelectorAll('[data-rites],[data-orders]')) {
        let showR = false;
        let showO = false;
        if (e.hasAttribute('data-rites')) {
            const rites = e.getAttribute('data-rites').split(' ');
            if (baptism && rites.includes('baptism')) {
                showR = true;
            }
            if (reception && rites.includes('reception')) {
                showR = true;
            }
            if (confirmation && rites.includes('confirmation')) {
                showR = true;
            }
            if (communion && rites.includes('communion')) {
                showR = true;
            }
        } else {
            showR = true;
        }
        if (e.hasAttribute('data-orders')) {
            const orders = e.getAttribute('data-orders').split(' ');
            showO = orders.includes(grade);
        } else {
            showO = true;
        }
        (showR && showO) ? show(e) : hide(e);
    }
}

function autofill() {
    // Complete autofill information.
    // data-autofill should match the id of one of the info-collecting fields.
    for (let e of document.querySelectorAll('[data-autofill]')) {
        let val = '[error]';
        const data = e.getAttribute('data-autofill');
        const keys = data.split('.');
        val = window[keys.shift()](keys.join('.'));
        if (val instanceof Date) {
            const fmt = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            if (!isNaN(val)) {
                e.innerHTML = new Intl.DateTimeFormat(undefined, fmt).format(val);
            } else {
                e.innerHTML = "[unknown date]";
            }
            continue;
        }
        if (Number.isInteger(val)) {
            e.innerHTML = val;
            continue;
        }
        if (val && val != '') {
            e.innerHTML = val;
            continue;
        }
        e.innerHTML = '[not set]';
    }
}

function showHideAdoption() {
    // Show/hide adoption info.
    const elems = document.getElementsByClassName('if-adopted');
    if (recipient('adopted')) {
        for (let e of elems) {
            show(e);
        }
    } else {
        for (let e of elems) {
            hide(e);
        }
    }
}

function showHideByAge() {
    // Show or hide elements based on the age stored in data-max-age and data-min-age.
    // If age is null, show everything.
    // The ages are inclusive: eg data-max-age=13 will show for 13 and not show for 14.
    const age = recipient('age');
    if (age != NaN && age >= 0) {
        // If age is sane, decide whether to hide or show.
        for (let e of document.querySelectorAll('[data-max-age],[data-min-age]')) {
            let maxage = e.getAttribute('data-max-age');
            let minage = e.getAttribute('data-min-age');
            if (maxage == null) {
                maxage = Infinity;
            }
            if (minage == null) {
                minage = -1;
            }
            if (age <= maxage && age >= minage) {
                show(e);
            } else {
                hide(e);
            }
        }
    } else {
        // If age is null or negative, show everything.
        for (let e of document.querySelectorAll('[data-max-age],[data-min-age]')) {
            show(e);
        }
    }
}
