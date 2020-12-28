$('#change-password-form').submit(function(e) {
  if ($('#newPass').val() != $('#newPassConfirm').val()) {
    $('#newPass').css('border-color', 'red');
    $('#newPassConfirm').css('border-color', 'red');
    $('#newPassErr').text('Không khớp với mật khẩu nhập lại!');
    $('#newPassConfirmErr').text('Không khớp với mật khẩu mới đã nhập!');
    e.preventDefault();
  }
  // biểu thức regex kiểm tra password
  regex = /^(?=.*\d).{8,12}$/;
  if (!regex.test($('#newPass').val())) {
    $('#newPass').css('border-color', 'red');
    $('#newPassErr').text('Mật khẩu phải từ 8 đến 12 kí tự và bao gồm ít nhất 1 chữ số!');
    e.preventDefault();
  }
});

$('#change-email-form').submit(function(e) {
  if ($('#newEmail').val() == $('#infoEmail').text()) {
    $('#newEmail').css('border-color', 'red');
    $('#newEmailErr').text('Email đã nhập trùng với email hiện tại của tài khoản!');
    e.preventDefault();
  }
});

$('#edit-profile-form').submit(function(e) {
  if ($('#edtPhone').val().length != 0 && ($('#edtPhone').val().length < 8 || $('#edtPhone').val().length> 10)) {
    $('#edtPhoneErr').text('Điện thoại dài từ 8-10 số!');
    e.preventDefault();
  }
});

$('#edtPhone').keyup(function(e) {
  $('#edtPhone').val($('#edtPhone').val().replace(/\D/g,''));
});

$('#btnEdit').click(function() {
  $('#edtName').val($('#infoName').text());
  $('#edtEmail').val($('#infoEmail').text());
  $('#edtBthday').val($('#infoBthday').text());
  $('#edtPhone').val($('#infoPhone').text());
  $('#rdGender').val($('#infoGender').text());
  $('#edtPhoneErr').text('');
});