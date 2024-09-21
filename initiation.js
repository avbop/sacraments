function addFormListeners() {
    var inputs = document.getElementsByTagName('input');
    for (var i of inputs) {
        i.addEventListener('input', (event) => {
            updateForm();
        });
    }
}

function calculate_age(bday, sacday) {
    // To calculate the canonical age, we don't actually want elapsed time.
    // Rather, we need to manually parse year, month, day.
    var bornYear = bday.getFullYear();
    var bornMonth = bday.getMonth();
    var bornDay = bday.getDate();
    var sacYear = sacday.getFullYear();
    var sacMonth = sacday.getMonth();
    var sacDay = sacday.getDate();
    var age = sacYear - bornYear - 1;
    if (sacMonth >= bornMonth && sacDay > bornDay) {
        age += 1;
    }
    if (age >= 0) {
        return age;
    } else {
        return NaN;
    }
}

function updateForm() {
    // This function runs every time the form is modified.
    // Run through the entire form and show/hide/update as needed.
 
    // Parse info.
    var recipient = {};
    var sacraments = {};
    recipient.adopted = document.getElementById('recipient.adopted.true').checked;
    recipient.birthname = document.getElementById('recipient.birthname').value;
    recipient.name = document.getElementById('recipient.name').value;
    recipient.birthday = new Date(document.getElementById('recipient.birth').value);
    sacraments.date = new Date(document.getElementById('sacraments.date').value);
    recipient.age = calculate_age(recipient.birthday, sacraments.date);
    
    // Show/hide adoption info.
    if (recipient.adopted) {
        document.getElementById('recipient.birthinfo').style.display = 'block';
    } else {
        document.getElementById('recipient.birthinfo').style.display = 'none';
    }
}
