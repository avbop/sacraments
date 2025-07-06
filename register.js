/* This file is released to the public domain and is marked with CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). */

function recipient(p) {
    switch (p) {
        case 'age':
            return calculateAge(recipient('birthdate'), ceremony('date'));
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
        case 'received':
            return document.getElementById('recipient.received').checked;
        case 'confirmed':
            return document.getElementById('recipient.confirmed').checked;
        case 'communioned':
            return document.getElementById('recipient.communioned').checked;
        default:
            return document.getElementById('recipient.' + p).value;
    }
}

function ceremony(p) {
    switch (p) {
        case 'date':
            return new Date(document.getElementById('ceremony.date').value);
        case 'baptised':
            return document.getElementById('ceremony.baptised').checked;
        case 'received':
            return document.getElementById('ceremony.received').checked;
        case 'confirmed':
            return document.getElementById('ceremony.confirmed').checked;
        case 'communioned':
            return document.getElementById('ceremony.communioned').checked;
        default:
            return document.getElementById('ceremony.' + p).value;
    }
}

function showHideEastern() {
    // Show/hide Eastern Church elements.
    const ascription = ceremony('churchascription');
    if (ascription != 'Latin Catholic Church') {
        show('ceremony.ascription.easternwarning');
    } else {
        hide('ceremony.ascription.easternwarning');
    }
}

function showHideConfirmationNotification() {
    const confirmed = ceremony('confirmed');
    const baptised = ceremony('baptised');
    const received = ceremony('received');
    const priorBaptism = recipient('baptised');
    const priorReception = recipient('received');
    const priorConfirmation = recipient('confirmed');
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
    if (priorConfirmation) {
        show('register.reception.priorconfirmation');
    } else {
        hide('register.reception.priorconfirmation');
    }
    // If not confirmed, skip all of this.
    if (!confirmed || minister('grade') == 'deacon') {
        return;
    }
    if (baptised) {
        // Baptism and confirmation together in this ceremony.
        show('register.baptism.baptismandconfirmation');
        hide('register.baptism.baptismonly');
    } else if (received) {
        // Reception and confirmation together in this ceremony.
        show('register.reception.confirmedandreceived');
        hide('register.reception.onlyreceived');
    }
    // Notify based on parish of baptism/reception.
    if (priorBaptism && !priorReception && !received) {
        // Baptised Catholic.
        const priorPlace = recipient('priorbaptism.place');
        const actualPlace = ceremony('place');
        if (priorPlace == '' || actualPlace == '' || priorPlace != actualPlace) {
            show('register.notification.tobaptism');
        } else {
            show('register.notification.baptisedsameparish');
        }
    }
    if (priorReception) {
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

function showHideSacraments() {
    const baptised = ceremony('baptised');
    const received = ceremony('received');
    const confirmed = ceremony('confirmed');
    const communioned = ceremony('communioned');
    const priorBaptism = recipient('baptised');
    // Show/hide prior baptism info.
    if (priorBaptism) {
        // Collect info about prior baptism.
        show('recipient.priorbaptisminfo');
        // Baptism enables other sacraments.
        document.getElementById('recipient.received').disabled = false;
        document.getElementById('recipient.confirmed').disabled = false;
        document.getElementById('recipient.communioned').disabled = false;
    } else {
        // Don't collect info about (non-existent) prior baptism.
        hide('recipient.priorbaptisminfo');
        // Without baptism, can't have received other sacraments.
        document.getElementById('recipient.received').disabled = true;
        document.getElementById('recipient.received').checked = false;
        document.getElementById('recipient.confirmed').disabled = true;
        document.getElementById('recipient.confirmed').checked = false;
        document.getElementById('recipient.communioned').disabled = true;
        document.getElementById('recipient.communioned').checked = false;
    }
    // Don't calculate these until the above has run.
    const priorReception = recipient('received');
    const priorConfirmation = recipient('confirmed');
    // Show/hide prior confirmation info.
    if (priorConfirmation) {
        show('recipient.priorconfirmationinfo');
    } else {
        hide('recipient.priorconfirmationinfo');
    }
    // Show/hide prior reception info.
    if (priorReception) {
        show('recipient.priorfullcommunioninfo');
    } else {
        hide('recipient.priorfullcommunioninfo');
    }
    // Show/hide warnings about incompatible selections.
    if (priorBaptism && baptised) {
        show('register.warnings.doublebaptism');
    } else {
        hide('register.warnings.doublebaptism');
    }
    if (priorReception && received) {
        show('register.warnings.doublereception');
    } else {
        hide('register.warnings.doublereception');
    }
    if (priorConfirmation && confirmed) {
        show('register.warnings.doubleconfirmation');
    } else {
        hide('register.warnings.doubleconfirmation');
    }
    if (baptised && received) {
        show('register.warnings.baptismandreception');
    } else {
        hide('register.warnings.baptismandreception');
    }
    // If not baptised, can't receive anything else.
    if ((!priorBaptism && !baptised)
        && (received || confirmed || communioned)) {
        show('register.warnings.baptismrequired');
    } else {
        hide('register.warnings.baptismrequired');
    }
}

function showHideSponsors() {
    // Show sponsor or Christian witness in register.
    // Only show first sponsor if name is empty.
    if (ceremony('sponsors.second') == '') {
        hide('register.baptism.sponsors');
        show('register.baptism.sponsor');
        hide('register.baptism.witness');
    } else {
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
}

function updateForm() {
    // This function runs every time the form is modified.
    // Run through the entire form and show/hide/update as needed.

    // This must precede showHideByData: it can change whether someone has received confirmation or Holy Communion.
    showHideSacraments();

    const baptism = ceremony('baptised');
    const reception = ceremony('received');
    const confirmation = ceremony('confirmed');
    const communion = ceremony('communioned');
    const grade = minister('grade');
    showHideByData(baptism, reception, confirmation, communion, grade);

    showHideConfirmationNotification();

    showHideSponsors();

    showHideAdoption();

    showHideEastern();

    autofill();
}
