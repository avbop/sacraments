/* This file is released to the public domain and is marked with CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). */

function recipient(p) {
    switch (p) {
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
        default:
            return document.getElementById('recipient.' + p).value;
    }
}

function showHideRitesAndOrders() {
    // TODO: rewrite this to account for checkboxes for sacraments rather than predicted requirements
    // TODO: use this info to add a warning if deacon attempted confirmation
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
    // TODO: rewrite this
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

function showHideConfirmationNotification() {
    // TODO: rewrite this
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
    // TODO: rewrite this (or, more likely, it gets taken care of by new RitesAndOrders
    // Only show ascription if needed.
    if (recipient('needsBaptism') || recipient('needsReception')) {
        show('ceremony.ascription');
    } else {
        hide('ceremony.ascription');
    }
}

function showHidePriorSacraments() {
    // TODO: figure out how to account for notification of parish of baptism/reception
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
    // TODO: rewrite this
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
    // Show sponsor or Christian witness in register.
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

function updateForm() {
    // This function runs every time the form is modified.
    // Run through the entire form and show/hide/update as needed.

    // This must precede showHideRitesAndOrders: it can change whether someone has received confirmation or Holy Communion.
    showHidePriorSacraments();

    // This must precede showHideSacraments: this delineates what *can* be done, whereas showHideSacraments calculates what *will* be done.
    showHideRitesAndOrders();

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
