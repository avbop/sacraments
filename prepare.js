/* This file is released to the public domain and is marked with CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). */

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
        case 'isCatholic':
            const ascription = recipient('ascription');
            return (ascription == 'latin' || ascription == 'eastern');
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
            // Confirmation: if not already confirmed, and not an infant, and Catholic or about to become Catholic.
            if (!recipient('confirmed')) {
                if (isNaN(recipient('age')) || recipient('age') >= 7) {
                    if (recipient('isCatholic') || recipient('needsReception') || recipient('needsBaptism')) {
                        return true;
                    }
                }
            }
            return false;
        case 'needsCommunion':
            // Communion: if not already received first Communion, and not an infant, and Catholic or about to become Catholic.
            if (!recipient('communioned')) {
                if (isNaN(recipient('age')) || recipient('age') >= 7) {
                    if (recipient('isCatholic') || recipient('needsReception') || recipient('needsBaptism')) {
                        return true;
                    }
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

function showHideSacraments() {
    const needsBaptism = recipient('needsBaptism');
    const needsReception = recipient('needsReception');
    const needsConfirmation = recipient('needsConfirmation');
    const needsCommunion = recipient('needsCommunion');
    const ministerGrade = minister('grade');
    // If nothing is to be done, hide everything and show info.
    if (!needsBaptism && !needsReception && !needsConfirmation && !needsCommunion) {
        hide('summary');
        hide('faculty');
        hide('minister');
        show('nothing');
    } else {
        show('summary');
        show('faculty');
        show('minister');
        hide('nothing');
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
    // If they need baptism, show both sponsors.
    if (recipient('needsBaptism')) {
        show('ceremony.sponsors.secondP');
    } else {
        hide('ceremony.sponsors.secondP');
    }
    // If no sacraments with sponsors, hide both sponsors.
    if (!recipient('needsConfirmation') && !recipient('needsBaptism')) {
        hide('ceremony.sponsors');
    } else {
        show('ceremony.sponsors');
    }
}

function updateForm() {
    // This function runs every time the form is modified.
    // Run through the entire form and show/hide/update as needed.

    // This must precede showHideRitesAndOrders: it can change whether someone has received confirmation or Holy Communion.
    showHidePriorSacraments();

    // This must precede showHideSacraments: this delineates what *can* be done, whereas showHideSacraments calculates what *will* be done.
    showHideRitesAndOrders();

    // This must follow showHideRitesAndOrders(): see comment above.
    showHideSacraments();

    showHideAscription();

    showHideSponsors();

    showHideAdoption();

    showHideEastern();

    showHideByAge();

    autofill();
}
