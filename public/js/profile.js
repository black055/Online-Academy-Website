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