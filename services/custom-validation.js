class CustomValidators {
  ValidateDecimal(event, el, regex) {
    var regex1 = new RegExp(regex);
    let specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del',
      'Delete',
    ];
    // Allow Backspace, tab, end, and home keys
    if (specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current = el.value;
    const position = el.selectionStart;
    const next = [
      current.slice(0, position),
      event.key == 'Decimal' ? '.' : event.key,
      current.slice(position),
    ].join('');
    if (next && !String(next).match(regex1)) {
      event.preventDefault();
    }
  }

  ValidateNumber(event, el, length) {
    let specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del',
      'Delete'
    ];
    var validnumber = new RegExp("^[0-9]{1," + length + "}$");
    // Allow Backspace, tab, end, and home keys
    if (specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    let current = el.value;
    const position = el.selectionStart;
    const next = [
      current.slice(0, position),
      event.key == 'Decimal' ? '.' : event.key,
      current.slice(position),
    ].join('');
    if (next && !String(next).match(validnumber)) {
      event.preventDefault();
    }

  }


}

module.exports = new CustomValidators();