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

function calculateAscription() {
    if (!recipient('baptised')) {
        return 'none';
    }
    const baptismChurch = recipient('priorbaptism.church')
    const currentChurch = recipient('currentchurch')
    if (baptismChurch == 'latin' || baptismChurch == 'eastern') {
        if (currentChurch == 'latin') {
            return 'latin';
        } else if (currentChurch == 'eastern') {
            return 'eastern';
        } else {
            return baptismChurch;
        }
    } else {
        if (currentChurch == 'latin') {
            return 'latin';
        } else if (currentChurch == 'eastern') {
            return 'eastern';
        } else {
            return currentChurch;
        }

    }
}

function recipient(p) {
    switch (p) {
        case 'age':
            return calculateAge(recipient('birthdate'), ceremony('date'));
        case 'ascription':
            return calculateAscription();
        case 'name':
            const name = document.getElementById('recipient.name').value;
            if (name == '') {
                return '[recipient]';
            } else {
                return name;
            }
        case 'birthdate':
            return new Date(document.getElementById('recipient.birthdate').value);
        case 'adopted':
            return document.getElementById('recipient.adopted').value == 'Yes';
        case 'baptised':
            return document.getElementById('recipient.baptised').checked;
        case 'confirmed':
            return document.getElementById('recipient.confirmed').checked;
        case 'communioned':
            return document.getElementById('recipient.communioned').checked;
        default:
            return document.getElementById('recipient.' + p).value;
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

function ceremony(p) {
    switch (p) {
        case 'date':
            return new Date(document.getElementById('ceremony.date').value);
        case 'place':
            let n = document.getElementById('ceremony.place').value;
            if (n && n != '') {
                return n;
            } else {
                return '[unknown place]';
            }
        default:
            return document.getElementById('ceremony.' + p).value;
    }
}

function autofill() {
    // Complete autofill information.
    // data-autofill should match the id of one of the info-collecting fields.
    const dateKeys = ['date', 'birthdate'];
    for (let e of document.querySelectorAll('[data-autofill]')) {
        let val = '[error]';
        const data = e.getAttribute('data-autofill');
        const keys = data.split('.');
        val = window[keys.shift()](keys.join('.'));
        if (val instanceof Date) {
            e.innerHTML = val.toDateString();
            continue;
        }
        if (val && val != '') {
            e.innerHTML = val;
            continue;
        }
        e.innerHTML = '[not set]';
    }
}

function showHideOrders() {
    // Show/hide sections that require orders.
    // data-orders is a space-separated list of deacon, presbyter, bishop.
    const grade = minister('grade');
    for (let e of document.querySelectorAll('[data-orders]')) {
        const orders = e.getAttribute('data-orders').split(' ');
        if (orders.includes(grade)) {
            show(e);
        } else {
            hide(e);
        }
    }
}

function showHideEastern() {
    // Show/hide Eastern Church elements.
    const currentchurch = recipient('currentchurch');
    const actualAscription = recipient('ascription');
    let intendedAscription = ceremony('churchascription');
    const correspondingValue = 'corresponding Eastern Catholic Church';
    if (actualAscription == 'orthodox') {
        if (intendedAscription == 'Latin Catholic Church') {
            document.getElementById('ceremony.churchascription').value = correspondingValue;
            intendedAscription = correspondingValue;
        }
        show('ceremony.ascription.corresponding');
    } else {
        hide('ceremony.ascription.corresponding');
    }
    if (intendedAscription != 'Latin Catholic Church') {
        show('ceremony.ascription.easternwarning');
    } else {
        hide('ceremony.ascription.easternwarning');
    }
    if (actualAscription == 'eastern' || actualAscription == 'orthodox') {
        hide('ceremony.ascription.usuallylatin');
        show('recipient.priorbaptism.easternwarning');
    } else {
        show('ceremony.ascription.usuallylatin');
        hide('recipient.priorbaptism.easternwarning');
    }
    if (actualAscription == 'eastern') {
        show('recipient.priorbaptism.ascriptionP');
    } else {
        hide('recipient.priorbaptism.ascriptionP');
    }
}

function showHideAdoption() {
    // Show/hide adoption info.
    if (recipient('adopted')) {
        show('recipient.birthinfo');
    } else {
        hide('recipient.birthinfo');
    }
}

function showAge() {
    // Show calculated age.
    let age = recipient('age');
    if (age != NaN && age >= 0) {
        document.getElementById('ceremony.age').innerHTML = '(Recipient\'s canonical age: ' + age + ')';
    } else {
        document.getElementById('ceremony.age').innerHTML = '';
    }
}

function updateForm() {
    // This function runs every time the form is modified.
    // Run through the entire form and show/hide/update as needed.

    // Calculate which rites are needed.
    let needsBaptism = false;
    let needsReception = false;
    let needsConfirmation = false;
    let needsCommunion = false;
    // Baptism: if and only if not already baptised.
    needsBaptism = !recipient('baptised');
    // Confirmation: if and only if not already confirmed.
    needsConfirmation = !recipient('confirmed');
    // Communion: if and only if not already received first Communion.
    needsCommunion = !recipient('communioned');
    // Reception: if baptised non-Catholic and not already received.
    const actualAscription = recipient('ascription');
    if (actualAscription != 'latin' && actualAscription != 'eastern') {
        needsReception = true;
    }

    if (needsBaptism || needsReception) {
        show('ceremony.ascription');
    } else {
        hide('ceremony.ascription');
    }

    autofill();

    showAge();

    // Show/hide baptism info.
    if (recipient('baptised')) {
        // Collect info about prior baptism.
        show('recipient.priorbaptisminfo');
        // Baptism enables other sacraments.
        document.getElementById('recipient.confirmed').disabled = false;
        document.getElementById('recipient.communioned').disabled = false;
    } else {
        // Don't collect info about (non-existent) prior baptism.
        hide('recipient.priorbaptisminfo');
        // Without baptism, can't receive other sacraments.
        document.getElementById('recipient.confirmed').disabled = true;
        document.getElementById('recipient.confirmed').checked = false;
        document.getElementById('recipient.communioned').disabled = true;
        document.getElementById('recipient.communioned').checked = false;
    }

    // Show/hide prior confirmation info.
    if (recipient('confirmed')) {
        show('recipient.priorconfirmationinfo');
    } else {
        hide('recipient.priorconfirmationinfo');
    }

    // Show/hide prior reception into full communion info.
    // Use stacked ifs so the logic is clearer.
    if (recipient('baptised')) {
        const oldchurch = recipient('priorbaptism.church')
        const newchurch = recipient('currentchurch')
        if (oldchurch == 'unknown' || oldchurch == 'orthodox' || oldchurch == 'protestant') {
            if (newchurch == 'latin' || newchurch == 'eastern') {
                show('recipient.priorfullcommunioninfo');
            } else {
                hide('recipient.priorfullcommunioninfo');
            }
        } else {
            hide('recipient.priorfullcommunioninfo');
        }
    } else {
        hide('recipient.priorfullcommunioninfo');
    }

    // Show/hide sponsor info.
    if (recipient('baptised')) { // If baptised, they're going to be at most confirmed, so at most one sponsor.
        hide('ceremony.sponsors.secondP');
    } else {
        show('ceremony.sponsors.secondP');
    }
    if (recipient('confirmed')) { // If confirmed, they're by definition also baptised, so no sponsors are needed.
        hide('ceremony.sponsors');
    } else {
        show('ceremony.sponsors');
    }

    showHideAdoption();

    // Show/hide faculties sections.
    if (recipient('baptised')) {
        hide('faculty.baptism');
    } else {
        show('faculty.baptism');
    }
    if (recipient('confirmed')) {
        hide('faculty.confirmation');
    } else {
        show('faculty.confirmation');
    }
    if (recipient('communioned')) {
        hide('faculty.eucharist');
    } else {
        show('faculty.eucharist');
    }

    showHideOrders();

    showHideEastern();
}
