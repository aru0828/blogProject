

let sweetAlert = {
    alert: function (status, message) {
        return Swal.fire({
            // title: 'Error!',
            text: message,
            icon: status,
            allowOutsideClick: false,
            confirmButtonColor: '#1057AD',
            confirmButtonText: '確認'
        })
    },

    timerAlert: function (status, message, timer) {
        Swal.fire({
            text: message,
            icon: status,
            confirmButtonText: '確認',
            confirmButtonColor: '#1057AD',
            timer: 2000
        })
    },

    confirmAlert: function (status, message) {
        return Swal.fire({
            text: message,
            icon: status,
            showCancelButton: true,
            confirmButtonText: '確認',
            cancelButtonText: '取消',
            confirmButtonColor: '#dd6b55'
        })
    },
}

export { sweetAlert };