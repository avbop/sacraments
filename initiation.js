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

function calculate_age(bday, sacday) {
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

function recipient(p) {
    switch (p) {
        case 'age':
            return calculate_age(recipient('birthday'), ceremony('date'));
        case 'fullname':
            const name = recipient('name');
            if (name == '') {
                return 'N. N.';
            } else {
                return name;
            }
        case 'birthday':
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
        case 'fullname':
            let name = '';
            const grade = minister('grade');
            if (grade == 'bishop') {
                name += 'Bishop';
            } else if (grade == 'presbyter') {
                name += 'Father';
            } else if (grade == 'deacon') {
                name += 'Deacon';
            }
            name += ' ';
            const shortname = minister('name')
            if (shortname == '') {
                name += 'N. N.';
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

function updateForm() {
    // This function runs every time the form is modified.
    // Run through the entire form and show/hide/update as needed.

    console.log('Updating form...');

    // Fill in names.
    const nameMinister = minister('fullname');
    for (let e of document.getElementsByClassName('minister.name')) {
        e.innerHTML = nameMinister;
    }
    const nameRecipient = recipient('fullname');
    for (let e of document.getElementsByClassName('recipient.name')) {
        e.innerHTML = nameRecipient;
    }

    // Show calculated age.
    let age = recipient('age');
    if (age != NaN && age >= 0) {
        document.getElementById('ceremony.age').innerHTML = '(Recipient\'s canonical age: ' + age + ')';
    } else {
        document.getElementById('ceremony.age').innerHTML = '';
    }

    // Show/hide baptism info.
    if (recipient('baptised')) {
        // Collect info about prior baptism.
        document.getElementById('recipient.priorbaptisminfo').style.display = 'block';
        // Baptism enables other sacraments.
        document.getElementById('recipient.confirmed').disabled = false;
        document.getElementById('recipient.communioned').disabled = false;
    } else {
        // Don't collect info about (non-existent) prior baptism.
        document.getElementById('recipient.priorbaptisminfo').style.display = 'none';
        // Without baptism, can't receive other sacraments.
        document.getElementById('recipient.confirmed').disabled = true;
        document.getElementById('recipient.confirmed').checked = false;
        document.getElementById('recipient.communioned').disabled = true;
        document.getElementById('recipient.communioned').checked = false;
    }

    // Show/hide prior confirmation info.
    if (recipient('confirmed')) {
        document.getElementById('recipient.priorconfirmationinfo').style.display = 'block';
    } else {
        document.getElementById('recipient.priorconfirmationinfo').style.display = 'none';
    }

    // Show/hide prior reception into full communion info.
    // Use stacked ifs so the logic is clearer.
    if (recipient('baptised')) {
        const oldchurch = recipient('priorbaptism.church')
        const newchurch = recipient('currentchurch')
        if (oldchurch == 'unknown' || oldchurch == 'orthodox' || oldchurch == 'protestant') {
            if (newchurch == 'latin' || newchurch == 'eastern') {
                document.getElementById('recipient.priorfullcommunioninfo').style.display = 'block';
            } else {
                document.getElementById('recipient.priorfullcommunioninfo').style.display = 'none';
            }
        } else {
            document.getElementById('recipient.priorfullcommunioninfo').style.display = 'none';
        }
    } else {
        document.getElementById('recipient.priorfullcommunioninfo').style.display = 'none';
    }

    // Show/hide sponsor info.
    if (recipient('baptised')) { // If baptised, they're going to be at most confirmed, so at most one sponsor.
        document.getElementById('ceremony.sponsors.secondP').style.display = 'none';
    } else {
        document.getElementById('ceremony.sponsors.secondP').style.display = 'block';
    }
    if (recipient('confirmed')) { // If confirmed, they're by definition also baptised, so no sponsors are needed.
        document.getElementById('ceremony.sponsors').style.display = 'none';
    } else {
        document.getElementById('ceremony.sponsors').style.display = 'block';
    }

    // Show/hide adoption info.
    if (recipient('adopted')) {
        document.getElementById('recipient.birthinfo').style.display = 'block';
    } else {
        document.getElementById('recipient.birthinfo').style.display = 'none';
    }

    // Show/hide faculties sections.
    if (recipient('baptised')) {
        document.getElementById('faculty.baptism').style.display = 'none';
    } else {
        document.getElementById('faculty.baptism').style.display = 'block';
    }
    if (recipient('confirmed')) {
        document.getElementById('faculty.confirmation').style.display = 'none';
    } else {
        document.getElementById('faculty.confirmation').style.display = 'block';
    }
    if (recipient('communioned')) {
        document.getElementById('faculty.eucharist').style.display = 'none';
    } else {
        document.getElementById('faculty.eucharist').style.display = 'block';
    }
}
