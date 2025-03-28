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
        // If not baptised, not ascribed anywhere.
        return 'none';
    }
    const baptismChurch = recipient('priorbaptism.church')
    const currentChurch = recipient('currentchurch')
    if (baptismChurch == 'latin' || baptismChurch == 'eastern') {
        // Baptised Catholic: must still be Catholic.
        if (currentChurch == 'latin' || currentChurch == 'eastern') {
            return currentChurch;
        } else {
            return baptismChurch;
        }
    } else if (baptismChurch == 'orthodox') {
        // Baptised Orthodox: if haven't become Catholic, they're still Orthodox.
        if (currentChurch != 'latin' && currentChurch != 'eastern') {
            return baptismChurch;
        } else {
            return currentChurch;
        }
    } else {
        return currentChurch;
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
        case 'needsBaptism':
            // Baptism: if not already baptised.
            return !document.getElementById('recipient.baptised').checked;
        case 'needsConfirmation':
            // Confirmation: if not already confirmed and not an infant.
            if (!recipient('confirmed')) {
                if (isNaN(recipient('age')) || recipient('age') >= 7) {
                    return true;
                }
            }
            return false;
        case 'needsCommunion':
            // Communion: if not already received first Communion, and not an infant.
            if (!recipient('communioned')) {
                if (isNaN(recipient('age')) || recipient('age') >= 7) {
                    return true;
                }
            }
            return false;
        case 'needsReception':
            // Reception: if baptised non-Catholic, not already received, and at least 14.
            const actualAscription = recipient('ascription');
            const age = recipient('age');
            if (!recipient('needsBaptism')) {
                if (actualAscription != 'latin' && actualAscription != 'eastern') {
                    if (isNaN(age) || age >= 14) {
                        return true;
                    }
                }
            }
            return false;
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
        default:
            return document.getElementById('ceremony.' + p).value;
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
        if (val && val != '') {
            e.innerHTML = val;
            continue;
        }
        e.innerHTML = '[not set]';
    }
}

