
let loading = {
    loadingDom : document.querySelector('.loading'),
    isLoading:false,
    toggleLoading:function(transparent = false){

        loading.isLoading = !loading.isLoading;
        
        if(transparent){
            loading.loadingDom.classList.add('loading-transparent');
        }
        console.log(loading.isLoading);
        if(loading.isLoading){
            loading.loadingDom.classList.remove('hidden');
        }
        else{
            loading.loadingDom.classList.add('hidden');
        }
        
    }
}

export {loading};