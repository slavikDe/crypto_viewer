$(document).ready(function(){
    let notification = $('#notification');

    if(notification.length > 0){
        setTimeout(function(){
            notification.alert('close');
        }, 5000);
    }
})