function showHideRitesAndOrders() {
    // Show/hide sections that require specific rites or grades of holy orders.
    // data-orders is a space-separated list of deacon, presbyter, bishop. Any of these can match (OR).
    // data-rites is a space-separated list of baptism, reception, confirmation, communion. Any of these can match (OR).
    // If both are present, both must match (AND).
    const needsBaptism = recipient('needsBaptism');
    const needsReception = recipient('needsReception');
    const needsConfirmation = recipient('needsConfirmation');
    const needsCommunion = recipient('needsCommunion');
    const grade = minister('grade');
    for (let e of document.querySelectorAll('[data-rites],[data-orders]')) {
        let showR = false;
        let showO = false;
        if (e.hasAttribute('data-rites')) {
            const rites = e.getAttribute('data-rites').split(' ');
            if (needsBaptism && rites.includes('baptism')) {
                showR = true;
            }
            if (needsReception && rites.includes('reception')) {
                showR = true;
            }
            if (needsConfirmation && rites.includes('confirmation')) {
                showR = true;
            }
            if (needsCommunion && rites.includes('communion')) {
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

function showHideEastern() {
    // Show/hide Eastern Church elements.
    const actualAscription = recipient('ascription');
    let intendedAscription = ceremony('churchascription');
    const correspondingValue = ' ';
    if (actualAscription == 'orthodox') {
        if (intendedAscription == 'Latin Catholic Church') {
            document.getElementById('ceremony.churchascription').value = correspondingValue;
            document.getElementById('ceremony.ascription.corresponding').classList.add('warning');
            document.getElementById('ceremony.ascription.corresponding').classList.remove('info');
            intendedAscription = correspondingValue;
        } else {
            document.getElementById('ceremony.ascription.corresponding').classList.add('info');
            document.getElementById('ceremony.ascription.corresponding').classList.remove('warning');
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
}

function showHideAdoption() {
    // Show/hide adoption info.
    if (recipient('adopted')) {
        show('recipient.birthinfo');
        show('register.baptism.birthinfo');
    } else {
        hide('recipient.birthinfo');
        hide('register.baptism.birthinfo');
    }
}

function showHideSacraments() {
    const needsBaptism = recipient('needsBaptism');
    const needsReception = recipient('needsReception');
    const needsConfirmation = recipient('needsConfirmation');
    const needsCommunion = recipient('needsCommunion');
    const ministerGrade = minister('grade');
    // If nothing is to be done, hide everything and show info.
    if (!needsBaptism && !needsReception && !needsConfirmation && !needsCommunion) {
        hide('summary')
        hide('register')
        hide('faculty')
        show('nothing')
    } else {
        show('summary')
        show('register')
        show('faculty')
        hide('nothing')
    }
}

function showHideConfirmationNotification() {
    // Set default state.
    hide('register.notification.tobaptism');
    hide('register.notification.tofullcommunion');
    hide('register.notification.baptisedsameparish');
    hide('register.notification.receivedsameparish');
    show('register.baptism.baptismonly');
    hide('register.baptism.baptismandconfirmation');
    show('register.reception.onlyreceived');
    hide('register.reception.confirmedandreceived');
    // Only show record of prior confirmation if relevant.
    if (recipient('confirmed')) {
        show('register.reception.priorconfirmation');
    } else {
        hide('register.reception.priorconfirmation');
    }
    const needsConfirmation = recipient('needsConfirmation');
    // If not doing confirmation, skip all of this.
    if (!needsConfirmation || minister('grade') == 'deacon') {
        return;
    }
    const actualAscription = recipient('ascription');
    const needsBaptism = recipient('needsBaptism');
    const needsReception = recipient('needsReception');
    if (needsBaptism) {
        // Baptism and confirmation together in this ceremony.
        show('register.baptism.baptismandconfirmation');
        hide('register.baptism.baptismonly');
    } else if (needsReception) {
        // Reception and confirmation together in this ceremony.
        show('register.reception.confirmedandreceived');
        hide('register.reception.onlyreceived');
    } else if (actualAscription == 'latin' || actualAscription == 'eastern') {
        // If Catholic, possibly notify.
        if (recipient('priorbaptism.church') == 'latin' || recipient('priorbaptism.church') == 'eastern') {
            // Baptised Catholic.
            const priorPlace = recipient('priorbaptism.place');
            const actualPlace = ceremony('place');
            if (priorPlace == '' || actualPlace == '' || priorPlace != actualPlace) {
                show('register.notification.tobaptism');
            } else {
                show('register.notification.baptisedsameparish');
            }
        } else {
            // Received into full communion.
            const priorPlace = recipient('priorfullcommunion.place');
            const actualPlace = ceremony('place');
            if (priorPlace == '' || actualPlace == '' || priorPlace != actualPlace) {
                show('register.notification.tofullcommunion');
            } else {
                show('register.notification.receivedsameparish');
            }
        }
    }
}

function showHideAscription() {
    // Only show ascription if needed.
    if (recipient('needsBaptism') || recipient('needsReception')) {
        show('ceremony.ascription');
    } else {
        hide('ceremony.ascription');
    }
}

function showHidePriorSacraments() {
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
        // Without baptism, can't have received other sacraments.
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

    // Hide note about collecting certificates if the form's inputs are shown.
    if (recipient('baptised') || recipient('confirmed')) {
        document.getElementById('recipient.certificatesnote').classList.remove('print-only');
    } else {
        document.getElementById('recipient.certificatesnote').classList.add('print-only');
    }
}

function showHideSponsors() {
    // Show/hide sponsor info.
    if (recipient('baptised')) {
        // If baptised, they're going to be at most confirmed, so at most one sponsor.
        hide('ceremony.sponsors.secondP');
    } else {
        show('ceremony.sponsors.secondP');
    }
    if (recipient('confirmed')) {
        // If confirmed, they're by definition also baptised, so no sponsors are needed.
        hide('ceremony.sponsors');
    } else {
        show('ceremony.sponsors');
    }
    if (ceremony('sponsors.secondtype') == 'witness') {
        hide('register.baptism.sponsors');
        show('register.baptism.sponsor');
        show('register.baptism.witness');
    } else {
        show('register.baptism.sponsors');
        hide('register.baptism.sponsor');
        hide('register.baptism.witness');
    }
}

function showHideByAge() {
    // Show or hide elements based on the age stored in data-max-age and data-min-age.
    // If age is null, show everything.
    // The ages are inclusive: eg data-max-age=13 will show for 13 and not show for 14.
    const age = recipient('age');
    if (age != NaN && age >= 0) {
        // If age is sane, decide whether to hide or show.
        for (let e of document.querySelectorAll('[data-max-age]')) {
            maxage = e.getAttribute('data-max-age');
            if (age <= maxage) {
                show(e);
            } else {
                hide(e);
            }
        }
        for (let e of document.querySelectorAll('[data-min-age]')) {
            minage = e.getAttribute('data-min-age');
            if (age >= minage) {
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

function updateForm() {
    // This function runs every time the form is modified.
    // Run through the entire form and show/hide/update as needed.

    // This must precede showHideSacraments: this delineates what *can* be done, whereas showHideSacraments calculates what *will* be done.
    showHideRitesAndOrders();

    showHidePriorSacraments();

    // This must follow showHideRitesAndOrders(): see comment above.
    showHideSacraments();

    showHideConfirmationNotification();

    showHideAscription();

    showHideSponsors();

    showHideAdoption();

    showHideEastern();

    showHideByAge();

    autofill();
}

function printRegister() {
    for (let e of document.querySelectorAll('section')) {
        if (e.id == 'register') {
            e.classList.remove('screen-only');
        } else {
            e.classList.add('temp-hide');
        }
    }
    window.print();
    for (let e of document.querySelectorAll('section')) {
        if (e.id == 'register') {
            e.classList.add('screen-only');
        } else {
            e.classList.remove('temp-hide');
        }
    }
    document.getElementById('register').scrollIntoView();
}
