function addFormListeners() {
    const inputs = document.getElementsByTagName('input');
    for (var i of inputs) {
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
    if (sacMonth >= bornMonth && sacDay > bornDay) {
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
        case 'birthday':
            return new Date(document.getElementById('recipient.birthdate').value);
        case 'adopted':
            return document.getElementById('recipient.adopted.true').checked;
        case 'baptised':
            return document.getElementById('recipient.baptised.true').checked;
        default:
            return document.getElementById('recipient.' + p).value;
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

    // Show calculated age.
    let age = recipient('age');
    if (age) {
        document.getElementById('ceremony.age').innerHTML = '(Recipient\'s canonical age: ' + age + ')';
    } else {
        document.getElementById('ceremony.age').innerHTML = '';
    }

    // Show/hide baptism info.
    if (recipient('baptised')) {
        document.getElementById('recipient.baptisminfo').style.display = 'block';
    } else {
        document.getElementById('recipient.baptisminfo').style.display = 'none';
    }

    // Show/hide adoption info.
    if (recipient('adopted')) {
        document.getElementById('recipient.birthinfo').style.display = 'block';
    } else {
        document.getElementById('recipient.birthinfo').style.display = 'none';
    }
}
