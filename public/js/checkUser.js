function checkUser() {
    return fetch('/api/user')
        .then(response => response.json())
        .then(result => {
            return result;
        })
}


export { checkUser };