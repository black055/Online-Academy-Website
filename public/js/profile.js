$('#change-password-form').submit(function(e) {
  if ($('#newPass').val() != $('#newPassConfirm').val()) {
    $('#newPass').css('border-color', 'red');
    $('#newPassConfirm').css('border-color', 'red');
    $('#newPassErr').text('Không khớp với mật khẩu nhập lại!');
    $('#newPassConfirmErr').text('Không khớp với mật khẩu mới đã nhập!');
    e.preventDefault();
  } else {
    $('#newPass').css('border-color', 'rgb(206, 212, 218)');
    $('#newPassErr').text('');
    $('#newPassConfirm').css('border-color', 'rgb(206, 212, 218)');
    $('#newPassConfirmErr').text('');
  }
  // biểu thức regex kiểm tra password
  regex = /^(?=.*\d).{8,12}$/;
  if (!regex.test($('#newPass').val())) {
    $('#newPass').css('border-color', 'red');
    $('#newPassErr').text('Mật khẩu phải từ 8 đến 12 kí tự và bao gồm ít nhất 1 chữ số!');
    e.preventDefault();
  } else {
    $('#newPass').css('border-color', 'rgb(206, 212, 218)');
    $('#newPassErr').text('');
  }
  data = { 
    email: `${$('#infoEmail').text()}`,
    oldPass: `${$('#oldPass').val()}`, 
  };
  $.post({
    url: `/register/checkPassword`,
    async: false,
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      if (data == false) {
          $('#oldPass').css('border-color', 'red');
          $('#oldPassErr').text('Mật khẩu không đúng!');
          e.preventDefault();
      } else {
        $('#oldPass').css('border-color', 'rgb(206, 212, 218)');
        $('#oldPassErr').text('');
      }
    }
  });
});

$('#change-email-form').submit(function(e) {
  email = $('#newEmail').val();
  if (email == $('#infoEmail').text()) {
    $('#newEmail').css('border-color', 'red');
    $('#newEmailErr').text('Email đã nhập trùng với email hiện tại của tài khoản!');
    e.preventDefault();
  } else {
    $.get( {
      url: `/register/checkMail/${email}`,
      async: false,
      success: function (data, status) {
        if (data == true) {
          //Đã tồn tại user
          $('#newEmail').css('border-color', 'red');
          $('#newEmailErr').text('Email này đã tồn tại!');
          e.preventDefault();
        } else {
          $('#newEmail').css('border-color', 'rgb(206, 212, 218)');
          $('#newEmailErr').text('');
        }
      }
    });
  }
  data = { 
    email: `${$('#infoEmail').text()}`,
    oldPass: `${$('#passConfirm').val()}`, 
  };
  $.post({
    url: `/register/checkPassword`,
    async: false,
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      if (data == false) {
          $('#passConfirm').css('border-color', 'red');
          $('#passConfirmErr').text('Mật khẩu không đúng!');
          e.preventDefault();
      } else {
        $('#passConfirm').css('border-color', 'rgb(206, 212, 218)');
        $('#passConfirmErr').text('');
      }
    }
  });
});

$('#edit-profile-form').submit(function(e) {
  if ($('#edtPhone').val().length != 0 && ($('#edtPhone').val().length < 8 || $('#edtPhone').val().length> 10)) {
    $('#edtPhone').css('border-color', 'red');
    $('#edtPhoneErr').text('Điện thoại dài từ 8-10 số!');
    e.preventDefault();
  } else {
    $('#edtPhone').css('border-color', 'rgb(206, 212, 218)');
    $('#edtPhoneErr').text('');
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