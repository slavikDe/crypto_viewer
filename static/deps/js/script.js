// delet account
const delete_acc_button = document.getElementById("deleteBtn");

delete_acc_button.addEventListener("click", (e) => {
    e.preventDefault();

    if (confirm("Are you sure you want to delete your account? This action is irreversible!")) {
        console.log("fetching in delete");

        fetch('/user/delete-account/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }

        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                window.location.href = '/';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while deleting the account.');
        });
    }
});
