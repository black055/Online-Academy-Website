

  $('#change-password-form').submit(function(e) {
    if ($('#newPass').val() != $('#newPassConfirm').val()) {
          Swal.fire({
              icon: 'error',
              title: 'Mật khẩu không khớp...',
              text: 'Mật khẩu mới không khớp với mật khẩu nhập lại!'
            });
            e.preventDefault();
    }
  });