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

$("#users_row").on('click', '.btnRemoveUser', function() {
    $('#userRemoveId').val($(this).data('id'));
});

$("#users_row").on('click', '.btnRemoveTeacher', function() {
    id = $(this).data('id');
    $('#teacherRemoveId').val(id);
    $.get(`/admin/getTeacherCourses/${id}`, function (data, status) {
        $('#teacher-alert').html(`<i class="fas fa-exclamation-triangle"></i>
        Giáo viên này hiện đang có ${data} khóa học. <br>
        Bạn có chắc chắn muốn xóa người này?`);
    });
});

$("#users_row").on('click', '.btnEditUser', function() {
    $('#newName').val($(this).data('name'));
    $('#newEmail').val($(this).data('email'));
    $('#newBthday').val($(this).data('bthday'));
    $('#newGender').val($(this).data('gender'));
    $('#newPhone').val($(this).data('phone'));
    $('#edtId').val($(this).data('id'));
    $('#userType').val($(this).data('type'));
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