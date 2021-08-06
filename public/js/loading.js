
let loading = {
    fullLoadingDom: document.querySelector('.full-loading'),
    loadingDom: document.querySelector('.loading'),
    isLoading: false,
    isLoading_S: false,
    toggleLoading: function (transparent = false) {

        loading.isLoading = !loading.isLoading;

        if (transparent) {
            loading.fullLoadingDom.classList.add('loading-transparent');
        }

        if (loading.isLoading) {
            loading.fullLoadingDom.classList.remove('hidden');
        }
        else {
            loading.fullLoadingDom.classList.add('hidden');
        }

    },


    toggleLoading_S: function () {

        loading.isLoading_S = !loading.isLoading_S;

        if (loading.isLoading_S) {
            loading.loadingDom.classList.remove('hidden');
        }
        else {
            loading.loadingDom.classList.add('hidden');
        }

    }
}

export { loading };