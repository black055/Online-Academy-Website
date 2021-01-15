$('#category-add-form').submit(function(e) {
    for (categoryObject of categoriesObject) {
        if ($('#edtName').val() == categoryObject.name) {
            $('#edtNameErr').text('Đã có lĩnh vực này tồn tại!');
            e.preventDefault();
        }
    }
});

$('#category-edit-form').submit(function(e) {
    for (categoryObject of categoriesObject) {
        if ($('#newName').val() == categoryObject.name && $('#newParent').val() == categoryObject.parent) {
            $('#editErr').text('Vui lòng thay đổi thông tin của lĩnh vực!');
            e.preventDefault();
        }
    }
});

$("#categories_row").on('click', '.btnEditCategory', function() {
    $('#oldName').val($(this).data('name'));
    $('#newName').val($(this).data('name'));
    parent = $(this).data('parent');

    $('#newParent').empty();
    $('#newParent').append(`<option selected value='null'>Không thuộc về lĩnh vực nào</option>`);
    for (categoryObject of categoriesObject) {
        if ((categoryObject.parent == 'null' || categoryObject.parent == null) && categoryObject.name != $(this).data('name')) {
            $('#newParent').append(`<option selected value='${categoryObject.name}'>${categoryObject.name}</option>`);
        }
    }

    // nếu là lĩnh vực cha
    if (parent == 'null' || parent == null) {
        $('#newParent').val('null');

        // kiểm tra xem có lĩnh vực con hay không, nếu không có thì được đổi lĩnh vực cha
        haveChild = false;
        for (categoryObject of categoriesObject) {
            if (categoryObject.parent == $(this).data('name')) {
                haveChild = true;
            }
        }
        if (!haveChild) {
            $('#newParent').prop('disabled', false);
        } else {
            $('#newParent').prop('disabled', 'disabled');
        }
    } else {
        $('#newParent').val(parent);
        $('#newParent').prop('disabled', false);
    }
});

$("#categories_row").on('click', '.btnRemoveCategory', function() {
    $('#categoryRemoveName').val($(this).data('name'));
});

$("#courses_row").on('click', '.btnRemoveCourse', function() {
    $('#courseRemoveId').val($(this).data('id'));
});

$("#users_row").on('click', '.btnDisableUser', function() {
    userID = $(this).data('id');
    $.get(`/admin/userManagement/setAvailableUser/${userID}`, function (data, status) {
        if (data == false) {
            alert('Có lỗi xảy ra khi khóa tài khoản này!')
        }
    });
    $(this).html(`<i class="fa fa-lock" aria-hidden="true"></i>`);
    $(this).addClass('btn-danger');
    $(this).removeClass('btn-success');
    $(this).addClass('btnEnableUser');
    $(this).removeClass('btnDisableUser');
});

$("#users_row").on('click', '.btnEnableUser', function() {
    userID = $(this).data('id');
    $.get(`/admin/userManagement/setAvailableUser/${userID}`, function (data, status) {
        if (data == false) {
            alert('Có lỗi xảy ra khi khóa tài khoản này!')
        }
    });
    $(this).html(`<i class="fas fa-lock-open" aria-hidden="true"></i>`);
    $(this).addClass('btn-success');
    $(this).removeClass('btn-danger');
    $(this).addClass('btnDisableUser');
    $(this).removeClass('btnEnableUser');
});

$("#users_row").on('click', '.btnDisableTeacher', function() {
    userID = $(this).data('id');
    $.get(`/admin/userManagement/setAvailableTeacher/${userID}`, function (data, status) {
        if (data == false) {
            alert('Có lỗi xảy ra khi khóa tài khoản này!')
        }
    });
    $(this).html(`<i class="fa fa-lock" aria-hidden="true"></i>`);
    $(this).addClass('btn-danger');
    $(this).removeClass('btn-success');
    $(this).addClass('btnEnableTeacher');
    $(this).removeClass('btnDisableTeacher');
});

$("#users_row").on('click', '.btnEnableTeacher', function() {
    userID = $(this).data('id');
    $.get(`/admin/userManagement/setAvailableTeacher/${userID}`, function (data, status) {
        if (data == false) {
            alert('Có lỗi xảy ra khi khóa tài khoản này!')
        }
    });
    $(this).html(`<i class="fas fa-lock-open" aria-hidden="true"></i>`);
    $(this).addClass('btn-success');
    $(this).removeClass('btn-danger');
    $(this).addClass('btnDisableTeacher');
    $(this).removeClass('btnEnableTeacher');
});

$('#teacher-add-form').submit(function(e) {
    email = $('#teacherEmail').val();
    $.get(`/register/checkMail/${email}`, function (data, status) {
        if (data == true) {
            //Đã tồn tại user
            $('#teacherEmailErr').text('Email này đã tồn tại');
            e.preventDefault();
        }
    });
});